'use client';

import { m, AnimatePresence } from 'framer-motion';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import Icon from './ui/Icon';
import { Screen } from '@/lib/types';
import { useI18n, TranslationKey } from '@/lib/i18n';

interface NavBarV2Props {
  active: Screen;
  onChange: (s: Screen) => void;
  onSettings?: () => void;
  onSwitch?: () => void;
  onAdd?: () => void;
  onLogout?: () => void;
  onNotes?: () => void;
  onWishlist?: () => void;
  onAI?: () => void;
  wishlistOpen?: boolean;
}

type TabEntry =
  | { kind: 'screen'; id: Screen; icon: 'grid' | 'compass' | 'map' | 'checklist'; label: string; labelHe: string; ariaKey: TranslationKey }
  | { kind: 'action'; id: 'wishlist'; icon: 'star'; label: string; labelHe: string; ariaKey: TranslationKey };

const TABS: TabEntry[] = [
  { kind: 'screen', id: 'dashboard', icon: 'grid',      label: 'Home',     labelHe: 'ראשי',   ariaKey: 'navOverview' },
  { kind: 'screen', id: 'day',       icon: 'compass',   label: 'Explore',  labelHe: 'גלה',    ariaKey: 'navDayPlanner' },
  { kind: 'screen', id: 'map',       icon: 'map',       label: 'Map',      labelHe: 'מפה',    ariaKey: 'navMap' },
  { kind: 'screen', id: 'supplies',  icon: 'checklist', label: 'Pack',     labelHe: 'ציוד',   ariaKey: 'navPacking' },
  { kind: 'action', id: 'wishlist',  icon: 'star',      label: 'Wishlist', labelHe: 'כוכב',   ariaKey: 'navWishlistTab' },
];

const TAB_W       = 50;
const PILL_PAD    = 7;
const BLOB_SPRING   = { type: 'spring', stiffness: 380, damping: 32 } as const;
const ICON_SPRING   = { type: 'spring', stiffness: 380, damping: 28 } as const;
const HANDLE_SPRING = { type: 'spring', stiffness: 320, damping: 26 } as const;
const PANEL_SPRING  = { type: 'spring', stiffness: 400, damping: 28 } as const;

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
  active, onChange, onSettings, onSwitch, onAdd, onLogout, onNotes, onWishlist, onAI,
  wishlistOpen = false,
}: NavBarV2Props) {
  const { locale, t } = useI18n();
  const isHe = locale === 'he';

  const [expandOpen, setExpandOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const menuBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

  // Blob tracks screen tabs, or wishlist tab when its sheet is open
  const activeTabIdx = wishlistOpen
    ? TABS.findIndex(tb => tb.id === 'wishlist')
    : TABS.findIndex(tb => tb.kind === 'screen' && tb.id === active);
  const blobX = isDesktop ? 0 : (isHe ? -1 : 1) * Math.max(0, activeTabIdx) * TAB_W;
  const blobY = isDesktop ? Math.max(0, activeTabIdx) * TAB_W : 0;

  const handleChange = (id: Screen) => {
    onChange(id);
    setExpandOpen(false);
  };

  return (
    <div
      style={isDesktop ? {
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        paddingRight: 'calc(12px + env(safe-area-inset-right, 0px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
        zIndex: 250,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
      } : {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 250,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      {/* ── Expand panel backdrop ────────────────────────────── */}
      {expandOpen && (
        <div
          aria-hidden="true"
          onClick={() => setExpandOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 39 }}
        />
      )}

      {/* ── Main row ─────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        pointerEvents: 'auto',
        flexDirection: isDesktop ? 'column' : 'row',
      }}>
        {/* ── Expand panel ─────────────────────────────────────── */}
        <AnimatePresence>
          {expandOpen && (
            <m.div
              key="expand-panel"
              className="lg lg-strong"
              initial={isDesktop ? { opacity: 0, x: 8, scale: 0.92 } : { opacity: 0, y: 12, scale: 0.92 }}
              animate={isDesktop ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={isDesktop ? { opacity: 0, x: 8, scale: 0.92 } : { opacity: 0, y: 12, scale: 0.92 }}
              transition={PANEL_SPRING}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 8,
                borderRadius: 28,
                pointerEvents: 'auto',
                width: 'min(260px, calc(100vw - 32px))',
                ...(isDesktop ? {
                  position: 'absolute',
                  right: 'calc(100% + 8px)',
                  top: 0,
                  zIndex: 41,
                } : {}),
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
                <Icon name="logout" size={17} style={{ color: 'var(--danger)' }} />
                <span>{isHe ? 'התנתקות' : 'Log out'}</span>
              </button>
            </m.div>
          )}
        </AnimatePresence>

        {/* Menu FAB */}
        <m.button
          ref={menuBtnRef}
          onClick={() => setExpandOpen(o => !o)}
          initial={isDesktop ? { x: 12 } : { y: 12 }}
          animate={isDesktop ? { x: 0 } : { y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.08 }}
          whileTap={{ scale: 0.92 }}
          className="lg lg-strong"
          aria-label={t('navMenu')}
          aria-expanded={expandOpen}
          aria-haspopup="menu"
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

        {/* Tab bar pill - 5 tabs (4 screens + Wishlist action) */}
        <m.nav
          aria-label={t('navMain')}
          initial={isDesktop ? { x: 12 } : { y: 12 }}
          animate={isDesktop ? { x: 0 } : { y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.06 }}
          className="lg lg-strong nav-pill"
          role="tablist"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: isDesktop ? 'column' : 'row',
            alignItems: 'center',
            padding: PILL_PAD,
            borderRadius: 9999,
            ...(isDesktop ? { width: 66 } : { height: 66 }),
          }}
        >
          {/* Active blob */}
          <m.div
            aria-hidden="true"
            animate={{ x: blobX, y: blobY, opacity: activeTabIdx >= 0 ? 1 : 0 }}
            transition={BLOB_SPRING}
            style={{
              position: 'absolute',
              top: PILL_PAD,
              [isDesktop ? 'left' : (isHe ? 'right' : 'left')]: PILL_PAD,
              width: isDesktop ? 66 - PILL_PAD * 2 : TAB_W,
              height: TAB_W,
              borderRadius: 9999,
              background: 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))',
              boxShadow: 'var(--lg-glow-terra)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {TABS.map((tab, i) => {
            const isActive = wishlistOpen
              ? tab.id === 'wishlist'
              : (tab.kind === 'screen' && i === activeTabIdx);
            return (
              <m.button
                key={tab.id}
                role="tab"
                onClick={() => {
                  if (tab.kind === 'action') {
                    onWishlist?.();
                  } else {
                    handleChange(tab.id);
                  }
                }}
                whileTap={{ scale: 0.9 }}
                transition={ICON_SPRING}
                aria-label={t(tab.ariaKey)}
                aria-current={isActive ? 'page' : undefined}
                aria-selected={isActive}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: isDesktop ? 66 - PILL_PAD * 2 : TAB_W,
                  height: TAB_W,
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
                  fontSize: isHe ? 11 : 10,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--text-3)',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  textTransform: isHe ? 'none' : 'uppercase',
                  maxWidth: TAB_W - 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {isHe ? tab.labelHe : tab.label}
                </span>
              </m.button>
            );
          })}
        </m.nav>

        {/* AI FAB */}
        {onAI && (
          <m.button
            onClick={() => { setExpandOpen(false); onAI(); }}
            initial={isDesktop ? { x: 12 } : { y: 12 }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.1 }}
            whileTap={{ scale: 0.92 }}
            className="lg lg-strong ai-fab"
            aria-label={isHe ? 'הצעות AI' : 'AI suggestions'}
            aria-haspopup="dialog"
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
            <Icon name="sparkle" size={19} style={{ color: 'var(--lg-terra)' }} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: 'var(--lg-terra)',
              lineHeight: 1,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              AI
            </span>
          </m.button>
        )}

        {/* Add FAB */}
        {onAdd && (
          <m.button
            onClick={onAdd}
            initial={isDesktop ? { x: 12 } : { y: 12 }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.12 }}
            whileTap={{ scale: 0.92 }}
            className="lg-btn lg-btn-forest"
            aria-label={isHe ? 'הוסף פעילות' : 'Add event'}
            aria-haspopup="dialog"
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
