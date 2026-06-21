import { createClient } from '@/utils/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USER_ID } from '@/lib/env'

function serviceClient() {
  return createAdmin(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), {
    auth: { persistSession: false },
  })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== ADMIN_USER_ID()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = serviceClient()

  const [approvalsRes, tripsRes] = await Promise.all([
    db.from('user_approvals').select('status'),
    db.from('trips').select('id', { count: 'exact', head: true }),
  ])

  const rows = approvalsRes.data ?? []
  const counts = { pending: 0, approved: 0, rejected: 0, blocked: 0 }
  for (const row of rows) {
    const s = row.status as keyof typeof counts
    if (s in counts) counts[s]++
  }

  return NextResponse.json({
    ...counts,
    total_users: rows.length,
    total_trips: tripsRes.count ?? 0,
  })
}
