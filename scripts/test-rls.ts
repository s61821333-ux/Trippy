/**
 * SEC-1: Automated RLS policy verification script.
 *
 * Creates two test users, verifies that User B cannot read, update, or delete
 * User A's trip, then cleans up all test data.
 *
 * Usage:
 *   npx tsx scripts/test-rls.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  console.error('ERROR: SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY must be set.')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

let passed = 0
let failed = 0

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`  ✓ PASS  ${label}`)
    passed++
  } else {
    console.error(`  ✗ FAIL  ${label}`)
    failed++
  }
}

async function createTestUser(email: string) {
  // Delete if already exists from a previous failed run
  const { data: existing } = await admin.auth.admin.listUsers()
  const found = existing?.users?.find((u: any) => u.email === email)
  if (found) await admin.auth.admin.deleteUser(found.id)

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: 'Test-Password-999!',
    email_confirm: true,
  })
  if (error) throw new Error(`Failed to create test user ${email}: ${error.message}`)
  return data.user!
}

async function getTokenForUser(email: string): Promise<string> {
  // Sign in with password to get a real anon-scoped JWT that respects RLS
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
  })
  const { data, error } = await anonClient.auth.signInWithPassword({
    email,
    password: 'Test-Password-999!',
  })
  if (error || !data.session) {
    throw new Error(`Failed to sign in as ${email}: ${error?.message}`)
  }
  return data.session.access_token
}

function userClient(accessToken: string) {
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  })
}

async function main() {
  const timestamp = Date.now()
  const emailA = `rls-test-a-${timestamp}@example.com`
  const emailB = `rls-test-b-${timestamp}@example.com`
  let userAId = ''
  let userBId = ''
  let tripId = ''

  console.log('\n── SEC-1: RLS Policy Verification ──────────────────────────────')

  try {
    // ── Setup ────────────────────────────────────────────────────────────────
    console.log('\n[Setup] Creating test users…')
    const userA = await createTestUser(emailA)
    const userB = await createTestUser(emailB)
    userAId = userA.id
    userBId = userB.id
    console.log(`  User A: ${userAId}`)
    console.log(`  User B: ${userBId}`)

    console.log('\n[Setup] Creating trip for User A…')
    const { data: trip, error: tripErr } = await admin
      .from('trips')
      .insert({ name: 'RLS Test Trip', days: 3, created_by: userAId })
      .select('id')
      .single()

    if (tripErr || !trip) throw new Error(`Failed to create trip: ${tripErr?.message}`)
    tripId = trip.id
    console.log(`  Trip: ${tripId}`)

    await admin.from('trip_participants').insert({
      trip_id: tripId,
      user_id: userAId,
      initials: 'TA',
      color: 'oklch(62% 0.15 195)',
    })

    // ── Get real JWT for User B (respects RLS) ───────────────────────────────
    console.log('\n[Auth] Signing in as User B with password…')
    const tokenB = await getTokenForUser(emailB)
    console.log('  Got JWT for User B ✓')
    const clientB = userClient(tokenB)

    // ── Test 1: SELECT ───────────────────────────────────────────────────────
    console.log('\n[Test 1] SELECT — User B cannot read User A\'s trip')
    const { data: selectData } = await clientB
      .from('trips')
      .select('id')
      .eq('id', tripId)

    assert('User B reads 0 rows from User A\'s trip', !selectData?.length)

    // ── Test 2: UPDATE ───────────────────────────────────────────────────────
    console.log('\n[Test 2] UPDATE — User B cannot modify User A\'s trip')
    const { data: updateData, error: updateErr } = await clientB
      .from('trips')
      .update({ name: 'HACKED' })
      .eq('id', tripId)
      .select()

    assert('UPDATE returns 0 rows affected or an error', !updateData?.length || !!updateErr)

    const { data: unchanged } = await admin
      .from('trips')
      .select('name')
      .eq('id', tripId)
      .single()

    assert('Trip name unchanged after unauthorized UPDATE', unchanged?.name === 'RLS Test Trip')

    // ── Test 3: DELETE ───────────────────────────────────────────────────────
    console.log('\n[Test 3] DELETE — User B cannot delete User A\'s trip')
    const { data: deleteData, error: deleteErr } = await clientB
      .from('trips')
      .delete()
      .eq('id', tripId)
      .select()

    assert('DELETE returns 0 rows affected or an error', !deleteData?.length || !!deleteErr)

    const { data: stillExists } = await admin
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .maybeSingle()

    assert('Trip still exists after unauthorized DELETE', !!stillExists)

    // ── Test 4: trip_participants ────────────────────────────────────────────
    console.log('\n[Test 4] trip_participants — User B cannot read User A\'s participant row')
    const { data: partData } = await clientB
      .from('trip_participants')
      .select('user_id')
      .eq('trip_id', tripId)

    assert('User B reads 0 participant rows for User A\'s trip', !partData?.length)

  } catch (err: any) {
    console.error('\nFATAL:', err.message)
    failed++
  } finally {
    console.log('\n[Cleanup] Removing test data…')
    if (tripId) await admin.from('trips').delete().eq('id', tripId)
    if (userAId) await admin.auth.admin.deleteUser(userAId)
    if (userBId) await admin.auth.admin.deleteUser(userBId)
    console.log('  Done.')
  }

  console.log(`\n── Results: ${passed} passed, ${failed} failed ─────────────────────────`)

  if (failed > 0) {
    console.error('\n❌  RLS CHECKS FAILED — do not deploy until these are fixed.\n')
    process.exit(1)
  } else {
    console.log('\n✅  All RLS checks passed.\n')
    process.exit(0)
  }
}

main()
