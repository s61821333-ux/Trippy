'use client';

import { m, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
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

const BLOB_SPRING = { type: 'spring', stiffness: 380, damping: 32 } as const;
const ICON_SPRING = { type: 'spring', stiffness: 380, damping: 28 } as const;
const HANDLE_SPRING = { type: 'spring', stiffness: 320, damping: 26 } as const;
const PANEL_SPRING = { type: 'spring', stiffness: 400, damping: 28 } as const;

export default function NavBar_V2({ active, onChange, onSettings, onSwitch, onAdd, onLogout, onNotes, onWishlist }: NavBarV2Props) {
  const { t, isRTL } = useI18n();
  const [expandOpen, setExpandOpen] = useState(false);
  const menuBtnRef = React.useRef<HTMLButtonElement>(null);

  // Close the expand panel whenever the active screen changes
  React.useEffect(() => { setExpandOpen(false); }, [active]);

  // Close the expand panel on Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandOpen) setExpandOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expandOpen]);

  // Keep aria-expanded in sync via imperative DOM write — framer-motion can cache
  // boolean prop values across animation frames, so this guarantees the attribute
  // matches the React state even if the motion component lags.
  React.useEffect(() => {
    menuBtnRef.current?.setAttribute('aria-expanded', expandOpen ? 'true' : 'false');
  }, [expandOpen]);

  // -1 when on a non-tab screen (settings, notes, etc.) — blob should hide
  const activeTabIdx = TABS.findIndex(tb => tb.id === active);
  const blobX = (isRTL ? -1 : 1) * Math.max(0, activeTabIdx) * 44;

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
        // Sit above the safe-area inset so the pill truly floats — the safe area
        // below is transparent and shows page content rather than a solid bar.
        bottom: 'env(safe-area-inset-bottom, 0px)',
        paddingBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        zIndex: 40,
        pointerEvents: 'none',
        // GPU composite layer — required for backdrop-filter to render on iOS
        // WebKit without waiting for a touch interaction.
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      {/* Expanded options panel — 2-column grid, all options always visible */}
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
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              padding: 8,
              borderRadius: 28,
              pointerEvents: 'auto',
              width: 'min(280px, calc(100vw - 32px))',
            }}
          >
            <button
              onClick={() => { setExpandOpen(false); onSwitch?.(); }}
              className="lg-btn"
              style={{ height: 44, padding: '0 14px', gap: 7, background: 'transparent', color: 'var(--lg-ink)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', borderRadius: 20 }}
            >
              <Icon name="swap" size={17} style={{ color: 'var(--lg-terra)' }} />
              <span>{(t('switchTrip') as string) || 'Switch trip'}</span>
            </button>

            <button
              onClick={() => { setExpandOpen(false); onNotes?.(); }}
              className="lg-btn"
              style={{ height: 44, padding: '0 14px', gap: 7, background: 'transparent', color: 'var(--lg-ink)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', borderRadius: 20 }}
            >
              <Icon name="edit" size={17} style={{ color: 'var(--lg-forest)' }} />
              <span>{(t('notes') as string) || 'Notes'}</span>
            </button>

            <button
              onClick={() => { setExpandOpen(false); onSettings?.(); }}
              className="lg-btn"
              style={{ height: 44, padding: '0 14px', gap: 7, background: 'transparent', color: 'var(--lg-ink)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', borderRadius: 20 }}
            >
              <Icon name="settings" size={17} style={{ color: 'var(--lg-forest)' }} />
              <span>{(t('settings') as string) || 'Settings'}</span>
            </button>

            <button
              onClick={() => { setExpandOpen(false); onWishlist?.(); }}
              className="lg-btn"
              style={{ height: 44, padding: '0 14px', gap: 7, background: 'transparent', color: 'var(--lg-ink)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', borderRadius: 20 }}
            >
              <Icon name="star" size={17} style={{ color: 'var(--lg-sand)' }} />
              <span>{(t('wishlist') as string) || 'Wish List'}</span>
            </button>

            {/* Danger action — visually separated */}
            <button
              onClick={() => { setExpandOpen(false); onLogout?.(); }}
              className="lg-btn"
              style={{ height: 44, padding: '0 14px', gap: 7, background: 'transparent', color: 'var(--danger)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', borderRadius: 20 }}
            >
              <Icon name="x" size={17} style={{ color: 'var(--danger)' }} />
              <span>{(t('logout') as string) || 'Log out'}</span>
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* Main row: wishlist FAB + tab bar + add FAB */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', pointerEvents: 'auto' }}>

        {/* Wishlist FAB — left side */}
        {onWishlist && (
          <m.button
            onClick={onWishlist}
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.08 }}
            whileTap={{ scale: 0.92 }}
            className="lg lg-strong"
            aria-label="Wish list"
            style={{
              width: 56, height: 56,
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
            <Icon name="star" size={22} style={{ color: 'var(--lg-sand)' }} />
          </m.button>
        )}

        {/* Tab bar pill */}
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
              width: 44,
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
            ref={menuBtnRef}
            onClick={() => setExpandOpen(o => !o)}
            whileTap={{ scale: 0.92 }}
            transition={HANDLE_SPRING}
            aria-label="Menu"
            aria-expanded={expandOpen ? 'true' : 'false'}
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
                  width: 44,
                  height: 50,
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#fff' : 'var(--text-3)',
                  transition: 'color 0.3s',
                  flexShrink: 0,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <m.span
                  animate={{ scale: isActive ? 1.08 : 1 }}
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
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0, 0, 1], delay: 0.1 }}
            whileTap={{ scale: 0.92 }}
            className="lg-btn lg-btn-forest"
            aria-label="Add"
            style={{
              width: 56,
              height: 56,
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
