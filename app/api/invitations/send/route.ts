import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { SendInvitationBody } from '@/lib/schemas'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

// POST /api/invitations/send — send an email invitation to a trip
// Body: { tripId: string, invitedEmail: string }
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    SUPABASE_URL(),
    SUPABASE_ANON_KEY(),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Rate limit: 5 invitations/60s per user
  const rl = checkRateLimit(`invite:${user.id}`, 5, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 5)

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = SendInvitationBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { tripId, invitedEmail } = parsed.data

  // Verify caller is a participant of the trip before sending invite
  const admin = tryAdminClient()
  if (admin) {
    const { data: participant } = await admin
      .from('trip_participants')
      .select('user_id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!participant) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
  }

  try {
    const db = admin ?? supabase

    // Upsert so that re-inviting someone who previously accepted/rejected works —
    // without this, the UNIQUE(trip_id, invited_email) constraint would block the insert
    // even though the old invitation is no longer pending.
    const { error } = await db.from('trip_invitations').upsert(
      {
        trip_id: tripId,
        invited_email: invitedEmail.toLowerCase().trim(),
        invited_by: user.id,
        status: 'pending',
      },
      { onConflict: 'trip_id,invited_email' }
    )

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
