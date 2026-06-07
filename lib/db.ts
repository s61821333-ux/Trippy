import { createClient } from '@/utils/supabase/client'
import type { Category, DayMeta, EmergencyContact, Expense, HotelStay, SupplyItem, TripEvent, TripInvitation, TripTheme, WishlistItem } from './types'

// Bump this string whenever the terms/privacy text changes materially.
// Users who accepted a previous version will be shown the modal again.
export const TERMS_VERSION = '2026-05-v1'

function sb() {
  return createClient()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

function isWebView(): boolean {
  const ua = navigator.userAgent
  if (/FBAN|FBAV|FB_IAB|Instagram|Twitter\/|Line\/|WhatsApp|Snapchat/i.test(ua)) return true
  if (/Android/.test(ua) && /wv/.test(ua)) return true
  if (/iPhone|iPad/.test(ua) && !/Safari\//.test(ua) && /AppleWebKit/.test(ua)) return true
  return false
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = sb()
  const redirectTo = `${window.location.origin}/auth/callback`

  // In embedded WebViews (Instagram, Facebook, etc.) Google blocks OAuth.
  // Get the URL first and open it in the system browser.
  if (isWebView()) {
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (data?.url) {
      // Try Chrome intent on Android, fall back to window.open
      const ua = navigator.userAgent
      if (/Android/.test(ua)) {
        const intent = `intent://${data.url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(data.url)};end`
        window.location.href = intent
      } else {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      }
    }
    return
  }

  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
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
  const r = await fetch('/api/trips/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, days, startDate, theme, countries, nickname, dayMetas }),
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(body.error ?? 'Failed to create trip')
  return body.tripId
}


export async function dbGetUserTrips(userId: string): Promise<{ id: string; name: string; theme: string | null; days: number; start_date: string | null }[]> {
  const r = await fetch('/api/trips', { cache: 'no-store' })
  if (!r.ok) return []
  const data = await r.json()
  // Support both legacy array shape and new paginated { trips, nextCursor } shape
  return Array.isArray(data) ? data : (data?.trips ?? [])
}

// ─── Invitations ─────────────────────────────────────────────────────────────

export async function dbGetInvitations(): Promise<TripInvitation[]> {
  const r = await fetch('/api/invitations')
  if (!r.ok) return []
  const data = await r.json().catch(() => [])
  return Array.isArray(data) ? data : []
}

export async function dbInviteToTrip(tripId: string, invitedEmail: string): Promise<void> {
  const r = await fetch('/api/invitations/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId, invitedEmail }),
  })
  if (!r.ok) {
    const body = await r.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to send invitation')
  }
}

export async function dbAcceptInvitation(invitationId: string, userId: string, initials: string): Promise<string> {
  const r = await fetch('/api/invitations/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitationId, initials }),
  })
  const body = await r.json().catch(() => ({}))
  if (r.status === 404) throw new Error('Invitation not found')
  if (!r.ok) throw new Error('Failed to accept invitation')
  return body.tripId
}

export async function dbRejectInvitation(invitationId: string): Promise<void> {
  const r = await fetch(`/api/invitations?id=${encodeURIComponent(invitationId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbLoadTripById(tripId: string) {
  // Use the server route so the load works regardless of RLS configuration —
  // the route uses the service role key and verifies participation itself.
  const r = await fetch(`/api/trips/${tripId}`, { cache: 'no-store' })
  if (!r.ok) return null
  return await r.json()
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function dbAddEvent(tripId: string, dayNumber: number, event: TripEvent, _userId: string) {
  const res = await fetch(`/api/trips/${tripId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: event.id,
      day_index: dayNumber - 1,
      time: event.time,
      duration: event.duration,
      name: event.name,
      category: event.category,
      location: event.location ?? null,
      lat: event.lat ?? null,
      lng: event.lng ?? null,
      notes: event.notes ?? null,
      cost: event.cost ?? null,
      tags: event.tags ?? null,
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}

export async function dbEditEvent(eventId: string, updates: Partial<TripEvent> & { tripId?: string }) {
  const tripId = updates.tripId
  if (!tripId) {
    // Fallback: direct Supabase update (non-recursive tables are safe)
    const patch: Record<string, unknown> = {}
    if (updates.time      !== undefined) patch.time      = updates.time
    if (updates.duration  !== undefined) patch.duration  = updates.duration
    if (updates.name      !== undefined) patch.name      = updates.name
    if (updates.category  !== undefined) patch.category  = updates.category
    if (updates.location  !== undefined) patch.location  = updates.location
    if (updates.lat       !== undefined) patch.lat       = updates.lat
    if (updates.lng       !== undefined) patch.lng       = updates.lng
    if (updates.notes     !== undefined) patch.notes     = updates.notes
    if (updates.cost      !== undefined) patch.cost      = updates.cost
    if (updates.tags      !== undefined) patch.tags      = updates.tags
    if (updates.votes     !== undefined) patch.votes     = updates.votes
    const { error } = await sb().from('events').update(patch).eq('id', eventId)
    if (error) throw error
    return
  }
  const patch: Record<string, unknown> = {}
  if (updates.time      !== undefined) patch.time      = updates.time
  if (updates.duration  !== undefined) patch.duration  = updates.duration
  if (updates.name      !== undefined) patch.name      = updates.name
  if (updates.category  !== undefined) patch.category  = updates.category
  if (updates.location  !== undefined) patch.location  = updates.location
  if (updates.lat       !== undefined) patch.lat       = updates.lat
  if (updates.lng       !== undefined) patch.lng       = updates.lng
  if (updates.notes     !== undefined) patch.notes     = updates.notes
  if (updates.cost      !== undefined) patch.cost      = updates.cost
  if (updates.tags      !== undefined) patch.tags      = updates.tags
  if (updates.votes     !== undefined) patch.votes     = updates.votes
  const res = await fetch(`/api/trips/${tripId}/events?eventId=${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}

export async function dbUpdateEventVotes(eventId: string, votes: Record<string, 'up' | 'down'>, tripId?: string) {
  if (!tripId) {
    const { error } = await sb().from('events').update({ votes }).eq('id', eventId)
    if (error) throw error
    return
  }
  const r = await fetch(`/api/trips/${tripId}/events?eventId=${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ votes }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbDeleteEvent(eventId: string, tripId?: string) {
  if (!tripId) {
    const { error } = await sb().from('events').delete().eq('id', eventId)
    if (error) throw error
    return
  }
  const res = await fetch(`/api/trips/${tripId}/events?eventId=${eventId}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}

export async function dbMoveEvent(eventId: string, newDayNumber: number, tripId?: string) {
  if (!tripId) {
    const { error } = await sb().from('events').update({ day_index: newDayNumber - 1 }).eq('id', eventId)
    if (error) throw error
    return
  }
  const res = await fetch(`/api/trips/${tripId}/events?eventId=${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ day_index: newDayNumber - 1 }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function dbAddExpense(tripId: string, expense: Expense, _userId: string) {
  const r = await fetch(`/api/trips/${tripId}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: expense.id, description: expense.description, amount: expense.amount, splitCount: expense.splitCount }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbDeleteExpense(expenseId: string, tripId?: string) {
  if (!tripId) {
    const { error } = await sb().from('expenses').delete().eq('id', expenseId)
    if (error) throw error
    return
  }
  const r = await fetch(`/api/trips/${tripId}/expenses?id=${expenseId}`, { method: 'DELETE' })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

// ─── Supplies ────────────────────────────────────────────────────────────────

export async function dbAddSupply(tripId: string, supply: SupplyItem) {
  const r = await fetch(`/api/trips/${tripId}/supplies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: supply.id, name: supply.name, category: supply.category, checked: supply.checked, critical: supply.critical ?? false, assignee: supply.assignee ?? null }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbToggleSupply(supplyId: string, checked: boolean, tripId?: string) {
  if (!tripId) {
    const { error } = await sb().from('supplies').update({ checked }).eq('id', supplyId)
    if (error) throw error
    return
  }
  const r = await fetch(`/api/trips/${tripId}/supplies?id=${supplyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checked }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbDeleteSupply(supplyId: string, tripId?: string) {
  if (!tripId) {
    const { error } = await sb().from('supplies').delete().eq('id', supplyId)
    if (error) throw error
    return
  }
  const r = await fetch(`/api/trips/${tripId}/supplies?id=${supplyId}`, { method: 'DELETE' })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

// ─── Emergency contacts ──────────────────────────────────────────────────────

export async function dbAddEmergencyContact(tripId: string, contact: EmergencyContact) {
  const r = await fetch(`/api/trips/${tripId}/emergency-contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: contact.id, name: contact.name, phone: contact.phone, type: contact.type }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbDeleteEmergencyContact(contactId: string, tripId?: string) {
  if (!tripId) {
    const { error } = await sb().from('emergency_contacts').delete().eq('id', contactId)
    if (error) throw error
    return
  }
  const r = await fetch(`/api/trips/${tripId}/emergency-contacts?id=${contactId}`, { method: 'DELETE' })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbUpdateTripInfo(tripId: string, updates: { name?: string; days?: number; startDate?: string; countries?: string[] }) {
  const r = await fetch(`/api/trips/${tripId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbUpdateTripTheme(tripId: string, theme: string) {
  const r = await fetch(`/api/trips/${tripId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbUpdateSupplyCritical(supplyId: string, critical: boolean, tripId?: string) {
  if (!tripId) {
    const { error } = await sb().from('supplies').update({ critical }).eq('id', supplyId)
    if (error) throw error
    return
  }
  const r = await fetch(`/api/trips/${tripId}/supplies?id=${supplyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ critical }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbLeaveTrip(tripId: string, _userId: string) {
  const r = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbDeleteTrip(tripId: string) {
  const r = await fetch(`/api/trips/${tripId}?full=true`, { method: 'DELETE' })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

// ─── Trip notes ──────────────────────────────────────────────────────────────

export async function dbUpdateTripNotes(tripId: string, notes: string[]) {
  const r = await fetch(`/api/trips/${tripId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trip_notes: notes }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbUpdateHotels(tripId: string, hotels: HotelStay[]) {
  const r = await fetch(`/api/trips/${tripId}/hotels`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotels }),
  })
  if (!r.ok) {
    const body = await r.json().catch(() => ({}))
    throw new Error(body?.error ?? `hotels_save_failed (${r.status})`)
  }
}

// ─── Day meta ────────────────────────────────────────────────────────────────

export async function dbUpdateDayMeta(tripId: string, dayIndex: number, meta: Partial<DayMeta>) {
  const r = await fetch(`/api/trips/${tripId}/day-meta`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dayIndex, ...meta }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
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

export async function dbGetTripEmailInvitations(tripId: string): Promise<{ id: string; email: string; status: string; created_at: string }[]> {
  const { data, error } = await sb()
    .from('trip_invitations')
    .select('id, invited_email, status, created_at')
    .eq('trip_id', tripId)
    .not('invited_email', 'is', null)
    .eq('status', 'pending')
  if (error) return []
  return (data ?? []).map((r: any) => ({ id: r.id, email: r.invited_email, status: r.status, created_at: r.created_at }))
}

export async function dbCancelInvitation(invitationId: string): Promise<void> {
  const r = await fetch(`/api/invitations?id=${encodeURIComponent(invitationId)}`, { method: 'DELETE' })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

// ─── Privacy consents ────────────────────────────────────────────────────────

export async function dbGetPrivacyConsent(userId: string): Promise<{ content_hash: string; content: string } | null> {
  const { data } = await sb()
    .from('privacy_consents')
    .select('content_hash, content')
    .eq('user_id', userId)
    .maybeSingle()
  return (data as { content_hash: string; content: string } | null) ?? null
}

export async function dbSavePrivacyConsent(contentHash: string, content: string): Promise<void> {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await sb().from('privacy_consents').upsert(
    { user_id: user.id, accepted_at: new Date().toISOString(), content_hash: contentHash, content },
    { onConflict: 'user_id' },
  )
  if (error) throw error
}

// ─── Account deletion ────────────────────────────────────────────────────────

export async function dbDeleteAccount(): Promise<void> {
  const r = await fetch('/api/account/delete', { method: 'DELETE' })
  if (!r.ok) {
    const body = await r.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to delete account')
  }
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export async function dbAddWishlistItem(tripId: string, item: WishlistItem): Promise<void> {
  const r = await fetch(`/api/trips/${tripId}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id:       item.id,
      name:     item.name,
      category: item.category,
      location: item.location ?? null,
      lat:      item.lat ?? null,
      lng:      item.lng ?? null,
      notes:    item.notes ?? null,
      duration: item.duration ?? null,
      cost:     item.cost ?? null,
    }),
  })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

export async function dbDeleteWishlistItem(tripId: string, itemId: string): Promise<void> {
  const r = await fetch(`/api/trips/${tripId}/wishlist?itemId=${encodeURIComponent(itemId)}`, { method: 'DELETE' })
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${r.status}`) }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Reconstruct a Trip + supplies array from a DB row
export function rowToTrip(data: NonNullable<Awaited<ReturnType<typeof dbLoadTripById>>>) {
  const days = data.days ?? 1

  // Build user_id → initials map so addedBy / paidBy resolve to display names
  const userToInitials = new Map<string, string>(
    ((data.trip_participants as any[]) ?? []).map((p: any) => [p.user_id, p.initials ?? '??'])
  )

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

  // Separate wishlist items (wishlist=true, day_index=999) from real events
  const allEventRows: any[] = (data.events as any[]) ?? []
  const wishlistRows = allEventRows.filter((e: any) => e.wishlist === true)
  const regularEventRows = allEventRows.filter((e: any) => !e.wishlist)

  const wishlist: WishlistItem[] = wishlistRows.map((e: any) => ({
    id:       e.id,
    name:     e.name,
    category: (e.category ?? 'other') as Category,
    location: e.location ?? undefined,
    lat:      e.lat ?? undefined,
    lng:      e.lng ?? undefined,
    notes:    e.notes ?? undefined,
    duration: e.duration ?? undefined,
    cost:     e.cost ?? undefined,
    addedBy:  userToInitials.get(e.added_by) ?? 'Unknown',
  }))

  const events: Record<number, TripEvent[]> = {}
  for (let d = 1; d <= days; d++) {
    events[d] = regularEventRows
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
        addedBy:  userToInitials.get(e.added_by) ?? 'Unknown',
        cost:     e.cost     ?? undefined,
        tags:     e.tags     ?? undefined,
        votes:    (e.votes && typeof e.votes === 'object' ? e.votes : undefined) as Record<string, 'up' | 'down'> | undefined,
      }))
  }

  const expenses = ((data.expenses as any[]) ?? []).map((e: any) => ({
    id:          e.id,
    description: e.description,
    amount:      e.amount,
    paidBy:      userToInitials.get(e.paid_by) ?? 'Unknown',
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
    assignee: s.assignee ?? undefined,
  }))

  const trip = {
    name:              data.name,
    days,
    startDate:         data.start_date ?? new Date().toISOString().split('T')[0],
    theme:             (data.theme ?? 'desert') as TripTheme,
    countries:         (() => {
      const raw = (data as any).countries
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
    hotels:            Array.isArray((data as any).hotels) ? (data as any).hotels as HotelStay[] : [],
    participants,
    dayMeta,
    events,
    expenses,
    emergencyContacts,
    wishlist,
    createdBy: (data as any).created_by ?? undefined,
  }

  return { trip, supplies }
}
