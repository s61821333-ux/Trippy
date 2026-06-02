'use client';

import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Sheet from '../ui/Sheet';
import Field from '../ui/Field';
import Icon from '../ui/Icon';
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

// ── Personalization options ───────────────────────────────────────────────────

const TRAVELER_OPTIONS = [
  { id: 'solo',    en: 'Solo',   he: 'לבד',      emoji: '🧳' },
  { id: 'couple',  en: 'Couple', he: 'זוג',       emoji: '❤️' },
  { id: 'family',  en: 'Family', he: 'משפחה',     emoji: '👨‍👩‍👧' },
  { id: 'friends', en: 'Friends',he: 'חברים',     emoji: '👥' },
];

const PACE_OPTIONS = [
  { id: 'relaxed',  en: 'Relaxed',       he: 'רגוע',      emoji: '🌴', desc: 'Few activities, lots of breathing room' },
  { id: 'balanced', en: 'Balanced',      he: 'מאוזן',     emoji: '⚖️', desc: '3–4 activities per day'                },
  { id: 'packed',   en: 'Action-packed', he: 'עמוס',      emoji: '⚡', desc: 'Make the most of every hour'           },
];

const INTEREST_OPTIONS = [
  { id: 'food',      en: 'Food & dining',   he: 'אוכל',       emoji: '🍜' },
  { id: 'culture',   en: 'Culture & local', he: 'תרבות',      emoji: '🏛' },
  { id: 'nature',    en: 'Nature & hikes',  he: 'טבע',        emoji: '🌿' },
  { id: 'beach',     en: 'Beach & water',   he: 'חוף ים',     emoji: '🏖' },
  { id: 'art',       en: 'Art & museums',   he: 'אמנות',      emoji: '🎨' },
  { id: 'nightlife', en: 'Nightlife',       he: 'לילה',       emoji: '🎉' },
  { id: 'shopping',  en: 'Shopping',        he: 'קניות',      emoji: '🛍' },
  { id: 'adventure', en: 'Adventure',       he: 'הרפתקאות',   emoji: '🧗' },
];

const BUDGET_OPTIONS = [
  { id: 'budget',   en: 'Budget',    he: 'חסכוני',  emoji: '💸', desc: 'Hostels, street food, free attractions'  },
  { id: 'mid',      en: 'Mid-range', he: 'בינוני',  emoji: '💳', desc: 'Hotels, restaurants, some paid tours'     },
  { id: 'luxury',   en: 'Luxury',    he: 'יוקרה',   emoji: '✨', desc: 'Premium hotels, fine dining, VIP access'  },
];

// ── Theme helper ──────────────────────────────────────────────────────────────

const VALID_THEMES: TripTheme[] = ['desert','nature','city','beach','mountain','lake','sunset'];
function safeTheme(raw: unknown): TripTheme {
  return VALID_THEMES.includes(raw as TripTheme) ? (raw as TripTheme) : 'city';
}

// ── Progress messages ─────────────────────────────────────────────────────────

const PROGRESS_MSGS = [
  'Scouting the best spots…',
  'Planning perfect meals…',
  'Mapping your route…',
  'Finding hidden gems…',
  'Checking opening hours…',
  'Estimating costs…',
  'Almost ready…',
];

// ── ChipGroup ─────────────────────────────────────────────────────────────────

function ChipGroup<T extends string>({
  label, options, selected, onSelect, multi = false, isHe,
}: {
  label: string;
  options: { id: T; en: string; he: string; emoji: string; desc?: string }[];
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
                padding: '9px 16px',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                background: active ? 'var(--lg-forest)' : 'var(--lg-panel)',
                color:      active ? '#fff' : 'var(--text-2)',
                boxShadow:  active ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
                transition: 'all .2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
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
  const isHe    = locale === 'he';
  const pct     = totalDays > 0 ? Math.round((progress / totalDays) * 100) : 0;
  const msgIdx  = Math.min(Math.max(0, progress), PROGRESS_MSGS.length - 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '24px 0 32px' }}>
      <m.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        style={{ width: 64, height: 64 }}
      >
        <Icon name="compass" size={64} color="var(--lg-terra)" />
      </m.div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--lg-ink)', margin: '0 0 8px' }}>
          {isHe ? 'מתכנן את המסלול…' : 'Crafting your journey…'}
        </p>
        <AnimatePresence mode="wait">
          <m.p
            key={msgIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
            style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}
          >
            {PROGRESS_MSGS[msgIdx]}
          </m.p>
        </AnimatePresence>
      </div>

      {totalDays > 0 && (
        <div style={{ width: '100%', maxWidth: 260 }}>
          <div style={{ height: 5, borderRadius: 3, background: 'var(--lg-panel)', overflow: 'hidden' }}>
            <m.div
              animate={{ width: `${Math.max(5, pct)}%` }}
              transition={{ type: 'spring', stiffness: 55, damping: 18 }}
              style={{ height: '100%', background: 'var(--lg-terra)', borderRadius: 3 }}
            />
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            {isHe ? `יום ${progress} מתוך ${totalDays}` : `Day ${progress} of ${totalDays}`}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Hero */}
      <div style={{
        borderRadius: 20, padding: '18px 20px',
        background: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))',
        boxShadow: 'var(--lg-glow-forest)', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{ position: 'absolute', top: -10, right: -10, opacity: 0.12, pointerEvents: 'none' }}>
          <Icon name="compass" size={90} color="#fff" />
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', margin: '0 0 4px' }}>
          {isHe ? 'המסלול שלך' : 'Your AI-crafted trip'}
        </p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 26, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
          {plan.name}
        </h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { icon: 'calendar', text: `${plan.days.length} ${isHe ? 'ימים' : 'days'}` },
            { icon: 'pin',      text: plan.countries.join(', ') },
            ...(totalCost > 0 ? [{ icon: 'download', text: `~${plan.currency} ${totalCost.toLocaleString()}` }] : []),
          ].map(c => (
            <span key={c.icon} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.14)', borderRadius: 9999, padding: '4px 10px', fontSize: 11.5, fontWeight: 600, color: '#fff' }}>
              <Icon name={c.icon as any} size={11} color="rgba(255,255,255,.8)" />
              {c.text}
            </span>
          ))}
        </div>
      </div>

      {/* Days accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={sectionLabel}>{isHe ? 'פירוט ימים' : 'Daily plan'}</p>
        {plan.days.map(day => (
          <div key={day.dayNumber} className="lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
            <button
              onClick={() => setExpandedDay(expandedDay === day.dayNumber ? null : day.dayNumber)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'start' }}
            >
              <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: 'var(--lg-terra)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,255,255,.7)', lineHeight: 1 }}>{isHe ? 'יום' : 'DAY'}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: '#fff', lineHeight: 1 }}>{day.dayNumber}</span>
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

            <div style={{ maxHeight: expandedDay === day.dayNumber ? 400 : 0, overflow: 'hidden', transition: 'max-height .3s ease' }}>
              <div style={{ paddingBottom: 10 }}>
                {day.events.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', width: 36, flexShrink: 0, paddingTop: 1 }}>{ev.time}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>{ev.name}</div>
                      {ev.location && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Icon name="pin" size={9} color="var(--text-3)" />{ev.location}
                        </div>
                      )}
                    </div>
                    {ev.cost != null && ev.cost > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--lg-terra)', flexShrink: 0 }}>
                        {plan.currency} {ev.cost}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Packing chips */}
      {plan.packingList.length > 0 && (
        <div>
          <p style={sectionLabel}>{isHe ? 'מה לארוז' : 'What to pack'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {plan.packingList.slice(0, 10).map((item, i) => (
              <span key={i} className="lg" style={{ padding: '5px 11px', borderRadius: 9999, fontSize: 11.5, fontWeight: 500, color: 'var(--text-2)' }}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={onConfirm}
        disabled={creating}
        style={{
          height: 54, border: 0, borderRadius: 'var(--lg-r-btn)', cursor: creating ? 'default' : 'pointer',
          background: creating ? 'var(--lg-panel)' : 'linear-gradient(135deg, var(--lg-terra-bright), var(--lg-terra))',
          color: creating ? 'var(--text-3)' : '#fff',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: creating ? 'none' : 'var(--lg-glow-terra)',
          transition: 'all .3s',
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
            <Icon name="check" size={17} color="#fff" />
            {isHe ? 'צור את הטיול הזה' : 'Create this trip'}
          </>
        )}
      </button>
    </div>
  );
}

// ── Shared style ──────────────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.10em',
  textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10,
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

  // ── Form state ─────────────────────────────────────────────────────────────
  const [destination, setDestination] = useState('');
  const [days,        setDays]        = useState('7');
  const [startDate,   setStartDate]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState('USD');

  // Chip selections
  const [travelers,  setTravelers]  = useState<string[]>(['couple']);
  const [pace,       setPace]       = useState<string[]>(['balanced']);
  const [interests,  setInterests]  = useState<string[]>(['food', 'culture']);
  const [budget,     setBudget]     = useState<string[]>(['mid']);

  // ── Flow state ─────────────────────────────────────────────────────────────
  const [step,     setStep]     = useState<'form' | 'generating' | 'preview'>('form');
  const [progress, setProgress] = useState(0);
  const [plan,     setPlan]     = useState<TripPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Toggle helpers ──────────────────────────────────────────────────────────
  const toggleSingle = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (id: string) => setter([id]);

  const toggleMulti = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) =>
    (id: string) => {
      setter(prev =>
        prev.includes(id)
          ? prev.length > 1 ? prev.filter(x => x !== id) : prev // keep at least 1
          : [...prev, id].slice(0, 4), // max 4
      );
    };

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!destination.trim() || !days || Number(days) < 1) return;
    setStep('generating');
    setProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    // Build a concise style string from chip selections
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
          destination,
          days:      Number(days),
          startDate: startDate || undefined,
          style:     styleStr,
          currency,
          locale,
          travelers: travelers[0],
          pace:      pace[0],
          interests,
          budget:    budget[0],
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

        // Live day progress
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
      show(isHe ? 'שגיאה ביצירת המסלול — נסה שוב' : 'Failed to generate — please try again');
      setStep('form');
    }
  };

  // ── Confirm ─────────────────────────────────────────────────────────────────
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
      await new Promise(r => setTimeout(r, 80));

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

  // ── Render ──────────────────────────────────────────────────────────────────
  const sheetTitle =
    step === 'form'       ? (isHe ? 'תכנן עם AI' : 'Plan with AI') :
    step === 'generating' ? (isHe ? 'מתכנן…'     : 'Planning…')    :
    plan?.name ?? (isHe ? 'המסלול שלך' : 'Your Trip');

  return (
    <Sheet title={sheetTitle} onClose={onClose} full>
      <AnimatePresence mode="wait">

        {/* ── STEP 1: Form ── */}
        {step === 'form' && (
          <m.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Destination + dates row */}
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

              {/* Divider */}
              <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 12%)' }} />

              {/* Who's traveling */}
              <ChipGroup
                label={isHe ? 'מי נוסע?' : "Who's traveling?"}
                options={TRAVELER_OPTIONS}
                selected={travelers}
                onSelect={toggleSingle(setTravelers)}
                isHe={isHe}
              />

              {/* Pace */}
              <ChipGroup
                label={isHe ? 'קצב הטיול' : 'Travel pace'}
                options={PACE_OPTIONS}
                selected={pace}
                onSelect={toggleSingle(setPace)}
                isHe={isHe}
              />

              {/* Interests */}
              <ChipGroup
                label={isHe ? 'מה מעניין אותך? (בחר עד 4)' : 'What interests you? (pick up to 4)'}
                options={INTEREST_OPTIONS}
                selected={interests}
                onSelect={toggleMulti(setInterests, interests)}
                multi
                isHe={isHe}
              />

              {/* Budget */}
              <ChipGroup
                label={isHe ? 'רמת תקציב' : 'Budget level'}
                options={BUDGET_OPTIONS}
                selected={budget}
                onSelect={toggleSingle(setBudget)}
                isHe={isHe}
              />

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!destination.trim() || !days || Number(days) < 1}
                style={{
                  height: 56, border: 0, borderRadius: 'var(--lg-r-btn)', cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))',
                  color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: 'var(--lg-glow-forest)',
                  opacity: !destination.trim() || !days || Number(days) < 1 ? 0.45 : 1,
                  transition: 'opacity .2s',
                  marginTop: 4,
                }}
              >
                <Icon name="sparkle" size={18} color="var(--lg-sand)" />
                {isHe ? 'צור מסלול' : 'Plan my trip'}
              </button>
            </div>
          </m.div>
        )}

        {/* ── STEP 2: Generating ── */}
        {step === 'generating' && (
          <m.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepGenerating progress={progress} totalDays={Number(days)} locale={locale} />
          </m.div>
        )}

        {/* ── STEP 3: Preview ── */}
        {step === 'preview' && plan && (
          <m.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
            <StepPreview plan={plan} locale={locale} onConfirm={handleConfirm} creating={creating} />
          </m.div>
        )}

      </AnimatePresence>
    </Sheet>
  );
}
