import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ status: null }, { status: 401 })
  }

  // RLS policy "ua_select_own" allows each user to read only their own row.
  const { data } = await supabase
    .from('user_approvals')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ status: data?.status ?? null })
}
