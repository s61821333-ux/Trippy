import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_MAPS_API_KEY } from '@/lib/env'

// GET /api/route-time?olat=&olng=&dlat=&dlng=[&departureTime=<unix>]
// Returns travel time + distance for driving, walking, and transit modes.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = checkRateLimit(`route:${user.id}`, 60, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60)

  const { searchParams } = request.nextUrl
  const olat = searchParams.get('olat')
  const olng = searchParams.get('olng')
  const dlat = searchParams.get('dlat')
  const dlng = searchParams.get('dlng')
  const departureTimeParam = searchParams.get('departureTime')

  if (!olat || !olng || !dlat || !dlng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const key = GOOGLE_MAPS_API_KEY()
  if (!key) return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 })

  const modes = ['driving', 'walking', 'transit'] as const

  async function fetchMode(mode: string) {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
    url.searchParams.set('origins', `${olat},${olng}`)
    url.searchParams.set('destinations', `${dlat},${dlng}`)
    url.searchParams.set('mode', mode)
    url.searchParams.set('key', key!)
    // Rush-hour awareness: pass departure_time for driving (§2.4)
    if (mode === 'driving' && departureTimeParam) {
      url.searchParams.set('departure_time', departureTimeParam)
      url.searchParams.set('traffic_model', 'best_guess')
    }
    const res = await fetch(url.toString(), { next: { revalidate: 300 } })
    const data = await res.json()
    const element = data?.rows?.[0]?.elements?.[0]
    if (!element || element.status !== 'OK') return null
    // Prefer duration_in_traffic when available (driving with departure_time)
    const durationSec = element.duration_in_traffic?.value ?? element.duration.value
    return {
      durationMins: Math.max(1, Math.round(durationSec / 60)),
      distanceKm: Math.round(element.distance.value / 100) / 10,
    }
  }

  try {
    const [driving, walking, transit] = await Promise.all(modes.map(fetchMode))
    if (!driving && !walking && !transit) {
      return NextResponse.json({ error: 'no_route' }, { status: 404 })
    }
    return NextResponse.json({ driving, walking, transit })
  } catch {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/route-time  — batch up to 25 pairs in a single server round-trip.
// Body: { pairs: [{ olat, olng, dlat, dlng, departureTime? }] }
// Returns: { results: [{ driving, walking, transit } | null][] } in input order.
// ──────────────────────────────────────────────────────────────────────────────

const BatchBody = z.object({
  pairs: z.array(
    z.object({
      olat: z.number(),
      olng: z.number(),
      dlat: z.number(),
      dlng: z.number(),
      departureTime: z.number().optional(),  // Unix seconds — for rush-hour estimates
    })
  ).min(1).max(25),
})

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = checkRateLimit(`route-batch:${user.id}`, 30, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60)

  const parsed = BatchBody.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const apiKey = GOOGLE_MAPS_API_KEY()
  if (!apiKey) return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 })

  async function fetchPairMode(
    olat: number, olng: number, dlat: number, dlng: number,
    mode: string, departureTime?: number,
  ) {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
    url.searchParams.set('origins', `${olat},${olng}`)
    url.searchParams.set('destinations', `${dlat},${dlng}`)
    url.searchParams.set('mode', mode)
    url.searchParams.set('key', apiKey!)
    // Rush-hour traffic model for driving with known departure time (§2.4)
    if (mode === 'driving' && departureTime) {
      url.searchParams.set('departure_time', String(departureTime))
      url.searchParams.set('traffic_model', 'best_guess')
    }
    const res = await fetch(url.toString(), { next: { revalidate: 300 } })
    const data = await res.json()
    const el = data?.rows?.[0]?.elements?.[0]
    if (!el || el.status !== 'OK') return null
    const durationSec = el.duration_in_traffic?.value ?? el.duration.value
    return {
      durationMins: Math.max(1, Math.round(durationSec / 60)),
      distanceKm: Math.round(el.distance.value / 100) / 10,
    }
  }

  try {
    const results = await Promise.all(
      parsed.data.pairs.map(async ({ olat, olng, dlat, dlng, departureTime }) => {
        const [driving, walking, transit] = await Promise.all([
          fetchPairMode(olat, olng, dlat, dlng, 'driving', departureTime),
          fetchPairMode(olat, olng, dlat, dlng, 'walking'),
          fetchPairMode(olat, olng, dlat, dlng, 'transit'),
        ])
        if (!driving && !walking && !transit) return null
        return { driving, walking, transit }
      })
    )
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 })
  }
}
