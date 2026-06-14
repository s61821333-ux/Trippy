import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { AcceptInvitationBody } from '@/lib/schemas'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

// POST /api/invitations/accept - authenticated: accept an email invitation
// Body: { invitationId: string }
// Returns: { tripId: string }
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

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = AcceptInvitationBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { invitationId, initials } = parsed.data

  try {
    const admin = tryAdminClient()
    const db = admin ?? supabase

    // Look up the invitation - verify it was sent to this user's email
    const { data: inv, error: invErr } = await db
      .from('trip_invitations')
      .select('trip_id, invited_email, status, expires_at')
      .eq('id', invitationId)
      .maybeSingle()

    if (invErr || !inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Verify the invitation belongs to the authenticated user
    if (user.email?.toLowerCase() !== inv.invited_email?.toLowerCase()) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (inv.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation already used' }, { status: 409 })
    }

    // Check expiry (expires_at column added by migration 001)
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 })
    }

    // Mark as accepted
    const { error: updateErr } = await db
      .from('trip_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId)
    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    // Add user as participant - insert, ignore 23505 if already a member
    const userInitials = initials ?? user.user_metadata?.full_name?.slice(0, 2).toUpperCase() ?? 'U'
    const hue = (user.id.charCodeAt(0) * 47 + user.id.charCodeAt(1) * 13) % 360
    const { error: participantErr } = await db.from('trip_participants').insert({
      trip_id: inv.trip_id,
      user_id: user.id,
      initials: userInitials,
      color: `oklch(62% 0.15 ${hue})`,
    })
    if (participantErr && (participantErr as any).code !== '23505') {
      return NextResponse.json({ error: 'Failed to join trip' }, { status: 500 })
    }

    return NextResponse.json({ tripId: inv.trip_id })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
