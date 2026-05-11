'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCountryColors } from '@/lib/countryColors';
import { useI18n } from '@/lib/i18n';

interface Props {
  countries: string[];
  onDone: () => void;
}

export default function TripEntryAnimation({ countries, onDone }: Props) {
  const { colors } = getCountryColors(countries);
  const primaryColor = colors[0] || 'var(--brand)';
  const secondaryColor = colors[1] || 'var(--brand-light)';
  const { t, isRTL } = useI18n();

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Sequence the phases
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => onDone(), 3800); // Trigger exit slightly before 4s
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  // Determine country name if available
  const destName = countries.length > 0 ? countries[0] : 'Destination';

  // Dynamic text based on phase
  const getStatusText = () => {
    if (phase === 0) return t('packingBags');
    if (phase === 1) return t('headingTo').replace('{country}', destName);
    return t('landing');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: 'all',
      }}
    >
      {/* Background Liquid / Expanding Circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: [0, 5, 5], opacity: [0.8, 1, 0.9] }}
        transition={{ duration: 4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: '50vmax', height: '50vmax',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          filter: 'blur(60px)',
          opacity: 0.6,
        }}
      />
      
      {/* Darken Overlay for Glassmorphism pop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
        style={{ position: 'absolute', inset: 0, background: 'black' }}
      />

      {/* Central Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        style={{
          position: 'relative',
          padding: '32px 40px',
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          maxWidth: '90%',
          width: 400,
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Dynamic Status Text */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={phase}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              margin: 0,
            }}
          >
            {getStatusText()}
          </motion.h2>
        </AnimatePresence>

        {/* Flight Path Animation */}
        <div style={{ position: 'relative', width: '100%', height: 40, display: 'flex', alignItems: 'center' }}>
          {/* Dashed Line */}
          <div style={{
            position: 'absolute',
            left: 10, right: 10,
            height: 2,
            background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 6px, transparent 6px, transparent 12px)',
          }} />

          {/* Origin Dot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
            style={{
              position: 'absolute',
              [isRTL ? 'right' : 'left']: 0,
              width: 12, height: 12, borderRadius: '50%',
              background: 'white',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}
          />

          {/* Destination Pin */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.6 }}
            style={{
              position: 'absolute',
              [isRTL ? 'left' : 'right']: -6,
              top: -14,
              fontSize: 24,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            📍
          </motion.div>

          {/* Airplane flying across */}
          <motion.div
            initial={{ [isRTL ? 'right' : 'left']: '0%' }}
            animate={{ [isRTL ? 'right' : 'left']: '100%' }}
            transition={{
              duration: 2.8,
              ease: 'easeInOut',
              delay: 0.8
            }}
            style={{
              position: 'absolute',
              top: -8,
              fontSize: 24,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
              transform: `translateX(${isRTL ? '50%' : '-50%'}) ${isRTL ? 'scaleX(-1)' : ''}`, // Flip airplane for RTL
            }}
          >
            ✈️
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
