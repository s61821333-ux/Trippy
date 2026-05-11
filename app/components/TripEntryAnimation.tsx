'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCountryColors } from '@/lib/countryColors';

interface Props {
  countries: string[];
  onDone: () => void;
}

function TrippyLogo({ size = 128 }: { size?: number }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded background */}
      <rect x="4" y="4" width="112" height="112" rx="28" fill="rgba(255,255,255,0.18)" />
      <rect x="4" y="4" width="112" height="112" rx="28" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      {/* Tent / mountain shape */}
      <path d="M60 22 L28 78 L92 78 Z" fill="rgba(255,255,255,0.95)" />
      {/* Door opening */}
      <path d="M52 78 Q52 62 60 62 Q68 62 68 78 Z" fill="rgba(255,255,255,0.25)" />
      {/* Wordmark */}
      <text
        x="60" y="100"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="18"
        letterSpacing="-0.5"
        fill="white"
      >
        trippy
      </text>
    </svg>
  );
}

export default function TripEntryAnimation({ countries, onDone }: Props) {
  const { colors } = getCountryColors(countries);

  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

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
      {strips.map((color, i) => (
        <motion.div
          key={i}
          initial={{ scaleX: 0 }}
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

      {/* Globe — no text, pure visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.65 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.65, 1, 1, 0.9] }}
        transition={{ duration: 4, times: [0.18, 0.32, 0.75, 0.95] }}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          filter: 'drop-shadow(0 6px 28px rgba(0,0,0,0.45))',
        }}
      >
        <TrippyLogo size={136} />
      </motion.div>
    </motion.div>
  );
}
