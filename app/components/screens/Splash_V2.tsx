'use client';

import React, { useEffect } from 'react';
import { m } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import CompassMark from '../ui/CompassMark';

// Always the warm brand moment — theme-independent.
const ADVANCE_MS = 1900;

export default function Splash_V2() {
  const setScreen = useAppStore(s => s.setScreen);

  useEffect(() => {
    const id = setTimeout(() => setScreen('welcome'), ADVANCE_MS);
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
        // Warm sunset mesh — always warm, ignores dark mode
        background: [
          'radial-gradient(110% 80% at 25% 15%, oklch(62% 0.13 78) 0%, transparent 55%)',
          'radial-gradient(120% 90% at 90% 80%, oklch(55% 0.16 36) 0%, transparent 55%)',
          'radial-gradient(120% 100% at 40% 100%, oklch(40% 0.10 158) 0%, transparent 60%)',
          'linear-gradient(160deg, oklch(48% 0.10 160), oklch(32% 0.08 60))',
        ].join(', '),
      }}
    >
      {/* Orbit ring — floating compass dial / globe */}
      <m.div
        aria-hidden="true"
        animate={{ y: [0, -5, 0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 520, height: 520,
          borderRadius: '50%',
          border: '1px solid oklch(100% 0 0 / 14%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo lockup */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>

        {/* Glass disc → paper disc → CompassMark */}
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          style={{
            width: 124, height: 124, borderRadius: '50%',
            background: 'oklch(100% 0 0 / 16%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: [
              'inset 0 1px 0 oklch(100% 0 0 / 40%)',
              '0 20px 50px oklch(20% 0.03 60 / 30%)',
            ].join(', '),
          }}
        >
          <div style={{
            background: '#F4EFE8',
            width: 90, height: 90, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CompassMark size={64} />
          </div>
        </m.div>

        {/* Wordmark */}
        <m.span
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          Trippy<span style={{ color: 'var(--lg-sand)' }}>.</span>
        </m.span>
      </div>
    </div>
  );
}
