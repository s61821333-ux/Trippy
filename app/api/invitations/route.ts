import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

// GET /api/invitations — authenticated: return pending invitations with trip names
// Uses admin client to bypass RLS when available, so the invitee can see trip
// names even before they join the trip.
export async function GET(_request: NextRequest) {
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
  if (!user?.email) {
    return NextResponse.json([])
  }

  const email = user.email.toLowerCase()
  const admin = tryAdminClient()

  try {
    // Fetch invitations — use admin client if available, otherwise rely on RLS
    const invDb = admin ?? supabase
    const { data: invitations, error: invErr } = await invDb
      .from('trip_invitations')
      .select('id, trip_id, status, created_at')
      .eq('invited_email', email)
      .eq('status', 'pending')

    if (invErr || !invitations?.length) return NextResponse.json([])

    // Fetch trip names — always use admin client so invitees can see the trip
    // name before they are participants (bypasses the is_trip_participant RLS check)
    const tripIds = invitations.map((i: any) => i.trip_id)
    const { data: trips } = await (admin ?? supabase)
      .from('trips')
      .select('id, name, theme')
      .in('id', tripIds)

    const tripMap = new Map((trips ?? []).map((t: any) => [t.id, t]))

    return NextResponse.json(
      invitations.map((inv: any) => ({
        id: inv.id,
        tripId: inv.trip_id,
        tripName: tripMap.get(inv.trip_id)?.name ?? 'Unknown Trip',
        tripTheme: tripMap.get(inv.trip_id)?.theme ?? null,
        status: inv.status,
        createdAt: inv.created_at,
      }))
    )
  } catch {
    return NextResponse.json([])
  }
}

// PATCH /api/invitations?id=xxx — reject an invitation (invitee perspective)
export async function PATCH(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

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
  const { error } = await client
    .from('trip_invitations')
    .update({ status: 'rejected' })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/invitations?id=xxx — cancel an invitation (trip owner perspective)
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

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
  const { error } = await client
    .from('trip_invitations')
    .delete()
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
