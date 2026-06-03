'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';
import Ring from '../ui/Ring';
import Sheet from '../ui/Sheet';
import Field from '../ui/Field';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';
import { fmtDate, getNextEvent, CAT_FALLBACK, fmtDuration, toMins, getDayBudget } from '@/lib/utils';
import { fetchWeatherForTrip, WeatherDay } from '@/lib/weather';
import { getCapitalCoords } from '@/lib/capitals';
import { getTimezoneForCountry } from '@/lib/countryTimezones';
import { getCurrencySymbol } from '@/lib/currency';
import CurrencyAmount from '../ui/CurrencyAmount';

const STRIPE_COLORS = ['#C4714A', '#C8944A', '#3B6E52', '#6B5CE7', '#E05A3A', '#2B8A6E', '#B45309'];

// ── Budget edit sheet ─────────────────────────────────────────────────────────

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

const WEATHER_ICONS: [RegExp, string][] = [
  [/clear|sunny/i,  '☀'],
  [/partly|cloud/i, '⛅'],
  [/rain|shower/i,  '🌧'],
  [/thunder|storm/i,'⛈'],
  [/snow/i,         '🌨'],
  [/fog|mist/i,     '🌫'],
  [/wind/i,         '💨'],
];
function weatherIcon(label?: string): string {
  if (!label) return '🌡';
  for (const [re, ic] of WEATHER_ICONS) if (re.test(label)) return ic;
  return '🌡';
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
    lines.push(`${trip.days} ימים · ${totalEvents} פעילויות מתוכננות.`);

    if (emptyDays.length > 0 && emptyDays.length <= 3) {
      const labels = emptyDays.map(d => {
        if (!trip.startDate) return `יום ${d}`;
        const dt = new Date(new Date(trip.startDate + 'T00:00:00').getTime() + (d - 1) * 86_400_000);
        return dt.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' });
      });
      lines.push(`${labels.join(', ')} ${emptyDays.length === 1 ? 'עדיין ריק' : 'עדיין ריקים'} — כדאי להוסיף פעילויות.`);
    } else if (emptyDays.length > 3) {
      lines.push(`${emptyDays.length} ימים עדיין ריקים — יש מקום להרבה הרפתקאות!`);
    }

    if (budgetPct !== null) {
      if (budgetPct > 90) lines.push('התקציב כמעט מלא — כדאי לבדוק עלויות קרובות.');
      else if (budgetPct > 70) lines.push(`${budgetPct}% מהתקציב נוצל — במסלול הנכון.`);
      else lines.push('הרבה מקום בתקציב — תיהנו!');
    }

    if (packedPct < 50 && supplies.length > 0) {
      lines.push(`הציוד ${packedPct}% ארוז — אל תשכחו את העיקריים לפני היציאה.`);
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
      lines.push(`${labels.join(', ')} ${emptyDays.length === 1 ? 'has' : 'have'} no activities yet — consider filling them in.`);
    } else if (emptyDays.length > 3) {
      lines.push(`${emptyDays.length} days still empty — plenty of room for more adventures!`);
    }

    if (budgetPct !== null) {
      if (budgetPct > 90) lines.push('Budget nearly full — review upcoming costs.');
      else if (budgetPct > 70) lines.push(`${budgetPct}% of budget used — on track.`);
      else lines.push('Plenty of budget headroom remaining.');
    }

    if (packedPct < 50 && supplies.length > 0) {
      lines.push(`Packing is ${packedPct}% done — check off essentials before departure.`);
    } else if (packedPct === 100) {
      lines.push('All packed. Ready to go!');
    }
  }

  return lines.join(' ');
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
  food: '#C4714A', cafe: '#C8944A', transport: '#3B6E52', flight: '#2B7A8E',
  attraction: '#6B5CE7', hotel: '#E05A3A', shopping: '#A03CB4', beach: '#1B6A8A',
  nightlife: '#D4531A', museum: '#2B8A6E', hiking: '#B45309', other: '#888',
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
  const { t } = useI18n();
  const { show } = useToast();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [budgetVal, setBudgetVal] = useState(trip?.budget ? String(trip.budget) : '');

  const expenses = trip?.expenses ?? [];
  const total = expenses.reduce((s: number, e: any) => s + e.amount, 0);

  const handleAdd = () => {
    const n = parseFloat(amount);
    if (!desc.trim() || isNaN(n) || n <= 0) { show(t('validExpenseError')); return; }
    addExpense({ description: desc.trim(), amount: n, paidBy: paidBy.trim() || t('youLabel'), splitCount: 1 });
    setDesc(''); setAmount(''); setPaidBy('');
    show(t('expenseAdded'));
  };

  return (
    <Sheet title={t('budgetSheetTitle')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Budget limit */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Field label={`${t('budgetLabel')} (${currSym})`} placeholder="0" value={budgetVal} onChange={setBudgetVal} type="number" />
          </div>
          <button
            onClick={() => { const n = parseFloat(budgetVal); if (!isNaN(n) && n > 0) { onAddBudget(n); show(t('budgetSavedToast')); } }}
            style={{ height: 48, padding: '0 16px', border: 0, borderRadius: 14, background: 'var(--lg-forest)', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: 'var(--lg-glow-forest)' }}
          >
            {t('setBudget')}
          </button>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{t('totalSpent')}</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--lg-ink)' }}>
            <CurrencyAmount amount={total} base={currCode} />
          </span>
        </div>

        {/* Breakdown charts */}
        <BudgetBreakdown trip={trip} currSym={currSym} expenses={expenses} />

        {/* Add expense */}
        <div style={{ padding: '12px 14px', background: 'var(--lg-panel)', borderRadius: 16 }}>
          <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10, fontSize: 9 }}>{t('addExpenseLabel')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label={t('descriptionLabel')} placeholder="Coffee, taxi…" value={desc} onChange={setDesc} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Field label={`${t('amountLabel')} (${currSym})`} placeholder="0" value={amount} onChange={setAmount} type="number" />
              <Field label={t('paidByLabel')} placeholder={t('youLabel')} value={paidBy} onChange={setPaidBy} />
            </div>
            <button
              onClick={handleAdd}
              className="lg-btn lg-btn-forest"
              style={{ height: 44, gap: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="plus" size={15} color="#fff" />
              {t('addBtn')}
            </button>
          </div>
        </div>

        {/* Expense list */}
        {expenses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 9 }}>{t('expenseHistoryLabel')}</p>
            {expenses.map((exp: any) => (
              <div key={exp.id} className="lg" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{exp.paidBy}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--lg-ink)', flexShrink: 0 }}>
                  <CurrencyAmount amount={exp.amount} base={currCode} />
                </span>
                <button
                  onClick={() => { deleteExpense(exp.id); show(t('expenseRemovedToast')); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  aria-label={t('deleteExpenseLabel')}
                >
                  <Icon name="trash" size={15} color="var(--danger)" />
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

  const [weather, setWeather] = useState<WeatherDay[]>([]);
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
      .then(setWeather)
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
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0) + eventsCost;

  const packedCount = supplies.filter(s => s.checked).length;
  const totalCount  = supplies.length;
  const packedPct   = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const nextEvent = getNextEvent(trip);
  const todayEvs  = [...(trip.events[currentDisplayDay] ?? [])].sort(
    (a, b) => toMins(a.time) - toMins(b.time),
  );

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
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}
      className="lg-scroll"
    >
      {/* ══ Cinematic hero ══════════════════════════════════════════════ */}
      <div
        className="hero-mesh"
        style={{
          padding: 'calc(env(safe-area-inset-top, 0px) + 52px) 22px 22px',
          borderRadius: '0 0 34px 34px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 18,
        }}
      >
        {/* Soft terra radial glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: -40, insetInlineEnd: -30,
            width: 'clamp(140px, 35vw, 220px)', height: 'clamp(140px, 35vw, 220px)', borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(62% 0.17 40 / 45%), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Inner centering wrapper */}
        <div className="resp-container">
        {/* Top row: eyebrow · settings · share · crew avatars */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <span className="eyebrow-lg" style={{ color: 'oklch(98% 0.005 80 / 72%)' }}>
            {currentTripDay !== null
              ? `${t('day').toUpperCase()} ${currentTripDay}`
              : daysUntil !== null && daysUntil > 0
                ? (isRTL ? `בעוד ${daysUntil} ${t('days')}` : `IN ${daysUntil} ${t('days').toUpperCase()}`)
                : t('activeTrip').toUpperCase()}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setScreen('settings')}
              className="lg-dark"
              style={{ width: 34, height: 34, borderRadius: '50%', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent' }}
              aria-label="Settings"
            >
              <Icon name="settings" size={16} color="#fff" />
            </button>
            <button
              className="lg-dark"
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
              style={{ width: 34, height: 34, borderRadius: '50%', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', opacity: sharingLink ? 0.6 : 1 }}
              aria-label="Share trip"
            >
              <Icon name="share" size={16} color="#fff" />
            </button>
            <div role="list" aria-label="Crew" style={{ display: 'flex', alignItems: 'center' }}>
              {trip.participants.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  role="listitem"
                  title={p.initials}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: p.color ?? STRIPE_COLORS[i % STRIPE_COLORS.length],
                    color: 'white', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid oklch(20% 0.03 60)',
                    marginInlineStart: i > 0 ? -8 : 0,
                    boxShadow: 'var(--lg-shadow)', letterSpacing: '-0.02em', flexShrink: 0,
                  }}
                >
                  {p.initials}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trip name */}
        <div style={{ marginTop: 24, position: 'relative' }}>
          {(trip.countries?.length ?? 0) > 0 && (
            <p className="eyebrow-lg a-rise" style={{ color: 'var(--lg-sand)', margin: '0 0 4px' }}>
              {(trip.countries ?? []).join(' · ')}
            </p>
          )}
          <h1
            className="display-xl a-rise d1"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 3.2rem)', color: '#fff', margin: 0 }}
          >
            {trip.name}
          </h1>

          {/* Status chips */}
          <div className="a-rise d2" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {daysUntil !== null && daysUntil > 0 && (
              <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}>
                <span aria-hidden style={{ width: 7, height: 7, borderRadius: 9, background: 'var(--lg-terra-bright)', boxShadow: '0 0 8px var(--lg-terra-bright)', flexShrink: 0 }} />
                {daysUntil} {t('days')}
              </span>
            )}
            {currentTripDay !== null && (
              <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}>
                <span aria-hidden style={{ width: 7, height: 7, borderRadius: 9, background: 'var(--lg-terra-bright)', boxShadow: '0 0 8px var(--lg-terra-bright)', flexShrink: 0 }} />
                {t('day')} {currentTripDay} {t('ofDays')} {trip.days}
              </span>
            )}
            {todayWeather && (
              <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}>
                <Icon name="sun" size={14} color="var(--lg-sand)" />
                {todayWeather.tempMax}° · {destCity}
              </span>
            )}
            {localTime && (
              <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 12 }}>
                <Icon name="clock" size={12} color="oklch(98% 0.005 80 / 72%)" />
                {localTime}
              </span>
            )}
          </div>
        </div>

        {/* Day journey scroller — shows real dates (Aug 23, Aug 24…) */}
        <div
          className="lg-scroll a-rise d3"
          role="list"
          aria-label="Trip days"
          style={{ display: 'flex', gap: 8, marginTop: 20, overflowX: 'auto', paddingBottom: 2 }}
        >
          {Array.from({ length: Math.min(trip.days, 30) }, (_, i) => {
            const dayNum  = i + 1;
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
                  flexShrink: 0, width: 54, height: dayWeather ? 74 : 62, borderRadius: 16, border: 0, cursor: 'pointer',
                  background: isActive
                    ? 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))'
                    : 'oklch(100% 0 0 / 12%)',
                  boxShadow: isActive ? 'var(--lg-glow-terra)' : 'inset 0 0 0 1px oklch(100% 0 0 / 14%)',
                  color: '#fff',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 1, backdropFilter: 'blur(10px)',
                  WebkitTapHighlightColor: 'transparent',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {top}
                </span>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, lineHeight: 1 }}>
                  {bottom}
                </span>
                {dayWeather && (
                  <span style={{ fontSize: 9, opacity: 0.85, marginTop: 1 }}>
                    {weatherIcon(dayWeather.label)} {dayWeather.tempMax}°
                  </span>
                )}
              </button>
            );
          })}
        </div>
        </div>{/* /resp-container */}
      </div>

      {/* ══ Main content ════════════════════════════════════════════════ */}
      <div className="resp-container" style={{ padding: '0 20px', paddingBottom: 110 }}>
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
                {coachAdvice ? (isRTL ? 'יועץ תקציב' : 'Budget Coach') : t('aiAnalysisLabel')}
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
                {isRTL ? 'מנתח את התקציב שלך…' : 'Analysing your trip…'}
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
                {isRTL ? 'קבל ייעוץ AI' : 'Get AI coaching'}
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
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--lg-ink)', lineHeight: 1.05, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

          {/* Budget — tap to open full expense manager */}
          {/* div+role instead of button because CurrencyAmount renders its own <button> inside */}
          <div
            role="button"
            tabIndex={0}
            className="lg a-rise d3"
            onClick={() => setShowBudgetEdit(true)}
            onKeyDown={e => e.key === 'Enter' && setShowBudgetEdit(true)}
            style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, cursor: 'pointer', textAlign: 'start' }}
            aria-label={t('budgetLabel')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 9 }}>
                {t('budgetLabel')}
              </span>
              <Icon name="edit" size={12} color="var(--text-3)" />
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--lg-ink)', lineHeight: 1 }}>
              <CurrencyAmount amount={totalSpent} base={currency} />
            </span>
            {trip.budget ? (
              <>
                <div style={{ height: 6, borderRadius: 3, background: 'oklch(50% 0.02 60 / 14%)', overflow: 'hidden', marginTop: 4 }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.round((totalSpent / trip.budget) * 100))}%`,
                      height: '100%',
                      background: totalSpent / trip.budget > 0.9 ? 'var(--danger)' : 'var(--lg-terra)',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)' }}>
                  {t('of')} <CurrencyAmount amount={trip.budget} base={currency} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 400 }} />
                </span>
              </>
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)' }}>
                {t('tapToSetLimit')}
              </span>
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
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--lg-ink)', margin: '12px 0 6px' }}>
              {t('noActivitiesYet')}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 18px' }}>
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
