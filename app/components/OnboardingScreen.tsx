'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CompassMark from './ui/CompassMark';
import { CompassLoader, BRAND_THEME } from './ui/TripLoaders';

interface OnboardingScreenProps {
  onDone: () => void;
}

const spring = { type: 'spring' as const, stiffness: 380, damping: 32 };

const SLIDES = [
  {
    id: 'together',
    headline: 'Plan your trip.\nTogether.',
    sub: 'Build a shared itinerary in real time with everyone on the trip.',
    accent: 'var(--forest)',
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320, margin: '0 auto' }}>
        {[
          { time: '09:00', name: 'Coffee & Croissant', emoji: '☕', color: '#C8944A' },
          { time: '11:00', name: 'Louvre Museum',       emoji: '🏛️', color: '#3B6E52' },
          { time: '14:00', name: 'Lunch at Le Marais',  emoji: '🍽️', color: '#C4714A' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.28 + i * 0.13 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'oklch(97% 0.01 80 / 0.82)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
              borderWidth: 1, borderStyle: 'solid',
              borderColor: 'oklch(100% 0 0 / 0.10)',
              borderTopColor: 'oklch(100% 0 0 / 0.38)',
              borderLeftColor: 'oklch(100% 0 0 / 0.24)',
              borderBottomColor: 'rgba(26,20,16,0.06)',
              borderRightColor: 'rgba(26,20,16,0.04)',
              borderRadius: 20,
              padding: '12px 14px',
              boxShadow: '0 4px 16px rgba(26,20,16,0.08)',
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 14, flexShrink: 0,
              background: item.color + '22',
              border: `1.5px solid ${item.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {item.emoji}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>{item.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{item.time}</p>
            </div>
            <div style={{ marginInlineStart: 'auto', flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: item.color, opacity: 0.7 }} />
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'detail',
    headline: 'Every detail.\nEvery day.',
    sub: 'Events, hotels, expenses, and packing — all in one place, always in sync.',
    accent: 'var(--terra)',
    preview: (
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '🗓️', label: 'Itinerary', color: 'rgba(59,110,82,0.16)',  border: 'rgba(59,110,82,0.30)'  },
          { icon: '🏨', label: 'Hotels',    color: 'rgba(144,66,202,0.14)', border: 'rgba(144,66,202,0.28)' },
          { icon: '💰', label: 'Expenses',  color: 'rgba(34,168,90,0.14)',  border: 'rgba(34,168,90,0.28)'  },
          { icon: '🎒', label: 'Packing',   color: 'rgba(26,142,218,0.14)', border: 'rgba(26,142,218,0.28)' },
          { icon: '📝', label: 'Notes',     color: 'rgba(196,113,74,0.14)', border: 'rgba(196,113,74,0.28)' },
          { icon: '✈️', label: 'Flights',   color: 'rgba(18,82,194,0.14)',  border: 'rgba(18,82,194,0.28)'  },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.2 + i * 0.08 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              background: item.color,
              border: `1.5px solid ${item.border}`,
              borderRadius: 24, padding: '14px 18px',
              minWidth: 86,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <span style={{ fontSize: 26 }}>{item.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>{item.label}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'start',
    headline: 'Start in\nseconds.',
    sub: 'Create a trip, share the link, and everyone is in instantly.',
    accent: 'var(--sand)',
    preview: null,
  },
];

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const isLast = slide === SLIDES.length - 1;

  const finish = () => {
    localStorage.setItem('trippy-onboarded', '1');
    onDone();
  };

  const advance = () => {
    if (isLast) { finish(); return; }
    setDir(1);
    setSlide(s => s + 1);
  };

  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => { (swipeHandlers as any)._sx = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - ((swipeHandlers as any)._sx ?? 0);
      if (dx < -55 && !isLast) { setDir(1); setSlide(s => s + 1); }
      if (dx > 55 && slide > 0) { setDir(-1); setSlide(s => s - 1); }
    },
  };

  const { headline, sub, preview, accent } = SLIDES[slide];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        overflow: 'hidden',
      }}
      {...swipeHandlers}
    >
      {/* Ambient background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: -120, right: -80,
            width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,110,82,0.16) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{ x: [0, -18, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: -100, left: -80,
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,113,74,0.14) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,148,74,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={spring}
          onClick={finish}
          style={{
            background: 'oklch(97% 0.01 80 / 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid oklch(100% 0 0 / 0.20)',
            borderRadius: 9999,
            padding: '7px 18px',
            fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Skip
        </motion.button>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={slide}
            custom={dir}
            initial={{ opacity: 0, x: dir * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -48 }}
            transition={spring}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}
          >
            {/* Preview or compass loader */}
            {slide === 2 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.1 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                  background: 'oklch(97% 0.01 80 / 0.80)',
                  backdropFilter: 'blur(40px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
                  borderWidth: 1, borderStyle: 'solid',
                  borderColor: 'oklch(100% 0 0 / 0.10)',
                  borderTopColor: 'oklch(100% 0 0 / 0.40)',
                  borderRadius: 32, padding: '32px 40px',
                  boxShadow: '0 12px 40px rgba(26,20,16,0.10)',
                }}
              >
                <CompassLoader theme={BRAND_THEME} size={100} />
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700,
                  letterSpacing: '-0.04em', color: 'var(--text)',
                  direction: 'ltr', lineHeight: 1,
                }}>
                  Trippy<span style={{ color: 'var(--terra)' }}>.</span>
                </div>
              </motion.div>
            ) : (
              <div style={{ width: '100%' }}>{preview}</div>
            )}

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 8vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--text)',
              textAlign: 'center',
              lineHeight: 1.05,
              whiteSpace: 'pre-line',
              fontFamily: 'var(--font-sans)',
            }}>
              {headline}
            </h1>

            <p style={{
              fontSize: 16,
              color: 'var(--text-2)',
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: 300,
              margin: 0,
              fontFamily: 'var(--font-sans)',
            }}>
              {sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div style={{ flexShrink: 0, padding: '20px 28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, position: 'relative', zIndex: 1 }}>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setDir(i > slide ? 1 : -1); setSlide(i); }}
              animate={{
                width: i === slide ? 28 : 8,
                background: i === slide ? accent : 'var(--border-strong)',
                opacity: i === slide ? 1 : 0.5,
              }}
              transition={spring}
              style={{ height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>

        {/* CTA */}
        {isLast ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
            <motion.button
              whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              onClick={finish}
              style={{
                background: 'var(--brand)', color: 'white',
                border: 'none', borderRadius: 24,
                padding: '17px 28px', fontSize: 16, fontWeight: 800,
                cursor: 'pointer', width: '100%',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '-0.02em',
                boxShadow: '0 8px 28px rgba(59,110,82,0.32), 0 2px 8px rgba(59,110,82,0.18)',
              }}
            >
              Create trip
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.06 }}
              onClick={finish}
              style={{
                background: 'oklch(97% 0.01 80 / 0.80)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: 'var(--text)',
                border: '1.5px solid var(--border)',
                borderTopColor: 'oklch(100% 0 0 / 0.32)',
                borderRadius: 24,
                padding: '15px 28px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', width: '100%',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '-0.01em',
              }}
            >
              Join with invite
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{
              scale: 0.95,
              transition: { type: 'spring', stiffness: 500, damping: 20 },
            }}
            onClick={advance}
            style={{
              background: 'var(--brand)', color: 'white',
              border: 'none', borderRadius: 24,
              padding: '17px 44px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', width: '100%', maxWidth: 360,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.02em',
              boxShadow: '0 8px 28px rgba(59,110,82,0.30), 0 2px 8px rgba(59,110,82,0.16)',
            }}
          >
            Next →
          </motion.button>
        )}
      </div>
    </div>
  );
}
