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
      background: 'rgba(0,0,0,0.28)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '2px solid rgba(255,255,255,0.50)',
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
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  // Build a beautiful conic/radial gradient from country colors
  const palette = colors.length >= 3 ? colors : [...colors, ...colors, ...colors];
  const gradientStops = palette.slice(0, 6).map((c, i, arr) => `${c} ${Math.round((i / arr.length) * 100)}%`).join(', ');
  const gradient = `conic-gradient(from 0deg, ${gradientStops})`;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: 'all',
        background: '#0a0a0a',
      }}
    >
      {/* Rotating conic gradient backdrop */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -30 }}
        animate={{ scale: 3.5, opacity: 0.85, rotate: 30 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          width: '100vmax', height: '100vmax',
          borderRadius: '50%',
          background: gradient,
          filter: 'blur(60px)',
        }}
      />

      {/* Ripple rings expanding outward */}
      {palette.slice(0, 4).map((color, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{ scale: [0, 2.8], opacity: [0.6, 0] }}
          transition={{
            duration: 1.1,
            delay: 0.08 + i * 0.12,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: '80vmax', height: '80vmax',
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 32px 8px ${color}55`,
          }}
        />
      ))}

      {/* Logo — springs in, fades out */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 12 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.05, 1, 0.92], y: [12, 0, 0, 0] }}
        transition={{ duration: 1.8, times: [0.10, 0.26, 0.72, 0.96], ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <TrippyLogo size={140} />
      </motion.div>
    </motion.div>
  );
}
