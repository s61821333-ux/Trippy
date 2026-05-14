import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const TRIP_SELECT = `
  id, name, days, start_date, theme, trip_notes, countries,
  day_meta ( day_index, region, emoji, lat, lng, description ),
  events ( id, day_index, time, duration, name, category, location, lat, lng, notes, cost, tags, votes ),
  expenses ( id, description, amount, split_count ),
  emergency_contacts ( id, name, phone, type ),
  supplies ( id, name, category, checked, critical ),
  trip_participants ( user_id, initials, color )
`

function tryAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// GET /api/trips/[tripId] — authenticated: load full trip data
// Uses admin client to bypass RLS when SUPABASE_SERVICE_ROLE_KEY is set,
// otherwise queries directly via the user's session (subject to RLS).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
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

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const admin = tryAdminClient()

    if (admin) {
      // Admin path — verify participation then load, bypassing RLS
      const { data: participant } = await admin
        .from('trip_participants')
        .select('user_id')
        .eq('trip_id', tripId)
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!participant) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
      }

      const { data, error } = await admin
        .from('trips')
        .select(TRIP_SELECT)
        .eq('id', tripId)
        .maybeSingle()

      if (error || !data) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
      }

      return NextResponse.json(data)
    }

    // Fallback — query with user's JWT (subject to RLS)
    const { data, error } = await supabase
      .from('trips')
      .select(TRIP_SELECT)
      .eq('id', tripId)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
