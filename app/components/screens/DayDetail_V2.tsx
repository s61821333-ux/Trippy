'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';
import Sheet from '../ui/Sheet';
import Field from '../ui/Field';
import PlacesInput from '../ui/PlacesInput';
import { useAppStore } from '@/lib/store';
import { CAT_META, CAT_FALLBACK, fmtDuration, toMins, toTime, getDayBudget } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/currency';
import { catStamp } from '@/lib/categoryStamp';
import { Category, HotelStay, TripEvent } from '@/lib/types';
import { useToast } from '../ui/Toast';
import { AISheet } from '../Sheets_V2';
import { useI18n } from '@/lib/i18n';
import { getCapitalCoords } from '@/lib/capitals';

/* ── HotelAnchor ─────────────────────────────────────────────────── */
function HotelAnchor({ hotel, isEnd }: { hotel: HotelStay | null; isEnd?: boolean }) {
  const { locale } = useI18n();
  const eyebrow = isEnd
    ? (locale === 'he' ? "צ'ק-אאוט" : 'Checkout')
    : (locale === 'he' ? 'לינה' : 'Stay');

  return (
    <div
      className="lg lg-strong"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', margin: '0 20px',
      }}
    >
      <StampIcon iconKey="hotel" size={34} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          className="eyebrow-lg"
          style={{ color: 'var(--text-3)', fontSize: 8.5, display: 'block', marginBottom: 1 }}
        >
          {eyebrow}
        </span>
        <p style={{
          fontSize: 13.5, fontWeight: 600, color: 'var(--lg-ink)',
          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {hotel ? hotel.location : (locale === 'he' ? 'הוסף מלון' : 'Add hotel / accommodation')}
        </p>
      </div>
      <Icon name="pin" size={15} color="var(--text-3)" />
    </div>
  );
}

/* ── QuickAction ─────────────────────────────────────────────────── */
function QuickAction({ icon, label, onClick, color }: {
  icon: string; label: string; onClick: () => void; color: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      style={{
        height: 38, padding: '0 12px', gap: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        background: 'var(--lg-panel-strong)',
        color: 'var(--lg-ink)',
        border: 'none', borderRadius: 9999, cursor: 'pointer',
        boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Icon name={icon as any} size={15} color={color} />
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </motion.button>
  );
}

/* ── EventAccordion ──────────────────────────────────────────────── */
function EventAccordion({ event, index, onEdit, onSuggest }: {
  event: TripEvent;
  index: number;
  onEdit: (e: TripEvent) => void;
  onSuggest: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { t, locale } = useI18n();
  const { color } = catStamp(event.category);
  const { label } = CAT_META[event.category];
  const stampKey = CAT_FALLBACK[event.category];
  const endT = toTime(toMins(event.time) + event.duration);

  return (
    <div
      className="lg a-rise"
      style={{
        animationDelay: `${index * 0.05}s`,
        borderInlineStart: `3px solid ${color}`,
        margin: '0 20px',
      }}
    >
      {/* Collapsed row */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 13,
          padding: 14, border: 0, background: 'transparent',
          cursor: 'pointer', textAlign: 'start',
        }}
      >
        {/* Time / end stack */}
        <div style={{ flex: 'none', textAlign: 'center', width: 42 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--lg-ink)' }}>
            {event.time}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>
            {endT}
          </div>
        </div>

        {/* Stamp */}
        <StampIcon iconKey={stampKey} size={42} style={{ flexShrink: 0 }} />

        {/* Title + location + category pill */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15.5, fontWeight: 600, color: 'var(--lg-ink)',
            letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {t(event.name as any)}
          </div>
          {event.location && (
            <div style={{
              fontSize: 12.5, color: 'var(--text-3)', marginTop: 2,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icon name="pin" size={12} color="var(--text-3)" />
              {event.location}
            </div>
          )}
          <span style={{
            display: 'inline-block', marginTop: 8,
            fontFamily: 'var(--font-mono)', fontSize: 9,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color, background: `${color}1f`,
            padding: '3px 9px', borderRadius: 9999,
          }}>
            {label}
          </span>
        </div>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          style={{ alignSelf: 'center', display: 'flex', flexShrink: 0 }}
        >
          <Icon name="chevR" size={18} color="var(--text-3)" />
        </motion.span>
      </button>

      {/* Expanded body — max-height spring per spec */}
      <div style={{
        maxHeight: open ? 320 : 0,
        overflow: 'hidden',
        transition: 'max-height .4s var(--snap)',
      }}>
        <div style={{ padding: '0 14px 14px' }}>
          {/* Divider */}
          <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 12%)', margin: '0 0 12px' }} />

          {/* Duration + Cost stats */}
          <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
            <div>
              <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>
                {locale === 'he' ? 'משך' : 'Duration'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>
                {event.time}–{endT}
              </div>
            </div>
            {event.cost != null && event.cost > 0 && (
              <div>
                <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>
                  {locale === 'he' ? 'עלות' : 'Cost'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>
                  ${event.cost}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {event.notes && (
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)', margin: '0 0 14px' }}>
              {event.notes}
            </p>
          )}

          {/* Quick-action rail */}
          <div className="lg-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            <QuickAction
              icon="edit"
              label={locale === 'he' ? 'עריכה מהירה' : 'Quick edit'}
              color="var(--lg-forest)"
              onClick={() => { setOpen(false); onEdit(event); }}
            />
            <QuickAction
              icon="clock"
              label={locale === 'he' ? 'שינוי זמן' : 'Reschedule'}
              color="var(--lg-terra)"
              onClick={() => { setOpen(false); onEdit(event); }}
            />
            <QuickAction
              icon="sparkle"
              label={locale === 'he' ? 'הצע בקרבת מקום' : 'Suggest nearby'}
              color="var(--lg-sand)"
              onClick={() => { setOpen(false); onSuggest(); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Timeline view — 2h ticks, per spec ─────────────────────────── */
function TimelineView({ events }: { events: TripEvent[] }) {
  const TICK_H = 52;
  const TICKS = 13;

  return (
    <div style={{ position: 'relative', paddingInlineStart: 66, paddingInlineEnd: 20, paddingBottom: 130 }}>
      {/* 2-hour ruler */}
      {Array.from({ length: TICKS }).map((_, h) => {
        const hr = h * 2;
        return (
          <div
            key={h}
            style={{ position: 'relative', height: TICK_H, borderTop: '1px solid oklch(50% 0.02 60 / 10%)' }}
          >
            <span style={{
              position: 'absolute', insetInlineStart: -46, top: -7,
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)',
              width: 40, textAlign: 'end',
            }}>
              {String(hr).padStart(2, '0')}:00
            </span>
          </div>
        );
      })}

      {/* Event blocks sized by duration */}
      {events.map((ev, i) => {
        const { color } = catStamp(ev.category);
        const startHr = toMins(ev.time) / 60;
        const durHrs = ev.duration / 60;
        const top = (startHr / 2) * TICK_H;
        const height = Math.max((durHrs / 2) * TICK_H, 40);

        return (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, delay: i * 0.07 }}
            className="a-pop"
            style={{
              position: 'absolute',
              insetInlineStart: 46,
              insetInlineEnd: 20,
              top,
              height,
              borderRadius: 14,
              padding: '8px 12px',
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              color: '#fff',
              boxShadow: `0 6px 18px ${color}55`,
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>{ev.name}</div>
            <div style={{ fontSize: 10, opacity: 0.85, fontFamily: 'var(--font-mono)' }}>
              {ev.time}–{toTime(toMins(ev.time) + ev.duration)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── AddEventSheet ───────────────────────────────────────────────── */
const CATS: [Category, string][] = [
  ['flight', 'plane'], ['transport', 'swap'], ['rest', 'tent'],
  ['hotel', 'home'], ['attraction', 'pin'], ['cafe', 'water'],
  ['food', 'wind'], ['beach', 'sun'], ['sport', 'users'], ['other', 'sparkle'],
];

const DUR_LABELS = ['30m', '1h', '1h 30m', '2h', '3h'];
const DUR_MINS: Record<string, number> = { '30m': 30, '1h': 60, '1h 30m': 90, '2h': 120, '3h': 180 };

function AddEventSheet({ onClose, editing, defaultTime, dayLabel }: {
  onClose: () => void;
  editing: TripEvent | null;
  defaultTime: string;
  dayLabel: string;
}) {
  const { addEvent, editEvent, activeDay } = useAppStore();
  const { show } = useToast();
  const { locale } = useI18n();

  const [name, setName] = useState(editing?.name ?? '');
  const [time, setTime] = useState(editing?.time ?? defaultTime);
  const [durPreset, setDurPreset] = useState(() => {
    if (!editing) return '1h';
    return Object.entries(DUR_MINS).find(([, v]) => v === editing.duration)?.[0] ?? '1h';
  });
  const [cat, setCat] = useState<Category>(editing?.category ?? 'attraction');
  const [loc, setLoc] = useState(editing?.location ?? '');
  const [lat, setLat] = useState<number | undefined>(editing?.lat);
  const [lng, setLng] = useState<number | undefined>(editing?.lng);
  const [cost, setCost] = useState(editing?.cost != null ? String(editing.cost) : '');

  const handleSave = () => {
    if (!name.trim()) {
      show(locale === 'he' ? 'הכנס שם לאירוע' : 'Enter an event name');
      return;
    }
    const dur = DUR_MINS[durPreset] ?? 60;
    const costVal = cost.trim() ? parseFloat(cost) : undefined;
    const payload = {
      time, duration: dur, name, category: cat,
      location: loc || undefined, lat, lng,
      cost: costVal != null && !isNaN(costVal) ? costVal : undefined,
    };
    if (editing) {
      editEvent(activeDay, editing.id, payload);
      show(locale === 'he' ? 'אירוע עודכן' : 'Event updated');
    } else {
      addEvent(activeDay, payload);
      show(locale === 'he' ? 'אירוע נוסף' : 'Event added');
    }
    onClose();
  };

  const monoLabel: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-3)', marginBottom: 8, fontWeight: 600,
  };

  return (
    <Sheet
      title={editing ? (locale === 'he' ? 'ערוך אירוע' : 'Edit event') : (locale === 'he' ? 'הוסף אירוע' : 'Add event')}
      subtitle={dayLabel}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field
          label={locale === 'he' ? 'שם האירוע' : 'Event name'}
          placeholder="—"
          value={name}
          onChange={setName}
          autoFocus
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <Field
            label={locale === 'he' ? 'שעת התחלה' : 'Start'}
            type="time"
            value={time}
            onChange={setTime}
          />
          <div style={{ flex: 1 }}>
            <label style={monoLabel}>{locale === 'he' ? 'משך' : 'Duration'}</label>
            <div className="lg-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
              {DUR_LABELS.map(d => (
                <button
                  key={d}
                  onClick={() => setDurPreset(d)}
                  style={{
                    flex: 'none', border: 0, cursor: 'pointer',
                    borderRadius: 12, padding: '11px 13px',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                    background: durPreset === d ? 'var(--lg-terra)' : 'var(--lg-panel)',
                    color: durPreset === d ? '#fff' : 'var(--text-2)',
                    boxShadow: durPreset === d
                      ? 'var(--lg-glow-terra)'
                      : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                    transition: 'all .25s', whiteSpace: 'nowrap',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label style={monoLabel}>{locale === 'he' ? 'קטגוריה' : 'Category'}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {CATS.map(([c, ic]) => {
              const m = CAT_META[c];
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 13px',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5,
                    background: cat === c ? 'var(--lg-forest)' : 'var(--lg-panel)',
                    color: cat === c ? '#fff' : 'var(--text-2)',
                    boxShadow: cat === c
                      ? 'var(--lg-glow-forest)'
                      : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                    transition: 'all .25s',
                  }}
                >
                  <Icon name={ic as any} size={13} color={cat === c ? '#fff' : 'var(--text-3)'} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <PlacesInput
          label={locale === 'he' ? 'מיקום (אופציונלי)' : 'Location (optional)'}
          placeholder="—"
          value={loc}
          onChange={v => { setLoc(v); setLat(undefined); setLng(undefined); }}
          onSelect={({ name: n, lat: la, lng: lo }) => { setLoc(n); setLat(la); setLng(lo); }}
        />

        <div>
          <label style={monoLabel}>{locale === 'he' ? 'עלות (אופציונלי)' : 'Cost (optional)'}</label>
          <input
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="$0"
            value={cost}
            onChange={e => setCost(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', height: 48,
              border: 0, borderRadius: 14,
              paddingInlineStart: 16, paddingInlineEnd: 16,
              fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--lg-ink)', outline: 'none',
              background: 'var(--lg-panel-strong)',
              boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
              transition: 'box-shadow .2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <GlassBtn
            variant="accent"
            size="lg"
            onClick={handleSave}
            style={{ flex: 2 }}
          >
            {editing ? (locale === 'he' ? 'שמור שינויים' : 'Save changes') : (locale === 'he' ? 'הוסף אירוע' : 'Add event')}
          </GlassBtn>
          <GlassBtn size="lg" onClick={onClose} style={{ flex: 1 }}>
            {locale === 'he' ? 'ביטול' : 'Cancel'}
          </GlassBtn>
        </div>
      </div>
    </Sheet>
  );
}

/* ── Main screen ─────────────────────────────────────────────────── */
export default function DayDetail_V2() {
  const {
    trip, activeDay, setActiveDay,
    addEvent, editEvent,
    setShowSuggestions, showSuggestions,
    dayEndHour, currencyByTrip, tripDbId,
  } = useAppStore();
  const { locale } = useI18n();

  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<TripEvent | null>(null);
  const [defaultAddTime, setDefaultAddTime] = useState('09:00');
  const [weather, setWeather] = useState<{ temp: number; label?: string } | null>(null);

  // Derived — computed before hooks so they can feed useEffect deps
  const evs = trip
    ? [...(trip.events[activeDay] ?? [])].sort((a, b) => toMins(a.time) - toMins(b.time))
    : [];

  useEffect(() => {
    if (!trip) return;
    let lat: number | undefined, lng: number | undefined;
    for (const ev of evs) {
      if (ev.lat && ev.lng) { lat = ev.lat; lng = ev.lng; break; }
    }
    if (!lat && trip.countries?.length) {
      const cap = getCapitalCoords(trip.countries[0]);
      if (cap) { lat = cap.lat; lng = cap.lng; }
    }
    if (!lat || !lng) return;

    const start = trip.startDate ?? new Date().toISOString().split('T')[0];
    fetch(`/api/weather?lat=${lat}&lng=${lng}&start=${start}&days=${trip.days}`)
      .then(r => r.json())
      .then(d => {
        const times: string[] = d?.daily?.time ?? [];
        const dayDateStr = new Date(
          new Date(start).getTime() + (activeDay - 1) * 86_400_000,
        ).toISOString().split('T')[0];
        const idx = times.indexOf(dayDateStr);
        if (idx >= 0) {
          setWeather({
            temp: Math.round(d.daily.temperature_2m_max?.[idx] ?? 0),
            label: d.daily.label?.[idx],
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, trip?.startDate]);

  if (!trip) return null;

  const meta = trip.dayMeta[activeDay - 1];
  const dayBudget = getDayBudget(evs);
  const currSym = getCurrencySymbol((tripDbId && currencyByTrip[tripDbId]) || 'USD');

  // Meta line values
  const totalEventMins = evs.reduce((s, e) => s + e.duration, 0);
  const freeTimeMins = Math.max(0, dayEndHour * 60 - totalEventMins);
  const dayDateObj = trip.startDate
    ? new Date(new Date(trip.startDate).getTime() + (activeDay - 1) * 86_400_000)
    : new Date();
  const weekdayLabel = dayDateObj.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { weekday: 'long' });

  // Hotels
  const tonightHotel = (trip.hotels ?? []).find(
    h => h.checkInDay <= activeDay && activeDay < h.checkOutDay,
  ) ?? null;
  const checkoutHotel = (trip.hotels ?? []).find(h => h.checkOutDay === activeDay) ?? null;
  const topHotel = checkoutHotel ?? (tonightHotel?.checkInDay !== activeDay ? tonightHotel : null);

  // Eyebrow: trip name · year
  const tripYear = trip.startDate
    ? new Date(trip.startDate).getFullYear()
    : new Date().getFullYear();
  const eyebrow = `${trip.name || 'Adventure'} · ${tripYear}`;

  // Day label for sheet subtitle
  const dayLabel = `${locale === 'he' ? 'יום' : 'Day'} ${activeDay}${meta?.region ? ` · ${meta.region}` : ''}`;

  const openAdd = (prefillTime?: string) => {
    const last = evs[evs.length - 1];
    setDefaultAddTime(prefillTime ?? (last ? toTime(toMins(last.time) + last.duration) : '09:00'));
    setEditTarget(null);
    setShowAdd(true);
  };

  const openEdit = (e: TripEvent) => {
    setEditTarget(e);
    setShowAdd(true);
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: 'var(--bg)' }}>

      {/* ── Sticky header ──────────────────────────────────── */}
      <div style={{ padding: '6px 20px 12px', flexShrink: 0 }}>

        {/* Eyebrow */}
        <p className="eyebrow-lg" style={{ color: 'var(--lg-terra)', marginBottom: 2 }}>
          {eyebrow}
        </p>

        {/* Day N + List ⇄ Timeline toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1
            className="display-xl"
            style={{ fontSize: 38, color: 'var(--lg-ink)', margin: 0, whiteSpace: 'nowrap' }}
          >
            {locale === 'he' ? 'יום' : 'Day'} {activeDay}
          </h1>
          <div className="lg" style={{ display: 'flex', padding: 4, borderRadius: 9999, gap: 2 }}>
            {(['list', 'timeline'] as const).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                style={{
                  border: 0, cursor: 'pointer', borderRadius: 9999, padding: '7px 13px',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
                  background: viewMode === m ? 'var(--lg-terra)' : 'transparent',
                  color: viewMode === m ? '#fff' : 'var(--text-3)',
                  transition: 'all .3s',
                }}
              >
                {m === 'list'
                  ? (locale === 'he' ? 'רשימה' : 'List')
                  : (locale === 'he' ? 'ציר זמן' : 'Timeline')}
              </button>
            ))}
          </div>
        </div>

        {/* Meta line: weekday · event count · free time */}
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '4px 0 12px' }}>
          {weekdayLabel}
          {' · '}
          {evs.length} {locale === 'he' ? 'אירועים' : evs.length === 1 ? 'event' : 'events'}
          {' · '}
          {fmtDuration(freeTimeMins)} {locale === 'he' ? 'פנוי' : 'free'}
        </p>

        {/* Day-pill rail */}
        <div className="lg-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto' }}>
          {Array.from({ length: Math.min(trip.days, 30) }, (_, i) => {
            const d = i + 1;
            const on = d === activeDay;
            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                style={{
                  flex: 'none', border: 0, cursor: 'pointer',
                  borderRadius: 9999, padding: '8px 15px',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
                  background: on ? 'var(--lg-forest)' : 'var(--lg-panel)',
                  backdropFilter: 'var(--lg-blur)',
                  WebkitBackdropFilter: 'var(--lg-blur)',
                  color: on ? '#fff' : 'var(--text-2)',
                  boxShadow: on
                    ? 'var(--lg-glow-forest)'
                    : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                  transition: 'all .3s', whiteSpace: 'nowrap',
                }}
              >
                {locale === 'he' ? 'יום' : 'Day'} {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="lg-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>

        {/* Context bar: Weather + Day budget */}
        {(weather || dayBudget > 0) && (
          <div style={{ display: 'flex', gap: 10, margin: '0 20px 14px' }}>
            {weather && (
              <div className="lg" style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="sun" size={22} color="var(--lg-sand)" />
                <div>
                  <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>
                    {locale === 'he' ? 'מזג אוויר' : 'Weather'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink)' }}>
                    {weather.temp}° · {weather.label ?? 'Clear'}
                  </div>
                </div>
              </div>
            )}
            {dayBudget > 0 && (
              <div className="lg" style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="download" size={20} color="var(--lg-terra)" />
                <div>
                  <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>
                    {locale === 'he' ? 'תקציב יום' : 'Day budget'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink)' }}>
                    {currSym}{dayBudget}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>

            {/* HotelAnchor top */}
            {topHotel && <HotelAnchor hotel={topHotel} />}

            {/* EventAccordion list */}
            {evs.map((ev, i) => (
              <EventAccordion
                key={ev.id}
                event={ev}
                index={i}
                onEdit={openEdit}
                onSuggest={() => setShowSuggestions(true)}
              />
            ))}

            {/* HotelAnchor bottom */}
            {tonightHotel && <HotelAnchor hotel={tonightHotel} isEnd />}

            {/* Glass "Add an event" button */}
            <button
              onClick={() => openAdd()}
              className="lg-btn lg-btn-glass"
              style={{
                height: 48, margin: '4px 20px 0', gap: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 'calc(100% - 40px)',
              }}
            >
              <Icon name="plus" size={17} color="var(--lg-forest)" />
              {locale === 'he' ? 'הוסף אירוע' : 'Add an event'}
            </button>
          </div>
        ) : (
          <TimelineView events={evs} />
        )}
      </div>

      {/* ── Add / Edit sheet ───────────────────────────────── */}
      {showAdd && (
        <AddEventSheet
          onClose={() => { setShowAdd(false); setEditTarget(null); }}
          editing={editTarget}
          defaultTime={defaultAddTime}
          dayLabel={dayLabel}
        />
      )}

      {showSuggestions && <AISheet dayNumber={activeDay} />}
    </div>
  );
}
