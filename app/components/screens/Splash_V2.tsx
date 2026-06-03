'use client';

import React, { useEffect } from 'react';
import { m } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import CompassMark from '../ui/CompassMark';

const ADVANCE_MS = 1900;

export default function Splash_V2() {
  const setScreen = useAppStore(s => s.setScreen);

  useEffect(() => {
    // Skip auto-advance in Playwright test mode to prevent resetting injected state
    if ((window as unknown as Record<string, unknown>).__trippyTestMode__) return;
    const id = setTimeout(() => {
      // If auth has already found a user with a stored trip, loadTripById is in flight
      // and will navigate to dashboard on its own. Firing setScreen('welcome') here would
      // interrupt that and flash the auth screen over the loading trip.
      const { authUser, tripDbId } = useAppStore.getState();
      if (authUser && tripDbId) return;
      setScreen('welcome');
    }, ADVANCE_MS);
    return () => clearTimeout(id);
  }, [setScreen]);

  return (
    <div
      aria-label="Trippy"
      aria-live="polite"
      style={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: [
          'radial-gradient(70% 60% at 22% 12%, oklch(68% 0.15 62) 0%, transparent 52%)',
          'radial-gradient(55% 48% at 85% 18%, oklch(60% 0.16 28) 0%, transparent 48%)',
          'radial-gradient(60% 55% at 12% 88%, oklch(38% 0.10 160) 0%, transparent 52%)',
          'linear-gradient(155deg, oklch(50% 0.13 48), oklch(30% 0.08 58))',
        ].join(', '),
      }}
    >
      {/* Ambient amber orb */}
      <m.div
        aria-hidden="true"
        animate={{ opacity: [0, 0.55, 0.4] }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '10%', right: '8%',
          width: 220, height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(78% 0.20 68 / 28%) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Outer orbit ring */}
      <m.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          width: 320, height: 320,
          borderRadius: '50%',
          border: '1px solid oklch(100% 0 0 / 11%)',
          pointerEvents: 'none',
        }}
      />

      {/* Inner orbit ring */}
      <m.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          width: 200, height: 200,
          borderRadius: '50%',
          border: '1px solid oklch(100% 0 0 / 18%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo lockup */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

        {/* Glass disc → paper disc → CompassMark */}
        <m.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          style={{
            width: 132, height: 132,
            borderRadius: '50%',
            background: 'oklch(100% 0 0 / 16%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: [
              '0 28px 64px oklch(10% 0.02 55 / 42%)',
              '0 8px 20px oklch(10% 0.02 55 / 22%)',
              'inset 0 1px 0 oklch(100% 0 0 / 55%)',
              'inset 0 0 0 1px oklch(100% 0 0 / 14%)',
            ].join(', '),
          }}
        >
          <div style={{
            background: '#F4EFE8',
            width: 96, height: 96,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 1px 3px oklch(20% 0 0 / 7%)',
          }}>
            <CompassMark size={68} />
          </div>
        </m.div>

        {/* Wordmark */}
        <m.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: '#fff',
            lineHeight: 1,
            textShadow: '0 2px 16px oklch(10% 0 0 / 30%)',
          }}
        >
          Trippy<span style={{ color: 'var(--lg-sand)' }}>.</span>
        </m.span>
      </div>
    </div>
  );
}
