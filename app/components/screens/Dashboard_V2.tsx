'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';
import Ring from '../ui/Ring';
import Sheet from '../ui/Sheet';
import Field from '../ui/Field';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { useI18n, hebrewPlural } from '@/lib/i18n';
import { fmtDate, getNextEvent, CAT_FALLBACK, fmtDuration, toMins, getDayBudget } from '@/lib/utils';
import { fetchWeatherForTrip, WeatherDay, WeatherResult } from '@/lib/weather';
import { getCapitalCoords } from '@/lib/capitals';
import { getTimezoneForCountry } from '@/lib/countryTimezones';
import { getCurrencySymbol } from '@/lib/currency';
import CurrencyAmount from '../ui/CurrencyAmount';
import Gauge from '../ui/Gauge';
import StatTriplet from '../ui/StatTriplet';
import Eyebrow from '../ui/Eyebrow';
import AvatarStack from '../ui/AvatarStack';

// ── Budget edit sheet ─────────────────────────────────────────────────────────

// Quick-pick categories for tagging a spend. The English value is stored; the
// Hebrew label is shown when locale === 'he'.
const EXPENSE_TAGS: { en: string; he: string; emoji: string }[] = [
  { en: 'Food',       he: 'אוכל',     emoji: '🍽️' },
  { en: 'Transport',  he: 'תחבורה',   emoji: '🚕' },
  { en: 'Stay',       he: 'לינה',     emoji: '🏨' },
  { en: 'Activities', he: 'אטרקציות', emoji: '🎟️' },
  { en: 'Shopping',   he: 'קניות',    emoji: '🛍️' },
  { en: 'Other',      he: 'אחר',      emoji: '•'  },
];

function tagLabel(tagEn: string, isHe: boolean): string {
  const m = EXPENSE_TAGS.find(t => t.en === tagEn);
  return m ? (isHe ? m.he : m.en) : tagEn;
}

function BudgetEditSheet({ current, currSym, onClose, onSave }: {
  current: number | undefined;
  currSym: string;
  onClose: () => void;
  onSave: (v: number) => void;
}) {
  const { t } = useI18n();
  const [val, setVal] = useState(current != null ? String(current) : '');
  return (
    <Sheet title={t('setBudget')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field
          label={`${t('budgetLabel')} (${currSym})`}
          placeholder="0"
          value={val}
          onChange={setVal}
          type="number"
          autoFocus
        />
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              const n = parseFloat(val);
              if (isNaN(n) || n <= 0) { return; } // silently block — Field is visually focused
              onSave(n);
              onClose();
            }}
            style={{
              flex: 2, height: 52, border: 0, borderRadius: 'var(--lg-r-btn)',
              background: 'var(--lg-forest)', color: '#fff',
              fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: 'var(--lg-glow-forest)',
            }}
          >
            {t('saveBtn')}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 52, border: 0, borderRadius: 'var(--lg-r-btn)',
              background: 'var(--lg-panel)', color: 'var(--text-2)',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
            }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ── Weather icon ─────────────────────────────────────────────────────────────

function weatherIconName(label?: string): 'sun' | 'wind' | 'wave' {
  if (!label) return 'sun';
  if (/thunder|storm/i.test(label)) return 'wind';
  if (/rain|shower|drizzle/i.test(label)) return 'wave';
  return 'sun';
}

// ── AI analysis helper ───────────────────────────────────────────────────────

function buildAiSummary(trip: any, supplies: any[], totalSpent: number, locale: string): string {
  const isHe = locale === 'he';
  const totalEvents = Object.values(trip.events as Record<number, any[]>).reduce((s, e) => s + e.length, 0);
  const emptyDays = Array.from({ length: trip.days }, (_, i) => i + 1)
    .filter(d => !(trip.events[d]?.length));
  const packedPct = supplies.length > 0
    ? Math.round((supplies.filter((s: any) => s.checked).length / supplies.length) * 100)
    : 0;
  const budgetPct = trip.budget ? Math.round((totalSpent / trip.budget) * 100) : null;

  const lines: string[] = [];

  if (isHe) {
    lines.push(`${hebrewPlural(trip.days, 'יום', 'יומיים', 'ימים')} · ${totalEvents} פעילויות מתוכננות.`);

    if (emptyDays.length > 0 && emptyDays.length <= 3) {
      const labels = emptyDays.map(d => {
        if (!trip.startDate) return `יום ${d}`;
        const dt = new Date(new Date(trip.startDate + 'T00:00:00').getTime() + (d - 1) * 86_400_000);
        return dt.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' });
      });
      lines.push(`${labels.join(', ')} ${emptyDays.length === 1 ? 'עדיין ריק' : 'עדיין ריקים'} — מה לגבי להוסיף משהו?`);
    } else if (emptyDays.length > 3) {
      lines.push(`${hebrewPlural(emptyDays.length, 'יום פנוי', 'יומיים פנויים', 'ימים פנויים')} — הרבה מקום להרפתקאות!`);
    }

    if (budgetPct !== null) {
      if (budgetPct > 90) lines.push('התקציב כמעט מוצה — שווה לבדוק הוצאות קרובות.');
      else if (budgetPct > 70) lines.push(`${budgetPct}% מהתקציב בשימוש — תחת שליטה.`);
      else lines.push('עדיין הרבה תקציב — תיהנו!');
    }

    if (packedPct < 50 && supplies.length > 0) {
      lines.push(`הציוד ${packedPct}% ארוז — אל תשכחו את הדברים החשובים לפני שיוצאים.`);
    } else if (packedPct === 100) {
      lines.push('כל הציוד ארוז. מוכנים לדרך!');
    }
  } else {
    lines.push(`${trip.days} days · ${totalEvents} activities planned.`);

    if (emptyDays.length > 0 && emptyDays.length <= 3) {
      const labels = emptyDays.map(d => {
        if (!trip.startDate) return `Day ${d}`;
        const dt = new Date(new Date(trip.startDate + 'T00:00:00').getTime() + (d - 1) * 86_400_000);
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      lines.push(`${labels.join(', ')} ${emptyDays.length === 1 ? 'has' : 'have'} nothing planned yet — worth adding something.`);
    } else if (emptyDays.length > 3) {
      lines.push(`${emptyDays.length} days still open — lots of room for adventures.`);
    }

    if (budgetPct !== null) {
      if (budgetPct > 90) lines.push('Budget almost used up — worth checking upcoming costs.');
      else if (budgetPct > 70) lines.push(`${budgetPct}% of budget used — you\'re on track.`);
      else lines.push('Plenty of budget left — enjoy it!');
    }

    if (packedPct < 50 && supplies.length > 0) {
      lines.push(`Packing is ${packedPct}% done — don\'t forget the essentials before you leave.`);
    } else if (packedPct === 100) {
      lines.push('All packed. Ready to go!');
    }
  }

  return lines.join(' ');
}

// ── Weather-aware rescheduling alerts ────────────────────────────────────────

const OUTDOOR_CATS = new Set(['beach', 'hiking', 'nature_walk', 'cycling', 'sport', 'picnic', 'golf', 'water_sports', 'aerial', 'safari', 'national_park', 'photography', 'attraction']);
const BAD_WEATHER  = /rain|shower|drizzle|thunder|storm/i;
const SNOW_WEATHER = /snow/i;

function WeatherAlerts({ trip, weather, onGoToDay }: {
  trip: any; weather: WeatherDay[]; onGoToDay: (d: number) => void;
}) {
  const { locale } = useI18n();
  const isHe = locale === 'he';

  // Find days with bad weather AND outdoor events
  const alerts: { day: number; label: string; outdoorCount: number; altDay: number | null }[] = [];

  weather.forEach((w, i) => {
    const day = i + 1;
    if (!w.label) return;
    const isBad  = BAD_WEATHER.test(w.label);
    const isSnow = SNOW_WEATHER.test(w.label);
    if (!isBad && !isSnow) return;

    const outdoor = (trip.events[day] ?? []).filter((e: any) => OUTDOOR_CATS.has(e.category));
    if (outdoor.length === 0) return;

    // Find nearest dry alternative day (future first, then past)
    const altDay = weather
      .map((ww, j) => ({ day: j + 1, label: ww.label ?? '' }))
      .filter(x => x.day !== day && !BAD_WEATHER.test(x.label) && !SNOW_WEATHER.test(x.label))
      .sort((a, b) => Math.abs(a.day - day) - Math.abs(b.day - day))[0]?.day ?? null;

    alerts.push({ day, label: w.label, outdoorCount: outdoor.length, altDay });
  });

  if (alerts.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {alerts.slice(0, 2).map(({ day, label, outdoorCount, altDay }) => {
        const isStorm = /thunder|storm/i.test(label);
        const color   = isStorm ? '#E05A3A' : '#C8944A';
        const bg      = isStorm ? 'oklch(62% 0.18 28 / 10%)' : 'oklch(68% 0.14 58 / 10%)';
        const border  = isStorm ? 'oklch(62% 0.18 28 / 25%)' : 'oklch(68% 0.14 58 / 25%)';
        const msg = isHe
          ? `יום ${day}: ${label} — ${outdoorCount} פעילות חיצונית מתוכננת${altDay ? `. יום ${altDay} נראה יותר יבש.` : '.'}`
          : `Day ${day}: ${label} — ${outdoorCount} outdoor ${outdoorCount === 1 ? 'activity' : 'activities'} planned${altDay ? `. Day ${altDay} looks clearer.` : '.'}`;

        return (
          <div
            key={day}
            style={{ padding: '11px 14px', borderRadius: 14, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <Icon name={isStorm ? 'wind' : 'wave'} size={16} color={color} style={{ flexShrink: 0 }} />
            <p style={{ flex: 1, fontSize: 13, color, fontWeight: 500, margin: 0, lineHeight: 1.45 }}>{msg}</p>
            <button
              onClick={() => onGoToDay(day)}
              style={{ flexShrink: 0, height: 44, padding: '0 12px', border: 0, borderRadius: 9999, cursor: 'pointer', background: color, color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12 }}
            >
              {isHe ? `יום ${day}` : `Day ${day}`}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Destination Intelligence card ─────────────────────────────────────────────

interface Intel { currency: string; tipping: string; customs: string; safety: string; adapter: string; emergency: string }

const INTEL_ICONS: [keyof Intel, string, string][] = [
  ['currency',  'cash',      'Currency'],
  ['tipping',   'wallet',    'Tipping'],
  ['customs',   'passport',  'Customs'],
  ['safety',    'first_aid', 'Safety'],
  ['adapter',   'card',      'Power'],
  ['emergency', 'first_aid', 'Emergency'],
];
const INTEL_ICONS_HE: [keyof Intel, string, string][] = [
  ['currency',  'cash',      'מטבע'],
  ['tipping',   'wallet',    'טיפים'],
  ['customs',   'passport',  'נימוסים'],
  ['safety',    'first_aid', 'בטיחות'],
  ['adapter',   'card',      'חשמל'],
  ['emergency', 'first_aid', 'חירום'],
];

function DestinationIntelCard({ country, locale }: { country: string; locale: string }) {
  const isHe = locale === 'he';
  const isRTL = isHe;
  const cacheKey = `trippy-intel-v2-${country}-${locale}`;

  const [intel,    setIntel]    = useState<Intel | null>(() => {
    try { const s = localStorage.getItem(cacheKey); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fetched,  setFetched]  = useState(!!intel);
  const [fetchErr, setFetchErr] = useState(false);

  const fetchIntel = async () => {
    if (fetched || loading) return;
    setLoading(true);
    setFetchErr(false);
    try {
      const res  = await fetch('/api/ai/destination-intel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ country, locale }),
      });
      if (!res.ok) { setFetchErr(true); return; }
      const data = await res.json() as Intel;
      if (data.currency) {
        setIntel(data);
        setFetched(true);
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
      } else {
        setFetchErr(true);
      }
    } catch { setFetchErr(true); }
    finally { setLoading(false); }
  };

  const icons = isHe ? INTEL_ICONS_HE : INTEL_ICONS;

  // Arrow: points toward the content in both LTR (›) and RTL (‹)
  const arrowChar = isRTL ? '‹' : '›';
  const arrowRotate = expanded
    ? (isRTL ? 'rotate(-90deg)' : 'rotate(90deg)')
    : 'none';

  return (
    <div className="lg a-rise" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <button
        onClick={() => { setExpanded(e => !e); if (!expanded && !fetched) fetchIntel(); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', border: 0, background: 'transparent',
          cursor: 'pointer', textAlign: 'start',
          touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <StampIcon iconKey="map" size={22} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--lg-ink)' }}>
            {isHe ? `מדריך מהיר: ${country}` : `Quick guide: ${country}`}
          </span>
          {!expanded && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginInlineStart: 8 }}>
              {isHe ? 'מטבע · טיפים · חשמל…' : 'currency · tipping · power…'}
            </span>
          )}
        </div>
        <span style={{ minWidth: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {loading
            ? <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--lg-terra)', animation: 'spin .8s linear infinite', display: 'block' }} />
            : <span style={{ fontSize: 14, transform: arrowRotate, transition: 'transform .25s', color: 'var(--text-3)', display: 'inline-block' }}>{arrowChar}</span>
          }
        </span>
      </button>

      {expanded && intel && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 12%)', marginBottom: 2 }} />
          {icons.map(([key, stampKey, label]) => intel[key] && (
            <div key={key} style={{ display: 'flex', gap: 10 }}>
              <StampIcon iconKey={stampKey} size={28} style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600, display: 'block', marginBottom: 2 }}>{label}</span>
                <span style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.5 }}>{intel[key]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && !intel && !loading && (
        <div style={{ padding: '4px 14px 14px' }}>
          {fetchErr ? (
            <button
              onClick={e => { e.stopPropagation(); setFetchErr(false); fetchIntel(); }}
              style={{ fontSize: 12, color: 'var(--terra-text)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, touchAction: 'manipulation' }}
            >
              {isHe ? 'נסה שוב' : 'Tap to retry'}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--lg-terra)', animation: 'spin .8s linear infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{isHe ? 'טוען…' : 'Loading…'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Calendar heatmap ─────────────────────────────────────────────────────────

function CalendarHeatmap({ trip }: { trip: any }) {
  const { t, locale } = useI18n();
  if (!trip?.startDate) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const cells = Array.from({ length: trip.days }, (_, i) => {
    const dt = new Date(new Date(trip.startDate + 'T00:00:00').getTime() + i * 86_400_000);
    const count = (trip.events[i + 1] ?? []).length;
    const isPast = dt < today;
    const isToday = dt.getTime() === today.getTime();
    return { dt, count, isPast, isToday };
  });

  const calLocale = locale === 'he' ? 'he-IL' : 'en-US';

  // Group by month
  const months: Record<string, typeof cells> = {};
  cells.forEach(c => {
    const key = c.dt.toLocaleDateString(calLocale, { month: 'short', year: 'numeric' });
    if (!months[key]) months[key] = [];
    months[key].push(c);
  });

  const heatColor = (count: number, isPast: boolean) => {
    if (isPast) return 'oklch(50% 0.02 60 / 20%)';
    if (count === 0) return 'oklch(50% 0.02 60 / 12%)';
    if (count <= 2)  return 'oklch(58% 0.12 148 / 55%)';
    if (count <= 4)  return 'oklch(52% 0.15 148 / 75%)';
    return 'var(--lg-forest)';
  };

  return (
    <div>
      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>{t('tripCalendarLabel')}</p>
      {Object.entries(months).map(([month, mCells]) => (
        <div key={month} className="lg a-rise" style={{ padding: '12px 14px', marginBottom: 10 }}>
          <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 8, fontSize: 8.5 }}>{month}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {mCells.map(({ dt, count, isPast, isToday }) => (
              <div
                key={dt.toISOString()}
                title={`${dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${count} event${count !== 1 ? 's' : ''}`}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: heatColor(count, isPast),
                  border: isToday ? '2px solid var(--lg-terra)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: count > 0 && !isPast ? '#fff' : 'var(--text-3)', lineHeight: 1 }}>
                  {dt.getDate()}
                </span>
                {count > 0 && (
                  <span style={{ fontSize: 8, color: count > 0 && !isPast ? 'rgba(255,255,255,0.75)' : 'var(--text-3)', lineHeight: 1 }}>
                    {count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Budget breakdown charts ───────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  food:       '#C4714A',        // terra
  cafe:       '#C8944A',        // sand
  transport:  '#3B6E52',        // forest
  flight:     '#2B7A8E',        // sky
  attraction: '#E05A3A',        // terra-bright
  hotel:      '#B45309',        // amber
  shopping:   '#7A8447',        // olive
  beach:      '#1E91AF',        // sky-bright
  nightlife:  '#D4531A',        // rust
  museum:     '#2B8A6E',        // forest-deep
  hiking:     '#2B5340',        // forest-dark
  other:      '#8A8070',        // warm gray
};
const catColor = (c: string) => CAT_COLORS[c] ?? '#888';

function BudgetBreakdown({ trip, currSym, expenses }: {
  trip: any; currSym: string; expenses: any[];
}) {
  const { locale } = useI18n();
  const isHe = locale === 'he';

  // Per-day event costs
  const dayTotals: { day: number; amount: number }[] = [];
  for (let d = 1; d <= trip.days; d++) {
    const dayAmt = (trip.events[d] ?? []).reduce((s: number, ev: any) => s + (ev.cost ?? 0), 0);
    if (dayAmt > 0) dayTotals.push({ day: d, amount: dayAmt });
  }

  // Category totals (events + expenses keyword match)
  const catTotals: Record<string, number> = {};
  for (let d = 1; d <= trip.days; d++) {
    for (const ev of trip.events[d] ?? []) {
      if (ev.cost > 0) catTotals[ev.category] = (catTotals[ev.category] ?? 0) + ev.cost;
    }
  }
  // Bucket manual expenses into 'other'
  const manualTotal = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  if (manualTotal > 0) catTotals['manual'] = (catTotals['manual'] ?? 0) + manualTotal;

  const topCats = Object.entries(catTotals).sort(([, a], [, b]) => b - a).slice(0, 6);
  const catTotal = topCats.reduce((s, [, v]) => s + v, 0);
  const maxDay   = Math.max(...dayTotals.map(d => d.amount), 1);

  if (catTotal === 0 && dayTotals.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Category stacked bar */}
      {catTotal > 0 && (
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', margin: '0 0 8px', fontWeight: 600 }}>
            {isHe ? 'לפי קטגוריה' : 'By category'}
          </p>
          {/* Stacked bar */}
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
            {topCats.map(([cat, val]) => (
              <div key={cat} style={{ width: `${(val / catTotal) * 100}%`, background: cat === 'manual' ? '#999' : catColor(cat), transition: 'width .4s' }} />
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
            {topCats.map(([cat, val]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: cat === 'manual' ? '#999' : catColor(cat), flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontWeight: 500 }}>
                  {cat === 'manual' ? (isHe ? 'הוצאות' : 'Expenses') : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)' }}>
                  {currSym}{val.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-day bars */}
      {dayTotals.length > 1 && (
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', margin: '0 0 8px', fontWeight: 600 }}>
            {isHe ? 'לפי יום' : 'By day'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {dayTotals.map(({ day, amount }) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', width: 28, flexShrink: 0 }}>
                  D{day}
                </span>
                <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'var(--lg-panel)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(amount / maxDay) * 100}%`, height: '100%', borderRadius: 4,
                    background: `var(--lg-terra)`, transition: 'width .4s',
                  }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', width: 52, textAlign: 'end', flexShrink: 0 }}>
                  {currSym}{amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Expense manager ───────────────────────────────────────────────────────────

function ExpenseSheet({ trip, currSym, currCode, onClose, onAddBudget }: {
  trip: any; currSym: string; currCode: string; onClose: () => void; onAddBudget: (v: number) => void;
}) {
  const { addExpense, deleteExpense } = useAppStore();
  const { t, locale } = useI18n();
  const isHe = locale === 'he';
  const { show } = useToast();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [budgetVal, setBudgetVal] = useState(trip?.budget ? String(trip.budget) : '');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleScanReceipt = async (file: File) => {
    setScanning(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res  = await fetch('/api/ai/scan-receipt', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageBase64: base64, mediaType: file.type }),
      });
      const data = await res.json() as { description?: string; amount?: number; error?: string };
      if (data.error) { show(isHe ? 'לא ניתן לקרוא את הקבלה' : 'Could not read receipt'); return; }
      if (data.description) setDesc(data.description);
      if (data.amount)      setAmount(String(data.amount));
      show(isHe ? 'קבלה נסרקה!' : 'Receipt scanned!');
    } catch {
      show(isHe ? 'שגיאה בסריקה' : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const expenses = trip?.expenses ?? [];
  const manualTotal  = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const eventsCostLocal = Object.values(trip?.events ?? {}).reduce((sum: number, evs: any) => {
    return sum + (evs as any[]).reduce((s: number, ev: any) => s + (ev.cost ?? 0), 0);
  }, 0);
  const hotelsCostLocal = (trip?.hotels ?? []).reduce((s: number, h: any) => s + (h.cost ?? 0), 0);
  const total = manualTotal + eventsCostLocal + hotelsCostLocal;
  const remaining = trip?.budget != null ? trip.budget - total : null;
  const pct = trip?.budget ? Math.min(1, total / trip.budget) : 0;
  const statusColor = pct > 0.9 ? 'var(--danger)' : pct > 0.7 ? 'oklch(70% 0.18 68)' : 'var(--lg-forest)';

  const handleAdd = () => {
    const n = parseFloat(amount);
    if (!desc.trim() || isNaN(n) || n <= 0) { show(t('validExpenseError')); return; }
    addExpense({ description: desc.trim(), amount: n, paidBy: t('youLabel'), splitCount: 1, tags: tags.length ? tags : undefined });
    setDesc(''); setAmount(''); setTags([]);
    show(t('expenseAdded'));
  };

  return (
    <Sheet title={isHe ? 'תקציב / הוצאות' : 'Budget / Expenses'} onClose={onClose}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Visual summary ring ── */}
        <div className="lg" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Mini ring */}
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={32} cy={32} r={26} fill="none" stroke="oklch(50% 0.02 60 / 12%)" strokeWidth={7} />
              <circle
                cx={32} cy={32} r={26} fill="none"
                stroke={statusColor}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={`${Math.round(pct * 163.36)} 163.36`}
                style={{ transition: 'stroke-dasharray .5s ease, stroke .3s' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: statusColor }}>
              {Math.round(pct * 100)}%
            </div>
          </div>
          {/* Key numbers */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{isHe ? 'הוצאות' : 'Spent'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--lg-ink)' }}>{currSym}{total.toLocaleString()}</span>
            </div>
            {remaining !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{remaining >= 0 ? (isHe ? 'נותר' : 'Left') : (isHe ? 'חריגה' : 'Over')}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: statusColor }}>{currSym}{Math.abs(remaining).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{isHe ? 'תקציב' : 'Budget'}</span>
              {trip?.budget
                ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text-2)' }}>{currSym}{trip.budget.toLocaleString()}</span>
                : <button
                    onClick={() => setShowBudgetInput(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--terra-text)', padding: 0 }}
                  >
                    + {isHe ? 'הגדר' : 'Set'}
                  </button>
              }
            </div>
          </div>
        </div>

        {/* ── Change budget button ── */}
        {trip?.budget && !showBudgetInput && (
          <button
            onClick={() => setShowBudgetInput(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textAlign: 'start', padding: '0 2px', alignSelf: 'flex-start', textDecoration: 'underline' }}
          >
            {isHe ? 'שנה תקציב' : 'Change budget limit'}
          </button>
        )}

        {/* ── Budget limit input (collapsible) ── */}
        {showBudgetInput && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Field label={`${isHe ? 'סכום תקציב' : 'Budget limit'} (${currSym})`} placeholder="0" value={budgetVal} onChange={v => setBudgetVal(v.replace(/[^0-9.]/g, ''))} type="number" min="0" inputMode="decimal" autoFocus />
            </div>
            <button
              onClick={() => {
                const n = parseFloat(budgetVal);
                if (!isNaN(n) && n > 0) { onAddBudget(n); show(t('budgetSavedToast')); setShowBudgetInput(false); }
              }}
              style={{ height: 48, padding: '0 16px', border: 0, borderRadius: 14, background: 'var(--lg-forest)', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: 'var(--lg-glow-forest)', flexShrink: 0 }}
            >
              {t('saveBtn')}
            </button>
            <button
              onClick={() => setShowBudgetInput(false)}
              style={{ height: 48, padding: '0 12px', border: 0, borderRadius: 14, background: 'var(--lg-panel)', color: 'var(--text-2)', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
              {t('cancel')}
            </button>
          </div>
        )}

        {/* ── Category breakdown ── */}
        <BudgetBreakdown trip={trip} currSym={currSym} expenses={expenses} />

        {/* ── Quick add expense ── */}
        <div style={{ background: 'var(--lg-panel)', borderRadius: 18, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 9, margin: 0 }}>{isHe ? 'הוסף הוצאה' : 'Add expense'}</p>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={scanning}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 0, cursor: scanning ? 'wait' : 'pointer', color: 'var(--terra-text)', fontWeight: 600, fontSize: 12, padding: '3px 6px', borderRadius: 8, opacity: scanning ? 0.5 : 1 }}
              title={isHe ? 'סרוק קבלה' : 'Scan receipt'}
            >
              {scanning
                ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--lg-terra)', animation: 'spin .8s linear infinite' }} />
                : <Icon name="camera" size={14} color="var(--lg-terra)" />}
              {isHe ? 'סרוק' : 'Scan'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleScanReceipt(f); e.target.value = ''; }} />
          {/* Inline row: desc + amount + add */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <Field label={isHe ? 'תיאור' : 'What for?'} placeholder={isHe ? 'קפה, מונית…' : 'Coffee, taxi…'} value={desc} onChange={setDesc} />
            </div>
            <div style={{ flex: 1 }}>
              <Field label={currSym} placeholder="0" value={amount} onChange={setAmount} type="number" />
            </div>
            <button
              onClick={handleAdd}
              style={{ height: 48, width: 48, flexShrink: 0, border: 0, borderRadius: 14, background: 'var(--lg-forest)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--lg-glow-forest)' }}
              aria-label={isHe ? 'הוסף' : 'Add'}
            >
              <Icon name="plus" size={20} color="#fff" />
            </button>
          </div>

          {/* Tag chips — categorise the spend (multi-select, optional) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {EXPENSE_TAGS.map(tg => {
              const label = isHe ? tg.he : tg.en;
              const on = tags.includes(tg.en);
              return (
                <button
                  key={tg.en}
                  type="button"
                  onClick={() => setTags(ts => on ? ts.filter(x => x !== tg.en) : [...ts, tg.en])}
                  aria-pressed={on}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 11px', borderRadius: 9999, cursor: 'pointer',
                    border: on ? '1px solid var(--lg-terra)' : '1px solid var(--border)',
                    background: on ? 'var(--terra-muted)' : 'transparent',
                    color: on ? 'var(--terra-text)' : 'var(--text-3)',
                    fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span aria-hidden>{tg.emoji}</span>{label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Expense list ── */}
        {expenses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 9, margin: 0 }}>{isHe ? 'היסטוריה' : 'History'}</p>
            {expenses.map((exp: any) => (
              <div key={exp.id} className="lg" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</div>
                  {Array.isArray(exp.tags) && exp.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {exp.tags.map((tg: string) => (
                        <span key={tg} style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--terra-text)', background: 'var(--terra-muted)', padding: '2px 7px', borderRadius: 9999 }}>
                          {tagLabel(tg, isHe)}
                        </span>
                      ))}
                    </div>
                  )}
                  {exp.paidBy && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{exp.paidBy}</div>}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--lg-ink)', flexShrink: 0 }}>
                  {currSym}{exp.amount.toLocaleString()}
                </span>
                <button onClick={() => { deleteExpense(exp.id); show(t('expenseRemovedToast')); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, opacity: 0.5, transition: 'opacity .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                  aria-label={t('deleteExpenseLabel')}
                >
                  <Icon name="trash" size={14} color="var(--danger)" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}

// ── Day date label ────────────────────────────────────────────────────────────

function dayDateLabel(startDate: string | undefined, dayNum: number): { top: string; bottom: string } {
  if (!startDate) return { top: 'DAY', bottom: String(dayNum) };
  const dt = new Date(new Date(startDate + 'T00:00:00').getTime() + (dayNum - 1) * 86_400_000);
  return {
    top: dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    bottom: String(dt.getDate()),
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardScreenV2() {
  const { trip, setScreen, setActiveDay, supplies, tripDbId, currencyByTrip, setTripBudget, createInviteLink } = useAppStore();
  const { t, locale } = useI18n();
  const { show } = useToast();

  const [weatherResult, setWeatherResult] = useState<WeatherResult>({ days: [], isEstimate: false });
  const [localTime, setLocalTime] = useState('');
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sharingLink, setSharingLink] = useState(false);
  const [coachAdvice,  setCoachAdvice]  = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  // ── Derived date values ──────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDate = trip?.startDate ? new Date(trip.startDate + 'T00:00:00') : null;
  const endDate   = startDate ? new Date(startDate.getTime() + ((trip?.days ?? 0) - 1) * 86_400_000) : null;
  const daysUntil = startDate ? Math.round((startDate.getTime() - today.getTime()) / 86_400_000) : null;
  const currentTripDay =
    startDate && endDate && today >= startDate && today <= endDate
      ? Math.round((today.getTime() - startDate.getTime()) / 86_400_000) + 1
      : null;
  const currentDisplayDay = currentTripDay ?? 1;

  // ── Destination city + timezone ──────────────────────────────────────
  const destTimezone = trip
    ? (() => {
        for (const ev of Object.values(trip.events).flat()) {
          if ((ev as any).timezone) return (ev as any).timezone as string;
        }
        if (trip.countries?.[0]) {
          const tz = getTimezoneForCountry(trip.countries[0]);
          if (tz) return tz;
        }
        return null;
      })()
    : null;

  const destCity = trip?.dayMeta?.[0]?.region || trip?.countries?.[0] || trip?.name || '';

  // ── Weather fetch ────────────────────────────────────────────────────
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
          if ((ev as any).lat && (ev as any).lng && !isDefaultIsrael((ev as any).lat, (ev as any).lng)) {
            lat = (ev as any).lat; lng = (ev as any).lng; break outer;
          }
        }
      }
    }
    if (!lat && trip.countries?.length) {
      const capital = getCapitalCoords(trip.countries[0]);
      if (capital) { lat = capital.lat; lng = capital.lng; }
    }
    if (!lat || !lng) return;
    fetchWeatherForTrip(lat, lng, trip.startDate, trip.days)
      .then(setWeatherResult)
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.startDate, trip?.days, trip?.countries?.join(',')]);

  // ── Live local time clock (30 s tick) ────────────────────────────────
  useEffect(() => {
    if (!destTimezone) return;
    const tick = () => {
      try {
        setLocalTime(
          new Intl.DateTimeFormat('en', {
            timeZone: destTimezone, hour: '2-digit', minute: '2-digit', hour12: false,
          }).format(new Date()),
        );
      } catch {}
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [destTimezone]);

  if (!trip) return null;

  // ── Helpers ──────────────────────────────────────────────────────────
  const handleDayClick = (day: number) => { setActiveDay(day); setScreen('day'); };

  const currency  = (tripDbId && currencyByTrip[tripDbId]) || 'USD';
  const currSym   = getCurrencySymbol(currency);
  const expenses  = trip.expenses ?? [];
  const eventsCost = Object.values(trip.events).reduce((sum, evs) => sum + getDayBudget(evs), 0);
  const hotelsCost = (trip.hotels ?? []).reduce((s, h) => s + (h.cost ?? 0), 0);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0) + eventsCost + hotelsCost;

  const budgetPct           = trip.budget ? Math.min(1, totalSpent / trip.budget) : 0;
  const budgetRemaining     = trip.budget != null ? trip.budget - totalSpent : null;
  const budgetStatusColor   = budgetPct > 0.9 ? 'var(--danger)' : budgetPct > 0.7 ? 'oklch(70% 0.18 68)' : 'var(--lg-forest)';

  const packedCount = supplies.filter(s => s.checked).length;
  const totalCount  = supplies.length;
  const packedPct   = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const nextEvent = getNextEvent(trip);
  const todayEvs  = [...(trip.events[currentDisplayDay] ?? [])].sort(
    (a, b) => toMins(a.time) - toMins(b.time),
  );

  const weather = weatherResult.days;
  const isEstimatedWeather = weatherResult.isEstimate;
  const todayWeather: WeatherDay | null = weather[currentDisplayDay - 1] ?? weather[0] ?? null;
  const isRTL = locale === 'he';

  const aiSummary = buildAiSummary(trip, supplies, totalSpent, locale);

  // ── Per-category spend (from events with cost) ───────────────────────
  const topCats = useMemo(() => {
    const cats: Record<string, number> = {};
    for (let d = 1; d <= trip.days; d++) {
      for (const ev of trip.events[d] ?? []) {
        if (ev.cost && ev.cost > 0) {
          cats[ev.category] = (cats[ev.category] ?? 0) + ev.cost;
        }
      }
    }
    return Object.entries(cats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));
  }, [trip]);

  // ── Upcoming event costs (today or future days) ──────────────────────
  const upcomingCost = useMemo(() => {
    const fromDay = currentTripDay ?? 1;
    let total = 0;
    for (let d = fromDay; d <= trip.days; d++) {
      for (const ev of trip.events[d] ?? []) {
        if (ev.cost && ev.cost > 0) total += ev.cost;
      }
    }
    return total;
  }, [trip, currentTripDay]);

  const daysLeft = currentTripDay != null ? trip.days - currentTripDay : null;

  // ── Gauge + stat-triplet derivations (HANDOFF dashboard) ─────────────
  const totalEvents = Object.values(trip.events).reduce((s, evs) => s + evs.length, 0);
  const plannedDays = Array.from({ length: trip.days }, (_, i) => i + 1)
    .filter(d => (trip.events[d]?.length ?? 0) > 0).length;
  const plannedPct = trip.days > 0 ? Math.round((plannedDays / trip.days) * 100) : 0;

  const beforeTrip  = daysUntil !== null && daysUntil > 0;
  const gaugeNumber = beforeTrip ? daysUntil : (currentTripDay ?? trip.days);
  const gaugeLabel  = beforeTrip
    ? t('daysToGo')
    : currentTripDay !== null
      ? `${t('day')} ${t('ofDays')} ${trip.days}`
      : t('days');
  const gaugePct = beforeTrip
    ? plannedPct
    : currentTripDay !== null
      ? Math.round((currentTripDay / Math.max(1, trip.days)) * 100)
      : 100;
  const gaugeArc = beforeTrip ? 'var(--terra)' : 'var(--brand)';

  // ── AI Budget Coach ──────────────────────────────────────────────────
  const fetchCoachAdvice = useCallback(async () => {
    setCoachLoading(true);
    setCoachAdvice(null);
    try {
      const res = await fetch('/api/ai/budget-coach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          tripName:     trip.name,
          currency,
          budget:       trip.budget ?? null,
          spent:        totalSpent,
          days:         trip.days,
          currentDay:   currentTripDay,
          daysLeft,
          upcomingCost,
          packedPct,
          topCats,
          locale,
        }),
      });
      const data = await res.json() as { advice?: string; error?: string };
      if (data.advice) setCoachAdvice(data.advice);
    } catch {
      // Silently fail — static summary is still shown
    } finally {
      setCoachLoading(false);
    }
  }, [trip, currency, totalSpent, currentTripDay, daysLeft, upcomingCost, packedPct, topCats, locale]);

  return (
    <div
      style={{ height: '100%', overflowY: 'auto', background: 'transparent', paddingBottom: 'var(--navbar-clearance)' }}
      className="lg-scroll"
    >
      {/* ══ Editorial hero — gauge replaces the cinematic mesh (HANDOFF) ══ */}
      <div className="resp-container" style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 20px 16px' }}>

        {/* Header: country eyebrow + bold title + glass icon buttons */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {(trip.countries?.length ?? 0) > 0 && (
              <Eyebrow style={{ marginBottom: 6 }}>{(trip.countries ?? []).join(' · ')}</Eyebrow>
            )}
            <h1 className="text-display-sm" dir="auto" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {trip.name}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setScreen('settings')}
              className="lg"
              style={{ width: 36, height: 36, borderRadius: '50%', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent' }}
              aria-label={t('settings')}
            >
              <Icon name="settings" size={16} color="var(--text-2)" />
            </button>
            <button
              className="lg"
              disabled={sharingLink}
              onClick={async () => {
                setSharingLink(true);
                try {
                  const link = await createInviteLink();
                  await navigator.clipboard?.writeText(link).catch(() => {});
                  show(t('inviteLinkCopied'));
                } catch { show(t('couldNotCreateInvite')); }
                finally { setSharingLink(false); }
              }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', opacity: sharingLink ? 0.6 : 1 }}
              aria-label={t('shareTrip')}
            >
              <Icon name="share" size={16} color="var(--text-2)" />
            </button>
          </div>
        </div>

        {/* Crew + live context line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {trip.participants.length > 0 && (
            <AvatarStack names={trip.participants.map(p => p.initials)} size={26} max={5} />
          )}
          {(todayWeather || localTime) && (
            <Eyebrow style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {todayWeather && (
                <>
                  <Icon name={weatherIconName(todayWeather.label)} size={12} color="var(--sand)" />
                  {todayWeather.tempMax}°{destCity ? ` · ${destCity}` : ''}
                  {isEstimatedWeather ? (locale === 'he' ? ' · הערכה' : ' · est.') : ''}
                </>
              )}
              {todayWeather && localTime ? ' · ' : ''}
              {localTime}
            </Eyebrow>
          )}
        </div>

        {/* Gauge — countdown / progress (replaces cinematic imagery) */}
        <div className="a-rise" style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <Gauge
            pct={gaugePct}
            size={212}
            arc={gaugeArc}
            number={gaugeNumber}
            label={gaugeLabel}
            status={`${plannedPct}% ${t('plannedLabel')}`}
            statusColor="var(--brand)"
            aria-label={typeof gaugeLabel === 'string' ? `${gaugeNumber} ${gaugeLabel}` : undefined}
          />
        </div>

        {/* Stat triplet */}
        <StatTriplet
          style={{ marginBottom: 18 }}
          stats={[
            { label: t('daysLabel'),     value: trip.days },
            { label: t('eventsLabel'),   value: totalEvents },
            { label: t('suppliesLabel'), value: `${packedPct}%`, tone: packedPct === 100 ? 'forest' : 'default' },
          ]}
        />

        {/* Day scroller — real dates (Aug 23, Aug 24…) */}
        <div
          className="lg-scroll a-rise d3"
          role="list"
          aria-label="Trip days"
          /* full-bleed + vertical breathing room so the active day's terra glow
             ("shine") is never clipped by the scroll container's overflow */
          style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 20px 14px', margin: '0 -20px', scrollPaddingInline: 20 }}
        >
          {Array.from({ length: Math.min(trip.days, 30) }, (_, i) => {
            const dayNum   = i + 1;
            const isActive = dayNum === currentDisplayDay;
            const { top, bottom } = dayDateLabel(trip.startDate, dayNum);
            const dayWeather = weather[i];
            return (
              <button
                key={dayNum}
                role="listitem"
                onClick={() => handleDayClick(dayNum)}
                aria-label={`${top} ${bottom}`}
                aria-pressed={isActive}
                style={{
                  flexShrink: 0, width: 54, height: dayWeather ? 74 : 62, borderRadius: 16, cursor: 'pointer',
                  border: isActive ? '1px solid var(--terra)' : '1px solid var(--border)',
                  background: isActive ? 'var(--terra)' : 'var(--surface-warm)',
                  boxShadow: isActive ? 'var(--lg-glow-terra)' : 'none',
                  color: isActive ? '#fff' : 'var(--text-2)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 1, padding: '4px 0',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, opacity: 0.85, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {top}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 19, lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {bottom}
                </span>
                {dayWeather && (
                  <span style={{ fontSize: 9, opacity: 0.85, marginTop: 1, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <Icon name={weatherIconName(dayWeather.label)} size={9} color={isActive ? '#fff' : 'var(--text-3)'} />
                    {dayWeather.tempMax}°
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Weather estimate note — sits directly under the day slider */}
        {weather.length > 0 && isEstimatedWeather && (
          <p style={{
            margin: '8px 2px 0', fontSize: 11, color: 'var(--text-3)',
            textAlign: 'start',
          }}>
            {locale === 'he'
              ? 'מזג אוויר משוער — נתונים היסטוריים מאותה עונה בשנה שעברה'
              : 'Typical weather estimate — based on historical data from the same dates last year'}
          </p>
        )}
      </div>

      {/* ══ Main content ════════════════════════════════════════════════ */}
      <div className="resp-container" style={{ padding: '0 20px', paddingBottom: 'var(--nav-total-h)' }}>
        <div className="resp-dash-grid">

        {/* ── AI Budget Coach card ── */}
        <div
          className="a-rise"
          style={{
            borderRadius: 'var(--lg-r-card)', padding: 16,
            background: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))',
            boxShadow: 'var(--lg-glow-forest)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div aria-hidden style={{ position: 'absolute', top: -20, insetInlineEnd: -10, opacity: 0.14, pointerEvents: 'none' }}>
            <Icon name="sparkle" size={90} color="#fff" />
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name="ai" size={16} color="var(--lg-sand)" />
              <span className="eyebrow-lg" style={{ color: 'var(--lg-sand)' }}>
                {coachAdvice ? (isRTL ? 'עצות לדרך' : 'Travel tips') : t('aiAnalysisLabel')}
              </span>
            </div>
            {/* Refresh button — shown once advice is loaded */}
            {coachAdvice && !coachLoading && (
              <button
                onClick={fetchCoachAdvice}
                aria-label="Refresh advice"
                style={{ background: 'rgba(255,255,255,.15)', border: 0, borderRadius: 9999, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Icon name="swap" size={13} color="#fff" />
              </button>
            )}
          </div>

          {/* Body text */}
          {coachLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', animation: 'spin .8s linear infinite', flexShrink: 0 }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontStyle: 'italic' }}>
                {isRTL ? 'חושב על עצות לדרך…' : 'Looking at your trip…'}
              </span>
            </div>
          ) : (
            <p style={{ fontSize: 14, lineHeight: 1.65, color: '#fff', fontWeight: 500, margin: 0 }}>
              {coachAdvice ?? aiSummary}
            </p>
          )}

          {/* Footer actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            {/* Ask AI button — shown until advice is loaded */}
            {!coachAdvice && !coachLoading ? (
              <button
                onClick={fetchCoachAdvice}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,.18)', border: 0, borderRadius: 9999,
                  padding: '7px 14px', cursor: 'pointer', color: '#fff',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon name="sparkle" size={13} color="var(--lg-sand)" />
                {isRTL ? 'קבל עצות לדרך' : 'Get travel tips'}
              </button>
            ) : <span />}

            {/* View day plan link */}
            <button
              onClick={() => setScreen('day')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 0, cursor: 'pointer', color: '#fff', fontWeight: 600, fontSize: 13 }}
            >
              {t('viewSuggestions')}
              <Icon name="arrow" size={14} color="#fff" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* ── Weather alerts ── */}
        {weather.length > 0 && (
          <WeatherAlerts trip={trip} weather={weather} onGoToDay={handleDayClick} />
        )}

        {/* ── Next up ── */}
        {nextEvent && (
          <div>
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
              {t('nextEvent')}
            </p>
            <button
              className="lg a-rise d1"
              onClick={() => { setActiveDay(nextEvent.dayNum); setScreen('day'); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 15, padding: 16, cursor: 'pointer', border: 0, textAlign: 'start' }}
            >
              <StampIcon iconKey={CAT_FALLBACK[nextEvent.event.category]} size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow-lg" style={{ color: 'var(--lg-sky)', fontSize: 9 }}>
                  {t('day')} {nextEvent.dayNum}
                  {trip.startDate ? ` · ${fmtDate(trip.startDate, nextEvent.dayNum - 1, locale)}` : ''}
                  {` · ${nextEvent.event.time}`}
                  {nextEvent.event.duration
                    ? ` → ${Math.floor((toMins(nextEvent.event.time) + nextEvent.event.duration) / 60).toString().padStart(2, '0')}:${String((toMins(nextEvent.event.time) + nextEvent.event.duration) % 60).padStart(2, '0')}`
                    : ''}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--lg-ink)', lineHeight: 1.15, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t(nextEvent.event.name as any)}
                </div>
                {nextEvent.event.location && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="pin" size={12} color="var(--text-3)" />
                    {nextEvent.event.location}
                  </div>
                )}
              </div>
              <Icon name="chevR" size={20} color="var(--text-3)" style={{ flexShrink: 0, transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </button>
          </div>
        )}

        {/* ── Quick stats: Packed · Budget ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Packed */}
          <button
            className="lg a-rise d2"
            onClick={() => setScreen('supplies')}
            style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', border: 0 }}
            aria-label={`${t('suppliesLabel')}: ${packedPct}%`}
          >
            <Ring pct={packedPct} size={58} color="var(--lg-terra)">{packedPct}%</Ring>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lg-ink)' }}>
              {t('suppliesLabel')}
            </span>
          </button>

          {/* Budget — shows remaining when budget set, otherwise total spent + set CTA */}
          {/* Plain container (NOT a button): the amount is a CurrencyAmount that
              converts on tap. Editing the budget is an explicit pencil button so
              tapping to convert can never navigate to the budget editor. */}
          <div
            className="lg a-rise d3"
            style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, textAlign: 'start', minWidth: 0 }}
            aria-label={t('budgetLabel')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 9 }}>
                {trip.budget
                  ? (budgetRemaining! >= 0 ? (locale === 'he' ? 'נותר' : 'Remaining') : (locale === 'he' ? 'חריגה' : 'Over'))
                  : (locale === 'he' ? 'תקציב' : 'Budget')}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowBudgetEdit(true); }}
                aria-label={locale === 'he' ? 'ערוך תקציב' : 'Edit budget'}
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 6, margin: -6, display: 'flex', WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon name="edit" size={14} color="var(--text-3)" />
              </button>
            </div>

            {trip.budget ? (
              <>
                {/* Hero: remaining (or overage) */}
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-0.02em', fontSize: 21, color: budgetStatusColor, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  <CurrencyAmount amount={Math.abs(budgetRemaining!)} base={currency} />
                </span>
                {/* Thin progress bar */}
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(budgetPct * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={locale === 'he' ? 'שימוש בתקציב' : 'Budget usage'}
                  style={{ height: 4, borderRadius: 2, background: 'oklch(50% 0.02 60 / 14%)', overflow: 'hidden' }}
                >
                  <div style={{
                    width: `${Math.round(budgetPct * 100)}%`,
                    height: '100%',
                    background: budgetStatusColor,
                    borderRadius: 2,
                    transition: 'width .4s, background .3s',
                  }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)' }}>
                  {currSym}{totalSpent.toLocaleString()} {locale === 'he' ? 'מתוך' : 'of'} {currSym}{trip.budget.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-0.02em', fontSize: 21, color: 'var(--lg-ink)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  <CurrencyAmount amount={totalSpent} base={currency} />
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowBudgetEdit(true); }}
                  style={{ alignSelf: 'flex-start', background: 'none', border: 0, cursor: 'pointer', padding: '2px 0', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--lg-terra)', fontWeight: 700, WebkitTapHighlightColor: 'transparent' }}
                >
                  + {locale === 'he' ? 'קבע תקציב' : 'Set budget'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Today's schedule (only shown when trip is active) ── */}
        {todayEvs.length > 0 && currentTripDay !== null && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: 0 }}>
                {isRTL
                  ? `${t('todayLabel')} · ${t('day')} ${currentTripDay}`
                  : `${t('todayLabel').toUpperCase()} · ${t('day').toUpperCase()} ${currentTripDay}`}
              </p>
              <button
                onClick={() => handleDayClick(currentTripDay)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
              >
                {t('seeAll')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayEvs.slice(0, 4).map(ev => (
                <div
                  key={ev.id}
                  className="lg a-rise"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDayClick(currentTripDay)}
                  onKeyDown={e => e.key === 'Enter' && handleDayClick(currentTripDay)}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--lg-ink)', width: 40, flexShrink: 0 }}>
                    {ev.time}
                  </span>
                  <StampIcon iconKey={CAT_FALLBACK[ev.category]} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t(ev.name as any)}
                    </div>
                    {ev.location && (
                      <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Icon name="pin" size={12} color="var(--text-3)" />
                        {ev.location}
                      </div>
                    )}
                  </div>
                  {ev.duration > 0 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>
                      {fmtDuration(ev.duration)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming day preview when trip hasn't started */}
        {todayEvs.length > 0 && currentTripDay === null && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: 0 }}>
                {trip.startDate
                  ? (() => {
                      const dt = new Date(new Date(trip.startDate + 'T00:00:00').getTime() + (currentDisplayDay - 1) * 86_400_000);
                      return dt.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                    })()
                  : `${t('day')} ${currentDisplayDay}`}
              </p>
              <button
                onClick={() => handleDayClick(currentDisplayDay)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--brand)', padding: 0 }}
              >
                {t('seeAll')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayEvs.slice(0, 3).map(ev => (
                <div
                  key={ev.id}
                  className="lg a-rise"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDayClick(currentDisplayDay)}
                  onKeyDown={e => e.key === 'Enter' && handleDayClick(currentDisplayDay)}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--lg-ink)', width: 40, flexShrink: 0 }}>
                    {ev.time}
                  </span>
                  <StampIcon iconKey={CAT_FALLBACK[ev.category]} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t(ev.name as any)}
                    </div>
                    {ev.location && (
                      <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Icon name="pin" size={12} color="var(--text-3)" />
                        {ev.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty trip CTA — no events at all ── */}
        {Object.values(trip.events).every((evArr: any) => evArr.length === 0) && (
          <div
            className="lg a-rise"
            style={{ padding: '28px 20px', textAlign: 'center', borderRadius: 'var(--lg-r-card)' }}
          >
            <Icon name="compass" size={40} color="var(--text-3)" />
            <p className="text-display-sm" style={{ margin: '12px 0 6px' }}>
              {t('noActivitiesYet')}
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-3)', margin: '0 0 18px' }}>
              {t('startPlanningCta')}
            </p>
            <button
              onClick={() => { setActiveDay(1); setScreen('day'); }}
              className="lg-btn lg-btn-forest"
              style={{ height: 44, padding: '0 22px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Icon name="plus" size={16} color="#fff" />
              {t('planDay1')}
            </button>
          </div>
        )}

        {/* ── Destination Intelligence cards ── */}
        {(trip.countries ?? []).slice(0, 3).map((country: string) => (
          <DestinationIntelCard key={`${country}-${locale}`} country={country} locale={locale} />
        ))}

        {/* ── Calendar heatmap toggle ── */}
        <div>
          <button
            onClick={() => setShowCalendar(c => !c)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 8,
            }}
          >
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: 0 }}>
              {t('tripCalendarLabel')}
            </p>
            <Icon name={showCalendar ? 'chevL' : 'chevR'} size={14} color="var(--text-3)" style={{ transform: showCalendar ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .3s' }} />
          </button>
          {showCalendar && <CalendarHeatmap trip={trip} />}
        </div>

        </div>{/* /resp-dash-grid */}
      </div>

      {/* Budget / expense sheet */}
      {showBudgetEdit && (
        <ExpenseSheet
          trip={trip}
          currSym={currSym}
          currCode={currency}
          onClose={() => setShowBudgetEdit(false)}
          onAddBudget={v => setTripBudget(v)}
        />
      )}
    </div>
  );
}
