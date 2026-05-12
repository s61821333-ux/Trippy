import { createClient } from '@/utils/supabase/client'
import type { Category, DayMeta, EmergencyContact, Expense, SupplyItem, TripEvent, TripInvitation, TripTheme } from './types'

function sb() {
  return createClient()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  const supabase = sb()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

export async function getCurrentUser(): Promise<{ id: string; username: string } | null> {
  const { data: { session } } = await sb().auth.getSession()
  if (!session?.user) return null
  const email = session.user.email ?? ''
  const username = session.user.user_metadata?.full_name ?? email.split('@')[0]
  return { id: session.user.id, username }
}


export async function signOut() {
  await sb().auth.signOut()
}

export async function getSessionUserId(): Promise<string | null> {
  const { data: { session } } = await sb().auth.getSession()
  return session?.user?.id ?? null
}

// ─── Trips ───────────────────────────────────────────────────────────────────

export async function dbCreateTrip(
  userId: string,
  name: string,
  days: number,
  startDate: string,
  theme: TripTheme | undefined,
  dayMetas: DayMeta[],
  nickname: string,
  countries?: string[],
): Promise<string> {
  const supabase = sb()

  const baseRow = { name, days, start_date: startDate, theme: theme || null }

  let result = await supabase
    .from('trips')
    .insert((countries?.length ? { ...baseRow, countries } : baseRow) as any)
    .select('id')
    .single()

  // Fallback: if insert failed (likely missing countries column), retry without it
  if (result.error && countries?.length) {
    result = await supabase.from('trips').insert(baseRow).select('id').single()
  }

  const { data: trip, error } = result
  if (error || !trip) throw error

  const initials = nickname.slice(0, 2).toUpperCase()
  await supabase.from('trip_participants').insert({
    trip_id: trip.id,
    user_id: userId,
    initials,
    color: 'oklch(62% 0.15 195)',
  })

  await supabase.from('day_meta').insert(
    dayMetas.map((m, i) => ({
      trip_id: trip.id,
      day_index: i,
      region: m.region,
      emoji: m.emoji,
      lat: m.lat,
      lng: m.lng,
      description: m.desc,
    }))
  )

  return trip.id
}


export async function dbGetUserTrips(userId: string): Promise<{ id: string; name: string; theme: string | null; days: number; start_date: string | null }[]> {
  const { data, error } = await sb()
    .from('trip_participants')
    .select('trips ( id, name, theme, days, start_date )')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((row: any) => row.trips).filter(Boolean)
}

// ─── Invitations ─────────────────────────────────────────────────────────────

export async function dbGetInvitations(): Promise<TripInvitation[]> {
  const supabase = sb()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.email) return []
  const { data, error } = await supabase
    .from('trip_invitations')
    .select('id, trip_id, status, created_at, trips ( name, theme )')
    .eq('invited_email', session.user.email.toLowerCase())
    .eq('status', 'pending')
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    tripId: row.trip_id,
    tripName: row.trips?.name ?? 'Unknown Trip',
    tripTheme: row.trips?.theme ?? null,
    status: row.status as TripInvitation['status'],
    createdAt: row.created_at,
  }))
}

export async function dbInviteToTrip(tripId: string, invitedEmail: string): Promise<void> {
  const supabase = sb()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const { error } = await supabase.from('trip_invitations').insert({
    trip_id: tripId,
    invited_email: invitedEmail.toLowerCase().trim(),
    invited_by: session.user.id,
  })
  if (error) throw error
}

export async function dbAcceptInvitation(invitationId: string, userId: string, initials: string): Promise<string> {
  const supabase = sb()
  const { data: inv, error: invErr } = await supabase
    .from('trip_invitations')
    .select('trip_id')
    .eq('id', invitationId)
    .single()
  if (invErr || !inv) throw invErr ?? new Error('Invitation not found')
  await supabase.from('trip_invitations').update({ status: 'accepted' }).eq('id', invitationId)
  await supabase.from('trip_participants').upsert({
    trip_id: inv.trip_id,
    user_id: userId,
    initials,
    color: 'oklch(62% 0.15 195)',
  })
  return inv.trip_id
}

export async function dbRejectInvitation(invitationId: string): Promise<void> {
  const { error } = await sb()
    .from('trip_invitations')
    .update({ status: 'rejected' })
    .eq('id', invitationId)
  if (error) throw error
}

export async function dbLoadTripById(tripId: string) {
  const { data, error } = await sb()
    .from('trips')
    .select(`
      id, name, days, start_date, theme, trip_notes, countries,
      day_meta ( day_index, region, emoji, lat, lng, description ),
      events ( id, day_index, time, duration, name, category, location, lat, lng, notes, cost, tags ),
      expenses ( id, description, amount, split_count ),
      emergency_contacts ( id, name, phone, type ),
      supplies ( id, name, category, checked, critical ),
      trip_participants ( user_id, initials, color )
    `)
    .eq('id', tripId)
    .maybeSingle()
  if (error) throw error
  return data
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function dbAddEvent(tripId: string, dayNumber: number, event: TripEvent, userId: string) {
  const { error } = await sb().from('events').insert({
    id: event.id,
    trip_id: tripId,
    day_index: dayNumber - 1,
    time: event.time,
    duration: event.duration,
    name: event.name,
    category: event.category,
    location: event.location ?? null,
    lat: event.lat ?? null,
    lng: event.lng ?? null,
    notes: event.notes ?? null,
    added_by: userId,
    cost: event.cost ?? null,
    tags: event.tags ?? null,
  })
  if (error) throw error
}

export async function dbEditEvent(eventId: string, updates: Partial<TripEvent>) {
  const patch: Record<string, unknown> = {}
  if (updates.time      !== undefined) patch.time     = updates.time
  if (updates.duration  !== undefined) patch.duration  = updates.duration
  if (updates.name      !== undefined) patch.name      = updates.name
  if (updates.category  !== undefined) patch.category  = updates.category
  if (updates.location  !== undefined) patch.location  = updates.location
  if (updates.lat       !== undefined) patch.lat       = updates.lat
  if (updates.lng       !== undefined) patch.lng       = updates.lng
  if (updates.notes     !== undefined) patch.notes     = updates.notes
  if (updates.cost      !== undefined) patch.cost      = updates.cost
  if (updates.tags      !== undefined) patch.tags      = updates.tags

  const { error } = await sb().from('events').update(patch).eq('id', eventId)
  if (error) throw error
}

export async function dbDeleteEvent(eventId: string) {
  const { error } = await sb().from('events').delete().eq('id', eventId)
  if (error) throw error
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function dbAddExpense(tripId: string, expense: Expense, userId: string) {
  const { error } = await sb().from('expenses').insert({
    id: expense.id,
    trip_id: tripId,
    description: expense.description,
    amount: expense.amount,
    paid_by: userId,
    split_count: expense.splitCount,
  })
  if (error) throw error
}

export async function dbDeleteExpense(expenseId: string) {
  const { error } = await sb().from('expenses').delete().eq('id', expenseId)
  if (error) throw error
}

// ─── Supplies ────────────────────────────────────────────────────────────────

export async function dbAddSupply(tripId: string, supply: SupplyItem) {
  const { error } = await sb().from('supplies').insert({
    id: supply.id,
    trip_id: tripId,
    name: supply.name,
    category: supply.category,
    checked: supply.checked,
    critical: supply.critical ?? false,
  })
  if (error) throw error
}

export async function dbToggleSupply(supplyId: string, checked: boolean) {
  const { error } = await sb().from('supplies').update({ checked }).eq('id', supplyId)
  if (error) throw error
}

export async function dbDeleteSupply(supplyId: string) {
  const { error } = await sb().from('supplies').delete().eq('id', supplyId)
  if (error) throw error
}

// ─── Emergency contacts ──────────────────────────────────────────────────────

export async function dbAddEmergencyContact(tripId: string, contact: EmergencyContact) {
  const { error } = await sb().from('emergency_contacts').insert({
    id: contact.id,
    trip_id: tripId,
    name: contact.name,
    phone: contact.phone,
    type: contact.type,
  })
  if (error) throw error
}

export async function dbDeleteEmergencyContact(contactId: string) {
  const { error } = await sb().from('emergency_contacts').delete().eq('id', contactId)
  if (error) throw error
}

export async function dbLeaveTrip(tripId: string, userId: string) {
  const { error } = await sb().from('trip_participants').delete().eq('trip_id', tripId).eq('user_id', userId)
  if (error) throw error
}

// ─── Trip notes ──────────────────────────────────────────────────────────────

export async function dbUpdateTripNotes(tripId: string, notes: string[]) {
  const { error } = await sb().from('trips').update({ trip_notes: notes }).eq('id', tripId)
  if (error) throw error
}

// ─── Day meta ────────────────────────────────────────────────────────────────

export async function dbUpdateDayMeta(tripId: string, dayIndex: number, meta: Partial<DayMeta>) {
  const patch: Record<string, unknown> = {}
  if (meta.region !== undefined) patch.region      = meta.region
  if (meta.emoji  !== undefined) patch.emoji       = meta.emoji
  if (meta.lat    !== undefined) patch.lat         = meta.lat
  if (meta.lng    !== undefined) patch.lng         = meta.lng
  if (meta.desc   !== undefined) patch.description = meta.desc

  const { error } = await sb().from('day_meta').update(patch).eq('trip_id', tripId).eq('day_index', dayIndex)
  if (error) throw error
}

// ─── Invite links ────────────────────────────────────────────────────────────

export async function dbGetOrCreateInviteToken(tripId: string): Promise<string> {
  const supabase = sb()
  const { data } = await supabase.from('trips').select('invite_token').eq('id', tripId).single() as any
  if (data?.invite_token) return data.invite_token as string
  const token = crypto.randomUUID()
  await supabase.from('trips').update({ invite_token: token } as any).eq('id', tripId)
  return token
}

export async function dbGetTripEmailInvitations(tripId: string): Promise<{ email: string; status: string }[]> {
  const { data, error } = await sb()
    .from('trip_invitations')
    .select('invited_email, status')
    .eq('trip_id', tripId)
    .not('invited_email', 'is', null)
    .eq('status', 'pending')
  if (error) return []
  return (data ?? []).map((r: any) => ({ email: r.invited_email, status: r.status }))
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Reconstruct a Trip + supplies array from a DB row
export function rowToTrip(data: NonNullable<Awaited<ReturnType<typeof dbLoadTripById>>>) {
  const days = data.days ?? 1

  const dayMeta = Array.from({ length: days }, (_, i) => {
    const row = ((data.day_meta as any[]) ?? []).find((m: any) => m.day_index === i)
    return {
      region: row?.region ?? `Day ${i + 1}`,
      emoji:  row?.emoji  ?? '🏔️',
      lat:    row?.lat    ?? 31,
      lng:    row?.lng    ?? 35,
      desc:   row?.description ?? '',
    }
  })

  const events: Record<number, TripEvent[]> = {}
  for (let d = 1; d <= days; d++) {
    events[d] = ((data.events as any[]) ?? [])
      .filter((e: any) => e.day_index === d - 1)
      .map((e: any) => ({
        id:       e.id,
        time:     e.time     ?? '09:00',
        duration: e.duration ?? 60,
        name:     e.name,
        category: (e.category ?? 'other') as Category,
        location: e.location ?? undefined,
        lat:      e.lat      ?? undefined,
        lng:      e.lng      ?? undefined,
        notes:    e.notes    ?? undefined,
        addedBy:  'Unknown',
        cost:     e.cost     ?? undefined,
        tags:     e.tags     ?? undefined,
      }))
  }

  const expenses = ((data.expenses as any[]) ?? []).map((e: any) => ({
    id:          e.id,
    description: e.description,
    amount:      e.amount,
    paidBy:      'Unknown',
    splitCount:  e.split_count ?? 1,
  }))

  const emergencyContacts = ((data.emergency_contacts as any[]) ?? []).map((c: any) => ({
    id:    c.id,
    name:  c.name,
    phone: c.phone,
    type:  (c.type ?? 'personal') as EmergencyContact['type'],
  }))

  const participants = ((data.trip_participants as any[]) ?? []).map((p: any, i: number) => ({
    id:       i + 1,
    name:     p.initials ?? '??',
    initials: p.initials ?? '??',
    color:    p.color    ?? 'oklch(62% 0.15 195)',
  }))

  const supplies = ((data.supplies as any[]) ?? []).map((s: any) => ({
    id:       s.id,
    name:     s.name,
    category: s.category ?? 'Other',
    checked:  s.checked  ?? false,
    critical: s.critical ?? false,
  }))

  const trip = {
    name:              data.name,
    days,
    startDate:         data.start_date ?? new Date().toISOString().split('T')[0],
    theme:             (data.theme ?? 'desert') as TripTheme,
    countries:         (() => {
      const raw = (data as any).countries
      console.log('[trippy] countries raw:', raw, typeof raw)
      // Case 1: proper text[] column — PostgREST returns JS array directly
      if (Array.isArray(raw)) return (raw as string[]).filter(Boolean)
      if (typeof raw !== 'string' || !raw.trim()) return undefined
      const s = raw.trim()
      // Case 2: text column storing JSON string: ["United States","France"]
      if (s.startsWith('[')) {
        try {
          const parsed = JSON.parse(s)
          if (Array.isArray(parsed)) return (parsed as string[]).map(c => String(c).trim()).filter(Boolean)
        } catch {}
      }
      // Case 3: PostgreSQL array literal: {Israel} or {"United States",Jordan}
      if (s.startsWith('{') && s.endsWith('}')) {
        const inner = s.slice(1, -1)
        if (!inner.trim()) return undefined
        const parts = inner.match(/(?:"[^"]*"|[^,]+)/g) ?? []
        const result = parts.map(p => p.replace(/^"|"$/g, '').trim()).filter(Boolean)
        return result.length ? result : undefined
      }
      // Case 4: plain comma-separated: "United States,France"
      const result = s.split(',').map((c: string) => c.trim()).filter(Boolean)
      return result.length ? result : undefined
    })(),
    tripNotes:         (data.trip_notes as string[]) ?? [],
    participants,
    dayMeta,
    events,
    expenses,
    emergencyContacts,
  }

  return { trip, supplies }
}
