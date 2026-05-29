'use client';

import { m, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState, useCallback } from 'react';
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
  onSwitchTrip?: () => void;
  onAdd?: () => void;
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

export default function NavBar({ active, onChange, onSettings, onSwitchTrip, onAdd, isLoading }: NavBarProps) {
  const { t, isRTL } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [expandOpen, setExpandOpen] = useState(false);
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
          backdropFilter: scrolled ? 'blur(48px) saturate(1.9)' : 'blur(28px) saturate(1.6)',
          WebkitBackdropFilter: scrolled ? 'blur(48px) saturate(1.9)' : 'blur(28px) saturate(1.6)',
          background: scrolled
            ? 'oklch(99% 0.004 80 / 82%)'
            : 'oklch(99% 0.004 80 / 58%)',
          boxShadow: scrolled
            ? '0 12px 40px oklch(13% 0.012 55 / 10%), inset 0 1px 0 oklch(100% 0 0 / 80%), inset 0 -1px 0 oklch(100% 0 0 / 40%)'
            : 'inset 0 1px 0 oklch(100% 0 0 / 50%)',
          borderBottom: scrolled ? '1px solid oklch(100% 0 0 / 45%)' : 'none',
          height: 'var(--nav-h)',
          transition: 'background 0.32s cubic-bezier(0.25,0,0,1), box-shadow 0.32s ease, backdrop-filter 0.32s ease',
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
              background: 'oklch(13% 0.012 55 / 5%)',
              borderRadius: 9999,
              padding: '3px 4px',
              border: '1px solid oklch(13% 0.012 55 / 7%)',
              boxShadow: 'inset 0 1px 0 oklch(100% 0 0 / 30%)',
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
                          background: 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))',
                          boxShadow: 'var(--lg-glow-terra), inset 0 1px 0 oklch(100% 0 0 / 30%)',
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
                  background: active === 'settings' ? 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))' : 'transparent',
                  color: active === 'settings' ? '#ffffff' : 'rgba(26,20,16,0.42)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  boxShadow: active === 'settings' ? 'var(--lg-glow-terra)' : 'none',
                }}
              >
                <Icon name="settings" size={15} />
              </m.button>
            )}
          </nav>
        </div>
      </m.div>

      {/* ── Mobile: floating pill nav ── */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom, 14px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {/* Expansion panel — Switch trip / Settings */}
        <AnimatePresence>
          {expandOpen && (
            <m.div
              key="expand-panel"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="lg lg-strong"
              style={{
                display: 'flex',
                gap: 8,
                padding: 8,
                borderRadius: 9999,
                pointerEvents: 'auto',
              }}
            >
              {onSwitchTrip && (
                <m.button
                  onClick={() => { setExpandOpen(false); onSwitchTrip(); }}
                  whileTap={{ scale: 0.94 }}
                  className="lg-btn"
                  style={{
                    height: 42,
                    padding: '0 16px',
                    gap: 7,
                    background: 'transparent',
                    color: 'var(--lg-ink)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Icon name="swap" size={17} style={{ color: 'var(--lg-terra)' }} />
                  <span>{t('switchTrip') as string || 'Switch trip'}</span>
                </m.button>
              )}
              {onSwitchTrip && onSettings && (
                <div style={{ width: 1, background: 'oklch(50% 0.02 60 / 22%)', margin: '6px 0' }} />
              )}
              {onSettings && (
                <m.button
                  onClick={() => { setExpandOpen(false); onSettings(); }}
                  whileTap={{ scale: 0.94 }}
                  className="lg-btn"
                  style={{
                    height: 42,
                    padding: '0 16px',
                    gap: 7,
                    background: 'transparent',
                    color: 'var(--lg-ink)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Icon name="settings" size={17} style={{ color: 'var(--lg-forest)' }} />
                  <span>{t('settings') as string || 'Settings'}</span>
                </m.button>
              )}
            </m.div>
          )}
        </AnimatePresence>

        {/* Main row: pill nav + FAB */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', pointerEvents: 'auto' }}>
          {/* Pill container */}
          <m.nav
            role="navigation"
            aria-label="Main navigation"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0, 0, 1], delay: 0.08 }}
            className="lg lg-strong"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              padding: 7,
              borderRadius: 9999,
              height: 64,
            }}
          >
            {/* Sliding terra active indicator */}
            <m.div
              animate={{ x: (isRTL ? -1 : 1) * TABS.findIndex(t => t.id === active) * 58 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              style={{
                position: 'absolute',
                top: 7,
                [isRTL ? 'right' : 'left']: 7 + 44,
                width: 58,
                height: 50,
                borderRadius: 9999,
                background: 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))',
                boxShadow: 'var(--lg-glow-terra)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />

            {/* Expand handle */}
            <m.button
              onClick={() => setExpandOpen(o => !o)}
              whileTap={{ scale: 0.92 }}
              aria-label="Menu"
              aria-expanded={expandOpen}
              style={{
                width: 44,
                height: 50,
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <m.span
                animate={{ rotate: expandOpen ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                style={{ display: 'flex' }}
              >
                <Icon name="menu" size={18} style={{ color: 'var(--text-3)' }} />
              </m.span>
            </m.button>

            {/* Tab buttons */}
            {TABS.map(tab => {
              const isActive = active === tab.id;
              return (
                <m.button
                  key={tab.id}
                  data-tour={`nav-${tab.id}`}
                  onClick={() => { handleChange(tab.id); setExpandOpen(false); }}
                  whileTap={{ scale: 0.92 }}
                  aria-label={tab.ariaLabel}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: 58,
                    height: 50,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    color: isActive ? '#fff' : 'var(--text-3)',
                    transition: 'color 0.3s',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    flexShrink: 0,
                  }}
                >
                  <m.span
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    style={{ display: 'flex' }}
                  >
                    <Icon name={tab.icon} size={20} color={isActive ? '#fff' : 'var(--text-3)'} />
                  </m.span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8.5,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    lineHeight: 1,
                  }}>
                    {t(tab.labelKey)}
                  </span>
                </m.button>
              );
            })}
          </m.nav>

          {/* Forest FAB */}
          {onAdd && (
            <m.button
              onClick={onAdd}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0, 0, 1], delay: 0.12 }}
              whileTap={{ scale: 0.92 }}
              className="lg-btn lg-btn-forest an-float"
              aria-label="Add"
              style={{
                width: 64,
                height: 64,
                borderRadius: 9999,
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <Icon name="plus" size={26} color="#fff" />
            </m.button>
          )}
        </div>
      </div>

      {/* Spacer for floating pill nav */}
      <div
        className="md:hidden"
        style={{
          height: 'calc(90px + env(safe-area-inset-bottom, 0px))',
          flexShrink: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
