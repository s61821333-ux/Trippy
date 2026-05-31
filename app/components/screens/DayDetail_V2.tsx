'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';
import Sheet from '../ui/Sheet';
import Field from '../ui/Field';
import PlacesInput from '../ui/PlacesInput';
import { useAppStore } from '@/lib/store';
import { CAT_META, CAT_FALLBACK, fmtDuration, toMins, toTime, getDayBudget } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/currency';
import CurrencyAmount from '../ui/CurrencyAmount';
import { catStamp } from '@/lib/categoryStamp';
import { Category, HotelStay, TripEvent } from '@/lib/types';
import { useToast } from '../ui/Toast';
import { AISheet } from '../Sheets_V2';
import { useI18n } from '@/lib/i18n';
import { getCapitalCoords } from '@/lib/capitals';

// ── Category definitions ──────────────────────────────────────────────────────

const CATS_CORE: [Category, string, string][] = [
  ['flight',      'plane',    'Flight'],
  ['transport',   'swap',     'Drive'],
  ['food',        'wind',     'Food'],
  ['cafe',        'water',    'Café'],
  ['attraction',  'pin',      'Sight'],
  ['museum',      'pin',      'Museum'],
  ['hotel',       'home',     'Hotel'],
  ['rest',        'tent',     'Rest'],
  ['beach',       'sun',      'Beach'],
  ['sport',       'users',    'Sport'],
  ['concert',     'sparkle',  'Concert'],
  ['theme_park',  'sparkle',  'Theme Park'],
  ['other',       'sparkle',  'Other'],
];

const CATS_EXTENDED: [Category, string, string][] = [
  ['hiking',      'compass',  'Hiking'],
  ['nature_walk', 'sun',      'Nature'],
  ['cycling',     'arrow',    'Cycling'],
  ['boat',        'swap',     'Boat'],
  ['water_sports','water',    'Water Sports'],
  ['ski',         'arrow',    'Ski'],
  ['aerial',      'arrow',    'Aerial'],
  ['golf',        'sun',      'Golf'],
  ['safari',      'compass',  'Safari'],
  ['nightlife',   'sparkle',  'Nightlife'],
  ['winery',      'water',    'Winery'],
  ['cooking',     'wind',     'Cooking'],
  ['theater',     'sparkle',  'Theater'],
  ['cinema',      'sparkle',  'Cinema'],
  ['art',         'pin',      'Art'],
  ['festival',    'sparkle',  'Festival'],
  ['shopping',    'wind',     'Shopping'],
  ['market',      'wind',     'Market'],
  ['spa',         'water',    'Spa'],
  ['wellness',    'water',    'Wellness'],
  ['hot_springs', 'water',    'Hot Springs'],
  ['photography', 'pin',      'Photography'],
  ['guided_tour', 'users',    'Guided Tour'],
  ['national_park','sun',     'National Park'],
  ['cultural',    'pin',      'Cultural'],
  ['religious',   'tent',     'Religious'],
  ['picnic',      'sun',      'Picnic'],
  ['cruise',      'swap',     'Cruise'],
  ['farm',        'tent',     'Farm'],
];

// ── Duration presets ──────────────────────────────────────────────────────────

const DUR_LABELS = ['30m', '1h', '1h 30m', '2h', '3h', '4h', '6h', 'Custom'];
const DUR_MINS: Record<string, number> = {
  '30m': 30, '1h': 60, '1h 30m': 90, '2h': 120, '3h': 180, '4h': 240, '6h': 360,
};

function minsToPreset(m: number): string {
  return Object.entries(DUR_MINS).find(([, v]) => v === m)?.[0] ?? 'Custom';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dayDateStr(startDate: string | undefined, dayNum: number, locale: string): string {
  if (!startDate) return `Day ${dayNum}`;
  const dt = new Date(new Date(startDate + 'T00:00:00').getTime() + (dayNum - 1) * 86_400_000);
  return dt.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function dayPillLabel(startDate: string | undefined, dayNum: number): string {
  if (!startDate) return `Day ${dayNum}`;
  const dt = new Date(new Date(startDate + 'T00:00:00').getTime() + (dayNum - 1) * 86_400_000);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── HotelAnchor ───────────────────────────────────────────────────────────────

function HotelAnchor({ hotel, isEnd, onClick }: {
  hotel: HotelStay | null;
  isEnd?: boolean;
  onClick: () => void;
}) {
  const { locale } = useI18n();
  const eyebrow = isEnd
    ? (locale === 'he' ? "צ'ק-אאוט" : 'Checkout')
    : (locale === 'he' ? 'לינה' : 'Stay');

  return (
    <button
      onClick={onClick}
      className="lg lg-strong"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', margin: '0 20px',
        border: 0, cursor: 'pointer', textAlign: 'start', width: 'calc(100% - 40px)',
      }}
    >
      <StampIcon iconKey="hotel" size={34} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5, display: 'block', marginBottom: 1 }}>
          {eyebrow}
        </span>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--lg-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {hotel ? hotel.location : (locale === 'he' ? 'הוסף מלון' : 'Add hotel / accommodation')}
        </p>
      </div>
      <Icon name={hotel ? 'edit' : 'plus'} size={15} color="var(--text-3)" />
    </button>
  );
}

// ── HotelSheet ────────────────────────────────────────────────────────────────

function HotelSheet({ dayNum, existing, onClose }: {
  dayNum: number;
  existing: HotelStay | null;
  onClose: () => void;
}) {
  const { trip, addHotel, editHotel, deleteHotel } = useAppStore();
  const { show } = useToast();
  const { locale } = useI18n();

  const [name,     setName]     = useState(existing?.name     ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [lat,      setLat]      = useState<number | undefined>(existing?.lat);
  const [lng,      setLng]      = useState<number | undefined>(existing?.lng);
  const [checkOut, setCheckOut] = useState(existing?.checkOutDay ?? dayNum + 1);

  const maxDays = trip?.days ?? 30;

  const handleSave = () => {
    if (!location.trim()) { show('Enter a hotel name or address'); return; }
    if (existing) {
      editHotel(existing.id, { name: name || undefined, location, lat, lng, checkOutDay: checkOut });
      show('Hotel updated');
    } else {
      addHotel({ name: name || undefined, location, lat, lng, checkInDay: dayNum, checkOutDay: checkOut });
      show('Hotel added');
    }
    onClose();
  };

  return (
    <Sheet
      title={existing ? 'Edit accommodation' : 'Add accommodation'}
      subtitle={`Day ${dayNum}`}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Hotel / accommodation name (optional)" placeholder="Grand Hotel…" value={name} onChange={setName} />

        <PlacesInput
          label="Address or location"
          placeholder="—"
          value={location}
          onChange={v => { setLocation(v); setLat(undefined); setLng(undefined); }}
          onSelect={({ name: n, lat: la, lng: lo }) => { setLocation(n); setLat(la); setLng(lo); }}
        />

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8, fontWeight: 600 }}>
            Check-out day
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {Array.from({ length: Math.min(maxDays - dayNum + 1, 10) }, (_, i) => {
              const d = dayNum + i + 1;
              return (
                <button
                  key={d}
                  onClick={() => setCheckOut(d)}
                  style={{
                    border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 13px',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5,
                    background: checkOut === d ? 'var(--lg-forest)' : 'var(--lg-panel)',
                    color: checkOut === d ? '#fff' : 'var(--text-2)',
                    boxShadow: checkOut === d ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                    transition: 'all .25s',
                  }}
                >
                  Day {d}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
            The hotel will appear on the morning of day {checkOut} as checkout. Staying until day {checkOut} means it covers nights {dayNum}–{checkOut - 1}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <GlassBtn variant="accent" size="lg" onClick={handleSave} style={{ flex: 2 }}>
            {existing ? 'Save changes' : 'Add hotel'}
          </GlassBtn>
          {existing && (
            <GlassBtn size="lg" onClick={() => { deleteHotel(existing.id); show('Hotel removed'); onClose(); }} style={{ flex: 1 }}>
              Remove
            </GlassBtn>
          )}
          <GlassBtn size="lg" onClick={onClose} style={{ flex: 1 }}>Cancel</GlassBtn>
        </div>
      </div>
    </Sheet>
  );
}

// ── QuickAction ───────────────────────────────────────────────────────────────

function QuickAction({ icon, label, onClick, color }: { icon: string; label: string; onClick: () => void; color: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      style={{
        height: 38, padding: '0 12px', gap: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        background: 'var(--lg-panel-strong)',
        color: 'var(--lg-ink)', border: 'none', borderRadius: 9999, cursor: 'pointer',
        boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Icon name={icon as any} size={15} color={color} />
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </motion.button>
  );
}

// ── EventAccordion ────────────────────────────────────────────────────────────

function EventAccordion({ event, index, currCode, onEdit, onSuggest, onDelete }: {
  event: TripEvent;
  index: number;
  currCode: string;
  onEdit: (e: TripEvent) => void;
  onSuggest: () => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { locale } = useI18n();
  const { color } = catStamp(event.category);
  const meta = CAT_META[event.category];
  const stampKey = CAT_FALLBACK[event.category];
  const endT = toTime(toMins(event.time) + event.duration);

  return (
    <div
      className="lg a-rise"
      style={{ animationDelay: `${index * 0.05}s`, borderInlineStart: `3px solid ${color}`, margin: '0 20px' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: 14, border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'start' }}
      >
        <div style={{ flex: 'none', textAlign: 'center', width: 42 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--lg-ink)' }}>{event.time}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{endT}</div>
        </div>
        <StampIcon iconKey={stampKey} size={42} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--lg-ink)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.name}
          </div>
          {event.location && (
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="pin" size={12} color="var(--text-3)" />
              {event.location}
            </div>
          )}
          <span style={{ display: 'inline-block', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color, background: `${color}1f`, padding: '3px 9px', borderRadius: 9999 }}>
            {meta?.label ?? event.category}
          </span>
        </div>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} style={{ alignSelf: 'center', display: 'flex', flexShrink: 0 }}>
          <Icon name="chevR" size={18} color="var(--text-3)" />
        </motion.span>
      </button>

      <div style={{ maxHeight: open ? 320 : 0, overflow: 'hidden', transition: 'max-height .4s var(--snap)' }}>
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 12%)', margin: '0 0 12px' }} />
          <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
            <div>
              <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{locale === 'he' ? 'משך' : 'Duration'}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>{event.time}–{endT} ({fmtDuration(event.duration)})</div>
            </div>
            {event.cost != null && event.cost > 0 && (
              <div>
                <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{locale === 'he' ? 'עלות' : 'Cost'}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>
                  <CurrencyAmount amount={event.cost} base={currCode} />
                </div>
              </div>
            )}
          </div>
          {event.notes && <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)', margin: '0 0 14px' }}>{event.notes}</p>}
          <div className="lg-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            <QuickAction icon="edit"    label={locale === 'he' ? 'עריכה'    : 'Edit'}       color="var(--lg-forest)" onClick={() => { setOpen(false); onEdit(event); }} />
            <QuickAction icon="clock"   label={locale === 'he' ? 'שינוי זמן' : 'Reschedule'} color="var(--lg-terra)"  onClick={() => { setOpen(false); onEdit(event); }} />
            <QuickAction icon="sparkle" label={locale === 'he' ? 'הצע'      : 'AI suggest'} color="var(--lg-sand)"   onClick={() => { setOpen(false); onSuggest(); }} />
            <QuickAction icon="trash"   label={locale === 'he' ? 'מחק'      : 'Delete'}     color="var(--danger)"    onClick={() => { setOpen(false); onDelete(event.id); }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TimelineView ──────────────────────────────────────────────────────────────

function TimelineView({ events }: { events: TripEvent[] }) {
  const TICK_H = 32;
  const TICKS = 13;
  return (
    <div style={{ position: 'relative', paddingInlineStart: 66, paddingInlineEnd: 20, paddingBottom: 130 }}>
      {Array.from({ length: TICKS }).map((_, h) => (
        <div key={h} style={{ position: 'relative', height: TICK_H, borderTop: '1px solid oklch(50% 0.02 60 / 10%)' }}>
          <span style={{ position: 'absolute', insetInlineStart: -46, top: -7, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', width: 40, textAlign: 'end' }}>
            {String(h * 2).padStart(2, '0')}:00
          </span>
        </div>
      ))}
      {events.map((ev, i) => {
        const { color } = catStamp(ev.category);
        const top    = (toMins(ev.time) / 60 / 2) * TICK_H;
        const height = Math.max((ev.duration / 60 / 2) * TICK_H, 28);
        return (
          <motion.div key={ev.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 32, delay: i * 0.07 }}
            style={{ position: 'absolute', insetInlineStart: 46, insetInlineEnd: 20, top, height, borderRadius: 12, padding: '4px 8px', background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#fff', boxShadow: `0 6px 18px ${color}55`, overflow: 'hidden' }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</div>
            <div style={{ fontSize: 8.5, opacity: 0.85, fontFamily: 'var(--font-mono)', lineHeight: 1.05 }}>{ev.time}–{toTime(toMins(ev.time) + ev.duration)}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── AddEventSheet ─────────────────────────────────────────────────────────────

function AddEventSheet({ onClose, editing, defaultTime, dayLabel }: {
  onClose: () => void;
  editing: TripEvent | null;
  defaultTime: string;
  dayLabel: string;
}) {
  const { addEvent, editEvent, activeDay } = useAppStore();
  const { show } = useToast();
  const { locale } = useI18n();

  const [name,      setName]      = useState(editing?.name ?? '');
  const [startTime, setStartTime] = useState(editing?.time ?? defaultTime);
  const [endTime,   setEndTime]   = useState(() => {
    if (!editing) {
      const [h, m] = defaultTime.split(':').map(Number);
      const endMins = h * 60 + m + 60;
      return `${String(Math.floor(endMins / 60) % 24).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;
    }
    return toTime(toMins(editing.time) + editing.duration);
  });
  const [durPreset, setDurPreset] = useState(() => editing ? minsToPreset(editing.duration) : '1h');
  const [cat,  setCat]   = useState<Category>(editing?.category ?? 'attraction');
  const [loc,  setLoc]   = useState(editing?.location ?? '');
  const [lat,  setLat]   = useState<number | undefined>(editing?.lat);
  const [lng,  setLng]   = useState<number | undefined>(editing?.lng);
  const [cost, setCost]  = useState(editing?.cost != null ? String(editing.cost) : '');
  const [showExtended, setShowExtended] = useState(false);

  // Keep end time in sync when start or preset changes
  const syncEndFromPreset = (preset: string, start: string) => {
    if (preset === 'Custom') return;
    const dur = DUR_MINS[preset] ?? 60;
    setEndTime(toTime(toMins(start) + dur));
  };

  const syncDurationFromEndTime = (et: string) => {
    const diff = toMins(et) - toMins(startTime);
    const dur = diff > 0 ? diff : diff + 24 * 60; // handle midnight wrap
    setDurPreset(minsToPreset(dur));
    setEndTime(et);
  };

  const derivedDuration = (() => {
    const diff = toMins(endTime) - toMins(startTime);
    return diff > 0 ? diff : diff + 24 * 60;
  })();

  const handleSave = () => {
    if (!name.trim()) { show(locale === 'he' ? 'הכנס שם לאירוע' : 'Enter an event name'); return; }
    const costVal = cost.trim() ? parseFloat(cost) : undefined;
    const payload = {
      time: startTime, duration: derivedDuration, name, category: cat,
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
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-3)', marginBottom: 8, fontWeight: 600,
  };

  const allCats = showExtended ? [...CATS_CORE, ...CATS_EXTENDED] : CATS_CORE;

  return (
    <Sheet
      title={editing ? (locale === 'he' ? 'ערוך אירוע' : 'Edit event') : (locale === 'he' ? 'הוסף אירוע' : 'Add event')}
      subtitle={dayLabel}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label={locale === 'he' ? 'שם האירוע' : 'Event name'} placeholder="—" value={name} onChange={setName} autoFocus />

        {/* Start + End times */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Field
            label={locale === 'he' ? 'שעת התחלה' : 'Start time'}
            type="time"
            value={startTime}
            onChange={v => { setStartTime(v); syncEndFromPreset(durPreset, v); }}
          />
          <Field
            label={locale === 'he' ? 'שעת סיום' : 'End time'}
            type="time"
            value={endTime}
            onChange={syncDurationFromEndTime}
          />
        </div>

        {/* Duration presets (shortcuts) */}
        <div>
          <label style={monoLabel}>{locale === 'he' ? 'משך (קיצור דרך)' : 'Duration shortcut'}</label>
          <div className="lg-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {DUR_LABELS.map(d => (
              <button
                key={d}
                onClick={() => { setDurPreset(d); if (d !== 'Custom') syncEndFromPreset(d, startTime); }}
                style={{
                  flex: 'none', border: 0, cursor: 'pointer', borderRadius: 12, padding: '11px 13px',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                  background: durPreset === d ? 'var(--lg-terra)' : 'var(--lg-panel)',
                  color: durPreset === d ? '#fff' : 'var(--text-2)',
                  boxShadow: durPreset === d ? 'var(--lg-glow-terra)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                  transition: 'all .25s', whiteSpace: 'nowrap',
                }}
              >
                {d}
              </button>
            ))}
          </div>
          {derivedDuration > 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
              {fmtDuration(derivedDuration)} total
            </p>
          )}
        </div>

        {/* Category grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={monoLabel}>{locale === 'he' ? 'קטגוריה' : 'Category'}</label>
            <button
              onClick={() => setShowExtended(e => !e)}
              style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0 }}
            >
              {showExtended ? 'Show less' : `+${CATS_EXTENDED.length} more`}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {allCats.map(([c, ic, lbl]) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 13px',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5,
                  background: cat === c ? 'var(--lg-forest)' : 'var(--lg-panel)',
                  color: cat === c ? '#fff' : 'var(--text-2)',
                  boxShadow: cat === c ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                  transition: 'all .25s',
                }}
              >
                <Icon name={ic as any} size={13} color={cat === c ? '#fff' : 'var(--text-3)'} />
                {lbl}
              </button>
            ))}
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
            type="number" min="0" inputMode="decimal" placeholder="$0"
            value={cost} onChange={e => setCost(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', height: 48, border: 0, borderRadius: 14, paddingInlineStart: 16, paddingInlineEnd: 16, fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--lg-ink)', outline: 'none', background: 'var(--lg-panel-strong)', boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)', transition: 'box-shadow .2s' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <GlassBtn variant="accent" size="lg" onClick={handleSave} style={{ flex: 2 }}>
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

// ── Main screen ───────────────────────────────────────────────────────────────

export default function DayDetail_V2() {
  const {
    trip, activeDay, setActiveDay,
    addEvent, editEvent, deleteEvent,
    setShowSuggestions, showSuggestions,
    dayEndHour, currencyByTrip, tripDbId, setScreen,
  } = useAppStore();
  const { locale } = useI18n();

  const [viewMode,        setViewMode]        = useState<'list' | 'timeline'>('list');
  const [showAdd,         setShowAdd]         = useState(false);
  const [editTarget,      setEditTarget]      = useState<TripEvent | null>(null);
  const [defaultAddTime,  setDefaultAddTime]  = useState('09:00');
  const [weather,         setWeather]         = useState<{ temp: number; label?: string } | null>(null);
  const [showHotelSheet,  setShowHotelSheet]  = useState(false);
  const [hotelEditTarget, setHotelEditTarget] = useState<HotelStay | null>(null);

  const evs = trip
    ? [...(trip.events[activeDay] ?? [])].sort((a, b) => toMins(a.time) - toMins(b.time))
    : [];

  // Drag-to-reorder: swap times so events land where the user drops them
  const handleReorder = (newOrder: TripEvent[]) => {
    const oldTimes = evs.map(e => e.time);
    newOrder.forEach((ev, i) => {
      if (ev.time !== oldTimes[i]) {
        editEvent(activeDay, ev.id, { time: oldTimes[i] });
      }
    });
  };

  useEffect(() => {
    if (!trip) return;
    let lat: number | undefined, lng: number | undefined;
    for (const ev of evs) { if (ev.lat && ev.lng) { lat = ev.lat; lng = ev.lng; break; } }
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
        const dayDateStr2 = new Date(new Date(start).getTime() + (activeDay - 1) * 86_400_000).toISOString().split('T')[0];
        const idx = times.indexOf(dayDateStr2);
        if (idx >= 0) setWeather({ temp: Math.round(d.daily.temperature_2m_max?.[idx] ?? 0), label: d.daily.label?.[idx] });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, trip?.startDate]);

  if (!trip) return null;

  const meta = trip.dayMeta[activeDay - 1];
  const dayBudget = getDayBudget(evs);
  const currCode  = (tripDbId && currencyByTrip[tripDbId]) || 'USD';
  const currSym   = getCurrencySymbol(currCode);

  const totalEventMins = evs.reduce((s, e) => s + e.duration, 0);
  const freeTimeMins   = Math.max(0, dayEndHour * 60 - totalEventMins);
  const weekdayLabel   = dayDateStr(trip.startDate, activeDay, locale);

  const tonightHotel   = (trip.hotels ?? []).find(h => h.checkInDay <= activeDay && activeDay < h.checkOutDay) ?? null;
  const checkoutHotel  = (trip.hotels ?? []).find(h => h.checkOutDay === activeDay) ?? null;
  const topHotel       = checkoutHotel ?? (tonightHotel?.checkInDay !== activeDay ? tonightHotel : null);

  const tripYear  = trip.startDate ? new Date(trip.startDate).getFullYear() : new Date().getFullYear();
  const eyebrow   = `${trip.name || 'Adventure'} · ${tripYear}`;
  const dayLabel  = `${locale === 'he' ? 'יום' : 'Day'} ${activeDay}${meta?.region ? ` · ${meta.region}` : ''}`;

  const openAdd = (prefillTime?: string) => {
    const last = evs[evs.length - 1];
    setDefaultAddTime(prefillTime ?? (last ? toTime(toMins(last.time) + last.duration) : '09:00'));
    setEditTarget(null);
    setShowAdd(true);
  };

  const openHotelSheet = (hotel: HotelStay | null) => {
    setHotelEditTarget(hotel);
    setShowHotelSheet(true);
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: 'var(--bg)' }}>

      {/* ── Sticky header ── */}
      <div className="resp-container" style={{ padding: '6px 20px 12px', flexShrink: 0 }}>
        {/* Back to dashboard */}
        <button
          onClick={() => setScreen('dashboard')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="chevL" size={12} color="var(--text-3)" />
          {locale === 'he' ? 'לוח בקרה' : 'Dashboard'}
        </button>
        <p className="eyebrow-lg" style={{ color: 'var(--lg-terra)', marginBottom: 2 }}>{eyebrow}</p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 className="display-xl" style={{ fontSize: 38, color: 'var(--lg-ink)', margin: 0, whiteSpace: 'nowrap' }}>
            {locale === 'he' ? 'יום' : 'Day'} {activeDay}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* AI suggestions button */}
            <button
              onClick={() => setShowSuggestions(true)}
              className="lg-btn"
              style={{
                height: 38, padding: '0 14px', gap: 6, display: 'flex', alignItems: 'center',
                background: 'var(--lg-panel)', border: 0, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12,
                color: 'var(--lg-terra)',
                boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
              }}
            >
              <Icon name="sparkle" size={14} color="var(--lg-terra)" />
              AI suggestions
            </button>
            {/* List / Timeline toggle */}
            <div className="lg" style={{ display: 'flex', padding: 4, borderRadius: 9999, gap: 2 }}>
              {(['list', 'timeline'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  style={{
                    border: 0, cursor: 'pointer', borderRadius: 9999, padding: '7px 13px',
                    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
                    background: viewMode === m ? 'var(--lg-terra)' : 'transparent',
                    color: viewMode === m ? '#fff' : 'var(--text-3)',
                    transition: 'all .3s',
                  }}
                >
                  {m === 'list' ? (locale === 'he' ? 'רשימה' : 'List') : (locale === 'he' ? 'ציר' : 'Time')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '4px 0 12px' }}>
          {weekdayLabel}
          {' · '}
          {evs.length} {locale === 'he' ? 'אירועים' : evs.length === 1 ? 'event' : 'events'}
          {' · '}
          {fmtDuration(freeTimeMins)} {locale === 'he' ? 'פנוי' : 'free'}
        </p>

        {/* Day pill rail — shows real dates */}
        <div className="lg-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto' }}>
          {Array.from({ length: Math.min(trip.days, 30) }, (_, i) => {
            const d  = i + 1;
            const on = d === activeDay;
            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                style={{
                  flex: 'none', border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 15px',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
                  background: on ? 'var(--lg-forest)' : 'var(--lg-panel)',
                  backdropFilter: 'var(--lg-blur)', WebkitBackdropFilter: 'var(--lg-blur)',
                  color: on ? '#fff' : 'var(--text-2)',
                  boxShadow: on ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                  transition: 'all .3s', whiteSpace: 'nowrap',
                }}
              >
                {dayPillLabel(trip.startDate, d)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="lg-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>
        <div className="resp-container">

        {/* Context bar: Weather + Day budget */}
        {(weather || dayBudget > 0) && (
          <div style={{ display: 'flex', gap: 10, margin: '0 20px 14px' }}>
            {weather && (
              <div className="lg" style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="sun" size={22} color="var(--lg-sand)" />
                <div>
                  <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{locale === 'he' ? 'מזג אוויר' : 'Weather'}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink)' }}>{weather.temp}° · {weather.label ?? 'Clear'}</div>
                </div>
              </div>
            )}
            {dayBudget > 0 && (
              <div className="lg" style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="download" size={20} color="var(--lg-terra)" />
                <div>
                  <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{locale === 'he' ? 'תקציב יום' : 'Day budget'}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink)' }}>
                    <CurrencyAmount amount={dayBudget} base={currCode} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hotel stay banner — persistent when sleeping here tonight */}
        {tonightHotel && (
          <div
            style={{
              margin: '0 20px 12px',
              padding: '10px 14px',
              borderRadius: 14,
              background: 'oklch(52% 0.14 310 / 12%)',
              border: '1px solid oklch(52% 0.14 310 / 22%)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <Icon name="home" size={16} color="oklch(52% 0.14 310)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'oklch(52% 0.14 310)' }}>
                {locale === 'he' ? 'לינה הלילה: ' : 'Staying tonight: '}
              </span>
              <span style={{ fontSize: 12, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tonightHotel.location}
              </span>
            </div>
            <button
              onClick={() => openHotelSheet(tonightHotel)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
            >
              <Icon name="edit" size={13} color="var(--text-3)" />
            </button>
          </div>
        )}

        {viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {topHotel && (
              <HotelAnchor hotel={topHotel} onClick={() => openHotelSheet(topHotel)} />
            )}

            {/* Drag-to-reorder event list */}
            {evs.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={evs}
                onReorder={handleReorder}
                style={{ display: 'flex', flexDirection: 'column', gap: 11, listStyle: 'none', padding: 0, margin: 0 }}
              >
                {evs.map((ev, i) => (
                  <Reorder.Item
                    key={ev.id}
                    value={ev}
                    style={{ cursor: 'grab' }}
                    whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px oklch(20% 0.03 60 / 22%)' }}
                  >
                    <EventAccordion
                      event={ev}
                      index={i}
                      currCode={currCode}
                      onEdit={e => { setEditTarget(e); setShowAdd(true); }}
                      onSuggest={() => setShowSuggestions(true)}
                      onDelete={id => deleteEvent(activeDay, id)}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              /* Empty day state */
              <div style={{ margin: '20px 20px 0', padding: '32px 20px', textAlign: 'center', borderRadius: 20, background: 'var(--lg-panel)', boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 10%)' }}>
                <Icon name="compass" size={36} color="var(--text-3)" />
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--lg-ink)', margin: '12px 0 6px' }}>
                  {locale === 'he' ? 'יום ריק' : 'Nothing planned yet.'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 16px' }}>
                  {locale === 'he' ? 'הוסף אירועים ליום זה' : 'Add your first event for this day.'}
                </p>
                <button
                  onClick={() => openAdd()}
                  className="lg-btn lg-btn-forest"
                  style={{ height: 42, padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: 7 }}
                >
                  <Icon name="plus" size={16} color="#fff" />
                  {locale === 'he' ? 'הוסף אירוע' : 'Add event'}
                </button>
              </div>
            )}

            {!tonightHotel && !topHotel && (
              <HotelAnchor hotel={null} onClick={() => openHotelSheet(null)} />
            )}
            {tonightHotel && (
              <HotelAnchor hotel={tonightHotel} isEnd onClick={() => openHotelSheet(tonightHotel)} />
            )}

            {evs.length > 0 && (
              <button
                onClick={() => openAdd()}
                className="lg-btn lg-btn-glass"
                style={{ height: 48, margin: '4px 20px 0', gap: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'calc(100% - 40px)' }}
              >
                <Icon name="plus" size={17} color="var(--lg-forest)" />
                {locale === 'he' ? 'הוסף אירוע' : 'Add an event'}
              </button>
            )}
          </div>
        ) : (
          <TimelineView events={evs} />
        )}
        </div>{/* /resp-container */}
      </div>

      {showAdd && (
        <AddEventSheet
          onClose={() => { setShowAdd(false); setEditTarget(null); }}
          editing={editTarget}
          defaultTime={defaultAddTime}
          dayLabel={dayLabel}
        />
      )}

      {showHotelSheet && (
        <HotelSheet
          dayNum={activeDay}
          existing={hotelEditTarget}
          onClose={() => { setShowHotelSheet(false); setHotelEditTarget(null); }}
        />
      )}

      {showSuggestions && <AISheet dayNumber={activeDay} />}
    </div>
  );
}
