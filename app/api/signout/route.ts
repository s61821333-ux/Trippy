import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/signout
// Server-side sign-out: invalidates the Supabase session via server client (which can
// set Max-Age=0 on HttpOnly cookies) then redirects to the landing page.
// Used by AppShell's doRedirect() as a reliable alternative to client-side cookie wiping,
// which fails for HttpOnly or domain-scoped cookies on some iOS configurations.
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Ignore errors — even if sign-out fails, redirect to landing page
  }
  return NextResponse.redirect(`${origin}/`, { status: 302 })
}
