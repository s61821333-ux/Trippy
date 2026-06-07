import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { AddWishlistBody } from '@/lib/schemas'

// Sentinel day_index for wishlist items — sits outside the 0–364 range of real trip days
const WISHLIST_DAY_INDEX = 999

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

// POST /api/trips/[tripId]/wishlist — add a wishlist item
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

  const parsed = AddWishlistBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const d = parsed.data
  const row: Record<string, unknown> = {
    id:         d.id,
    trip_id:    tripId,
    day_index:  WISHLIST_DAY_INDEX,
    // wishlist items don't have a scheduled time — store placeholder
    time:       '00:00',
    duration:   d.duration ?? 60,
    name:       d.name,
    category:   d.category,
    location:   d.location ?? null,
    lat:        d.lat ?? null,
    lng:        d.lng ?? null,
    notes:      d.notes ?? null,
    cost:       d.cost ?? null,
    added_by:   user.id,
    wishlist:   true,
  }

  const client = admin ?? await getUserClient()
  const { error } = await client.from('events').insert(row)
  if (error) {
    // If wishlist column doesn't exist yet, fall back gracefully
    if (error.message?.includes('wishlist')) {
      return NextResponse.json({ error: 'Run the wishlist migration first: ALTER TABLE events ADD COLUMN IF NOT EXISTS wishlist boolean DEFAULT false;' }, { status: 422 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

// DELETE /api/trips/[tripId]/wishlist?itemId=xxx — remove a wishlist item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const itemId = request.nextUrl.searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })

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
  const { error } = await client.from('events').delete().eq('id', itemId).eq('wishlist', true)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
