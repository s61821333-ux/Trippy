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

// POST /api/invitations/send — send an email invitation to a trip
// Body: { tripId: string, invitedEmail: string }
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
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { tripId, invitedEmail } = body
  if (!tripId || !invitedEmail) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const admin = tryAdminClient()
    const db = admin ?? supabase

    // Upsert so that re-inviting someone who previously accepted/rejected works —
    // without this, the UNIQUE(trip_id, invited_email) constraint would block the insert
    // even though the old invitation is no longer pending.
    const { error } = await db.from('trip_invitations').upsert(
      {
        trip_id: tripId,
        invited_email: invitedEmail.toLowerCase().trim(),
        invited_by: session.user.id,
        status: 'pending',
      },
      { onConflict: 'trip_id,invited_email' }
    )

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
