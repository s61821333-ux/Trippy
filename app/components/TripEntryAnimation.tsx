'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCountryColors } from '@/lib/countryColors';

interface Props {
  countries: string[];
  onDone: () => void;
}

function TrippyLogo({ size = 128 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.26,
      background: 'rgba(0,0,0,0.22)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '2px solid rgba(255,255,255,0.45)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 6,
    }}>
      <span style={{ fontSize: size * 0.52, lineHeight: 1, filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}>
        🌍
      </span>
      <span style={{
        fontSize: size * 0.145, fontWeight: 800, color: 'white', letterSpacing: '-0.03em',
        textShadow: '0 1px 6px rgba(0,0,0,0.4)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        trippy
      </span>
    </div>
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
        }}
      >
        <TrippyLogo size={136} />
      </motion.div>
    </motion.div>
  );
}
