'use client';

import React, { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { computeSeason } from '@/lib/season';
import type { BudgetTier, DurationBucket, QueryContext } from '@/lib/types';
import Sheet from './ui/Sheet';
import Btn from './ui/Btn';
import Icon from './ui/Icon';
import PlacesInput, { PlaceResult } from './ui/PlacesInput';

// ── All event categories — icons match DayDetail_V2 CATS_CORE + CATS_EXTENDED ──

const STYLE_OPTIONS: { value: string; label: string; labelHe: string; icon: string }[] = [
  // Core
  { value: 'food',         label: 'Food',          labelHe: 'אוכל',           icon: 'fork'    },
  { value: 'cafe',         label: 'Café',          labelHe: 'קפה',            icon: 'cup'     },
  { value: 'attraction',   label: 'Sights',        labelHe: 'אטרקציה',        icon: 'pin'     },
  { value: 'museum',       label: 'Museum',        labelHe: 'מוזיאון',        icon: 'compass' },
  { value: 'beach',        label: 'Beach',         labelHe: 'חוף',            icon: 'wave'    },
  { value: 'sport',        label: 'Sport',         labelHe: 'ספורט',          icon: 'users'   },
  { value: 'concert',      label: 'Concert',       labelHe: 'קונצרט',         icon: 'music'   },
  { value: 'theme_park',   label: 'Theme Park',    labelHe: 'פארק שעשועים',   icon: 'star'    },
  { value: 'shopping',     label: 'Shopping',      labelHe: 'קניות',          icon: 'tag'     },
  { value: 'nightlife',    label: 'Nightlife',     labelHe: 'בילוי לילי',     icon: 'music'   },
  { value: 'rest',         label: 'Rest',          labelHe: 'מנוחה',          icon: 'tent'    },
  { value: 'other',        label: 'Other',         labelHe: 'אחר',            icon: 'grid'    },
  // Extended
  { value: 'hiking',       label: 'Hiking',        labelHe: 'טיול רגלי',      icon: 'compass' },
  { value: 'nature_walk',  label: 'Nature',        labelHe: 'טבע',            icon: 'sun'     },
  { value: 'cycling',      label: 'Cycling',       labelHe: 'רכיבה',          icon: 'bike'    },
  { value: 'boat',         label: 'Boat',          labelHe: 'סירה',           icon: 'ship'    },
  { value: 'water_sports', label: 'Water Sports',  labelHe: 'ספורט מים',      icon: 'wave'    },
  { value: 'ski',          label: 'Ski',           labelHe: 'סקי',            icon: 'arrow'   },
  { value: 'aerial',       label: 'Aerial',        labelHe: 'אוויר',          icon: 'plane'   },
  { value: 'golf',         label: 'Golf',          labelHe: 'גולף',           icon: 'sun'     },
  { value: 'safari',       label: 'Safari',        labelHe: 'ספארי',          icon: 'compass' },
  { value: 'winery',       label: 'Winery',        labelHe: 'יקב',            icon: 'cup'     },
  { value: 'cooking',      label: 'Cooking',       labelHe: 'בישול',          icon: 'fork'    },
  { value: 'theater',      label: 'Theater',       labelHe: 'תיאטרון',        icon: 'film'    },
  { value: 'cinema',       label: 'Cinema',        labelHe: 'קולנוע',         icon: 'film'    },
  { value: 'art',          label: 'Art',           labelHe: 'אמנות',          icon: 'camera'  },
  { value: 'festival',     label: 'Festival',      labelHe: 'פסטיבל',         icon: 'ticket'  },
  { value: 'market',       label: 'Market',        labelHe: 'שוק',            icon: 'fork'    },
  { value: 'spa',          label: 'Spa',           labelHe: 'ספא',            icon: 'hot'     },
  { value: 'wellness',     label: 'Wellness',      labelHe: 'בריאות',         icon: 'hot'     },
  { value: 'hot_springs',  label: 'Hot Springs',   labelHe: 'מעיינות חמים',   icon: 'hot'     },
  { value: 'photography',  label: 'Photography',   labelHe: 'צילום',          icon: 'camera'  },
  { value: 'guided_tour',  label: 'Guided Tour',   labelHe: 'סיור מודרך',     icon: 'users'   },
  { value: 'national_park',label: 'National Park', labelHe: 'פארק לאומי',     icon: 'sun'     },
  { value: 'cultural',     label: 'Cultural',      labelHe: 'תרבות',          icon: 'pin'     },
  { value: 'religious',    label: 'Religious',     labelHe: 'דתי',            icon: 'tent'    },
  { value: 'picnic',       label: 'Picnic',        labelHe: 'פיקניק',         icon: 'sun'     },
  { value: 'cruise',       label: 'Cruise',        labelHe: 'שייט',           icon: 'ship'    },
  { value: 'farm',         label: 'Farm',          labelHe: 'חווה',           icon: 'tent'    },
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

// ── Chip row (supports single and multi-select, Trippy icons) ────────────────

function ChipRow<T extends string>({
  options, value, onChange, multi = false,
}: {
  options: { value: T; label: string; icon?: string }[];
  value: T[];
  onChange: (v: T) => void;
  multi?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const active = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="lg-btn"
            style={{
              height: 44, padding: '0 12px', fontSize: 13, fontWeight: active ? 700 : 500,
              background: active ? 'var(--lg-forest)' : 'var(--lg-panel)',
              color: active ? '#fff' : 'var(--lg-ink)',
              boxShadow: active
                ? '0 0 0 2px var(--lg-forest)'
                : 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
              transition: 'all 160ms ease',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {o.icon && (
              <Icon
                name={o.icon as Parameters<typeof Icon>[0]['name']}
                size={13}
                color={active ? '#fff' : 'var(--text-3)'}
              />
            )}
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

  const defaultCity = dayMeta?.region || hotel?.location || (trip?.countries?.[0] ?? '');
  const defaultLat  = dayMeta?.lat ?? hotel?.lat;
  const defaultLng  = dayMeta?.lng ?? hotel?.lng;

  const [styles,      setStyles]      = useState<string[]>([]);
  const [freeText,    setFreeText]    = useState('');
  const [cityName,    setCityName]    = useState(defaultCity);
  const [cityLat,     setCityLat]     = useState<number | undefined>(defaultLat);
  const [cityLng,     setCityLng]     = useState<number | undefined>(defaultLng);
  const [area,        setArea]        = useState('');
  const [duration,    setDuration]    = useState<DurationBucket | null>(null);
  const [budget,      setBudget]      = useState<BudgetTier>('any');
  const [locationErr, setLocationErr] = useState(false);

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

  const canSubmit = styles.length > 0 && duration !== null && cityName.trim().length > 0;

  const toggleStyle = (v: string) => {
    setStyles(prev =>
      prev.includes(v) ? (prev.length > 1 ? prev.filter(x => x !== v) : prev) : [...prev, v]
    );
  };

  const handleSubmit = () => {
    if (!cityName.trim()) { setLocationErr(true); return; }
    if (!canSubmit || !duration) return;

    const ctx: QueryContext = {
      country:         trip?.countries?.[0],
      region:          dayMeta?.region,
      city:            cityName.trim(),
      area:            area.trim() || undefined,
      lat:             cityLat ?? defaultLat,
      lng:             cityLng ?? defaultLng,
      radius_km:       5,
      style:           styles[0],
      styles,
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

        {/* 1. Category — multi-select */}
        <div>
          <div style={SECTION_LABEL}>{t('What kind of place? (pick one or more)', 'איזה סוג מקום? (בחר אחד או יותר)')}</div>
          <ChipRow
            options={STYLE_OPTIONS.map(o => ({
              value: o.value,
              label: isHe ? o.labelHe : o.label,
              icon: o.icon,
            }))}
            value={styles}
            onChange={toggleStyle}
            multi
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

        {/* 3. Location — required */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <div style={{ ...SECTION_LABEL, margin: 0 }}>{t('Where? *', 'איפה? *')}</div>
            {locationErr && (
              <span style={{ fontSize: 11, color: 'var(--danger, #e05252)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                {t('Required — enter a city or area', 'חובה — הזן עיר או אזור')}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <PlacesInput
              placeholder={t('City or area', 'עיר או אזור')}
              value={cityName}
              onChange={name => { setCityName(name); setCityLat(undefined); setCityLng(undefined); if (name.trim()) setLocationErr(false); }}
              onSelect={p => { handlePlaceSelect(p); setLocationErr(false); }}
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
            value={duration ? [duration] : []}
            onChange={v => setDuration(v as DurationBucket)}
          />
        </div>

        {/* 5. Budget */}
        <div>
          <div style={SECTION_LABEL}>{t('Budget', 'תקציב')}</div>
          <ChipRow
            options={BUDGET_OPTIONS.map(o => ({ value: o.value, label: isHe ? o.labelHe : o.label }))}
            value={[budget]}
            onChange={v => setBudget(v as BudgetTier)}
          />
        </div>

        {/* Submit */}
        <Btn
          kind="terra"
          full
          disabled={styles.length === 0 || duration === null}
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
