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
import { EmergencyContact } from '@/lib/types';

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const sectionItem = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 32 } },
};

const EMERGENCY_TYPE_META: Record<EmergencyContact['type'], { icon: string; label: string; color: string }> = {
  medical:   { icon: '🏥', label: 'Medical',   color: 'var(--danger)'  },
  embassy:   { icon: '🏛️', label: 'Embassy',   color: 'var(--brand)'   },
  personal:  { icon: '👤', label: 'Personal',  color: 'var(--text-2)'  },
  insurance: { icon: '🛡️', label: 'Insurance', color: 'var(--warning)' },
};

type ConfirmState = { message: string; onConfirm: () => void; variant?: 'danger' } | null;

export default function SettingsScreen() {
  const {
    trip, nickname, setNickname, logout, switchTrip, leaveTrip,
    darkMode, toggleDarkMode,
    highContrast, toggleHighContrast,
    reducedMotion, toggleReducedMotion,
    hideBudget, toggleHideBudget,
    showCarbonBudget, toggleShowCarbonBudget,
    dayEndHour, setDayEndHour,
    addTripNote, deleteTripNote,
    addExpense, deleteExpense,
    addEmergencyContact, deleteEmergencyContact,
    updateTripInfo,
  } = useAppStore();
  const { show } = useToast();
  const { t, locale, setLocale, isRTL } = useI18n();
  const [nickEdit, setNickEdit] = useState(nickname);
  const [newNote, setNewNote] = useState('');
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const confirm = (message: string, onConfirm: () => void, variant?: 'danger') =>
    setConfirmState({ message, onConfirm, variant });

  // Trip info edit state
  const [tripNameEdit, setTripNameEdit]   = useState(trip?.name ?? '');
  const [tripDaysEdit, setTripDaysEdit]   = useState(String(trip?.days ?? ''));
  const [tripDateEdit, setTripDateEdit]   = useState(trip?.startDate ?? '');
  const [tripInfoDirty, setTripInfoDirty] = useState(false);

  // Emergency contact form state
  const [ecName, setEcName]   = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecType, setEcType]   = useState<EmergencyContact['type']>('personal');

  if (!trip) return null;

  const handleExportJSON = () => {
    const data = JSON.stringify({ trip }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${trip.name.replace(/\s+/g,'_')}.json`;
    a.click(); URL.revokeObjectURL(url);
    show(t('tripExportedJSON'));
  };

  const handleExportMarkdown = () => {
    const lines = [`# ${trip.name}\n`];
    for (let d = 1; d <= trip.days; d++) {
      const meta = trip.dayMeta[d - 1];
      lines.push(`## Day ${d} — ${meta?.region ?? ''} ${trip.startDate ? `(${fmtDate(trip.startDate, d - 1)})` : ''}`);
      const evs = [...(trip.events[d] ?? [])].sort((a, b) => a.time.localeCompare(b.time));
      if (evs.length === 0) { lines.push('No events scheduled.\n'); continue; }
      for (const e of evs) {
        lines.push(`- **${e.time}** ${e.name} (${e.duration}min)${e.location ? ` @ ${e.location}` : ''}${e.notes ? `\n  > ${e.notes}` : ''}`);
      }
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${trip.name.replace(/\s+/g,'_')}.md`;
    a.click(); URL.revokeObjectURL(url);
    show(t('tripExportedMD'));
  };

  const totalEvents = Object.values(trip.events).reduce((acc, evs) => acc + evs.length, 0);

  const handleAddEmergencyContact = () => {
    if (!ecName.trim() || !ecPhone.trim()) { show(t('enterNamePhone')); return; }
    addEmergencyContact({ name: ecName.trim(), phone: ecPhone.trim(), type: ecType });
    setEcName(''); setEcPhone('');
    show(t('emergencySaved'));
  };

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
                      flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 14,
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
                  <ToggleRow
                    label={darkMode ? `🌙 ${t('darkMode')}` : `☀️ ${t('lightMode')}`}
                    checked={darkMode}
                    onToggle={toggleDarkMode}
                  />
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

            {/* ── Emergency Hub ── */}
            <motion.div variants={sectionItem} className="md:col-span-2">
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={`🆘 ${t('emergencyHubLabel')}`} />
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, marginTop: -8 }}>
                  {t('emergencyHubSub')}
                </p>

                {/* Type selector */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {(Object.keys(EMERGENCY_TYPE_META) as EmergencyContact['type'][]).map(type => {
                    const m = EMERGENCY_TYPE_META[type];
                    return (
                      <motion.button
                        key={type}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setEcType(type)}
                        style={{
                          padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                          fontSize: 11, fontWeight: 600,
                          background: ecType === type ? 'var(--brand-light)' : 'var(--bg)',
                          color: ecType === type ? 'var(--brand)' : 'var(--text-2)',
                          border: ecType === type ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                      >
                        {m.icon} {t(type as any)}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Add contact row — stacked for mobile friendliness */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <input
                    value={ecName}
                    onChange={e => setEcName(e.target.value)}
                    placeholder={t('emergencyNamePlaceholder')}
                    className="input-premium"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      fontSize: 13, background: 'var(--bg)',
                      border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={ecPhone}
                      onChange={e => setEcPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddEmergencyContact()}
                      placeholder={t('emergencyPhonePlaceholder')}
                      className="input-premium"
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                        fontSize: 13, background: 'var(--bg)',
                        border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                        minWidth: 0,
                      }}
                    />
                    <GlassBtn size="sm" variant="accent" onClick={handleAddEmergencyContact} style={{ flexShrink: 0 }}>
                      <Icon name="plus" size={13} />
                    </GlassBtn>
                  </div>
                </div>

                {/* Contact list */}
                {(!trip.emergencyContacts || trip.emergencyContacts.length === 0) ? (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                    {t('noEmergencyContacts')}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <AnimatePresence>
                      {trip.emergencyContacts.map(contact => {
                        const m = EMERGENCY_TYPE_META[contact.type];
                        return (
                          <motion.div
                            key={contact.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)', padding: '10px 12px',
                            }}
                          >
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{contact.name}</p>
                              <a
                                href={`tel:${contact.phone}`}
                                style={{ fontSize: 12, color: m.color, fontWeight: 600, textDecoration: 'none' }}
                              >
                                {contact.phone}
                              </a>
                            </div>
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: m.color,
                              background: 'var(--bg-alt)', borderRadius: 100,
                              padding: '2px 8px', border: '1px solid var(--border)',
                              flexShrink: 0,
                            }}>
                              {t(contact.type as any)}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => { deleteEmergencyContact(contact.id); show(t('contactRemoved')); }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--text-3)', padding: '2px 4px', flexShrink: 0,
                              }}
                            >
                              <Icon name="trash" size={13} />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </Glass>
            </motion.div>

            {/* ── Travel Vault / Notes ── */}
            <motion.div variants={sectionItem} className="md:col-span-2">
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('travelNotes')} />
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, marginTop: -8 }}>
                  {t('travelNotesSub')}
                </p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newNote.trim()) {
                        addTripNote(newNote.trim());
                        setNewNote('');
                        show(t('itemAdded'));
                      }
                    }}
                    placeholder={t('notePlaceholder')}
                    className="input-premium"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      fontSize: 13, background: 'var(--bg)',
                      border: '1px solid var(--border)', outline: 'none',
                      color: 'var(--text)', fontFamily: 'var(--font-sans)',
                    }}
                  />
                  <GlassBtn
                    size="sm" variant="accent"
                    onClick={() => {
                      if (!newNote.trim()) return;
                      addTripNote(newNote.trim());
                      setNewNote('');
                      show(t('itemAdded'));
                    }}
                  >
                    <Icon name="plus" size={13} />
                  </GlassBtn>
                </div>
                {(!trip.tripNotes || trip.tripNotes.length === 0) ? (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', lineHeight: 1.55 }}>
                    {t('noNotes')}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <AnimatePresence>
                      {trip.tripNotes.map((note, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)', padding: '10px 12px',
                          }}
                        >
                          <span style={{ fontSize: 14, marginTop: 1 }}>📝</span>
                          <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{note}</span>
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => { deleteTripNote(i); show(t('itemRemoved')); }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--text-3)', padding: '2px 4px', flexShrink: 0,
                            }}
                          >
                            <Icon name="trash" size={13} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </Glass>
            </motion.div>

            {/* ── Export ── */}
            <motion.div variants={sectionItem}>
              <Glass level={2} style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <SectionLabel label={t('exportTrip')} icon="calExport" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ExportBtn label={t('exportJSON')} sub={t('exportJSONSub')} onClick={handleExportJSON} />
                  <ExportBtn label={t('exportMD')}   sub={t('exportMDSub')}   onClick={handleExportMarkdown} />
                  <ExportBtn label={t('exportPDF')}  sub={t('exportPDFSub')}  onClick={() => show(t('pdfComingSoon'))} disabled />
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

              {/* Leave Trip — permanently removes you from the participant list */}
              <GlassBtn
                variant="danger"
                size="lg"
                style={{ width: '100%' }}
                onClick={() => {
                  const isOwner = trip.participants[0]?.name === nickname;
                  const warning = isOwner
                    ? (locale === 'he'
                        ? 'אתה בעל הטיול. עזיבתך תסיר אותך מרשימת המשתתפים. להמשיך?'
                        : 'You are the trip owner. Leaving will remove you from the participants list. Continue?')
                    : (locale === 'he'
                        ? 'האם אתה בטוח? פעולה זו תסיר אותך מהטיול.'
                        : 'Are you sure? This will remove you from the trip.');
                  confirm(warning, leaveTrip, 'danger');
                }}
              >
                {t('leaveTrip')}
              </GlassBtn>

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
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  fontSize: 13,
  fontWeight: 500,
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
