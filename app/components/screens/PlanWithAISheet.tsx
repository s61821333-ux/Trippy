'use client';

import React, { useState, useRef } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import Sheet from '../ui/Sheet';
import Field from '../ui/Field';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useToast } from '../ui/Toast';
import { CURRENCIES } from '@/lib/currency';
import { TripTheme } from '@/lib/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlanDay {
  dayNumber:   number;
  region:      string;
  description: string;
  events:      PlanEvent[];
}

interface PlanEvent {
  time:      string;
  name:      string;
  category:  string;
  duration:  number;
  location?: string;
  cost?:     number;
  notes?:    string;
}

interface TripPlan {
  name:            string;
  theme:           TripTheme;
  countries:       string[];
  estimatedBudget: number;
  currency:        string;
  days:            PlanDay[];
  packingList:     string[];
  tips:            string[];
}

// ── Options ───────────────────────────────────────────────────────────────────

const TRAVELER_OPTIONS = [
  { id: 'solo',    en: 'Solo',    he: 'לבד',    stamp: 'avatar'   },
  { id: 'couple',  en: 'Couple',  he: 'זוג',    stamp: 'avatar'   },
  { id: 'family',  en: 'Family',  he: 'משפחה',  stamp: 'group'    },
  { id: 'friends', en: 'Friends', he: 'חברים',  stamp: 'group'    },
];

const PACE_OPTIONS = [
  { id: 'relaxed',  en: 'Relaxed',       he: 'רגוע',   stamp: 'palm_tree', desc: 'Few activities, lots of breathing room' },
  { id: 'balanced', en: 'Balanced',      he: 'מאוזן',  stamp: 'compass',   desc: '3-4 activities per day'                },
  { id: 'packed',   en: 'Action-packed', he: 'עמוס',   stamp: 'hiking',    desc: 'Make the most of every hour'           },
];

const INTEREST_OPTIONS = [
  { id: 'food',      en: 'Food & dining',   he: 'אוכל',       stamp: 'noodles'  },
  { id: 'culture',   en: 'Culture & local', he: 'תרבות',      stamp: 'museum'   },
  { id: 'nature',    en: 'Nature & hikes',  he: 'טבע',        stamp: 'leaf'     },
  { id: 'beach',     en: 'Beach & water',   he: 'חוף ים',     stamp: 'beach'    },
  { id: 'art',       en: 'Art & museums',   he: 'אמנות',      stamp: 'painting' },
  { id: 'nightlife', en: 'Nightlife',       he: 'לילה',       stamp: 'nightlife'},
  { id: 'shopping',  en: 'Shopping',        he: 'קניות',      stamp: 'shopping' },
  { id: 'adventure', en: 'Adventure',       he: 'הרפתקאות',   stamp: 'hiking'   },
];

const BUDGET_OPTIONS = [
  { id: 'budget',  en: 'Budget',    he: 'חסכוני', stamp: 'cash',  desc: 'Hostels, street food, free attractions'  },
  { id: 'mid',     en: 'Mid-range', he: 'בינוני', stamp: 'card',  desc: 'Hotels, restaurants, some paid tours'     },
  { id: 'luxury',  en: 'Luxury',    he: 'יוקרה',  stamp: 'hotel', desc: 'Premium hotels, fine dining, VIP access'  },
];

const VALID_THEMES: TripTheme[] = ['desert','nature','city','beach','mountain','lake','sunset'];
function safeTheme(raw: unknown): TripTheme {
  return VALID_THEMES.includes(raw as TripTheme) ? (raw as TripTheme) : 'city';
}

const PROGRESS_MSGS = [
  'Scouting the best spots…',
  'Planning perfect meals…',
  'Mapping your route…',
  'Finding hidden gems…',
  'Checking opening hours…',
  'Estimating costs…',
  'Almost ready…',
];

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepTrack({ step }: { step: 'form' | 'generating' | 'preview' }) {
  const steps = ['form', 'generating', 'preview'] as const;
  const idx = steps.indexOf(step);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: i <= idx
              ? 'linear-gradient(145deg, var(--lg-terra-bright), var(--lg-terra))'
              : 'var(--surface-2)',
            boxShadow: i === idx ? '0 3px 12px oklch(65% 0.18 40 / 30%)' : 'none',
            transition: 'all var(--dur-slow)',
          }}>
            {i < idx ? (
              <Icon name="check" size={13} color="#fff" />
            ) : (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                color: i <= idx ? '#fff' : 'var(--text-3)',
              }}>{i + 1}</span>
            )}
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, borderRadius: 1, margin: '0 4px',
              background: i < idx
                ? 'linear-gradient(90deg, var(--lg-terra), var(--lg-terra-bright))'
                : 'var(--surface-2)',
              transition: 'background var(--dur-slow)',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── ChipGroup ─────────────────────────────────────────────────────────────────

function ChipGroup<T extends string>({
  label, options, selected, onSelect, multi = false, isHe,
}: {
  label: string;
  options: { id: T; en: string; he: string; stamp: string; desc?: string }[];
  selected: T[];
  onSelect: (id: T) => void;
  multi?: boolean;
  isHe: boolean;
}) {
  return (
    <div>
      <p style={sectionLabel}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              style={{
                border: 0, cursor: 'pointer', borderRadius: 9999,
                padding: '8px 14px 8px 8px',
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                background: active ? 'var(--lg-forest)' : 'var(--surface-2)',
                color: active ? '#fff' : 'var(--text-2)',
                boxShadow: active ? 'var(--lg-glow-forest)' : 'var(--shadow-xs)',
                transition: 'all var(--dur-base)',
                WebkitTapHighlightColor: 'transparent',
                outline: active ? 'none' : undefined,
              }}
            >
              <StampIcon iconKey={opt.stamp} size={26} />
              {isHe ? opt.he : opt.en}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Generating view ───────────────────────────────────────────────────────────

function StepGenerating({ progress, totalDays, locale }: {
  progress: number; totalDays: number; locale: string;
}) {
  const isHe   = locale === 'he';
  const pct    = totalDays > 0 ? Math.round((progress / totalDays) * 100) : 0;
  const msgIdx = Math.min(Math.max(0, progress), PROGRESS_MSGS.length - 1);
  const reduce = useReducedMotion();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '16px 0 24px' }}>
      {/* Pulsing orb stack */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 28 }}>
        {[1.6, 1.3, 1.0].map((scale, i) => (
          <m.div
            key={i}
            animate={reduce ? { scale, opacity: 0.15 } : { scale: [scale, scale * 1.08, scale], opacity: [0.12, 0.20, 0.12] }}
            transition={reduce ? {} : { duration: 2.2, delay: i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'radial-gradient(circle, var(--lg-terra) 0%, transparent 70%)',
            }}
          />
        ))}
        {/* Spinning compass */}
        <m.div
          animate={reduce ? {} : { rotate: 360 }}
          transition={reduce ? {} : { duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: 'linear-gradient(145deg, var(--lg-terra-bright), var(--lg-terra))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px oklch(65% 0.18 40 / 40%)',
          }}>
            <Icon name="compass" size={36} color="#fff" />
          </div>
        </m.div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 24, color: 'var(--lg-ink)', margin: '0 0 8px', lineHeight: 1.2 }}>
          {isHe ? 'מתכנן את המסלול…' : 'Crafting your journey…'}
        </p>
        <AnimatePresence mode="wait">
          <m.p
            key={msgIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
            style={{ fontSize: 13.5, color: 'var(--text-3)', margin: 0 }}
          >
            {PROGRESS_MSGS[msgIdx]}
          </m.p>
        </AnimatePresence>
      </div>

      {totalDays > 0 && (
        <div style={{ width: '100%', maxWidth: 280 }}>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden', marginBottom: 8 }}>
            <m.div
              animate={{ width: `${Math.max(5, pct)}%` }}
              transition={{ type: 'spring', stiffness: 55, damping: 18 }}
              style={{
                height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, var(--lg-terra-bright), var(--lg-terra))',
                boxShadow: '0 0 8px oklch(65% 0.18 40 / 40%)',
              }}
            />
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            {isHe ? `יום ${progress} מתוך ${totalDays}` : `Day ${progress} of ${totalDays}`}
            {pct > 0 && ` · ${pct}%`}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

function StepPreview({ plan, locale, onConfirm, creating }: {
  plan: TripPlan; locale: string; onConfirm: () => void; creating: boolean;
}) {
  const isHe = locale === 'he';
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const totalCost = plan.days.reduce(
    (s, d) => s + d.events.reduce((es, ev) => es + (ev.cost ?? 0), 0), 0,
  );

  const stats = [
    { icon: 'calendar' as const, text: `${plan.days.length} ${isHe ? 'ימים' : 'days'}` },
    { icon: 'pin' as const,      text: plan.countries.join(', ') },
    ...(totalCost > 0 ? [{ icon: 'coins' as const, text: `~${plan.currency} ${totalCost.toLocaleString()}` }] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Hero card */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: 22, padding: '20px 20px 18px',
          background: 'linear-gradient(145deg, var(--lg-terra-bright) 0%, var(--lg-terra) 55%, oklch(48% 0.125 30) 100%)',
          boxShadow: '0 8px 32px oklch(65% 0.18 40 / 30%)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative orbs */}
        <div aria-hidden style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', margin: '0 0 5px' }}>
          {isHe ? 'המסלול שלך' : 'Your trip plan'}
        </p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 28, color: '#fff', margin: '0 0 14px', lineHeight: 1.1 }}>
          {plan.name}
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {stats.map(c => (
            <span key={c.icon} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.16)', borderRadius: 9999,
              padding: '4px 11px', fontSize: 11.5, fontWeight: 600, color: '#fff',
              backdropFilter: 'blur(4px)',
            }}>
              <Icon name={c.icon} size={11} color="rgba(255,255,255,.8)" />
              {c.text}
            </span>
          ))}
        </div>
      </m.div>

      {/* Days accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <p style={sectionLabel}>{isHe ? 'פירוט ימים' : 'Daily plan'}</p>
        {plan.days.map((day, di) => (
          <m.div
            key={day.dayNumber}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: di * 0.04 }}
            className="lg"
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <button
              onClick={() => setExpandedDay(expandedDay === day.dayNumber ? null : day.dayNumber)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', border: 0, background: 'transparent',
                cursor: 'pointer', textAlign: 'start',
              }}
            >
              <div style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: 11,
                background: 'linear-gradient(145deg, var(--lg-terra-bright), var(--lg-terra))',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px oklch(65% 0.18 40 / 25%)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,255,255,.65)', lineHeight: 1 }}>{isHe ? 'יום' : 'DAY'}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: '#fff', lineHeight: 1 }}>{day.dayNumber}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{day.region}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>
                  {day.events.length} {isHe ? 'פעילויות' : 'activities'}
                  {day.description ? ` · ${day.description}` : ''}
                </div>
              </div>
              <m.span animate={{ rotate: expandedDay === day.dayNumber ? 90 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} style={{ display: 'flex', flexShrink: 0 }}>
                <Icon name="chevR" size={15} color="var(--text-3)" />
              </m.span>
            </button>

            <div style={{ maxHeight: expandedDay === day.dayNumber ? 400 : 0, overflow: 'hidden', transition: 'max-height var(--dur-slow) ease' }}>
              <div style={{ paddingBottom: 10 }}>
                {day.events.map((ev, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '7px 14px',
                    borderTop: i > 0 ? '1px solid oklch(50% 0.02 60 / 6%)' : 'none',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--terra-text)', width: 36, flexShrink: 0, paddingTop: 1, fontWeight: 600 }}>{ev.time}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>{ev.name}</div>
                      {ev.location && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Icon name="pin" size={9} color="var(--text-3)" />{ev.location}
                        </div>
                      )}
                    </div>
                    {ev.cost != null && ev.cost > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--terra-text)', flexShrink: 0, fontWeight: 600 }}>
                        {plan.currency} {ev.cost}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {/* Packing chips */}
      {plan.packingList.length > 0 && (
        <div>
          <p style={sectionLabel}>{isHe ? 'מה לארוז' : 'What to pack'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {plan.packingList.slice(0, 10).map((item, i) => (
              <span key={i} className="lg" style={{
                padding: '5px 12px', borderRadius: 9999,
                fontSize: 12, fontWeight: 500, color: 'var(--text-2)',
              }}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {plan.tips?.length > 0 && (
        <div style={{
          borderRadius: 16, padding: '12px 14px',
          background: 'oklch(from var(--brand) l c h / 8%)',
          border: '1px solid oklch(from var(--brand) l c h / 16%)',
        }}>
          <p style={{ ...sectionLabel, color: 'var(--brand)', margin: '0 0 8px' }}>
            {isHe ? 'טיפים' : 'Travel tips'}
          </p>
          {plan.tips.slice(0, 3).map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < 2 ? 6 : 0 }}>
              <Icon name="sparkle" size={12} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.45 }}>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Confirm CTA */}
      <m.button
        onClick={onConfirm}
        disabled={creating}
        whileTap={!creating ? { scale: 0.97 } : {}}
        style={{
          height: 56, border: 0, borderRadius: 'var(--lg-r-btn, 20px)',
          cursor: creating ? 'default' : 'pointer',
          background: creating
            ? 'var(--surface-2)'
            : 'linear-gradient(145deg, var(--lg-terra-bright), var(--lg-terra))',
          color: creating ? 'var(--text-3)' : '#fff',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: creating ? 'none' : '0 6px 24px oklch(65% 0.18 40 / 35%)',
          transition: 'all var(--dur-slow)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {creating ? (
          <>
            <m.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex' }}>
              <Icon name="compass" size={17} color="var(--text-3)" />
            </m.span>
            {isHe ? 'יוצר טיול…' : 'Building your trip…'}
          </>
        ) : (
          <>
            <Icon name="sparkle" size={17} color="rgba(255,255,255,0.9)" />
            {isHe ? 'צור את הטיול הזה' : 'Create this trip'}
          </>
        )}
      </m.button>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.10em',
  textTransform: 'uppercase', color: 'var(--text-3)',
  fontWeight: 600, margin: '0 0 10px',
};

const fieldStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 48, border: 0, borderRadius: 14,
  paddingInlineStart: 16, paddingInlineEnd: 16,
  fontFamily: 'var(--font-sans)', fontSize: 15,
  color: 'var(--lg-ink)', outline: 'none',
  background: 'var(--field-bg)',
  boxShadow: 'inset 0 0 0 1px var(--field-border)',
};

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PlanWithAISheet({ onClose }: { onClose: () => void }) {
  const { createTrip, addEvent, updateDayMeta, addSupplyItem, authUser } = useAppStore();
  const { locale } = useI18n();
  const { show }   = useToast();
  const isHe       = locale === 'he';

  const [destination, setDestination] = useState('');
  const [days,        setDays]        = useState('7');
  const [startDate,   setStartDate]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState('USD');

  const [travelers,  setTravelers]  = useState<string[]>(['couple']);
  const [pace,       setPace]       = useState<string[]>(['balanced']);
  const [interests,  setInterests]  = useState<string[]>(['food', 'culture']);
  const [budget,     setBudget]     = useState<string[]>(['mid']);

  const [step,     setStep]     = useState<'form' | 'generating' | 'preview'>('form');
  const [progress, setProgress] = useState(0);
  const [plan,     setPlan]     = useState<TripPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toggleSingle = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (id: string) => setter([id]);

  const toggleMulti = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) =>
    (id: string) => {
      setter(prev =>
        prev.includes(id)
          ? prev.length > 1 ? prev.filter(x => x !== id) : prev
          : [...prev, id].slice(0, 4),
      );
    };

  const handleGenerate = async () => {
    if (!destination.trim() || !days || Number(days) < 1) return;
    setStep('generating');
    setProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    const travelersLabel = travelers.map(t => TRAVELER_OPTIONS.find(o => o.id === t)?.[isHe ? 'he' : 'en']).filter(Boolean).join(', ');
    const paceLabel      = pace.map(p => PACE_OPTIONS.find(o => o.id === p)?.[isHe ? 'he' : 'en']).filter(Boolean).join(', ');
    const interestLabels = interests.map(i => INTEREST_OPTIONS.find(o => o.id === i)?.[isHe ? 'he' : 'en']).filter(Boolean).join(', ');
    const budgetLabel    = budget.map(b => BUDGET_OPTIONS.find(o => o.id === b)?.[isHe ? 'he' : 'en']).filter(Boolean).join(', ');
    const styleStr       = `${travelersLabel} trip, ${paceLabel} pace, ${budgetLabel} budget, focused on: ${interestLabels}`;

    try {
      const res = await fetch('/api/ai/plan-trip', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          destination, days: Number(days),
          startDate: startDate || undefined,
          style: styleStr, currency, locale,
          travelers: travelers[0], pace: pace[0], interests, budget: budget[0],
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader      = res.body.getReader();
      const decoder     = new TextDecoder();
      let   accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        const ms = accumulated.match(/__PROGRESS__(\d+)\/(\d+)/g);
        if (ms) {
          const m = ms[ms.length - 1].match(/__PROGRESS__(\d+)\/(\d+)/);
          if (m) setProgress(Number(m[1]));
        }

        if (accumulated.includes('__RESULT__')) {
          const idx     = accumulated.lastIndexOf('__RESULT__');
          const jsonStr = accumulated.slice(idx + '__RESULT__'.length).trim();
          if (jsonStr) {
            const parsed = JSON.parse(jsonStr) as TripPlan;
            parsed.theme = safeTheme(parsed.theme);
            setPlan(parsed);
            setStep('preview');
          }
          break;
        }

        if (accumulated.includes('__ERROR__')) {
          const idx = accumulated.lastIndexOf('__ERROR__');
          throw new Error(accumulated.slice(idx + '__ERROR__'.length).trim());
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('[PlanWithAI]', err);
      show(isHe ? 'שגיאה ביצירת המסלול - נסה שוב' : 'Failed to generate - please try again');
      setStep('form');
    }
  };

  const handleConfirm = async () => {
    if (!plan) return;
    setCreating(true);
    try {
      await createTrip(
        plan.name, plan.days.length,
        authUser?.username ?? 'Traveler',
        plan.theme, startDate || undefined,
        plan.countries, plan.currency || currency,
      );
      for (const day of plan.days) {
        updateDayMeta(day.dayNumber - 1, { region: day.region, desc: day.description });
      }
      for (const day of plan.days) {
        for (const ev of day.events) {
          addEvent(day.dayNumber, {
            time: ev.time, duration: ev.duration ?? 60,
            name: ev.name, category: ev.category as any,
            location: ev.location, cost: ev.cost, notes: ev.notes,
          });
        }
      }
      for (const item of (plan.packingList ?? []).slice(0, 20)) {
        addSupplyItem(item, 'Other');
      }
      onClose();
    } catch (err) {
      console.error('[PlanWithAI] create failed', err);
      show(isHe ? 'לא ניתן ליצור את הטיול' : 'Could not create the trip');
      setCreating(false);
    }
  };

  const sheetTitle =
    step === 'form'       ? (isHe ? 'בנה מסלול חכם' : 'Build a smart itinerary') :
    step === 'generating' ? (isHe ? 'מתכנן…'        : 'Planning…') :
    plan?.name ?? (isHe ? 'המסלול שלך' : 'Your Trip');

  return (
    <Sheet title={sheetTitle} onClose={onClose} full>
      <AnimatePresence mode="wait">

        {/* ── STEP 1: Form ── */}
        {step === 'form' && (
          <m.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.26 }}>
            <StepTrack step="form" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <Field
                label={isHe ? 'יעד' : 'Where to?'}
                placeholder={isHe ? 'לדוגמה: טוקיו, יפן' : 'e.g. Tokyo, Japan'}
                value={destination}
                onChange={setDestination}
                icon={<Icon name="pin" size={15} />}
                autoFocus
              />

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 80px', minWidth: 72 }}>
                  <label style={sectionLabel}>{isHe ? 'ימים' : 'Days'}</label>
                  <input type="number" min="1" max="21" inputMode="numeric" value={days}
                    onChange={e => setDays(e.target.value)} style={fieldStyle} placeholder="7" />
                </div>
                <div style={{ flex: '3 1 140px', minWidth: 120 }}>
                  <label style={sectionLabel}>{isHe ? 'תאריך התחלה' : 'Start date'}</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={fieldStyle} />
                </div>
                <div style={{ flex: '1 1 90px', minWidth: 80 }}>
                  <label style={sectionLabel}>{isHe ? 'מטבע' : 'Currency'}</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} style={fieldStyle}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 10%)' }} />

              <ChipGroup
                label={isHe ? 'מי נוסע?' : "Who's traveling?"}
                options={TRAVELER_OPTIONS}
                selected={travelers}
                onSelect={toggleSingle(setTravelers)}
                isHe={isHe}
              />
              <ChipGroup
                label={isHe ? 'קצב הטיול' : 'Travel pace'}
                options={PACE_OPTIONS}
                selected={pace}
                onSelect={toggleSingle(setPace)}
                isHe={isHe}
              />
              <ChipGroup
                label={isHe ? 'מה מעניין אותך? (עד 4)' : 'What interests you? (pick up to 4)'}
                options={INTEREST_OPTIONS}
                selected={interests}
                onSelect={toggleMulti(setInterests, interests)}
                multi
                isHe={isHe}
              />
              <ChipGroup
                label={isHe ? 'רמת תקציב' : 'Budget level'}
                options={BUDGET_OPTIONS}
                selected={budget}
                onSelect={toggleSingle(setBudget)}
                isHe={isHe}
              />

              <m.button
                onClick={handleGenerate}
                disabled={!destination.trim() || !days || Number(days) < 1}
                whileTap={{ scale: 0.97 }}
                style={{
                  height: 56, border: 0, borderRadius: 20, cursor: 'pointer',
                  background: 'linear-gradient(145deg, var(--lg-terra-bright), var(--lg-terra))',
                  color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 6px 24px oklch(65% 0.18 40 / 32%)',
                  opacity: !destination.trim() || !days || Number(days) < 1 ? 0.42 : 1,
                  transition: 'opacity var(--dur-base), box-shadow var(--dur-base)',
                  marginTop: 4, WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon name="sparkle" size={18} color="rgba(255,255,255,0.9)" />
                {isHe ? 'צור מסלול' : 'Plan my trip'}
              </m.button>
            </div>
          </m.div>
        )}

        {/* ── STEP 2: Generating ── */}
        {step === 'generating' && (
          <m.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepTrack step="generating" />
            <StepGenerating progress={progress} totalDays={Number(days)} locale={locale} />
          </m.div>
        )}

        {/* ── STEP 3: Preview ── */}
        {step === 'preview' && plan && (
          <m.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
            <StepTrack step="preview" />
            <StepPreview plan={plan} locale={locale} onConfirm={handleConfirm} creating={creating} />
          </m.div>
        )}

      </AnimatePresence>
    </Sheet>
  );
}
