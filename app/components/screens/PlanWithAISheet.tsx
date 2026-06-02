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
  dayNumber: number;
  region:    string;
  description: string;
  events: PlanEvent[];
}

interface PlanEvent {
  time:     string;
  name:     string;
  category: string;
  duration: number;
  location?: string;
  cost?:    number;
  notes?:   string;
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

// ── Rotating placeholder prompts ──────────────────────────────────────────────

const STYLE_PLACEHOLDERS = [
  'Food-lover couple, mid-budget, love hidden gems…',
  'Solo adventurer, budget backpacker, off the beaten path…',
  'Family with kids, relaxed pace, beaches and culture…',
  'Luxury honeymoon, fine dining, private experiences…',
  'Active traveler — hikes, cycling, outdoor adventures…',
];

// ── Theme detection from AI result ───────────────────────────────────────────

const VALID_THEMES: TripTheme[] = ['desert','nature','city','beach','mountain','lake','sunset'];
function safeTheme(raw: unknown): TripTheme {
  return VALID_THEMES.includes(raw as TripTheme) ? (raw as TripTheme) : 'city';
}

// ── Progress animation messages ───────────────────────────────────────────────

const PROGRESS_MSGS = [
  'Scouting the best spots…',
  'Finding hidden gems…',
  'Planning perfect meals…',
  'Mapping your route…',
  'Checking local events…',
  'Budgeting like a pro…',
  'Packing your bags…',
  'Almost ready…',
];

// ── Step 1 – Input form ───────────────────────────────────────────────────────

function StepForm({
  destination, setDestination,
  days, setDays,
  startDate, setStartDate,
  style, setStyle,
  currency, setCurrency,
  locale,
  onGenerate, loading,
}: {
  destination: string; setDestination: (v: string) => void;
  days: string; setDays: (v: string) => void;
  startDate: string; setStartDate: (v: string) => void;
  style: string; setStyle: (v: string) => void;
  currency: string; setCurrency: (v: string) => void;
  locale: string;
  onGenerate: () => void;
  loading: boolean;
}) {
  const isHe = locale === 'he';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Destination */}
      <Field
        label={isHe ? 'יעד' : 'Destination'}
        placeholder={isHe ? 'לדוגמה: טוקיו, יפן' : 'e.g. Tokyo, Japan'}
        value={destination}
        onChange={setDestination}
        icon={<Icon name="pin" size={15} />}
        autoFocus
      />

      {/* Days + Start date */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={monoLabel}>{isHe ? 'מספר ימים' : 'Days'}</label>
          <input
            type="number" min="1" max="21" inputMode="numeric"
            value={days}
            onChange={e => setDays(e.target.value)}
            style={fieldStyle}
            placeholder="7"
          />
        </div>
        <div style={{ flex: 1.5 }}>
          <label style={monoLabel}>{isHe ? 'תאריך התחלה' : 'Start date (optional)'}</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={fieldStyle}
          />
        </div>
      </div>

      {/* Currency */}
      <div>
        <label style={monoLabel}>{isHe ? 'מטבע' : 'Currency'}</label>
        <select value={currency} onChange={e => setCurrency(e.target.value)} style={fieldStyle}>
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} — {locale === 'he' ? c.labelHe : c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Travel style */}
      <div>
        <label style={monoLabel}>{isHe ? 'סגנון הטיול' : 'Travel style'}</label>
        <textarea
          value={style}
          onChange={e => setStyle(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder={isHe
            ? 'תאר את סגנון הטיול שלך — תחומי עניין, קצב, תקציב…'
            : STYLE_PLACEHOLDERS[Math.floor(Date.now() / 10000) % STYLE_PLACEHOLDERS.length]
          }
          style={{
            ...fieldStyle,
            height: 'auto',
            resize: 'none',
            lineHeight: 1.5,
            paddingTop: 12,
            paddingBottom: 12,
          }}
        />
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
          {style.length}/300
        </p>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={loading || !destination.trim() || !days || Number(days) < 1}
        style={{
          height: 56, border: 0, borderRadius: 'var(--lg-r-btn)', cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))',
          color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: 'var(--lg-glow-forest)',
          opacity: (!destination.trim() || !days || Number(days) < 1) ? 0.5 : 1,
          transition: 'opacity .2s',
        }}
      >
        <Icon name="sparkle" size={18} color="#fff" />
        {isHe ? 'צור מסלול' : 'Plan my trip with AI'}
      </button>
    </div>
  );
}

// ── Step 2 – Generating ───────────────────────────────────────────────────────

function StepGenerating({ progress, totalDays, locale }: {
  progress: number;
  totalDays: number;
  locale: string;
}) {
  const isHe  = locale === 'he';
  const pct   = totalDays > 0 ? Math.round((progress / totalDays) * 100) : 0;
  const msgIdx = Math.min(progress, PROGRESS_MSGS.length - 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '24px 0 32px' }}>
      {/* Spinning compass */}
      <m.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ width: 72, height: 72 }}
      >
        <Icon name="compass" size={72} color="var(--lg-terra)" />
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
            transition={{ duration: 0.3 }}
            style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}
          >
            {PROGRESS_MSGS[msgIdx]}
          </m.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      {totalDays > 0 && (
        <div style={{ width: '100%', maxWidth: 280 }}>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--lg-panel)', overflow: 'hidden' }}>
            <m.div
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
              style={{ height: '100%', background: 'var(--lg-terra)', borderRadius: 3 }}
            />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            {isHe ? `יום ${progress} מתוך ${totalDays}` : `Day ${progress} of ${totalDays}`}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 3 – Preview ──────────────────────────────────────────────────────────

function StepPreview({ plan, locale, onConfirm, creating }: {
  plan: TripPlan;
  locale: string;
  onConfirm: () => void;
  creating: boolean;
}) {
  const isHe = locale === 'he';
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const totalCost = plan.days.reduce(
    (s, d) => s + d.events.reduce((es, ev) => es + (ev.cost ?? 0), 0), 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero summary */}
      <div
        style={{
          borderRadius: 20, padding: '18px 20px',
          background: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))',
          boxShadow: 'var(--lg-glow-forest)', position: 'relative', overflow: 'hidden',
        }}
      >
        <div aria-hidden style={{ position: 'absolute', top: -10, right: -10, opacity: 0.12, pointerEvents: 'none' }}>
          <Icon name="compass" size={100} color="#fff" />
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', margin: '0 0 4px' }}>
          {isHe ? 'המסלול שלך' : 'Your AI-crafted trip'}
        </p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 28, color: '#fff', margin: '0 0 14px', lineHeight: 1.1 }}>
          {plan.name}
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Chip icon="calendar" label={`${plan.days.length} ${isHe ? 'ימים' : 'days'}`} />
          <Chip icon="pin" label={plan.countries.join(', ')} />
          {totalCost > 0 && (
            <Chip icon="download" label={`~${plan.currency} ${totalCost.toLocaleString()}`} />
          )}
        </div>
      </div>

      {/* Day list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: '0 0 2px', fontSize: 9 }}>
          {isHe ? 'פירוט ימים' : 'Daily breakdown'}
        </p>
        {plan.days.map(day => (
          <div key={day.dayNumber} className="lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
            <button
              onClick={() => setExpandedDay(expandedDay === day.dayNumber ? null : day.dayNumber)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 14px', border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'start',
              }}
            >
              {/* Day badge */}
              <div style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: 10,
                background: 'var(--lg-terra)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'rgba(255,255,255,.75)', lineHeight: 1 }}>
                  {isHe ? 'יום' : 'DAY'}
                </span>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: '#fff', lineHeight: 1 }}>
                  {day.dayNumber}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {day.region}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {day.events.length} {isHe ? 'אירועים' : 'activities'}
                  {day.description ? ` · ${day.description}` : ''}
                </div>
              </div>
              <m.span
                animate={{ rotate: expandedDay === day.dayNumber ? 90 : 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                style={{ display: 'flex', flexShrink: 0 }}
              >
                <Icon name="chevR" size={16} color="var(--text-3)" />
              </m.span>
            </button>

            {/* Expanded events */}
            <div style={{ maxHeight: expandedDay === day.dayNumber ? 500 : 0, overflow: 'hidden', transition: 'max-height .35s ease' }}>
              <div style={{ paddingBottom: 12 }}>
                {day.events.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', width: 38, flexShrink: 0, paddingTop: 2 }}>
                      {ev.time}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--lg-ink)' }}>{ev.name}</div>
                      {ev.location && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Icon name="pin" size={10} color="var(--text-3)" />
                          {ev.location}
                        </div>
                      )}
                    </div>
                    {ev.cost != null && ev.cost > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--lg-terra)', flexShrink: 0 }}>
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

      {/* Packing preview */}
      {plan.packingList.length > 0 && (
        <div>
          <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: '0 0 8px', fontSize: 9 }}>
            {isHe ? 'רשימת ציוד' : 'Suggested packing'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {plan.packingList.slice(0, 8).map((item, i) => (
              <span
                key={i}
                className="lg"
                style={{ padding: '5px 11px', borderRadius: 9999, fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}
              >
                {item}
              </span>
            ))}
            {plan.packingList.length > 8 && (
              <span style={{ padding: '5px 11px', fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                +{plan.packingList.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={creating}
        style={{
          height: 56, border: 0, borderRadius: 'var(--lg-r-btn)', cursor: creating ? 'default' : 'pointer',
          background: creating
            ? 'var(--lg-panel)'
            : 'linear-gradient(135deg, var(--lg-terra-bright), var(--lg-terra))',
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
              <Icon name="compass" size={18} color="var(--text-3)" />
            </m.span>
            {isHe ? 'יוצר טיול…' : 'Building your trip…'}
          </>
        ) : (
          <>
            <Icon name="check" size={18} color="#fff" />
            {isHe ? 'צור את הטיול הזה' : 'Create this trip'}
          </>
        )}
      </button>
    </div>
  );
}

// ── Tiny Chip helper ──────────────────────────────────────────────────────────

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'rgba(255,255,255,.15)', borderRadius: 9999,
      padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#fff',
    }}>
      <Icon name={icon as any} size={12} color="rgba(255,255,255,.85)" />
      {label}
    </span>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const monoLabel: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10,
  letterSpacing: '0.10em', textTransform: 'uppercase',
  color: 'var(--text-3)', marginBottom: 8, fontWeight: 600,
};

const fieldStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 48,
  border: 0, borderRadius: 14,
  paddingInlineStart: 16, paddingInlineEnd: 16,
  fontFamily: 'var(--font-sans)', fontSize: 15,
  color: 'var(--lg-ink)', outline: 'none',
  background: 'var(--field-bg)',
  boxShadow: 'inset 0 0 0 1px var(--field-border)',
};

// ── Main exported component ───────────────────────────────────────────────────

export default function PlanWithAISheet({ onClose }: { onClose: () => void }) {
  const { createTrip, addEvent, updateDayMeta, addSupplyItem, authUser } = useAppStore();
  const { locale } = useI18n();
  const { show } = useToast();
  const isHe = locale === 'he';

  // Form state
  const [destination, setDestination] = useState('');
  const [days,        setDays]        = useState('7');
  const [startDate,   setStartDate]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [style,    setStyle]    = useState('');
  const [currency, setCurrency] = useState('USD');

  // Flow state
  const [step,     setStep]     = useState<'form' | 'generating' | 'preview'>('form');
  const [progress, setProgress] = useState(0);
  const [plan,     setPlan]     = useState<TripPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Generate ───────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!destination.trim() || !days || Number(days) < 1) return;
    setStep('generating');
    setProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ai/plan-trip', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          destination,
          days:      Number(days),
          startDate: startDate || undefined,
          style,
          currency,
          locale,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader   = res.body.getReader();
      const decoder  = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Parse progress tokens
        const progressMatches = accumulated.match(/__PROGRESS__(\d+)\/(\d+)/g);
        if (progressMatches) {
          const last = progressMatches[progressMatches.length - 1];
          const m = last.match(/__PROGRESS__(\d+)\/(\d+)/);
          if (m) setProgress(Number(m[1]));
        }

        // Check for completion
        if (accumulated.includes('__RESULT__')) {
          const resultIdx = accumulated.lastIndexOf('__RESULT__');
          const jsonStr   = accumulated.slice(resultIdx + '__RESULT__'.length).trim();
          if (jsonStr) {
            const parsed = JSON.parse(jsonStr) as TripPlan;
            // Normalise theme
            parsed.theme = safeTheme(parsed.theme);
            setPlan(parsed);
            setStep('preview');
          }
          break;
        }

        if (accumulated.includes('__ERROR__')) {
          const errIdx = accumulated.lastIndexOf('__ERROR__');
          throw new Error(accumulated.slice(errIdx + '__ERROR__'.length).trim());
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('[PlanWithAI]', err);
      show(isHe ? 'שגיאה ביצירת המסלול — נסה שוב' : 'Failed to generate trip — please try again');
      setStep('form');
    }
  };

  // ── Confirm — create trip + populate events ────────────────────────────────

  const handleConfirm = async () => {
    if (!plan) return;
    setCreating(true);
    try {
      const nick = authUser?.username ?? 'Traveler';
      const calcDays = Math.max(1, Math.min(90,
        startDate
          ? Math.round((new Date(startDate + 'T00:00:00').getTime() + (plan.days.length - 1) * 86400000 - new Date(startDate + 'T00:00:00').getTime()) / 86400000) + 1
          : plan.days.length
      ));

      await createTrip(
        plan.name,
        plan.days.length,
        nick,
        plan.theme,
        startDate || undefined,
        plan.countries,
        plan.currency || currency,
      );

      // Give the store a tick to finish setting up the trip
      await new Promise(r => setTimeout(r, 80));

      // Populate day meta
      for (const day of plan.days) {
        updateDayMeta(day.dayNumber - 1, {
          region: day.region,
          desc:   day.description,
        });
      }

      // Add all events
      for (const day of plan.days) {
        for (const ev of day.events) {
          addEvent(day.dayNumber, {
            time:     ev.time,
            duration: ev.duration ?? 60,
            name:     ev.name,
            category: ev.category as any,
            location: ev.location,
            cost:     ev.cost,
            notes:    ev.notes,
          });
        }
      }

      // Add packing list
      for (const item of (plan.packingList ?? []).slice(0, 20)) {
        addSupplyItem(item, 'Other');
      }

      onClose();
    } catch (err) {
      console.error('[PlanWithAI] create failed', err);
      show(isHe ? 'לא ניתן היה ליצור את הטיול' : 'Could not create the trip');
      setCreating(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const title =
    step === 'form'      ? (isHe ? 'תכנן עם AI' : 'Plan with AI') :
    step === 'generating' ? (isHe ? 'מתכנן…' : 'Planning…') :
    plan?.name ?? (isHe ? 'המסלול שלך' : 'Your Trip');

  const subtitle =
    step === 'form'       ? (isHe ? 'תאר את הטיול שלך' : 'Describe your trip') :
    step === 'generating' ? (isHe ? `${days} ימים ב${destination}` : `${days} days in ${destination}`) :
    isHe ? `${plan?.days.length} ימים · ${plan?.countries?.join(', ')}` :
           `${plan?.days.length} days · ${plan?.countries?.join(', ')}`;

  return (
    <Sheet title={title} subtitle={subtitle} onClose={onClose} full>
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <m.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
            <StepForm
              destination={destination} setDestination={setDestination}
              days={days} setDays={setDays}
              startDate={startDate} setStartDate={setStartDate}
              style={style} setStyle={setStyle}
              currency={currency} setCurrency={setCurrency}
              locale={locale}
              onGenerate={handleGenerate}
              loading={false}
            />
          </m.div>
        )}

        {step === 'generating' && (
          <m.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepGenerating progress={progress} totalDays={Number(days)} locale={locale} />
          </m.div>
        )}

        {step === 'preview' && plan && (
          <m.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <StepPreview
              plan={plan}
              locale={locale}
              onConfirm={handleConfirm}
              creating={creating}
            />
          </m.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}
