import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { AddEventBody, PatchEventBody } from '@/lib/schemas'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

async function getUserClient() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
      },
    },
  })
}

async function getAuthUser() {
  const supabase = await getUserClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST /api/trips/[tripId]/events
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = tryAdminClient()

  if (admin) {
    const { data: participant } = await admin
      .from('trip_participants')
      .select('user_id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!participant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = AddEventBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const d = parsed.data
  const row: Record<string, unknown> = {
    id: d.id,
    trip_id: tripId,
    day_index: d.day_index,
    time: d.time,
    duration: d.duration,
    name: d.name,
    category: d.category,
    location: d.location ?? null,
    lat: d.lat ?? null,
    lng: d.lng ?? null,
    notes: d.notes ?? null,
    added_by: user.id,
    cost: d.cost ?? null,
  }
  // Only include tags if non-null — avoids errors when the tags migration hasn't been applied yet
  if (d.tags != null) row.tags = d.tags

  const client = admin ?? await getUserClient()
  let { error } = await client.from('events').insert(row)
  // If insert fails due to a missing optional column, retry with only core columns
  if (error && (error.message?.includes('column') || error.message?.includes('tags'))) {
    const { id, trip_id, day_index, time, duration, name, category, location, lat, lng, notes, added_by, cost } = row as any
    const coreRow = { id, trip_id, day_index, time, duration, name, category, location, lat, lng, notes, added_by, cost };
    ({ error } = await client.from('events').insert(coreRow))
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/trips/[tripId]/events?eventId=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const eventId = request.nextUrl.searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })

  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = tryAdminClient()
  if (admin) {
    const { data: participant } = await admin
      .from('trip_participants').select('user_id')
      .eq('trip_id', tripId).eq('user_id', user.id).maybeSingle()
    if (!participant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  const client = admin ?? await getUserClient()
  const { error } = await client.from('events').delete().eq('id', eventId).eq('trip_id', tripId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// PATCH /api/trips/[tripId]/events?eventId=xxx
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const eventId = request.nextUrl.searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })

  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = tryAdminClient()
  if (admin) {
    const { data: participant } = await admin
      .from('trip_participants').select('user_id')
      .eq('trip_id', tripId).eq('user_id', user.id).maybeSingle()
    if (!participant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = PatchEventBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const client = admin ?? await getUserClient()
  const patch = { ...parsed.data }
  let { error } = await client.from('events').update(patch).eq('id', eventId).eq('trip_id', tripId)
  // Retry without optional columns if they don't exist yet in the schema
  if (error && (error.message?.includes('column') || error.message?.includes('tags') || error.message?.includes('votes'))) {
    const safePatch: Record<string, unknown> = {}
    const allowed = ['time', 'duration', 'name', 'category', 'location', 'lat', 'lng', 'notes', 'cost', 'day_index']
    for (const k of allowed) if ((patch as any)[k] !== undefined) safePatch[k] = (patch as any)[k];
    ({ error } = await client.from('events').update(safePatch).eq('id', eventId).eq('trip_id', tripId))
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
