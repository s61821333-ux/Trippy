'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n, Locale } from '@/lib/i18n';
import { CURRENCIES } from '@/lib/currency';
import { useToast } from '../ui/Toast';
import { formatDateRange } from '@/lib/dates';
import Icon from '../ui/Icon';
import Field from '../ui/Field';
import CountriesInput from '../ui/CountriesInput';
import Toggle from '../ui/Toggle';
import Eyebrow from '../ui/Eyebrow';

// ── Row ───────────────────────────────────────────────────────────────────────

// Hairline settings row (HANDOFF B10 - rows over cards)
function Row({ icon, title, sub, right, onClick }: {
  icon?: string; title: string; sub?: string; right?: React.ReactNode; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="hairline-row"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {icon && (
        <span
          aria-hidden="true"
          style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-warm)', boxShadow: 'inset 0 0 0 1px var(--rule)',
          }}
        >
          <Icon name={icon as 'settings'} size={17} color="var(--brand)" />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ── Main Settings_V2 ─────────────────────────────────────────────────────────

export default function Settings_V2({ onSecurity }: { onSecurity?: () => void }) {
  const { t, locale, setLocale, isRTL } = useI18n();
  const { show } = useToast();

  const {
    trip, themeMode, setThemeMode,
    highContrast, toggleHighContrast,
    currencyByTrip, tripDbId, authUser,
    deleteTrip, setCurrency, updateTripInfo, setScreen, logout, switchTrip,
  } = useAppStore(useShallow(s => ({
    trip:               s.trip,
    themeMode:          s.themeMode,
    setThemeMode:       s.setThemeMode,
    highContrast:       s.highContrast,
    toggleHighContrast: s.toggleHighContrast,
    currencyByTrip:     s.currencyByTrip,
    tripDbId:           s.tripDbId,
    authUser:           s.authUser,
    deleteTrip:         s.deleteTrip,
    setCurrency:        s.setCurrency,
    updateTripInfo:     s.updateTripInfo,
    setScreen:          s.setScreen,
    logout:             s.logout,
    switchTrip:         s.switchTrip,
  })));

  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false);
  const [showTripEdit,       setShowTripEdit]       = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
    ? `${currency} - ${CURRENCIES.find(c => c.code === currency)!.label}`
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
    show('Trip updated ✓');
    setShowTripEdit(false);
  };

  // ── Export itinerary as a printable PDF ─────────────────────────────────────
  // Opens a clean, print-styled document in a new window and triggers the
  // browser's print dialog, where the user can choose "Save as PDF".
  const handleExportPDF = () => {
    if (!trip) return;
    const win = window.open('', '_blank');
    if (!win) {
      show(locale === 'he' ? 'אפשרו חלונות קופצים כדי לייצא' : 'Allow pop-ups to export the PDF');
      return;
    }

    const esc = (s: unknown) =>
      String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] || c));

    const dayDate = (dayNum: number) => {
      if (!trip.startDate) return '';
      const d = new Date(trip.startDate + 'T00:00:00');
      d.setDate(d.getDate() + dayNum - 1);
      return d.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      });
    };

    const daysHtml = Array.from({ length: trip.days }, (_, i) => {
      const dayNum = i + 1;
      const meta = trip.dayMeta?.[i];
      const evs = (trip.events?.[dayNum] ?? []).slice().sort((a, b) => a.time.localeCompare(b.time));
      const rows = evs.length
        ? evs.map(ev => `
            <tr>
              <td class="t">${esc(ev.time)}</td>
              <td class="n">
                <div class="nm">${esc(ev.name)}</div>
                ${ev.location ? `<div class="loc">${esc(ev.location)}</div>` : ''}
                ${ev.notes ? `<div class="note">${esc(ev.notes)}</div>` : ''}
              </td>
            </tr>`).join('')
        : `<tr><td class="t">-</td><td class="n"><div class="empty">${esc(locale === 'he' ? 'אין פעילויות' : 'No activities planned')}</div></td></tr>`;
      return `
        <section class="day">
          <h2>${esc(locale === 'he' ? `יום ${dayNum}` : `Day ${dayNum}`)}${meta?.emoji ? ` ${esc(meta.emoji)}` : ''}
            ${meta?.region ? `<span class="region">${esc(meta.region)}</span>` : ''}
          </h2>
          <div class="date">${esc(dayDate(dayNum))}</div>
          <table>${rows}</table>
        </section>`;
    }).join('');

    const dir = isRTL ? 'rtl' : 'ltr';
    const title = esc(trip.name);
    const sub = esc(`${formatDateRange(trip.startDate ?? null, trip.days, locale)} · ${trip.days} ${locale === 'he' ? 'ימים' : 'days'}`);

    win.document.write(`<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #1c1b1a; margin: 0; padding: 40px; }
  header { border-bottom: 3px solid #c2603f; padding-bottom: 16px; margin-bottom: 28px; }
  h1 { font-size: 30px; margin: 0 0 6px; letter-spacing: -0.02em; }
  .sub { font-size: 13px; color: #6b6660; }
  .day { margin-bottom: 26px; break-inside: avoid; page-break-inside: avoid; }
  h2 { font-size: 17px; margin: 0 0 2px; display: flex; align-items: baseline; gap: 8px; }
  .region { font-size: 12px; font-weight: 500; color: #8a8378; }
  .date { font-size: 12px; color: #8a8378; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 7px 0; border-top: 1px solid #ece8e1; vertical-align: top; }
  td.t { width: 58px; font-variant-numeric: tabular-nums; font-weight: 700; font-size: 13px; color: #2f6b4f; white-space: nowrap; }
  .nm { font-size: 14px; font-weight: 600; }
  .loc { font-size: 12px; color: #6b6660; margin-top: 1px; }
  .note { font-size: 12px; color: #8a8378; margin-top: 2px; }
  .empty { font-size: 13px; color: #b3aca2; font-style: italic; }
  footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #ece8e1; font-size: 11px; color: #b3aca2; text-align: center; }
  @media print { body { padding: 0; } @page { margin: 18mm; } }
</style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <div class="sub">${sub}</div>
  </header>
  ${daysHtml}
  <footer>Trippy · ${esc(new Date().toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US'))}</footer>
</body>
</html>`);
    win.document.close();
    win.focus();
    // Give the new document a beat to lay out before invoking print.
    setTimeout(() => { try { win.print(); } catch { /* user can print manually */ } }, 450);
  };


  const themeOptions = [
    { id: 'light'  as const, icon: 'sun'  as const, label: t('themeLight') },
    { id: 'dark'   as const, icon: 'lock' as const, label: t('themeDark')  },
    { id: 'system' as const, icon: 'grid' as const, label: t('themeSystem') },
  ];

  return (
    <div
      className="lg-scroll"
      style={{ height: '100%', overflowY: 'auto', background: 'transparent' }}
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

      {/* ── Header - flat bold title + avatar (HANDOFF B10) ── */}
      <m.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '4px 0 24px' }}
      >
        <h1 className="text-display-sm" style={{ margin: 0 }}>
          {t('setupTitle') || 'Settings'}
        </h1>
        {authUser && (
          <span
            aria-hidden="true"
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'var(--brand)', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 16,
              boxShadow: 'var(--lg-glow-forest)',
            }}
          >
            {(authUser.username ?? '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        )}
      </m.div>

      {/* ── Trip info ── */}
      <Eyebrow style={{ marginBottom: 4 }}>{t('settingsTrip')}</Eyebrow>

      <m.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 24 }}
      >
        <Row
          icon="tent"
          title={locale === 'he' ? 'שם הטיול' : 'Trip name'}
          sub={`${trip.name} · ${formatDateRange(trip.startDate ?? null, trip.days, locale)} · ${trip.days} ${locale === 'he' ? 'ימים' : 'days'}`}
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
        <Row
          icon="coins"
          title={t('currencyLabel') || 'Currency'}
          sub={currencyLabel}
          right={chev}
          onClick={() => setShowCurrencyPicker(true)}
        />
        <Row
          icon="globe"
          title={t('languageLabel') || 'Language'}
          right={
            <div className="lg" role="radiogroup" aria-label="Language" style={{ display: 'flex', padding: 3, borderRadius: 9999, gap: 2 }}>
              {(['en', 'he'] as Locale[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  role="radio"
                  aria-checked={locale === l}
                  style={{
                    borderRadius: 9999, padding: '5px 11px', border: 0, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12,
                    background: locale === l ? 'var(--lg-forest)' : 'transparent',
                    color:      locale === l ? '#fff' : 'var(--text-3)',
                    transition: 'all var(--dur-base)', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {l === 'en' ? 'EN' : locale === 'he' ? 'עב' : 'HE'}
                </button>
              ))}
            </div>
          }
        />
        <Row
          icon="calExport"
          title={t('exportPDF') || 'Export as PDF'}
          sub={t('exportPDFSub') || 'Printable itinerary'}
          right={chev}
          onClick={handleExportPDF}
        />
      </m.div>

      {/* ── Appearance ── */}
      <Eyebrow style={{ marginBottom: 10 }}>{t('appearanceLabel')}</Eyebrow>

      <m.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.17, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'flex', gap: 8 }} role="radiogroup" aria-label="Theme">
          {themeOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setThemeMode(opt.id)}
              role="radio"
              aria-checked={themeMode === opt.id}
              style={{
                flex: 1, border: 0, cursor: 'pointer', borderRadius: 14, padding: '14px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: themeMode === opt.id ? 'var(--lg-forest)' : 'var(--lg-panel-strong)',
                color:      themeMode === opt.id ? '#fff' : 'var(--text-2)',
                boxShadow:  themeMode === opt.id ? 'var(--lg-glow-forest)' : 'var(--shadow-xs)',
                transition: 'all var(--dur-base)', WebkitTapHighlightColor: 'transparent',
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
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 24 }}
      >
        <Row
          icon="sparkle"
          title={t('highContrast') || 'High contrast'}
          sub={t('highContrastSub') || 'WCAG AA boosted'}
          right={<Toggle on={highContrast} onClick={toggleHighContrast} label="High contrast" />}
        />
      </m.div>

      {/* ── Security ── */}
      {onSecurity && (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>{locale === 'he' ? 'אבטחה' : 'Security'}</Eyebrow>
          <m.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: 24 }}
          >
            <Row
              icon="lock"
              title={locale === 'he' ? 'אבטחת חשבון' : 'Account Security'}
              sub={locale === 'he' ? 'אפשרויות אבטחה' : 'Security options'}
              right={<Icon name={isRTL ? 'chevL' : 'chevR'} size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
              onClick={onSecurity}
            />
          </m.div>
        </>
      )}

      {/* ── Switch trip ── */}
      <m.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.97 }}
        onClick={() => switchTrip()}
        className="lg-btn"
        style={{
          width: '100%', height: 50,
          background: 'var(--lg-panel)', color: 'var(--lg-ink)',
          boxShadow: 'var(--lg-shadow), inset 0 0 0 1px oklch(100% 0 0 / 12%)',
          marginBottom: 12, WebkitTapHighlightColor: 'transparent',
        }}
      >
        {locale === 'he' ? 'החלף טיול' : 'Switch trip'}
      </m.button>

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
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <Icon name="trash" size={16} color="var(--danger)" />
        {locale === 'he' ? 'מחק טיול' : 'Delete trip'}
      </m.button>

      {/* ── Sign out - quiet red text link (HANDOFF B10) ── */}
      <m.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.29, duration: 0.42 }}
        onClick={() => logout()}
        style={{
          display: 'block', margin: '2px auto 20px',
          background: 'none', border: 0, cursor: 'pointer', padding: '6px 12px',
          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
          color: 'var(--danger)', WebkitTapHighlightColor: 'transparent',
        }}
      >
        {locale === 'he' ? 'התנתק' : 'Sign out'}
      </m.button>

      {/* ── Version footer ── */}
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
        Trippy · v2.0 · Liquid Glass
      </p>

      {/* ── Currency picker sheet ── */}
      {mounted && createPortal(<AnimatePresence>
        {showCurrencyPicker && (
          <>
            <m.div
              key="currency-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowCurrencyPicker(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)', background: 'oklch(16% 0.018 60 / 42%)', backdropFilter: 'blur(3px)' }}
            />
            <m.div
              key="currency-sheet"
              className="lg lg-strong"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={spring.gentle}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 'var(--z-overlay)', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 48px)', borderRadius: 'var(--lg-r-lg) var(--lg-r-lg) 0 0', maxHeight: '65vh', overflowY: 'auto' }}
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
                      transition: 'background var(--dur-base)',
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
      </AnimatePresence>, document.body)}

      {/* ── Trip edit sheet ── */}
      {mounted && createPortal(<AnimatePresence>
        {showTripEdit && (
          <>
            <m.div
              key="backdrop-edit"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowTripEdit(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)', background: 'oklch(16% 0.018 60 / 42%)', backdropFilter: 'blur(3px)' }}
            />
            <m.div
              key="trip-edit-sheet"
              className="lg lg-strong"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={spring.gentle}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 'var(--z-overlay)', padding: '24px 24px calc(env(safe-area-inset-bottom, 0px) + 48px)', borderRadius: 'var(--lg-r-lg) var(--lg-r-lg) 0 0', maxHeight: '85vh', overflowY: 'auto' }}
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
      </AnimatePresence>, document.body)}

      {/* ── Delete confirm overlay ── */}
      {mounted && createPortal(<AnimatePresence>
        {showDeleteConfirm && (
          <>
            <m.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowDeleteConfirm(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)', background: 'oklch(16% 0.018 60 / 42%)', backdropFilter: 'blur(3px)' }}
            />
            <m.div
              key="sheet"
              className="lg lg-strong"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={spring.gentle}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 'var(--z-overlay)', padding: '24px 24px calc(env(safe-area-inset-bottom, 0px) + 40px)', borderRadius: 'var(--lg-r-lg) var(--lg-r-lg) 0 0' }}
            >
              <div style={{ width: 40, height: 5, borderRadius: 3, background: 'oklch(20% 0.03 60 / 18%)', margin: '0 auto 20px' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
                {locale === 'he'
                  ? 'מחיקה היא בלתי הפיכה - בטוחים שאתם רוצים?'
                  : 'This is permanent and cannot be undone. Sure you want to delete?'}
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
                      show(locale === 'he' ? 'הטיול נמחק בהצלחה' : 'Trip deleted - see you on the next one.');
                    } catch {
                      show(locale === 'he' ? 'שגיאה במחיקה - נסה שוב' : 'Failed to delete trip. Please try again.');
                    }
                  }}
                  className="lg-btn"
                  style={{ flex: 1, height: 52, background: 'var(--danger-bg)', color: 'var(--danger)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Icon name="trash" size={16} color="var(--danger)" />
                  {locale === 'he' ? 'מחק' : 'Delete'}
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>, document.body)}
      </div>{/* /resp-container */}
    </div>
  );
}
