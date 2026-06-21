import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { ensureApprovalRecord } from '@/lib/approvals'
import { sendNewUserNotification } from '@/lib/notifications'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/app?error=auth`)
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const email = user.email ?? ''
      const displayName = user.user_metadata?.full_name ?? email.split('@')[0] ?? 'Traveler'

      // Create approval record (idempotent — ignoreDuplicates) and get current status.
      const status = await ensureApprovalRecord(user.id, email, displayName)

      if (status === 'pending') {
        // New user: fire email notification to admin (non-blocking) then hold at /pending.
        sendNewUserNotification(email, displayName).catch(() => {})
        return NextResponse.redirect(`${origin}/pending`)
      }

      if (status === 'rejected' || status === 'blocked') {
        return NextResponse.redirect(`${origin}/pending?status=${status}`)
      }

      // approved or admin → fall through to normal app redirect below
    }
  }

  const redirectTo =
    next && next.startsWith('/') && !next.startsWith('//')
      ? `${origin}${next}`
      : `${origin}/app`
  return NextResponse.redirect(redirectTo)
}
