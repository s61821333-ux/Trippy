import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { AddExpenseBody } from '@/lib/schemas'

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

async function getAuthUser(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET /api/trips/[tripId]/expenses — lazy-loaded when Budget section is first opened
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const cookieStore = await cookies()
  const admin = tryAdminClient()

  let userId: string | null = null
  if (admin) {
    const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
      cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
    })
    const { data: { session } } = await supabase.auth.getSession()
    userId = session?.user?.id ?? null
  } else {
    const user = await getAuthUser(cookieStore)
    userId = user?.id ?? null
  }
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const client = admin ?? createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  })

  if (admin) {
    const { data: participant } = await admin.from('trip_participants').select('user_id')
      .eq('trip_id', tripId).eq('user_id', userId).maybeSingle()
    if (!participant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  const { data, error } = await client.from('expenses')
    .select('id, description, amount, paid_by, split_count, tags')
    .eq('trip_id', tripId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Resolve paid_by user_id → initials
  const participantRows = admin
    ? (await admin.from('trip_participants').select('user_id, initials').eq('trip_id', tripId)).data ?? []
    : []
  const userToInitials = new Map<string, string>(participantRows.map((p: any) => [p.user_id, p.initials ?? '??']))

  const expenses = (data ?? []).map((e: any) => ({
    id:          e.id,
    description: e.description,
    amount:      e.amount,
    paidBy:      userToInitials.get(e.paid_by) ?? 'Unknown',
    splitCount:  e.split_count ?? 1,
    tags:        Array.isArray(e.tags) ? e.tags : [],
  }))
  return NextResponse.json(expenses, { headers: { 'Cache-Control': 'no-store' } })
}

// POST /api/trips/[tripId]/expenses
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const cookieStore = await cookies()
  const user = await getAuthUser(cookieStore)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = tryAdminClient()
  if (admin) {
    const { data: participant } = await admin.from('trip_participants').select('user_id')
      .eq('trip_id', tripId).eq('user_id', user.id).maybeSingle()
    if (!participant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = AddExpenseBody.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { id, description, amount, splitCount, tags } = parsed.data
  const client = admin ?? createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  })
  const { error } = await client.from('expenses').insert({
    id,
    trip_id: tripId,
    description,
    amount,
    paid_by: user.id,
    split_count: splitCount ?? 1,
    tags: tags ?? [],
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/trips/[tripId]/expenses?id=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const expenseId = request.nextUrl.searchParams.get('id')
  if (!expenseId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const cookieStore = await cookies()
  const user = await getAuthUser(cookieStore)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = tryAdminClient()
  if (admin) {
    const { data: participant } = await admin.from('trip_participants').select('user_id')
      .eq('trip_id', tripId).eq('user_id', user.id).maybeSingle()
    if (!participant) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  const client = admin ?? createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  })
  const { error } = await client.from('expenses').delete().eq('id', expenseId).eq('trip_id', tripId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
