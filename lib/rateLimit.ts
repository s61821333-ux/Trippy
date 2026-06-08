/**
 * Rate limiter with two layers:
 *   1. In-memory fast path — always used, resets on cold start (serverless limitation).
 *   2. Supabase persistent path — used when a service-role client is passed in.
 *      Survives across serverless instances and cold starts.
 *
 * In-memory Map is periodically evicted to prevent unbounded growth.
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()
let lastEviction = Date.now()

function evictExpired() {
  const now = Date.now()
  // Only scan every 60 s to avoid O(n) on every request
  if (now - lastEviction < 60_000) return
  lastEviction = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

function checkMemory(key: string, limit: number, windowSecs: number): RateLimitResult {
  evictExpired()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSecs * 1_000 })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1_000),
    }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, retryAfter: 0 }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter: number
}

/** Simple in-memory rate limit — suitable for dev or low-traffic single-instance deploys. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSecs: number,
): RateLimitResult {
  return checkMemory(key, limit, windowSecs)
}

/**
 * Persistent rate limit backed by the `rate_limits` Supabase table.
 * Falls back to in-memory if the DB call fails so the app never hard-errors.
 *
 * @param admin  Supabase admin client (service-role, server-only)
 * @param key    Unique key for this limit bucket (e.g. `ai-suggest:${userId}`)
 * @param limit  Max requests allowed in the window
 * @param windowSecs  Rolling window length in seconds
 */
export async function checkRateLimitPersistent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  key: string,
  limit: number,
  windowSecs: number,
): Promise<RateLimitResult> {
  // Always check memory first as a quick pre-flight (avoids a DB round-trip when clearly blocked)
  const memResult = checkMemory(key, limit, windowSecs)
  if (!memResult.allowed) return memResult

  try {
    const now = new Date()
    const resetAt = new Date(Date.now() + windowSecs * 1_000).toISOString()

    // Upsert: increment count if window still active, otherwise start a fresh window
    const { data, error } = await admin.rpc('upsert_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_secs: windowSecs,
      p_now: now.toISOString(),
      p_reset_at: resetAt,
    })

    if (error || data == null) {
      // DB unavailable — fall back to the already-checked memory result
      return memResult
    }

    const { count, reset_at: dbResetAt, allowed } = data as {
      count: number
      reset_at: string
      allowed: boolean
    }

    const retryAfter = allowed ? 0 : Math.max(0, Math.ceil((new Date(dbResetAt).getTime() - Date.now()) / 1_000))
    return { allowed, remaining: Math.max(0, limit - count), retryAfter }
  } catch {
    return memResult
  }
}

export function rateLimitResponse(retryAfter: number, limit: number): Response {
  return Response.json(
    { error: 'Too many requests', retryAfter },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
      },
    },
  )
}
