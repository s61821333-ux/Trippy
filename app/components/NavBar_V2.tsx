'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Icon from './ui/Icon';
import { Screen } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

interface NavBarV2Props {
  active: Screen;
  onChange: (s: Screen) => void;
  onSettings?: () => void;
  onSwitch?: () => void;
  onAdd?: () => void;
  onLogout?: () => void;
  onNotes?: () => void;
}

const TABS: {
  id: Screen;
  icon: 'grid' | 'compass' | 'checklist' | 'users';
  labelKey: 'navCamp' | 'navExplore' | 'navPack' | 'navCrew';
  ariaLabel: string;
}[] = [
  { id: 'dashboard', icon: 'grid',      labelKey: 'navCamp',    ariaLabel: 'Overview' },
  { id: 'day',       icon: 'compass',   labelKey: 'navExplore', ariaLabel: 'Day planner' },
  { id: 'supplies',  icon: 'checklist', labelKey: 'navPack',    ariaLabel: 'Packing list' },
  { id: 'crew',      icon: 'users',     labelKey: 'navCrew',    ariaLabel: 'Crew' },
];

const BLOB_SPRING = { type: 'spring', stiffness: 380, damping: 32 } as const;
const ICON_SPRING = { type: 'spring', stiffness: 380, damping: 28 } as const;
const HANDLE_SPRING = { type: 'spring', stiffness: 320, damping: 26 } as const;
const PANEL_SPRING = { type: 'spring', stiffness: 400, damping: 28 } as const;

export default function NavBar_V2({ active, onChange, onSettings, onSwitch, onAdd, onLogout, onNotes }: NavBarV2Props) {
  const { t, isRTL } = useI18n();
  const [expandOpen, setExpandOpen] = useState(false);

  // -1 when on a non-tab screen (settings, notes, etc.) — blob should hide
  const activeTabIdx = TABS.findIndex(tb => tb.id === active);
  const blobX = (isRTL ? -1 : 1) * Math.max(0, activeTabIdx) * 58;

  const handleChange = (id: Screen) => {
    onChange(id);
    setExpandOpen(false);
  };

  // rename for clarity in JSX
  const activeIdx = activeTabIdx;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 14px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      {/* Expanded focus panel */}
      <AnimatePresence>
        {expandOpen && (
          <m.div
            key="expand-panel"
            className="lg lg-strong"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={PANEL_SPRING}
            style={{
              display: 'flex',
              gap: 8,
              padding: 8,
              borderRadius: 9999,
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={() => { setExpandOpen(false); onSwitch?.(); }}
              className="lg-btn"
              style={{ height: 42, padding: '0 16px', gap: 7, background: 'transparent', color: 'var(--lg-ink)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center' }}
            >
              <Icon name="swap" size={17} style={{ color: 'var(--lg-terra)' }} />
              <span>{(t('switchTrip') as string) || 'Switch trip'}</span>
            </button>

            <div style={{ width: 1, background: 'oklch(50% 0.02 60 / 22%)', margin: '6px 0' }} />

            <button
              onClick={() => { setExpandOpen(false); onNotes?.(); }}
              className="lg-btn"
              style={{ height: 42, padding: '0 16px', gap: 7, background: 'transparent', color: 'var(--lg-ink)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center' }}
            >
              <Icon name="edit" size={17} style={{ color: 'var(--lg-forest)' }} />
              <span>Notes</span>
            </button>

            <div style={{ width: 1, background: 'oklch(50% 0.02 60 / 22%)', margin: '6px 0' }} />

            <button
              onClick={() => { setExpandOpen(false); onSettings?.(); }}
              className="lg-btn"
              style={{
                height: 42,
                padding: '0 16px',
                gap: 7,
                background: 'transparent',
                color: 'var(--lg-ink)',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icon name="settings" size={17} style={{ color: 'var(--lg-forest)' }} />
              <span>{(t('settings') as string) || 'Settings'}</span>
            </button>

            <div style={{ width: 1, background: 'oklch(50% 0.02 60 / 22%)', margin: '6px 0' }} />

            <button
              onClick={() => { setExpandOpen(false); onLogout?.(); }}
              className="lg-btn"
              style={{
                height: 42,
                padding: '0 16px',
                gap: 7,
                background: 'transparent',
                color: 'oklch(52% 0.14 25)',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icon name="x" size={17} style={{ color: 'oklch(52% 0.14 25)' }} />
              <span>Log out</span>
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* Main row: tab bar + FAB */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', pointerEvents: 'auto' }}>

        {/* Tab bar pill */}
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
          {/* Liquid blob — hidden when on a non-tab screen like Settings */}
          <m.div
            aria-hidden="true"
            animate={{ x: blobX, opacity: activeIdx >= 0 ? 1 : 0 }}
            transition={BLOB_SPRING}
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

          {/* Menu handle */}
          <m.button
            onClick={() => setExpandOpen(o => !o)}
            whileTap={{ scale: 0.92 }}
            transition={HANDLE_SPRING}
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
              transition={HANDLE_SPRING}
              style={{ display: 'flex' }}
            >
              <Icon name="menu" size={18} style={{ color: 'var(--text-3)' }} />
            </m.span>
          </m.button>

          {/* Tabs */}
          {TABS.map((tab, i) => {
            const isActive = i === activeIdx;
            return (
              <m.button
                key={tab.id}
                onClick={() => handleChange(tab.id)}
                whileTap={{ scale: 0.92 }}
                transition={ICON_SPRING}
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
                  flexShrink: 0,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <m.span
                  animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                  transition={ICON_SPRING}
                  style={{ display: 'flex' }}
                >
                  <Icon name={tab.icon} size={20} color={isActive ? '#fff' : 'var(--text-3)'} />
                </m.span>
              </m.button>
            );
          })}
        </m.nav>

        {/* FAB */}
        {onAdd && (
          <m.button
            onClick={onAdd}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0, 0, 1], delay: 0.12 }}
            whileTap={{ scale: 0.92 }}
            className="lg-btn lg-btn-forest a-float"
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

      {/* Bottom safe-area spacer */}
      <div style={{ height: 0, pointerEvents: 'none' }} />
    </div>
  );
}
