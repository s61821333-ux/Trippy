import { createClient } from '@/utils/supabase/client'
import type { Category, DayMeta, EmergencyContact, Expense, SupplyItem, TripEvent, TripTheme } from './types'

function sb() {
  return createClient()
}

async function hashTripCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(code.toLowerCase().trim())
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── Auth ────────────────────────────────────────────────────────────────────

// Supabase requires an email format — we use a fake domain internally
const AUTH_DOMAIN = 'trippy-users.com'

function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@${AUTH_DOMAIN}`
}

export async function registerUser(username: string, password: string): Promise<string> {
  const supabase = sb()
  const { data, error } = await supabase.auth.signUp({
    email: toEmail(username),
    password,
  })
  if (error || !data.user) throw error ?? new Error('Registration failed')
  if (!data.session) throw new Error('EMAIL_CONFIRM_REQUIRED')
  return data.user.id
}

export async function signInUser(username: string, password: string): Promise<string> {
  const supabase = sb()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  })
  if (error || !data.user) throw error ?? new Error('Login failed')
  return data.user.id
}

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
  // Google users have real emails; internal users have @trippy.internal
  const username = email.endsWith(`@${AUTH_DOMAIN}`)
    ? email.replace(`@${AUTH_DOMAIN}`, '')
    : (session.user.user_metadata?.full_name ?? email.split('@')[0])
  return { id: session.user.id, username }
}

export async function ensureUser(nickname: string): Promise<string> {
  const supabase = sb()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const userId = session.user.id
  await supabase.from('profiles').upsert({ id: userId, nickname })
  return userId
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
  code: string | undefined,
  theme: TripTheme | undefined,
  dayMetas: DayMeta[],
  nickname: string,
  countries?: string[],
): Promise<string> {
  const supabase = sb()

  const hashedCode = code ? await hashTripCode(code) : null

  const baseRow = { name, days, start_date: startDate, code: hashedCode, theme: theme || null }

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

export async function dbFindTrip(name: string, code: string) {
  const hashedCode = await hashTripCode(code)
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
    .ilike('name', name.trim())
    .eq('code', hashedCode)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function dbJoinTrip(tripId: string, userId: string, initials: string) {
  await sb().from('trip_participants').upsert({
    trip_id: tripId,
    user_id: userId,
    initials,
    color: 'oklch(62% 0.15 195)',
  })
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function dbAddEvent(tripId: string, dayNumber: number, event: TripEvent, userId: string) {
  await sb().from('events').insert({
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

  await sb().from('events').update(patch).eq('id', eventId)
}

export async function dbDeleteEvent(eventId: string) {
  await sb().from('events').delete().eq('id', eventId)
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function dbAddExpense(tripId: string, expense: Expense, userId: string) {
  await sb().from('expenses').insert({
    id: expense.id,
    trip_id: tripId,
    description: expense.description,
    amount: expense.amount,
    paid_by: userId,
    split_count: expense.splitCount,
  })
}

export async function dbDeleteExpense(expenseId: string) {
  await sb().from('expenses').delete().eq('id', expenseId)
}

// ─── Supplies ────────────────────────────────────────────────────────────────

export async function dbAddSupply(tripId: string, supply: SupplyItem) {
  await sb().from('supplies').insert({
    id: supply.id,
    trip_id: tripId,
    name: supply.name,
    category: supply.category,
    checked: supply.checked,
    critical: supply.critical ?? false,
  })
}

export async function dbToggleSupply(supplyId: string, checked: boolean) {
  await sb().from('supplies').update({ checked }).eq('id', supplyId)
}

export async function dbDeleteSupply(supplyId: string) {
  await sb().from('supplies').delete().eq('id', supplyId)
}

// ─── Emergency contacts ──────────────────────────────────────────────────────

export async function dbAddEmergencyContact(tripId: string, contact: EmergencyContact) {
  await sb().from('emergency_contacts').insert({
    id: contact.id,
    trip_id: tripId,
    name: contact.name,
    phone: contact.phone,
    type: contact.type,
  })
}

export async function dbDeleteEmergencyContact(contactId: string) {
  await sb().from('emergency_contacts').delete().eq('id', contactId)
}

// ─── Trip notes ──────────────────────────────────────────────────────────────

export async function dbUpdateTripNotes(tripId: string, notes: string[]) {
  await sb().from('trips').update({ trip_notes: notes }).eq('id', tripId)
}

// ─── Day meta ────────────────────────────────────────────────────────────────

export async function dbUpdateDayMeta(tripId: string, dayIndex: number, meta: Partial<DayMeta>) {
  const patch: Record<string, unknown> = {}
  if (meta.region !== undefined) patch.region      = meta.region
  if (meta.emoji  !== undefined) patch.emoji       = meta.emoji
  if (meta.lat    !== undefined) patch.lat         = meta.lat
  if (meta.lng    !== undefined) patch.lng         = meta.lng
  if (meta.desc   !== undefined) patch.description = meta.desc

  await sb().from('day_meta').update(patch).eq('trip_id', tripId).eq('day_index', dayIndex)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Reconstruct a Trip + supplies array from a dbFindTrip result
export function rowToTrip(data: NonNullable<Awaited<ReturnType<typeof dbFindTrip>>>) {
  const days = data.days ?? 1

  const dayMeta = Array.from({ length: days }, (_, i) => {
    const row = (data.day_meta as any[]).find((m: any) => m.day_index === i)
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
    events[d] = (data.events as any[])
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

  const expenses = (data.expenses as any[]).map((e: any) => ({
    id:          e.id,
    description: e.description,
    amount:      e.amount,
    paidBy:      'Unknown',
    splitCount:  e.split_count ?? 1,
  }))

  const emergencyContacts = (data.emergency_contacts as any[]).map((c: any) => ({
    id:    c.id,
    name:  c.name,
    phone: c.phone,
    type:  (c.type ?? 'personal') as EmergencyContact['type'],
  }))

  const participants = (data.trip_participants as any[]).map((p: any, i: number) => ({
    id:       i + 1,
    name:     p.initials ?? '??',
    initials: p.initials ?? '??',
    color:    p.color    ?? 'oklch(62% 0.15 195)',
  }))

  const supplies = (data.supplies as any[]).map((s: any) => ({
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
    countries:         (data as any).countries as string[] | undefined,
    tripNotes:         (data.trip_notes as string[]) ?? [],
    participants,
    dayMeta,
    events,
    expenses,
    emergencyContacts,
  }

  return { trip, supplies }
}
