import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Support post-login redirect (e.g. back to /join/[token] after OAuth)
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const redirectTo = next && next.startsWith('/') ? `${origin}${next}` : origin
  return NextResponse.redirect(redirectTo)
}
