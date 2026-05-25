'use client';

/**
 * tripStore — owns all trip data: events, hotels, supplies, expenses, notes, participants.
 * This is a slice extracted from the monolithic store.ts for gradual migration.
 * Until call sites are fully migrated, the monolithic useAppStore façade re-exports these.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAppStore } from '../store';
import type {
  Trip, TripEvent, HotelStay, SupplyItem, Expense, DayMeta,
  AiSuggestion, TripInvitation, TripTheme,
} from '../types';
import {
  dbCreateTrip, dbLoadTripById, rowToTrip,
  dbAddEvent, dbEditEvent, dbDeleteEvent, dbMoveEvent,
  dbAddExpense, dbDeleteExpense,
  dbAddSupply, dbToggleSupply, dbDeleteSupply, dbUpdateSupplyCritical,
  dbUpdateTripNotes, dbUpdateDayMeta, dbUpdateHotels,
  dbUpdateTripInfo as dbSyncTripInfo, dbUpdateTripTheme,
  dbGetOrCreateInviteToken, dbLeaveTrip,
  dbGetInvitations, dbInviteToTrip, dbAcceptInvitation, dbRejectInvitation,
  dbUpdateEventVotes,
} from '../db';
import { MOCK_TRIP, MOCK_SUPPLIES } from '../mockData';

interface TripState {
  trip: Trip | null;
  tripDbId: string | null;
  activeDay: number;
  supplies: SupplyItem[];
  aiSuggestions: AiSuggestion[];
  showAddEvent: boolean;
  activeGapStart: number | null;
  activeGapEnd: number | null;
  currencyByTrip: Record<string, string>;
  pendingInvitations: TripInvitation[];
  tripEntryCountries: string[] | null;
  demoClickCount: number;

  setActiveDay: (day: number) => void;
  setShowAddEvent: (v: boolean) => void;
  setAiSuggestions: (s: AiSuggestion[]) => void;
  addSuggestionToDay: (dayNumber: number, suggId: string) => void;
  setCurrency: (code: string) => void;
  clearTripEntry: () => void;
  recordDemoClick: () => void;

  loadDemoTrip: () => void;
  loadTripById: (tripId: string) => Promise<void>;
  createTrip: (name: string, days: number, nickname: string, theme?: TripTheme, startDate?: string, countries?: string[], currency?: string) => Promise<void>;
  switchTrip: () => void;
  leaveTrip: () => Promise<void>;
  updateTripInfo: (updates: { name?: string; days?: number; startDate?: string }) => void;
  updateTheme: (theme: TripTheme) => void;
  updateDayMeta: (dayIndex: number, meta: Partial<DayMeta>) => void;

  addEvent: (dayNumber: number, event: Omit<TripEvent, 'id' | 'addedBy'>) => void;
  editEvent: (dayNumber: number, eventId: string, updates: Partial<TripEvent>) => void;
  deleteEvent: (dayNumber: number, eventId: string) => void;
  moveEvent: (fromDay: number, toDay: number, eventId: string) => void;
  voteEvent: (dayNumber: number, eventId: string, nickname: string, vote: 'up' | 'down') => void;

  addHotel: (hotel: Omit<HotelStay, 'id'>) => void;
  editHotel: (id: string, updates: Partial<Omit<HotelStay, 'id'>>) => void;
  deleteHotel: (id: string) => void;

  toggleSupply: (id: string) => void;
  addSupplyItem: (name: string, category: SupplyItem['category'], assignee?: string, critical?: boolean) => void;
  deleteSupplyItem: (id: string) => void;
  toggleSupplyCritical: (id: string) => void;

  addExpense: (exp: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  addTripNote: (note: string) => void;
  deleteTripNote: (index: number) => void;

  loadInvitations: () => Promise<void>;
  inviteToTrip: (email: string) => Promise<void>;
  createInviteLink: () => Promise<string>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
}

const uid = () => crypto.randomUUID();

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trip: null,
      tripDbId: null,
      activeDay: 1,
      supplies: [],
      aiSuggestions: [],
      showAddEvent: false,
      activeGapStart: null,
      activeGapEnd: null,
      currencyByTrip: {},
      pendingInvitations: [],
      tripEntryCountries: null,
      demoClickCount: 0,

      setActiveDay: (day) => set({ activeDay: day }),
      setShowAddEvent: (v) => set({ showAddEvent: v }),
      setAiSuggestions: (s) => set({ aiSuggestions: s }),
      setCurrency: (code) => {
        const { tripDbId } = get();
        if (!tripDbId) return;
        set((s) => ({ currencyByTrip: { ...s.currencyByTrip, [tripDbId]: code } }));
      },
      clearTripEntry: () => set({ tripEntryCountries: null }),
      recordDemoClick: () => set((s) => ({ demoClickCount: s.demoClickCount + 1 })),

      addSuggestionToDay: (dayNumber, suggId) => {
        const { trip, aiSuggestions, tripDbId, addEvent } = get();
        if (!trip) return;
        const sug = aiSuggestions.find((s) => s.id === suggId);
        if (!sug) return;
        addEvent(dayNumber, {
          name: sug.name, category: sug.category,
          time: sug.time, duration: sug.duration,
          location: sug.location,
        });
      },

      loadDemoTrip: () => {
        set({ trip: MOCK_TRIP, tripDbId: null, supplies: MOCK_SUPPLIES, activeDay: 1, tripEntryCountries: MOCK_TRIP.countries });
      },

      loadTripById: async (tripId) => {
        const { trip: localTrip, supplies } = get();
        const userId = (await import('../store').then(m => m.useAppStore.getState())).userId;
        if (!userId) return;
        const row = await dbLoadTripById(tripId);
        if (!row) return;
        const { trip: dbTrip, supplies: dbSupplies } = rowToTrip(row);
        set({ trip: dbTrip, tripDbId: tripId, supplies: dbSupplies });
      },

      createTrip: async (name, days, nickname, theme, startDate, countries, currency) => {
        const userId = (await import('../store').then(m => m.useAppStore.getState())).userId;
        if (!userId) return;
        const tripId = await dbCreateTrip(userId, name, days, startDate ?? '', theme, [], nickname, countries);
        set((s) => ({
          tripDbId: tripId,
          currencyByTrip: currency ? { ...s.currencyByTrip, [tripId]: currency } : s.currencyByTrip,
          tripEntryCountries: countries ?? null,
        }));
      },

      switchTrip: () => set({ trip: null, tripDbId: null }),

      leaveTrip: async () => {
        const { tripDbId } = get();
        const userId = (await import('../store').then(m => m.useAppStore.getState())).userId;
        if (tripDbId && userId) await dbLeaveTrip(tripDbId, userId);
        set({ trip: null, tripDbId: null, supplies: [] });
      },

      updateTripInfo: (updates) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const updated = { ...trip, ...updates };
        set({ trip: updated });
        if (tripDbId) dbSyncTripInfo(tripDbId, updates).catch(() => {});
      },

      updateTheme: (theme) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        set({ trip: { ...trip, theme } });
        if (tripDbId) dbUpdateTripTheme(tripDbId, theme).catch(() => {});
      },

      updateDayMeta: (dayIndex, meta) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const dayMeta = [...(trip.dayMeta ?? [])];
        dayMeta[dayIndex] = { ...dayMeta[dayIndex], ...meta };
        set({ trip: { ...trip, dayMeta } });
        if (tripDbId) dbUpdateDayMeta(tripDbId, dayIndex, meta).catch(() => {});
      },

      addEvent: (dayNumber, event) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const userId = useAppStore.getState().userId;
        const newEvent: TripEvent = { ...event, id: uid(), addedBy: userId ?? 'local' };
        const events = { ...trip.events, [dayNumber]: [...(trip.events[dayNumber] ?? []), newEvent] };
        set({ trip: { ...trip, events } });
        if (tripDbId && userId) dbAddEvent(tripDbId, dayNumber, newEvent, userId).catch(() => {});
      },

      editEvent: (dayNumber, eventId, updates) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const dayEvs = (trip.events[dayNumber] ?? []).map((e) => e.id === eventId ? { ...e, ...updates } : e);
        const events = { ...trip.events, [dayNumber]: dayEvs };
        set({ trip: { ...trip, events } });
        if (tripDbId) dbEditEvent(eventId, updates).catch(() => {});
      },

      deleteEvent: (dayNumber, eventId) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const events = { ...trip.events, [dayNumber]: (trip.events[dayNumber] ?? []).filter((e) => e.id !== eventId) };
        set({ trip: { ...trip, events } });
        if (tripDbId) dbDeleteEvent(eventId).catch(() => {});
      },

      moveEvent: (fromDay, toDay, eventId) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const ev = (trip.events[fromDay] ?? []).find((e) => e.id === eventId);
        if (!ev) return;
        const events = {
          ...trip.events,
          [fromDay]: (trip.events[fromDay] ?? []).filter((e) => e.id !== eventId),
          [toDay]: [...(trip.events[toDay] ?? []), ev],
        };
        set({ trip: { ...trip, events } });
        if (tripDbId) dbMoveEvent(eventId, toDay).catch(() => {});
      },

      voteEvent: (dayNumber, eventId, nickname, vote) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const dayEvs = (trip.events[dayNumber] ?? []).map((e) => {
          if (e.id !== eventId) return e;
          const votes = { ...(e.votes ?? {}), [nickname]: vote };
          return { ...e, votes };
        });
        const events = { ...trip.events, [dayNumber]: dayEvs };
        set({ trip: { ...trip, events } });
        const ev = dayEvs.find(e => e.id === eventId);
        if (tripDbId && ev?.votes) dbUpdateEventVotes(eventId, ev.votes).catch(() => {});
      },

      addHotel: (hotel) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const hotels = [...(trip.hotels ?? []), { ...hotel, id: uid() }];
        set({ trip: { ...trip, hotels } });
        if (tripDbId) dbUpdateHotels(tripDbId, hotels).catch(() => {});
      },

      editHotel: (id, updates) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const hotels = (trip.hotels ?? []).map((h) => h.id === id ? { ...h, ...updates } : h);
        set({ trip: { ...trip, hotels } });
        if (tripDbId) dbUpdateHotels(tripDbId, hotels).catch(() => {});
      },

      deleteHotel: (id) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const hotels = (trip.hotels ?? []).filter((h) => h.id !== id);
        set({ trip: { ...trip, hotels } });
        if (tripDbId) dbUpdateHotels(tripDbId, hotels).catch(() => {});
      },

      toggleSupply: (id) => {
        const { tripDbId, supplies } = get();
        const item = supplies.find(i => i.id === id);
        const newChecked = item ? !item.checked : false;
        set((s) => ({ supplies: s.supplies.map((i) => i.id === id ? { ...i, checked: !i.checked } : i) }));
        if (tripDbId) dbToggleSupply(id, newChecked).catch(() => {});
      },

      addSupplyItem: (name, category, assignee, critical) => {
        const { tripDbId } = get();
        const item: SupplyItem = { id: uid(), name, category, checked: false, assignee, critical: critical ?? false };
        set((s) => ({ supplies: [...s.supplies, item] }));
        if (tripDbId) dbAddSupply(tripDbId, item).catch(() => {});
      },

      deleteSupplyItem: (id) => {
        const { tripDbId } = get();
        set((s) => ({ supplies: s.supplies.filter((i) => i.id !== id) }));
        if (tripDbId) dbDeleteSupply(id).catch(() => {});
      },

      toggleSupplyCritical: (id) => {
        const { tripDbId, supplies } = get();
        const item = supplies.find(i => i.id === id);
        const newCritical = item ? !item.critical : true;
        set((s) => ({ supplies: s.supplies.map((i) => i.id === id ? { ...i, critical: !i.critical } : i) }));
        if (tripDbId) dbUpdateSupplyCritical(id, newCritical).catch(() => {});
      },

      addExpense: (exp) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const expense: Expense = { ...exp, id: uid() };
        const expenses = [...(trip.expenses ?? []), expense];
        set({ trip: { ...trip, expenses } });
        if (tripDbId) {
          const userId = useAppStore.getState().userId;
          dbAddExpense(tripDbId, expense, userId ?? 'local').catch(() => {});
        }
      },

      deleteExpense: (id) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const expenses = (trip.expenses ?? []).filter((e) => e.id !== id);
        set({ trip: { ...trip, expenses } });
        if (tripDbId) dbDeleteExpense(id).catch(() => {});
      },

      addTripNote: (note) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const tripNotes = [...(trip.tripNotes ?? []), note];
        set({ trip: { ...trip, tripNotes } });
        if (tripDbId) dbUpdateTripNotes(tripDbId, tripNotes).catch(() => {});
      },

      deleteTripNote: (index) => {
        const { trip, tripDbId } = get();
        if (!trip) return;
        const tripNotes = (trip.tripNotes ?? []).filter((_, i) => i !== index);
        set({ trip: { ...trip, tripNotes } });
        if (tripDbId) dbUpdateTripNotes(tripDbId, tripNotes).catch(() => {});
      },

      loadInvitations: async () => {
        const userId = (await import('../store').then(m => m.useAppStore.getState())).userId;
        if (!userId) return;
        const invitations = await dbGetInvitations().catch(() => []);
        set({ pendingInvitations: invitations });
      },

      inviteToTrip: async (email) => {
        const { tripDbId } = get();
        if (!tripDbId) return;
        await dbInviteToTrip(tripDbId, email);
      },

      createInviteLink: async () => {
        const { tripDbId } = get();
        if (!tripDbId) throw new Error('No trip');
        return dbGetOrCreateInviteToken(tripDbId);
      },

      acceptInvitation: async (invitationId) => {
        const userId = (await import('../store').then(m => m.useAppStore.getState())).userId;
        if (!userId) return;
        const tripId = await dbAcceptInvitation(invitationId, userId, '');
        set((s) => ({ pendingInvitations: s.pendingInvitations.filter(i => i.id !== invitationId) }));
        if (tripId) get().loadTripById(tripId).catch(() => {});
      },

      rejectInvitation: async (invitationId) => {
        await dbRejectInvitation(invitationId);
        set((s) => ({ pendingInvitations: s.pendingInvitations.filter(i => i.id !== invitationId) }));
      },
    }),
    {
      name: 'trippy-trip',
      partialize: (s) => ({
        trip: s.trip,
        tripDbId: s.tripDbId,
        activeDay: s.activeDay,
        supplies: s.supplies,
        currencyByTrip: s.currencyByTrip,
      }),
    }
  )
);

// Re-export types for consumers
export type { TripState };
