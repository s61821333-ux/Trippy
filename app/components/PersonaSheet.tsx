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

// ── Chip selector helper ──────────────────────────────────────────────────────

function ChipRow<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
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
              height: 38, padding: '0 16px', fontSize: 13, fontWeight: active ? 700 : 500,
              background: active ? 'var(--lg-forest)' : 'var(--lg-panel)',
              color: active ? '#fff' : 'var(--lg-ink)',
              boxShadow: active
                ? '0 0 0 2px var(--lg-forest)'
                : 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
              transition: 'all 160ms ease',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--text-3)', marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

// ── PersonaSheet ──────────────────────────────────────────────────────────────

interface PersonaSheetProps {
  dayNumber: number;
}

const STYLE_OPTIONS: { value: PersonaStyle; label: string; labelHe: string }[] = [
  { value: 'food',    label: 'Food',    labelHe: 'אוכל' },
  { value: 'bars',    label: 'Bars',    labelHe: 'ברים' },
  { value: 'quiet',   label: 'Quiet',   labelHe: 'שקט' },
  { value: 'relaxed', label: 'Relaxed', labelHe: 'ריגלאקס' },
  { value: 'other',   label: 'Other',   labelHe: 'אחר' },
];

const DURATION_OPTIONS: { value: DurationBucket; label: string; labelHe: string }[] = [
  { value: 'short',    label: '< 2 hrs',   labelHe: 'פחות מ-2 שעות' },
  { value: 'half_day', label: 'Half day',  labelHe: 'חצי יום' },
  { value: 'full_day', label: 'Full day',  labelHe: 'יום שלם' },
];

const BUDGET_OPTIONS: { value: BudgetTier; label: string; labelHe: string }[] = [
  { value: 'low',  label: 'Free / Budget', labelHe: 'חינם / זול' },
  { value: 'mid',  label: 'Mid',           labelHe: 'בינוני' },
  { value: 'high', label: 'Splurge',       labelHe: 'יוקרה' },
  { value: 'any',  label: 'Any',           labelHe: 'כל תקציב' },
];

export default function PersonaSheet({ dayNumber }: PersonaSheetProps) {
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
  // Default to hotel for this day, falling back to dayMeta region
  const hotel = useMemo(() => {
    return (trip?.hotels ?? []).find(
      h => h.checkInDay <= dayNumber && h.checkOutDay > dayNumber
    );
  }, [trip?.hotels, dayNumber]);

  const defaultCity = hotel?.location ?? dayMeta?.region ?? (trip?.countries?.[0] ?? '');
  const defaultLat  = hotel?.lat ?? dayMeta?.lat;
  const defaultLng  = hotel?.lng ?? dayMeta?.lng;

  const [style, setStyle]             = useState<PersonaStyle | null>(null);
  const [styleDetail, setStyleDetail]   = useState('');
  const [cityName, setCityName]         = useState(defaultCity);
  const [cityLat, setCityLat]           = useState<number | undefined>(defaultLat);
  const [cityLng, setCityLng]           = useState<number | undefined>(defaultLng);
  const [area, setArea]                 = useState('');
  const [duration, setDuration]         = useState<DurationBucket | null>(null);
  const [budget, setBudget]             = useState<BudgetTier>('any');

  const handlePlaceSelect = (place: PlaceResult) => {
    setCityName(place.name);
    setCityLat(place.lat);
    setCityLng(place.lng);
  };

  // Derive season from trip start date + day offset + lat
  const season = useMemo(() => {
    if (!trip?.startDate) return 'summer' as const;
    const start = new Date(trip.startDate);
    start.setDate(start.getDate() + (dayNumber - 1));
    const lat = dayMeta?.lat ?? 31.5; // default northern hemisphere
    return computeSeason(start, lat);
  }, [trip?.startDate, dayNumber, dayMeta?.lat]);

  const canSubmit = style !== null && duration !== null && cityName.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || !style || !duration) return;

    const ctx: QueryContext = {
      country:        trip?.countries?.[0],
      region:         dayMeta?.region,
      city:           cityName.trim(),
      area:           area.trim() || undefined,
      lat:            cityLat ?? defaultLat,
      lng:            cityLng ?? defaultLng,
      radius_km:      5,
      style,
      style_detail:   style === 'other' && styleDetail.trim() ? styleDetail.trim() : undefined,
      duration_bucket: duration,
      budget_tier:    budget,
      season,
      dayNumber,
      tripName:       trip?.name ?? '',
      locale,
    };

    setPersonaContext(ctx);
    setShowPersona(false);
    setShowSuggestions(true);
  };

  const t = (en: string, he: string) => isHe ? he : en;

  return (
    <Sheet
      title={t('Find your perfect spots', 'מצא את המקומות המושלמים')}
      onClose={() => setShowPersona(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '4px 0 24px' }}>

        {/* 1. Style */}
        <div>
          <Label>{t('What are you in the mood for?', 'במה אתה בא להיות?')}</Label>
          <ChipRow
            options={STYLE_OPTIONS.map(o => ({ value: o.value, label: isHe ? o.labelHe : o.label }))}
            value={style}
            onChange={setStyle}
          />
          {style === 'other' && (
            <input
              type="text"
              value={styleDetail}
              onChange={e => setStyleDetail(e.target.value)}
              placeholder={t('Describe what you want…', 'תאר מה אתה מחפש…')}
              maxLength={200}
              style={{
                marginTop: 10, width: '100%', boxSizing: 'border-box',
                background: 'var(--lg-panel)', border: '1px solid oklch(50% 0.02 60 / 18%)',
                borderRadius: 12, padding: '10px 14px', fontSize: 14,
                color: 'var(--lg-ink)', outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
          )}
        </div>

        {/* 2. Location */}
        <div>
          <Label>{t('Where?', 'איפה?')}</Label>
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
              placeholder={t('Specific neighbourhood (optional) — e.g. "Old City"', 'שכונה ספציפית (אופציונלי)')}
              maxLength={200}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--lg-panel)', border: '1px solid oklch(50% 0.02 60 / 18%)',
                borderRadius: 12, padding: '10px 14px', fontSize: 13,
                color: 'var(--lg-ink)', outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>
        </div>

        {/* 3. Duration */}
        <div>
          <Label>{t('How much time do you have?', 'כמה זמן יש לך?')}</Label>
          <ChipRow
            options={DURATION_OPTIONS.map(o => ({ value: o.value, label: isHe ? o.labelHe : o.label }))}
            value={duration}
            onChange={setDuration}
          />
        </div>

        {/* 4. Budget */}
        <div>
          <Label>{t('Budget (optional)', 'תקציב (אופציונלי)')}</Label>
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
          {t('Find my spots', 'מצא לי מקומות')}
        </Btn>

      </div>
    </Sheet>
  );
}
