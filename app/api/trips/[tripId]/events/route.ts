import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

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

async function verifyParticipant(supabase: ReturnType<typeof createServerClient>, tripId: string, userId: string) {
  // Use the user's own session — tp_select allows reading own rows without recursion
  const { data } = await supabase
    .from('trip_participants')
    .select('user_id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

// POST /api/trips/[tripId]/events
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const supabase = await getUserClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const isParticipant = await verifyParticipant(supabase, tripId, user.id)
  if (!isParticipant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })

  const body = await request.json()
  const admin = tryAdminClient()

  if (admin) {
    const { error } = await admin.from('events').insert({
      id: body.id,
      trip_id: tripId,
      day_index: body.day_index,
      time: body.time,
      duration: body.duration,
      name: body.name,
      category: body.category,
      location: body.location ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      notes: body.notes ?? null,
      added_by: user.id,
      cost: body.cost ?? null,
      tags: body.tags ?? null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    // No service role key — fall back to user session (requires RLS to be working)
    const { error } = await supabase.from('events').insert({
      id: body.id,
      trip_id: tripId,
      day_index: body.day_index,
      time: body.time,
      duration: body.duration,
      name: body.name,
      category: body.category,
      location: body.location ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      notes: body.notes ?? null,
      added_by: user.id,
      cost: body.cost ?? null,
      tags: body.tags ?? null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

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

  const supabase = await getUserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const isParticipant = await verifyParticipant(supabase, tripId, user.id)
  if (!isParticipant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })

  const admin = tryAdminClient()
  const client = admin ?? supabase
  const { error } = await client.from('events').delete().eq('id', eventId)
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

  const supabase = await getUserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const isParticipant = await verifyParticipant(supabase, tripId, user.id)
  if (!isParticipant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })

  const body = await request.json()
  const allowed = ['time','duration','name','category','location','lat','lng','notes','cost','tags','votes','day_index']
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  const admin = tryAdminClient()
  const client = admin ?? supabase
  const { error } = await client.from('events').update(patch).eq('id', eventId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
