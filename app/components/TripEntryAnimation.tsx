'use client';

import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { getCountryColors } from '@/lib/countryColors';
import { deriveTheme } from '@/lib/deriveTheme';
import WelcomeAnimation, { type CountryEntry } from './WelcomeAnimation';

interface Props {
  countries: string[];
  tripName?: string;
  onDone: () => void;
}

export default function TripEntryAnimation({ countries, onDone }: Props) {
  const { colors, names } = getCountryColors(countries);
  const theme = deriveTheme(colors);

  // Cycle the 3 derived accent colors across each visited country
  const accents = [theme.c1, theme.c2, theme.c3];
  const countryEntries: CountryEntry[] = names.map((name, i) => ({
    name,
    accent: accents[i % accents.length],
  }));

  return (
    <AnimatePresence>
      <m.div
        key="trip-entry"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      >
        <WelcomeAnimation
          theme={theme}
          countries={countryEntries}
          duration={3.6}
          onDone={onDone}
        />
      </m.div>
    </AnimatePresence>
  );
}
