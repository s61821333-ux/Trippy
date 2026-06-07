import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { UpdateTripBody } from '@/lib/schemas'

const TRIP_SELECT = `
  id, name, days, start_date, theme, trip_notes, countries, hotels, created_by,
  day_meta ( day_index, region, emoji, lat, lng, description ),
  events ( id, day_index, time, duration, name, category, location, lat, lng, notes, cost, tags, votes, added_by, wishlist ),
  expenses ( id, description, amount, paid_by, split_count ),
  emergency_contacts ( id, name, phone, type ),
  supplies ( id, name, category, checked, critical, assignee ),
  trip_participants ( user_id, initials, color )
`

// Fallback select used when optional migration columns (hotels, tags, votes) don't exist yet
const TRIP_SELECT_FALLBACK = `
  id, name, days, start_date, theme, trip_notes, countries, created_by,
  day_meta ( day_index, region, emoji, lat, lng, description ),
  events ( id, day_index, time, duration, name, category, location, lat, lng, notes, cost, added_by, wishlist ),
  expenses ( id, description, amount, paid_by, split_count ),
  emergency_contacts ( id, name, phone, type ),
  supplies ( id, name, category, checked, critical, assignee ),
  trip_participants ( user_id, initials, color )
`

function isMissingColumnError(msg?: string) {
  if (!msg) return false
  return msg.includes('column') || msg.includes('hotels') || msg.includes('tags') || msg.includes('votes') || msg.includes('wishlist') || msg.includes('relationship')
}

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

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = UpdateTripBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const d = parsed.data
  const patch: Record<string, unknown> = {}
  if (d.name       !== undefined) patch.name       = d.name
  if (d.days       !== undefined) patch.days       = d.days
  if (d.startDate  !== undefined) patch.start_date = d.startDate
  if (d.theme      !== undefined) patch.theme      = d.theme
  if (d.trip_notes !== undefined) patch.trip_notes = d.trip_notes
  if (d.countries  !== undefined) patch.countries  = d.countries

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

      let { data, error } = await admin
        .from('trips')
        .select(TRIP_SELECT)
        .eq('id', tripId)
        .maybeSingle()

      if (error && isMissingColumnError(error.message)) {
        const fb = await admin.from('trips').select(TRIP_SELECT_FALLBACK).eq('id', tripId).maybeSingle()
        data = fb.data as any; error = fb.error
      }

      if (error || !data) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
      }

      return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
    }

    // Fallback — query with user's JWT (subject to RLS)
    let { data, error } = await supabase
      .from('trips')
      .select(TRIP_SELECT)
      .eq('id', tripId)
      .maybeSingle()

    if (error && isMissingColumnError(error.message)) {
      const fb = await supabase.from('trips').select(TRIP_SELECT_FALLBACK).eq('id', tripId).maybeSingle()
      data = fb.data as any; error = fb.error
    }

    if (error || !data) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}

// DELETE /api/trips/[tripId] — leave a trip (removes current user from participants)
// DELETE /api/trips/[tripId]?full=true — permanently delete the entire trip (owner only)
export async function DELETE(
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
  const client = admin ?? supabase
  const full = request.nextUrl.searchParams.get('full') === 'true'

  if (full) {
    // Full delete — always use admin client so RLS never silently blocks the operation.
    // If admin is unavailable fall back to user client but the DELETE may fail under RLS.
    const deleteClient = admin ?? supabase;

    // Verify ownership before deleting
    const { data: trip, error: fetchErr } = await deleteClient
      .from('trips').select('created_by').eq('id', tripId).maybeSingle();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    if (!trip)    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    if (trip.created_by !== user.id)
      return NextResponse.json({ error: 'Only the trip owner can delete it' }, { status: 403 });

    const { error: delErr } = await deleteClient.from('trips').delete().eq('id', tripId);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { data: deleted, error } = await client
    .from('trip_participants')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!deleted || deleted.length === 0)
    return NextResponse.json({ error: 'Not a participant or permission denied' }, { status: 403 })
  return NextResponse.json({ ok: true })
}
