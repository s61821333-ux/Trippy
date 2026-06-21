import { createClient } from '@/utils/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USER_ID } from '@/lib/env'

function serviceClient() {
  return createAdmin(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), {
    auth: { persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== ADMIN_USER_ID()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // pending | approved | rejected | blocked | null (all)
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)

  const db = serviceClient()
  let query = db
    .from('user_approvals')
    .select('user_id, email, display_name, status, requested_at, decided_at')
    .order('requested_at', { ascending: false })
    .limit(limit)

  if (status && ['pending', 'approved', 'rejected', 'blocked'].includes(status)) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ users: data ?? [] })
}
