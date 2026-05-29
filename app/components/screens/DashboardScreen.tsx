'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate as motionAnimate } from 'framer-motion';
import { blurUpVariants, staggerContainer } from '@/lib/motion';
import GlassBtn from '../ui/GlassBtn';
import Chip from '../ui/Chip';
import Icon from '../ui/Icon';
import Sheet from '../ui/Sheet';
import CompassMark from '../ui/CompassMark';
import { useAppStore } from '@/lib/store';
import { dbGetTripEmailInvitations, dbCancelInvitation } from '@/lib/db';
import { fmtDate, getGaps, toMins, getNextEvent, generateInsights, CAT_META, fmtDuration, getTripBudget, estimateCarbonKg } from '@/lib/utils';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';
import { getCurrencySymbol, getCountryCurrency, getExchangeRates } from '@/lib/currency';
import { fetchWeatherForTrip, getWeatherUrl, WeatherDay } from '@/lib/weather';
import { getCapitalCoords } from '@/lib/capitals';
import AsyncError from '../ui/AsyncError';
import { WorldClock } from '../ui/WorldClock';
import { getTimezoneForCountry } from '@/lib/countryTimezones';
import { calculateSettlements } from '@/lib/settlement';
import { shareTripDNA } from '@/lib/tripDNA';

function fmtAmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// 2027 blur-fade stagger patterns from design system
const item    = blurUpVariants;
const stagger = staggerContainer;

const INSIGHT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  gap:     { bg: 'var(--insight-gap-bg)',     border: 'var(--insight-gap-border)',     text: 'var(--insight-gap-text)'     },
  balance: { bg: 'var(--insight-balance-bg)', border: 'var(--insight-balance-border)', text: 'var(--insight-balance-text)' },
  ready:   { bg: 'var(--insight-ready-bg)',   border: 'var(--insight-ready-border)',   text: 'var(--insight-ready-text)'   },
  tip:     { bg: 'var(--insight-tip-bg)',     border: 'var(--insight-tip-border)',     text: 'var(--insight-tip-text)'     },
  eco:     { bg: 'var(--insight-eco-bg)',     border: 'var(--insight-eco-border)',     text: 'var(--insight-eco-text)'     },
  pacing:  { bg: 'var(--insight-pacing-bg)',  border: 'var(--insight-pacing-border)',  text: 'var(--insight-pacing-text)'  },
  relax:   { bg: 'var(--insight-relax-bg)',   border: 'var(--insight-relax-border)',   text: 'var(--insight-relax-text)'   },
};

/* ── Animated Compass Loader — Globe Loader spec ─────────────── */
function CompassLoader({ size = 48, label }: { size?: number; label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Halo pulse */}
        <motion.div
          animate={{ scale: [0.86, 1.04, 0.86], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(196,113,74,0.22) 0%, rgba(196,113,74,0.10) 28%, transparent 58%)',
          }}
        />
        {/* Faint forest streak, very slow */}
        <motion.svg animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0 }} viewBox="0 0 200 200" width={size} height={size}>
          <circle cx="100" cy="100" r="96" fill="none" stroke="var(--forest)" strokeWidth="1"
            strokeDasharray="170 433" strokeLinecap="round" opacity="0.35" />
        </motion.svg>
        {/* Terracotta arc outer, slow */}
        <motion.svg animate={{ rotate: 360 }} transition={{ duration: 5.4, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0 }} viewBox="0 0 200 200" width={size} height={size}>
          <circle cx="100" cy="100" r="92" fill="none" stroke="var(--terra)" strokeWidth="1.5"
            strokeDasharray="120 84 18 357" strokeLinecap="round" opacity="0.75" />
          <circle cx="100" cy="8" r="3.2" fill="var(--terra)" />
        </motion.svg>
        {/* Gold counter-rotating mid */}
        <motion.svg animate={{ rotate: -360 }} transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0 }} viewBox="0 0 200 200" width={size} height={size}>
          <circle cx="100" cy="100" r="84" fill="none" stroke="var(--sand)" strokeWidth="1.5"
            strokeDasharray="58 38 22 410" strokeLinecap="round" opacity="0.9" />
          <g transform="translate(100 184) rotate(45)">
            <rect x="-3.6" y="-3.6" width="7.2" height="7.2" fill="var(--sand)" />
          </g>
        </motion.svg>
        {/* Forest arcs fast inner */}
        <motion.svg animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0 }} viewBox="0 0 200 200" width={size} height={size}>
          <circle cx="100" cy="100" r="76" fill="none" stroke="var(--forest)" strokeWidth="2"
            strokeDasharray="44 60 18 356" strokeLinecap="round" opacity="0.92" />
          <circle cx="176" cy="100" r="3.6" fill="var(--forest)" />
        </motion.svg>
        {/* Compass mark slowly rotating */}
        <motion.svg animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0 }} viewBox="0 0 240 240" width={size} height={size}>
          <circle cx="120" cy="120" r="90" stroke="var(--compass-ring)" strokeWidth="4" fill="none" />
          <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="var(--compass-n)" />
          <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="var(--compass-s)" />
          <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="var(--compass-ew)" opacity="0.85" />
          <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="var(--compass-ew)" opacity="0.85" />
          <circle cx="120" cy="120" r="6" fill="var(--compass-hub)" />
        </motion.svg>
      </div>
      {label && (
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
    </div>
  );
}

/* ── Section eyebrow with compass accent ─────────────────────── */
function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      fontFamily: 'var(--font-mono)',
      fontSize: 11, fontWeight: 700, color: 'var(--terra)',
      letterSpacing: '0.14em', textTransform: 'uppercase',
      marginBottom: 10,
      ...style,
    }}>
      <CompassMark size={14} />
      {children}
    </div>
  );
}

/* ── Paper-ring day badge ─────────────────────────────────────── */
function PaperRingBadge({
  dayNum, color, emoji, isLocked, isToday, dayOfWeek,
}: {
  dayNum: number; color: string; emoji?: string; isLocked: boolean; isToday: boolean; dayOfWeek: string;
}) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '16px 0', gap: 3,
    }}>
      {/* Color left-edge stripe */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 4, background: color,
        borderRadius: '0 2px 2px 0',
      }} />
      {/* Ring circle */}
      <div style={{
        position: 'relative',
        width: 48, height: 48,
        borderRadius: '50%',
        background: isLocked ? 'rgba(26,20,16,0.04)' : 'rgba(255,255,255,0.85)',
        boxShadow: isToday
          ? `0 0 0 2px ${color}50, 0 4px 12px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)`
          : '0 2px 8px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        {/* Dashed inner ring SVG */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="19" fill="none"
            stroke={isLocked ? 'rgba(26,20,16,0.12)' : `${color}55`}
            strokeWidth="1" strokeDasharray="4 5" />
        </svg>
        {isLocked
          ? <Icon name="lock" size={14} style={{ color: 'var(--text-3)' }} />
          : <span style={{
              fontSize: 18, fontWeight: 800, lineHeight: 1,
              color: color,
              letterSpacing: '-0.04em',
              fontFamily: 'var(--font-sans)',
            }}>
              {String(dayNum).padStart(2, '0')}
            </span>
        }
      </div>
      {!isLocked && emoji && (
        <span style={{ fontSize: 13, lineHeight: 1, marginTop: 2 }}>{emoji}</span>
      )}
      <span style={{
        fontSize: 7, fontWeight: 700, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'var(--text-3)',
        fontFamily: 'var(--font-mono)',
      }}>
        {dayOfWeek}
      </span>
    </div>
  );
}

export default function DashboardScreen() {
  const {
    trip, nickname, tripDbId, setScreen, setActiveDay, logout, leaveTrip, supplies,
    hideBudget, showCarbonBudget, dayEndHour,
    addExpense, deleteExpense, inviteToTrip,
    currencyByTrip, setTripBudget,
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

  const currency = (tripDbId && currencyByTrip[tripDbId]) || 'USD';
  const currSym  = getCurrencySymbol(currency);
  const [localRate, setLocalRate]       = useState<number | null>(null);
  const [localCurrency, setLocalCurrency] = useState<string>('');

  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherRetry, setWeatherRetry] = useState(0);

  const dayCoordsKey = useMemo(
    () => (trip?.dayMeta ?? []).map(m => `${m.lat ?? ''},${m.lng ?? ''}`).join('|'),
    [trip?.dayMeta],
  );

  useEffect(() => {
    if (!trip) return;
    const isDefaultIsrael = (lat: number, lng: number) =>
      Math.abs(lat - 31) < 3 && Math.abs(lng - 35) < 3;

    let lat: number | undefined, lng: number | undefined;

    for (const meta of trip.dayMeta ?? []) {
      if (meta.lat && meta.lng && !isDefaultIsrael(meta.lat, meta.lng)) {
        lat = meta.lat; lng = meta.lng; break;
      }
    }

    if (!lat) {
      outer: for (let d = 1; d <= trip.days; d++) {
        for (const ev of trip.events[d] ?? []) {
          if (ev.lat && ev.lng && !isDefaultIsrael(ev.lat, ev.lng)) {
            lat = ev.lat; lng = ev.lng; break outer;
          }
        }
      }
    }

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
  }, [trip?.startDate, trip?.days, dayCoordsKey, trip?.countries?.join(','), weatherRetry]);

  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateRetry, setRateRetry] = useState(0);

  useEffect(() => {
    if (!trip) { setLocalRate(null); setLocalCurrency(''); return; }

    if (currency === 'ILS') {
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
  const [showSettlement, setShowSettlement] = useState(false);
  const [dnaLoading, setDnaLoading]     = useState(false);
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [budgetInput, setBudgetInput]         = useState('');

  if (!trip) return null;

  const destTimezone = (() => {
    for (const ev of Object.values(trip.events).flat()) {
      if ((ev as any).timezone) return (ev as any).timezone as string;
    }
    if (trip.countries?.[0]) {
      const tz = getTimezoneForCountry(trip.countries[0]);
      if (tz) return tz;
    }
    return null;
  })();
  const destCity = trip.dayMeta?.[0]?.region || trip.countries?.[0] || trip.name;

  const packedCount = supplies.filter(s => s.checked).length;
  const totalCount  = supplies.length;
  const pct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const nextEventData = getNextEvent(trip);
  const insights      = generateInsights(trip, packedCount, totalCount, t);
  const tripBudget    = getTripBudget(trip);
  const carbonKg      = estimateCarbonKg(trip);
  const dayEndMins    = dayEndHour * 60;

  const totalEvents = Object.values(trip.events).reduce((s, evs) => s + evs.length, 0);

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

  const STRIPE_COLORS = ['#C4714A', '#C8944A', '#3B6E52', '#6B5CE7', '#E05A3A', '#2B8A6E', '#B45309'];

  /* ── Glass surface helpers ── */
  const glass = {
    background: 'rgba(255,255,255,0.65)',
    backdropFilter: 'blur(32px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
    border: '1px solid rgba(255,255,255,0.82)',
    boxShadow: 'var(--shadow-sm)',
  } as const;

  /* ── Today's events ── */
  const currentDisplayDay = currentTripDay ?? 1;
  const todayEvs = [...(trip.events[currentDisplayDay] ?? [])].sort((a, b) => toMins(a.time) - toMins(b.time));

  const THEME_ICONS: Record<string, string> = {
    desert: '🌵', nature: '🌲', city: '🏛️', beach: '🏖️',
    mountain: '⛰️', snow: '❄️',
  };
  const themeIcon = THEME_ICONS[(trip as any).theme ?? 'city'] ?? '🗺️';

  return (
    <div
      className="h-full w-full overflow-y-auto"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-strong) transparent' }}
    >
      <motion.div
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
        style={{ paddingBottom: 48 }}
      >

        {/* ── Cinematic hero ── */}
        <motion.div
          className="hero-mesh"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0, 0, 1] }}
          style={{
            position: 'relative',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 52px)',
            paddingBottom: 22,
            paddingLeft: 22,
            paddingRight: 22,
            borderRadius: '0 0 var(--lg-r-lg) var(--lg-r-lg)',
            overflow: 'hidden',
            marginBottom: 18,
          }}
        >
          {/* Terra accent blob */}
          <div style={{
            position: 'absolute', top: -40, insetInlineEnd: -30,
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(62% 0.17 40 / 45%), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Top row: eyebrow + crew avatars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <span className="eyebrow-lg" style={{ color: 'oklch(98% 0.005 80 / 72%)' }}>
              {currentTripDay !== null ? t('day').toUpperCase() + ' ' + currentTripDay : 'Active trip'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {trip.participants.slice(0, 4).map((p, i) => (
                <div key={p.id} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: p.color ?? STRIPE_COLORS[i % STRIPE_COLORS.length],
                  color: 'white', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid oklch(20% 0.03 60)',
                  marginInlineStart: i > 0 ? -8 : 0,
                  boxShadow: 'var(--lg-shadow)',
                  letterSpacing: '-0.02em',
                }}>
                  {p.initials}
                </div>
              ))}
            </div>
          </div>

          {/* Trip title block */}
          <div style={{ marginTop: 24, position: 'relative' }}>
            {(trip.countries?.length ?? 0) > 0 && (
              <p className="eyebrow-lg a-rise" style={{ color: 'var(--lg-sand)', margin: '0 0 4px' }}>
                {(trip.countries ?? []).join(' · ')}
              </p>
            )}
            <h1 className="display-xl a-rise d1" style={{ fontSize: 'clamp(2.4rem, 10vw, 3.2rem)', color: '#fff', margin: 0 }}>
              {trip.name}
            </h1>

            {/* Stat pills */}
            <div className="a-rise d2" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {daysUntil !== null && daysUntil > 0 && (
                <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 9, background: 'var(--lg-terra-bright)', boxShadow: '0 0 8px var(--lg-terra-bright)', flexShrink: 0 }} />
                  {daysUntil} {t('days')}
                </span>
              )}
              {currentTripDay !== null && (
                <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 9, background: 'var(--lg-terra-bright)', boxShadow: '0 0 8px var(--lg-terra-bright)', flexShrink: 0 }} />
                  {t('day')} {currentTripDay} {'of ' + trip.days}
                </span>
              )}
              {trip.startDate && endDate && (
                <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 12 }}>
                  {fmtDate(trip.startDate, 0, locale)} → {fmtDate(trip.startDate, trip.days - 1, locale)}
                </span>
              )}
            </div>
          </div>

          {/* Day journey scroller */}
          <div className="lg-scroll a-rise d3" style={{ display: 'flex', gap: 8, marginTop: 20, overflowX: 'auto', paddingBottom: 2 }}>
            {Array.from({ length: Math.min(trip.days, 30) }, (_, i) => {
              const dayNum = i + 1;
              const isActive = dayNum === (currentTripDay ?? 1);
              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  style={{
                    flexShrink: 0, width: 50, height: 62, borderRadius: 16, border: 0, cursor: 'pointer',
                    background: isActive
                      ? 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))'
                      : 'oklch(100% 0 0 / 12%)',
                    boxShadow: isActive ? 'var(--lg-glow-terra)' : 'inset 0 0 0 1px oklch(100% 0 0 / 14%)',
                    color: '#fff',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 1, backdropFilter: 'blur(10px)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {t('day')}
                  </span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, lineHeight: 1 }}>{dayNum}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* AI Insight card — forest gradient */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.42, ease: [0.25, 0, 0, 1] }}
          style={{ padding: '0 var(--page-px)', marginBottom: 20 }}
          onClick={() => setScreen('day')}
        >
          <div style={{
            borderRadius: 'var(--lg-r-card)', padding: '14px 16px',
            background: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))',
            boxShadow: 'var(--lg-glow-forest)',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}>
            {/* Background sparkle */}
            <div style={{ position: 'absolute', top: -20, insetInlineEnd: -10, opacity: 0.16, pointerEvents: 'none' }}>
              <Icon name="sparkle" size={90} color="#fff" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Icon name="sparkle" size={16} color="var(--lg-sand)" />
              <span className="eyebrow-lg" style={{ color: 'var(--lg-sand)' }}>
                {t('tripInsights') as string || 'Trip insights'}
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: '#fff', fontWeight: 500, margin: 0 }}>
              {insights.length > 0
                ? insights[0].title + ' — ' + insights[0].description
                : trip.days + ' ' + t('days') + ' · ' + totalEvents + ' events planned.'}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#fff', fontWeight: 600, fontSize: 13 }}>
              {t('viewDay') as string || 'See the plan'}
              <Icon name="chevR" size={15} color="#fff" style={{ transform: locale === 'he' ? 'scaleX(-1)' : 'none' }} />
            </div>
          </div>
        </motion.div>

        {/* Today schedule */}
        {todayEvs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            style={{ padding: '0 var(--page-px)', marginBottom: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--terra)', margin: 0 }}>
                {'TODAY · ' + t('day').toUpperCase() + ' ' + currentDisplayDay}
              </p>
              <button
                onClick={() => handleDayClick(currentDisplayDay)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
              >
                {'See all ' + trip.days + ' days'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(26,20,16,0.07)', boxShadow: '0 2px 12px rgba(26,20,16,0.05)' }}>
              {todayEvs.slice(0, 4).map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.05 }}
                  onClick={() => handleDayClick(currentDisplayDay)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'white', borderBottom: i < Math.min(todayEvs.length, 4) - 1 ? '1px solid rgba(26,20,16,0.06)' : 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.02em', flexShrink: 0, width: 42 }}>{ev.time}</span>
                  <div style={{ width: 38, height: 38, borderRadius: 13, flexShrink: 0, background: CAT_META[ev.category].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {CAT_META[ev.category].icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(ev.name)}</p>
                    {ev.location && <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{'📍 ' + ev.location}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Post-hero: Supplies + WorldClock */}
        <div style={{ padding: '0 var(--page-px)', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Supplies progress */}
          <motion.div
            initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
            transition={{ delay: 0.13, duration: 0.42, ease: [0.25, 0, 0, 1] }}
            onClick={() => setScreen('supplies')}
            className="jelly-glow liquid-hover"
            style={{
              ...glass,
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: '-50%', left: '-50%',
              width: '200%', height: '200%',
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 40%)',
              pointerEvents: 'none',
            }} />
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

          {/* WorldClock */}
          {destTimezone && (
            <motion.div
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
              transition={{ delay: 0.17, duration: 0.42, ease: [0.25, 0, 0, 1] }}
            >
              <WorldClock destinationTimezone={destTimezone} destinationCity={destCity} />
            </motion.div>
          )}
        </div>

        {/* ═══ Body ═══ */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ padding: '16px var(--page-px) 0', display: 'flex', flexDirection: 'column', gap: 10 }}
        >

          {/* Next Event */}
          <motion.div variants={item}>
            <SectionLabel>{t('nextEvent')}</SectionLabel>
            {nextEventData ? (() => {
              const nextWeather = weather[nextEventData.dayNum - 1] ?? null;
              const weatherLocation = nextEventData.event.location
                ?? trip.dayMeta?.[nextEventData.dayNum - 1]?.region
                ?? trip.name;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div
                    onClick={() => { setActiveDay(nextEventData.dayNum); setScreen('day'); }}
                    className="jelly-glow liquid-hover"
                    style={{
                      background: CAT_META[nextEventData.event.category].bg,
                      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                      border: '1.5px solid rgba(255,255,255,0.60)',
                      borderRadius: nextWeather ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                      background: 'rgba(255,255,255,0.85)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70), 0 2px 10px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(255,255,255,0.75)',
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
                        background: 'rgba(255,255,255,0.78)', borderRadius: 14,
                        padding: '6px 10px', gap: 1, flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
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

                  {nextWeather && (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(weatherLocation + ' weather forecast')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 14px',
                        background: 'rgba(0,0,0,0.04)',
                        border: '1.5px solid rgba(255,255,255,0.60)',
                        borderTop: 'none',
                        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                        textDecoration: 'none', gap: 8,
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
              <div
                style={{
                  ...glass,
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  border: '1px dashed var(--border)',
                }}
              >
                <CompassLoader size={64} />
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
              </div>
            )}
          </motion.div>

          {/* Weather Forecast Strip */}
          {(weatherLoading || weatherError || weather.length > 0) && (
            <motion.div variants={item}>
              <SectionLabel>{t('forecast') || 'Forecast'}</SectionLabel>
              {weatherLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
                  <CompassLoader size={52} label="Loading forecast…" />
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
                        className="jelly-glow"
                        style={{
                          flexShrink: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: isNextEventDay ? 'rgba(196,113,74,0.12)' : 'rgba(255,255,255,0.65)',
                          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                          border: `1px solid ${isNextEventDay ? 'rgba(196,113,74,0.38)' : 'rgba(255,255,255,0.82)'}`,
                          minWidth: 58,
                          textDecoration: 'none',
                          cursor: 'pointer',
                          boxShadow: isNextEventDay ? '0 4px 16px rgba(196,113,74,0.15)' : 'var(--shadow-xs)',
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

          {/* Budget + Carbon */}
          {((tripBudget > 0 && !hideBudget) || (showCarbonBudget && carbonKg > 0)) && (
            <motion.div variants={item} style={{ display: 'flex', gap: 8 }}>
              {tripBudget > 0 && !hideBudget && (
                <div className="jelly-glow" style={{
                  flex: 1,
                  ...glass,
                  border: '1px solid rgba(40,160,90,0.30)',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(40,160,90,0.08)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    💰 {t('tripBudget')}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--success)' }}>{currSym}{fmtAmt(tripBudget, 0)}</span>
                    {rateLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
                        <CompassLoader size={16} />
                      </div>
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
                <div className="jelly-glow" style={{
                  flex: 1,
                  ...glass,
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
          <motion.div variants={item}>
            <motion.div
              onClick={() => setShowExpenses(v => !v)}
              className="jelly-glow liquid-hover"
              style={{
                ...glass,
                borderRadius: showExpenses ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                padding: '11px 16px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                    ...glass,
                    background: 'rgba(255,255,255,0.55)',
                    borderTop: 'none',
                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    padding: '12px 16px',
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
                            background: 'rgba(255,255,255,0.65)',
                            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(255,255,255,0.82)', padding: '8px 10px',
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

          {/* Budget limit setter */}
          {!hideBudget && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <motion.div
                onClick={() => setShowBudgetInput(v => !v)}
                className="jelly-glow liquid-hover"
                style={{
                  ...glass,
                  borderRadius: showBudgetInput ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                  padding: '11px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🎯 {t('budgetLabel')}
                  {trip.budget ? (
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
                      {currSym}{trip.budget.toLocaleString()}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>(not set)</span>
                  )}
                </span>
                <Icon name={showBudgetInput ? 'chevL' : 'chevR'} size={13}
                  style={{ color: 'var(--text-3)', transform: showBudgetInput ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
              </motion.div>
              <AnimatePresence>
                {showBudgetInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      ...glass,
                      background: 'rgba(255,255,255,0.55)',
                      borderTop: 'none',
                      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: '12px 16px',
                      display: 'flex', gap: 8,
                    }}>
                      <input
                        type="number" min="0" placeholder={t('budgetPlaceholder')}
                        value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const n = parseFloat(budgetInput);
                            if (!isNaN(n) && n > 0) { setTripBudget(n); show(t('budgetSet')); setShowBudgetInput(false); setBudgetInput(''); }
                          }
                        }}
                        style={{
                          flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14,
                          background: 'var(--bg)', border: '1px solid var(--border)', outline: 'none', color: 'var(--text)',
                        }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.93 }} transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                        onClick={() => {
                          const n = parseFloat(budgetInput);
                          if (!isNaN(n) && n > 0) { setTripBudget(n); show(t('budgetSet')); setShowBudgetInput(false); setBudgetInput(''); }
                        }}
                        style={{
                          padding: '8px 16px', background: 'var(--terra)', color: '#fff', border: 'none',
                          borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)', fontWeight: 600,
                          fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                          WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
                        }}
                      >
                        {t('setBudget')}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Settlement */}
          {expenses.length >= 2 && (() => {
            const settlements = calculateSettlements(expenses, currency);
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                <motion.div
                  onClick={() => setShowSettlement(v => !v)}
                  className="jelly-glow liquid-hover"
                  style={{
                    ...glass,
                    borderRadius: showSettlement ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                    padding: '11px 16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🤝 {t('settlementTitle')}
                    {settlements.length > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--terra)', fontWeight: 600, background: 'var(--terra-muted)', borderRadius: 'var(--radius-full)', padding: '1px 7px' }}>
                        {settlements.length}
                      </span>
                    )}
                  </span>
                  <Icon name={showSettlement ? 'chevL' : 'chevR'} size={13}
                    style={{ color: 'var(--text-3)', transform: showSettlement ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                </motion.div>
                <AnimatePresence>
                  {showSettlement && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        ...glass,
                        background: 'rgba(255,255,255,0.55)',
                        borderTop: 'none',
                        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: '12px 16px',
                      }}>
                        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>{t('settlementSub')}</p>
                        {settlements.length === 0 ? (
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', textAlign: 'center', padding: '12px 0' }}>
                            {t('settlementAllClear')}
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {settlements.map((s, i) => (
                              <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: 'rgba(255,255,255,0.65)',
                                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(255,255,255,0.82)', padding: '10px 12px',
                              }}>
                                <div>
                                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{s.from}</span>
                                  <span style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 6px' }}>{t('settlementOwes')}</span>
                                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{s.to}</span>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--terra)' }}>
                                  {currSym}{fmtAmt(s.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })()}

          {/* Trip DNA + Map */}
          <motion.div variants={item} style={{ display: 'flex', gap: 8 }}>
            <motion.button
              onClick={async () => {
                setDnaLoading(true);
                show(t('dnaGenerating'));
                const result = await shareTripDNA(trip);
                setDnaLoading(false);
                if (result === 'shared' || result === 'downloaded') show(result === 'shared' ? '✓ Shared!' : t('dnaDownloaded'));
                else show(t('dnaShareFailed'));
              }}
              disabled={dnaLoading}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="jelly-glow"
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'linear-gradient(135deg, var(--terra) 0%, var(--sand) 100%)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                color: '#fff',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
                cursor: dnaLoading ? 'not-allowed' : 'pointer',
                opacity: dnaLoading ? 0.7 : 1,
                boxShadow: '0 8px 24px rgba(196,113,74,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
              }}
            >
              {dnaLoading
                ? <><CompassLoader size={18} /> Generating…</>
                : <>{t('dnaBtnShare')}</>
              }
            </motion.button>
            <motion.button
              onClick={() => setScreen('map')}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="jelly-glow"
              style={{
                padding: '12px 16px',
                ...glass,
                border: '1px solid rgba(255,255,255,0.82)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text)',
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
              }}
            >
              <Icon name="map" size={16} /> Map
            </motion.button>
          </motion.div>

          {/* Insights */}
          {insights.length > 0 && (
            <motion.div variants={item}>
              <SectionLabel>{t('tripInsights')}</SectionLabel>
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
                      className="jelly-glow"
                      style={{
                        flexShrink: 0,
                        minWidth: 172, maxWidth: 210,
                        background: colors.bg,
                        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '11px 13px',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {/* Specular top-left shine */}
                      <div style={{
                        position: 'absolute', top: '-60%', left: '-30%',
                        width: '140%', height: '140%',
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 50%)',
                        pointerEvents: 'none',
                      }} />
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

          {/* Days */}
          <motion.div variants={item} style={{ marginTop: 6 }}>
            <SectionLabel style={{ marginBottom: 14 }}>{t('days')}</SectionLabel>

            <motion.div
              data-tour="day-cards"
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {Array.from({ length: trip.days }, (_, i) => {
                const dayNum  = i + 1;
                const evs     = trip.events[dayNum] ?? [];
                const meta    = trip.dayMeta[i];
                const gaps    = getGaps(evs, dayEndMins);
                const sorted  = [...evs].sort((a, b) => toMins(a.time) - toMins(b.time));
                const first   = sorted[0]?.time ?? null;
                const last    = sorted[sorted.length - 1];
                const lastEnd = last
                  ? `${Math.floor((toMins(last.time) + last.duration) / 60).toString().padStart(2, '0')}:${String((toMins(last.time) + last.duration) % 60).padStart(2, '0')}`
                  : null;
                const dayWeather = weather[i] ?? null;
                const longestEv = evs.length ? [...evs].sort((a, b) => b.duration - a.duration)[0] : null;
                const weatherLocation = longestEv?.location ?? meta?.region ?? '';
                const isToday = currentTripDay === dayNum;
                const isFutureLocked = !isToday && startDate !== null && today < startDate ? false
                  : (!isToday && startDate !== null && new Date(startDate.getTime() + (dayNum - 1) * 86400000) > today && currentTripDay !== null);

                const stripeColor = isFutureLocked ? 'var(--border)' : STRIPE_COLORS[i % STRIPE_COLORS.length];

                const dayOfWeek = trip.startDate
                  ? new Date(new Date(trip.startDate + 'T00:00:00').getTime() + i * 86400000)
                      .toLocaleDateString('en', { weekday: 'short' }).toUpperCase()
                  : `D${dayNum}`;

                return (
                  <motion.div key={dayNum} variants={item}>
                    <div
                      onClick={() => handleDayClick(dayNum)}
                      className={`day-card-v3 jelly-glow`}
                      style={{
                        background: isToday
                          ? 'rgba(255,255,255,0.90)'
                          : 'rgba(255,255,255,0.62)',
                        backdropFilter: 'blur(32px) saturate(1.6)',
                        WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
                        border: isToday
                          ? `1.5px solid ${STRIPE_COLORS[i % STRIPE_COLORS.length]}55`
                          : '1px solid rgba(255,255,255,0.82)',
                        boxShadow: isToday
                          ? `0 8px 32px ${STRIPE_COLORS[i % STRIPE_COLORS.length]}28, inset 0 1px 0 rgba(255,255,255,0.70)`
                          : 'var(--shadow-xs)',
                        opacity: isFutureLocked ? 0.55 : 1,
                      }}
                    >
                      {/* Left: paper-ring badge */}
                      <PaperRingBadge
                        dayNum={dayNum}
                        color={typeof stripeColor === 'string' && stripeColor.startsWith('#') ? stripeColor : '#C4714A'}
                        emoji={meta?.emoji}
                        isLocked={isFutureLocked}
                        isToday={isToday}
                        dayOfWeek={dayOfWeek}
                      />

                      {/* Middle */}
                      <div style={{
                        padding: '14px 10px 14px 12px',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', gap: 3, minWidth: 0,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                          <span style={{
                            fontSize: 15, fontWeight: 700, color: 'var(--text)',
                            letterSpacing: '-0.02em',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {t(meta?.region ?? `${t('day')} ${dayNum}`)}
                          </span>
                          {isToday && (
                            <span style={{
                              flexShrink: 0, fontSize: 9, fontWeight: 800,
                              background: STRIPE_COLORS[i % STRIPE_COLORS.length], color: 'white',
                              borderRadius: 6, padding: '2px 7px',
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                            }}>
                              NOW
                            </span>
                          )}
                        </div>
                        {meta?.desc && (
                          <p style={{
                            fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {t(meta.desc)}
                          </p>
                        )}
                        {trip.startDate && (
                          <p style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginTop: 1 }}>
                            {fmtDate(trip.startDate, i, locale).split(' ').slice(0, 2).join(' ')}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                          {evs.length > 0 ? (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
                              {evs.length} ev · {first} → {lastEnd}
                            </span>
                          ) : (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', fontStyle: 'italic' }}>
                              No events yet
                            </span>
                          )}
                          {gaps.length > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--terra)', background: 'var(--terra-muted)', borderRadius: 4, padding: '1px 6px' }}>
                              {gaps.length} gap{gaps.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: weather + chevron */}
                      <div style={{
                        padding: '12px 14px 12px 6px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 6, flexShrink: 0,
                      }}>
                        {dayWeather ? (
                          <a
                            href={getWeatherUrl(weatherLocation || trip.name)}
                            target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="jelly-glow"
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center',
                              background: 'rgba(255,255,255,0.78)',
                              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                              borderRadius: 12,
                              padding: '6px 10px', gap: 1,
                              border: '1px solid rgba(255,255,255,0.88)',
                              textDecoration: 'none',
                              boxShadow: 'var(--shadow-xs)',
                            }}
                          >
                            <span style={{ fontSize: 18, lineHeight: 1 }}>{dayWeather.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
                              {dayWeather.tempMax}°
                            </span>
                          </a>
                        ) : null}
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: isFutureLocked ? 'rgba(26,20,16,0.06)' : `${STRIPE_COLORS[i % STRIPE_COLORS.length]}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon name="chevR" size={13} style={{ color: isFutureLocked ? 'var(--text-3)' : STRIPE_COLORS[i % STRIPE_COLORS.length] }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

        </motion.div>
      </motion.div>

      {/* Share Sheet */}
      {showShare && (
        <Sheet
          onClose={() => { setShowShare(false); setInviteEmail(''); setPendingEmails([]); }}
          title={t('shareTrip')}
          subtitle={t('shareSub')}
        >
          <div style={{
            ...glass,
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
                    ...glass,
                    marginBottom: 6,
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
