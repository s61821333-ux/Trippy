import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PATH = '/g-ctrl'

// Routes that need session AND approval check
const PROTECTED_PREFIXES = [
  '/app',
  '/api/trips',
  '/api/ai',
  '/api/invitations',
  '/api/invite',
  '/api/places',
  '/api/exchange-rates',
  '/api/route-time',
  '/api/timezone',
  '/api/weather',
  '/api/account',
]

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'))
}

function isAdminRoute(pathname: string) {
  return pathname === ADMIN_PATH || pathname.startsWith(ADMIN_PATH + '/') || pathname.startsWith('/api/admin')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const needsCheck = isProtected(pathname) || isAdminRoute(pathname)
  if (!needsCheck) return NextResponse.next()

  // Build a response we can attach cookies to
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  const adminId = process.env.ADMIN_USER_ID
  const isAdmin = adminId && user.id === adminId

  // Admin routes — only the admin user can access
  if (isAdminRoute(pathname)) {
    if (!isAdmin) return new NextResponse('Forbidden', { status: 403 })
    return response
  }

  // Admin always bypasses approval queue
  if (isAdmin) return response

  // Fast-path: check the short-lived approval cookie before hitting the DB
  const cached = request.cookies.get('x-trippy-approved')?.value
  if (cached === 'approved') return response

  // Cache miss: query Supabase via PostgREST with service-role key (works on Edge runtime)
  let status: string | null = null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_approvals?select=status&user_id=eq.${user.id}`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          Accept: 'application/vnd.pgrst.object+json',
        },
        // 3-second timeout guard
        signal: AbortSignal.timeout(3000),
      },
    )
    if (res.ok) {
      const data = await res.json().catch(() => null)
      status = data?.status ?? null
    }
  } catch {
    // If DB is unreachable, allow through to avoid locking out approved users
    return response
  }

  if (status === 'approved') {
    // Cache for 1 hour to avoid a DB round-trip on every subsequent request
    response.cookies.set('x-trippy-approved', 'approved', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 3600,
      secure: process.env.NODE_ENV === 'production',
    })
    return response
  }

  const url = request.nextUrl.clone()
  url.search = ''

  if (status === 'rejected' || status === 'blocked') {
    url.pathname = '/pending'
    url.searchParams.set('status', status)
    return NextResponse.redirect(url)
  }

  // pending or null → hold at /pending
  url.pathname = '/pending'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/app/:path*',
    '/g-ctrl/:path*',
    '/g-ctrl',
    '/api/trips/:path*',
    '/api/ai/:path*',
    '/api/invitations/:path*',
    '/api/invite/:path*',
    '/api/places/:path*',
    '/api/exchange-rates',
    '/api/route-time',
    '/api/timezone',
    '/api/weather',
    '/api/account/:path*',
    '/api/admin/:path*',
  ],
}
