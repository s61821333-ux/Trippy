'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import CompassMark from '../ui/CompassMark';
import Icon from '../ui/Icon';

// Always the warm brand welcome — theme-independent.

export default function Welcome_V2() {
  const { t, locale } = useI18n();
  const signInWithGoogle = useAppStore(s => s.signInWithGoogle);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try { await signInWithGoogle(); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      // Warm terra gradient — always warm, ignores dark mode
      background: [
        'radial-gradient(100% 70% at 50% 0%, oklch(60% 0.13 60) 0%, transparent 60%)',
        'linear-gradient(170deg, oklch(54% 0.13 45), oklch(34% 0.09 40))',
      ].join(', '),
    }}>

      {/* Floating compass disc */}
      <m.div
        aria-hidden="true"
        animate={{ y: [0, -5, 0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 110, left: '50%',
          transform: 'translateX(-50%)',
          width: 96, height: 96,
          borderRadius: '50%',
          background: '#F4EFE8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 24px 60px oklch(20% 0.03 60 / 36%)',
        }}
      >
        <CompassMark size={66} />
      </m.div>

      {/* Glass card pinned to bottom */}
      <m.div
        className="lg lg-strong"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          margin: 20,
          borderRadius: 'var(--lg-r-lg)',
          padding: '30px 26px 26px',
          textAlign: 'center',
        }}
      >
        {/* Wordmark */}
        <span
          className="display-xl"
          style={{ fontSize: 52, color: 'var(--lg-forest)', display: 'block', lineHeight: 1 }}
        >
          Trippy<span style={{ color: 'var(--lg-terra)', fontStyle: 'normal' }}>.</span>
        </span>

        {/* Tagline */}
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 19,
          color: 'var(--lg-terra)',
          margin: '6px 0 0',
        }}>
          {t('appTagline') || 'Plan together. Discover more.'}
        </p>

        {/* Body paragraph */}
        <p style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: 'var(--text-2)',
          margin: '16px 0 24px',
          maxWidth: 280,
          marginInline: 'auto',
        }}>
          {locale === 'he'
            ? 'הסטנדרט החדש בטיולים משותפים. ממדבריות חול ועד אורות העיר, המסע שלך מתחיל כאן.'
            : 'The new standard in collaborative travel. From desert dunes to city lights, your journey begins here.'}
        </p>

        {/* Forest CTA */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="lg-btn lg-btn-forest"
          style={{
            width: '100%',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            opacity: loading ? 0.75 : 1,
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
          aria-label={locale === 'he' ? 'התחל הרפתקה' : 'Start an adventure'}
        >
          <span>{loading
            ? (locale === 'he' ? 'מתחבר…' : 'Signing in…')
            : (locale === 'he' ? 'התחל הרפתקה' : 'Start an adventure')}
          </span>
          {!loading && <Icon name="arrow" size={18} color="#fff" />}
        </button>

        {/* Mono footer row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          marginTop: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: 9.5,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
        }}>
          <span>Document</span>
          <span style={{ width: 3, height: 3, borderRadius: 9, background: 'var(--lg-terra)', flexShrink: 0 }} />
          <span>Discover</span>
          <span style={{ width: 3, height: 3, borderRadius: 9, background: 'var(--lg-terra)', flexShrink: 0 }} />
          <span>Collaborate</span>
        </div>
      </m.div>
    </div>
  );
}
