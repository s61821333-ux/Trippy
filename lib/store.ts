'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AiSuggestion, Category, DayMeta, EmergencyContact, Expense, Screen, SupplyItem, Trip, TripEvent, TripTheme } from './types';
import { MOCK_SUPPLIES, MOCK_TRIP } from './mockData';

interface AppState {
  screen: Screen;
  trip: Trip | null;
  nickname: string;
  activeDay: number;
  supplies: SupplyItem[];
  showAddEvent: boolean;
  showSuggestions: boolean;
  activeGapStart: number | null;
  activeGapEnd: number | null;
  aiSuggestions: AiSuggestion[];
  darkMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  hideBudget: boolean;
  showCarbonBudget: boolean;
  dayEndHour: number; // default 23; nightlife mode can extend to 27 (= 3 AM next day)

  // Actions
  setScreen: (s: Screen) => void;
  joinTrip: (name: string, code: string, nickname: string) => boolean;
  createTrip: (name: string, days: number, code: string, nickname: string, theme?: TripTheme, startDate?: string) => void;
  logout: () => void;
  setActiveDay: (day: number) => void;
  setNickname: (n: string) => void;
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
  setAiSuggestions: (suggestions: AiSuggestion[]) => void;
  addSuggestionToDay: (dayNumber: number, suggId: string) => void;
}

// tiny id generator
const uid = () => Math.random().toString(36).slice(2, 9);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      screen: 'login',
      trip: null,
      nickname: '',
      activeDay: 1,
      supplies: MOCK_SUPPLIES,
      showAddEvent: false,
      showSuggestions: false,
      activeGapStart: null,
      activeGapEnd: null,
      aiSuggestions: [],
      darkMode: false,
      highContrast: false,
      reducedMotion: false,
      hideBudget: false,
      showCarbonBudget: false,
      dayEndHour: 23,

      setScreen: (s) => set({ screen: s }),
      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      toggleHighContrast: () => set(s => ({ highContrast: !s.highContrast })),
      toggleReducedMotion: () => set(s => ({ reducedMotion: !s.reducedMotion })),
      toggleHideBudget: () => set(s => ({ hideBudget: !s.hideBudget })),
      toggleShowCarbonBudget: () => set(s => ({ showCarbonBudget: !s.showCarbonBudget })),
      setDayEndHour: (h) => set({ dayEndHour: h }),

      joinTrip: (name, code, nickname) => {
        const normalName = name.trim().toLowerCase();
        const normalCode = code.trim();
        if (
          (normalName === 'negev desert adventure' && normalCode === 'desert123') ||
          normalCode.length >= 6
        ) {
          const isDemo = normalName === 'negev desert adventure' && normalCode === 'desert123';
          set({
            trip: isDemo ? MOCK_TRIP : {
              name: name.trim(),
              days: 3,
              code: normalCode,
              startDate: new Date().toISOString().split('T')[0],
              participants: [{ id: 1, name: nickname || 'You', initials: (nickname || 'Y').slice(0, 2).toUpperCase(), color: 'oklch(62% 0.15 195)' }],
              dayMeta: Array.from({ length: 3 }, (_, i) => ({ region: `Day ${i + 1}`, emoji: '🏔️', lat: 31, lng: 35, desc: '' })),
              events: { 1: [], 2: [], 3: [] },
            },
            nickname: nickname || 'Traveler',
            screen: 'dashboard',
            activeDay: 1,
          });
          return true;
        }
        return false;
      },

      createTrip: (name, days, _code, nickname, theme = 'desert', startDate) => {
        const { getThemeSupplies } = require('./mockData');
        const defaultEmoji = theme === 'city' ? '🏙️' : theme === 'beach' ? '🏖️' : theme === 'nature' ? '🌲' : theme === 'mountain' ? '⛰️' : theme === 'snow' ? '❄️' : '🏔️';
        const newTrip: Trip = {
          name,
          days,
          theme,
          code: _code || undefined,
          startDate: startDate || new Date().toISOString().split('T')[0],
          participants: [{ id: 1, name: nickname || 'You', initials: (nickname || 'Y').slice(0, 2).toUpperCase(), color: 'oklch(62% 0.15 195)' }],
          dayMeta: Array.from({ length: days }, (_, i) => ({ region: `Day ${i + 1}`, emoji: defaultEmoji, lat: 31, lng: 35, desc: '' })),
          events: Object.fromEntries(Array.from({ length: days }, (_, i) => [i + 1, []])),
        };
        set({ trip: newTrip, nickname: nickname || 'Traveler', screen: 'dashboard', activeDay: 1, supplies: getThemeSupplies(theme) });
      },

      logout: () => set({ trip: null, nickname: '', screen: 'login', activeDay: 1, aiSuggestions: [] }),

      setActiveDay: (day) => set({ activeDay: day }),
      setNickname: (n) => set({ nickname: n }),
      updateTheme: (theme) => set((s) => ({ trip: s.trip ? { ...s.trip, theme } : null })),

      updateDayMeta: (dayIndex, meta) => set((s) => {
        if (!s.trip) return {};
        const dayMeta = [...s.trip.dayMeta];
        dayMeta[dayIndex] = { ...dayMeta[dayIndex], ...meta };
        return { trip: { ...s.trip, dayMeta } };
      }),

      addEvent: (dayNumber, event) => {
        const { trip } = get();
        if (!trip) return;
        const newEvent: TripEvent = { ...event, id: uid(), addedBy: get().nickname || 'You' };
        const dayEvents = [...(trip.events[dayNumber] || []), newEvent];
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } } });
      },

      editEvent: (dayNumber, eventId, updates) => {
        const { trip } = get();
        if (!trip) return;
        const dayEvents = (trip.events[dayNumber] || []).map(e => e.id === eventId ? { ...e, ...updates } : e);
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } } });
      },

      deleteEvent: (dayNumber, eventId) => {
        const { trip } = get();
        if (!trip) return;
        const dayEvents = (trip.events[dayNumber] || []).filter(e => e.id !== eventId);
        set({ trip: { ...trip, events: { ...trip.events, [dayNumber]: dayEvents } } });
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

      toggleSupply: (id) => set(s => ({ supplies: s.supplies.map(i => i.id === id ? { ...i, checked: !i.checked } : i) })),

      addSupplyItem: (name, category, assignee, critical) => set(s => ({
        supplies: [...s.supplies, { id: uid(), name, category, checked: false, assignee, critical: critical ?? false }],
      })),

      deleteSupplyItem: (id) => set(s => ({ supplies: s.supplies.filter(i => i.id !== id) })),

      toggleSupplyCritical: (id) => set(s => ({
        supplies: s.supplies.map(i => i.id === id ? { ...i, critical: !i.critical } : i),
      })),

      addTripNote: (note) => set(s => ({
        trip: s.trip ? { ...s.trip, tripNotes: [...(s.trip.tripNotes ?? []), note] } : null,
      })),
      deleteTripNote: (index) => set(s => ({
        trip: s.trip ? { ...s.trip, tripNotes: (s.trip.tripNotes ?? []).filter((_, i) => i !== index) } : null,
      })),

      addExpense: (exp) => set(s => ({
        trip: s.trip ? { ...s.trip, expenses: [...(s.trip.expenses ?? []), { ...exp, id: uid() }] } : null,
      })),
      deleteExpense: (id) => set(s => ({
        trip: s.trip ? { ...s.trip, expenses: (s.trip.expenses ?? []).filter(e => e.id !== id) } : null,
      })),

      addEmergencyContact: (contact) => set(s => ({
        trip: s.trip ? { ...s.trip, emergencyContacts: [...(s.trip.emergencyContacts ?? []), { ...contact, id: uid() }] } : null,
      })),
      deleteEmergencyContact: (id) => set(s => ({
        trip: s.trip ? { ...s.trip, emergencyContacts: (s.trip.emergencyContacts ?? []).filter(c => c.id !== id) } : null,
      })),

      setShowAddEvent: (v) => set({ showAddEvent: v }),

      setShowSuggestions: (v, gapStart, gapEnd) => set({ showSuggestions: v, activeGapStart: gapStart ?? null, activeGapEnd: gapEnd ?? null }),

      setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),

      addSuggestionToDay: (dayNumber, suggId) => {
        const { trip, aiSuggestions } = get();
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
      }),
    }
  )
);
