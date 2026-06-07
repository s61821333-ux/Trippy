'use client';

import { m, AnimatePresence } from 'framer-motion';
import React, { useLayoutEffect, useState } from 'react';
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
  onWishlist?: () => void;
}

// Short 3–5 char labels — keeps the pill compact and avoids "Dashboard" sprawl
const TABS: {
  id: Screen;
  icon: 'grid' | 'compass' | 'map' | 'checklist' | 'users';
  label: string;
  labelHe: string;
  ariaLabel: string;
}[] = [
  { id: 'dashboard', icon: 'grid',      label: 'Home',    labelHe: 'ראשי',  ariaLabel: 'Overview' },
  { id: 'day',       icon: 'compass',   label: 'Explore', labelHe: 'גלה',   ariaLabel: 'Day planner' },
  { id: 'map',       icon: 'map',       label: 'Map',     labelHe: 'מפה',   ariaLabel: 'Map' },
  { id: 'supplies',  icon: 'checklist', label: 'Pack',    labelHe: 'ציוד',  ariaLabel: 'Packing list' },
  { id: 'crew',      icon: 'users',     label: 'Crew',    labelHe: 'צוות',  ariaLabel: 'Crew' },
];

const TAB_W       = 50;   // px — each tab slot width
const PILL_PAD    = 7;    // px — inner padding on pill
const BLOB_SPRING = { type: 'spring', stiffness: 380, damping: 32 } as const;
const ICON_SPRING = { type: 'spring', stiffness: 380, damping: 28 } as const;
const HANDLE_SPRING = { type: 'spring', stiffness: 320, damping: 26 } as const;
const PANEL_SPRING  = { type: 'spring', stiffness: 400, damping: 28 } as const;

// Shared style for every row in the expand panel
const PANEL_BTN: React.CSSProperties = {
  height: 48,
  padding: '0 16px',
  gap: 10,
  background: 'transparent',
  color: 'var(--lg-ink)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  borderRadius: 20,
  border: 0,
  cursor: 'pointer',
  width: '100%',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
};

export default function NavBar_V2({
  active, onChange, onSettings, onSwitch, onAdd, onLogout, onNotes, onWishlist,
}: NavBarV2Props) {
  const { locale } = useI18n();
  const isHe = locale === 'he';

  const [expandOpen, setExpandOpen] = useState(false);
  const menuBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => { setExpandOpen(false); }, [active]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandOpen) setExpandOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expandOpen]);

  useLayoutEffect(() => {
    menuBtnRef.current?.setAttribute('aria-expanded', expandOpen ? 'true' : 'false');
  }, [expandOpen]);

  const activeTabIdx = TABS.findIndex(tb => tb.id === active);

  // Blob translates from its initial position (leftmost tab slot)
  const blobX = (isHe ? -1 : 1) * Math.max(0, activeTabIdx) * TAB_W;

  const handleChange = (id: Screen) => {
    onChange(id);
    setExpandOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'env(safe-area-inset-bottom, 0px)',
        paddingBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 40,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      {/* ── Expand panel ─────────────────────────────────────── */}
      <AnimatePresence>
        {expandOpen && (
          <m.div
            key="expand-panel"
            className="lg lg-strong"
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={PANEL_SPRING}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: 8,
              borderRadius: 28,
              pointerEvents: 'auto',
              width: 'min(260px, calc(100vw - 32px))',
            }}
          >
            <button
              onClick={() => { setExpandOpen(false); onSwitch?.(); }}
              className="lg-btn"
              style={{ ...PANEL_BTN }}
            >
              <Icon name="swap" size={17} style={{ color: 'var(--lg-terra)' }} />
              <span>{isHe ? 'החלף טיול' : 'Switch trip'}</span>
            </button>

            <button
              onClick={() => { setExpandOpen(false); onNotes?.(); }}
              className="lg-btn"
              style={{ ...PANEL_BTN }}
            >
              <Icon name="edit" size={17} style={{ color: 'var(--lg-forest)' }} />
              <span>{isHe ? 'הערות' : 'Notes'}</span>
            </button>

            <button
              onClick={() => { setExpandOpen(false); onSettings?.(); }}
              className="lg-btn"
              style={{ ...PANEL_BTN }}
            >
              <Icon name="settings" size={17} style={{ color: 'var(--lg-forest)' }} />
              <span>{isHe ? 'הגדרות' : 'Settings'}</span>
            </button>

            {/* Divider */}
            <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 12%)', margin: '2px 8px' }} />

            <button
              onClick={() => { setExpandOpen(false); onLogout?.(); }}
              className="lg-btn"
              style={{ ...PANEL_BTN, color: 'var(--danger)' }}
            >
              <Icon name="x" size={17} style={{ color: 'var(--danger)' }} />
              <span>{isHe ? 'התנתק' : 'Log out'}</span>
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Main row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'auto' }}>

        {/* Menu FAB */}
        <m.button
          ref={menuBtnRef}
          onClick={() => setExpandOpen(o => !o)}
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.08 }}
          whileTap={{ scale: 0.92 }}
          className="lg lg-strong"
          aria-label="Menu"
          style={{
            width: 52, height: 52,
            borderRadius: 9999,
            flexShrink: 0,
            border: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <m.span
            animate={{ rotate: expandOpen ? 45 : 0 }}
            transition={HANDLE_SPRING}
            style={{ display: 'flex' }}
          >
            <Icon name="menu" size={20} style={{ color: 'var(--text-2)' }} />
          </m.span>
        </m.button>

        {/* Tab bar pill — 5 tabs × TAB_W + 2×PILL_PAD */}
        <m.nav
          role="navigation"
          aria-label="Main navigation"
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.06 }}
          className="lg lg-strong nav-pill"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: PILL_PAD,
            borderRadius: 9999,
            height: 66,
          }}
        >
          {/* Active blob */}
          <m.div
            aria-hidden="true"
            animate={{ x: blobX, opacity: activeTabIdx >= 0 ? 1 : 0 }}
            transition={BLOB_SPRING}
            style={{
              position: 'absolute',
              top: PILL_PAD,
              [isHe ? 'right' : 'left']: PILL_PAD,
              width: TAB_W,
              height: 66 - PILL_PAD * 2,
              borderRadius: 9999,
              background: 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))',
              boxShadow: 'var(--lg-glow-terra)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {TABS.map((tab, i) => {
            const isActive = i === activeTabIdx;
            return (
              <m.button
                key={tab.id}
                onClick={() => handleChange(tab.id)}
                whileTap={{ scale: 0.9 }}
                transition={ICON_SPRING}
                aria-label={tab.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: TAB_W,
                  height: 66 - PILL_PAD * 2,
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  flexShrink: 0,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <m.span
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={ICON_SPRING}
                  style={{ display: 'flex' }}
                >
                  <Icon name={tab.icon} size={18} color={isActive ? '#fff' : 'var(--text-3)'} />
                </m.span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--text-3)',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                }}>
                  {isHe ? tab.labelHe : tab.label}
                </span>
              </m.button>
            );
          })}
        </m.nav>

        {/* Wishlist FAB */}
        {onWishlist && (
          <m.button
            onClick={() => { setExpandOpen(false); onWishlist(); }}
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.1 }}
            whileTap={{ scale: 0.92 }}
            className="lg lg-strong"
            aria-label="Wish list"
            style={{
              width: 52, height: 52,
              borderRadius: 9999,
              flexShrink: 0,
              border: 0,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            <Icon name="star" size={19} style={{ color: 'var(--lg-sand)' }} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--lg-sand)',
              lineHeight: 1,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {isHe ? 'רצונות' : 'Wish'}
            </span>
          </m.button>
        )}

        {/* Add FAB */}
        {onAdd && (
          <m.button
            onClick={onAdd}
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.12 }}
            whileTap={{ scale: 0.92 }}
            className="lg-btn lg-btn-forest"
            aria-label="Add"
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            <Icon name="plus" size={24} color="#fff" />
          </m.button>
        )}
      </div>
    </div>
  );
}
