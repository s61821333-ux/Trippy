import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(url, key, { auth: { persistSession: false } })
}

// GET /api/invite/[token] — public: return trip info for a valid invite link
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  try {
    const admin = adminClient()
    const { data, error } = await admin
      .from('trips')
      .select('id, name, theme')
      .eq('invite_token', token)
      .single()
    if (error || !data) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }
    return NextResponse.json({ tripId: data.id, tripName: data.name, tripTheme: data.theme })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}

// POST /api/invite/[token] — authenticated: join the trip
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove: (name: string, options: CookieOptions) => {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const admin = adminClient()
    const { data: trip, error: tripErr } = await admin
      .from('trips')
      .select('id')
      .eq('invite_token', token)
      .single()
    if (tripErr || !trip) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // No-op if already a participant
    const { data: existing } = await admin
      .from('trip_participants')
      .select('user_id')
      .eq('trip_id', trip.id)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (!existing) {
      const rawName = session.user.user_metadata?.full_name ?? session.user.email ?? 'U'
      const initials = rawName.slice(0, 2).toUpperCase()
      // Deterministic color per user
      const hue = (session.user.id.charCodeAt(0) * 47 + session.user.id.charCodeAt(1) * 13) % 360
      await admin.from('trip_participants').insert({
        trip_id: trip.id,
        user_id: session.user.id,
        initials,
        color: `oklch(62% 0.15 ${hue})`,
      })
    }

    return NextResponse.json({ tripId: trip.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
