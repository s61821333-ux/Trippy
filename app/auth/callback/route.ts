import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Code exchange failed (expired, already used, etc.) - send to login, not home
      return NextResponse.redirect(`${origin}/app?error=auth`)
    }
  }

  // `next` must be a relative path to prevent open-redirect attacks
  const redirectTo = next && next.startsWith('/') && !next.startsWith('//') ? `${origin}${next}` : `${origin}/app`
  return NextResponse.redirect(redirectTo)
}
