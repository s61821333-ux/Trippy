'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCountryColors } from '@/lib/countryColors';

interface Props {
  countries: string[];
  onDone: () => void;
}

function TrippyLogo({ size = 128 }: { size?: number }) {
  const compassSize = size * 0.58;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.26,
      background: 'rgba(244,239,232,0.14)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1.5px solid rgba(244,239,232,0.40)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: size * 0.06,
    }}>
      <svg
        width={compassSize} height={compassSize}
        viewBox="0 0 240 240" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.35))' }}
      >
        <circle cx="120" cy="120" r="90" stroke="#F4EFE8" strokeWidth="4" fill="none"/>
        <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="#E0916B"/>
        <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="#8BB39A"/>
        <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="#E6B574" opacity="0.85"/>
        <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="#E6B574" opacity="0.85"/>
        <circle cx="120" cy="120" r="6" fill="#F4EFE8"/>
      </svg>
      <span style={{
        fontSize: size * 0.145, fontWeight: 700, color: '#F4EFE8',
        letterSpacing: '-0.04em', lineHeight: 1,
        textShadow: '0 1px 8px rgba(0,0,0,0.5)',
        fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
      }}>
        Trippy<span style={{ color: '#E0916B' }}>.</span>
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
