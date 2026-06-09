'use client';

import React, { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { computeSeason } from '@/lib/season';
import type { BudgetTier, DurationBucket, PersonaStyle, QueryContext } from '@/lib/types';
import Sheet from './ui/Sheet';
import Btn from './ui/Btn';
import Icon from './ui/Icon';
import PlacesInput, { PlaceResult } from './ui/PlacesInput';

// ── Style options — all travel categories ─────────────────────────────────────

const STYLE_OPTIONS: { value: PersonaStyle; label: string; labelHe: string; emoji: string }[] = [
  { value: 'food',      label: 'Food & dining',     labelHe: 'אוכל',          emoji: '🍜' },
  { value: 'coffee',    label: 'Café & coffee',     labelHe: 'קפה',           emoji: '☕' },
  { value: 'bars',      label: 'Bars & drinks',     labelHe: 'ברים',          emoji: '🍺' },
  { value: 'nightlife', label: 'Nightlife',         labelHe: 'בילוי לילי',    emoji: '🎉' },
  { value: 'culture',   label: 'Culture & local',   labelHe: 'תרבות',         emoji: '🏛' },
  { value: 'museum',    label: 'Museums & history', labelHe: 'מוזיאונים',     emoji: '🖼' },
  { value: 'art',       label: 'Art & galleries',   labelHe: 'אמנות',         emoji: '🎨' },
  { value: 'nature',    label: 'Nature & parks',    labelHe: 'טבע',           emoji: '🌿' },
  { value: 'beach',     label: 'Beach & water',     labelHe: 'חוף ים',        emoji: '🏖' },
  { value: 'views',     label: 'Scenic views',      labelHe: 'נופים',         emoji: '🌅' },
  { value: 'shopping',  label: 'Shopping',          labelHe: 'קניות',         emoji: '🛍' },
  { value: 'adventure', label: 'Adventure & sport', labelHe: 'הרפתקאות',      emoji: '🧗' },
  { value: 'wellness',  label: 'Wellness & spa',    labelHe: 'ספא ורוגע',     emoji: '🧘' },
  { value: 'kids',      label: 'Family-friendly',   labelHe: 'משפחות וילדים', emoji: '👨‍👩‍👧' },
  { value: 'quiet',     label: 'Quiet & calm',      labelHe: 'שקט',           emoji: '🍃' },
  { value: 'other',     label: 'Custom',            labelHe: 'אחר',           emoji: '✏️' },
];

const DURATION_OPTIONS: { value: DurationBucket; label: string; labelHe: string }[] = [
  { value: 'short',    label: 'Under 2 hrs',  labelHe: 'פחות מ-2 שעות' },
  { value: 'half_day', label: 'Half day',     labelHe: 'חצי יום'        },
  { value: 'full_day', label: 'Full day',     labelHe: 'יום שלם'        },
];

const BUDGET_OPTIONS: { value: BudgetTier; label: string; labelHe: string }[] = [
  { value: 'low',  label: 'Free / Budget', labelHe: 'חינם / זול'  },
  { value: 'mid',  label: 'Mid-range',     labelHe: 'בינוני'       },
  { value: 'high', label: 'Splurge',       labelHe: 'יוקרה'        },
  { value: 'any',  label: 'Any',           labelHe: 'כל תקציב'     },
];

// ── Shared styles ─────────────────────────────────────────────────────────────

const SECTION_LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  color: 'var(--text-3)', marginBottom: 10,
};

const TEXT_INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--lg-panel)', border: '1px solid oklch(50% 0.02 60 / 18%)',
  borderRadius: 12, padding: '10px 14px', fontSize: 14,
  color: 'var(--lg-ink)', outline: 'none',
  fontFamily: 'var(--font-sans)',
  resize: 'none' as const,
};

// ── Chip row ─────────────────────────────────────────────────────────────────

function ChipRow<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string; emoji?: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="lg-btn"
            style={{
              height: 38, padding: '0 14px', fontSize: 13, fontWeight: active ? 700 : 500,
              background: active ? 'var(--lg-forest)' : 'var(--lg-panel)',
              color: active ? '#fff' : 'var(--lg-ink)',
              boxShadow: active
                ? '0 0 0 2px var(--lg-forest)'
                : 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
              transition: 'all 160ms ease',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {o.emoji && <span style={{ fontSize: 14 }}>{o.emoji}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── PersonaSheet ──────────────────────────────────────────────────────────────

interface PersonaSheetProps {
  dayNumber: number;
  onClose?: () => void;
}

export default function PersonaSheet({ dayNumber, onClose: onCloseProp }: PersonaSheetProps) {
  const { locale } = useI18n();
  const isHe = locale === 'he';

  const { trip, setShowPersona, setPersonaContext, setShowSuggestions } = useAppStore(
    useShallow(s => ({
      trip:               s.trip,
      setShowPersona:     s.setShowPersona,
      setPersonaContext:  s.setPersonaContext,
      setShowSuggestions: s.setShowSuggestions,
    }))
  );

  const dayMeta = trip?.dayMeta[dayNumber - 1];
  const hotel = useMemo(() => {
    return (trip?.hotels ?? []).find(
      h => h.checkInDay <= dayNumber && h.checkOutDay > dayNumber
    );
  }, [trip?.hotels, dayNumber]);

  const defaultCity = hotel?.location ?? dayMeta?.region ?? (trip?.countries?.[0] ?? '');
  const defaultLat  = hotel?.lat ?? dayMeta?.lat;
  const defaultLng  = hotel?.lng ?? dayMeta?.lng;

  const [style,    setStyle]    = useState<PersonaStyle | null>(null);
  const [freeText, setFreeText] = useState('');
  const [cityName, setCityName] = useState(defaultCity);
  const [cityLat,  setCityLat]  = useState<number | undefined>(defaultLat);
  const [cityLng,  setCityLng]  = useState<number | undefined>(defaultLng);
  const [area,     setArea]     = useState('');
  const [duration, setDuration] = useState<DurationBucket | null>(null);
  const [budget,   setBudget]   = useState<BudgetTier>('any');

  const handlePlaceSelect = (place: PlaceResult) => {
    setCityName(place.name);
    setCityLat(place.lat);
    setCityLng(place.lng);
  };

  const season = useMemo(() => {
    if (!trip?.startDate) return 'summer' as const;
    const start = new Date(trip.startDate);
    start.setDate(start.getDate() + (dayNumber - 1));
    const lat = dayMeta?.lat ?? 31.5;
    return computeSeason(start, lat);
  }, [trip?.startDate, dayNumber, dayMeta?.lat]);

  const canSubmit = style !== null && duration !== null && cityName.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || !style || !duration) return;

    const ctx: QueryContext = {
      country:         trip?.countries?.[0],
      region:          dayMeta?.region,
      city:            cityName.trim(),
      area:            area.trim() || undefined,
      lat:             cityLat ?? defaultLat,
      lng:             cityLng ?? defaultLng,
      radius_km:       5,
      style,
      style_detail:    freeText.trim() || undefined,
      duration_bucket: duration,
      budget_tier:     budget,
      season,
      dayNumber,
      tripName:        trip?.name ?? '',
      locale,
    };

    setPersonaContext(ctx);
    setShowPersona(false);
    setShowSuggestions(true);
  };

  const t = (en: string, he: string) => isHe ? he : en;

  return (
    <Sheet
      title={t('What are you after?', 'מה מחפשים?')}
      onClose={() => { setShowPersona(false); onCloseProp?.(); }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '4px 0 24px' }}>

        {/* 1. Category */}
        <div>
          <div style={SECTION_LABEL}>{t('What kind of place?', 'איזה סוג מקום?')}</div>
          <ChipRow
            options={STYLE_OPTIONS.map(o => ({
              value: o.value,
              label: isHe ? o.labelHe : o.label,
              emoji: o.emoji,
            }))}
            value={style}
            onChange={setStyle}
          />
        </div>

        {/* 2. Free-text — always visible */}
        <div>
          <div style={SECTION_LABEL}>{t('Anything specific? (optional)', 'משהו ספציפי? (אופציונלי)')}</div>
          <textarea
            rows={2}
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder={t(
              'e.g. rooftop terrace, dog-friendly, authentic local, hidden gem…',
              'למשל: גג עם נוף, פט-פרנדלי, מקומי ואותנטי, מקום נסתר…',
            )}
            maxLength={300}
            style={{ ...TEXT_INPUT, lineHeight: 1.5 }}
          />
        </div>

        {/* 3. Location */}
        <div>
          <div style={SECTION_LABEL}>{t('Where?', 'איפה?')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <PlacesInput
              placeholder={t('City or area', 'עיר או אזור')}
              value={cityName}
              onChange={name => { setCityName(name); setCityLat(undefined); setCityLng(undefined); }}
              onSelect={handlePlaceSelect}
            />
            <input
              type="text"
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder={t('Specific neighbourhood (optional)', 'שכונה ספציפית (אופציונלי)')}
              maxLength={200}
              style={{ ...TEXT_INPUT, height: 42 }}
            />
          </div>
        </div>

        {/* 4. Duration */}
        <div>
          <div style={SECTION_LABEL}>{t('How long do you have?', 'כמה זמן?')}</div>
          <ChipRow
            options={DURATION_OPTIONS.map(o => ({ value: o.value, label: isHe ? o.labelHe : o.label }))}
            value={duration}
            onChange={setDuration}
          />
        </div>

        {/* 5. Budget */}
        <div>
          <div style={SECTION_LABEL}>{t('Budget', 'תקציב')}</div>
          <ChipRow
            options={BUDGET_OPTIONS.map(o => ({ value: o.value, label: isHe ? o.labelHe : o.label }))}
            value={budget}
            onChange={setBudget}
          />
        </div>

        {/* Submit */}
        <Btn
          kind="terra"
          full
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{ height: 52, fontSize: 15, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Icon name="sparkle" size={16} color="#fff" />
          {t('Find spots', 'מצא לי מקומות')}
        </Btn>

      </div>
    </Sheet>
  );
}
