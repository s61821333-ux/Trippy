'use client';

/**
 * Sheets_V2 - shared overlay payloads for Trippy 2.0 Liquid Glass.
 *
 * Exports:
 *  - AISheet   replaces SuggestionsSheet.tsx
 *
 * Sheet primitive: app/components/ui/Sheet.tsx (already spec-compliant).
 * CreateSheet: inline in Home_V2.tsx (already spec-compliant).
 * AddEventSheet: inline in DayDetail_V2.tsx (already spec-compliant).
 */

import React, { useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { AiSuggestion } from '@/lib/types';
import { catStamp } from '@/lib/categoryStamp';
import { StampIcon } from './ui/StampIcon';
import Sheet from './ui/Sheet';
import Btn from './ui/Btn';
import Icon from './ui/Icon';
import CurrencyAmount from './ui/CurrencyAmount';
import { useToast } from './ui/Toast';

// ── Category label map ────────────────────────────────────────────────────────

const CAT_LABEL: Record<string, string> = {
  food:         'Food',     cafe:        'Café',      attraction:  'Sight',
  hotel:        'Stay',     rest:        'Rest',       transport:   'Transit',
  flight:       'Flight',   concert:     'Event',      theme_park:  'Park',
  sport:        'Sport',    beach:       'Beach',      other:       'Place',
  museum:       'Museum',   shopping:    'Shopping',   nightlife:   'Nightlife',
  hiking:       'Hiking',   nature_walk: 'Nature',     cycling:     'Cycling',
  boat:         'Boat',     water_sports:'Water',      ski:         'Ski',
  spa:          'Spa',      wellness:    'Wellness',   cultural:    'Cultural',
  market:       'Market',   art:         'Art',        theater:     'Theater',
  cinema:       'Cinema',   festival:    'Festival',   guided_tour: 'Tour',
  national_park:'Park',     religious:   'Cultural',   photography: 'Photo',
  winery:       'Winery',   cooking:     'Cooking',    picnic:      'Picnic',
  cruise:       'Cruise',   farm:        'Farm',       safari:      'Safari',
  aerial:       'Aerial',   golf:        'Golf',       hot_springs: 'Springs',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function priceDots(level: number | undefined): string {
  if (level == null) return '';
  return level === 0 ? 'Free' : '$'.repeat(level);
}

// ── Suggestion card ───────────────────────────────────────────────────────────

type AiSuggestionExtended = AiSuggestion & { source_site?: string; source_url?: string };

// GetYourGuide: surface a quick "Tickets" link for bookable experience types.
const GYG_BOOKABLE = new Set<string>([
  'attraction', 'museum', 'theme_park', 'guided_tour', 'concert', 'festival',
  'theater', 'safari', 'cruise', 'boat', 'winery', 'cooking', 'water_sports',
  'aerial', 'sport', 'art', 'cultural', 'national_park', 'spa', 'wellness', 'cinema',
]);
function gygSearchUrl(name: string, place?: string): string {
  const partner = process.env.NEXT_PUBLIC_GYG_PARTNER_ID;
  const q = [name, place].filter(Boolean).join(' ');
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(q)}${partner ? `&partner_id=${encodeURIComponent(partner)}` : ''}`;
}

function SuggCard({
  s, currCode, onAdd, onDismiss, onAddToDay,
}: { s: AiSuggestion; currCode: string; onAdd: (s: AiSuggestion) => void; onDismiss: (s: AiSuggestion) => void; onAddToDay?: (s: AiSuggestion) => void }) {
  const sx = s as AiSuggestionExtended;
  const { t, locale } = useI18n();
  const { key: stampKey, color } = catStamp(s.category);
  const label = CAT_LABEL[s.category] ?? 'Place';
  const price = priceDots(s.priceLevel);

  return (
    <div className="lg" style={{ padding: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', gap: 13, marginBottom: 11 }}>
        <StampIcon iconKey={stampKey} size={48} aria-hidden="true" style={{ flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category + open pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span className="eyebrow-lg" style={{ color, fontSize: 9 }}>{label}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              padding: '2px 7px', borderRadius: 9999,
              background: s.open ? 'oklch(52% 0.18 145 / 14%)' : 'oklch(55% 0.18 22 / 14%)',
              color: s.open ? 'oklch(40% 0.18 145)' : 'oklch(50% 0.18 22)',
            }}>
              <span style={{ fontSize: 6, lineHeight: 1 }}>●</span>
              {s.open ? (locale === 'he' ? 'פתוח' : 'Open') : (locale === 'he' ? 'סגור' : 'Closed')}
            </span>
          </div>

          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--lg-ink)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            {s.name}
          </div>
        </div>
      </div>

      {/* ── Rating + price row ── */}
      {(s.rating != null || price || s.distance) && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
          marginBottom: 10, paddingBottom: 10,
          borderBottom: '1px solid oklch(50% 0.02 60 / 10%)',
        }}>
          {s.rating != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {/* Star row */}
              <div style={{ display: 'flex', gap: 1.5 }}>
                {[0, 1, 2, 3, 4].map(i => {
                  const diff = s.rating! - i;
                  const full  = diff >= 1;
                  const half  = !full && diff >= 0.4;
                  return (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <defs>
                        <linearGradient id={`half-${s.id}-${i}`} x1="0" x2="1" y1="0" y2="0">
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="oklch(50% 0.02 60 / 20%)" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={full ? '#f59e0b' : half ? `url(#half-${s.id}-${i})` : 'oklch(50% 0.02 60 / 22%)'}
                      />
                    </svg>
                  );
                })}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--lg-ink)' }}>
                {s.rating.toFixed(1)}
              </span>
              {s.ratingCount != null && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                  ({s.ratingCount >= 1000 ? `${(s.ratingCount / 1000).toFixed(1)}k` : s.ratingCount})
                </span>
              )}
            </div>
          )}

          {price && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              color: 'var(--lg-forest)', background: 'oklch(52% 0.18 145 / 10%)',
              padding: '3px 8px', borderRadius: 9999,
            }}>
              {price}
            </div>
          )}

          {s.distance && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-3)' }}>
              <Icon name="pin" size={11} color="var(--text-3)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{s.distance}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Info chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 11 }}>
        {/* Suggested time */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'var(--lg-panel-strong)', borderRadius: 9999, padding: '5px 10px',
          boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
        }}>
          <Icon name="clock" size={11} color="var(--lg-terra)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--lg-ink)' }}>
            {s.time} · {s.duration >= 60
              ? `${Math.floor(s.duration / 60)}h${s.duration % 60 ? ` ${s.duration % 60}m` : ''}`
              : `${s.duration}m`}
          </span>
        </div>

        {/* Estimated cost from Claude */}
        {s.cost != null && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--lg-panel-strong)', borderRadius: 9999, padding: '5px 10px',
            boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
          }}>
            <Icon name="download" size={11} color="var(--lg-sand)" />
            <CurrencyAmount
              amount={s.cost}
              base={currCode}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--lg-ink)' }}
            />
          </div>
        )}

        {/* Location */}
        {s.location && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--lg-panel-strong)', borderRadius: 9999, padding: '5px 10px',
            boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
            maxWidth: 200, overflow: 'hidden',
          }}>
            <Icon name="home" size={11} color="var(--text-3)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.location}
            </span>
          </div>
        )}

        {/* Google Maps link */}
        {s.mapsUrl && (
          <a
            href={s.mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'oklch(52% 0.18 260 / 10%)', borderRadius: 9999, padding: '5px 10px',
              boxShadow: 'inset 0 0 0 1px oklch(52% 0.18 260 / 20%)',
              cursor: 'pointer',
            }}>
              <Icon name="pin" size={11} color="oklch(52% 0.18 260)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(52% 0.18 260)', fontWeight: 600 }}>
                {locale === 'he' ? 'מפות' : 'Maps'}
              </span>
            </div>
          </a>
        )}

        {/* GetYourGuide tickets - bookable experiences only */}
        {GYG_BOOKABLE.has(s.category) && (
          <a
            href={gygSearchUrl(s.name, s.location)} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
            aria-label={locale === 'he' ? 'הזמן כרטיסים ב-GetYourGuide' : 'Book tickets on GetYourGuide'}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'oklch(62% 0.2 28 / 10%)', borderRadius: 9999, padding: '5px 10px',
              boxShadow: 'inset 0 0 0 1px oklch(62% 0.2 28 / 22%)',
              cursor: 'pointer',
            }}>
              <Icon name="ticket" size={11} color="#FF5533" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FF5533', fontWeight: 600 }}>
                {locale === 'he' ? 'כרטיסים' : 'Tickets'}
              </span>
            </div>
          </a>
        )}
      </div>

      {/* ── Description ── */}
      {s.description && (
        <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)', margin: '0 0 8px' }}>
          {s.description}
        </p>
      )}

      {/* ── Source attribution ── */}
      {sx.source_site && (
        <div style={{ marginBottom: 10 }}>
          {sx.source_url ? (
            <a
              href={sx.source_url} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
                color: 'var(--text-3)', textTransform: 'uppercase',
              }}>
                via {sx.source_site}
              </span>
            </a>
          ) : (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
              color: 'var(--text-3)', textTransform: 'uppercase',
            }}>
              via {sx.source_site}
            </span>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {onAddToDay && (
          <Btn
            kind="terra"
            full
            onClick={() => onAddToDay(s)}
            style={{ height: 44, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon name="plus" size={15} color="#fff" />
            {locale === 'he' ? 'הוסף לתוכנית היום' : 'Add to day plan'}
          </Btn>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn
            kind="forest"
            full
            onClick={() => onAdd(s)}
            style={{ height: 40, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Icon name="star" size={13} color="#fff" />
            {locale === 'he' ? 'Wishlist' : 'Wishlist'}
          </Btn>
          <button
            onClick={() => onDismiss(s)}
            className="lg-btn lg-btn-glass"
            style={{ height: 40, padding: '0 16px', flexShrink: 0, fontSize: 12 }}
          >
            {locale === 'he' ? 'דחה' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────

const LOADING_MSGS_EN = [
  'Scanning local hotspots…',
  "Checking what’s open nearby…",
  'Finding hidden gems…',
  'Asking the locals…',
  'Almost there - curating picks…',
  'Just a moment more…',
];
const LOADING_MSGS_HE = [
  'סורקים את המקומות הכי שווים…',
  'בודקים מה פתוח בקרבת מקום…',
  'מוצאים אבני חן נסתרות…',
  'שואלים את המקומיים…',
  'כמעט שם - מסננים את הטוב ביותר…',
  'עוד רגע קטן…',
];

// Trusted sources surfaced during a search - sequential pulse gives the
// "scanning the web in real time" feel and signals breadth (incl. GetYourGuide).
const SEARCH_SOURCES: { name: string; color: string }[] = [
  { name: 'Google',        color: '#4285F4' },
  { name: 'Tripadvisor',   color: '#34E0A1' },
  { name: 'GetYourGuide',  color: '#FF5533' },
  { name: 'Reddit',        color: '#FF4500' },
  { name: 'Lonely Planet', color: '#1BBC9B' },
  { name: 'Local blogs',   color: 'var(--lg-forest)' },
];

function LoadingState({ elapsed, msgIdx, locale }: { elapsed: number; msgIdx: number; locale: string }) {
  const isHe = locale === 'he';
  const msgs = isHe ? LOADING_MSGS_HE : LOADING_MSGS_EN;
  const msg  = msgs[msgIdx % msgs.length];

  // Progress: fast early (0→60% in 3s), then slow (60→92% over next 6s)
  const pct = elapsed <= 3
    ? Math.min(60, elapsed * 20)
    : Math.min(92, 60 + (elapsed - 3) * 5.3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Skeleton cards */}
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{
          height: i === 1 ? 130 : i === 2 ? 110 : 100,
          borderRadius: 18,
          opacity: 1 - (i - 1) * 0.18,
        }} />
      ))}

      {/* Progress card */}
      <div className="lg" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <m.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, 12, -12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}
          >✨</m.div>
          <AnimatePresence mode="wait">
            <m.span
              key={msgIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)', flex: 1, lineHeight: 1.3 }}
            >
              {msg}
            </m.span>
          </AnimatePresence>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            color: elapsed >= 10 ? 'var(--danger)' : 'var(--text-3)',
            background: elapsed >= 10 ? 'oklch(65% 0.13 25 / 12%)' : 'oklch(50% 0.02 60 / 8%)',
            padding: '3px 7px', borderRadius: 9999,
          }}>
            {elapsed}s
          </span>
        </div>

        {/* Progress bar - animated dots at the tip */}
        <div style={{ position: 'relative', height: 6, background: 'oklch(50% 0.02 60 / 12%)', borderRadius: 3, overflow: 'hidden' }}>
          <m.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--lg-terra), var(--lg-forest))',
              borderRadius: 3,
            }}
          />
          {/* Shimmer sweep */}
          <m.div
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
            style={{
              position: 'absolute', inset: 0, width: '30%',
              background: 'linear-gradient(90deg, transparent, oklch(100% 0 0 / 28%), transparent)',
            }}
          />
        </div>

        {/* Searching across trusted sources - staggered pulse = "real-time" feel */}
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-3)', margin: '0 0 8px', fontFamily: 'var(--font-mono)' }}>
            {isHe ? 'מחפש במקורות מובילים' : 'Searching trusted sources'}
          </p>
          <style>{`@keyframes srcPulse{0%,100%{opacity:.45;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}`}</style>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SEARCH_SOURCES.map((src, i) => (
              <span key={src.name} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 9px', borderRadius: 9999,
                background: 'oklch(50% 0.02 60 / 7%)',
                boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                fontSize: 11, fontWeight: 600, color: 'var(--text-2)',
                animation: `srcPulse 1.6s ${(i * 0.22).toFixed(2)}s ease-in-out infinite`,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: src.color, flexShrink: 0 }} />
                {src.name}
              </span>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '12px 0 0', fontFamily: 'var(--font-mono)' }}>
          {isHe ? 'מופעל על ידי Claude · ~3-5 שניות' : 'Powered by Claude · ~3-5 sec'}
        </p>
      </div>
    </div>
  );
}

// ── AISheet - replaces SuggestionsSheet ──────────────────────────────────────

interface AISheetProps {
  dayNumber: number;
}

export function AISheet({ dayNumber }: AISheetProps) {
  const { t, locale } = useI18n();
  const { show } = useToast();

  const {
    trip, tripDbId, currencyByTrip, activeGapStart, activeGapEnd,
    setShowSuggestions, setAiSuggestions, addWishlistItem, addEvent,
    personaContext, setPersonaContext,
  } = useAppStore(
    useShallow(s => ({
      trip:               s.trip,
      tripDbId:           s.tripDbId,
      currencyByTrip:     s.currencyByTrip,
      activeGapStart:     s.activeGapStart,
      activeGapEnd:       s.activeGapEnd,
      setShowSuggestions: s.setShowSuggestions,
      setAiSuggestions:   s.setAiSuggestions,
      addWishlistItem:    s.addWishlistItem,
      addEvent:           s.addEvent,
      personaContext:     s.personaContext,
      setPersonaContext:  s.setPersonaContext,
    }))
  );

  const currCode = (tripDbId && currencyByTrip[tripDbId]) || 'USD';

  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [suggestions,   setSuggestions]   = useState<AiSuggestion[]>([]);
  const [dismissed,     setDismissed]     = useState<string[]>([]);
  const [elapsed,       setElapsed]       = useState(0);
  const [msgIdx,        setMsgIdx]        = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClose = () => {
    setShowSuggestions(false);
    setPersonaContext(null);
  };

  // ── Streaming helper (shared by both endpoints) ─────────────────────────────
  const readStream = (res: Response): Promise<AiSuggestion[]> => {
    return new Promise((resolve, reject) => {
      const reader = res.body?.getReader();
      if (!reader) { reject(new Error('No response body')); return; }
      const decoder = new TextDecoder();
      let accumulated = '';

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });

          const enrichedIdx = accumulated.indexOf('\n__ENRICHED__');
          const errorIdx    = accumulated.indexOf('\n__ERROR__');

          if (enrichedIdx !== -1) {
            try { resolve(JSON.parse(accumulated.slice(enrichedIdx + '\n__ENRICHED__'.length)) as AiSuggestion[]); }
            catch { reject(new Error('Failed to parse suggestions')); }
            return;
          }
          if (errorIdx !== -1) {
            reject(new Error(accumulated.slice(errorIdx + '\n__ERROR__'.length) || 'AI request failed'));
            return;
          }
        }
        const clean = accumulated.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        try { resolve(JSON.parse(clean) as AiSuggestion[]); }
        catch { reject(new Error('Incomplete stream response')); }
      };

      pump().catch(reject);
    });
  };

  const fetchSuggestions = (exclude: string[] = []): Promise<AiSuggestion[]> => {
    return new Promise((resolve, reject) => {
      if (!trip) { reject(new Error('No trip')); return; }

      // ── Recommend endpoint (persona-aware, cache-first) ──────────────────
      if (personaContext) {
        const body = { ...personaContext, exclude: [...(personaContext.exclude ?? []), ...exclude] };
        fetch('/api/ai/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).then(async res => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({})) as { error?: string; retryAfter?: number };
            if (res.status === 429 && err.retryAfter) {
              reject(new Error(`Rate limited - try again in ${err.retryAfter}s`));
            } else {
              reject(new Error(err.error ?? `Server error ${res.status}`));
            }
            return;
          }

          const contentType = res.headers.get('content-type') ?? '';

          // Fast path: cache hit returns JSON directly
          if (contentType.includes('application/json')) {
            try { resolve(await res.json() as AiSuggestion[]); }
            catch { reject(new Error('Failed to parse response')); }
            return;
          }

          // Slow path: streaming response
          readStream(res).then(resolve).catch(reject);
        }).catch(reject);
        return;
      }

      // ── Legacy endpoint (no persona context) ────────────────────────────
      const existingEvents = trip.events[dayNumber] ?? [];
      const dayMeta = trip.dayMeta[dayNumber - 1];
      const currentHotel = (trip.hotels ?? []).find(
        h => h.checkInDay <= dayNumber && h.checkOutDay > dayNumber
      );

      fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber, dayMeta, existingEvents,
          tripName: trip.name, countries: trip.countries ?? [],
          exclude,
          gapStart: activeGapStart ?? undefined,
          gapEnd:   activeGapEnd   ?? undefined,
          locale,
          hotelLocation: currentHotel?.location,
          hotelName:     currentHotel?.name,
        }),
      }).then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string; retryAfter?: number };
          if (res.status === 429 && body.retryAfter) {
            reject(new Error(`Rate limited - try again in ${body.retryAfter}s`));
          } else {
            reject(new Error(body.error ?? `Server error ${res.status}`));
          }
          return;
        }
        readStream(res).then(resolve).catch(reject);
      }).catch(reject);
    });
  };

  const runFetch = (exclude: string[] = []) => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setElapsed(0);
    setMsgIdx(0);
    elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    msgRef.current     = setInterval(() => setMsgIdx(i => i + 1), 2200);

    fetchSuggestions(exclude)
      .then(data => {
        setSuggestions(data);
        setAiSuggestions(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      })
      .finally(() => {
        if (elapsedRef.current) clearInterval(elapsedRef.current);
        if (msgRef.current)     clearInterval(msgRef.current);
      });
  };

  useEffect(() => {
    runFetch();
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (msgRef.current)     clearInterval(msgRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayNumber]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    const shownNames = suggestions.map(s => s.name);
    fetchSuggestions(shownNames)
      .then(data => {
        const withOffset = data.map((s, i) => ({ ...s, id: `ai-more-${Date.now()}-${i}` }));
        setSuggestions(prev => {
          const next = [...prev, ...withOffset];
          setAiSuggestions(next);
          return next;
        });
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const handleAdd = (s: AiSuggestion) => {
    addWishlistItem({
      name:     s.name,
      category: s.category,
      location: s.location,
      duration: s.duration,
      notes:    s.description || undefined,
    });
    show(locale === 'he' ? `"${s.name}" נוסף ל-Wishlist` : `"${s.name}" added to Wishlist`);
  };

  const handleAddToDay = (s: AiSuggestion) => {
    addEvent(dayNumber, {
      name:     s.name,
      category: s.category,
      time:     s.time,
      duration: s.duration,
      location: s.location,
      cost:     s.cost ?? 0,
      notes:    s.description || undefined,
    });
    setDismissed(d => [...d, s.id]);
    show(locale === 'he' ? `"${s.name}" נוסף ליום ${dayNumber}` : `"${s.name}" added to Day ${dayNumber}`);
  };

  const visible = suggestions.filter(s => !dismissed.includes(s.id));

  return (
    <Sheet
      onClose={handleClose}
      title={personaContext
        ? (locale === 'he' ? 'המקומות שלך' : 'Your spots')
        : t('aiSuggestions')}
      subtitle={t('aiSugSub')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {loading ? (
          <LoadingState elapsed={elapsed} msgIdx={msgIdx} locale={locale} />
        ) : error ? (
          <div className="lg" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <Icon name="compass" size={32} color="var(--danger)" />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--lg-ink)', margin: '10px 0 4px' }}>
              {locale === 'he' ? 'משהו השתבש' : 'Something went wrong'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 14px' }}>{error}</p>
            <button
              onClick={() => runFetch()}
              className="lg-btn lg-btn-forest"
              style={{ height: 40, padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Icon name="sparkle" size={13} color="#fff" />
              {locale === 'he' ? 'נסה שוב' : 'Try again'}
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Icon name="sparkle" size={36} color="var(--lg-sand)" />
            <p className="text-display-sm" style={{ margin: '12px 0 6px' }}>
              {locale === 'he' ? 'אין עוד הצעות' : 'All caught up!'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              {locale === 'he' ? 'נסה לטעון עוד' : 'Try loading more suggestions below.'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {visible.map((s, i) => (
              <m.div
                key={s.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ ...spring.snap, delay: Math.min(i, 7) * 0.06 }}
                layout
              >
                <SuggCard
                  s={s}
                  currCode={currCode}
                  onAdd={handleAdd}
                  onDismiss={s => setDismissed(d => [...d, s.id])}
                  onAddToDay={handleAddToDay}
                />
              </m.div>
            ))}
          </AnimatePresence>
        )}

        {/* Load more */}
        {!loading && !error && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="lg-btn lg-btn-glass"
            style={{ height: 44, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Icon name="sparkle" size={13} color="var(--lg-terra)" />
            {loadingMore
              ? (locale === 'he' ? 'טוען...' : 'Loading…')
              : (locale === 'he' ? 'טען עוד' : 'Load more')}
          </button>
        )}
      </div>
    </Sheet>
  );
}
