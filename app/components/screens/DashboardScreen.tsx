'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Chip from '../ui/Chip';
import Icon from '../ui/Icon';
import Sheet from '../ui/Sheet';
import { useAppStore } from '@/lib/store';
import { fmtDate, getGaps, toMins, getDayIcon, getNextEvent, generateInsights, CAT_META, fmtDuration, getTripBudget, estimateCarbonKg } from '@/lib/utils';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';

const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 30 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const INSIGHT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  gap:     { bg: 'rgba(240,170,30,0.10)',  border: 'rgba(240,170,30,0.25)',  text: 'oklch(58% 0.18 75)'  },
  balance: { bg: 'rgba(200,100,30,0.10)',  border: 'rgba(200,100,30,0.22)',  text: 'oklch(55% 0.18 50)'  },
  ready:   { bg: 'rgba(40,160,90,0.09)',   border: 'rgba(40,160,90,0.22)',   text: 'oklch(50% 0.15 148)' },
  tip:     { bg: 'rgba(59,126,212,0.09)',  border: 'rgba(59,126,212,0.22)',  text: 'oklch(52% 0.16 225)' },
  eco:     { bg: 'rgba(30,140,90,0.09)',   border: 'rgba(30,140,90,0.22)',   text: 'oklch(48% 0.16 158)' },
  pacing:  { bg: 'rgba(180,60,200,0.08)',  border: 'rgba(180,60,200,0.20)',  text: 'oklch(50% 0.17 310)' },
  relax:   { bg: 'rgba(40,160,200,0.08)',  border: 'rgba(40,160,200,0.20)',  text: 'oklch(50% 0.14 210)' },
};

export default function DashboardScreen() {
  const {
    trip, nickname, setScreen, setActiveDay, logout, supplies,
    hideBudget, showCarbonBudget, dayEndHour,
    addExpense, deleteExpense, inviteToTrip,
  } = useAppStore();
  const { show } = useToast();
  const { t } = useI18n();
  const [showShare, setShowShare]       = useState(false);
  const [inviteEmail, setInviteEmail]   = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [expDesc, setExpDesc]           = useState('');
  const [expAmount, setExpAmount]       = useState('');
  const [expPaidBy, setExpPaidBy]       = useState('');
  const [expSplit, setExpSplit]         = useState('2');

  if (!trip) return null;

  const packedCount = supplies.filter(s => s.checked).length;
  const totalCount  = supplies.length;
  const pct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const nextEventData = getNextEvent(trip);
  const insights      = generateInsights(trip, packedCount, totalCount, t);
  const tripBudget    = getTripBudget(trip);
  const carbonKg      = estimateCarbonKg(trip);
  const dayEndMins    = dayEndHour * 60;

  const handleDayClick = (day: number) => {
    setActiveDay(day);
    setScreen('day');
  };

  const handleAddExpense = () => {
    const amount = parseFloat(expAmount);
    const split  = parseInt(expSplit, 10) || 1;
    if (!expDesc.trim() || isNaN(amount) || amount <= 0) { show(t('enterDescAmount')); return; }
    addExpense({ description: expDesc.trim(), amount, paidBy: expPaidBy.trim() || nickname, splitCount: split });
    setExpDesc(''); setExpAmount(''); setExpPaidBy('');
    show(t('expenseAdded'));
  };

  const expenses      = trip.expenses ?? [];
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div
      className="h-full w-full overflow-y-auto"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-strong) transparent' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ paddingBottom: 48 }}
      >

        {/* ═══ Hero ═══ */}
        <div style={{
          position: 'relative',
          paddingTop: 'var(--page-pt)',
          paddingBottom: 24,
          paddingLeft: 'var(--page-px)',
          paddingRight: 'var(--page-px)',
          marginBottom: 4,
        }}>

          {/* Eyebrow + avatars + share */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04, type: 'spring', stiffness: 360, damping: 32 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}
          >
            <p className="eyebrow">{t('activeTrip')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex' }}>
                {trip.participants.slice(0, 4).map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 440, damping: 26 }}
                    style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: p.color, color: 'white',
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2.5px solid var(--bg)',
                      marginLeft: i > 0 ? -9 : 0,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {p.initials}
                  </motion.div>
                ))}
              </div>
              <GlassBtn
                size="sm"
                onClick={() => setShowShare(true)}
                style={{ width: 34, height: 34, padding: 0, borderRadius: 'var(--radius-sm)', minWidth: 0 }}
              >
                <Icon name="share" size={14} />
              </GlassBtn>
            </div>
          </motion.div>

          {/* Title + subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 340, damping: 30 }}
            style={{ marginBottom: 18 }}
          >
            <h1 style={{
              fontSize: 'clamp(1.7rem, 5.5vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              lineHeight: 1.05,
              marginBottom: 5,
            }}>
              {trip.name}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>
              {trip.days} {t('days')} · {t('hi')}, {nickname} 👋
            </p>
          </motion.div>

          {/* Supplies progress */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            onClick={() => setScreen('supplies')}
            className="premium-hover"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🎒 {t('suppliesLabel')}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? 'var(--success)' : 'var(--text-3)' }}>
                {packedCount}/{totalCount} · {pct}%
              </span>
            </div>
            <div style={{ height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.45, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: '100%', borderRadius: 4,
                  background: pct === 100
                    ? 'var(--success)'
                    : 'linear-gradient(90deg, var(--brand), var(--brand-hover))',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* ═══ Body ═══ */}
        <div style={{ padding: '16px var(--page-px) 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Budget + Carbon chips */}
          {((tripBudget > 0 && !hideBudget) || (showCarbonBudget && carbonKg > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              style={{ display: 'flex', gap: 8 }}
            >
              {tripBudget > 0 && !hideBudget && (
                <div style={{
                  flex: 1,
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(40,160,90,0.22)',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    💰 {t('tripBudget')}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--success)' }}>${tripBudget}</span>
                </div>
              )}
              {showCarbonBudget && carbonKg > 0 && (
                <div style={{
                  flex: 1,
                  background: 'rgba(30,140,90,0.08)',
                  border: '1px solid rgba(30,140,90,0.22)',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'oklch(48% 0.16 158)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    🌍 CO₂
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'oklch(48% 0.16 158)' }}>~{carbonKg}kg</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <motion.div
              onClick={() => setShowExpenses(v => !v)}
              className="premium-hover"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: showExpenses ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                padding: '11px 16px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🧾 {t('expenses')}
                {expenses.length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>({expenses.length})</span>
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {totalExpenses > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)' }}>
                    ${totalExpenses.toFixed(2)}
                  </span>
                )}
                <Icon
                  name={showExpenses ? 'chevL' : 'chevR'}
                  size={13}
                  style={{ color: 'var(--text-3)', transform: showExpenses ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {showExpenses && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-xs)',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          value={expDesc}
                          onChange={e => setExpDesc(e.target.value)}
                          placeholder={t('whatFor')}
                          className="input-premium"
                          style={{
                            flex: 3, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                            fontSize: 12, background: 'var(--bg)',
                            border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                          }}
                        />
                        <input
                          value={expAmount}
                          onChange={e => setExpAmount(e.target.value)}
                          placeholder="$0"
                          type="number"
                          min="0"
                          className="input-premium"
                          style={{
                            flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                            fontSize: 12, background: 'var(--bg)',
                            border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          value={expPaidBy}
                          onChange={e => setExpPaidBy(e.target.value)}
                          placeholder={t('paidByDefault').replace('{name}', nickname)}
                          className="input-premium"
                          style={{
                            flex: 3, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                            fontSize: 12, background: 'var(--bg)',
                            border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                          }}
                        />
                        <select
                          value={expSplit}
                          onChange={e => setExpSplit(e.target.value)}
                          style={{
                            flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                            fontSize: 12, background: 'var(--bg)',
                            border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                          }}
                        >
                          {[1,2,3,4,5,6,7,8].map(n => {
                            let label = `÷${n}`;
                            if (n === 1) label = t('onePerson');
                            else if (n === trip.participants.length) label = t('everyone');
                            else label = `${n} ${t('people')}`;
                            return <option key={n} value={n}>{label}</option>;
                          })}
                        </select>
                        <GlassBtn size="sm" variant="accent" onClick={handleAddExpense} style={{ flexShrink: 0 }}>
                          <Icon name="plus" size={12} />
                        </GlassBtn>
                      </div>
                    </div>

                    {expenses.length === 0 ? (
                      <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>{t('noExpensesYet')}</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {expenses.map(exp => (
                          <div key={exp.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                            background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)', padding: '8px 10px',
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {exp.description}
                              </p>
                              <p style={{ fontSize: 10, color: 'var(--text-3)' }}>
                                {exp.paidBy} {t('paid')} · ÷{exp.splitCount} = ${(exp.amount / exp.splitCount).toFixed(2)}/{t('person')}
                              </p>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>
                              ${exp.amount.toFixed(2)}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => deleteExpense(exp.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, flexShrink: 0 }}
                            >
                              <Icon name="x" size={12} />
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Next Event */}
          {nextEventData && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.21, type: 'spring', stiffness: 340, damping: 32 }}
              onClick={() => { setActiveDay(nextEventData.dayNum); setScreen('day'); }}
              className="premium-hover"
              style={{
                background: CAT_META[nextEventData.event.category].bg,
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'rgba(255,255,255,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {CAT_META[nextEventData.event.category].icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {t('nextEvent')} · {t('day')} {nextEventData.dayNum}
                  {trip.startDate ? ` · ${fmtDate(trip.startDate, nextEventData.dayNum - 1)}` : ''}
                </p>
                <p style={{
                  fontSize: 15, fontWeight: 700, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {t(nextEventData.event.name)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1, fontWeight: 500 }}>
                  {nextEventData.event.time} · {fmtDuration(nextEventData.event.duration)}
                </p>
              </div>
              <Icon name="chevR" size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </motion.div>
          )}

          {/* Insights horizontal scroll */}
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <p style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Icon name="sparkle" size={10} /> {t('tripInsights')}
              </p>
              <div style={{
                display: 'flex', gap: 8,
                overflowX: 'auto', paddingBottom: 4,
                marginLeft: `calc(-1 * var(--page-px))`,
                marginRight: `calc(-1 * var(--page-px))`,
                paddingLeft: 'var(--page-px)',
                paddingRight: 'var(--page-px)',
                scrollbarWidth: 'none',
              }}>
                {insights.map((ins, i) => {
                  const colors = INSIGHT_COLORS[ins.type] ?? INSIGHT_COLORS.tip;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.29 + i * 0.07, type: 'spring', stiffness: 340, damping: 32 }}
                      style={{
                        flexShrink: 0,
                        minWidth: 172, maxWidth: 210,
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '11px 13px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <span style={{ fontSize: 16 }}>{ins.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, lineHeight: 1.2 }}>
                          {ins.title}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                        {ins.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Days ── */}
          <div style={{ marginTop: 6 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>{t('days')}</p>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4"
            >
              {Array.from({ length: trip.days }, (_, i) => {
                const dayNum  = i + 1;
                const evs     = trip.events[dayNum] ?? [];
                const meta    = trip.dayMeta[i];
                const gaps    = getGaps(evs, dayEndMins);
                const sorted  = [...evs].sort((a, b) => toMins(a.time) - toMins(b.time));
                const first   = sorted[0]?.time ?? '—';
                const last    = sorted[sorted.length - 1];
                const lastEnd = last
                  ? `${Math.floor((toMins(last.time) + last.duration) / 60).toString().padStart(2, '0')}:${String((toMins(last.time) + last.duration) % 60).padStart(2, '0')}`
                  : '—';
                const dayIcon = getDayIcon(evs, meta?.emoji ?? '🏔️');

                return (
                  <motion.div key={dayNum} variants={item}>
                    <div
                      onClick={() => handleDayClick(dayNum)}
                      className="premium-hover"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        boxShadow: 'var(--shadow-xs)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Left accent line */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: 3,
                        background: 'linear-gradient(180deg, var(--brand) 0%, var(--brand-hover) 100%)',
                        opacity: 0.4,
                        borderRadius: '4px 0 0 4px',
                      }} />

                      {/* Icon with day badge */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14,
                          background: 'var(--brand-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 26,
                        }}>
                          {dayIcon}
                        </div>
                        <div style={{
                          position: 'absolute', bottom: -2, right: -2,
                          background: 'var(--brand)', color: 'white',
                          fontSize: 8, fontWeight: 800,
                          width: 16, height: 16, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1.5px solid var(--surface)',
                        }}>
                          {dayNum}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                            {t('day')} {dayNum}
                          </span>
                          {trip.startDate && (
                            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
                              {fmtDate(trip.startDate, i)}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: 13, color: 'var(--text-2)', marginBottom: 9,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {t(meta?.region ?? `Day ${dayNum}`)}{meta?.desc ? ` — ${t(meta.desc)}` : ''}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <Chip v="neutral" style={{ fontSize: 10 }}>
                            {evs.length} {t('events')}
                          </Chip>
                          {evs.length > 0 && (
                            <Chip v="neutral" style={{ fontSize: 10 }}>
                              {first} – {lastEnd}
                            </Chip>
                          )}
                          {gaps.length > 0 && (
                            <Chip v="gap" style={{ fontSize: 10 }}>
                              ⚡ {gaps.length} {gaps.length > 1 ? t('gapsPlural') : t('gaps')}
                            </Chip>
                          )}
                        </div>
                      </div>

                      <Icon name="chevR" size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

        </div>
      </motion.div>

      {/* ── Share Sheet ── */}
      {showShare && (
        <Sheet
          onClose={() => { setShowShare(false); setInviteEmail(''); }}
          title={t('shareTrip')}
          subtitle={t('shareSub')}
        >
          {/* Trip name badge */}
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 18,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('tripName')}
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{trip.name}</p>
          </div>

          {/* Invite by email */}
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
            {t('inviteByEmail')}
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={async e => {
                if (e.key === 'Enter' && inviteEmail.trim()) {
                  setInviteSending(true);
                  try { await inviteToTrip(inviteEmail); show(t('inviteSent')); setInviteEmail(''); }
                  catch { show(t('inviteFailed')); }
                  setInviteSending(false);
                }
              }}
              placeholder={t('inviteEmailPlaceholder')}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 500, background: 'var(--bg)', color: 'var(--text)',
                border: '1px solid var(--border)', outline: 'none',
              }}
            />
            <GlassBtn
              variant="accent"
              onClick={async () => {
                if (!inviteEmail.trim()) return;
                setInviteSending(true);
                try { await inviteToTrip(inviteEmail); show(t('inviteSent')); setInviteEmail(''); }
                catch { show(t('inviteFailed')); }
                setInviteSending(false);
              }}
              disabled={inviteSending || !inviteEmail.trim()}
              style={{ padding: '10px 16px', flexShrink: 0 }}
            >
              {inviteSending ? '…' : t('sendInvite')}
            </GlassBtn>
          </div>

          <GlassBtn
            variant="danger" size="lg" style={{ width: '100%' }}
            onClick={() => { setShowShare(false); setInviteEmail(''); logout(); }}
          >
            {t('leaveTrip')}
          </GlassBtn>
        </Sheet>
      )}
    </div>
  );
}
