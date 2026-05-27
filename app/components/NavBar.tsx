'use client';

import { m, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/motion';
import { haptic } from '@/lib/haptics';
import Icon from './ui/Icon';
import CompassMark from './ui/CompassMark';
import { Screen } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

interface NavBarProps {
  active: Screen;
  onChange: (s: Screen) => void;
  onSettings?: () => void;
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

export default function NavBar({ active, onChange, onSettings }: NavBarProps) {
  const { t } = useI18n();

  const handleChange = (id: Screen) => {
    haptic('light');
    onChange(id);
  };

  return (
    <>
      {/* ── Desktop: glass top nav bar ── */}
      <div
        className="hidden md:flex relative z-50 w-full shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderBottom: '1px solid rgba(255,255,255,0.80)',
          boxShadow: '0 12px 40px rgba(26,20,16,0.08)',
          height: 'var(--nav-h)',
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
            whileTap={{ scale: 0.95 }}
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
            <CompassMark size={32} />
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
          <nav role="navigation" aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {TABS.map(tab => {
              const isActive = active === tab.id;
              return (
                <m.button
                  key={tab.id}
                  data-tour={`nav-${tab.id}`}
                  onClick={() => handleChange(tab.id)}
                  whileTap={{ scale: 0.93 }}
                  transition={spring.snap}
                  aria-label={tab.ariaLabel}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 9999,
                    border: 'none',
                    background: isActive ? 'var(--brand)' : 'transparent',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                    color: isActive ? '#ffffff' : 'rgba(26,20,16,0.45)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    boxShadow: isActive ? '0 8px 20px rgba(59,110,82,0.28)' : 'none',
                  }}
                >
                  <Icon name={tab.icon} size={15} />
                  <span>{t(tab.labelKey)}</span>
                </m.button>
              );
            })}

            {onSettings && (
              <m.button
                onClick={onSettings}
                whileTap={{ scale: 0.93 }}
                transition={spring.snap}
                aria-label="Settings"
                aria-current={active === 'settings' ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  marginInlineStart: 4,
                  borderRadius: '50%',
                  border: 'none',
                  background: active === 'settings' ? 'var(--brand)' : 'transparent',
                  color: active === 'settings' ? '#ffffff' : 'rgba(26,20,16,0.45)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <Icon name="settings" size={16} />
              </m.button>
            )}
          </nav>
        </div>
      </div>

      {/* ── Mobile: floating Jelly Pill nav — matches prototype exactly ── */}
      <nav
        className="md:hidden"
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          bottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: 380,
          zIndex: 100,

          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          border: '1px solid rgba(255, 255, 255, 0.80)',
          borderRadius: 9999,
          padding: '8px',

          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',

          boxShadow: '0 40px 80px rgba(26, 20, 16, 0.15)',
        }}
      >
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <m.button
              key={tab.id}
              data-tour={`nav-${tab.id}`}
              onClick={() => handleChange(tab.id)}
              whileTap={{ scale: 0.88, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isActive ? 56 : 48,
                height: isActive ? 56 : 48,
                borderRadius: '50%',
                border: 'none',
                background: isActive ? 'var(--brand)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(26,20,16,0.40)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                boxShadow: isActive ? '0 12px 24px rgba(59,110,82,0.30)' : 'none',
                flexShrink: 0,
              }}
            >
              <Icon name={tab.icon} size={isActive ? 22 : 20} />
            </m.button>
          );
        })}
      </nav>

      {/* Spacer for mobile pill */}
      <div
        className="md:hidden"
        style={{
          height: 'calc(32px + 56px + 32px + env(safe-area-inset-bottom, 0px))',
          flexShrink: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
