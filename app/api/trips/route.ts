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
    return NextResponse.json({ trips: [], nextCursor: null }, { status: 200 })
  }

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get('cursor') ?? null
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '20'), 1), 100)

  try {
    const admin = tryAdminClient()
    const db = admin ?? supabase

    // Resolve cursor to a created_at timestamp for keyset pagination
    let cursorTs: string | null = null
    if (cursor) {
      const { data: cursorRow } = await db
        .from('trips')
        .select('created_at')
        .eq('id', cursor)
        .maybeSingle()
      cursorTs = cursorRow?.created_at ?? null
    }

    // Get trip IDs the user participates in
    let participantQuery = db
      .from('trip_participants')
      .select('trip_id')
      .eq('user_id', user.id)

    const { data: participantRows, error: partErr } = await participantQuery
    if (partErr || !participantRows?.length) {
      return NextResponse.json(
        { trips: [], nextCursor: null },
        { status: 200, headers: { 'Cache-Control': 'private, max-age=30' } },
      )
    }

    const tripIds = participantRows.map((r: any) => r.trip_id)

    let tripsQuery = db
      .from('trips')
      .select('id, name, theme, days, start_date, created_at')
      .in('id', tripIds)
      .order('created_at', { ascending: false })
      .limit(limit + 1) // fetch one extra to determine if a next page exists

    if (cursorTs) {
      tripsQuery = tripsQuery.lt('created_at', cursorTs)
    }

    const { data: trips, error } = await tripsQuery
    if (error) {
      return NextResponse.json(
        { trips: [], nextCursor: null },
        { status: 200, headers: { 'Cache-Control': 'private, max-age=30' } },
      )
    }

    const hasMore = (trips?.length ?? 0) > limit
    const page = (trips ?? []).slice(0, limit)
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null

    // Strip created_at from the response — it was only needed for pagination
    const result = page.map(({ created_at: _, ...t }: any) => t)

    return NextResponse.json(
      { trips: result, nextCursor },
      { headers: { 'Cache-Control': 'private, max-age=30' } },
    )
  } catch {
    return NextResponse.json({ trips: [], nextCursor: null }, { status: 200 })
  }
}
