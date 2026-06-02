'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n, Locale } from '@/lib/i18n';
import { CURRENCIES } from '@/lib/currency';
import { useToast } from '../ui/Toast';
import Icon from '../ui/Icon';
import Field from '../ui/Field';
import CountriesInput from '../ui/CountriesInput';

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  const { isRTL } = useI18n();
  return (
    <button
      onClick={onClick} role="switch" aria-checked={on} aria-label={label}
      style={{
        width: 50, height: 30, borderRadius: 9999, border: 0, cursor: 'pointer', padding: 3, flexShrink: 0,
        background: on ? 'var(--lg-forest)' : 'oklch(50% 0.02 60 / 24%)',
        boxShadow: on ? 'var(--lg-glow-forest)' : 'none', transition: 'background .3s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <m.span
        animate={{ x: on ? (isRTL ? -20 : 20) : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        style={{ display: 'block', width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: 'var(--lg-shadow)' }}
      />
    </button>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function Row({ icon, title, sub, right, onClick }: {
  icon?: string; title: string; sub?: string; right?: React.ReactNode; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', cursor: onClick ? 'pointer' : 'default' }}
    >
      {icon && (
        <span className="lg-btn lg-btn-glass" style={{ width: 38, height: 38, padding: 0, flexShrink: 0 }} aria-hidden="true">
          <Icon name={icon as 'settings'} size={17} color="var(--lg-forest)" />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Divider() {
  return <div aria-hidden="true" style={{ height: 1, background: 'oklch(50% 0.02 60 / 10%)' }} />;
}

// ── Main Settings_V2 ─────────────────────────────────────────────────────────

export default function Settings_V2() {
  const { t, locale, setLocale, isRTL } = useI18n();
  const { show } = useToast();

  const {
    trip, themeMode, setThemeMode,
    highContrast, toggleHighContrast,
    currencyByTrip, tripDbId,
    deleteTrip, setCurrency, updateTripInfo, setScreen,
  } = useAppStore(useShallow(s => ({
    trip:               s.trip,
    themeMode:          s.themeMode,
    setThemeMode:       s.setThemeMode,
    highContrast:       s.highContrast,
    toggleHighContrast: s.toggleHighContrast,
    currencyByTrip:     s.currencyByTrip,
    tripDbId:           s.tripDbId,
    deleteTrip:         s.deleteTrip,
    setCurrency:        s.setCurrency,
    updateTripInfo:     s.updateTripInfo,
    setScreen:          s.setScreen,
  })));

  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false);
  const [showTripEdit,       setShowTripEdit]       = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Trip info edit state
  const [editName,      setEditName]      = useState(trip?.name ?? '');
  const [editStartDate, setEditStartDate] = useState(trip?.startDate ?? '');
  const [editEndDate,   setEditEndDate]   = useState(() => {
    if (!trip?.startDate) return '';
    const d = new Date(trip.startDate + 'T00:00:00');
    d.setDate(d.getDate() + (trip.days ?? 1) - 1);
    return d.toISOString().split('T')[0];
  });
  const [editCountries, setEditCountries] = useState<string[]>(trip?.countries ?? []);

  const currency = (tripDbId && currencyByTrip[tripDbId]) || 'USD';
  const currencyLabel = CURRENCIES.find(c => c.code === currency)
    ? `${currency} — ${CURRENCIES.find(c => c.code === currency)!.label}`
    : currency;

  const chev = (
    <Icon name={isRTL ? 'chevL' : 'chevR'} size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
  );

  if (!trip) return null;

  const calcDays = (s: string, e: string) =>
    Math.max(1, Math.min(90, Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86_400_000) + 1));

  const handleSaveTripInfo = () => {
    if (!editName.trim()) { show('Enter a trip name'); return; }
    const countriesUpdate = editCountries.length > 0 ? editCountries : undefined;
    if (editStartDate && editEndDate && editEndDate >= editStartDate) {
      updateTripInfo({ name: editName, startDate: editStartDate, days: calcDays(editStartDate, editEndDate), countries: countriesUpdate });
    } else {
      updateTripInfo({ name: editName, countries: countriesUpdate });
    }
    show('Trip updated');
    setShowTripEdit(false);
  };


  const themeOptions = [
    { id: 'light'  as const, icon: 'sun'  as const, label: t('Light')  || 'Light'  },
    { id: 'dark'   as const, icon: 'lock' as const, label: t('Dark')   || 'Dark'   },
    { id: 'system' as const, icon: 'grid' as const, label: t('System') || 'System' },
  ];

  return (
    <div
      className="lg-scroll"
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}
    >
      <div className="resp-container" style={{ padding: '6px 20px 130px' }}>
      {/* ── Back button ── */}
      <button
        onClick={() => setScreen('dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6,
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Icon name={isRTL ? 'chevR' : 'chevL'} size={12} color="var(--text-3)" />
        {locale === 'he' ? 'לוח בקרה' : 'Dashboard'}
      </button>

      {/* ── Header ── */}
      <m.p
        className="eyebrow-lg"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{ color: 'var(--lg-terra)', marginBottom: 2 }}
      >
        {t('setupSub') || 'Trip & preferences'}
      </m.p>

      <m.h1
        className="display-xl"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontSize: 38, color: 'var(--lg-ink)', margin: '0 0 18px' }}
      >
        {t('setupTitle') || 'Settings'}
      </m.h1>

      {/* ── Trip info ── */}
      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>Trip</p>

      <m.div
        className="lg"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: '4px 16px', marginBottom: 16 }}
      >
        <Row
          icon="tent"
          title={trip.name}
          sub={trip.startDate
            ? (() => {
                const s = new Date(trip.startDate + 'T00:00:00');
                const e = new Date(s.getTime() + (trip.days - 1) * 86_400_000);
                const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `${fmt(s)} → ${fmt(e)} · ${trip.days} days`;
              })()
            : `${trip.days} days`}
          right={chev}
          onClick={() => {
            setEditName(trip.name);
            setEditStartDate(trip.startDate ?? '');
            if (trip.startDate) {
              const d = new Date(trip.startDate + 'T00:00:00');
              d.setDate(d.getDate() + trip.days - 1);
              setEditEndDate(d.toISOString().split('T')[0]);
            }
            setShowTripEdit(true);
          }}
        />
        <Divider />
        <Row
          icon="download"
          title={t('currencyLabel') || 'Currency'}
          sub={currencyLabel}
          right={chev}
          onClick={() => setShowCurrencyPicker(true)}
        />
        <Divider />
        <Row
          icon="share"
          title={t('languageLabel') || 'Language'}
          right={
            <div className="lg" role="group" aria-label="Language" style={{ display: 'flex', padding: 3, borderRadius: 9999, gap: 2, boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)' }}>
              {(['en', 'he'] as Locale[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  aria-pressed={locale === l}
                  style={{
                    borderRadius: 9999, padding: '5px 11px', border: 0, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12,
                    background: locale === l ? 'var(--lg-forest)' : 'transparent',
                    color:      locale === l ? '#fff' : 'var(--text-3)',
                    transition: 'all .25s', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {l === 'en' ? 'EN' : 'עב'}
                </button>
              ))}
            </div>
          }
        />
        <Divider />
        <Row
          icon="calExport"
          title={t('exportPDF') || 'Export as PDF'}
          sub={t('exportPDFSub') || 'Printable itinerary'}
          right={chev}
        />
      </m.div>

      {/* ── Appearance ── */}
      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
        {t('Appearance') || 'Appearance'}
      </p>

      <m.div
        className="lg"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.17, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: 16, marginBottom: 16 }}
      >
        <div style={{ display: 'flex', gap: 8 }} role="group" aria-label="Theme">
          {themeOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setThemeMode(opt.id)}
              aria-pressed={themeMode === opt.id}
              style={{
                flex: 1, border: 0, cursor: 'pointer', borderRadius: 14, padding: '14px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: themeMode === opt.id ? 'var(--lg-forest)' : 'var(--lg-panel-strong)',
                color:      themeMode === opt.id ? '#fff' : 'var(--text-2)',
                boxShadow:  themeMode === opt.id ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                transition: 'all .25s', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon name={opt.icon} size={20} color={themeMode === opt.id ? '#fff' : 'var(--text-3)'} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </m.div>

      {/* ── Accessibility ── */}
      <m.div
        className="lg"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: '4px 16px', marginBottom: 16 }}
      >
        <Row
          icon="sparkle"
          title={t('highContrast') || 'High contrast'}
          sub={t('highContrastSub') || 'WCAG AA boosted'}
          right={<Toggle on={highContrast} onClick={toggleHighContrast} label="High contrast" />}
        />
      </m.div>

      {/* ── Delete trip ── */}
      <m.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.27, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowDeleteConfirm(true)}
        className="lg-btn"
        style={{
          width: '100%', height: 50,
          background: 'var(--danger-bg)', color: 'var(--danger)',
          boxShadow: 'inset 0 0 0 1px oklch(48% 0.130 25 / 18%)',
          marginBottom: 20, WebkitTapHighlightColor: 'transparent',
        }}
      >
        {locale === 'he' ? 'מחק טיול' : 'Delete trip'}
      </m.button>

      {/* ── Version footer ── */}
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
        Trippy · v2.0 · Liquid Glass
      </p>

      {/* ── Currency picker sheet ── */}
      <AnimatePresence>
        {showCurrencyPicker && (
          <>
            <m.div
              key="currency-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowCurrencyPicker(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'oklch(16% 0.018 60 / 42%)', backdropFilter: 'blur(3px)' }}
            />
            <m.div
              key="currency-sheet"
              className="lg lg-strong"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={spring.gentle}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 81, padding: '20px 20px 48px', borderRadius: 'var(--lg-r-lg) var(--lg-r-lg) 0 0', maxHeight: '65vh', overflowY: 'auto' }}
            >
              <div style={{ width: 40, height: 5, borderRadius: 3, background: 'oklch(20% 0.03 60 / 18%)', margin: '0 auto 16px' }} />
              <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 14, fontSize: 9 }}>Select currency</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                      border: 0, borderRadius: 14, cursor: 'pointer', textAlign: 'start',
                      background: currency === c.code ? 'var(--lg-forest)' : 'transparent',
                      transition: 'background .2s',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: currency === c.code ? '#fff' : 'var(--text-3)', width: 32, flexShrink: 0 }}>
                      {c.symbol}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: currency === c.code ? '#fff' : 'var(--lg-ink)' }}>{c.code}</div>
                      <div style={{ fontSize: 12, color: currency === c.code ? 'rgba(255,255,255,0.7)' : 'var(--text-3)' }}>
                        {locale === 'he' ? c.labelHe : c.label}
                      </div>
                    </div>
                    {currency === c.code && <Icon name="check" size={16} color="#fff" />}
                  </button>
                ))}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Trip edit sheet ── */}
      <AnimatePresence>
        {showTripEdit && (
          <>
            <m.div
              key="backdrop-edit"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowTripEdit(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'oklch(16% 0.018 60 / 42%)', backdropFilter: 'blur(3px)' }}
            />
            <m.div
              key="trip-edit-sheet"
              className="lg lg-strong"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={spring.gentle}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 81, padding: '24px 24px 48px', borderRadius: 'var(--lg-r-lg) var(--lg-r-lg) 0 0', maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div style={{ width: 40, height: 5, borderRadius: 3, background: 'oklch(20% 0.03 60 / 18%)', margin: '0 auto 20px' }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
                Edit trip
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Trip name" value={editName} onChange={setEditName} />
                <CountriesInput label="Countries / destinations" value={editCountries} onChange={setEditCountries} />

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                      Start date
                    </label>
                    <input
                      type="date" value={editStartDate}
                      onChange={e => setEditStartDate(e.target.value)}
                      style={{ width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 500, minHeight: 44, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                      End date
                    </label>
                    <input
                      type="date" value={editEndDate} min={editStartDate}
                      onChange={e => setEditEndDate(e.target.value)}
                      style={{ width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 500, minHeight: 44, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                {editStartDate && editEndDate && editEndDate >= editStartDate && (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: -6 }}>
                    {calcDays(editStartDate, editEndDate)} days
                  </p>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleSaveTripInfo}
                    style={{ flex: 2, height: 52, border: 0, borderRadius: 'var(--lg-r-btn)', background: 'var(--lg-forest)', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: 'var(--lg-glow-forest)' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowTripEdit(false)}
                    className="lg-btn lg-btn-glass"
                    style={{ flex: 1, height: 52 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete confirm overlay ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <m.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowDeleteConfirm(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'oklch(16% 0.018 60 / 42%)', backdropFilter: 'blur(3px)' }}
            />
            <m.div
              key="sheet"
              className="lg lg-strong"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={spring.gentle}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 81, padding: '24px 24px 40px', borderRadius: 'var(--lg-r-lg) var(--lg-r-lg) 0 0' }}
            >
              <div style={{ width: 40, height: 5, borderRadius: 3, background: 'oklch(20% 0.03 60 / 18%)', margin: '0 auto 20px' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
                {locale === 'he'
                  ? 'מחיקה היא בלתי הפיכה. להמשיך?'
                  : 'Deleting is permanent and cannot be undone. Continue?'}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="lg-btn lg-btn-glass"
                  style={{ flex: 1, height: 52 }}
                >
                  {locale === 'he' ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  onClick={async () => {
                    setShowDeleteConfirm(false);
                    try {
                      await deleteTrip();
                    } catch {
                      // Trip cleared locally even if DB delete fails
                      show(locale === 'he' ? 'הטיול נמחק מקומית' : 'Trip removed locally. Remote delete may have failed.');
                    }
                  }}
                  className="lg-btn"
                  style={{ flex: 1, height: 52, background: 'var(--danger-bg)', color: 'var(--danger)', boxShadow: 'none' }}
                >
                  {locale === 'he' ? 'מחק' : 'Delete'}
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
      </div>{/* /resp-container */}
    </div>
  );
}
