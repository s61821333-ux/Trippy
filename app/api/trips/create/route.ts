import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// POST /api/trips/create — authenticated: create a trip + participant + day_meta
// Uses admin client to bypass RLS when SUPABASE_SERVICE_ROLE_KEY is set,
// otherwise falls back to the create_trip RPC via the user's session.
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove: (name: string, options: CookieOptions) => {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, days, startDate, theme, countries, nickname, dayMetas } = body
  if (!name || !days) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const admin = tryAdminClient()

    if (admin) {
      // Admin path — bypasses RLS entirely
      const { data: trip, error: tripErr } = await admin
        .from('trips')
        .insert({
          name,
          days,
          start_date: startDate,
          theme: theme || null,
          countries: countries?.length ? countries : null,
        })
        .select('id')
        .single()

      if (tripErr || !trip) {
        return NextResponse.json({ error: tripErr?.message ?? 'Failed to create trip' }, { status: 500 })
      }

      const initials = nickname
        ? nickname.slice(0, 2).toUpperCase()
        : (session.user.user_metadata?.full_name ?? session.user.email ?? 'U').slice(0, 2).toUpperCase()

      await admin.from('trip_participants').insert({
        trip_id: trip.id,
        user_id: session.user.id,
        initials,
        color: 'oklch(62% 0.15 195)',
      })

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

    // Fallback — use the user's JWT via create_trip RPC (subject to RLS)
    const { data: tripId, error: rpcErr } = await supabase.rpc('create_trip', {
      p_name: name,
      p_days: days,
      p_start_date: startDate,
      p_theme: theme || null,
      p_countries: countries?.length ? countries : null,
      p_nickname: nickname,
    })

    if (rpcErr || !tripId) {
      return NextResponse.json({ error: rpcErr?.message ?? 'Failed to create trip' }, { status: 500 })
    }

    if (Array.isArray(dayMetas) && dayMetas.length > 0) {
      await supabase.from('day_meta').insert(
        dayMetas.map((m: any, i: number) => ({
          trip_id: tripId,
          day_index: i,
          region: m.region,
          emoji: m.emoji,
          lat: m.lat,
          lng: m.lng,
          description: m.desc,
        }))
      )
    }

    return NextResponse.json({ tripId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
