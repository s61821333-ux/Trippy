import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ORIGINS = (
  process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
).split(',').map(s => s.trim()).filter(Boolean)

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production'
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://places.googleapis.com https://weather.googleapis.com https://api.open-meteo.com https://open.er-api.com https://maps.geoapify.com",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "worker-src 'self'",
  ].join('; ')
}

async function checkApprovalStatus(userId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_approvals?select=status&user_id=eq.${userId}`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          Accept: 'application/vnd.pgrst.object+json',
        },
        signal: AbortSignal.timeout(3000),
      },
    )
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    return data?.status ?? null
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  // CSRF: block cross-origin mutations on all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const method = request.method
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      const sameOrigin = origin && host && (origin === `https://${host}` || origin === `http://${host}`)
      if (origin && !sameOrigin && !ALLOWED_ORIGINS.includes(origin)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (method !== 'DELETE') {
        const ct = request.headers.get('content-type') ?? ''
        if (!ct.includes('application/json') && !ct.includes('multipart/form-data')) {
          return NextResponse.json({ error: 'Invalid content type' }, { status: 415 })
        }
      }
    }
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } })

  // Skip session refresh (and approval check) for unauthenticated visitors and API routes.
  // API routes validate auth themselves; approval gate only applies to UI routes.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
  if (!hasAuthCookie || request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Content-Security-Policy', csp)
    return response
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options })
        )
        response = NextResponse.next({ request: { headers: requestHeaders } })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options })
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // ── Approval gate ─────────────────────────────────────────────
  const pathname = request.nextUrl.pathname
  const adminId = process.env.ADMIN_USER_ID
  const isAdminUser = user && adminId && user.id === adminId

  // /g-ctrl — admin panel, admin only
  if (pathname === '/g-ctrl' || pathname.startsWith('/g-ctrl/')) {
    if (!user || !isAdminUser) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // /app/* — requires an approved account
  if (user && !isAdminUser && pathname.startsWith('/app')) {
    const cached = request.cookies.get('x-trippy-approved')?.value

    if (cached !== 'approved') {
      const status = await checkApprovalStatus(user.id)

      if (status === 'approved') {
        // Cache for 1 hour to skip the DB call on subsequent requests
        response.cookies.set('x-trippy-approved', 'approved', {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 3600,
          secure: process.env.NODE_ENV === 'production',
        })
      } else if (status === 'rejected' || status === 'blocked') {
        const url = request.nextUrl.clone()
        url.pathname = '/pending'
        url.search = ''
        url.searchParams.set('status', status)
        return NextResponse.redirect(url)
      } else {
        // pending or null (DB unreachable on first login — callback handles the record creation)
        const url = request.nextUrl.clone()
        url.pathname = '/pending'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }
  }
  // ─────────────────────────────────────────────────────────────

  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|otf|txt|xml)).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
