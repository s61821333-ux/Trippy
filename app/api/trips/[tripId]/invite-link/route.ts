import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'

function adminClient() {
  return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } })
}

// POST /api/trips/[tripId]/invite-link
// Creates a new single-use, 7-day invite link for the trip.
// Returns: { token: string, expiresAt: string }
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
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

  // Rate limit: 20 invite links/60s per user
  const rl = checkRateLimit(`invitelink:${user.id}`, 20, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 20)

  try {
    const admin = adminClient()

    // Verify the caller is a participant of this trip
    const { data: participant } = await admin
      .from('trip_participants')
      .select('user_id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!participant) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

    const { data, error } = await admin
      .from('trip_invite_links')
      .insert({ trip_id: tripId, created_by: user.id })
      .select('token, expires_at')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to create invite link' }, { status: 500 })
    }

    return NextResponse.json({ token: data.token, expiresAt: data.expires_at })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
