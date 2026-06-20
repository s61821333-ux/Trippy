'use client';

import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { computeSeason } from '@/lib/season';
import type { BudgetTier, DurationBucket, QueryContext } from '@/lib/types';
import Sheet from './ui/Sheet';
import Btn from './ui/Btn';
import Icon from './ui/Icon';
import PlacesInput, { PlaceResult } from './ui/PlacesInput';

// ── All event categories ──────────────────────────────────────────────────────

const STYLE_OPTIONS: { value: string; label: string; labelHe: string; icon: string }[] = [
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

// ── Mood intents ──────────────────────────────────────────────────────────────
type IntentId = 'eat' | 'see' | 'do' | 'relax' | 'night';

const INTENTS: {
  id: IntentId; label: string; labelHe: string;
  icon: Parameters<typeof Icon>[0]['name'];
  color: string; glow: string; subs: string[];
}[] = [
  { id: 'eat',   label: 'Eat & Drink',      labelHe: 'אוכל ושתייה',   icon: 'fork',
    color: 'oklch(58% 0.18 42)',  glow: 'oklch(65% 0.18 40 / 30%)',
    subs: ['food', 'cafe', 'market', 'winery', 'cooking'] },
  { id: 'see',   label: 'Sights & Culture', labelHe: 'אתרים ותרבות',  icon: 'compass',
    color: 'oklch(48% 0.14 225)', glow: 'oklch(52% 0.15 225 / 26%)',
    subs: ['attraction', 'museum', 'art', 'cultural', 'religious', 'photography', 'national_park', 'guided_tour'] },
  { id: 'do',    label: 'Active & Outdoors', labelHe: 'פעילות וטבע',  icon: 'sun',
    color: 'var(--brand)',        glow: 'oklch(45% 0.15 152 / 25%)',
    subs: ['hiking', 'nature_walk', 'cycling', 'boat', 'water_sports', 'ski', 'aerial', 'golf', 'safari', 'sport', 'cruise', 'farm', 'picnic', 'theme_park'] },
  { id: 'relax', label: 'Relax',            labelHe: 'רגיעה',          icon: 'tent',
    color: 'oklch(50% 0.13 155)', glow: 'oklch(52% 0.14 155 / 25%)',
    subs: ['beach', 'rest', 'spa', 'wellness', 'hot_springs'] },
  { id: 'night', label: 'Nightlife & Fun',  labelHe: 'בילוי',          icon: 'music',
    color: 'oklch(48% 0.14 300)', glow: 'oklch(52% 0.15 300 / 24%)',
    subs: ['nightlife', 'concert', 'theater', 'cinema', 'festival', 'shopping'] },
];

const STYLE_BY_VALUE = new Map(STYLE_OPTIONS.map(o => [o.value, o]));

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

// ── Chip row ──────────────────────────────────────────────────────────────────

function ChipRow<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string; icon?: string }[];
  value: T[];
  onChange: (v: T) => void;
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
              height: 38, padding: '0 13px', fontSize: 13,
              fontWeight: active ? 700 : 500,
              background: active ? 'var(--lg-forest)' : 'var(--surface-2)',
              color: active ? '#fff' : 'var(--lg-ink)',
              boxShadow: active ? 'var(--lg-glow-forest)' : 'var(--shadow-xs)',
              transition: 'all var(--dur-fast)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {o.icon && (
              <Icon
                name={o.icon as Parameters<typeof Icon>[0]['name']}
                size={12}
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

  const [selectedIntents, setSelectedIntents] = useState<IntentId[]>([]);
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

  const visibleSubs = useMemo(() => {
    if (selectedIntents.length === 0) return [];
    const wanted = new Set(INTENTS.filter(i => selectedIntents.includes(i.id)).flatMap(i => i.subs));
    return STYLE_OPTIONS.filter(o => wanted.has(o.value));
  }, [selectedIntents]);

  const toggleStyle = (v: string) => {
    setStyles(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const toggleIntent = (id: IntentId) => {
    const intent = INTENTS.find(i => i.id === id);
    if (!intent) return;
    setSelectedIntents(prev => {
      const on = prev.includes(id);
      if (on) {
        const subs = new Set(intent.subs);
        setStyles(s => s.filter(v => !subs.has(v)));
        return prev.filter(x => x !== id);
      }
      setStyles(s => (s.includes(intent.subs[0]) ? s : [...s, intent.subs[0]]));
      return [...prev, id];
    });
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
      subtitle={defaultCity ? `${t('Day', 'יום')} ${dayNumber} · ${defaultCity}` : undefined}
      onClose={() => { setShowPersona(false); onCloseProp?.(); }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: '4px 0 24px' }}>

        {/* 1. Mood — large visual intent cards */}
        <div>
          <div style={SECTION_LABEL}>{t('What are you in the mood for?', 'מה בא לכם?')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {INTENTS.map((intent, idx) => {
              const active = selectedIntents.includes(intent.id);
              return (
                <m.button
                  key={intent.id}
                  type="button"
                  onClick={() => toggleIntent(intent.id)}
                  aria-pressed={active}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.22 }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 7, padding: '14px 8px 12px',
                    border: active ? `2px solid ${intent.color}` : '2px solid transparent',
                    borderRadius: 18, cursor: 'pointer',
                    background: active
                      ? `oklch(from ${intent.color} l c h / 12%)`
                      : 'var(--surface-2)',
                    boxShadow: active
                      ? `0 4px 16px ${intent.glow}`
                      : 'var(--shadow-xs)',
                    transition: 'all var(--dur-fast)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active
                      ? `oklch(from ${intent.color} l c h / 18%)`
                      : 'oklch(50% 0.02 60 / 7%)',
                    transition: 'background var(--dur-fast)',
                  }}>
                    <Icon
                      name={intent.icon}
                      size={20}
                      color={active ? intent.color : 'var(--text-3)'}
                    />
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    color: active ? intent.color : 'var(--text-2)',
                    lineHeight: 1.2, textAlign: 'center',
                    transition: 'color var(--dur-fast)',
                  }}>
                    {isHe ? intent.labelHe : intent.label}
                  </span>
                </m.button>
              );
            })}
          </div>
        </div>

        {/* 2. Refine subtypes (revealed after mood selection) */}
        <AnimatePresence>
          {visibleSubs.length > 0 && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24 }}
            >
              <div style={SECTION_LABEL}>{t('Refine the vibe', 'דייקו את הסגנון')}</div>
              <ChipRow
                options={visibleSubs.map(o => ({ value: o.value, label: isHe ? o.labelHe : o.label, icon: o.icon }))}
                value={styles}
                onChange={toggleStyle}
              />
              <textarea
                rows={2}
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                placeholder={t(
                  'Anything specific? e.g. rooftop terrace, hidden gem… (optional)',
                  'משהו ספציפי? למשל גג עם נוף, מקום נסתר… (אופציונלי)',
                )}
                maxLength={300}
                style={{ ...TEXT_INPUT, lineHeight: 1.5, marginTop: 12 }}
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* 3. Location */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <div style={{ ...SECTION_LABEL, margin: 0 }}>{t('Where? *', 'איפה? *')}</div>
            {locationErr && (
              <span style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                {t('Required', 'חובה')}
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
          <div style={{ display: 'flex', gap: 8 }}>
            {DURATION_OPTIONS.map(o => {
              const active = duration === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setDuration(o.value)}
                  style={{
                    flex: 1, height: 44, border: 0, borderRadius: 12, cursor: 'pointer',
                    background: active ? 'var(--lg-forest)' : 'var(--surface-2)',
                    color: active ? '#fff' : 'var(--lg-ink)',
                    fontFamily: 'var(--font-sans)', fontWeight: active ? 700 : 500, fontSize: 13,
                    boxShadow: active ? 'var(--lg-glow-forest)' : 'var(--shadow-xs)',
                    transition: 'all var(--dur-fast)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {isHe ? o.labelHe : o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Budget */}
        <div>
          <div style={SECTION_LABEL}>{t('Budget', 'תקציב')}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BUDGET_OPTIONS.map(o => {
              const active = budget === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setBudget(o.value)}
                  style={{
                    flex: '1 1 80px', height: 40, border: 0, borderRadius: 12, cursor: 'pointer',
                    background: active ? 'var(--lg-forest)' : 'var(--surface-2)',
                    color: active ? '#fff' : 'var(--lg-ink)',
                    fontFamily: 'var(--font-sans)', fontWeight: active ? 700 : 500, fontSize: 13,
                    boxShadow: active ? 'var(--lg-glow-forest)' : 'var(--shadow-xs)',
                    transition: 'all var(--dur-fast)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {isHe ? o.labelHe : o.label}
                </button>
              );
            })}
          </div>
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
