'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Glass from '../ui/Glass';
import GlassBtn from '../ui/GlassBtn';
import Icon from '../ui/Icon';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { fmtDate } from '@/lib/utils';
import { useI18n, Locale } from '@/lib/i18n';
import { CURRENCIES } from '@/lib/currency';

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const sectionItem = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 32 } },
};

type ConfirmState = { message: string; onConfirm: () => void; variant?: 'danger' } | null;

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
    addExpense, deleteExpense,
    updateTripInfo,
    currencyByTrip, tripDbId, setCurrency, userId,
  } = useAppStore();

  // Primary: compare createdBy (set since v1.0.1). Fallback: first participant heuristic for old cached trips.
  const isOwner = trip?.createdBy
    ? trip.createdBy === userId
    : trip?.participants[0]?.name === nickname;
  const { show } = useToast();
  const { t, locale, setLocale, isRTL } = useI18n();
  const [nickEdit, setNickEdit] = useState(nickname);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const confirm = (message: string, onConfirm: () => void, variant?: 'danger') =>
    setConfirmState({ message, onConfirm, variant });

  // Trip info edit state
  const [tripNameEdit, setTripNameEdit]   = useState(trip?.name ?? '');
  const [tripDaysEdit, setTripDaysEdit]   = useState(String(trip?.days ?? ''));
  const [tripDateEdit, setTripDateEdit]   = useState(trip?.startDate ?? '');
  const [tripInfoDirty, setTripInfoDirty] = useState(false);

  if (!trip) return null;

  const handleExportPDF = () => {
    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const dateLocale = locale === 'he' ? 'he-IL' : 'en-US';
    // skip region when it's just the default "Day N" / "יום N" placeholder
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
        : evs.map(e => `
            <div class="ev">
              <span class="time" dir="ltr">${esc(e.time)}</span>
              <span class="name">${esc(e.name)}<span class="dur"> (${e.duration}min)</span>${e.location ? `<span class="loc"> @ ${esc(e.location)}</span>` : ''}</span>
            </div>
            ${e.notes ? `<div class="notes">${esc(e.notes)}</div>` : ''}`).join('');

      return `
        <div class="day">
          <div class="day-header">
            <span class="day-num">${t('day')} ${d}</span>${heading ? `<span class="day-sep"> — </span><span class="day-region">${esc(heading)}</span>` : ''}
          </div>
          ${evRows}
        </div>`;
    }).join('');

    const participants = trip.participants.length > 0
      ? `<div class="footer"><strong>${t('participantsLabel')}:</strong> ${trip.participants.map(p => esc(p.name)).join(', ')}</div>`
      : '';

    const subtitle = trip.startDate
      ? `${trip.days} ${t('days')} · ${t('pdfStarts')} ${fmtDate(trip.startDate, 0, dateLocale)}`
      : `${trip.days} ${t('days')}`;

    const rtlCSS = isRTL ? `
    body { direction: rtl; }
    .ev { flex-direction: row-reverse; padding: 4px 4px 2px 0; }
    .notes { padding: 2px 62px 6px 4px; }
    .empty { padding: 4px 8px 4px 4px; }` : '';

    const html = `<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${locale}">
<head>
  <meta charset="UTF-8">
  <title>${esc(trip.name)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 32px 40px; font-size: 13px; line-height: 1.5; max-width: 760px; margin: 0 auto; }
    h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: #111; margin-bottom: 4px; }
    .subtitle { color: #999; font-size: 12px; margin-bottom: 24px; }
    hr { border: none; border-top: 1px solid #e8e8e8; margin-bottom: 24px; }
    .day { margin-bottom: 20px; page-break-inside: avoid; }
    .day-header { background: #f5f5f7; border-radius: 6px; padding: 7px 12px; margin-bottom: 8px; font-size: 12px; font-weight: 700; color: #333; }
    .day-num { color: #555; }
    .day-sep { color: #bbb; }
    .day-region { color: #111; }
    .ev { display: flex; gap: 14px; padding: 4px 0 2px 4px; align-items: baseline; }
    .time { font-weight: 700; color: #555; min-width: 44px; font-size: 12px; flex-shrink: 0; }
    .name { color: #1a1a1a; font-size: 13px; }
    .dur { color: #999; font-size: 11px; }
    .loc { color: #888; font-size: 11px; }
    .notes { padding: 2px 4px 6px 62px; font-style: italic; color: #aaa; font-size: 11px; }
    .empty { padding: 4px 4px 4px 8px; font-style: italic; color: #ccc; font-size: 11px; }
    .footer { border-top: 1px solid #eee; margin-top: 32px; padding-top: 12px; color: #888; font-size: 11px; }
    @page { margin: 20mm; }
    @media print { body { padding: 0; } }
    ${rtlCSS}
  </style>
</head>
<body>
  <h1>${esc(trip.name)}</h1>
  <p class="subtitle">${esc(subtitle)}</p>
  <hr />
  ${dayRows}
  ${participants}
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) { show(t('pdfPopupBlocked')); return; }
    w.document.write(html);
    w.document.close();
    show(t('tripExportedPDF'));
  };

  const totalEvents = Object.values(trip.events).reduce((acc, evs) => acc + evs.length, 0);

  return (
    <div className="flex flex-col h-full w-full mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32, delay: 0.04 }}
        className="shrink-0"
        style={{ paddingTop: 'var(--page-pt)', paddingBottom: 20, paddingLeft: 'var(--page-px)', paddingRight: 'var(--page-px)' }}
      >
        <p className="eyebrow" style={{ marginBottom: 4 }}>{t('setupSub')}</p>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text)',
          lineHeight: 1.1,
        }}>
          {t('setupTitle')}
        </h1>
      </motion.div>

      <div className="flex-1 overflow-y-auto pb-8 w-full flex justify-center" style={{ paddingLeft: 'var(--page-px)', paddingRight: 'var(--page-px)' }}>
        <div className="w-full max-w-6xl">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >

            {/* ── Trip info (editable) ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('tripInfo')} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Trip Name */}
                  <EditRow label={t('nameLabel')} isRTL={isRTL}>
                    <input
                      value={tripNameEdit}
                      onChange={e => { setTripNameEdit(e.target.value); setTripInfoDirty(true); }}
                      className="input-premium"
                      style={inputStyle}
                      placeholder={t('tripName')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </EditRow>

                  {/* Days */}
                  <EditRow label={t('daysLabel')} isRTL={isRTL}>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={tripDaysEdit}
                      onChange={e => { setTripDaysEdit(e.target.value); setTripInfoDirty(true); }}
                      className="input-premium"
                      style={{ ...inputStyle, width: 80 }}
                    />
                  </EditRow>

                  {/* Start Date */}
                  <EditRow label={t('startLabel')} isRTL={isRTL}>
                    <input
                      type="date"
                      value={tripDateEdit}
                      onChange={e => { setTripDateEdit(e.target.value); setTripInfoDirty(true); }}
                      className="input-premium"
                      style={inputStyle}
                    />
                  </EditRow>

                  {/* Read-only rows */}
                  <Row label={t('eventsLabel')}       value={`${totalEvents} ${t('total')}`} />
                  <Row label={t('participantsLabel')} value={trip.participants.map(p => p.name).join(', ')} />

                  {/* Save button — only shown when dirty */}
                  <AnimatePresence>
                    {tripInfoDirty && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <GlassBtn
                          variant="accent"
                          size="sm"
                          style={{ width: '100%', marginTop: 4 }}
                          onClick={() => {
                            const newDays = Math.min(90, Math.max(1, parseInt(tripDaysEdit, 10) || trip.days));
                            const willLoseData = newDays < trip.days &&
                              Object.entries(trip.events).some(([d, evs]) => Number(d) > newDays && evs.length > 0);
                            if (willLoseData) {
                              confirm(
                                t('reduceDaysWarning')
                                  .replace('{newDays}', String(newDays))
                                  .replace('{from}', String(newDays + 1))
                                  .replace('{to}', String(trip.days)),
                                () => {
                                  updateTripInfo({
                                    name: tripNameEdit.trim() || trip.name,
                                    days: newDays,
                                    startDate: tripDateEdit || trip.startDate,
                                  });
                                  setTripDaysEdit(String(newDays));
                                  setTripInfoDirty(false);
                                  show(t('tripUpdated'));
                                },
                                'danger',
                              );
                              return;
                            }
                            updateTripInfo({
                              name: tripNameEdit.trim() || trip.name,
                              days: newDays,
                              startDate: tripDateEdit || trip.startDate,
                            });
                            setTripDaysEdit(String(newDays));
                            setTripInfoDirty(false);
                            show(t('tripUpdated'));
                          }}
                        >
                          <Icon name="check" size={13} /> {t('saveBtn')}
                        </GlassBtn>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Glass>
            </motion.div>

            {/* ── My profile ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('myProfile')} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', overflow: 'hidden' }}>
                  <input
                    value={nickEdit}
                    onChange={e => setNickEdit(e.target.value)}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="input-premium"
                    style={{
                      flex: 1, minWidth: 0, padding: '11px 14px', borderRadius: 'var(--radius-md)', fontSize: 15,
                      minHeight: 44,
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      outline: 'none', color: 'var(--text)',
                      fontFamily: 'var(--font-sans)',
                      boxSizing: 'border-box',
                    }}
                    placeholder={t('yourNickname')}
                  />
                  <GlassBtn
                    size="sm" variant="accent"
                    onClick={() => { setNickname(nickEdit); show(t('nicknameUpdated')); }}
                  >
                    {t('saveBtn')}
                  </GlassBtn>
                </div>
              </Glass>
            </motion.div>

            {/* ── Appearance ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('appearanceLabel')} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Three-way theme toggle: Light / System / Dark */}
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                      {locale === 'he' ? 'ערכת נושא' : 'Theme'}
                    </span>
                    <div style={{
                      display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden',
                      border: '1px solid var(--border)', background: 'var(--bg)',
                    }}>
                      {(['light', 'system', 'dark'] as const).map((mode) => (
                        <motion.button
                          key={mode}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setThemeMode(mode)}
                          style={{
                            flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 600,
                            background: themeMode === mode ? 'var(--brand)' : 'transparent',
                            color: themeMode === mode ? 'white' : 'var(--text-2)',
                            border: 'none', cursor: 'pointer',
                            transition: 'background 0.18s, color 0.18s',
                          }}
                        >
                          {mode === 'light' ? '☀ Light' : mode === 'system' ? '🌓 System' : '☾ Dark'}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <ToggleRow
                    label={`⬛ ${t('highContrast')}`}
                    sub={t('highContrastSub')}
                    checked={highContrast}
                    onToggle={toggleHighContrast}
                  />
                </div>
              </Glass>
            </motion.div>

            {/* ── Accessibility ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('accessibilityLabel')} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ToggleRow
                    label={`🐢 ${t('reduceMotion')}`}
                    sub={t('reduceMotionSub')}
                    checked={reducedMotion}
                    onToggle={toggleReducedMotion}
                  />
                </div>
              </Glass>
            </motion.div>

            {/* ── Currency ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={`💱 ${t('currencyLabel')}`} />
                <select
                  value={(tripDbId && currencyByTrip[tripDbId]) || 'USD'}
                  onChange={e => { setCurrency(e.target.value); show(t('currencyChanged')); }}
                  style={{
                    width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)',
                    fontSize: 15, fontWeight: 500, minHeight: 44,
                    background: 'var(--bg)', color: 'var(--text)',
                    border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const,
                    marginTop: 4, fontFamily: 'var(--font-sans)',
                  }}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} — {locale === 'he' ? c.labelHe : c.label}
                    </option>
                  ))}
                </select>
              </Glass>
            </motion.div>

            {/* ── Display preferences ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('displayLabel')} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ToggleRow
                    label={`💰 ${t('hideBudget')}`}
                    sub={t('hideBudgetSub')}
                    checked={hideBudget}
                    onToggle={toggleHideBudget}
                  />
                  <ToggleRow
                    label={`🌍 ${t('carbonBudget')}`}
                    sub={t('carbonBudgetSub')}
                    checked={showCarbonBudget}
                    onToggle={toggleShowCarbonBudget}
                  />
                </div>
              </Glass>
            </motion.div>

            {/* ── Night Owl Mode ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={`🦉 ${t('nightOwlLabel')}`} />
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, marginTop: -8 }}>
                  {t('nightOwlSub')}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { h: 23, label: t('nightOwlStandard') },
                    { h: 25, label: t('nightOwlLate') },
                    { h: 27, label: t('nightOwlExtreme') },
                  ].map(opt => (
                    <motion.button
                      key={opt.h}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => { setDayEndHour(opt.h); show(t('dayBoundaryUpdated')); }}
                      style={{
                        padding: '8px 14px', borderRadius: 'var(--radius-md)',
                        fontSize: 12, fontWeight: 600,
                        background: dayEndHour === opt.h ? 'var(--brand)' : 'var(--bg)',
                        color: dayEndHour === opt.h ? 'white' : 'var(--text-2)',
                        border: dayEndHour === opt.h ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
                      }}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </Glass>
            </motion.div>

            {/* ── Language ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('languageLabel')} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['en', 'he'] as Locale[]).map(l => (
                    <motion.button
                      key={l}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setLocale(l)}
                      style={{
                        padding: '9px 20px', borderRadius: 'var(--radius-md)',
                        fontSize: 13, fontWeight: 600,
                        background: locale === l ? 'var(--brand)' : 'var(--bg)',
                        color: locale === l ? 'white' : 'var(--text-2)',
                        border: locale === l ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
                      }}
                    >
                      {l === 'en' ? t('english') : t('hebrew')}
                    </motion.button>
                  ))}
                </div>
              </Glass>
            </motion.div>


            {/* ── Export ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('exportTrip')} icon="calExport" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ExportBtn label={t('exportPDF')} sub={t('exportPDFSub')} onClick={handleExportPDF} />
                </div>
              </Glass>
            </motion.div>

            {/* ── About ── */}
            <motion.div variants={sectionItem}>
              <Glass level={1} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('aboutLabel')} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Row label={t('aboutApp')}     value={t('appName')} />
                  <Row label={t('aboutVersion')} value={t('appVersion')} />
                  <Row label={t('aboutStack')}   value={t('appStack')} />
                </div>
              </Glass>
            </motion.div>

            {/* ── Trip controls ── */}
            <motion.div variants={sectionItem} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Switch Trip — stays signed in, just picks another trip */}
              <GlassBtn
                size="lg"
                style={{ width: '100%' }}
                onClick={switchTrip}
              >
                {locale === 'he' ? '🔄 החלף טיול' : '🔄 Switch Trip'}
              </GlassBtn>

              {/* Leave Trip — only for non-owners */}
              {!isOwner && (
                <GlassBtn
                  variant="danger"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={() => {
                    const warning = locale === 'he'
                      ? 'האם אתה בטוח? פעולה זו תסיר אותך מהטיול.'
                      : 'Are you sure? This will remove you from the trip.';
                    confirm(warning, () => leaveTrip().catch(() => show(locale === 'he' ? 'שגיאה בעזיבת הטיול. נסה שוב.' : 'Failed to leave trip. Please try again.')), 'danger');
                  }}
                >
                  {t('leaveTrip')}
                </GlassBtn>
              )}

              {/* Delete Trip — only for the owner, permanently destroys the trip for everyone */}
              {isOwner && (
                <GlassBtn
                  variant="danger"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={() => {
                    const warning = locale === 'he'
                      ? 'מחיקת הטיול היא פעולה בלתי הפיכה. כל הנתונים (אירועים, הוצאות, הערות) יימחקו לצמיתות עבור כל המשתתפים. להמשיך?'
                      : 'Deleting the trip is permanent and cannot be undone. All data (events, expenses, notes) will be erased for all participants. Continue?';
                    confirm(warning, () => deleteTrip().catch(() => show(locale === 'he' ? 'שגיאה במחיקת הטיול. נסה שוב.' : 'Failed to delete trip. Please try again.')), 'danger');
                  }}
                >
                  {locale === 'he' ? '🗑 מחק טיול לצמיתות' : '🗑 Delete Trip Permanently'}
                </GlassBtn>
              )}

              {/* Sign Out — terminates the session, trip membership is preserved */}
              <GlassBtn
                size="lg"
                style={{ width: '100%', opacity: 0.75 }}
                onClick={() => {
                  confirm(locale === 'he' ? 'להתנתק?' : 'Sign out?', logout);
                }}
              >
                {locale === 'he' ? '↩ התנתק' : '↩ Sign Out'}
              </GlassBtn>

              {/* Delete My Data — initiates 2-step email-confirmed deletion (SEC-4) */}
              <GlassBtn
                variant="danger"
                size="lg"
                style={{ width: '100%', opacity: deletingAccount ? 0.6 : 1 }}
                onClick={() => {
                  confirm(
                    locale === 'he'
                      ? 'בטוח? נשלח אליך מייל לאישור. יש לך 24 שעות לשנות את דעתך.'
                      : "Are you sure? We'll email you a confirmation link. You'll have 24 hours to change your mind.",
                    async () => {
                      setDeletingAccount(true);
                      try {
                        const res = await fetch('/api/account/delete/request', { method: 'POST' });
                        if (res.ok) {
                          show(locale === 'he' ? 'נשלח מייל אישור ✓' : 'Confirmation email sent ✓');
                        } else {
                          show(t('deleteAccountFailed'));
                        }
                      } catch {
                        show(t('deleteAccountFailed'));
                      } finally {
                        setDeletingAccount(false);
                      }
                    },
                    'danger',
                  );
                }}
              >
                {deletingAccount
                  ? (locale === 'he' ? '…שולח' : 'Sending…')
                  : `🗑 ${t('deleteAccount')}`}
              </GlassBtn>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* ── In-app confirm sheet ── */}
      {/* Two separate AnimatePresence blocks — Framer Motion can't track Fragment exit animations */}
      <AnimatePresence>
        {confirmState && (
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setConfirmState(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 80,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(2px)',
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmState && (
          <motion.div
            key="confirm-sheet"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 81,
              padding: '20px 20px 32px',
              background: 'var(--glass)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            }}
          >
              <p style={{
                fontSize: 15, fontWeight: 600, color: 'var(--text)',
                textAlign: 'center', marginBottom: 20, lineHeight: 1.5,
              }}>
                {confirmState.message}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <GlassBtn
                  size="lg"
                  style={{ flex: 1 }}
                  onClick={() => setConfirmState(null)}
                >
                  {locale === 'he' ? 'ביטול' : 'Cancel'}
                </GlassBtn>
                <GlassBtn
                  variant={confirmState.variant === 'danger' ? 'danger' : 'accent'}
                  size="lg"
                  style={{ flex: 1 }}
                  onClick={() => { confirmState.onConfirm(); setConfirmState(null); }}
                >
                  {locale === 'he' ? 'אישור' : 'Confirm'}
                </GlassBtn>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  fontSize: 15,
  fontWeight: 500,
  minHeight: 44,
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  outline: 'none',
  color: 'var(--text)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
  maxWidth: '100%',
};

function EditRow({ label, children, isRTL }: { label: string; children: React.ReactNode; isRTL?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12,
      padding: '4px 0',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-2)', flexShrink: 0, fontWeight: 500, minWidth: 60 }}>
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: isRTL ? 'flex-start' : 'flex-end', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ label, icon }: { label: string; icon?: string }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {icon && <Icon name={icon as 'calExport'} size={13} />}
      {label}
    </p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      gap: 12, padding: '4px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-2)', flexShrink: 0, fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text)',
        textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', maxWidth: '65%',
      }}>
        {value}
      </span>
    </div>
  );
}

function ToggleRow({ label, sub, checked, onToggle }: { label: string; sub?: string; checked: boolean; onToggle: () => void }) {
  const { isRTL } = useI18n();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{label}</span>
        {sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.4 }}>{sub}</p>}
      </div>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        style={{
          width: 52, height: 28, borderRadius: 14,
          background: checked ? 'var(--brand)' : 'var(--border)',
          border: 'none', cursor: 'pointer',
          position: 'relative', transition: 'background 0.25s',
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={{ x: checked ? (isRTL ? -26 : 26) : (isRTL ? -2 : 2) }}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
          style={{
            position: 'absolute', top: 2, [isRTL ? 'right' : 'left']: 0,
            width: 24, height: 24, borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}
        />
      </motion.button>
    </div>
  );
}

function ExportBtn({ label, sub, onClick, disabled = false }: { label: string; sub: string; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        opacity: disabled ? 0.45 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textAlign: 'left' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-2)', textAlign: 'left' }}>{sub}</p>
      </div>
      <Icon name="download" size={15} style={{ color: 'var(--text-3)' }} />
    </motion.button>
  );
}
