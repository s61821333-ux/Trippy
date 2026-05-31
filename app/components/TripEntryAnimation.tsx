'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCountryColors } from '@/lib/countryColors';
import { deriveTheme } from '@/lib/deriveTheme';
import WelcomeAnimation from './WelcomeAnimation';

interface Props {
  countries: string[];
  onDone: () => void;
}

export default function TripEntryAnimation({ countries, onDone }: Props) {
  const { colors } = getCountryColors(countries);
  const theme = deriveTheme(colors);

  return (
    <AnimatePresence>
      <motion.div
        key="trip-entry"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      >
        <WelcomeAnimation
          theme={theme}
          duration={3.6}
          onDone={onDone}
        />
      </motion.div>
    </AnimatePresence>
  );
}
