'use client';

import React, { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { CompassLoader, LoaderStyles, BRAND_THEME } from './ui/TripLoaders';

interface Props {
  countries: string[];
  tripName?: string;
  onDone: () => void;
}

export default function TripEntryAnimation({ tripName, onDone }: Props) {
  useEffect(() => {
    const id = setTimeout(onDone, 600);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      <m.div
        key="trip-entry"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 28,
        }}
      >
        <LoaderStyles />
        <CompassLoader theme={BRAND_THEME} size={200} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em',
            color: 'var(--text)', lineHeight: 1,
            direction: 'ltr', unicodeBidi: 'isolate',
          }}>
            Triplly<span style={{ color: 'var(--terra)' }}>.</span>
          </span>
          {tripName && (
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 15,
              color: 'var(--text-2)',
              letterSpacing: '0.01em',
            }}>
              {tripName}
            </span>
          )}
        </div>
      </m.div>
    </AnimatePresence>
  );
}
