'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import CompassMark from '../ui/CompassMark';
import Icon from '../ui/Icon';

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
      background: [
        'radial-gradient(72% 58% at 18% 8%,  oklch(72% 0.16 58) 0%, transparent 54%)',
        'radial-gradient(56% 46% at 84% 14%,  oklch(65% 0.17 26) 0%, transparent 46%)',
        'radial-gradient(62% 52% at 10% 90%,  oklch(40% 0.10 160) 0%, transparent 54%)',
        'radial-gradient(44% 36% at 78% 78%,  oklch(48% 0.13 36) 0%, transparent 48%)',
        'linear-gradient(165deg, oklch(54% 0.145 44), oklch(27% 0.082 52))',
      ].join(', '),
    }}>

      {/* Ambient orb — amber */}
      <m.div
        aria-hidden="true"
        animate={{ x: [0, 20, -8, 0], y: [0, -28, 14, 0], opacity: [0.45, 0.65, 0.4, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '6%', right: '4%',
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(80% 0.20 70 / 26%) 0%, transparent 70%)',
          filter: 'blur(32px)', pointerEvents: 'none',
        }}
      />

      {/* Ambient orb — forest */}
      <m.div
        aria-hidden="true"
        animate={{ x: [0, -16, 10, 0], y: [0, 22, -20, 0], opacity: [0.3, 0.48, 0.28, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '32%', left: '3%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(56% 0.14 158 / 28%) 0%, transparent 70%)',
          filter: 'blur(36px)', pointerEvents: 'none',
        }}
      />

      {/* Compass hero group — orbit rings + disc */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Outer orbit ring */}
        <m.div
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: 290, height: 290,
            borderRadius: '50%',
            border: '1px solid oklch(100% 0 0 / 9%)',
          }}
        />
        {/* Inner orbit ring */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 174, height: 174,
            borderRadius: '50%',
            border: '1px solid oklch(100% 0 0 / 16%)',
          }}
        />

        {/* Compass disc */}
        <m.div
          animate={{ y: [0, -7, 0, 7, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 112, height: 112,
            borderRadius: '50%',
            background: 'oklch(100% 0 0 / 16%)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: [
              '0 30px 72px oklch(8% 0.02 55 / 48%)',
              '0 8px 22px oklch(8% 0.02 55 / 26%)',
              'inset 0 1px 0 oklch(100% 0 0 / 55%)',
              'inset 0 0 0 1px oklch(100% 0 0 / 14%)',
            ].join(', '),
          }}
        >
          <div style={{
            background: '#F4EFE8',
            width: 82, height: 82,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 1px 3px oklch(20% 0 0 / 8%)',
          }}>
            <CompassMark size={58} />
          </div>
        </m.div>
      </div>

      {/* Glass card pinned to bottom */}
      <m.div
        className="lg lg-strong"
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          margin: '0 16px 20px',
          borderRadius: 'var(--lg-r-lg)',
          padding: '32px 28px 26px',
          textAlign: 'center',
        }}
      >
        {/* Wordmark */}
        <m.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="display-xl"
          style={{ fontSize: 54, color: 'var(--lg-forest)', display: 'block', lineHeight: 1 }}
        >
          Trippy<span style={{ color: 'var(--lg-terra)', fontStyle: 'normal' }}>.</span>
        </m.span>

        {/* Tagline */}
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.48 }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 19,
            color: 'var(--lg-terra)',
            margin: '7px 0 0',
          }}
        >
          {t('appTagline') || (locale === 'he' ? 'תכנן. גלה. חווה.' : 'Plan together. Discover more.')}
        </m.p>

        {/* Body */}
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44, duration: 0.48 }}
          style={{
            fontSize: 14,
            lineHeight: 1.62,
            color: 'var(--text-2)',
            margin: '16px 0 24px',
            maxWidth: 272,
            marginInline: 'auto',
          }}
        >
          {locale === 'he'
            ? 'תכנן טיולים עם אנשים שאתה אוהב. בנה מסלול, שמור הכל, ותיהנה מכל רגע.'
            : 'Plan trips with the people you love. Build an itinerary, keep everything in one place, and enjoy every moment.'}
        </m.p>

        {/* Forest CTA */}
        <m.button
          onClick={handleStart}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="lg-btn lg-btn-forest"
          style={{
            width: '100%',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            height: 54,
            opacity: loading ? 0.75 : 1,
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'relative',
            overflow: 'hidden',
          }}
          aria-label={locale === 'he' ? 'התחל הרפתקה' : 'Start an adventure'}
        >
          {/* Shimmer streak */}
          {!loading && (
            <m.span
              aria-hidden="true"
              animate={{ x: ['-140%', '240%'] }}
              transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, oklch(100% 0 0 / 16%) 50%, transparent 100%)',
                transform: 'skewX(-18deg)',
                pointerEvents: 'none',
              }}
            />
          )}
          <span style={{ position: 'relative' }}>
            {loading
              ? (locale === 'he' ? 'מתחבר…' : 'Signing in…')
              : (locale === 'he' ? 'התחל הרפתקה' : 'Start an adventure')}
          </span>
          {!loading && (
            <span style={{ position: 'relative' }}>
              <Icon name="arrow" size={18} color="#fff" />
            </span>
          )}
        </m.button>

        {/* Mono footer */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 20,
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
          }}
        >
          <span>{locale === 'he' ? 'תכנן' : 'Plan'}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--lg-terra)', flexShrink: 0, opacity: 0.85 }} />
          <span>{locale === 'he' ? 'גלה' : 'Explore'}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--lg-terra)', flexShrink: 0, opacity: 0.85 }} />
          <span>{locale === 'he' ? 'זכור' : 'Remember'}</span>
        </m.div>
      </m.div>
    </div>
  );
}
