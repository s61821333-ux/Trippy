'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { fmtDate } from '@/lib/utils';
import { useI18n, Locale } from '@/lib/i18n';
import { CURRENCIES } from '@/lib/currency';

type ConfirmState = { message: string; onConfirm: () => void; variant?: 'danger' } | null;

/* ── LG Toggle switch ─────────────────────────────────────────────── */
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  const { isRTL } = useI18n();
  return (
    <button
      onClick={onClick}
      aria-checked={on}
      role="switch"
      style={{
        width: 50, height: 30, borderRadius: 9999, border: 0, cursor: 'pointer', padding: 3, flexShrink: 0,
        background: on ? 'var(--lg-forest)' : 'oklch(50% 0.02 60 / 24%)',
        boxShadow: on ? 'var(--lg-glow-forest)' : 'none',
        transition: 'background .3s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <motion.span
        animate={{ x: on ? (isRTL ? -20 : 20) : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        style={{
          display: 'block', width: 24, height: 24, borderRadius: '50%',
          background: '#fff', boxShadow: 'var(--lg-shadow)',
        }}
      />
    </button>
  );
}

/* ── LG Row ───────────────────────────────────────────────────────── */
function Row({ icon, title, sub, right, onClick }: { icon?: string; title: string; sub?: string; right?: React.ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', cursor: onClick ? 'pointer' : 'default' }}>
      {icon && (
        <span className="lg-btn lg-btn-glass" style={{ width: 38, height: 38, padding: 0, flexShrink: 0 }}>
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
  return <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 10%)' }} />;
}

export default function SettingsScreen() {
  const [deletingAccount, setDeletingAccount] = useState(false);

  const {
    trip, nickname, setNickname, logout, switchTrip, leaveTrip, deleteTrip, deleteAccount,
    themeMode, setThemeMode,
    highContrast, toggleHighContrast,
    reducedMotion, toggleReducedMotion,
    hideBudget, toggleHideBudget,
    showCarbonBudget, toggleShowCarbonBudget,
    dayEndHour, setDayEndHour,
    updateTripInfo,
    currencyByTrip, tripDbId, setCurrency, userId,
  } = useAppStore();

  const isOwner = trip?.createdBy
    ? trip.createdBy === userId
    : trip?.participants[0]?.name === nickname;

  const { show } = useToast();
  const { t, locale, setLocale, isRTL } = useI18n();
  const [nickEdit, setNickEdit] = useState(nickname);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const confirm = (message: string, onConfirm: () => void, variant?: 'danger') =>
    setConfirmState({ message, onConfirm, variant });

  const [tripNameEdit, setTripNameEdit] = useState(trip?.name ?? '');
  const [tripDaysEdit, setTripDaysEdit] = useState(String(trip?.days ?? ''));
  const [tripDateEdit, setTripDateEdit] = useState(trip?.startDate ?? '');
  const [tripInfoDirty, setTripInfoDirty] = useState(false);

  if (!trip) return null;

  const totalEvents = Object.values(trip.events).reduce((acc, evs) => acc + evs.length, 0);
  const currency = (tripDbId && currencyByTrip[tripDbId]) || 'USD';

  const handleExportPDF = () => {
    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const dateLocale = locale === 'he' ? 'he-IL' : 'en-US';
    const isDefaultRegion = (r: string) => /^(Day|יום)\s+\d+$/i.test(r.trim());

    const dayRows = Array.from({ length: trip.days }, (_, i) => {
      const d = i + 1;
      const meta   = trip.dayMeta[i];
      const region = meta?.region && !isDefaultRegion(meta.region) ? meta.region.trim() : '';
      const date   = trip.startDate ? fmtDate(trip.startDate, i, dateLocale) : '';
      const heading = [region, date].filter(Boolean).join(' · ');
      const evs    = [...(trip.events[d] ?? [])].sort((a, b) => a.time.localeCompare(b.time));
      const evRows = evs.length === 0
        ? `<p class="empty">${t('pdfNoEvents')}</p>`
        : evs.map(e => `<div class="ev"><span class="time" dir="ltr">${esc(e.time)}</span><span class="name">${esc(e.name)}<span class="dur"> (${e.duration}min)</span>${e.location ? `<span class="loc"> @ ${esc(e.location)}</span>` : ''}</span></div>${e.notes ? `<div class="notes">${esc(e.notes)}</div>` : ''}`).join('');
      return `<div class="day"><div class="day-header"><span class="day-num">${t('day')} ${d}</span>${heading ? `<span class="day-sep"> — </span><span class="day-region">${esc(heading)}</span>` : ''}</div>${evRows}</div>`;
    }).join('');

    const html = `<!DOCTYPE html><html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${locale}"><head><meta charset="UTF-8"><title>${esc(trip.name)}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:32px 40px;font-size:13px;line-height:1.5;max-width:760px;margin:0 auto}h1{font-size:26px;font-weight:800;letter-spacing:-0.03em;margin-bottom:4px}.subtitle{color:#999;font-size:12px;margin-bottom:24px}hr{border:none;border-top:1px solid #e8e8e8;margin-bottom:24px}.day{margin-bottom:20px;page-break-inside:avoid}.day-header{background:#f5f5f7;border-radius:6px;padding:7px 12px;margin-bottom:8px;font-size:12px;font-weight:700;color:#333}.day-num{color:#555}.day-sep{color:#bbb}.day-region{color:#111}.ev{display:flex;gap:14px;padding:4px 0 2px 4px;align-items:baseline}.time{font-weight:700;color:#555;min-width:44px;font-size:12px;flex-shrink:0}.name{color:#1a1a1a;font-size:13px}.dur{color:#999;font-size:11px}.loc{color:#888;font-size:11px}.notes{padding:2px 4px 6px 62px;font-style:italic;color:#aaa;font-size:11px}.empty{padding:4px 4px 4px 8px;font-style:italic;color:#ccc;font-size:11px}.footer{border-top:1px solid #eee;margin-top:32px;padding-top:12px;color:#888;font-size:11px}@page{margin:20mm}</style></head><body><h1>${esc(trip.name)}</h1><p class="subtitle">${trip.days} ${t('days')}</p><hr />${dayRows}${trip.participants.length > 0 ? `<div class="footer"><strong>${t('participantsLabel')}:</strong> ${trip.participants.map((p: { name: string }) => esc(p.name)).join(', ')}</div>` : ''}<script>window.onload=()=>{window.print()}<\/script></body></html>`;

    const w = window.open('', '_blank');
    if (!w) { show(t('pdfPopupBlocked')); return; }
    w.document.write(html);
    w.document.close();
    show(t('tripExportedPDF'));
  };

  const chev = <Icon name={isRTL ? 'chevL' : 'chevR'} size={16} color="var(--text-3)" />;

  return (
    <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', padding: '6px 20px 130px' }}>
      <p className="eyebrow-lg a-rise" style={{ color: 'var(--lg-terra)', marginBottom: 2 }}>
        {t('setupSub') as string || 'Trip & preferences'}
      </p>
      <h1 className="display-xl a-rise d1" style={{ fontSize: 38, color: 'var(--lg-ink)', margin: '0 0 22px' }}>
        {t('setupTitle') as string || 'Settings'}
      </h1>

      {/* Trip info */}
      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
        {t('tripInfo') as string || 'Trip'}
      </p>
      <div className="lg a-rise" style={{ padding: '4px 16px', marginBottom: 16 }}>
        <Row
          icon="edit"
          title={trip.name}
          sub={`${trip.days} ${t('days') as string || 'days'} · ${totalEvents} events`}
          right={chev}
          onClick={() => {}}
        />
        <Divider />
        <Row
          icon="calendar"
          title={t('startLabel') as string || 'Start date'}
          sub={trip.startDate || (t('notSet') as string || 'Not set')}
          right={chev}
        />
        <Divider />
        <Row icon="users" title={t('participantsLabel') as string || 'Crew'} sub={trip.participants.map((p: { name: string }) => p.name).join(', ')} />
      </div>

      {/* My profile / nickname */}
      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
        {t('myProfile') as string || 'Profile'}
      </p>
      <div className="lg a-rise d1" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={nickEdit}
            onChange={e => setNickEdit(e.target.value)}
            dir={isRTL ? 'rtl' : 'ltr'}
            placeholder={t('yourNickname') as string || 'Your name'}
            style={{
              flex: 1, minWidth: 0, height: 48, border: 0, borderRadius: 14,
              padding: '0 16px', fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--lg-ink)', outline: 'none',
              background: 'var(--lg-panel-strong)',
              boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
            }}
          />
          <button
            onClick={() => { setNickname(nickEdit); show(t('nicknameUpdated')); }}
            className="lg-btn lg-btn-forest"
            style={{ height: 48, padding: '0 20px', fontSize: 13 }}
          >
            {t('saveBtn') as string || 'Save'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
        {t('appearanceLabel') as string || 'Appearance'}
      </p>
      <div className="lg a-rise d1" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['light', 'system', 'dark'] as const).map((mode, i) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              style={{
                flex: 1, border: 0, cursor: 'pointer', borderRadius: 14, padding: '14px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: themeMode === mode ? 'var(--lg-forest)' : 'var(--lg-panel-strong)',
                color: themeMode === mode ? '#fff' : 'var(--text-2)',
                boxShadow: themeMode === mode ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                transition: 'all .25s',
              }}
            >
              <Icon name={mode === 'light' ? 'sun' : mode === 'dark' ? 'lock' : 'grid'} size={20} color={themeMode === mode ? '#fff' : 'var(--text-3)'} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{mode === 'light' ? 'Light' : mode === 'system' ? 'System' : 'Dark'}</span>
            </button>
          ))}
        </div>
        <Divider />
        <Row title={t('highContrast') as string || 'High contrast'} sub={t('highContrastSub') as string || 'WCAG AA boosted'} right={<Toggle on={highContrast} onClick={toggleHighContrast} />} />
        <Divider />
        <Row title={t('reduceMotion') as string || 'Reduce motion'} sub={t('reduceMotionSub') as string || 'Calm transitions'} right={<Toggle on={reducedMotion} onClick={toggleReducedMotion} />} />
      </div>

      {/* Trip preferences */}
      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
        {t('tripLabel') as string || 'Trip'}
      </p>
      <div className="lg a-rise d2" style={{ padding: '4px 16px', marginBottom: 16 }}>
        <Row
          icon="download"
          title={t('currencyLabel') as string || 'Currency'}
          sub={currency}
          right={
            <div className="lg" style={{ display: 'flex', padding: 3, borderRadius: 9999, gap: 2, boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)' }}>
              <select
                value={currency}
                onChange={e => { setCurrency(e.target.value); show(t('currencyChanged')); }}
                style={{ background: 'transparent', border: 0, color: 'var(--lg-ink)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', outline: 'none', padding: '4px 8px' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                ))}
              </select>
            </div>
          }
        />
        <Divider />
        <Row
          icon="share"
          title={t('languageLabel') as string || 'Language'}
          right={
            <div className="lg" style={{ display: 'flex', padding: 3, borderRadius: 9999, gap: 2, boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)' }}>
              {(['en', 'he'] as Locale[]).map(l => (
                <span
                  key={l}
                  onClick={() => setLocale(l)}
                  style={{ borderRadius: 9999, padding: '5px 11px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    background: locale === l ? 'var(--lg-forest)' : 'transparent', color: locale === l ? '#fff' : 'var(--text-3)' }}
                >
                  {l === 'en' ? 'EN' : 'עב'}
                </span>
              ))}
            </div>
          }
        />
        <Divider />
        <Row title={t('hideBudget') as string || 'Hide budget'} right={<Toggle on={hideBudget} onClick={toggleHideBudget} />} />
        <Divider />
        <Row title={t('carbonBudget') as string || 'Carbon footprint'} right={<Toggle on={showCarbonBudget} onClick={toggleShowCarbonBudget} />} />
        <Divider />
        <Row icon="calExport" title={t('exportPDF') as string || 'Export as PDF'} sub={t('exportPDFSub') as string || 'Printable itinerary'} right={chev} onClick={handleExportPDF} />
      </div>

      {/* Trip controls */}
      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
        {t('tripLabel') as string || 'Controls'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <button onClick={switchTrip} className="lg-btn lg-btn-glass" style={{ height: 50, width: '100%', fontSize: 14 }}>
          <Icon name="swap" size={17} color="var(--lg-terra)" />
          {locale === 'he' ? 'החלף טיול' : 'Switch Trip'}
        </button>

        {!isOwner && (
          <button
            onClick={() => confirm(locale === 'he' ? 'האם אתה בטוח?' : 'Are you sure? This will remove you from the trip.', () => leaveTrip().catch(() => show(locale === 'he' ? 'שגיאה' : 'Failed to leave trip.')), 'danger')}
            className="lg-btn"
            style={{ height: 50, width: '100%', background: 'var(--danger-bg)', color: 'var(--danger)', boxShadow: 'inset 0 0 0 1px oklch(48% 0.130 25 / 18%)', fontSize: 14 }}
          >
            {t('leaveTrip') as string || 'Leave trip'}
          </button>
        )}

        {isOwner && (
          <button
            onClick={() => confirm(locale === 'he' ? 'מחיקה היא בלתי הפיכה.' : 'Deleting is permanent and cannot be undone. Continue?', () => deleteTrip().catch(() => show(locale === 'he' ? 'שגיאה' : 'Failed to delete trip.')), 'danger')}
            className="lg-btn"
            style={{ height: 50, width: '100%', background: 'var(--danger-bg)', color: 'var(--danger)', boxShadow: 'inset 0 0 0 1px oklch(48% 0.130 25 / 18%)', fontSize: 14 }}
          >
            {locale === 'he' ? 'מחק טיול לצמיתות' : 'Delete Trip Permanently'}
          </button>
        )}

        <button
          onClick={() => confirm(locale === 'he' ? 'להתנתק?' : 'Sign out?', logout)}
          className="lg-btn lg-btn-glass"
          style={{ height: 50, width: '100%', fontSize: 14, opacity: 0.8 }}
        >
          {locale === 'he' ? 'התנתק' : 'Sign Out'}
        </button>

        <button
          disabled={deletingAccount}
          onClick={() => confirm(
            locale === 'he' ? "נשלח מייל לאישור. יש לך 24 שעות לשנות דעתך." : "We'll email you a confirmation link. You'll have 24 hours to change your mind.",
            async () => {
              setDeletingAccount(true);
              try {
                const res = await fetch('/api/account/delete/request', { method: 'POST' });
                show(res.ok ? (locale === 'he' ? 'נשלח מייל אישור ✓' : 'Confirmation email sent ✓') : t('deleteAccountFailed'));
              } catch { show(t('deleteAccountFailed')); } finally { setDeletingAccount(false); }
            }, 'danger'
          )}
          className="lg-btn"
          style={{ height: 50, width: '100%', background: 'var(--danger-bg)', color: 'var(--danger)', boxShadow: 'inset 0 0 0 1px oklch(48% 0.130 25 / 18%)', fontSize: 14, opacity: deletingAccount ? 0.6 : 1 }}
        >
          {deletingAccount ? (locale === 'he' ? '…שולח' : 'Sending…') : `${t('deleteAccount') as string || 'Delete My Data'}`}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
        Trippy · v1.0.0 · Liquid Glass
      </p>

      {/* Confirm sheet */}
      <AnimatePresence>
        {confirmState && (
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setConfirmState(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'oklch(16% 0.018 60 / 42%)', backdropFilter: 'blur(3px)' }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmState && (
          <motion.div
            key="confirm-sheet"
            className="lg lg-strong"
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 32 }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 81,
              padding: '24px 24px 40px', borderRadius: 'var(--lg-r-lg) var(--lg-r-lg) 0 0',
            }}
          >
            <div style={{ width: 40, height: 5, borderRadius: 3, background: 'oklch(20% 0.03 60 / 18%)', margin: '0 auto 20px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmState(null)} className="lg-btn lg-btn-glass" style={{ flex: 1, height: 52 }}>
                {locale === 'he' ? 'ביטול' : 'Cancel'}
              </button>
              <button
                onClick={() => { confirmState.onConfirm(); setConfirmState(null); }}
                className="lg-btn"
                style={{ flex: 1, height: 52, background: confirmState.variant === 'danger' ? 'var(--danger-bg)' : 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))', color: confirmState.variant === 'danger' ? 'var(--danger)' : '#fff', boxShadow: confirmState.variant === 'danger' ? 'none' : 'var(--lg-glow-terra)' }}
              >
                {locale === 'he' ? 'אישור' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
