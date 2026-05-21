'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  tripEntryCountries: string[] | null;
  demoClickCount: number;

  setTripEntryCountries: (c: string[] | null) => void;
  clearTripEntry: () => void;
  recordDemoClick: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      tripEntryCountries: null,
      demoClickCount: 0,

      setTripEntryCountries: (c) => set({ tripEntryCountries: c }),
      clearTripEntry: () => set({ tripEntryCountries: null }),
      recordDemoClick: () => set((s) => ({ demoClickCount: s.demoClickCount + 1 })),
    }),
    {
      name: 'trippy-session',
      partialize: () => ({}), // session state is not persisted
    }
  )
);
