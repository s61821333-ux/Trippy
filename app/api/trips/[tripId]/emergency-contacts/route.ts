import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { AddEmergencyContactBody } from '@/lib/schemas'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

async function setup(tripId: string) {
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
  if (!user) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }

  const admin = tryAdminClient()
  if (admin) {
    const { data: participant } = await admin.from('trip_participants').select('user_id')
      .eq('trip_id', tripId).eq('user_id', user.id).maybeSingle()
    if (!participant) return { error: NextResponse.json({ error: 'Not a participant' }, { status: 403 }) }
  }

  return { client: admin ?? supabase }
}

// POST /api/trips/[tripId]/emergency-contacts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const r = await setup(tripId)
  if ('error' in r) return r.error

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = AddEmergencyContactBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { id, name, phone, type } = parsed.data
  const { error } = await r.client.from('emergency_contacts').insert({
    id,
    trip_id: tripId,
    name,
    phone,
    type: type ?? 'personal',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/trips/[tripId]/emergency-contacts?id=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const contactId = request.nextUrl.searchParams.get('id')
  if (!contactId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const r = await setup(tripId)
  if ('error' in r) return r.error

  const { error } = await r.client.from('emergency_contacts').delete().eq('id', contactId).eq('trip_id', tripId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
