import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './env'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'blocked' | 'admin'

function adminClient() {
  return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), {
    auth: { persistSession: false },
  })
}

function getAdminId(): string | null {
  try {
    return process.env.ADMIN_USER_ID ?? null
  } catch {
    return null
  }
}

/**
 * Ensures a user_approvals row exists for this user.
 * - Admin (ADMIN_USER_ID) is always auto-approved and never held in queue.
 * - Uses ignoreDuplicates: true so re-logins never overwrite an existing status.
 * - Returns the actual current status (re-reads after upsert).
 */
export async function ensureApprovalRecord(
  userId: string,
  email: string,
  displayName: string,
): Promise<ApprovalStatus> {
  const adminId = getAdminId()
  const isAdmin = adminId && userId === adminId

  const db = adminClient()

  if (isAdmin) {
    await db.from('user_approvals').upsert(
      {
        user_id: userId,
        email,
        display_name: displayName,
        status: 'approved',
        decided_at: new Date().toISOString(),
      },
      { onConflict: 'user_id', ignoreDuplicates: true },
    )
    return 'admin'
  }

  // Create pending row only if user doesn't already have one.
  await db.from('user_approvals').upsert(
    { user_id: userId, email, display_name: displayName, status: 'pending' },
    { onConflict: 'user_id', ignoreDuplicates: true },
  )

  // Re-read actual status (may already be approved if admin acted between logins).
  const { data } = await db
    .from('user_approvals')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle()

  return (data?.status as ApprovalStatus) ?? 'pending'
}

/**
 * Lightweight status-only lookup for middleware and API route use.
 * Returns null if no row exists (treat same as pending).
 */
export async function getApprovalStatus(userId: string): Promise<ApprovalStatus | null> {
  const adminId = getAdminId()
  if (adminId && userId === adminId) return 'admin'

  try {
    const db = adminClient()
    const { data, error } = await db
      .from('user_approvals')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) return null
    return data.status as ApprovalStatus
  } catch {
    return null
  }
}
