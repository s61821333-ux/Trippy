import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ORIGINS = (
  process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
).split(',').map(s => s.trim()).filter(Boolean)

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // nonce covers Next.js inline bootstrap; strict-dynamic trusts anything
    // those scripts load dynamically (chunks, Vercel Analytics via createElement, etc.)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://places.googleapis.com https://weather.googleapis.com https://api.open-meteo.com https://open.er-api.com https://maps.geoapify.com",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "worker-src 'self'",
  ].join('; ')
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const csp = buildCsp(nonce)

  // Forward nonce to Next.js App Router so it applies it to inline hydration scripts.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

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
      // Require JSON content-type on routes that send a body (DELETE has no body)
      if (method !== 'DELETE') {
        const ct = request.headers.get('content-type') ?? ''
        if (!ct.includes('application/json') && !ct.includes('multipart/form-data')) {
          return NextResponse.json({ error: 'Invalid content type' }, { status: 415 })
        }
      }
    }
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } })

  // Session refresh is only needed when a Supabase auth cookie exists.
  // Anonymous visitors (every first load) skip the network round-trip entirely,
  // and API routes validate auth themselves via their own server client.
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
        // Preserve nonce in request headers when recreating response for cookie writes.
        response = NextResponse.next({ request: { headers: requestHeaders } })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options })
        )
      },
    },
  })

  await supabase.auth.getUser()
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
