import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

function adminClient() {
  return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } })
}

// POST /api/account/delete/cancel?token=<confirmation_token>
// Cancels a pending deletion request. Safe to call multiple times.
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || !/^[0-9a-f]{32}$/.test(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  try {
    const admin = adminClient()

    const { data: record, error } = await admin
      .from('account_deletions')
      .select('id, confirmed_at, cancelled_at')
      .eq('confirmation_token', token)
      .maybeSingle()

    if (error || !record) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    if (record.confirmed_at) {
      return NextResponse.json({ error: 'Account has already been deleted' }, { status: 409 })
    }

    if (record.cancelled_at) {
      // Already cancelled — idempotent success
      return NextResponse.json({ message: 'Account deletion cancelled.' })
    }

    await admin
      .from('account_deletions')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('id', record.id)

    return NextResponse.json({ message: 'Account deletion cancelled.' })
  } catch (err: any) {
    console.error('[POST /api/account/delete/cancel]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
