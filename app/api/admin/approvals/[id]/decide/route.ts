import { createClient } from '@/utils/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USER_ID } from '@/lib/env'

function serviceClient() {
  return createAdmin(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), {
    auth: { persistSession: false },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminId = ADMIN_USER_ID()
  if (!user || user.id !== adminId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const action = body?.action

  if (!['approve', 'reject', 'block'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'blocked'

  const db = serviceClient()
  const { error } = await db
    .from('user_approvals')
    .update({
      status: newStatus,
      decided_at: new Date().toISOString(),
      decided_by: adminId,
    })
    .eq('user_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, status: newStatus })
}
