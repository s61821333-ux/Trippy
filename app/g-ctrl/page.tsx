import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ADMIN_USER_ID } from '@/lib/env'
import AdminClient from './AdminClient'

export const metadata = { title: 'Admin · Trippy', robots: { index: false } }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let adminId: string
  try { adminId = ADMIN_USER_ID() } catch { redirect('/') }

  if (!user || user.id !== adminId) redirect('/')

  return <AdminClient />
}
