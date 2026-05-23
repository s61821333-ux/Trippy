import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

// PATCH /api/trips/[tripId]/day-meta
// Body: { dayIndex: number, region?, emoji?, lat?, lng?, desc? }
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
  const { dayIndex, ...meta } = body
  if (dayIndex === undefined) return NextResponse.json({ error: 'Missing dayIndex' }, { status: 400 })

  const patch: Record<string, unknown> = {}
  if (meta.region !== undefined) patch.region      = meta.region
  if (meta.emoji  !== undefined) patch.emoji       = meta.emoji
  if (meta.lat    !== undefined) patch.lat         = meta.lat
  if (meta.lng    !== undefined) patch.lng         = meta.lng
  if (meta.desc   !== undefined) patch.description = meta.desc

  const client = admin ?? supabase
  const { error } = await client.from('day_meta').update(patch).eq('trip_id', tripId).eq('day_index', dayIndex)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
