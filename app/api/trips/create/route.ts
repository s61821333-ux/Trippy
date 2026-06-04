import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { CreateTripBody } from '@/lib/schemas'

const TRIP_SELECT = `
  id, name, days, start_date, theme, trip_notes, countries,
  day_meta ( day_index, region, emoji, lat, lng, description ),
  events ( id, day_index, time, duration, name, category, location, lat, lng, notes, cost, tags, votes ),
  expenses ( id, description, amount, split_count ),
  emergency_contacts ( id, name, phone, type ),
  supplies ( id, name, category, checked, critical ),
  trip_participants ( user_id, initials, color )
`

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

// POST /api/trips/create — authenticated: create a trip + participant + day_meta
// Uses admin client to bypass RLS when SUPABASE_SERVICE_ROLE_KEY is set,
// otherwise falls back to the create_trip RPC via the user's session.
export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Rate limit: 10 trips/60s per user
  const rl = checkRateLimit(`trip:${user.id}`, 10, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 10)

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = CreateTripBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, days, startDate, theme, countries, nickname, dayMetas } = parsed.data

  try {
    const admin = tryAdminClient()

    if (admin) {
      // Admin path — bypasses RLS entirely
      const tripPayload: Record<string, unknown> = {
        name,
        days,
        start_date: startDate,
        theme: theme || null,
        countries: countries?.length ? countries : null,
        created_by: user.id,
      }

      let { data: trip, error: tripErr } = await admin
        .from('trips')
        .insert(tripPayload)
        .select('id')
        .single()

      // Retry without created_by if the column doesn't exist yet (rls_policies.sql not run)
      if (tripErr?.message?.includes('created_by')) {
        const { created_by: _, ...payloadFallback } = tripPayload;
        ({ data: trip, error: tripErr } = await admin
          .from('trips')
          .insert(payloadFallback)
          .select('id')
          .single())
      }

      if (tripErr || !trip) {
        return NextResponse.json({ error: tripErr?.message ?? 'Failed to create trip' }, { status: 500 })
      }

      const initials = nickname
        ? nickname.slice(0, 2).toUpperCase()
        : (user.user_metadata?.full_name ?? user.email ?? 'U').slice(0, 2).toUpperCase()

      const { error: participantErr } = await admin.from('trip_participants').upsert({
        trip_id: trip.id,
        user_id: user.id,
        initials,
        color: 'oklch(62% 0.15 195)',
      })
      if (participantErr) {
        await admin.from('trips').delete().eq('id', trip.id)
        return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 })
      }

      if (Array.isArray(dayMetas) && dayMetas.length > 0) {
        await admin.from('day_meta').insert(
          dayMetas.map((m: any, i: number) => ({
            trip_id: trip.id,
            day_index: i,
            region: m.region,
            emoji: m.emoji,
            lat: m.lat,
            lng: m.lng,
            description: m.desc,
          }))
        )
      }

      return NextResponse.json({ tripId: trip.id })
    }

    // Fallback — direct inserts using the user's JWT (subject to RLS)
    const fallbackPayload: Record<string, unknown> = {
      name, days,
      start_date: startDate,
      theme: theme || null,
      countries: countries?.length ? countries : null,
      created_by: user.id,
    }

    let { data: trip2, error: tripErr2 } = await supabase
      .from('trips')
      .insert(fallbackPayload)
      .select('id')
      .single()

    if (tripErr2?.message?.includes('created_by')) {
      const { created_by: _, ...payloadFb } = fallbackPayload;
      ({ data: trip2, error: tripErr2 } = await supabase
        .from('trips')
        .insert(payloadFb)
        .select('id')
        .single())
    }

    if (tripErr2 || !trip2) {
      return NextResponse.json({ error: tripErr2?.message ?? 'Failed to create trip' }, { status: 500 })
    }

    const fallbackInitials = nickname
      ? nickname.slice(0, 2).toUpperCase()
      : (user.user_metadata?.full_name ?? user.email ?? 'U').slice(0, 2).toUpperCase()

    const { error: participantErr2 } = await supabase.from('trip_participants').insert({
      trip_id: trip2.id,
      user_id: user.id,
      initials: fallbackInitials,
      color: 'oklch(62% 0.15 195)',
    })

    if (participantErr2) {
      await supabase.from('trips').delete().eq('id', trip2.id)
      return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 })
    }

    if (Array.isArray(dayMetas) && dayMetas.length > 0) {
      await supabase.from('day_meta').insert(
        dayMetas.map((m: any, i: number) => ({
          trip_id: trip2.id,
          day_index: i,
          region: m.region,
          emoji: m.emoji,
          lat: m.lat,
          lng: m.lng,
          description: m.desc,
        }))
      )
    }

    return NextResponse.json({ tripId: trip2.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
