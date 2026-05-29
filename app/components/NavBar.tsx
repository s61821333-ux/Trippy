'use client';

import { m, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { spring } from '@/lib/motion';
import { haptic } from '@/lib/haptics';
import Icon from './ui/Icon';
import CompassMark from './ui/CompassMark';
import CompassLoader from './ui/CompassLoader';
import { Screen } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

interface NavBarProps {
  active: Screen;
  onChange: (s: Screen) => void;
  onSettings?: () => void;
  isLoading?: boolean;
}

const TABS: {
  id: Screen;
  icon: 'grid' | 'compass' | 'map' | 'checklist' | 'users';
  labelKey: 'navCamp' | 'navExplore' | 'navMap' | 'navPack' | 'navCrew';
  ariaLabel: string;
}[] = [
  { id: 'dashboard', icon: 'grid',      labelKey: 'navCamp',    ariaLabel: 'Overview' },
  { id: 'day',       icon: 'compass',   labelKey: 'navExplore', ariaLabel: 'Day planner' },
  { id: 'map',       icon: 'map',       labelKey: 'navMap',     ariaLabel: 'Map' },
  { id: 'supplies',  icon: 'checklist', labelKey: 'navPack',    ariaLabel: 'Packing list' },
  { id: 'crew',      icon: 'users',     labelKey: 'navCrew',    ariaLabel: 'Crew' },
];

export default function NavBar({ active, onChange, onSettings, isLoading }: NavBarProps) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 16));

  const handleChange = (id: Screen) => {
    haptic('light');
    onChange(id);
  };

  return (
    <>
      {/* ── Desktop: floating glass nav bar ── */}
      <m.div
        className="hidden md:flex relative z-50 w-full shrink-0"
        initial={{ y: -8, opacity: 0, filter: 'blur(4px)' }}
        animate={{ y: 0,  opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.45, ease: [0.25, 0, 0, 1], delay: 0.05 }}
        style={{
          backdropFilter: scrolled ? 'blur(40px) saturate(1.8)' : 'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: scrolled ? 'blur(40px) saturate(1.8)' : 'blur(24px) saturate(1.5)',
          background: scrolled
            ? 'rgba(255, 255, 255, 0.78)'
            : 'rgba(255, 255, 255, 0.55)',
          boxShadow: scrolled
            ? '0 12px 40px rgba(26,20,16,0.10), inset 0 -1px 0 rgba(255,255,255,0.60), inset 0 1px 0 rgba(255,255,255,0.80)'
            : 'inset 0 -1px 0 rgba(255,255,255,0.40)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.50)' : 'none',
          height: 'var(--nav-h)',
          transition: 'background 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease',
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 var(--page-px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}>
          {/* Brand */}
          <m.button
            onClick={() => handleChange('dashboard')}
            whileTap={{ scale: 0.94 }}
            transition={spring.snap}
            aria-label="Go to overview"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              userSelect: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <m.div key="loader"
                  initial={{ opacity: 0, scale: 0.7, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1,   filter: 'blur(0px)' }}
                  exit={{    opacity: 0, scale: 0.7, filter: 'blur(4px)' }}
                  transition={spring.snap}
                >
                  <CompassLoader size={32} />
                </m.div>
              ) : (
                <m.div key="mark"
                  initial={{ opacity: 0, scale: 0.7, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1,   filter: 'blur(0px)' }}
                  exit={{    opacity: 0, scale: 0.7, filter: 'blur(4px)' }}
                  transition={spring.snap}
                >
                  <CompassMark size={32} />
                </m.div>
              )}
            </AnimatePresence>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: 'var(--text)',
              lineHeight: 1,
              direction: 'ltr',
              unicodeBidi: 'isolate',
            }}>
              Trippy<span style={{ color: 'var(--terra)' }}>.</span>
            </span>
          </m.button>

          {/* Tabs */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'rgba(26,20,16,0.04)',
              borderRadius: 9999,
              padding: '3px 4px',
              border: '1px solid rgba(26,20,16,0.06)',
            }}
          >
            {TABS.map(tab => {
              const isActive = active === tab.id;
              return (
                <m.button
                  key={tab.id}
                  data-tour={`nav-${tab.id}`}
                  onClick={() => handleChange(tab.id)}
                  whileTap={{ scale: 0.92 }}
                  transition={spring.snap}
                  aria-label={tab.ariaLabel}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: isActive ? '7px 15px' : '7px 13px',
                    borderRadius: 9999,
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                    color: isActive ? '#ffffff' : 'rgba(26,20,16,0.42)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'color 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                  }}
                >
                  {/* Active pill background */}
                  <AnimatePresence>
                    {isActive && (
                      <m.span
                        layoutId="nav-active-pill"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{   opacity: 0, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 9999,
                          background: 'var(--brand)',
                          boxShadow: '0 8px 20px rgba(34,85,59,0.30), inset 0 1px 0 rgba(255,255,255,0.15)',
                          zIndex: 0,
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name={tab.icon} size={14} />
                    <span>{t(tab.labelKey)}</span>
                  </span>
                </m.button>
              );
            })}

            {onSettings && (
              <m.button
                onClick={onSettings}
                whileTap={{ scale: 0.92 }}
                transition={spring.snap}
                aria-label="Settings"
                aria-current={active === 'settings' ? 'page' : undefined}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  marginInlineStart: 2,
                  borderRadius: '50%',
                  border: 'none',
                  background: active === 'settings' ? 'var(--brand)' : 'transparent',
                  color: active === 'settings' ? '#ffffff' : 'rgba(26,20,16,0.42)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  boxShadow: active === 'settings' ? '0 8px 20px rgba(34,85,59,0.30)' : 'none',
                }}
              >
                <Icon name="settings" size={15} />
              </m.button>
            )}
          </nav>
        </div>
      </m.div>

      {/* ── Mobile: floating Jelly Pill nav ── */}
      <m.nav
        className="md:hidden"
        role="navigation"
        aria-label="Main navigation"
        initial={{ y: 24, opacity: 0, filter: 'blur(8px)' }}
        animate={{ y: 0,  opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
        style={{
          position: 'fixed',
          bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 36px)',
          maxWidth: 390,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(40px) saturate(1.9)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.9)',
          borderRadius: 9999,
          padding: '5px 6px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.80)',
            '0 24px 60px rgba(26,20,16,0.16)',
            '0 4px 12px rgba(26,20,16,0.06)',
          ].join(', '),
          border: '1px solid rgba(255,255,255,0.72)',
        }}
      >
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <m.button
              key={tab.id}
              data-tour={`nav-${tab.id}`}
              onClick={() => handleChange(tab.id)}
              whileTap={{ scale: 0.86, transition: { type: 'spring', stiffness: 500, damping: 22 } }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: isActive ? '8px 13px' : '8px 9px',
                borderRadius: isActive ? 22 : 18,
                border: 'none',
                background: 'transparent',
                color: isActive ? '#ffffff' : 'rgba(26,20,16,0.36)',
                cursor: 'pointer',
                transition: 'color 0.22s ease',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                flexShrink: 0,
                minWidth: 44,
                minHeight: 44,
              }}
            >
              {/* Shared animated background pill */}
              <AnimatePresence>
                {isActive && (
                  <m.span
                    layoutId="mobile-nav-active"
                    initial={{ opacity: 0, scale: 0.80 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{   opacity: 0, scale: 0.80 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 22,
                      background: 'var(--brand)',
                      boxShadow: '0 8px 20px rgba(34,85,59,0.32), inset 0 1px 0 rgba(255,255,255,0.18)',
                      zIndex: 0,
                    }}
                  />
                )}
              </AnimatePresence>

              <span style={{ position: 'relative', zIndex: 1, display: 'contents' }}>
                <Icon name={tab.icon} size={isActive ? 18 : 17} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  opacity: isActive ? 1 : 0.60,
                }}>
                  {t(tab.labelKey)}
                </span>
              </span>
            </m.button>
          );
        })}
      </m.nav>

      {/* Spacer for mobile pill */}
      <div
        className="md:hidden"
        style={{
          height: 'calc(20px + 62px + 20px + env(safe-area-inset-bottom, 0px))',
          flexShrink: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
