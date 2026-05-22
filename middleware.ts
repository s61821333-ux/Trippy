import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ORIGINS = (
  process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
).split(',').map(s => s.trim()).filter(Boolean)

export async function middleware(request: NextRequest) {
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
      // Require JSON content-type on mutation routes (except multipart forms)
      const ct = request.headers.get('content-type') ?? ''
      if (!ct.includes('application/json') && !ct.includes('multipart/form-data')) {
        return NextResponse.json({ error: 'Invalid content type' }, { status: 415 })
      }
    }
  }

  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options })
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options })
        )
      },
    },
  })

  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}