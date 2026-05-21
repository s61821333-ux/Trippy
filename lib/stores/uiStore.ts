'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Screen } from '../types';
import { OfflineChange } from '../store';

interface UIState {
  screen: Screen;
  themeMode: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  hideBudget: boolean;
  showCarbonBudget: boolean;
  hideTravelVault: boolean;
  dayEndHour: number;
  showSuggestions: boolean;
  activeGapStart: number | null;
  activeGapEnd: number | null;
  showTour: boolean;
  lastSyncError: string | null;
  isOffline: boolean;
  pendingChanges: OfflineChange[];

  setScreen: (s: Screen) => void;
  setThemeMode: (m: 'light' | 'dark' | 'system') => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleHideBudget: () => void;
  toggleShowCarbonBudget: () => void;
  toggleHideTravelVault: () => void;
  setDayEndHour: (h: number) => void;
  setShowSuggestions: (v: boolean, gapStart?: number, gapEnd?: number) => void;
  setShowTour: (v: boolean) => void;
  setIsOffline: (v: boolean) => void;
  addPendingChange: (change: OfflineChange) => void;
  clearPendingChanges: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      screen: 'login',
      themeMode: 'system',
      highContrast: false,
      reducedMotion: false,
      hideBudget: false,
      showCarbonBudget: false,
      hideTravelVault: false,
      dayEndHour: 23,
      showSuggestions: false,
      activeGapStart: null,
      activeGapEnd: null,
      showTour: false,
      lastSyncError: null,
      isOffline: false,
      pendingChanges: [],

      setScreen: (s) => set({ screen: s }),
      setThemeMode: (m) => set({ themeMode: m }),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
      toggleHideBudget: () => set((s) => ({ hideBudget: !s.hideBudget })),
      toggleShowCarbonBudget: () => set((s) => ({ showCarbonBudget: !s.showCarbonBudget })),
      toggleHideTravelVault: () => set((s) => ({ hideTravelVault: !s.hideTravelVault })),
      setDayEndHour: (h) => set({ dayEndHour: h }),
      setShowSuggestions: (v, gapStart, gapEnd) => set({
        showSuggestions: v,
        activeGapStart: gapStart ?? null,
        activeGapEnd: gapEnd ?? null,
      }),
      setShowTour: (v) => set({ showTour: v }),
      setIsOffline: (v) => set({ isOffline: v }),
      addPendingChange: (change) => set((s) => ({ pendingChanges: [...s.pendingChanges, change] })),
      clearPendingChanges: () => set({ pendingChanges: [] }),
    }),
    {
      name: 'trippy-ui',
      partialize: (s) => ({
        themeMode: s.themeMode,
        highContrast: s.highContrast,
        reducedMotion: s.reducedMotion,
        hideBudget: s.hideBudget,
        showCarbonBudget: s.showCarbonBudget,
        hideTravelVault: s.hideTravelVault,
        dayEndHour: s.dayEndHour,
      }),
    }
  )
);
