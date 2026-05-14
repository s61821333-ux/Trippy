'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AiSuggestion, Category, DayMeta, EmergencyContact, Expense, Screen, SupplyItem, Trip, TripEvent, TripInvitation, TripTheme } from './types';
import { MOCK_SUPPLIES, MOCK_TRIP } from './mockData';
import {
  signOut, signInWithGoogle as dbSignInWithGoogle, getCurrentUser, getSessionUserId,
  dbCreateTrip, dbLoadTripById, rowToTrip,
  dbGetInvitations, dbInviteToTrip, dbAcceptInvitation, dbRejectInvitation,
  dbAddEvent, dbEditEvent, dbDeleteEvent, dbLeaveTrip, dbUpdateEventVotes,
  dbAddExpense, dbDeleteExpense,
  dbAddSupply, dbToggleSupply, dbDeleteSupply, dbUpdateSupplyCritical,
  dbAddEmergencyContact, dbDeleteEmergencyContact,
  dbUpdateTripNotes, dbUpdateDayMeta,
  dbUpdateTripInfo as dbSyncTripInfo, dbUpdateTripTheme,
  dbGetOrCreateInviteToken,
} from './db';

interface AppState {
  screen: Screen;
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
  darkMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  hideBudget: boolean;
  showCarbonBudget: boolean;
  dayEndHour: number;

  // Supabase identity
  userId: string | null;
  tripDbId: string | null;
  authUser: { id: string; username: string } | null;
  tripEntryCountries: string[] | null;
  demoClickCount: number;
  lastSyncError: string | null;
  pendingInvitations: TripInvitation[];

  // Actions
  setScreen: (s: Screen) => void;
  checkAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  clearTripEntry: () => void;
  recordDemoClick: () => void;
  loadDemoTrip: () => void;
  loadTripById: (tripId: string) => Promise<void>;
  createTrip: (name: string, days: number, nickname: string, theme?: TripTheme, startDate?: string, countries?: string[]) => Promise<void>;
  loadInvitations: () => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  inviteToTrip: (email: string) => Promise<void>;
  createInviteLink: () => Promise<string>;
  /** Sign completely out of Supabase. Does NOT remove the user from the trip. */
  logout: () => void;
  /** Keep auth but unload the current trip so the user can pick another. */
  switchTrip: () => void;
  /** Remove the user from this trip's participant list, then unload it. */
  leaveTrip: () => Promise<void>;
  setActiveDay: (day: number) => void;
  setNickname: (n: string) => void;
  updateTripInfo: (updates: { name?: string; days?: number; startDate?: string }) => void;
  updateTheme: (theme: TripTheme) => void;
  updateDayMeta: (dayIndex: number, meta: Partial<DayMeta>) => void;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleHideBudget: () => void;
  toggleShowCarbonBudget: () => void;
  setDayEndHour: (h: number) => void;

  addEvent: (dayNumber: number, event: Omit<TripEvent, 'id' | 'addedBy'>) => void;
  editEvent: (dayNumber: number, eventId: string, updates: Partial<TripEvent>) => void;
  deleteEvent: (dayNumber: number, eventId: string) => void;

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

  setShowAddEvent: (v: boolean) => void;
  setShowSuggestions: (v: boolean, gapStart?: number, gapEnd?: number) => void;
  setShowTour: (v: boolean) => void;
  setAiSuggestions: (suggestions: AiSuggestion[]) => void;
  addSuggestionToDay: (dayNumber: number, suggId: string) => void;
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
      screen: 'login',
      trip: null,
      nickname: '',
      activeDay: 1,
      supplies: [],
      showAddEvent: false,
      showSuggestions: false,
      showTour: false,
      activeGapStart: null,
      activeGapEnd: null,
      aiSuggestions: [],
      darkMode: false,
      highContrast: false,
      reducedMotion: false,
      hideBudget: false,
      showCarbonBudget: false,
      dayEndHour: 23,
      userId: null,
      tripDbId: null,
      authUser: null,
      tripEntryCountries: null,
      demoClickCount: 0,
      lastSyncError: null,
      pendingInvitations: [],

      setScreen: (s) => set({ screen: s }),
      checkAuth: async () => {
        const user = await getCurrentUser()
        // Don't reset authUser to null here — sign-out is handled by onAuthStateChange in AppShell.
        // Only update the store when a user is actually found.
        if (!user) return
        // Always land on the trip picker so the user can choose which trip to open.
        // Clear any previously loaded trip; the join-link flow (/?join=id) still works
        // because AppShell's authUser effect handles that separately.
        set({ authUser: user, userId: user.id, trip: null, tripDbId: null, supplies: [] })
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
        const token = await dbGetOrCreateInviteToken(tripDbId)
        return `${window.location.origin}/join/${token}`
      },
      clearTripEntry: () => set({ tripEntryCountries: null }),
      recordDemoClick: () => set(s => ({ demoClickCount: s.demoClickCount + 1 })),
      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      toggleHighContrast: () => set(s => ({ highContrast: !s.highContrast })),
      toggleReducedMotion: () => set(s => ({ reducedMotion: !s.reducedMotion })),
      toggleHideBudget: () => set(s => ({ hideBudget: !s.hideBudget })),
      toggleShowCarbonBudget: () => set(s => ({ showCarbonBudget: !s.showCarbonBudget })),
      setDayEndHour: (h) => set({ dayEndHour: h }),


      loadTripById: async (tripId) => {
        const { authUser, trip: localTrip, tripDbId: localTripDbId } = get();
        const nickname = authUser?.username ?? 'Traveler';
        let userId = authUser?.id ?? null;
        if (!userId) userId = await getSessionUserId();
        if (!userId) throw new Error('not_authed');
        try {
          const data = await dbLoadTripById(tripId);
          if (!data) throw new Error('not_found');
          const { trip: dbTrip, supplies } = rowToTrip(data);
          // If this is the same trip we had locally, merge pending events before overwriting
          const isSameTrip = localTripDbId === data.id;
          const trip = isSameTrip
            ? mergeLocalIntoDbTrip(dbTrip, localTrip, data.id, userId, msg => set({ lastSyncError: msg }))
            : dbTrip;
          set({
            userId,
            tripDbId: data.id,
            trip,
            supplies,
            nickname,
            screen: 'dashboard',
            activeDay: 1,
            tripEntryCountries: trip.countries?.length ? trip.countries : null,
          });
        } catch (err: any) {
          throw err?.message === 'not_authed' || err?.message === 'not_found' ? err : new Error('load_failed');
        }
      },

      createTrip: async (name, days, nickname, theme = 'desert', startDate, countries) => {
        const defaultEmoji = theme === 'city' ? '🏙️' : theme === 'beach' ? '🏖️' : theme === 'nature' ? '🌲' : theme === 'mountain' ? '⛰️' : theme === 'snow' ? '❄️' : '🏔️';

        const dayMetas: DayMeta[] = Array.from({ length: days }, (_, i) => ({
          region: `Day ${i + 1}`, emoji: defaultEmoji, lat: 31, lng: 35, desc: '',
        }));

        const newTrip: Trip = {
          name,
          days,
          theme,
          countries: countries?.length ? countries : undefined,
          startDate: startDate || new Date().toISOString().split('T')[0],
          participants: [{ id: 1, name: nickname || 'You', initials: (nickname || 'Y').slice(0, 2).toUpperCase(), color: 'oklch(62% 0.15 195)' }],
          dayMeta: dayMetas,
          events: Object.fromEntries(Array.from({ length: days }, (_, i) => [i + 1, []])),
        };

        // Save to DB first — throws on failure so LoginScreen can show a meaningful error
        const userId = await getSessionUserId();
        if (!userId) throw new Error('Not authenticated');
        const tripDbId = await dbCreateTrip(userId, name, days, newTrip.startDate, theme, dayMetas, nickname, countries);

        set({
          userId, tripDbId, trip: newTrip,
          nickname: nickname || 'Traveler',
          screen: 'dashboard', activeDay: 1, supplies: [],
          tripEntryCountries: countries?.length ? countries : null,
        });
      },

      // Full sign-out — does NOT remove the user from the trip so they can rejoin later
      logout: () => {
        signOut().catch(() => {});
        // Brute-force clear all Supabase auth cookies so onAuthStateChange cannot
        // re-authenticate the user on next page load (guards against path-mismatch
        // cookie deletion failures in signOut()).
        if (typeof document !== 'undefined') {
          document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            if (name.startsWith('sb-')) {
              document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
            }
          });
        }
        set({ screen: 'login', activeDay: 1, aiSuggestions: [], userId: null, authUser: null, nickname: '' });
      },

      // Keep the Supabase session but go back to the trip picker
      switchTrip: () => {
        set({ trip: null, tripDbId: null, nickname: '', screen: 'login', activeDay: 1, aiSuggestions: [] });
      },

      // Permanently remove the user from this trip's participant list
      leaveTrip: async () => {
        const { tripDbId, userId } = get();
        if (tripDbId && userId) await dbLeaveTrip(tripDbId, userId).catch(() => {});
        set({ trip: null, tripDbId: null, nickname: '', screen: 'login', activeDay: 1, aiSuggestions: [] });
      },

      setActiveDay: (day) => set({ activeDay: day }),
      setNickname: (n) => set({ nickname: n }),

      updateTripInfo: ({ name, days, startDate }) => set((s) => {
        if (!s.trip) return {};
        const trip = { ...s.trip };
        if (name !== undefined)      trip.name      = name;
        if (startDate !== undefined) trip.startDate = startDate;
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
        if (tripDbId) dbSyncTripInfo(tripDbId, { name, days, startDate }).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
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
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } } });
        if (tripDbId) {
          getSessionUserId().then(sessionUserId => {
            if (!sessionUserId) { set({ lastSyncError: 'not_authed' }); return; }
            if (sessionUserId !== get().userId) set({ userId: sessionUserId });
            return dbAddEvent(tripDbId, dayNumber, newEvent, sessionUserId);
          }).catch(err => {
            console.error('[addEvent] DB sync failed:', err);
            set({ lastSyncError: err?.message ?? 'save_failed' });
          });
        }
      },

      editEvent: (dayNumber, eventId, updates) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const dayEvents = (trip.events[dayNumber] || []).map(e => e.id === eventId ? { ...e, ...updates } : e);
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } } });
        if (tripDbId) dbEditEvent(eventId, updates).catch(err => {
          console.error('[editEvent] DB sync failed:', err);
          set({ lastSyncError: err?.message ?? 'sync_failed' });
        });
      },

      deleteEvent: (dayNumber, eventId) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const dayEvents = (trip.events[dayNumber] || []).filter(e => e.id !== eventId);
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } } });
        if (tripDbId) dbDeleteEvent(eventId).catch(err => {
          console.error('[deleteEvent] DB sync failed:', err);
          set({ lastSyncError: err?.message ?? 'sync_failed' });
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
          dbUpdateEventVotes(eventId, updatedVotes).catch(err => {
            set({ lastSyncError: err?.message ?? 'vote_sync_failed' });
          });
        }
      },

      toggleSupply: (id) => {
        const { tripDbId } = get();
        set(s => {
          const supplies = s.supplies.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
          const item = supplies.find(i => i.id === id);
          if (tripDbId && item) dbToggleSupply(id, item.checked).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
          return { supplies };
        });
      },

      addSupplyItem: (name, category, assignee, critical) => {
        const { tripDbId } = get();
        const newItem: SupplyItem = { id: uid(), name, category, checked: false, assignee, critical: critical ?? false };
        set(s => ({ supplies: [...s.supplies, newItem] }));
        if (tripDbId) dbAddSupply(tripDbId, newItem).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      deleteSupplyItem: (id) => {
        const { tripDbId } = get();
        set(s => ({ supplies: s.supplies.filter(i => i.id !== id) }));
        if (tripDbId) dbDeleteSupply(id).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      toggleSupplyCritical: (id) => set(s => {
        const supplies = s.supplies.map(i => i.id === id ? { ...i, critical: !i.critical } : i);
        const item = supplies.find(i => i.id === id);
        if (s.tripDbId && item) dbUpdateSupplyCritical(id, item.critical ?? false).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
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
        const { userId, tripDbId } = get();
        const newExp: Expense = { ...exp, id: uid() };
        set(s => ({
          trip: s.trip ? { ...s.trip, expenses: [...(s.trip.expenses ?? []), newExp] } : null,
        }));
        if (tripDbId && userId) dbAddExpense(tripDbId, newExp, userId).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      deleteExpense: (id) => {
        const { tripDbId } = get();
        set(s => ({
          trip: s.trip ? { ...s.trip, expenses: (s.trip.expenses ?? []).filter(e => e.id !== id) } : null,
        }));
        if (tripDbId) dbDeleteExpense(id).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
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
        if (tripDbId) dbDeleteEmergencyContact(id).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }));
      },

      setShowAddEvent: (v) => set({ showAddEvent: v }),
      setShowTour: (v) => {
        if (!v && typeof window !== 'undefined') localStorage.setItem('trippy-tour-done', '1');
        set({ showTour: v });
      },
      setShowSuggestions: (v, gapStart, gapEnd) => set({ showSuggestions: v, activeGapStart: gapStart ?? null, activeGapEnd: gapEnd ?? null }),
      setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),

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
    }),
    {
      name: 'trippy-storage',
      partialize: (s) => ({
        trip: s.trip,
        nickname: s.nickname,
        activeDay: s.activeDay,
        supplies: s.supplies,
        darkMode: s.darkMode,
        highContrast: s.highContrast,
        reducedMotion: s.reducedMotion,
        hideBudget: s.hideBudget,
        showCarbonBudget: s.showCarbonBudget,
        dayEndHour: s.dayEndHour,
        userId: s.userId,
        tripDbId: s.tripDbId,
        authUser: s.authUser,
      }),
    }
  )
);
