import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function tryAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// GET /api/trips — returns all trips the authenticated user is a participant of
export async function GET(_request: NextRequest) {
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
    return NextResponse.json([], { status: 200 })
  }

  try {
    const admin = tryAdminClient()
    const db = admin ?? supabase

    const { data, error } = await db
      .from('trip_participants')
      .select('trips ( id, name, theme, days, start_date )')
      .eq('user_id', session.user.id)

    if (error) return NextResponse.json([], { status: 200 })

    const trips = (data ?? []).map((row: any) => row.trips).filter(Boolean)
    return NextResponse.json(trips)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
