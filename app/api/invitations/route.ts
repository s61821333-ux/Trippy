import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function tryAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// GET /api/invitations — authenticated: return pending invitations with trip names
// Uses admin client to bypass RLS when available, so the invitee can see trip
// names even before they join the trip.
export async function GET(_request: NextRequest) {
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
  if (!session?.user?.email) {
    return NextResponse.json([])
  }

  const email = session.user.email.toLowerCase()
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
