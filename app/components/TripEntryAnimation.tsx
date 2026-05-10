'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCountryColors } from '@/lib/countryColors';

interface Props {
  countries: string[];
  onDone: () => void;
}

export default function TripEntryAnimation({ countries, onDone }: Props) {
  const { colors, flags, names } = getCountryColors(countries);

  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  // Build strips — repeat colors to fill screen nicely
  const STRIPS = 7;
  const strips = Array.from({ length: STRIPS }, (_, i) => colors[i % colors.length]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: 'all',
      }}
    >
      {/* Colored strips */}
      {strips.map((color, i) => (
        <motion.div
          key={i}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: [0, 1, 1, 0] }}
          transition={{
            duration: 4,
            times: [0, 0.25, 0.75, 1],
            ease: ['easeOut', 'linear', 'easeIn'],
            delay: i * 0.04,
          }}
          style={{
            flex: 1,
            background: color,
            transformOrigin: i % 2 === 0 ? 'left center' : 'right center',
          }}
        />
      ))}

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, times: [0.2, 0.35, 0.75, 0.95] }}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, pointerEvents: 'none',
        }}
      >
        {/* Flag emojis */}
        <div style={{ fontSize: flags.length > 2 ? 44 : 64, lineHeight: 1.1, letterSpacing: 4 }}>
          {flags.slice(0, 4).join(' ')}
        </div>

        {/* Country names */}
        <div style={{
          fontSize: names.length > 2 ? 18 : 24,
          fontWeight: 800,
          color: '#ffffff',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          textAlign: 'center',
          letterSpacing: '-0.02em',
          maxWidth: 280,
        }}>
          {names.slice(0, 4).join(' · ')}
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4, times: [0.35, 0.5, 0.75, 0.9] }}
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 500,
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
            letterSpacing: '0.05em',
          }}
        >
          Let the adventure begin ✈️
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
