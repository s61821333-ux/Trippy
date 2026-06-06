'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useToast } from '../ui/Toast';
import Sheet from '../ui/Sheet';
import Field from '../ui/Field';
import GlassBtn from '../ui/GlassBtn';
import Icon from '../ui/Icon';
import PlacesInput from '../ui/PlacesInput';
import { StampIcon } from '../ui/StampIcon';
import { catStamp } from '@/lib/categoryStamp';
import type { Category, WishlistItem } from '@/lib/types';

// Core categories for quick selection
const CATS: [Category, string, string][] = [
  ['attraction',  'Sight',       'אטרקציה'],
  ['food',        'Food',        'אוכל'],
  ['museum',      'Museum',      'מוזיאון'],
  ['beach',       'Beach',       'חוף'],
  ['hiking',      'Hiking',      'טיול רגלי'],
  ['shopping',    'Shopping',    'קניות'],
  ['nightlife',   'Nightlife',   'בילוי לילי'],
  ['cafe',        'Café',        'קפה'],
  ['art',         'Art',         'אמנות'],
  ['nature_walk', 'Nature',      'טבע'],
  ['spa',         'Spa',         'ספא'],
  ['other',       'Other',       'אחר'],
];

// ── Add Item Sheet ─────────────────────────────────────────────────────────────

function AddWishItemSheet({ onClose }: { onClose: () => void }) {
  const { addWishlistItem } = useAppStore();
  const { show } = useToast();
  const { locale } = useI18n();

  const [name,     setName]     = useState('');
  const [cat,      setCat]      = useState<Category>('attraction');
  const [location, setLocation] = useState('');
  const [lat,      setLat]      = useState<number | undefined>();
  const [lng,      setLng]      = useState<number | undefined>();
  const [duration, setDuration] = useState('60');
  const [notes,    setNotes]    = useState('');

  const handleSave = () => {
    if (!name.trim()) { show(locale === 'he' ? 'הכנס שם' : 'Enter a name'); return; }
    addWishlistItem({
      name: name.trim(),
      category: cat,
      location: location.trim() || undefined,
      lat,
      lng,
      duration: parseInt(duration) || 60,
      notes: notes.trim() || undefined,
    });
    show(locale === 'he' ? 'נוסף לרשימת המשאלות' : 'Added to wish list');
    onClose();
  };

  const monoLabel: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-3)', marginBottom: 8, fontWeight: 600,
  };

  return (
    <Sheet
      title={locale === 'he' ? 'הוסף לרשימת משאלות' : 'Add to wish list'}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field
          label={locale === 'he' ? 'שם המקום / פעילות' : 'Place or activity name'}
          placeholder={locale === 'he' ? 'למשל: מוזיאון הלובר, אוכל רחוב…' : 'e.g. Louvre Museum, street food…'}
          value={name}
          onChange={setName}
          autoFocus
        />

        <div>
          <label style={monoLabel}>{locale === 'he' ? 'קטגוריה' : 'Category'}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {CATS.map(([id, labelEn, labelHe]) => (
              <button
                key={id}
                onClick={() => setCat(id)}
                style={{
                  border: 0, cursor: 'pointer', borderRadius: 9999, padding: '7px 13px',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5,
                  background: cat === id ? 'var(--lg-terra)' : 'var(--field-bg)',
                  color: cat === id ? '#fff' : 'var(--field-label)',
                  boxShadow: cat === id ? 'var(--lg-glow-terra)' : 'inset 0 0 0 1px var(--field-border)',
                  transition: 'all .2s',
                }}
              >
                {locale === 'he' ? labelHe : labelEn}
              </button>
            ))}
          </div>
        </div>

        <PlacesInput
          label={locale === 'he' ? 'מיקום (לא חובה)' : 'Location (optional)'}
          placeholder={locale === 'he' ? 'חפש מקום…' : 'Search for a place…'}
          value={location}
          onChange={(name) => { setLocation(name); setLat(undefined); setLng(undefined); }}
          onSelect={(place) => { setLocation(place.name); setLat(place.lat); setLng(place.lng); }}
        />

        <Field
          label={locale === 'he' ? 'משך משוער (דקות)' : 'Estimated duration (min)'}
          type="number"
          value={duration}
          onChange={setDuration}
        />

        <Field
          label={locale === 'he' ? 'הערות (לא חובה)' : 'Notes (optional)'}
          placeholder="…"
          value={notes}
          onChange={setNotes}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <GlassBtn variant="accent" size="lg" onClick={handleSave} style={{ flex: 2 }}>
            {locale === 'he' ? 'הוסף' : 'Add to wish list'}
          </GlassBtn>
          <GlassBtn variant="ghost" size="lg" onClick={onClose} style={{ flex: 1 }}>
            {locale === 'he' ? 'ביטול' : 'Cancel'}
          </GlassBtn>
        </div>
      </div>
    </Sheet>
  );
}

// ── Schedule Sheet — pick day + time ──────────────────────────────────────────

function ScheduleSheet({ item, onClose }: { item: WishlistItem; onClose: () => void }) {
  const { trip, scheduleWishlistItem } = useAppStore();
  const { show } = useToast();
  const { locale } = useI18n();

  const [selectedDay,  setSelectedDay]  = useState(1);
  const [selectedTime, setSelectedTime] = useState('10:00');

  const durationLabel = item.duration
    ? (item.duration >= 60
        ? `${Math.floor(item.duration / 60)}h${item.duration % 60 ? ` ${item.duration % 60}m` : ''}`
        : `${item.duration}m`)
    : '1h';

  const handleSchedule = () => {
    scheduleWishlistItem(item.id, selectedDay, selectedTime);
    show(locale === 'he' ? `נוסף ליום ${selectedDay}` : `Added to Day ${selectedDay}`);
    onClose();
  };

  const fmtDay = (d: number) => {
    if (!trip?.startDate) return `${locale === 'he' ? 'יום' : 'Day'} ${d}`;
    const dt = new Date(new Date(trip.startDate + 'T00:00:00').getTime() + (d - 1) * 86_400_000);
    return dt.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Find current hotel for selected day (to show context)
  const currentHotel = (trip?.hotels ?? []).find(
    h => h.checkInDay <= selectedDay && h.checkOutDay > selectedDay
  );

  return (
    <Sheet
      title={locale === 'he' ? 'תזמן לסדר היום' : 'Schedule to itinerary'}
      subtitle={item.name}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Hotel context hint */}
        {currentHotel && (
          <div className="lg" style={{
            padding: '10px 14px', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="home" size={16} color="var(--lg-forest)" />
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {locale === 'he' ? `לינה: ${currentHotel.name ?? currentHotel.location}` : `Staying: ${currentHotel.name ?? currentHotel.location}`}
            </span>
          </div>
        )}

        {/* Day picker */}
        <div>
          <label style={{
            display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-3)', marginBottom: 8, fontWeight: 600,
          }}>
            {locale === 'he' ? 'בחר יום' : 'Choose day'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, maxHeight: 160, overflowY: 'auto', overscrollBehaviorY: 'contain' }}>
            {Array.from({ length: trip?.days ?? 7 }, (_, i) => i + 1).map(d => {
              const hasEvents = (trip?.events[d]?.length ?? 0) > 0;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  style={{
                    border: 0, cursor: 'pointer', borderRadius: 9999, padding: '7px 13px',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12,
                    background: selectedDay === d ? 'var(--lg-forest)' : 'var(--field-bg)',
                    color: selectedDay === d ? '#fff' : 'var(--field-label)',
                    boxShadow: selectedDay === d ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px var(--field-border)',
                    transition: 'all .2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  }}
                >
                  <span>{fmtDay(d)}</span>
                  {hasEvents && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, opacity: 0.7 }}>
                      {locale === 'he' ? 'יש אירועים' : 'has events'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time picker */}
        <Field
          label={locale === 'he' ? 'שעה' : 'Time'}
          type="time"
          value={selectedTime}
          onChange={setSelectedTime}
        />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 12,
          background: 'var(--field-bg)',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)',
        }}>
          <Icon name="clock" size={13} color="var(--lg-terra)" />
          {locale === 'he' ? `משך: ${durationLabel}` : `Duration: ${durationLabel}`}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <GlassBtn variant="forest" size="lg" onClick={handleSchedule} style={{ flex: 2 }}>
            <Icon name="plus" size={15} color="#fff" />
            {locale === 'he' ? `הוסף ליום ${selectedDay}` : `Add to Day ${selectedDay}`}
          </GlassBtn>
          <GlassBtn variant="ghost" size="lg" onClick={onClose} style={{ flex: 1 }}>
            {locale === 'he' ? 'ביטול' : 'Cancel'}
          </GlassBtn>
        </div>
      </div>
    </Sheet>
  );
}

// ── Wishlist Item Card ─────────────────────────────────────────────────────────

function WishCard({ item, onDelete, onSchedule }: {
  item: WishlistItem;
  onDelete: () => void;
  onSchedule: () => void;
}) {
  const { locale } = useI18n();
  const { key: stampKey, color } = catStamp(item.category);

  const catLabels: Partial<Record<Category, [string, string]>> = {
    attraction:  ['Sight', 'אטרקציה'], food: ['Food', 'אוכל'], museum: ['Museum', 'מוזיאון'],
    beach: ['Beach', 'חוף'], hiking: ['Hiking', 'טיול רגלי'], shopping: ['Shopping', 'קניות'],
    nightlife: ['Nightlife', 'בילוי לילי'], cafe: ['Café', 'קפה'], art: ['Art', 'אמנות'],
    nature_walk: ['Nature', 'טבע'], spa: ['Spa', 'ספא'], other: ['Other', 'אחר'],
  };
  const [labelEn, labelHe] = catLabels[item.category] ?? ['Activity', 'פעילות'];
  const catLabel = locale === 'he' ? labelHe : labelEn;

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
      className="lg"
      style={{ padding: '14px 16px', borderRadius: 18 }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <StampIcon iconKey={stampKey} size={42} style={{ flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color, fontWeight: 700 }}>
              {catLabel}
            </span>
            {item.location && (
              <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icon name="pin" size={10} color="var(--text-3)" />
                {item.location}
              </span>
            )}
            {item.duration && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                {item.duration >= 60
                  ? `${Math.floor(item.duration / 60)}h${item.duration % 60 ? ` ${item.duration % 60}m` : ''}`
                  : `${item.duration}m`}
              </span>
            )}
          </div>
          {item.notes && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '6px 0 0', lineHeight: 1.5 }}>
              {item.notes}
            </p>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          aria-label="Remove from wish list"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-3)', opacity: 0.6, flexShrink: 0 }}
        >
          <Icon name="trash" size={15} color="currentColor" />
        </button>
      </div>

      {/* Schedule button */}
      <button
        onClick={onSchedule}
        style={{
          marginTop: 12, width: '100%', height: 40, border: 0, borderRadius: 12, cursor: 'pointer',
          background: 'var(--lg-forest)', color: '#fff',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}
      >
        <Icon name="compass" size={14} color="#fff" />
        {locale === 'he' ? 'תזמן לסדר היום' : 'Schedule to itinerary'}
      </button>
    </m.div>
  );
}

// ── Main WishlistSheet ─────────────────────────────────────────────────────────

interface WishlistSheetProps {
  onClose: () => void;
}

export default function WishlistSheet({ onClose }: WishlistSheetProps) {
  const { trip, deleteWishlistItem } = useAppStore();
  const { t, locale } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [schedulingItem, setSchedulingItem] = useState<WishlistItem | null>(null);

  const wishlist = trip?.wishlist ?? [];

  if (showAdd) {
    return <AddWishItemSheet onClose={() => setShowAdd(false)} />;
  }

  if (schedulingItem) {
    return <ScheduleSheet item={schedulingItem} onClose={() => setSchedulingItem(null)} />;
  }

  return (
    <Sheet
      title={locale === 'he' ? 'רשימת משאלות' : 'Wish List'}
      subtitle={locale === 'he' ? 'מקומות שאתה רוצה לבקר' : 'Places you want to visit'}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Add button */}
        <GlassBtn
          variant="accent"
          size="lg"
          onClick={() => setShowAdd(true)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Icon name="plus" size={16} color="#fff" />
          {locale === 'he' ? 'הוסף מקום' : 'Add a place'}
        </GlassBtn>

        {/* List */}
        {wishlist.length === 0 ? (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-3)' }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>✨</div>
            <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
              {locale === 'he'
                ? 'עדיין ריק — הוסף מקומות שאתה רוצה לבקר ותקבל המלצה מתי לשלב אותם.'
                : 'No items yet — add places you want to visit and get a recommendation for when to fit them in.'}
            </p>
          </m.div>
        ) : (
          <AnimatePresence>
            {wishlist.map(item => (
              <WishCard
                key={item.id}
                item={item}
                onDelete={() => deleteWishlistItem(item.id)}
                onSchedule={() => setSchedulingItem(item)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </Sheet>
  );
}
