'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AiSuggestion, Category, DayMeta, EmergencyContact, Expense, Screen, SupplyItem, Trip, TripEvent, TripTheme } from './types';
import { MOCK_SUPPLIES, MOCK_TRIP } from './mockData';
import {
  ensureUser, signOut, registerUser, signInUser, signInWithGoogle as dbSignInWithGoogle, getCurrentUser,
  dbCreateTrip, dbFindTrip, dbJoinTrip, dbLoadTripById, rowToTrip,
  dbAddEvent, dbEditEvent, dbDeleteEvent, dbLeaveTrip,
  dbAddExpense, dbDeleteExpense,
  dbAddSupply, dbToggleSupply, dbDeleteSupply,
  dbAddEmergencyContact, dbDeleteEmergencyContact,
  dbUpdateTripNotes, dbUpdateDayMeta,
  getSessionUserId,
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

  // Actions
  setScreen: (s: Screen) => void;
  checkAuth: () => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  clearTripEntry: () => void;
  recordDemoClick: () => void;
  joinTrip: (name: string, code: string, nickname: string) => Promise<boolean>;
  loadTripById: (tripId: string) => Promise<void>;
  createTrip: (name: string, days: number, code: string, nickname: string, theme?: TripTheme, startDate?: string, countries?: string[]) => Promise<void>;
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

const uid = () => Math.random().toString(36).slice(2, 9);

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

      setScreen: (s) => set({ screen: s }),
      checkAuth: async () => {
        const user = await getCurrentUser()
        set({ authUser: user })
        if (user) {
          const { tripDbId, trip: localTrip } = get()
          if (tripDbId) {
            try {
              const data = await dbLoadTripById(tripDbId)
              if (data) {
                const { trip: dbTrip, supplies } = rowToTrip(data)
                // Merge: re-attach pending local events and preserve local votes (not stored in DB)
                const mergedEvents = { ...dbTrip.events }
                for (const [dayKey, localEvs] of Object.entries(localTrip?.events ?? {})) {
                  const day = Number(dayKey)
                  const dbIds = new Set((mergedEvents[day] ?? []).map(e => e.id))
                  const pending = (localEvs as TripEvent[]).filter(e => !dbIds.has(e.id))
                  if (pending.length > 0) {
                    mergedEvents[day] = [...(mergedEvents[day] ?? []), ...pending]
                    for (const ev of pending) {
                      dbAddEvent(tripDbId, day, ev, user.id).catch(err => set({ lastSyncError: err?.message ?? 'save_failed' }))
                    }
                  }
                  // Restore votes from local state (no DB column for votes)
                  mergedEvents[day] = (mergedEvents[day] ?? []).map(dbEv => {
                    const localEv = (localEvs as TripEvent[]).find(l => l.id === dbEv.id)
                    return localEv?.votes ? { ...dbEv, votes: localEv.votes } : dbEv
                  })
                }
                set({ trip: { ...dbTrip, events: mergedEvents }, supplies, userId: user.id })
              }
            } catch (err: any) { set({ lastSyncError: err?.message ?? 'load_failed' }) }
          }
        }
      },
      register: async (username, password) => {
        const id = await registerUser(username, password)
        set({ authUser: { id, username } })
      },
      signIn: async (username, password) => {
        const id = await signInUser(username, password)
        set({ authUser: { id, username } })
      },
      signInWithGoogle: async () => { await dbSignInWithGoogle() },
      clearTripEntry: () => set({ tripEntryCountries: null }),
      recordDemoClick: () => set(s => ({ demoClickCount: s.demoClickCount + 1 })),
      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      toggleHighContrast: () => set(s => ({ highContrast: !s.highContrast })),
      toggleReducedMotion: () => set(s => ({ reducedMotion: !s.reducedMotion })),
      toggleHideBudget: () => set(s => ({ hideBudget: !s.hideBudget })),
      toggleShowCarbonBudget: () => set(s => ({ showCarbonBudget: !s.showCarbonBudget })),
      setDayEndHour: (h) => set({ dayEndHour: h }),

      joinTrip: async (name, code, nickname) => {
        const normalName = name.trim().toLowerCase();
        const normalCode = code.trim();

        // Demo shortcut — stays local
        if (normalName === 'negev desert adventure' && normalCode === 'desert123') {
          set({
            showTour: !localStorage.getItem('trippy-tour-done'),
            trip: MOCK_TRIP,
            supplies: MOCK_SUPPLIES,
            nickname: nickname || 'Traveler',
            screen: 'dashboard',
            activeDay: 1,
            tripDbId: null,
          });
          return true;
        }

        if (normalCode.length < 6) return false;

        try {
          // Verify trip exists BEFORE creating an anonymous user
          const data = await dbFindTrip(name, normalCode);
          if (!data) return false;

          const userId = await ensureUser(nickname);
          await dbJoinTrip(data.id, userId, nickname.slice(0, 2).toUpperCase());

          const { trip, supplies } = rowToTrip(data);
          set({
            userId,
            tripDbId: data.id,
            trip,
            supplies,
            nickname: nickname || 'Traveler',
            screen: 'dashboard',
            activeDay: 1,
            tripEntryCountries: trip.countries?.length ? trip.countries : null,
          });
          return true;
        } catch {
          return false;
        }
      },

      loadTripById: async (tripId) => {
        const { authUser } = get();
        const nickname = authUser?.username ?? 'Traveler';
        // authUser may not be hydrated yet after a Google OAuth redirect — fall back to the live session
        let userId = authUser?.id ?? null;
        if (!userId) {
          userId = await getSessionUserId();
        }
        if (!userId) throw new Error('not_authed');
        try {
          const data = await dbLoadTripById(tripId);
          if (!data) throw new Error('not_found');
          const { trip, supplies } = rowToTrip(data);
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

      createTrip: async (name, days, _code, nickname, theme = 'desert', startDate, countries) => {
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
        const userId = await ensureUser(nickname);
        const tripDbId = await dbCreateTrip(userId, name, days, newTrip.startDate, _code || undefined, theme, dayMetas, nickname, countries);

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
        // Keep trip + tripDbId in localStorage so pending events survive the logout/login cycle.
        // checkAuth will reload from DB on next login and re-sync any unsynced events.
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
            if (s.activeDay > days) return { trip, activeDay: days };
          }
        }
        return { trip };
      }),

      updateTheme: (theme) => set((s) => ({ trip: s.trip ? { ...s.trip, theme } : null })),

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
        const { trip } = get();
        if (!trip) return;
        const dayEvents = (trip.events[dayNumber] || []).map(e => {
          if (e.id !== eventId) return e;
          const votes = { ...(e.votes ?? {}) };
          if (votes[nickname] === vote) delete votes[nickname];
          else votes[nickname] = vote;
          return { ...e, votes };
        });
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } } });
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

      toggleSupplyCritical: (id) => set(s => ({
        supplies: s.supplies.map(i => i.id === id ? { ...i, critical: !i.critical } : i),
      })),

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
      }),
    }
  )
);
