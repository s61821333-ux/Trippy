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

// PUT /api/trips/[tripId]/hotels
// Body: { hotels: HotelStay[] }
// Verifies the caller is a trip participant, then writes the hotels JSONB array.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { hotels } = body
  if (!Array.isArray(hotels)) {
    return NextResponse.json({ error: 'hotels must be an array' }, { status: 400 })
  }

  try {
    const admin = tryAdminClient()

    if (admin) {
      // Verify participation before writing
      const { data: participant } = await admin
        .from('trip_participants')
        .select('user_id')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!participant) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
      }

      const { error } = await admin
        .from('trips')
        .update({ hotels } as any)
        .eq('id', tripId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    // Fallback — user's JWT subject to RLS
    const { error } = await supabase
      .from('trips')
      .update({ hotels } as any)
      .eq('id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
