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

// V2 tab structure: Overview · Days · Map · Supplies · Crew
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
          background: 'var(--nav-surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--border)',
          borderBottomColor: 'oklch(0% 0 0 / 0.08)',
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
            <span className="wordmark" style={{ fontSize: 20, color: 'var(--text)' }}>
              Trippy<span className="dot">.</span>
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
                  whileTap={{ scale: 0.95 }}
                  transition={spring.snap}
                  aria-label={tab.ariaLabel}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? '1px solid rgba(196,113,74,0.3)' : '1px solid transparent',
                    background: isActive ? 'var(--terra-muted)' : 'transparent',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase' as const,
                    color: isActive ? 'var(--terra)' : 'var(--text-2)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background 0.18s ease, color 0.18s ease, border-color 0.18s ease',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                  }}
                >
                  <Icon name={tab.icon} size={15} />
                  <span>{t(tab.labelKey)}</span>
                </m.button>
              );
            })}

            {/* Settings gear — accessible from top bar without taking a primary tab slot */}
            {onSettings && (
              <m.button
                onClick={onSettings}
                whileTap={{ scale: 0.95 }}
                transition={spring.snap}
                aria-label="Settings"
                aria-current={active === 'settings' ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  marginInlineStart: 4,
                  borderRadius: 'var(--radius-md)',
                  border: active === 'settings' ? '1px solid rgba(196,113,74,0.3)' : '1px solid transparent',
                  background: active === 'settings' ? 'var(--terra-muted)' : 'transparent',
                  color: active === 'settings' ? 'var(--terra)' : 'var(--text-2)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.18s ease, color 0.18s ease',
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

      {/* ── Mobile: floating glass pill nav ── */}
      <nav
        className="md:hidden"
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          insetInline: 'var(--space-4)',
          bottom: 'calc(var(--space-4) + env(safe-area-inset-bottom, 0px))',
          zIndex: 100,

          background: 'var(--nav-surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border)',
          borderTopColor: 'oklch(100% 0 0 / 0.22)',
          borderRadius: 'var(--radius-full)',

          padding: 'var(--space-2) var(--space-2)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: 0,

          boxShadow: `
            0 1px 0 oklch(100% 0 0 / 0.12) inset,
            0 8px 32px oklch(0% 0 0 / 0.12),
            0 2px 8px oklch(0% 0 0 / 0.08)
          `,
        }}
      >
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <m.button
              key={tab.id}
              data-tour={`nav-${tab.id}`}
              onClick={() => handleChange(tab.id)}
              whileTap={{ scale: 0.85 }}
              transition={spring.snap}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '5px 2px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--terra)' : 'var(--text-3)',
                minHeight: 44,
                minWidth: 44,
                transition: 'color 0.18s ease',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                userSelect: 'none',
              }}
            >
              {/* Icon with animated pill indicator */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 28 }}>
                <AnimatePresence>
                  {isActive && (
                    <m.div
                      key="pill"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={spring.snap}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 9,
                        background: 'var(--terra-muted)',
                        border: '1px solid rgba(196,113,74,0.22)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </AnimatePresence>
                <Icon name={tab.icon} size={isActive ? 19 : 18} style={{ position: 'relative', zIndex: 1 }} />
              </div>

              <span style={{
                fontSize: 9,
                fontWeight: isActive ? 700 : 500,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1.2,
                color: isActive ? 'var(--terra)' : 'var(--text-3)',
                transition: 'color 0.18s ease',
              }}>
                {t(tab.labelKey)}
              </span>
            </m.button>
          );
        })}
      </nav>

      {/* Spacer so content scrolls above the floating pill on mobile */}
      <div
        className="md:hidden"
        style={{
          height: 'calc(var(--nav-h) + var(--space-4) + env(safe-area-inset-bottom, 0px))',
          flexShrink: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
