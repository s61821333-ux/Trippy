import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax', // must be lax (not strict) so the PKCE verifier cookie survives OAuth redirects
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
      auth: {
        experimental: { passkey: true },
      },
    }
  )
}
