import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

function adminClient() {
  return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } })
}

// GET /api/invite/[token] — public: return trip info for a valid invite link.
// Returns 410 if the link is expired or fully used.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Basic token format check — hex string of 64 chars (32 bytes)
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  try {
    const admin = adminClient()

    const { data: link, error } = await admin
      .from('trip_invite_links')
      .select('id, trip_id, expires_at, max_uses, use_count')
      .eq('token', token)
      .maybeSingle()

    if (error || !link) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invite link has expired' }, { status: 410 })
    }

    if (link.use_count >= link.max_uses) {
      return NextResponse.json({ error: 'This invite link has already been used' }, { status: 410 })
    }

    const { data: trip, error: tripErr } = await admin
      .from('trips')
      .select('id, name, theme')
      .eq('id', link.trip_id)
      .maybeSingle()

    if (tripErr || !trip) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    return NextResponse.json({ tripId: trip.id, tripName: trip.name, tripTheme: trip.theme })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/invite/[token] — authenticated: join the trip via an invite link.
// Increments use_count after successful join.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const admin = adminClient()

    // Re-validate the link atomically
    const { data: link, error: linkErr } = await admin
      .from('trip_invite_links')
      .select('id, trip_id, expires_at, max_uses, use_count')
      .eq('token', token)
      .maybeSingle()

    if (linkErr || !link) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invite link has expired' }, { status: 410 })
    }

    if (link.use_count >= link.max_uses) {
      return NextResponse.json({ error: 'This invite link has already been used' }, { status: 410 })
    }

    // Check if already a participant
    const { data: existing } = await admin
      .from('trip_participants')
      .select('user_id')
      .eq('trip_id', link.trip_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      const rawName = user.user_metadata?.full_name ?? user.email ?? 'U'
      const initials = rawName.slice(0, 2).toUpperCase()
      const hue = (user.id.charCodeAt(0) * 47 + user.id.charCodeAt(1) * 13) % 360

      const { error: participantErr } = await admin.from('trip_participants').insert({
        trip_id: link.trip_id,
        user_id: user.id,
        initials,
        color: `oklch(62% 0.15 ${hue})`,
      })

      if (participantErr && (participantErr as any).code !== '23505') {
        return NextResponse.json({ error: 'Failed to join trip' }, { status: 500 })
      }

      // Increment use_count via service role (bypasses RLS update restriction)
      await admin
        .from('trip_invite_links')
        .update({ use_count: link.use_count + 1 })
        .eq('id', link.id)
    }

    return NextResponse.json({ tripId: link.trip_id })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
