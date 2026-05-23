import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

const TRIP_SELECT = `
  id, name, days, start_date, theme, trip_notes, countries, hotels,
  day_meta ( day_index, region, emoji, lat, lng, description ),
  events ( id, day_index, time, duration, name, category, location, lat, lng, notes, cost, tags, votes ),
  expenses ( id, description, amount, split_count ),
  emergency_contacts ( id, name, phone, type ),
  supplies ( id, name, category, checked, critical, assignee ),
  trip_participants ( user_id, initials, color )
`

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

// PATCH /api/trips/[tripId] — update trip metadata (name, days, startDate, theme, trip_notes)
export async function PATCH(
  request: NextRequest,
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

  const admin = tryAdminClient()
  if (admin) {
    const { data: participant } = await admin.from('trip_participants').select('user_id')
      .eq('trip_id', tripId).eq('user_id', user.id).maybeSingle()
    if (!participant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  const body = await request.json()
  const patch: Record<string, unknown> = {}
  if (body.name      !== undefined) patch.name       = body.name
  if (body.days      !== undefined) patch.days       = body.days
  if (body.startDate !== undefined) patch.start_date = body.startDate
  if (body.theme     !== undefined) patch.theme      = body.theme
  if (body.tripNotes !== undefined) patch.trip_notes = body.tripNotes

  const client = admin ?? supabase
  const { error } = await client.from('trips').update(patch).eq('id', tripId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
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

  try {
    const admin = tryAdminClient()

    if (admin) {
      // Admin path — verify participation then load, bypassing RLS
      const { data: participant } = await admin
        .from('trip_participants')
        .select('user_id')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
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
        console.error('[GET trip] admin query failed:', error)
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
      }

      console.log('[GET trip] admin ok, events count:', (data as any).events?.length ?? 0)
      return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
    }

    // Fallback — query with user's JWT (subject to RLS)
    const { data, error } = await supabase
      .from('trips')
      .select(TRIP_SELECT)
      .eq('id', tripId)
      .maybeSingle()

    if (error || !data) {
      console.error('[GET trip] fallback query failed:', error)
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    console.log('[GET trip] fallback ok, events count:', (data as any).events?.length ?? 0)
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
