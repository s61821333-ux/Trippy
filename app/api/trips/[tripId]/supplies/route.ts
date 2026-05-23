import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

async function setup(request: NextRequest, tripId: string) {
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

  const client = admin ?? supabase
  return { client, user }
}

// POST /api/trips/[tripId]/supplies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const r = await setup(request, tripId)
  if ('error' in r) return r.error

  const body = await request.json()
  const { error } = await r.client.from('supplies').insert({
    id: body.id,
    trip_id: tripId,
    name: body.name,
    category: body.category,
    checked: body.checked ?? false,
    critical: body.critical ?? false,
    assignee: body.assignee ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// PATCH /api/trips/[tripId]/supplies?id=xxx
// Body: { checked? } or { critical? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const supplyId = request.nextUrl.searchParams.get('id')
  if (!supplyId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const r = await setup(request, tripId)
  if ('error' in r) return r.error

  const body = await request.json()
  const patch: Record<string, unknown> = {}
  if (body.checked  !== undefined) patch.checked  = body.checked
  if (body.critical !== undefined) patch.critical = body.critical

  const { error } = await r.client.from('supplies').update(patch).eq('id', supplyId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/trips/[tripId]/supplies?id=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const supplyId = request.nextUrl.searchParams.get('id')
  if (!supplyId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const r = await setup(request, tripId)
  if ('error' in r) return r.error

  const { error } = await r.client.from('supplies').delete().eq('id', supplyId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
