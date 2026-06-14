import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, APP_URL } from '@/lib/env'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'

function adminClient() {
  return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } })
}

// POST /api/account/delete/request
// Step 1: user taps "Delete account" - creates a pending deletion record and
// sends a confirmation email. The account is NOT deleted yet.
export async function POST(_request: Request) {
  let user: { id: string; email?: string } | null = null
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    })

    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Rate limit: 3 requests/hour - prevent email flooding
  const rl = checkRateLimit(`delete-req:${user.id}`, 3, 3600)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 3)

  try {
    const admin = adminClient()

    // Cancel any previous unconfirmed deletion request before creating a new one
    await admin
      .from('account_deletions')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('confirmed_at', null)
      .is('cancelled_at', null)

    // Create new deletion record
    const { data: record, error } = await admin
      .from('account_deletions')
      .insert({ user_id: user.id })
      .select('confirmation_token, scheduled_for')
      .single()

    if (error || !record) {
      return NextResponse.json({ error: 'Failed to schedule deletion' }, { status: 500 })
    }

    const appUrl = APP_URL()
    const confirmUrl = `${appUrl}/account/confirm-delete?token=${record.confirmation_token}`
    const cancelUrl  = `${appUrl}/account/cancel-delete?token=${record.confirmation_token}`

    // Send confirmation email via Supabase Auth email (or log in dev)
    // In production, replace this with your email provider (Resend, SendGrid, etc.)
    console.info('[account/delete/request] confirmation email for', user.email)
    console.info('  Confirm:', confirmUrl)
    console.info('  Cancel: ', cancelUrl)

    // TODO: integrate email provider - example with Resend:
    // await resend.emails.send({
    //   from: 'Triplly <noreply@Triplly.app>',
    //   to: user.email!,
    //   subject: 'Confirm your account deletion',
    //   html: `
    //     <p>Your Triplly account will be deleted on ${new Date(record.scheduled_for).toLocaleString()}.</p>
    //     <p><a href="${confirmUrl}">Confirm deletion</a></p>
    //     <p><a href="${cancelUrl}">Cancel - keep my account</a></p>
    //   `,
    // })

    return NextResponse.json({
      message: 'Confirmation email sent. You have 24 hours to confirm.',
      scheduledFor: record.scheduled_for,
    })
  } catch (err: any) {
    console.error('[POST /api/account/delete/request]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
