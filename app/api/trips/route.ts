import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

// GET /api/trips?cursor=<last_trip_id>&limit=20
// Returns trips the authenticated user participates in, newest first.
// Supports cursor-based pagination: pass the last trip's id as ?cursor to get the next page.
export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get('cursor') ?? null
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '20'), 1), 100)

  try {
    const admin = tryAdminClient()
    const db = admin ?? supabase

    // Single JOIN query: trips the user participates in, newest first.
    // trip_participants!inner filters to only trips where the user is a member.
    let tripsQuery = (db as any)
      .from('trips')
      .select('id, name, theme, days, start_date, created_at, trip_participants!inner(user_id)')
      .eq('trip_participants.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    // Resolve cursor to a created_at timestamp and apply keyset filter
    if (cursor) {
      const { data: cursorRow } = await db
        .from('trips')
        .select('created_at')
        .eq('id', cursor)
        .maybeSingle()
      const cursorTs = (cursorRow as any)?.created_at ?? null
      if (cursorTs) tripsQuery = tripsQuery.lt('created_at', cursorTs)
    }

    let { data: trips, error } = await tripsQuery

    // created_at column may not exist if the table was created manually — fall back to two-query approach
    if (error && (error.message?.includes('created_at') || error.message?.includes('column') || error.message?.includes('trip_participants'))) {
      const { data: participantRows } = await db
        .from('trip_participants')
        .select('trip_id')
        .eq('user_id', user.id)
      const tripIds = (participantRows ?? []).map((r: any) => r.trip_id)
      if (!tripIds.length) {
        return NextResponse.json(
          { trips: [], nextCursor: null },
          { status: 200, headers: { 'Cache-Control': 'no-store' } },
        )
      }
      const fb = await db
        .from('trips')
        .select('id, name, theme, days, start_date')
        .in('id', tripIds)
        .limit(limit)
      trips = fb.data as any; error = fb.error
    }

    if (error) {
      return NextResponse.json(
        { trips: [], nextCursor: null },
        { status: 200, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const hasMore = (trips?.length ?? 0) > limit
    const page = (trips ?? []).slice(0, limit)
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = page.map(({ created_at: _ca, trip_participants: _tp, ...t }: any) => t)

    return NextResponse.json(
      { trips: result, nextCursor },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json({ trips: [], nextCursor: null }, { status: 200 })
  }
}
