'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AiSuggestion, Category, DayMeta, EmergencyContact, Expense, HotelStay, QueryContext, Screen, SupplyItem, Trip, TripEvent, TripInvitation, TripTheme, WishlistItem } from './types';
import { MOCK_SUPPLIES, MOCK_TRIP } from './mockData';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import {
  signOut, signInWithGoogle as dbSignInWithGoogle, getCurrentUser, getSessionUserId,
  dbCreateTrip, dbLoadTripById, rowToTrip,
  dbGetInvitations, dbInviteToTrip, dbAcceptInvitation, dbRejectInvitation,
  dbAddEvent, dbEditEvent, dbDeleteEvent, dbMoveEvent, dbLeaveTrip, dbDeleteTrip, dbUpdateEventVotes,
  dbAddExpense, dbDeleteExpense,
  dbAddSupply, dbToggleSupply, dbDeleteSupply, dbUpdateSupplyCritical,
  dbAddEmergencyContact, dbDeleteEmergencyContact,
  dbUpdateTripNotes, dbUpdateDayMeta, dbUpdateHotels,
  dbUpdateTripInfo as dbSyncTripInfo, dbUpdateTripTheme,
  dbGetPrivacyConsent, dbSavePrivacyConsent, TERMS_VERSION,
  dbDeleteAccount,
  dbAddWishlistItem, dbDeleteWishlistItem,
} from './db';

interface AppState {
  screen: Screen;
  termsChecked: boolean;
  trip: Trip | null;
  nickname: string;
  activeDay: number;
  supplies: SupplyItem[];
  showAddEvent: boolean;
  showSuggestions: boolean;
  showTour: boolean;
  activeGapStart: number | null;
  activeGapEnd: number | null;
  aiSuggestions: AiSuggestion[];
  themeMode: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  hideBudget: boolean;
  showCarbonBudget: boolean;
  hideTravelVault: boolean;
  dayEndHour: number;
  currencyByTrip: Record<string, string>; // tripDbId → currency code

  // Supabase identity
  userId: string | null;
  tripDbId: string | null;
  authUser: { id: string; username: string } | null;
  tripEntryCountries: string[] | null;
  demoClickCount: number;
  lastSyncError: string | null;
  pendingInvitations: TripInvitation[];
  termsAccepted: boolean;
  /** Unix ms of last login — used for 2-day session reminder window */
  lastSessionAt: number | null;

  // Actions
  setScreen: (s: Screen) => void;
  acceptTerms: (contentHash: string, content: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  clearTripEntry: () => void;
  recordDemoClick: () => void;
  loadDemoTrip: () => void;
  loadTripById: (tripId: string, opts?: { showLoader?: boolean; showEntry?: boolean; navigate?: boolean }) => Promise<void>;
  createTrip: (name: string, days: number, nickname: string, theme?: TripTheme, startDate?: string, countries?: string[], currency?: string) => Promise<void>;
  loadInvitations: () => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  inviteToTrip: (email: string) => Promise<void>;
  createInviteLink: () => Promise<string>;
  /** Permanently delete all personal data and auth account. Shared trip content stays for co-participants. */
  deleteAccount: () => Promise<void>;
  /** Sign completely out of Supabase. Does NOT remove the user from the trip. */
  logout: () => void;
  /** Keep auth but unload the current trip so the user can pick another. */
  switchTrip: () => void;
  /** Remove the user from this trip's participant list, then unload it. */
  leaveTrip: () => Promise<void>;
  /** Permanently delete the entire trip from the DB (owner only). */
  deleteTrip: () => Promise<void>;
  setActiveDay: (day: number) => void;
  setNickname: (n: string) => void;
  updateTripInfo: (updates: { name?: string; days?: number; startDate?: string; countries?: string[] }) => void;
  updateTheme: (theme: TripTheme) => void;
  updateDayMeta: (dayIndex: number, meta: Partial<DayMeta>) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleHideBudget: () => void;
  toggleShowCarbonBudget: () => void;
  toggleHideTravelVault: () => void;
  setDayEndHour: (h: number) => void;
  setCurrency: (code: string) => void;

  addEvent: (dayNumber: number, event: Omit<TripEvent, 'id' | 'addedBy'>) => void;
  editEvent: (dayNumber: number, eventId: string, updates: Partial<TripEvent>) => void;
  deleteEvent: (dayNumber: number, eventId: string) => void;
  moveEvent: (fromDay: number, toDay: number, eventId: string) => void;

  addHotel: (hotel: Omit<HotelStay, 'id'>) => void;
  editHotel: (id: string, updates: Partial<Omit<HotelStay, 'id'>>) => void;
  deleteHotel: (id: string) => void;

  voteEvent: (dayNumber: number, eventId: string, nickname: string, vote: 'up' | 'down') => void;

  toggleSupply: (id: string) => void;
  addSupplyItem: (name: string, category: SupplyItem['category'], assignee?: string, critical?: boolean) => void;
  deleteSupplyItem: (id: string) => void;
  toggleSupplyCritical: (id: string) => void;

  addTripNote: (note: string) => void;
  deleteTripNote: (index: number) => void;

  addExpense: (exp: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  deleteEmergencyContact: (id: string) => void;

  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'addedBy'>) => void;
  deleteWishlistItem: (id: string) => void;
  scheduleWishlistItem: (id: string, dayNumber: number, time: string) => void;

  setShowAddEvent: (v: boolean) => void;
  setShowSuggestions: (v: boolean, gapStart?: number, gapEnd?: number) => void;
  setShowTour: (v: boolean) => void;
  setAiSuggestions: (suggestions: AiSuggestion[]) => void;
  addSuggestionToDay: (dayNumber: number, suggId: string) => void;

  // Persona prompt (AI recommendation engine)
  showPersona: boolean;
  personaContext: QueryContext | null;
  setShowPersona: (v: boolean) => void;
  setPersonaContext: (ctx: QueryContext | null) => void;

  // Real-time: subscribe to DB changes on a trip, returns unsubscribe fn
  subscribeToTrip: (tripId: string) => () => void;

  // Global loading overlay
  isGlobalLoading: boolean;
  setGlobalLoading: (v: boolean) => void;

  // Tracks event IDs currently being deleted — prevents loadTripById from restoring them
  // during the in-flight DB call (race condition with realtime subscription)
  pendingDeleteIds: string[];

  // Smart budget alerts — set by addExpense, cleared by BudgetAlertWatcher after toast shown
  lastBudgetAlert: { type: 'over' | 'eighty'; amount: number; remaining: number } | null;

  // Actions
  setTripBudget: (budget: number) => void;

  // Offline mode
  isOffline: boolean;
  pendingChanges: OfflineChange[];
  /** Number of DB writes currently in-flight. >0 means "saving…" */
  pendingWriteCount: number;
  setIsOffline: (v: boolean) => void;
  addPendingChange: (change: OfflineChange) => void;
  flushPendingChanges: () => Promise<void>;
}

export interface OfflineChange {
  type: 'addEvent' | 'editEvent' | 'deleteEvent' | 'moveEvent' | 'addExpense' | 'deleteExpense' | 'addSupply' | 'deleteSupply' | 'toggleSupply' | 'updateDayMeta' | 'updateTripInfo';
  payload: Record<string, unknown>;
  tripId: string;
  userId: string;
  timestamp: number;
}

const uid = () => crypto.randomUUID();

// Merges locally-pending events (not yet in DB) and local votes into a DB-loaded trip.
// Also re-fires dbAddEvent for any pending events so they get synced now.
function mergeLocalIntoDbTrip(
  dbTrip: Trip,
  localTrip: Trip | null,
  tripDbId: string,
  userId: string,
  onSyncError: (msg: string) => void,
): Trip {
  if (!localTrip) return dbTrip;
  const mergedEvents = { ...dbTrip.events };
  for (const [dayKey, localEvs] of Object.entries(localTrip.events ?? {})) {
    const day = Number(dayKey);
    const dbIds = new Set((mergedEvents[day] ?? []).map((e: TripEvent) => e.id));
    // Events only in localStorage (DB write failed or pending) — re-sync them
    const pending = (localEvs as TripEvent[]).filter(e => !dbIds.has(e.id));
    if (pending.length > 0) {
      mergedEvents[day] = [...(mergedEvents[day] ?? []), ...pending];
      for (const ev of pending) {
        dbAddEvent(tripDbId, day, ev, userId)
          .catch(err => onSyncError(err?.message ?? 'save_failed'));
      }
    }
    // Merge votes: prefer DB votes when present, fall back to local votes
    mergedEvents[day] = (mergedEvents[day] ?? []).map((dbEv: TripEvent) => {
      const localEv = (localEvs as TripEvent[]).find(l => l.id === dbEv.id);
      const mergedVotes = { ...(localEv?.votes ?? {}), ...(dbEv.votes ?? {}) };
      return Object.keys(mergedVotes).length > 0 ? { ...dbEv, votes: mergedVotes } : dbEv;
    });
  }
  return { ...dbTrip, events: mergedEvents };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      screen: 'splash',
      termsChecked: false,
      trip: null,
      nickname: '',
      activeDay: 1,
      supplies: [],
      showAddEvent: false,
      showSuggestions: false,
      showPersona: false,
      personaContext: null,
      showTour: false,
      activeGapStart: null,
      activeGapEnd: null,
      aiSuggestions: [],
      themeMode: 'system' as const,
      highContrast: false,
      reducedMotion: false,
      hideBudget: false,
      showCarbonBudget: false,
      hideTravelVault: false,
      dayEndHour: 23,
      currencyByTrip: {},
      userId: null,
      tripDbId: null,
      authUser: null,
      tripEntryCountries: null,
      demoClickCount: 0,
      lastSyncError: null,
      pendingInvitations: [],
      termsAccepted: false,
      lastSessionAt: null,
      isOffline: false,
      pendingChanges: [],
      pendingWriteCount: 0,
      isGlobalLoading: false,
      pendingDeleteIds: [],
      lastBudgetAlert: null,

      acceptTerms: async (contentHash, content) => {
        try { await dbSavePrivacyConsent(contentHash, content) } catch {}
        set({ termsAccepted: true })
      },
      setScreen: (s) => set({ screen: s }),
      checkAuth: async () => {
        const user = await getCurrentUser()
        // Don't reset authUser to null here — sign-out is handled by onAuthStateChange in AppShell.
        // Only update the store when a user is actually found.
        if (!user) return

        const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
        const { termsAccepted: persistedTerms, lastSessionAt } = get();
        const sessionExpired = lastSessionAt !== null && Date.now() - lastSessionAt > TWO_DAYS_MS;

        // Set identity immediately so auth-dependent effects (join-link, terms) can proceed.
        // If the session is stale, clear tripDbId so the boot effect doesn't load an old trip.
        set({
          authUser: user, userId: user.id, lastSessionAt: Date.now(),
          ...(sessionExpired ? { tripDbId: null, trip: null } : {}),
        })

        // Terms check only — trip loading is handled reactively by AppShell's boot effect
        // when authUser is set, ensuring a single load path with no duplicate DB calls.
        try {
          const consent = await dbGetPrivacyConsent(user.id)
          const termsAccepted = consent !== null ? consent.content_hash === TERMS_VERSION : persistedTerms
          set({ termsAccepted, termsChecked: true })
        } catch {
          set({ termsAccepted: persistedTerms, termsChecked: true })
        }
      },
      signInWithGoogle: async () => { await dbSignInWithGoogle() },

      loadDemoTrip: () => {
        set({
          showTour: !localStorage.getItem('trippy-tour-done'),
          trip: MOCK_TRIP,
          supplies: MOCK_SUPPLIES,
          nickname: 'Traveler',
          screen: 'dashboard',
          activeDay: 1,
          tripDbId: null,
        });
      },
      loadInvitations: async () => {
        try {
          const invitations = await dbGetInvitations()
          set({ pendingInvitations: invitations })
        } catch { /* silently ignore */ }
      },
      acceptInvitation: async (invitationId) => {
        const { authUser } = get()
        if (!authUser) throw new Error('Not authenticated')
        const initials = authUser.username.slice(0, 2).toUpperCase()
        const tripId = await dbAcceptInvitation(invitationId, authUser.id, initials)
        set(s => ({ pendingInvitations: s.pendingInvitations.filter(i => i.id !== invitationId) }))
        await get().loadTripById(tripId)
      },
      rejectInvitation: async (invitationId) => {
        await dbRejectInvitation(invitationId)
        set(s => ({ pendingInvitations: s.pendingInvitations.filter(i => i.id !== invitationId) }))
      },
      inviteToTrip: async (email) => {
        const { tripDbId } = get()
        if (!tripDbId) throw new Error('No active trip')
        await dbInviteToTrip(tripDbId, email)
      },
      createInviteLink: async () => {
        const { tripDbId } = get()
        if (!tripDbId) throw new Error('No active trip')
        const r = await fetch(`/api/trips/${tripDbId}/invite-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error ?? 'Failed to create invite link')
        return `${window.location.origin}/join/${body.token}`
      },
      clearTripEntry: () => set({ tripEntryCountries: null }),
      recordDemoClick: () => set(s => ({ demoClickCount: s.demoClickCount + 1 })),
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleHighContrast: () => set(s => ({ highContrast: !s.highContrast })),
      toggleReducedMotion: () => set(s => ({ reducedMotion: !s.reducedMotion })),
      toggleHideBudget: () => set(s => ({ hideBudget: !s.hideBudget })),
      toggleShowCarbonBudget: () => set(s => ({ showCarbonBudget: !s.showCarbonBudget })),
      toggleHideTravelVault: () => set(s => ({ hideTravelVault: !s.hideTravelVault })),
      setDayEndHour: (h) => set({ dayEndHour: h }),
      setCurrency: (code) => set(s => ({
        currencyByTrip: { ...s.currencyByTrip, ...(s.tripDbId ? { [s.tripDbId]: code } : {}) },
      })),


      loadTripById: async (tripId, { showLoader = true, showEntry = false, navigate = true } = {}) => {
        const { authUser, trip: localTrip, tripDbId: localTripDbId, nickname: storedNickname } = get();
        // Preserve any custom nickname the user already set; only fall back to authUser.username on first load
        const nickname = storedNickname || (authUser?.username ?? 'Traveler');
        let userId = authUser?.id ?? null;
        if (!userId) userId = await getSessionUserId();
        if (!userId) throw new Error('not_authed');
        // Show the full-screen loader only for explicit user-triggered navigations.
        // Background refreshes (realtime, reconnect, boot) pass showLoader=false so the UI
        // never double-loads behind the splash screen or flashes blank mid-session.
        if (showLoader) set({ isGlobalLoading: true });
        try {
          const data = await dbLoadTripById(tripId);
          if (!data) throw new Error('not_found');
          const { trip: dbTrip, supplies } = rowToTrip(data);
          // If this is the same trip we had locally, merge pending events before overwriting
          const isSameTrip = localTripDbId === data.id;
          let trip = isSameTrip
            ? mergeLocalIntoDbTrip(dbTrip, localTrip, data.id, userId, msg => console.warn('[bgSync] pending event failed:', msg))
            : dbTrip;
          // Filter out events that are currently being deleted (prevents race condition
          // where realtime subscription triggers loadTripById before DB delete commits)
          const { pendingDeleteIds } = get();
          if (pendingDeleteIds.length > 0) {
            const deleteSet = new Set(pendingDeleteIds);
            const filteredEvents: Record<number, TripEvent[]> = {};
            for (const [day, evs] of Object.entries(trip.events)) {
              filteredEvents[Number(day)] = (evs as TripEvent[]).filter(e => !deleteSet.has(e.id));
            }
            trip = { ...trip, events: filteredEvents };
          }
          const { screen: currentScreen } = get();
          // When navigate=false (silent boot load), keep the current screen unchanged.
          // Otherwise navigate to dashboard unless already inside the app on a non-auth screen.
          const AUTH_SCREENS: string[] = ['home', 'splash', 'welcome'];
          const navUpdate = !navigate
            ? {}
            : isSameTrip && !AUTH_SCREENS.includes(currentScreen)
              ? {}  // preserve current screen/activeDay when refreshing an already-open trip
              : { screen: 'dashboard' as const, activeDay: 1 };
          set({
            userId,
            tripDbId: data.id,
            trip,
            supplies,
            nickname,
            ...navUpdate,
            tripEntryCountries: navigate && (showEntry || !isSameTrip) && trip.countries?.length ? trip.countries : null,
            isGlobalLoading: false,
          });
          // Flush any writes that failed in a previous session for this trip.
          // Run after state is settled so the retry uses the correct tripDbId.
          const { pendingChanges } = get();
          if (pendingChanges.some(c => c.tripId === data.id)) {
            get().flushPendingChanges().catch(() => {});
          }
        } catch (err: any) {
          set({ isGlobalLoading: false });
          throw err?.message === 'not_authed' || err?.message === 'not_found' ? err : new Error('load_failed');
        }
      },

      createTrip: async (name, days, nickname, theme = 'desert', startDate, countries, currency = 'USD') => {
        const defaultEmoji = theme === 'city' ? 'museum' : theme === 'beach' ? 'beach' : theme === 'nature' ? 'pine_tree' : theme === 'mountain' ? 'mountain' : theme === 'snow' ? 'snow' : 'compass';

        const dayMetas: DayMeta[] = Array.from({ length: days }, (_, i) => ({
          region: `Day ${i + 1}`, emoji: defaultEmoji, lat: 31, lng: 35, desc: '',
        }));

        // Save to DB first — throws on failure so LoginScreen can show a meaningful error
        const userId = await getSessionUserId();
        if (!userId) throw new Error('Not authenticated');

        const newTrip: Trip = {
          name,
          days,
          theme,
          countries: countries?.length ? countries : undefined,
          startDate: startDate || new Date().toISOString().split('T')[0],
          participants: [{ id: 1, name: nickname || 'You', initials: (nickname || 'Y').slice(0, 2).toUpperCase(), color: 'oklch(62% 0.15 195)' }],
          dayMeta: dayMetas,
          events: Object.fromEntries(Array.from({ length: days }, (_, i) => [i + 1, []])),
          createdBy: userId,
        };
        set({ isGlobalLoading: true });
        try {
          const tripDbId = await dbCreateTrip(userId, name, days, newTrip.startDate, theme, dayMetas, nickname, countries);
          set(s => ({
            userId, tripDbId, trip: newTrip,
            nickname: nickname || 'Traveler',
            screen: 'dashboard', activeDay: 1, supplies: [],
            tripEntryCountries: countries?.length ? countries : null,
            currencyByTrip: { ...s.currencyByTrip, [tripDbId]: currency },
            isGlobalLoading: false,
          }));
        } catch (err) {
          set({ isGlobalLoading: false });
          throw err;
        }
      },

      deleteAccount: async () => {
        await dbDeleteAccount();
        if (typeof document !== 'undefined') {
          document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            if (name.startsWith('sb-')) {
              document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
            }
          });
        }
        set({ screen: 'welcome', trip: null, tripDbId: null, supplies: [], activeDay: 1, aiSuggestions: [], userId: null, authUser: null, nickname: '', termsAccepted: false, lastSessionAt: null });
      },

      // Full sign-out — does NOT remove the user from the trip so they can rejoin later
      logout: () => {
        // Fire signOut without awaiting — prevents UI freeze when the Supabase API
        // is slow or unreachable; local cleanup below is what actually logs the user out.
        signOut().catch(() => {});

        // Clear every sb-* cookie (Supabase session tokens).
        // Also clear from localStorage in case createBrowserClient wrote there.
        if (typeof document !== 'undefined') {
          document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            if (name.startsWith('sb-')) {
              document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
              document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; Secure`;
            }
          });
        }
        if (typeof localStorage !== 'undefined') {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) localStorage.removeItem(key);
          });
        }

        set({ screen: 'splash', trip: null, tripDbId: null, supplies: [], activeDay: 1, aiSuggestions: [], userId: null, authUser: null, nickname: '', termsAccepted: false, termsChecked: false, lastSessionAt: null });
        if (typeof window !== 'undefined') window.location.href = '/';
      },

      // Keep the Supabase session but go back to the trip picker
      switchTrip: () => {
        set({ trip: null, tripDbId: null, nickname: '', screen: 'home', activeDay: 1, aiSuggestions: [] });
      },

      // Permanently remove the user from this trip's participant list
      leaveTrip: async () => {
        const { tripDbId, userId } = get();
        if (tripDbId && userId) await dbLeaveTrip(tripDbId, userId);
        set({ trip: null, tripDbId: null, nickname: '', screen: 'home', activeDay: 1, aiSuggestions: [] });
      },

      // Permanently delete the entire trip (owner only)
      deleteTrip: async () => {
        const { tripDbId } = get();
        if (tripDbId) await dbDeleteTrip(tripDbId);
        set({ trip: null, tripDbId: null, nickname: '', screen: 'home', activeDay: 1, aiSuggestions: [] });
      },

      setActiveDay: (day) => set({ activeDay: day }),
      setNickname: (n) => set({ nickname: n }),

      updateTripInfo: ({ name, days, startDate, countries }) => set((s) => {
        if (!s.trip) return {};
        const trip = { ...s.trip };
        if (name !== undefined)      trip.name      = name;
        if (startDate !== undefined) trip.startDate = startDate;
        if (countries !== undefined) trip.countries = countries;
        if (days !== undefined && days >= 1 && days <= 90) {
          const old = trip.days;
          trip.days = days;
          if (days > old) {
            const defaultEmoji = trip.theme === 'city' ? '🏙️' : trip.theme === 'beach' ? '🏖️' : trip.theme === 'nature' ? '🌲' : '🏔️';
            const extraMeta = Array.from({ length: days - old }, (_, i) => ({
              region: `Day ${old + i + 1}`, emoji: defaultEmoji, lat: 31, lng: 35, desc: '',
            }));
            trip.dayMeta = [...trip.dayMeta, ...extraMeta];
            const extraEvents: Record<number, TripEvent[]> = {};
            for (let d = old + 1; d <= days; d++) extraEvents[d] = [];
            trip.events = { ...trip.events, ...extraEvents };
          } else if (days < old) {
            trip.dayMeta = trip.dayMeta.slice(0, days);
            const trimmedEvents: Record<number, TripEvent[]> = {};
            for (let d = 1; d <= days; d++) trimmedEvents[d] = trip.events[d] ?? [];
            trip.events = trimmedEvents;
          }
        }
        const { tripDbId } = s;
        if (tripDbId) dbSyncTripInfo(tripDbId, { name, days, startDate, countries }).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
        const newState: Partial<AppState> = { trip };
        if (days !== undefined && s.activeDay > trip.days) newState.activeDay = trip.days;
        return newState;
      }),

      updateTheme: (theme) => set((s) => {
        const { tripDbId } = s;
        if (tripDbId) dbUpdateTripTheme(tripDbId, theme).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
        return { trip: s.trip ? { ...s.trip, theme } : null };
      }),

      updateDayMeta: (dayIndex, meta) => set((s) => {
        if (!s.trip) return {};
        const dayMeta = [...s.trip.dayMeta];
        dayMeta[dayIndex] = { ...dayMeta[dayIndex], ...meta };
        const { tripDbId } = s;
        if (tripDbId) dbUpdateDayMeta(tripDbId, dayIndex, meta).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
        return { trip: { ...s.trip, dayMeta } };
      }),

      addEvent: (dayNumber, event) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const newEvent: TripEvent = { ...event, id: uid(), addedBy: get().nickname || 'You' };
        const dayEvents = [...(trip.events[dayNumber] || []), newEvent];
        set(s => ({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } }, pendingWriteCount: s.pendingWriteCount + 1 }));
        if (tripDbId) {
          getSessionUserId().then(sessionUserId => {
            if (!sessionUserId) { set(s => ({ lastSyncError: 'not_authed', pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) })); return; }
            if (sessionUserId !== get().userId) set({ userId: sessionUserId });
            return dbAddEvent(tripDbId, dayNumber, newEvent, sessionUserId);
          }).then(() => {
            set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
          }).catch(err => {
            console.error('[addEvent] DB sync failed:', err);
            const { userId } = get();
            if (tripDbId && userId) {
              get().addPendingChange({ type: 'addEvent', payload: { dayNumber, event: newEvent }, tripId: tripDbId, userId, timestamp: Date.now() });
            }
            set(s => ({ lastSyncError: err?.message ?? 'save_failed', pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
          });
        } else {
          set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
        }
      },

      editEvent: (dayNumber, eventId, updates) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const dayEvents = (trip.events[dayNumber] || []).map(e => e.id === eventId ? { ...e, ...updates } : e);
        set(s => ({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } }, pendingWriteCount: s.pendingWriteCount + 1 }));
        if (tripDbId) {
          dbEditEvent(eventId, { ...updates, tripId: tripDbId })
            .then(() => set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) })))
            .catch(err => {
              console.error('[editEvent] DB sync failed:', err);
              const { userId } = get();
              if (userId) {
                get().addPendingChange({ type: 'editEvent', payload: { dayNumber, eventId, updates }, tripId: tripDbId, userId, timestamp: Date.now() });
              }
              set(s => ({ lastSyncError: err?.message ?? 'sync_failed', pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
            });
        } else {
          set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
        }
      },

      deleteEvent: (dayNumber, eventId) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const originalEvents = trip.events[dayNumber] || [];
        const dayEvents = originalEvents.filter(e => e.id !== eventId);
        // Add to pendingDeleteIds before local state update so loadTripById cannot restore it
        set(s => s.trip ? ({
          trip: { ...s.trip, events: { ...s.trip.events, [dayNumber]: dayEvents } },
          pendingDeleteIds: [...s.pendingDeleteIds, eventId],
        }) : { pendingDeleteIds: [...s.pendingDeleteIds, eventId] });
        if (tripDbId) {
          dbDeleteEvent(eventId, tripDbId)
            .then(() => {
              set(s => ({ pendingDeleteIds: s.pendingDeleteIds.filter(id => id !== eventId) }));
            })
            .catch(err => {
              console.error('[deleteEvent] DB sync failed:', err);
              // Rollback: restore the event into its day
              set(s => {
                const currentDay = s.trip?.events[dayNumber] || [];
                const victim = originalEvents.find(e => e.id === eventId);
                const updatedDay = victim && !currentDay.some(e => e.id === eventId)
                  ? [...currentDay, victim]
                  : currentDay;
                return {
                  trip: s.trip ? { ...s.trip, events: { ...s.trip.events, [dayNumber]: updatedDay } } : null,
                  pendingDeleteIds: s.pendingDeleteIds.filter(id => id !== eventId),
                  lastSyncError: err?.message ?? 'sync_failed',
                };
              });
            });
        } else {
          set(s => ({ pendingDeleteIds: s.pendingDeleteIds.filter(id => id !== eventId) }));
        }
      },

      moveEvent: (fromDay, toDay, eventId) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const event = (trip.events[fromDay] ?? []).find(e => e.id === eventId);
        if (!event) return;
        const fromEvents = (trip.events[fromDay] ?? []).filter(e => e.id !== eventId);
        const toEvents = [...(trip.events[toDay] ?? []), event];
        set({ trip: { ...trip, events: { ...trip.events, [fromDay]: fromEvents, [toDay]: toEvents } } });
        if (tripDbId) {
          dbMoveEvent(eventId, toDay, tripDbId).catch(err => {
            console.error('[moveEvent] DB sync failed:', err);
            set({ lastSyncError: err?.message ?? 'sync_failed' });
          });
        }
      },

      addHotel: (hotel) => {
        const { tripDbId } = get();
        const newHotel: HotelStay = { ...hotel, id: uid() };
        set(s => {
          const trip = s.trip ? { ...s.trip, hotels: [...(s.trip.hotels ?? []), newHotel] } : null;
          if (tripDbId && trip?.hotels) {
            dbUpdateHotels(tripDbId, trip.hotels).catch(err => {
              console.error('[addHotel] DB sync failed:', err);
              // Only show error if still on the same trip (avoid stale async errors on trip switch)
              if (get().tripDbId === tripDbId) set({ lastSyncError: err?.message ?? 'save_failed' });
            });
          }
          return { trip };
        });
      },

      editHotel: (id, updates) => {
        const { tripDbId } = get();
        set(s => {
          const trip = s.trip ? { ...s.trip, hotels: (s.trip.hotels ?? []).map(h => h.id === id ? { ...h, ...updates } : h) } : null;
          if (tripDbId && trip?.hotels) {
            dbUpdateHotels(tripDbId, trip.hotels).catch(err => {
              console.error('[editHotel] DB sync failed:', err);
              if (get().tripDbId === tripDbId) set({ lastSyncError: err?.message ?? 'save_failed' });
            });
          }
          return { trip };
        });
      },

      deleteHotel: (id) => {
        const { tripDbId } = get();
        set(s => {
          const hotels = (s.trip?.hotels ?? []).filter(h => h.id !== id);
          const trip = s.trip ? { ...s.trip, hotels } : null;
          if (tripDbId) {
            dbUpdateHotels(tripDbId, hotels).catch(err => {
              console.error('[deleteHotel] DB sync failed:', err);
              if (get().tripDbId === tripDbId) set({ lastSyncError: err?.message ?? 'save_failed' });
            });
          }
          return { trip };
        });
      },

      voteEvent: (dayNumber, eventId, nickname, vote) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        let updatedVotes: Record<string, 'up' | 'down'> = {};
        const dayEvents = (trip.events[dayNumber] || []).map(e => {
          if (e.id !== eventId) return e;
          const votes = { ...(e.votes ?? {}) };
          if (votes[nickname] === vote) delete votes[nickname];
          else votes[nickname] = vote;
          updatedVotes = votes;
          return { ...e, votes };
        });
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } } });
        if (tripDbId) {
          dbUpdateEventVotes(eventId, updatedVotes, tripDbId).catch(err => {
            set({ lastSyncError: err?.message ?? 'vote_sync_failed' });
          });
        }
      },

      toggleSupply: (id) => {
        const { tripDbId } = get();
        let checked = false;
        set(s => {
          const supplies = s.supplies.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
          checked = supplies.find(i => i.id === id)?.checked ?? false;
          return { supplies, pendingWriteCount: s.pendingWriteCount + 1 };
        });
        if (tripDbId) {
          dbToggleSupply(id, checked, tripDbId)
            .then(() => set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) })))
            .catch(err => {
              const { userId } = get();
              if (userId) get().addPendingChange({ type: 'toggleSupply', payload: { supplyId: id, checked }, tripId: tripDbId, userId, timestamp: Date.now() });
              set(s => ({ lastSyncError: err?.message ?? 'save_failed', pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
            });
        } else {
          set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
        }
      },

      addSupplyItem: (name, category, assignee, critical) => {
        const { tripDbId } = get();
        const newItem: SupplyItem = { id: uid(), name, category, checked: false, assignee, critical: critical ?? false };
        set(s => ({ supplies: [...s.supplies, newItem], pendingWriteCount: s.pendingWriteCount + 1 }));
        if (tripDbId) {
          dbAddSupply(tripDbId, newItem)
            .then(() => set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) })))
            .catch(err => {
              const { userId } = get();
              if (userId) get().addPendingChange({ type: 'addSupply', payload: { item: newItem }, tripId: tripDbId, userId, timestamp: Date.now() });
              set(s => ({ lastSyncError: err?.message ?? 'save_failed', pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
            });
        } else {
          set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
        }
      },

      deleteSupplyItem: (id) => {
        const { tripDbId } = get();
        set(s => ({ supplies: s.supplies.filter(i => i.id !== id), pendingWriteCount: s.pendingWriteCount + 1 }));
        if (tripDbId) {
          dbDeleteSupply(id, tripDbId)
            .then(() => set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) })))
            .catch(err => {
              const { userId } = get();
              if (userId) get().addPendingChange({ type: 'deleteSupply', payload: { supplyId: id }, tripId: tripDbId, userId, timestamp: Date.now() });
              set(s => ({ lastSyncError: err?.message ?? 'save_failed', pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
            });
        } else {
          set(s => ({ pendingWriteCount: Math.max(0, s.pendingWriteCount - 1) }));
        }
      },

      toggleSupplyCritical: (id) => set(s => {
        const supplies = s.supplies.map(i => i.id === id ? { ...i, critical: !i.critical } : i);
        const item = supplies.find(i => i.id === id);
        if (s.tripDbId && item) dbUpdateSupplyCritical(id, item.critical ?? false, s.tripDbId).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
        return { supplies };
      }),

      addTripNote: (note) => {
        const { tripDbId } = get();
        set(s => {
          const trip = s.trip ? { ...s.trip, tripNotes: [...(s.trip.tripNotes ?? []), note] } : null;
          if (tripDbId && trip?.tripNotes) dbUpdateTripNotes(tripDbId, trip.tripNotes).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
          return { trip };
        });
      },

      deleteTripNote: (index) => {
        const { tripDbId } = get();
        set(s => {
          const trip = s.trip ? { ...s.trip, tripNotes: (s.trip.tripNotes ?? []).filter((_, i) => i !== index) } : null;
          if (tripDbId && trip?.tripNotes) dbUpdateTripNotes(tripDbId, trip.tripNotes).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
          return { trip };
        });
      },

      addExpense: (exp) => {
        const { userId, tripDbId, trip } = get();
        const newExp: Expense = { ...exp, id: uid() };
        set(s => ({
          trip: s.trip ? { ...s.trip, expenses: [...(s.trip.expenses ?? []), newExp] } : null,
        }));
        if (tripDbId && userId) dbAddExpense(tripDbId, newExp, userId).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));

        // Smart Budget Alerts — fire when crossing 80% or 100% of budget limit
        const budget = trip?.budget ?? 0;
        if (budget > 0) {
          const prevTotal = (trip?.expenses ?? []).reduce((s, e) => s + e.amount, 0);
          const newTotal  = prevTotal + newExp.amount;
          const prevPct   = prevTotal / budget;
          const newPct    = newTotal  / budget;
          if (newPct >= 1.0 && prevPct < 1.0) {
            set({ lastBudgetAlert: { type: 'over', amount: newTotal, remaining: newTotal - budget } });
          } else if (newPct >= 0.8 && prevPct < 0.8) {
            set({ lastBudgetAlert: { type: 'eighty', amount: newTotal, remaining: budget - newTotal } });
          }
        }
      },

      setTripBudget: (budget) => {
        set(s => ({ trip: s.trip ? { ...s.trip, budget } : null }));
      },

      deleteExpense: (id) => {
        const { tripDbId } = get();
        set(s => ({
          trip: s.trip ? { ...s.trip, expenses: (s.trip.expenses ?? []).filter(e => e.id !== id) } : null,
        }));
        if (tripDbId) dbDeleteExpense(id, tripDbId).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      addEmergencyContact: (contact) => {
        const { tripDbId } = get();
        const newContact: EmergencyContact = { ...contact, id: uid() };
        set(s => ({
          trip: s.trip ? { ...s.trip, emergencyContacts: [...(s.trip.emergencyContacts ?? []), newContact] } : null,
        }));
        if (tripDbId) dbAddEmergencyContact(tripDbId, newContact).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      deleteEmergencyContact: (id) => {
        const { tripDbId } = get();
        set(s => ({
          trip: s.trip ? { ...s.trip, emergencyContacts: (s.trip.emergencyContacts ?? []).filter(c => c.id !== id) } : null,
        }));
        if (tripDbId) dbDeleteEmergencyContact(id, tripDbId).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      addWishlistItem: (item) => {
        const { authUser, tripDbId } = get();
        const newItem: WishlistItem = { ...item, id: uid(), addedBy: authUser?.username ?? 'Me' };
        set(s => ({
          trip: s.trip ? { ...s.trip, wishlist: [...(s.trip.wishlist ?? []), newItem] } : null,
        }));
        if (tripDbId) dbAddWishlistItem(tripDbId, newItem).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      deleteWishlistItem: (id) => {
        const { tripDbId } = get();
        set(s => ({
          trip: s.trip ? { ...s.trip, wishlist: (s.trip.wishlist ?? []).filter(w => w.id !== id) } : null,
        }));
        if (tripDbId) dbDeleteWishlistItem(tripDbId, id).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      scheduleWishlistItem: (id, dayNumber, time) => {
        const { trip } = get();
        if (!trip) return;
        const item = (trip.wishlist ?? []).find(w => w.id === id);
        if (!item) return;
        // Add to the day as a regular event
        get().addEvent(dayNumber, {
          time,
          duration: item.duration ?? 60,
          name: item.name,
          category: item.category,
          location: item.location,
          lat: item.lat,
          lng: item.lng,
          cost: item.cost,
          notes: item.notes,
        });
        // Remove from wishlist
        get().deleteWishlistItem(id);
      },

      setShowAddEvent: (v) => set({ showAddEvent: v }),
      setShowTour: (v) => {
        if (!v && typeof window !== 'undefined') localStorage.setItem('trippy-tour-done', '1');
        set({ showTour: v });
      },
      setShowSuggestions: (v, gapStart, gapEnd) => set({ showSuggestions: v, activeGapStart: gapStart ?? null, activeGapEnd: gapEnd ?? null }),
      setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
      setShowPersona: (v) => set({ showPersona: v }),
      setPersonaContext: (ctx) => set({ personaContext: ctx }),

      addSuggestionToDay: (dayNumber, suggId) => {
        const { trip, aiSuggestions, userId, tripDbId } = get();
        if (!trip) return;
        const sugg = aiSuggestions.find(s => s.id === suggId);
        if (!sugg) return;
        const newEvent: TripEvent = {
          id: uid(),
          time: sugg.time,
          duration: sugg.duration,
          name: sugg.name,
          category: sugg.category as Category,
          addedBy: get().nickname || 'AI',
          cost: sugg.cost,
          location: sugg.location,
        };
        const dayEvents = [...(trip.events[dayNumber] || []), newEvent];
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } }, showSuggestions: false });
        if (tripDbId) {
          getSessionUserId().then(sessionUserId => {
            if (!sessionUserId) { set({ lastSyncError: 'not_authed' }); return; }
            return dbAddEvent(tripDbId, dayNumber, newEvent, sessionUserId);
          }).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
        }
      },

      subscribeToTrip: (tripId: string) => {
        const supabase = createSupabaseClient();

        // Debounced reload — multiple tables changing at once (e.g. event + trip metadata)
        // should produce only ONE reload. 150 ms batches burst inserts while staying responsive.
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        let pollTimer: ReturnType<typeof setInterval> | null = null;

        const scheduleReload = () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            debounceTimer = null;
            // Skip reload if the store is already mid-load (prevents cascade)
            if (get().isGlobalLoading) return;
            get().loadTripById(tripId, { showLoader: false }).catch(() => {});
          }, 150);
        };

        const startPolling = () => {
          if (pollTimer) return; // already polling
          // Poll every 30 s as a fallback when WebSocket is unavailable (e.g. Brave shields)
          pollTimer = setInterval(() => {
            if (!get().isGlobalLoading && get().tripDbId === tripId) {
              get().loadTripById(tripId, { showLoader: false }).catch(() => {});
            }
          }, 30_000);
        };

        const stopPolling = () => {
          if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        };

        const channel = supabase
          .channel(`trip-full:${tripId}`)
          // Trip metadata (name, days, theme, countries, hotels, notes)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trips',    filter: `id=eq.${tripId}` },       scheduleReload)
          // Events — the main real-time gap that caused events to not sync live
          .on('postgres_changes', { event: '*', schema: 'public', table: 'events',   filter: `trip_id=eq.${tripId}` },  scheduleReload)
          // Expenses
          .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${tripId}` },  scheduleReload)
          // Supplies / packing list
          .on('postgres_changes', { event: '*', schema: 'public', table: 'supplies', filter: `trip_id=eq.${tripId}` },  scheduleReload)
          // Day meta (region labels, descriptions)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'day_meta', filter: `trip_id=eq.${tripId}` },  scheduleReload)
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              stopPolling(); // WebSocket works — no need to poll
              // Initial full sync on connect — catches any changes that arrived between sessions.
              // Skip if we already have current data for this trip to prevent a double-load
              // immediately after login (checkAuth already called loadTripById for us).
              const { tripDbId: currentId, trip: currentTrip } = get();
              if (currentId !== tripId || !currentTrip) {
                scheduleReload();
              }
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              // WebSocket unavailable (e.g. Brave Shields, corporate firewall) — fall back to polling
              startPolling();
            } else if (status === 'CLOSED') {
              startPolling(); // channel closed unexpectedly — keep data fresh via polling
            }
          });

        return () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          stopPolling();
          supabase.removeChannel(channel);
        };
      },

      setGlobalLoading: (v) => set({ isGlobalLoading: v }),
      setIsOffline: (v) => set({ isOffline: v }),

      addPendingChange: (change) => set(state => ({
        pendingChanges: [...state.pendingChanges, change],
      })),

      flushPendingChanges: async () => {
        const { pendingChanges, userId } = get();
        if (!pendingChanges.length || !userId) return;
        // Replay each pending change in order, using each change's own tripId
        for (const change of pendingChanges) {
          try {
            const p = change.payload;
            const tripId = change.tripId;
            if (change.type === 'addEvent') {
              await dbAddEvent(tripId, p.dayNumber as number, p.event as TripEvent, userId);
            } else if (change.type === 'editEvent') {
              await dbEditEvent(p.eventId as string, { ...(p.updates as Record<string, unknown>), tripId });
            } else if (change.type === 'deleteEvent') {
              await dbDeleteEvent(p.eventId as string, tripId);
            } else if (change.type === 'addExpense') {
              await dbAddExpense(tripId, p.expense as Expense, userId);
            } else if (change.type === 'deleteExpense') {
              await dbDeleteExpense(p.expenseId as string, tripId);
            } else if (change.type === 'addSupply') {
              await dbAddSupply(tripId, p.item as SupplyItem);
            } else if (change.type === 'deleteSupply') {
              await dbDeleteSupply(p.supplyId as string, tripId);
            } else if (change.type === 'toggleSupply') {
              await dbToggleSupply(p.supplyId as string, p.checked as boolean, tripId);
            }
            // Remove this change on success
            set(state => ({ pendingChanges: state.pendingChanges.filter(c => c.timestamp !== change.timestamp) }));
          } catch {
            // Stop flushing on first failure — will retry on next reconnect
            break;
          }
        }
      },
    }),
    {
      name: 'trippy-storage',
      partialize: (s) => ({
        // trip and supplies are intentionally excluded — always loaded fresh from the API
        // to prevent stale localStorage data from shadowing real server state.
        // screen is intentionally excluded — always starts from 'splash' on every load
        // so auth state is re-verified before showing any protected screen.
        nickname: s.nickname,
        activeDay: s.activeDay,
        themeMode: s.themeMode,
        highContrast: s.highContrast,
        reducedMotion: s.reducedMotion,
        hideBudget: s.hideBudget,
        showCarbonBudget: s.showCarbonBudget,
        hideTravelVault: s.hideTravelVault,
        dayEndHour: s.dayEndHour,
        currencyByTrip: s.currencyByTrip,
        userId: s.userId,
        tripDbId: s.tripDbId,
        authUser: s.authUser,
        termsAccepted: s.termsAccepted,
        pendingChanges: s.pendingChanges,
        lastSessionAt: s.lastSessionAt,
        // pendingWriteCount / termsChecked intentionally excluded — reset to defaults on every load
      }),
      // Reset screen to 'splash' after rehydration — handles old stored 'screen' values
      // (e.g. 'dashboard') that would otherwise skip the auth guard on reload.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.screen = 'splash';
          state.termsChecked = false;
        }
      },
    }
  )
);
