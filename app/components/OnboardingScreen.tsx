'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingScreenProps {
  onDone: () => void;
}

const SLIDES = [
  {
    headline: 'Plan your trip.\nTogether.',
    sub: 'Build a shared itinerary in real time with everyone on the trip.',
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 300, margin: '0 auto' }}>
        {[
          { time: '09:00', name: 'Coffee & Croissant', cat: '☕', color: '#F2CC72' },
          { time: '11:00', name: 'Louvre Museum', cat: '🏛️', color: '#62CCFA' },
          { time: '14:00', name: 'Lunch at Le Marais', cat: '🍽️', color: '#FFAA78' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 380, damping: 32 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '10px 12px',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: item.color + '33',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              {item.cat}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{item.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, fontFamily: 'var(--font-mono)' }}>{item.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    headline: 'Every detail.\nEvery day.',
    sub: 'Events, hotels, expenses, and packing — all in one place, always in sync.',
    preview: (
      <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 300, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '🗓️', label: 'Itinerary', color: 'rgba(59,110,82,0.12)' },
          { icon: '🏨', label: 'Hotels', color: 'rgba(144,66,202,0.12)' },
          { icon: '💰', label: 'Expenses', color: 'rgba(34,168,90,0.12)' },
          { icon: '🎒', label: 'Packing', color: 'rgba(26,142,218,0.12)' },
          { icon: '📝', label: 'Notes', color: 'rgba(196,113,74,0.12)' },
          { icon: '✈️', label: 'Flights', color: 'rgba(18,82,194,0.12)' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.07, type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: item.color,
              border: '1px solid var(--border)',
              borderRadius: 14, padding: '12px 16px',
              minWidth: 80,
            }}
          >
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>{item.label}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    headline: 'Start in\nseconds.',
    sub: 'Create a trip, share the link, and everyone is in instantly.',
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

  const skip = () => finish();

  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => { (swipeHandlers as any)._sx = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - ((swipeHandlers as any)._sx ?? 0);
      if (dx < -55 && !isLast) { setDir(1); setSlide(s => s + 1); }
      if (dx > 55 && slide > 0) { setDir(-1); setSlide(s => s - 1); }
    },
  };

  const { headline, sub, preview } = SLIDES[slide];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      {...swipeHandlers}
    >
      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px', flexShrink: 0 }}>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={skip}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)', padding: '6px 16px',
            fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
            cursor: 'pointer',
          }}
        >
          Skip
        </motion.button>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={slide}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}
          >
            {/* Illustration / preview */}
            {slide === 2 ? (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 72, lineHeight: 1 }}
              >
                ✈️
              </motion.div>
            ) : (
              <div style={{ width: '100%' }}>{preview}</div>
            )}

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 7vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              textAlign: 'center',
              lineHeight: 1.05,
              whiteSpace: 'pre-line',
            }}>
              {headline}
            </h1>

            <p style={{
              fontSize: 15,
              color: 'var(--text-2)',
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: 300,
              margin: 0,
            }}>
              {sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div style={{ flexShrink: 0, padding: '20px 28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === slide ? 22 : 7, background: i === slide ? 'var(--brand)' : 'var(--border)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              style={{ height: 7, borderRadius: 4 }}
            />
          ))}
        </div>

        {/* CTA buttons */}
        {isLast ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { localStorage.setItem('trippy-onboarded', '1'); onDone(); }}
              style={{
                background: 'var(--brand)', color: 'white',
                border: 'none', borderRadius: 'var(--radius-lg)',
                padding: '16px 28px', fontSize: 16, fontWeight: 800,
                cursor: 'pointer', width: '100%',
                boxShadow: '0 6px 20px rgba(59,110,82,0.30)',
              }}
            >
              Create trip
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { localStorage.setItem('trippy-onboarded', '1'); onDone(); }}
              style={{
                background: 'var(--surface)', color: 'var(--text)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
                padding: '14px 28px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', width: '100%',
              }}
            >
              Join with invite
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={advance}
            style={{
              background: 'var(--brand)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-lg)',
              padding: '16px 40px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', width: '100%', maxWidth: 360,
              boxShadow: '0 6px 20px rgba(59,110,82,0.28)',
            }}
          >
            Next →
          </motion.button>
        )}
      </div>
    </div>
  );
}
