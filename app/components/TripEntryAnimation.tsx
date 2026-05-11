'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCountryColors } from '@/lib/countryColors';

interface Props {
  countries: string[];
  onDone: () => void;
}

function GlobeIcon({ size = 128 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" stroke="white" strokeWidth="2.5" fill="rgba(255,255,255,0.07)" />
      {/* Equator */}
      <line x1="6" y1="50" x2="94" y2="50" stroke="white" strokeWidth="1.6" strokeOpacity="0.75" />
      {/* Prime meridian */}
      <line x1="50" y1="6" x2="50" y2="94" stroke="white" strokeWidth="1.6" strokeOpacity="0.75" />
      {/* Tropic curves */}
      <path d="M 13 33 Q 50 26 87 33" stroke="white" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
      <path d="M 13 67 Q 50 74 87 67" stroke="white" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
      {/* Meridian ellipses for 3-D depth */}
      <ellipse cx="50" cy="50" rx="22" ry="44" stroke="white" strokeWidth="1.6" fill="none" strokeOpacity="0.65" />
      <ellipse cx="50" cy="50" rx="38" ry="44" stroke="white" strokeWidth="0.9" fill="none" strokeOpacity="0.35" />
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
        <GlobeIcon size={136} />
      </motion.div>
    </motion.div>
  );
}
