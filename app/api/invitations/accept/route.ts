import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function tryAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// POST /api/invitations/accept — authenticated: accept an email invitation
// Body: { invitationId: string }
// Returns: { tripId: string }
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )

  const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
  if (!session?.user) {
    console.error('[accept] No session:', sessionErr)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { invitationId, initials } = body
  if (!invitationId) {
    return NextResponse.json({ error: 'Missing invitationId' }, { status: 400 })
  }

  try {
    const admin = tryAdminClient()
    // Use admin client when available (bypasses RLS), otherwise use user session
    const db = admin ?? supabase

    // Look up the invitation
    const { data: inv, error: invErr } = await db
      .from('trip_invitations')
      .select('trip_id')
      .eq('id', invitationId)
      .maybeSingle()

    if (invErr || !inv) {
      console.error('[accept] Invitation lookup failed:', invErr)
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Mark as accepted
    const { error: updateErr } = await db
      .from('trip_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId)
    if (updateErr) {
      console.error('[accept] Update failed:', updateErr)
      return NextResponse.json({ error: 'Failed to update invitation', detail: updateErr.message }, { status: 500 })
    }

    // Add user as participant — insert, ignore 23505 if already a member
    const userInitials = initials ?? session.user.user_metadata?.full_name?.slice(0, 2).toUpperCase() ?? 'U'
    const { error: participantErr } = await db.from('trip_participants').insert({
      trip_id: inv.trip_id,
      user_id: session.user.id,
      initials: userInitials,
      color: 'oklch(62% 0.15 195)',
    })
    if (participantErr && (participantErr as any).code !== '23505') {
      console.error('[accept] Participant insert failed:', participantErr)
      return NextResponse.json({ error: 'Failed to join trip', detail: participantErr.message, code: (participantErr as any).code }, { status: 500 })
    }

    return NextResponse.json({ tripId: inv.trip_id })
  } catch (err: any) {
    console.error('[accept] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error', detail: err?.message }, { status: 500 })
  }
}
