'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate as motionAnimate } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Chip from '../ui/Chip';
import Icon from '../ui/Icon';
import Sheet from '../ui/Sheet';
import { StampIcon } from '../ui/StampIcon';
import { useAppStore } from '@/lib/store';
import { dbGetTripEmailInvitations, dbCancelInvitation } from '@/lib/db';
import { fmtDate, getGaps, toMins, getDayIcon, getNextEvent, generateInsights, CAT_META, fmtDuration, getTripBudget, estimateCarbonKg } from '@/lib/utils';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';
import { getCurrencySymbol, getCountryCurrency, getExchangeRates } from '@/lib/currency';
import { fetchWeatherForTrip, getWeatherUrl, WeatherDay } from '@/lib/weather';
import { getCapitalCoords } from '@/lib/capitals';
import AsyncError from '../ui/AsyncError';

function fmtAmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

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
  gap:     { bg: 'var(--insight-gap-bg)',     border: 'var(--insight-gap-border)',     text: 'var(--insight-gap-text)'     },
  balance: { bg: 'var(--insight-balance-bg)', border: 'var(--insight-balance-border)', text: 'var(--insight-balance-text)' },
  ready:   { bg: 'var(--insight-ready-bg)',   border: 'var(--insight-ready-border)',   text: 'var(--insight-ready-text)'   },
  tip:     { bg: 'var(--insight-tip-bg)',     border: 'var(--insight-tip-border)',     text: 'var(--insight-tip-text)'     },
  eco:     { bg: 'var(--insight-eco-bg)',     border: 'var(--insight-eco-border)',     text: 'var(--insight-eco-text)'     },
  pacing:  { bg: 'var(--insight-pacing-bg)',  border: 'var(--insight-pacing-border)',  text: 'var(--insight-pacing-text)'  },
  relax:   { bg: 'var(--insight-relax-bg)',   border: 'var(--insight-relax-border)',   text: 'var(--insight-relax-text)'   },
};

export default function DashboardScreen() {
  const {
    trip, nickname, tripDbId, setScreen, setActiveDay, logout, leaveTrip, supplies,
    hideBudget, showCarbonBudget, dayEndHour,
    addExpense, deleteExpense, inviteToTrip,
    currencyByTrip,
  } = useAppStore();
  const { show } = useToast();
  const { t, locale } = useI18n();
  const [showShare, setShowShare]       = useState(false);
  const [inviteEmail, setInviteEmail]   = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [pendingEmails, setPendingEmails] = useState<{ id: string; email: string; status: string; created_at?: string }[]>([]);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSuccessId, setResendSuccessId] = useState<string | null>(null);
  const MAX_INVITES = 4;

  // Currency
  const currency = (tripDbId && currencyByTrip[tripDbId]) || 'USD';
  const currSym  = getCurrencySymbol(currency);
  const [localRate, setLocalRate]       = useState<number | null>(null);
  const [localCurrency, setLocalCurrency] = useState<string>('');

  // Weather
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherRetry, setWeatherRetry] = useState(0);

  useEffect(() => {
    if (!trip) return;
    const isDefaultIsrael = (lat: number, lng: number) =>
      Math.abs(lat - 31) < 3 && Math.abs(lng - 35) < 3;

    let lat: number | undefined, lng: number | undefined;

    // Try dayMeta coords (skip Israel-default)
    for (const meta of trip.dayMeta ?? []) {
      if (meta.lat && meta.lng && !isDefaultIsrael(meta.lat, meta.lng)) {
        lat = meta.lat; lng = meta.lng; break;
      }
    }

    // Try events with coords
    if (!lat) {
      outer: for (let d = 1; d <= trip.days; d++) {
        for (const ev of trip.events[d] ?? []) {
          if (ev.lat && ev.lng && !isDefaultIsrael(ev.lat, ev.lng)) {
            lat = ev.lat; lng = ev.lng; break outer;
          }
        }
      }
    }

    // Fall back to destination country capital
    if (!lat && trip.countries?.length) {
      const capital = getCapitalCoords(trip.countries[0]);
      if (capital) { lat = capital.lat; lng = capital.lng; }
    }

    if (!lat || !lng) return;
    setWeatherLoading(true);
    setWeatherError(null);
    fetchWeatherForTrip(lat, lng, trip.startDate, trip.days)
      .then(data => { setWeather(data); setWeatherLoading(false); })
      .catch(() => { setWeatherError("Couldn't load weather"); setWeatherLoading(false); });
  }, [trip?.startDate, trip?.days, JSON.stringify(trip?.dayMeta?.map(m => [m.lat, m.lng])), trip?.countries?.join(','), weatherRetry]);

  // Exchange rates
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateRetry, setRateRetry] = useState(0);

  useEffect(() => {
    if (!trip) { setLocalRate(null); setLocalCurrency(''); return; }

    if (currency === 'ILS') {
      // Trip budget is in ILS → show destination local currency equivalent
      const firstCountry = trip.countries?.[0];
      const localC = firstCountry ? getCountryCurrency(firstCountry) : 'USD';
      if (localC === 'ILS') { setLocalRate(null); setLocalCurrency(''); return; }
      setLocalCurrency(localC);
      setRateLoading(true);
      setRateError(null);
      getExchangeRates('ILS').then(rates => {
        setLocalRate(rates[localC] ?? null);
        setRateLoading(false);
      }).catch(() => { setRateError("Couldn't load exchange rates"); setRateLoading(false); });
    } else {
      // Trip budget is in foreign currency → show ILS equivalent
      setLocalCurrency('ILS');
      setRateLoading(true);
      setRateError(null);
      getExchangeRates(currency).then(rates => {
        setLocalRate(rates['ILS'] ?? null);
        setRateLoading(false);
      }).catch(() => { setRateError("Couldn't load exchange rates"); setRateLoading(false); });
    }
  }, [currency, trip?.countries?.join(','), rateRetry]);


  useEffect(() => {
    if (!showShare || !tripDbId) return;
    dbGetTripEmailInvitations(tripDbId)
      .then(invites => setPendingEmails(invites))
      .catch(() => {});
  }, [showShare, tripDbId]);
  const [showExpenses, setShowExpenses] = useState(false);
  const [expDesc, setExpDesc]           = useState('');
  const [expAmount, setExpAmount]       = useState('');
  const [expPaidBy, setExpPaidBy]       = useState('');
  const [expSplit, setExpSplit]         = useState(() => String(trip?.participants?.length ?? 2));

  if (!trip) return null;

  const packedCount = supplies.filter(s => s.checked).length;
  const totalCount  = supplies.length;
  const pct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const nextEventData = getNextEvent(trip);
  const insights      = generateInsights(trip, packedCount, totalCount, t);
  const tripBudget    = getTripBudget(trip);
  const carbonKg      = estimateCarbonKg(trip);
  const dayEndMins    = dayEndHour * 60;

  const totalEvents = Object.values(trip.events).reduce((s, evs) => s + evs.length, 0);

  // Trip countdown
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDate = trip.startDate ? new Date(trip.startDate + 'T00:00:00') : null;
  const endDate = startDate ? new Date(startDate.getTime() + (trip.days - 1) * 86400000) : null;
  const daysUntil = startDate ? Math.round((startDate.getTime() - today.getTime()) / 86400000) : null;
  const currentTripDay = (startDate && endDate && today >= startDate && today <= endDate)
    ? Math.round((today.getTime() - startDate.getTime()) / 86400000) + 1
    : null;

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

  const displayedTotal = useMotionValue(totalExpenses);
  const roundedTotal   = useTransform(displayedTotal, v => fmtAmt(Math.round(v)));

  useEffect(() => {
    const controls = motionAnimate(displayedTotal, totalExpenses, { duration: 0.4, ease: 'easeOut' });
    return controls.stop;
  }, [totalExpenses]);

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
          overflow: 'hidden',
        }}>
          {/* Decorative gradient blob */}
          <div style={{
            position: 'absolute', top: -40, right: -60,
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, var(--terra-muted) 0%, transparent 70%)',
            opacity: 0.55, pointerEvents: 'none', zIndex: 0,
          }} />

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
              <span data-tour="share-btn" style={{ display: 'inline-flex' }}>
                <GlassBtn
                  size="sm"
                  onClick={() => setShowShare(true)}
                  style={{ width: 44, height: 44, padding: 0, borderRadius: 'var(--radius-sm)', minWidth: 0 }}
                >
                  <Icon name="share" size={14} />
                </GlassBtn>
              </span>
            </div>
          </motion.div>

          {/* Title + subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 340, damping: 30 }}
            style={{ marginBottom: 18, position: 'relative', zIndex: 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 'clamp(1.7rem, 5.5vw, 2.8rem)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: 'var(--text)',
                lineHeight: 1.0,
              }}>
                {trip.name}
              </h1>
              {currentTripDay !== null && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 440, damping: 24 }}
                  style={{
                    fontSize: 11, fontWeight: 800,
                    background: 'var(--terra)', color: 'white',
                    borderRadius: 20, padding: '3px 10px',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    flexShrink: 0,
                  }}
                >
                  {t('day')} {currentTripDay}
                </motion.span>
              )}
              {daysUntil !== null && daysUntil > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 440, damping: 24 }}
                  style={{
                    fontSize: 11, fontWeight: 800,
                    background: 'var(--terra)', color: 'white',
                    borderRadius: 20, padding: '3px 10px',
                    letterSpacing: '0.06em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    flexShrink: 0,
                  }}
                >
                  🗓 {daysUntil}d
                </motion.span>
              )}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {trip.days} {t('days')}
              {totalEvents > 0 && <span style={{ color: 'var(--text-3)' }}>· {totalEvents} events</span>}
              <span>· {t('hi')}, {nickname} 👋</span>
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
                    : 'linear-gradient(90deg, var(--terra), #b85f3a)',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* ═══ Body ═══ */}
        <div style={{ padding: '16px var(--page-px) 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* ═══ Next Event ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, type: 'spring', stiffness: 340, damping: 32 }}
          >
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12, fontWeight: 500, color: 'var(--terra)',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {t('nextEvent')}
            </p>
            {nextEventData ? (() => {
              const nextWeather = weather[nextEventData.dayNum - 1] ?? null;
              const weatherLocation = nextEventData.event.location
                ?? trip.dayMeta?.[nextEventData.dayNum - 1]?.region
                ?? trip.name;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div
                    onClick={() => { setActiveDay(nextEventData.dayNum); setScreen('day'); }}
                    className="premium-hover"
                    style={{
                      background: CAT_META[nextEventData.event.category].bg,
                      border: '1.5px solid rgba(0,0,0,0.07)',
                      borderRadius: nextWeather ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                      background: 'var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.60), 0 2px 10px rgba(0,0,0,0.10)',
                      border: '1px solid var(--border)',
                    }}>
                      {CAT_META[nextEventData.event.category].icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 3 }}>
                        {t('day')} {nextEventData.dayNum}
                        {trip.startDate ? ` · ${fmtDate(trip.startDate, nextEventData.dayNum - 1, locale)}` : ''}
                      </p>
                      <p style={{
                        fontSize: 16, fontWeight: 800, color: 'var(--text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2,
                      }}>
                        {t(nextEventData.event.name)}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        🕐 {nextEventData.event.time} · {fmtDuration(nextEventData.event.duration)}
                        {nextEventData.event.location && (
                          <span style={{ color: 'var(--text-3)' }}>· 📍 {nextEventData.event.location}</span>
                        )}
                      </p>
                    </div>
                    {nextWeather && (
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: 'var(--surface)', borderRadius: 12,
                        padding: '6px 10px', gap: 1, flexShrink: 0,
                        border: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{nextWeather.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
                          {nextWeather.tempMax}°
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>
                          {nextWeather.tempMin}°
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', textAlign: 'center', maxWidth: 52, lineHeight: 1.2, marginTop: 1 }}>
                          {nextWeather.label}
                        </span>
                      </div>
                    )}
                    <Icon name="chevR" size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  </div>

                  {/* Weather footer strip for next event location */}
                  {nextWeather && (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(weatherLocation + ' weather forecast')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        background: 'rgba(0,0,0,0.04)',
                        border: '1.5px solid rgba(0,0,0,0.07)',
                        borderTop: 'none',
                        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                        textDecoration: 'none',
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        🌍 {weatherLocation}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {nextWeather.icon} {nextWeather.label} · {nextWeather.tempMax}°/{nextWeather.tempMin}°C
                        <Icon name="chevR" size={10} style={{ color: 'var(--text-3)' }} />
                      </span>
                    </a>
                  )}
                </div>
              );
            })() : (
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
                style={{
                  background: 'var(--surface)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}
              >
                <div style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--terra-muted)', border: '1.5px solid rgba(196,113,74,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="compass" size={36} style={{ color: 'var(--terra)' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', textAlign: 'center', margin: 0 }}>
                  Add events to start planning
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', margin: 0 }}>
                  Head to the Explore tab to add your first event
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setScreen('day')}
                  style={{
                    marginTop: 4,
                    background: 'var(--terra)', color: 'white', border: 'none',
                    borderRadius: 'var(--radius-md)', padding: '10px 22px',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Plan Day 1
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* ═══ Weather Forecast Strip ═══ */}
          {(weatherLoading || weatherError || weather.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.20 }}
            >
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12, fontWeight: 500, color: 'var(--terra)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                {t('forecast') || 'Forecast'}
              </p>
              {weatherLoading ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="skeleton" style={{ flexShrink: 0, width: 58, height: 88, borderRadius: 'var(--radius-md)' }} />
                  ))}
                </div>
              ) : weatherError ? (
                <AsyncError message="Couldn't load weather" onRetry={() => setWeatherRetry(c => c + 1)} compact />
              ) : (
                <div style={{
                  display: 'flex', gap: 6,
                  overflowX: 'auto',
                  marginLeft: `calc(-1 * var(--page-px))`,
                  marginRight: `calc(-1 * var(--page-px))`,
                  paddingLeft: 'var(--page-px)',
                  paddingRight: 'var(--page-px)',
                  paddingBottom: 4,
                  scrollbarWidth: 'none',
                }}>
                  {weather.slice(0, 7).map((w, i) => {
                    const dayNum = i + 1;
                    const dateLabel = trip.startDate ? fmtDate(trip.startDate, i, locale) : `${t('day')} ${dayNum}`;
                    const isNextEventDay = nextEventData?.dayNum === dayNum;
                    return (
                      <motion.a
                        key={i}
                        href={`https://www.google.com/search?q=${encodeURIComponent((trip.dayMeta?.[i]?.region ?? trip.name) + ' weather')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.22 + i * 0.05, type: 'spring', stiffness: 340, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          flexShrink: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: isNextEventDay ? 'var(--terra-muted)' : 'var(--surface)',
                          border: `1px solid ${isNextEventDay ? 'var(--terra)' : 'var(--border)'}`,
                          minWidth: 58,
                          textDecoration: 'none',
                          cursor: 'pointer',
                          boxShadow: isNextEventDay ? '0 0 0 2px var(--terra-muted)' : 'none',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: isNextEventDay ? 'var(--terra)' : 'var(--text-3)', letterSpacing: '0.02em' }}>
                          {dateLabel.split(' ').slice(0, 2).join(' ')}
                        </span>
                        <span style={{ fontSize: 20, lineHeight: 1 }}>{w.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{w.tempMax}°</span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{w.tempMin}°</span>
                      </motion.a>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

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
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--success)' }}>{currSym}{fmtAmt(tripBudget, 0)}</span>
                    {rateLoading ? (
                      <div className="skeleton" style={{ width: 72, height: 12, borderRadius: 4, marginTop: 3 }} />
                    ) : rateError ? (
                      <button onClick={() => setRateRetry(c => c + 1)} style={{ fontSize: 9, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block', marginTop: 2 }}>⚠ retry</button>
                    ) : localRate && localCurrency ? (
                      <div style={{ fontSize: 10, color: 'var(--success)', opacity: 0.7, fontWeight: 500 }}>
                        ≈{getCurrencySymbol(localCurrency)}{fmtAmt(Math.round(tripBudget * localRate), 0)} {t('localEquiv')}
                      </div>
                    ) : null}
                  </div>
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
                    {currSym}<motion.span>{roundedTotal}</motion.span>
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
                            flex: 3, minWidth: 0, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                            fontSize: 14, background: 'var(--bg)',
                            border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                          }}
                        />
                        <input
                          value={expAmount}
                          onChange={e => setExpAmount(e.target.value)}
                          placeholder={`${currSym}0`}
                          type="number"
                          min="0"
                          className="input-premium"
                          style={{
                            flex: 1, minWidth: 0, padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                            fontSize: 14, background: 'var(--bg)',
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
                            flex: 3, minWidth: 0, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                            fontSize: 14, background: 'var(--bg)',
                            border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                          }}
                        />
                        <select
                          value={expSplit}
                          onChange={e => setExpSplit(e.target.value)}
                          style={{
                            flex: 1, minWidth: 0, padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                            fontSize: 14, background: 'var(--bg)',
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 0 8px' }}>
                        <motion.span
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ fontSize: 40, lineHeight: 1 }}
                        >
                          🪙
                        </motion.span>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', margin: 0 }}>No expenses logged</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, textAlign: 'center' }}>Add your first expense above</p>
                      </div>
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
                                {exp.paidBy} {t('paid')} · ÷{exp.splitCount} = {currSym}{fmtAmt(exp.amount / exp.splitCount)}/{t('person')}
                              </p>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>
                              {currSym}{fmtAmt(exp.amount)}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => deleteExpense(exp.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', flexShrink: 0, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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


          {/* Insights horizontal scroll */}
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12, fontWeight: 500, color: 'var(--terra)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {t('tripInsights')}
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
              data-tour="day-cards"
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
                const dayIcon = getDayIcon(evs, meta?.emoji ?? 'mountain');
                const dayWeather = weather[i] ?? null;
                const longestEv = evs.length ? [...evs].sort((a, b) => b.duration - a.duration)[0] : null;
                const weatherLocation = longestEv?.location ?? meta?.region ?? '';
                const isToday = currentTripDay === dayNum;
                const isNextEventDayCard = nextEventData?.dayNum === dayNum;

                return (
                  <motion.div key={dayNum} variants={item}>
                    <div
                      onClick={() => handleDayClick(dayNum)}
                      className="premium-hover"
                      style={{
                        background: isToday ? 'var(--terra-muted)' : 'var(--surface)',
                        border: `1px solid ${isToday ? 'var(--terra)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        boxShadow: isToday ? '0 0 0 3px var(--terra-muted)' : 'var(--shadow-xs)',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      {/* Left accent line */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: 3,
                        background: isToday
                          ? 'linear-gradient(180deg, var(--terra) 0%, #b85f3a 100%)'
                          : 'linear-gradient(180deg, var(--terra) 0%, var(--terra) 100%)',
                        opacity: isToday ? 0.9 : 0.35,
                        borderRadius: '4px 0 0 4px',
                      }} />

                      {/* Icon with day badge */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 18,
                          background: isToday
                            ? 'linear-gradient(150deg, #d4845a 0%, var(--terra) 100%)'
                            : 'linear-gradient(150deg, var(--surface) 0%, var(--terra-muted) 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 26,
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: isToday
                            ? '0 4px 16px rgba(196,113,74,0.32), inset 0 1px 0 rgba(255,255,255,0.25)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 4px rgba(0,0,0,0.07)',
                          border: isToday ? 'none' : '1px solid var(--border)',
                        }}>
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)',
                            pointerEvents: 'none',
                          }} />
                          <StampIcon iconKey={dayIcon} size={32} style={{ position: 'relative', zIndex: 1 }} />
                        </div>
                        <div style={{
                          position: 'absolute', bottom: -3, right: -3,
                          background: 'var(--terra)', color: 'white',
                          fontSize: 10, fontWeight: 800,
                          width: 22, height: 22, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--surface)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
                        }}>
                          {dayNum}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                            {t('day')} {dayNum}
                          </span>
                          {trip.startDate && (
                            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
                              {fmtDate(trip.startDate, i, locale)}
                            </span>
                          )}
                          {isToday && (
                            <span style={{
                              fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                              background: 'var(--terra)', color: 'white',
                              borderRadius: 10, padding: '2px 7px', textTransform: 'uppercase',
                            }}>
                              Today
                            </span>
                          )}
                          {!isToday && isNextEventDayCard && (
                            <span style={{
                              fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                              background: 'var(--terra)', color: 'white',
                              borderRadius: 10, padding: '2px 7px', textTransform: 'uppercase',
                            }}>
                              Up Next
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

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        {dayWeather && (
                          <a
                            href={getWeatherUrl(weatherLocation || trip.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            title={`${dayWeather.label} · ${dayWeather.tempMax}°/${dayWeather.tempMin}°C`}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center',
                              fontSize: 18, lineHeight: 1, textDecoration: 'none',
                              background: isToday ? 'rgba(255,255,255,0.6)' : 'var(--terra-muted)',
                              borderRadius: 8, padding: '4px 6px', gap: 1,
                              border: isToday ? '1px solid rgba(255,255,255,0.8)' : 'none',
                              minWidth: 44,
                            }}
                          >
                            <span>{dayWeather.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                              {dayWeather.tempMax}°
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                              {dayWeather.tempMin}°
                            </span>
                          </a>
                        )}
                        <Icon name="chevR" size={15} style={{ color: 'var(--text-3)' }} />
                      </div>
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
          onClose={() => { setShowShare(false); setInviteEmail(''); setPendingEmails([]); }}
          title={t('shareTrip')}
          subtitle={t('shareSub')}
        >
          {/* Trip name + current team */}
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('tripName')}
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{trip.name}</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {trip.participants.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 20,
                  background: p.color, opacity: 0.92,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{p.initials}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invite by email — max 4 pending */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              {t('inviteByEmail')}
            </p>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: pendingEmails.length >= MAX_INVITES ? 'var(--danger)' : 'var(--text-3)',
              transition: 'color 0.2s',
            }}>
              {pendingEmails.length}/{MAX_INVITES}
            </span>
          </div>

          {/* Email input — always visible, disabled at limit */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="email"
                value={inviteEmail}
                disabled={pendingEmails.length >= MAX_INVITES}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={async e => {
                  if (e.key === 'Enter' && inviteEmail.trim() && pendingEmails.length < MAX_INVITES) {
                    setInviteSending(true);
                    try {
                      await inviteToTrip(inviteEmail);
                      show(t('inviteSent'));
                      setInviteEmail('');
                      if (tripDbId) dbGetTripEmailInvitations(tripDbId).then(setPendingEmails).catch(() => {});
                    } catch { show(t('inviteFailed')); }
                    setInviteSending(false);
                  }
                }}
                placeholder={pendingEmails.length >= MAX_INVITES ? 'Cancel a pending invite to free up a slot' : t('inviteEmailPlaceholder')}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  fontSize: 14, fontWeight: 500,
                  background: pendingEmails.length >= MAX_INVITES ? 'var(--bg-alt)' : 'var(--bg)',
                  color: pendingEmails.length >= MAX_INVITES ? 'var(--text-3)' : 'var(--text)',
                  border: `1px solid ${pendingEmails.length >= MAX_INVITES ? 'var(--danger)' : 'var(--border)'}`,
                  outline: 'none', boxSizing: 'border-box' as const,
                  opacity: pendingEmails.length >= MAX_INVITES ? 0.6 : 1,
                  transition: 'border-color 0.2s, opacity 0.2s',
                }}
              />
            </div>
            <GlassBtn
              variant="accent"
              onClick={async () => {
                if (!inviteEmail.trim() || pendingEmails.length >= MAX_INVITES) return;
                setInviteSending(true);
                try {
                  await inviteToTrip(inviteEmail);
                  show(t('inviteSent'));
                  setInviteEmail('');
                  if (tripDbId) dbGetTripEmailInvitations(tripDbId).then(setPendingEmails).catch(() => {});
                } catch { show(t('inviteFailed')); }
                setInviteSending(false);
              }}
              disabled={inviteSending || !inviteEmail.trim() || pendingEmails.length >= MAX_INVITES}
              style={{ padding: '10px 16px', flexShrink: 0 }}
            >
              {inviteSending ? '…' : t('sendInvite')}
            </GlassBtn>
          </div>

          {/* Pending invite list */}
          <div style={{ marginBottom: 16, marginTop: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              Pending invites
            </p>
            {pendingEmails.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>No pending invites.</p>
            ) : (
              pendingEmails.map((inv) => {
                const isConfirming = cancelConfirmId === inv.id;
                const isResending = resendingId === inv.id;
                const didResend = resendSuccessId === inv.id;

                // Relative timestamp
                const relTime = (() => {
                  if (!inv.created_at) return null;
                  const diff = Date.now() - new Date(inv.created_at).getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 1) return 'just now';
                  if (mins < 60) return `${mins}min ago`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `${hrs}h ago`;
                  return `${Math.floor(hrs / 24)}d ago`;
                })();

                return (
                  <div key={inv.id} style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg)', border: '1px solid var(--border)', marginBottom: 6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inv.email}
                        </span>
                        {relTime && (
                          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{relTime}</span>
                        )}
                      </div>

                      {isConfirming ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>Remove?</span>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={async () => {
                              try {
                                await dbCancelInvitation(inv.id);
                                setPendingEmails(prev => prev.filter(p => p.id !== inv.id));
                              } catch { show(t('inviteFailed')); }
                              setCancelConfirmId(null);
                            }}
                            style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}
                          >
                            Yes
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setCancelConfirmId(null)}
                            style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}
                          >
                            Keep
                          </motion.button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={async () => {
                              if (isResending || didResend) return;
                              setResendingId(inv.id);
                              try {
                                await inviteToTrip(inv.email);
                                setResendSuccessId(inv.id);
                                setTimeout(() => setResendSuccessId(null), 2000);
                              } catch { show(t('inviteFailed')); }
                              setResendingId(null);
                            }}
                            style={{
                              fontSize: 11, fontWeight: 700,
                              color: didResend ? 'var(--success)' : 'var(--terra)',
                              background: didResend ? 'var(--success-bg)' : 'var(--terra-muted)',
                              border: `1px solid ${didResend ? 'rgba(40,160,90,0.2)' : 'rgba(196,113,74,0.2)'}`,
                              borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {isResending ? '…' : didResend ? 'Sent ✓' : 'Resend'}
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => {
                              setCancelConfirmId(inv.id);
                              setTimeout(() => setCancelConfirmId(prev => prev === inv.id ? null : prev), 3000);
                            }}
                            style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <GlassBtn
            variant="danger" size="lg" style={{ width: '100%' }}
            onClick={() => { setShowShare(false); setInviteEmail(''); setPendingEmails([]); leaveTrip().catch(() => show(locale === 'he' ? 'שגיאה בעזיבת הטיול. נסה שוב.' : 'Failed to leave trip. Please try again.')); }}
          >
            {t('leaveTrip')}
          </GlassBtn>
        </Sheet>
      )}
    </div>
  );
}
