import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role config')
  return createClient(url, key, { auth: { persistSession: false } })
}

// DELETE /api/account/delete
// Removes the calling user's personal data without deleting shared trip content.
// - Removes all trip_participants rows for this user (trips remain for co-participants)
// - Removes privacy_consents record
// - Removes trip_invitations sent to or by this user
// - Hard-deletes the Supabase auth user
export async function DELETE() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const admin = adminClient()

    // 1. Remove from all trips (trips and their content stay for other participants)
    await admin.from('trip_participants').delete().eq('user_id', user.id)

    // 2. Remove privacy consent record
    await admin.from('privacy_consents').delete().eq('user_id', user.id)

    // 3. Remove invitations sent to this email or issued by this user
    if (user.email) {
      await admin.from('trip_invitations').delete().eq('invited_email', user.email)
    }
    await admin.from('trip_invitations').delete().eq('invited_by', user.id)

    // 4. Delete the auth user — this invalidates all active sessions
    const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id)
    if (deleteErr) throw deleteErr

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[DELETE /api/account/delete]', err)
    return NextResponse.json(
      { error: err?.message ?? 'Failed to delete account' },
      { status: 500 }
    )
  }
}
