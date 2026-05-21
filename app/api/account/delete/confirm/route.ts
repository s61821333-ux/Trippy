import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

function adminClient() {
  return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } })
}

// POST /api/account/delete/confirm?token=<confirmation_token>
// Step 2: user clicks the confirmation link in their email.
// Runs the actual deletion only after verifying the token is valid and unconfirmed.
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || !/^[0-9a-f]{32}$/.test(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  try {
    const admin = adminClient()

    const { data: record, error } = await admin
      .from('account_deletions')
      .select('id, user_id, scheduled_for, confirmed_at, cancelled_at')
      .eq('confirmation_token', token)
      .maybeSingle()

    if (error || !record) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    if (record.cancelled_at) {
      return NextResponse.json({ error: 'Deletion request was cancelled' }, { status: 409 })
    }

    if (record.confirmed_at) {
      return NextResponse.json({ error: 'Already confirmed' }, { status: 409 })
    }

    if (new Date(record.scheduled_for) < new Date()) {
      return NextResponse.json({ error: 'Confirmation window expired' }, { status: 410 })
    }

    // Mark as confirmed
    await admin
      .from('account_deletions')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', record.id)

    const userId = record.user_id

    // Run the actual deletion sequence
    await admin.from('trip_participants').delete().eq('user_id', userId)
    await admin.from('privacy_consents').delete().eq('user_id', userId)
    await admin.from('trip_invitations').delete().eq('invited_by', userId)

    const { data: userRow } = await admin.auth.admin.getUserById(userId)
    if (userRow?.user?.email) {
      await admin.from('trip_invitations').delete().eq('invited_email', userRow.user.email)
    }

    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId)
    if (deleteErr) throw deleteErr

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[POST /api/account/delete/confirm]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
