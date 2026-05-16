'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Icon from './ui/Icon';
import CompassMark from './ui/CompassMark';
import { Screen } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

interface NavBarProps {
  active: Screen;
  onChange: (s: Screen) => void;
}

const TABS: { id: Screen; icon: 'grid' | 'compass' | 'checklist' | 'settings'; labelKey: 'navCamp' | 'navExplore' | 'navPack' | 'navSetup' }[] = [
  { id: 'dashboard', icon: 'grid', labelKey: 'navCamp' },
  { id: 'day', icon: 'compass', labelKey: 'navExplore' },
  { id: 'supplies', icon: 'checklist', labelKey: 'navPack' },
  { id: 'settings', icon: 'settings', labelKey: 'navSetup' },
];

export default function NavBar({ active, onChange }: NavBarProps) {
  const { t } = useI18n();

  return (
    <>
      {/* ── Desktop: clean top nav bar ── */}
      <div
        className="hidden md:flex relative z-50 w-full shrink-0"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
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
          <motion.button
            onClick={() => onChange('dashboard')}
            whileTap={{ scale: 0.95 }}
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
          </motion.button>

          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {TABS.map(tab => {
              const isActive = active === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  data-tour={`nav-${tab.id}`}
                  onClick={() => onChange(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--brand-muted)' : 'transparent',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase' as const,
                    color: isActive ? 'var(--brand)' : 'var(--text-2)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{t(tab.labelKey)}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile: fixed bottom tab bar ── */}
      <nav
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          height: 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-around',
          height: 'var(--nav-h)',
        }}>
          {TABS.map(tab => {
            const isActive = active === tab.id;
            return (
              <motion.button
                key={tab.id}
                data-tour={`nav-${tab.id}`}
                onClick={() => onChange(tab.id)}
                whileTap={{ scale: 0.88 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: '6px 4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: isActive ? 'var(--brand)' : 'var(--text-3)',
                  minHeight: 48,
                }}
              >
                <Icon name={tab.icon} size={22} />
                <span style={{
                  fontSize: 9,
                  fontWeight: 500,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {t(tab.labelKey)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
