import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(url, key, { auth: { persistSession: false } })
}

// GET /api/trips/[tripId] — authenticated: load full trip data bypassing RLS
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
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

  try {
    const admin = adminClient()

    // Verify the user is a participant before returning any data
    const { data: participant } = await admin
      .from('trip_participants')
      .select('user_id')
      .eq('trip_id', tripId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (!participant) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('trips')
      .select(`
        id, name, days, start_date, theme, trip_notes, countries,
        day_meta ( day_index, region, emoji, lat, lng, description ),
        events ( id, day_index, time, duration, name, category, location, lat, lng, notes, cost, tags, votes ),
        expenses ( id, description, amount, split_count ),
        emergency_contacts ( id, name, phone, type ),
        supplies ( id, name, category, checked, critical ),
        trip_participants ( user_id, initials, color )
      `)
      .eq('id', tripId)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
