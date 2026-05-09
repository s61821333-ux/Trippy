'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Chip from '../ui/Chip';
import Icon from '../ui/Icon';
import Sheet from '../ui/Sheet';
import { useAppStore } from '@/lib/store';
import { fmtDate, getGaps, toMins, getDayIcon, getNextEvent, generateInsights, CAT_META, fmtDuration, getTripBudget } from '@/lib/utils';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';

const item = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 360, damping: 32 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

const INSIGHT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  gap:     { bg: 'rgba(240,170,30,0.10)',  border: 'rgba(240,170,30,0.25)',  text: 'oklch(58% 0.18 75)'  },
  balance: { bg: 'rgba(200,100,30,0.10)',  border: 'rgba(200,100,30,0.22)',  text: 'oklch(55% 0.18 50)'  },
  ready:   { bg: 'rgba(40,160,90,0.09)',   border: 'rgba(40,160,90,0.22)',   text: 'oklch(50% 0.15 148)' },
  tip:     { bg: 'rgba(59,126,212,0.09)',  border: 'rgba(59,126,212,0.22)',  text: 'oklch(52% 0.16 225)' },
};

export default function DashboardScreen() {
  const { trip, nickname, setScreen, setActiveDay, logout, supplies } = useAppStore();
  const { show } = useToast();
  const { t } = useI18n();
  const [showShare, setShowShare] = useState(false);
  const [revealCode, setRevealCode] = useState(false);
  if (!trip) return null;

  const packedCount = supplies.filter(s => s.checked).length;
  const totalCount  = supplies.length;
  const pct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const nextEventData = getNextEvent(trip);
  const insights      = generateInsights(trip, packedCount, totalCount);
  const tripBudget    = getTripBudget(trip);

  const handleDayClick = (day: number) => {
    setActiveDay(day);
    setScreen('day');
  };

  return (
    <div className="flex flex-col h-full w-full">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32, delay: 0.04 }}
        className="px-[var(--page-px)] shrink-0"
        style={{ paddingTop: 'var(--page-pt)', paddingBottom: 16 }}
      >
        {/* Trip title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <div style={{ minWidth: 0 }}>
            <p className="eyebrow" style={{ marginBottom: 4 }}>{t('activeTrip')}</p>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text)',
              lineHeight: 1.1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {trip.name}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4, fontWeight: 500 }}>
              {trip.days} {t('days')} · {t('hi')}, {nickname} 👋
            </p>
          </div>

          {/* Avatars + share */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 4 }}>
            <div style={{ display: 'flex' }}>
              {trip.participants.slice(0, 4).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 440, damping: 26 }}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: p.color, color: 'white',
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--bg)',
                    marginLeft: i > 0 ? -8 : 0,
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  {p.initials}
                </motion.div>
              ))}
            </div>
            <GlassBtn
              size="sm"
              onClick={() => setShowShare(true)}
              style={{ minWidth: 0, width: 36, height: 36, padding: 0, borderRadius: 'var(--radius-sm)' }}
            >
              <Icon name="share" size={15} />
            </GlassBtn>
          </div>
        </div>

        {/* Supplies progress strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
          onClick={() => setScreen('supplies')}
          className="premium-hover"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            cursor: 'pointer',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              🎒 {t('suppliesLabel')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
              {packedCount}/{totalCount} · {pct}%
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 3,
                background: pct === 100 ? 'var(--success)' : 'var(--brand)',
              }}
            />
          </div>
        </motion.div>

        {/* Trip budget card — only shown if any event has a cost */}
        {tripBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            style={{
              background: 'var(--success-bg)',
              border: '1px solid rgba(40,160,90,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              marginBottom: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
              💰 {t('tripBudget')}
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--success)' }}>
              ${tripBudget}
            </span>
          </motion.div>
        )}

        {/* Next Event card */}
        {nextEventData && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 340, damping: 32 }}
            onClick={() => { setActiveDay(nextEventData.dayNum); setScreen('day'); }}
            className="premium-hover"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: CAT_META[nextEventData.event.category].bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              {CAT_META[nextEventData.event.category].icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>
                {t('nextEvent')} · {t('day')} {nextEventData.dayNum}
                {trip.startDate ? ` · ${fmtDate(trip.startDate, nextEventData.dayNum - 1)}` : ''}
              </p>
              <p style={{
                fontSize: 14, fontWeight: 700, color: 'var(--text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {nextEventData.event.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, fontWeight: 500 }}>
                {nextEventData.event.time} · {fmtDuration(nextEventData.event.duration)}
              </p>
            </div>
            <Icon name="chevR" size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          </motion.div>
        )}

        {/* AI Trip Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
          >
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Icon name="sparkle" size={10} /> {t('tripInsights')}
            </p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, paddingRight: 'var(--page-px)', scrollbarWidth: 'none' }}>
              {insights.map((ins, i) => {
                const colors = INSIGHT_COLORS[ins.type] ?? INSIGHT_COLORS.tip;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.26 + i * 0.07, type: 'spring', stiffness: 340, damping: 32 }}
                    style={{
                      flexShrink: 0,
                      minWidth: 180, maxWidth: 220,
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 15 }}>{ins.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
                        {ins.title}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.45 }}>
                      {ins.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Day list ── */}
      <div className="flex-1 overflow-y-auto px-[var(--page-px)] pb-8">
        <p className="eyebrow" style={{ marginBottom: 12 }}>{t('days')}</p>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3"
        >
          {Array.from({ length: trip.days }, (_, i) => {
            const dayNum = i + 1;
            const evs    = trip.events[dayNum] ?? [];
            const meta   = trip.dayMeta[i];
            const gaps   = getGaps(evs);
            const sorted = [...evs].sort((a, b) => toMins(a.time) - toMins(b.time));
            const first  = sorted[0]?.time ?? '—';
            const last   = sorted[sorted.length - 1];
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
                  }}
                >
                  {/* Day badge */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    flexShrink: 0,
                    background: 'var(--brand-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>
                    {dayIcon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                        {t('day')} {dayNum}
                      </span>
                      {trip.startDate && (
                        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 400 }}>
                          {fmtDate(trip.startDate, i)}
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: 13, color: 'var(--text-2)', marginBottom: 8,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {meta?.region ?? `Day ${dayNum}`}{meta?.desc ? ` — ${meta.desc}` : ''}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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

      {/* Share sheet */}
      {showShare && (
        <Sheet
          onClose={() => { setShowShare(false); setRevealCode(false); }}
          title={t('shareTrip')}
          subtitle={t('shareSub')}
        >
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('tripName')}
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{trip.name}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('tripCode')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{
                  fontSize: 15, fontWeight: 700, color: 'var(--brand)',
                  letterSpacing: revealCode ? '0.10em' : '0.02em',
                }}>
                  {revealCode ? (trip.code ?? '••••••') : '••••••'}
                </p>
                <button
                  onClick={() => setRevealCode(r => !r)}
                  style={{
                    background: 'var(--brand-light)', border: 'none',
                    borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                    fontSize: 11, fontWeight: 600, color: 'var(--brand)',
                    cursor: 'pointer',
                  }}
                >
                  {revealCode ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <GlassBtn
            variant="accent" size="lg" style={{ width: '100%' }}
            onClick={() => {
              const codeText = trip.code ? `\nCode: ${trip.code}` : '';
              navigator.clipboard?.writeText(`Trip: ${trip.name}${codeText}`);
              show(t('copied'));
              setShowShare(false);
              setRevealCode(false);
            }}
          >
            <Icon name="share" size={15} /> {t('copyToClipboard')}
          </GlassBtn>
          <div style={{ height: 10 }} />
          <GlassBtn
            variant="danger" size="lg" style={{ width: '100%' }}
            onClick={() => { setShowShare(false); setRevealCode(false); logout(); }}
          >
            {t('leaveTrip')}
          </GlassBtn>
        </Sheet>
      )}
    </div>
  );
}
