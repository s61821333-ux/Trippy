'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Minimal ambient shim so we don't need @types/google.maps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GMarker = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapStyleEntry = Record<string, unknown>;
declare global {
  interface Window { google?: Record<string, unknown>; }
}

import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { StampIcon } from '../ui/StampIcon';
import { catStamp } from '@/lib/categoryStamp';
import { useI18n } from '@/lib/i18n';
import { AiSuggestion, TripEvent } from '@/lib/types';
import Icon from '../ui/Icon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapPin {
  eventId: string;
  day: number;
  event: TripEvent;
  lat: number;
  lng: number;
}

type MapMode = 'trip' | 'explore';

// ─── Brand tokens — static hex values required for SVG fill/stroke attrs ──────
// CSS custom properties cannot be used inside SVG fill/stroke attributes.
// These hex values mirror the design-system tokens exactly.
const B = {
  terra:    '#C4714A',
  terraLt:  '#E0916B',
  forest:   '#3B6E52',
  forestLt: '#8BB39A',
  gold:     '#C8944A',
  goldLt:   '#E6B574',
  ink:      '#1A1410',
  paper:    '#F4EFE8',
};

// ─── Category colours ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  food: '#E07052', cafe: '#C4A44A', attraction: '#3B6E52', hotel: '#7B5EA7',
  transport: '#4A8FC4', flight: '#4A8FC4', concert: '#E07052',
  theme_park: '#C4714A', sport: '#3B6E52', beach: '#4A8FC4',
  rest: '#A09080', other: '#A09080',
};

function pinColor(cat: string) { return CATEGORY_COLORS[cat] ?? B.terra; }


const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food', cafe: 'Café', attraction: 'Sight', hotel: 'Stay',
  transport: 'Transit', flight: 'Flight', concert: 'Event',
  theme_park: 'Park', sport: 'Sport', beach: 'Beach', rest: 'Rest', other: 'Place',
};

// ─── Compass SVG mark (Trippy brand icon) ────────────────────────────────────

function CompassMark({ size = 40, spin = false }: { size?: number; spin?: boolean }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 240 240"
      aria-hidden="true"
      style={spin ? { animation: 'spin-cw 6s linear infinite', transformOrigin: '50% 50%' } : undefined}
    >
      <circle cx="120" cy="120" r="90" fill="none" stroke={B.ink} strokeWidth="4" />
      <path d="M120 36 L138 120 L120 124 L102 120 Z" fill={B.terra} />
      <path d="M120 204 L102 120 L120 116 L138 120 Z" fill={B.forest} />
      <path d="M204 120 L120 102 L116 120 L120 138 Z" fill={B.gold} />
      <path d="M36 120 L120 138 L124 120 L120 102 Z" fill={B.gold} opacity="0.55" />
      <circle cx="120" cy="120" r="6" fill={B.ink} />
    </svg>
  );
}

// ─── Animated Globe/Compass Loader ───────────────────────────────────────────

function CompassLoader() {
  return (
    <m.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 30,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
      }}
    >
      <style>{`
        @keyframes spin-cw  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes spin-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes halo-breath {
          0%,100% { transform: scale(0.86); opacity: 0.7; }
          50%      { transform: scale(1.04); opacity: 1; }
        }
        .loader-spin-vslow  { animation: spin-cw  9.0s linear infinite; transform-origin: 50% 50%; }
        .loader-spin-slow   { animation: spin-cw  5.4s linear infinite; transform-origin: 50% 50%; }
        .loader-spin-med    { animation: spin-ccw 3.6s linear infinite; transform-origin: 50% 50%; }
        .loader-spin-fast   { animation: spin-cw  2.4s linear infinite; transform-origin: 50% 50%; }
        .loader-spin-mark   { animation: spin-cw  6.0s linear infinite; transform-origin: 50% 50%; }
        .loader-halo { animation: halo-breath 2.8s ease-in-out infinite; }
      `}</style>

      <div style={{ width: 160, height: 160, position: 'relative' }}>
        {/* Halo */}
        <div className="loader-halo" style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(196,113,74,0.22) 0%, rgba(196,113,74,0.10) 28%, rgba(244,239,232,0) 58%)',
        }} />

        {/* Outermost: faint forest streak */}
        <svg className="loader-spin-vslow" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <circle cx="80" cy="80" r="77" fill="none" stroke={B.forest} strokeWidth="1" strokeDasharray="136 348" strokeLinecap="round" opacity="0.35" />
        </svg>

        {/* Outer: terracotta long arc */}
        <svg className="loader-spin-slow" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <circle cx="80" cy="80" r="73" fill="none" stroke={B.terra} strokeWidth="1.5" strokeDasharray="96 68 14 286" strokeLinecap="round" opacity="0.75" />
        </svg>

        {/* Tiny terra dot on outer orbit */}
        <svg className="loader-spin-slow" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <circle cx="80" cy="7" r="2.8" fill={B.terra} />
        </svg>

        {/* Mid: gold counter-rotating */}
        <svg className="loader-spin-med" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <circle cx="80" cy="80" r="67" fill="none" stroke={B.gold} strokeWidth="1.5" strokeDasharray="46 30 18 328" strokeLinecap="round" opacity="0.9" />
        </svg>

        {/* Gold bead on mid orbit */}
        <svg className="loader-spin-med" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <g transform="translate(80 147) rotate(45)">
            <rect x="-2.8" y="-2.8" width="5.6" height="5.6" fill={B.gold} />
          </g>
        </svg>

        {/* Inner: forest arcs, fast */}
        <svg className="loader-spin-fast" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <circle cx="80" cy="80" r="60" fill="none" stroke={B.forest} strokeWidth="2" strokeDasharray="35 48 14 284" strokeLinecap="round" opacity="0.92" />
        </svg>

        {/* Forest dot on inner orbit */}
        <svg className="loader-spin-fast" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <circle cx="140" cy="80" r="2.8" fill={B.forest} />
          <circle cx="80" cy="20" r="1.8" fill={B.terraLt} opacity="0.9" />
        </svg>

        {/* Trippy compass mark */}
        <svg className="loader-spin-mark" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <circle cx="80" cy="80" r="56" fill="none" stroke={B.ink} strokeWidth="3" />
          <path d="M80 28 L92 80 L80 83 L68 80 Z" fill={B.terra} />
          <path d="M80 132 L68 80 L80 77 L92 80 Z" fill={B.forest} />
          <path d="M132 80 L80 68 L77 80 L80 92 Z" fill={B.gold} />
          <path d="M28 80 L80 92 L83 80 L80 68 Z" fill={B.gold} opacity="0.55" />
          <circle cx="80" cy="80" r="4.5" fill={B.ink} />
        </svg>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.14em', color: 'var(--text-3)',
        textTransform: 'uppercase',
      }}>
        Loading map…
      </div>
    </m.div>
  );
}

// ─── Decorative corner compass ────────────────────────────────────────────────

function DecorativeCompass() {
  return (
    <div style={{
      position: 'absolute', top: 100, right: 16, zIndex: 10,
      width: 72, height: 72,
      opacity: 0.45,
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes spin-cw { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .deco-ring { animation: spin-cw 20s linear infinite; transform-origin: 50% 50%; }
      `}</style>
      <svg className="deco-ring" viewBox="0 0 72 72" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="36" cy="36" r="34" fill="none" stroke="rgba(26,20,16,0.25)" strokeWidth="1" strokeDasharray="40 170" />
      </svg>
      <div style={{ position: 'absolute', inset: 8 }}>
        <CompassMark size={56} />
      </div>
    </div>
  );
}

// ─── Mode toggle pill ─────────────────────────────────────────────────────────

function ModeToggle({ mode, onChange }: { mode: MapMode; onChange: (m: MapMode) => void }) {
  return (
    <div style={{
      display: 'flex', gap: 2,
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(40px)',
      border: '1px solid rgba(255,255,255,0.5)',
      borderRadius: 'var(--radius-full)',
      padding: 3,
      boxShadow: '0 4px 20px rgba(26,20,16,0.08)',
    }}>
      {(['trip', 'explore'] as MapMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            padding: '8px 15px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: mode === m ? 'var(--lg-forest)' : 'transparent',
            color: mode === m ? '#fff' : 'var(--text-3)',
            boxShadow: mode === m ? 'var(--lg-glow-forest)' : 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: 10, fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {m === 'trip' ? 'Trip' : 'Explore'}
        </button>
      ))}
    </div>
  );
}

// ─── Day filter pill ─────────────────────────────────────────────────────────

function DayPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <m.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={spring.snap}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        border: active ? 'none' : '1px solid rgba(255,255,255,0.5)',
        background: active ? 'var(--terra)' : 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px)',
        color: active ? '#fff' : 'var(--text-2)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11, fontWeight: active ? 700 : 500,
        letterSpacing: '0.08em',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0, whiteSpace: 'nowrap',
        boxShadow: active ? '0 4px 16px rgba(196,113,74,0.35)' : '0 2px 8px rgba(26,20,16,0.06)',
      } as React.CSSProperties}
    >
      {label}
    </m.button>
  );
}

// ─── AI suggestion card (horizontal scroll rail) ──────────────────────────────

function SuggestionCard({
  s, selected, onClick,
}: { s: AiSuggestion; selected: boolean; onClick: () => void }) {
  const col = pinColor(s.category);
  const label = CATEGORY_LABELS[s.category] ?? 'Place';

  return (
    <m.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={spring.snap}
      style={{
        flexShrink: 0,
        width: 200,
        background: selected ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(40px)',
        border: selected ? `1.5px solid ${col}` : '1px solid rgba(255,255,255,0.5)',
        borderRadius: 'var(--radius-lg)',
        padding: 14,
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: selected
          ? `0 8px 32px rgba(26,20,16,0.12), 0 0 0 1px ${col}40`
          : '0 4px 16px rgba(26,20,16,0.07)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Glass shimmer rim */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Category badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: col + '22', borderRadius: 'var(--radius-full)',
        padding: '3px 10px', marginBottom: 8,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: col, flexShrink: 0 }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          fontWeight: 600, letterSpacing: '0.12em',
          color: col, textTransform: 'uppercase',
        }}>{label}</span>
      </div>

      <div style={{
        fontFamily: 'var(--font-sans)', fontWeight: 700,
        fontSize: 14, color: 'var(--text)', lineHeight: 1.3,
        marginBottom: 4,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      } as React.CSSProperties}>
        {s.name}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--text-3)', letterSpacing: '0.06em',
      }}>
        {s.distance && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
              <path d="M4 0C1.79 0 0 1.79 0 4c0 3 4 6 4 6s4-3 4-6c0-2.21-1.79-4-4-4zm0 5.5C3.17 5.5 2.5 4.83 2.5 4S3.17 2.5 4 2.5 5.5 3.17 5.5 4 4.83 5.5 4 5.5z" fill={B.terra} />
            </svg>
            {s.distance}
          </span>
        )}
        {s.rating && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill={B.gold}><path d="M4.5 0l1.1 3.3h3.4L6.3 5.4l1 3.1L4.5 6.8 1.6 8.5l1-3.1L0 3.3h3.4z" /></svg>
            {s.rating}
          </span>
        )}
        {s.open !== undefined && (
          <span style={{ color: s.open ? '#2E7D55' : '#C0392B', fontWeight: 600 }}>
            {s.open ? 'Open' : 'Closed'}
          </span>
        )}
      </div>
    </m.button>
  );
}

// ─── Selected event / suggestion detail panel ─────────────────────────────────

function EventPanel({ pin, onClose }: { pin: MapPin; onClose: () => void }) {
  const e = pin.event;
  const col = pinColor(e.category);
  const label = CATEGORY_LABELS[e.category] ?? 'Place';

  return (
    <m.div
      key={pin.eventId}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={spring.gentle}
      style={{
        position: 'absolute', bottom: 0, insetInline: 0, zIndex: 50,
        padding: '20px 20px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        borderTop: '1px solid rgba(255,255,255,0.6)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: '0 -8px 40px rgba(26,20,16,0.10)',
      }}
    >
      {/* Drag handle */}
      <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,20,16,0.12)', margin: '0 auto 16px' }} />

      {/* Glass rim */}
      <div style={{
        position: 'absolute', top: 0, insetInline: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Category stamp seal */}
        <StampIcon
          iconKey={catStamp(e.category).key}
          size={52}
          style={{ flexShrink: 0, filter: 'drop-shadow(0 3px 8px oklch(20% 0.03 60 / 22%))' }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: col + '18', borderRadius: 'var(--radius-full)',
            padding: '2px 10px', marginBottom: 6,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: col }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: col, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
              · DAY {pin.day}
            </span>
          </div>

          <div style={{
            fontFamily: 'var(--font-sans)', fontWeight: 700,
            fontSize: 18, color: 'var(--text)', lineHeight: 1.2, marginBottom: 4,
          }}>
            {e.name}
          </div>

          {e.location && (
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icon name="pin" size={11} style={{ color: 'var(--terra)', flexShrink: 0 }} />
              {e.location}
            </div>
          )}

          <div style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-3)', letterSpacing: '0.06em',
          }}>
            {e.time && <span>{e.time}</span>}
            {e.duration ? <span>{e.duration} min</span> : null}
          </div>
        </div>

        <m.button
          onClick={onClose}
          whileTap={{ scale: 0.88 }}
          transition={spring.snap}
          aria-label="Close"
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(26,20,16,0.1)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-2)',
            WebkitTapHighlightColor: 'transparent', flexShrink: 0,
          }}
        >
          <Icon name="x" size={14} />
        </m.button>
      </div>
    </m.div>
  );
}

// ─── Suggestion detail panel ──────────────────────────────────────────────────

function SuggestionPanel({ s, onClose, onAdd }: {
  s: AiSuggestion;
  onClose: () => void;
  onAdd: (s: AiSuggestion) => void;
}) {
  const col = pinColor(s.category);
  const label = CATEGORY_LABELS[s.category] ?? 'Place';

  return (
    <m.div
      key={s.id}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={spring.gentle}
      style={{
        position: 'absolute', bottom: 0, insetInline: 0, zIndex: 50,
        padding: '20px 20px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        borderTop: '1px solid rgba(255,255,255,0.6)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: '0 -8px 40px rgba(26,20,16,0.10)',
      }}
    >
      <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,20,16,0.12)', margin: '0 auto 16px' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
        <StampIcon
          iconKey={catStamp(s.category).key}
          size={52}
          style={{ flexShrink: 0, filter: 'drop-shadow(0 3px 8px oklch(20% 0.03 60 / 22%))' }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: col + '18', borderRadius: 'var(--radius-full)',
            padding: '2px 10px', marginBottom: 6,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: col }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: col, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>{label}</span>
            {s.distance && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
                · {s.distance}
              </span>
            )}
          </div>

          <div style={{
            fontFamily: 'var(--font-sans)', fontWeight: 700,
            fontSize: 18, color: 'var(--text)', lineHeight: 1.2, marginBottom: 4,
          }}>
            {s.name}
          </div>

          {s.description && (
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'var(--text-2)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } as React.CSSProperties}>
              {s.description}
            </div>
          )}
        </div>

        <m.button
          onClick={onClose}
          whileTap={{ scale: 0.88 }}
          transition={spring.snap}
          aria-label="Close"
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(26,20,16,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-2)',
            WebkitTapHighlightColor: 'transparent', flexShrink: 0,
          }}
        >
          <Icon name="x" size={14} />
        </m.button>
      </div>

      {/* Meta row */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16,
      }}>
        {s.rating && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(200,148,74,0.10)', borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sand)',
          }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill={B.gold}><path d="M4.5 0l1.1 3.3h3.4L6.3 5.4l1 3.1L4.5 6.8 1.6 8.5l1-3.1L0 3.3h3.4z" /></svg>
            {s.rating} {s.ratingCount ? `(${s.ratingCount})` : ''}
          </div>
        )}
        {s.duration > 0 && (
          <div style={{
            background: 'rgba(26,20,16,0.06)', borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)',
          }}>
            ~{s.duration} min
          </div>
        )}
        {s.open !== undefined && (
          <div style={{
            background: s.open ? '#2E7D5520' : '#C0392B20',
            borderRadius: 'var(--radius-full)', padding: '4px 10px',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: s.open ? '#2E7D55' : '#C0392B', fontWeight: 600,
          }}>
            {s.open ? '● Open now' : '● Closed'}
          </div>
        )}
      </div>

      {/* Quick Add */}
      <m.button
        onClick={() => onAdd(s)}
        whileTap={{ scale: 0.96 }}
        transition={spring.snap}
        className="lg-btn lg-btn-terra"
        style={{
          width: '100%', padding: '13px 20px', height: 52,
          fontFamily: 'var(--font-mono)', fontSize: 12,
          fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Quick Add to Trip
      </m.button>
    </m.div>
  );
}

// ─── No-API fallback (terrain background with overlay) ───────────────────────

function FallbackMap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Warm desert gradient fallback */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #d4b896 0%, #c9a678 20%, #b89060 40%, #8b6e4e 70%, #6b5240 100%)',
      }} />
      {/* Topographic pattern overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="topo" x="0" y="0" width="120" height="80" patternUnits="userSpaceOnUse">
            <ellipse cx="60" cy="40" rx="55" ry="30" fill="none" stroke="#1A1410" strokeWidth="0.8" />
            <ellipse cx="60" cy="40" rx="40" ry="20" fill="none" stroke="#1A1410" strokeWidth="0.6" />
            <ellipse cx="60" cy="40" rx="25" ry="12" fill="none" stroke="#1A1410" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo)" />
      </svg>
      {children}
    </div>
  );
}

// ─── AI suggestion empty state ────────────────────────────────────────────────

function ExploreEmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, padding: '0 var(--page-px)',
      textAlign: 'center', paddingTop: 48,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(40px)',
        borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.5)',
        padding: 24, maxWidth: 280,
        boxShadow: '0 8px 32px rgba(26,20,16,0.08)',
      }}>
        <CompassMark size={48} />
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 16,
          fontWeight: 700, color: 'var(--text)', margin: '12px 0 6px',
        }}>
          Discover Nearby
        </div>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 13,
          color: 'var(--text-2)', lineHeight: 1.5,
        }}>
          AI suggestions appear as you add events to your trip days.
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MapScreen() {
  const { t } = useI18n();

  const { trip, aiSuggestions, addSuggestionToDay, activeDay } = useAppStore(useShallow(s => ({
    trip: s.trip,
    aiSuggestions: s.aiSuggestions,
    addSuggestionToDay: s.addSuggestionToDay,
    activeDay: s.activeDay,
  })));

  const mapRef    = useRef<HTMLDivElement>(null);
  const googleMap = useRef<GMap>(null);
  const markers   = useRef<GMarker[]>([]);

  const [mapReady, setMapReady]               = useState(false);
  const [mapError, setMapError]               = useState(false);
  const [selectedPin, setSelectedPin]         = useState<MapPin | null>(null);
  const [selectedSugg, setSelectedSugg]       = useState<AiSuggestion | null>(null);
  const [activeDayFilter, setActiveDay]       = useState<number | 'all'>('all');
  const [mode, setMode]                       = useState<MapMode>('trip');
  const [searchQuery, setSearchQuery]         = useState('');

  // ── All trip pins ────────────────────────────────────────────────────────
  const allPins: MapPin[] = React.useMemo(() => {
    if (!trip) return [];
    const pins: MapPin[] = [];
    for (let d = 1; d <= trip.days; d++) {
      for (const ev of trip.events[d] ?? []) {
        if (ev.lat != null && ev.lng != null) {
          pins.push({ eventId: ev.id, day: d, event: ev, lat: ev.lat, lng: ev.lng });
        }
      }
    }
    return pins;
  }, [trip]);

  const visiblePins = activeDayFilter === 'all'
    ? allPins
    : allPins.filter(p => p.day === activeDayFilter);

  const days = trip ? Array.from({ length: trip.days }, (_, i) => i + 1) : [];

  // ── Filter suggestions ───────────────────────────────────────────────────
  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return aiSuggestions;
    const q = searchQuery.toLowerCase();
    return aiSuggestions.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  }, [aiSuggestions, searchQuery]);

  // ── Load Google Maps ─────────────────────────────────────────────────────
  const initMap = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gm = (window as any).google?.maps;
    if (!mapRef.current || !gm) return;

    const center = visiblePins.length > 0
      ? { lat: visiblePins[0].lat, lng: visiblePins[0].lng }
      : trip?.dayMeta[0]
        ? { lat: trip.dayMeta[0].lat, lng: trip.dayMeta[0].lng }
        : { lat: 31.5, lng: 35.0 };

    googleMap.current = new gm.Map(mapRef.current, {
      center, zoom: 12,
      disableDefaultUI: true,
      zoomControl: false,
      gestureHandling: 'greedy',
      styles: mapStyles,
    });

    setMapReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapError(true); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps) { initMap(); return; }

    const existing = document.querySelector('script[data-maps]');
    if (existing) {
      existing.addEventListener('load', initMap);
      return () => existing.removeEventListener('load', initMap);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true; script.defer = true;
    script.setAttribute('data-maps', 'true');
    script.onload = initMap;
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-render markers ────────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gm = (window as any).google?.maps;
    if (!googleMap.current || !gm) return;

    markers.current.forEach((m: GMarker) => m.setMap(null));
    markers.current = [];
    if (visiblePins.length === 0) return;

    const bounds = new gm.LatLngBounds();
    visiblePins.forEach(pin => {
      const color = pinColor(pin.event.category);
      const marker = new gm.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        map: googleMap.current,
        title: pin.event.name,
        icon: {
          path: gm.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2.5,
        },
      });
      marker.addListener('click', () => { setSelectedPin(pin); setSelectedSugg(null); });
      markers.current.push(marker);
      bounds.extend({ lat: pin.lat, lng: pin.lng });
    });

    if (visiblePins.length > 1) {
      googleMap.current.fitBounds(bounds, { top: 80, bottom: 220, left: 24, right: 24 });
    } else {
      googleMap.current.setCenter({ lat: visiblePins[0].lat, lng: visiblePins[0].lng });
      googleMap.current.setZoom(15);
    }
  }, [visiblePins, mapReady]);

  // ── Handle adding suggestion ─────────────────────────────────────────────
  function handleAddSuggestion(s: AiSuggestion) {
    if (typeof addSuggestionToDay === 'function') {
      addSuggestionToDay(activeDay, s.id);
    }
    setSelectedSugg(null);
  }

  if (!trip) return null;

  // ── Wrapper ──────────────────────────────────────────────────────────────
  const mapContent = (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Map canvas */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} aria-label={t('mapTitle')} />

      {/* Compass brand mark */}
      <DecorativeCompass />

      {/* Loading overlay */}
      <AnimatePresence>
        {!mapReady && !mapError && <CompassLoader />}
      </AnimatePresence>

      {/* ── Top bar ── */}
      <div style={{
        position: 'absolute', top: 0, insetInline: 0, zIndex: 30,
        padding: '12px 16px 0',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Search pill */}
        <div className="lg lg-strong" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          borderRadius: 'var(--radius-full)',
          padding: '10px 16px',
        }}>
          {/* Glass rim */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
          {/* Compass icon */}
          <div style={{ flexShrink: 0 }}>
            <CompassMark size={20} />
          </div>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={mode === 'trip' ? 'Search your trip…' : 'Search nearby places…'}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 14,
              color: 'var(--text)', caretColor: 'var(--terra)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-3)', padding: '2px 4px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon name="x" size={14} />
            </button>
          )}
          <div style={{ width: 1, height: 18, background: 'rgba(26,20,16,0.12)', flexShrink: 0 }} />
          <ModeToggle mode={mode} onChange={m => { setMode(m); setSelectedPin(null); setSelectedSugg(null); }} />
        </div>

        {/* Day filter strip (trip mode) */}
        {mode === 'trip' && (mapReady || mapError) && (
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto',
            scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
            paddingBottom: 2,
          } as React.CSSProperties}>
            <DayPill
              label="All Days"
              active={activeDayFilter === 'all'}
              onClick={() => { setActiveDay('all'); setSelectedPin(null); }}
            />
            {days.map(d => (
              <DayPill
                key={d}
                label={`Day ${d}`}
                active={activeDayFilter === d}
                onClick={() => { setActiveDay(d); setSelectedPin(null); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pin count badge (trip mode) ── */}
      {mode === 'trip' && (mapReady || mapError) && visiblePins.length > 0 && (
        <div style={{
          position: 'absolute', top: mode === 'trip' ? 112 : 68, right: 16, zIndex: 20,
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          fontWeight: 600, letterSpacing: '0.08em',
          color: 'var(--text-2)',
          boxShadow: '0 2px 8px rgba(26,20,16,0.06)',
        }}>
          {visiblePins.length} pin{visiblePins.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* ── Explore mode: AI suggestions rail ── */}
      {mode === 'explore' && (
        <div style={{
          position: 'absolute',
          bottom: selectedSugg ? 'calc(220px + env(safe-area-inset-bottom, 0px))' : 'calc(var(--nav-total-h) + 12px)',
          insetInline: 0, zIndex: 40,
          transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 16px 10px',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(26,20,16,0.07)',
            }}>
              {/* Tiny compass mark */}
              <svg width="14" height="14" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="90" fill="none" stroke={B.ink} strokeWidth="6" />
                <path d="M120 36 L138 120 L120 124 L102 120 Z" fill={B.terra} />
                <path d="M120 204 L102 120 L120 116 L138 120 Z" fill={B.forest} />
                <path d="M204 120 L120 102 L116 120 L120 138 Z" fill={B.gold} />
                <path d="M36 120 L120 138 L124 120 L120 102 Z" fill={B.gold} opacity="0.55" />
                <circle cx="120" cy="120" r="10" fill={B.ink} />
              </svg>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                fontWeight: 700, letterSpacing: '0.12em',
                color: 'var(--text-2)', textTransform: 'uppercase',
              }}>
                {filteredSuggestions.length > 0
                  ? `${filteredSuggestions.length} Nearby`
                  : 'AI Suggestions'}
              </span>
            </div>
          </div>

          {filteredSuggestions.length > 0 ? (
            <div style={{
              display: 'flex', gap: 10, overflowX: 'auto',
              padding: '0 16px 8px',
              scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
            } as React.CSSProperties}>
              {filteredSuggestions.map(s => (
                <SuggestionCard
                  key={s.id}
                  s={s}
                  selected={selectedSugg?.id === s.id}
                  onClick={() => { setSelectedSugg(selectedSugg?.id === s.id ? null : s); }}
                />
              ))}
            </div>
          ) : (
            !searchQuery && <ExploreEmptyState />
          )}
        </div>
      )}

      {/* ── Trip mode empty state ── */}
      {mode === 'trip' && (mapReady || mapError) && allPins.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', padding: 24,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.68)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.55)',
            borderRadius: 'var(--radius-xl)',
            padding: 28, maxWidth: 280, textAlign: 'center',
            boxShadow: '0 12px 40px rgba(26,20,16,0.10)',
          }}>
            <CompassMark size={44} />
            <div style={{
              fontFamily: 'var(--font-sans)', fontWeight: 700,
              fontSize: 16, color: 'var(--text)', margin: '12px 0 6px',
            }}>
              {t('mapNoEvents')}
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'var(--text-2)', lineHeight: 1.5,
            }}>
              {t('mapNoEventsHint')}
            </div>
          </div>
        </div>
      )}

      {/* ── Trip event panel ── */}
      <AnimatePresence>
        {mode === 'trip' && selectedPin && (
          <EventPanel key={selectedPin.eventId} pin={selectedPin} onClose={() => setSelectedPin(null)} />
        )}
      </AnimatePresence>

      {/* ── Suggestion detail panel ── */}
      <AnimatePresence>
        {mode === 'explore' && selectedSugg && (
          <SuggestionPanel
            key={selectedSugg.id}
            s={selectedSugg}
            onClose={() => setSelectedSugg(null)}
            onAdd={handleAddSuggestion}
          />
        )}
      </AnimatePresence>
    </div>
  );

  if (mapError) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        <FallbackMap>
          {mapContent}
        </FallbackMap>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {mapContent}
    </div>
  );
}

// ─── Map styles — muted sand palette ─────────────────────────────────────────

const mapStyles: MapStyleEntry[] = [
  { elementType: 'geometry',              stylers: [{ color: '#f0ebe3' }] },
  { elementType: 'labels.text.fill',      stylers: [{ color: '#6b5c4e' }] },
  { elementType: 'labels.text.stroke',    stylers: [{ color: '#f4efe8' }] },
  { featureType: 'administrative',        elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi',                   stylers: [{ visibility: 'off' }] },
  { featureType: 'road',                  elementType: 'geometry', stylers: [{ color: '#e0d8cf' }] },
  { featureType: 'road',                  elementType: 'geometry.stroke', stylers: [{ color: '#d4ccc3' }] },
  { featureType: 'road.highway',          elementType: 'geometry', stylers: [{ color: '#d4c4b4' }] },
  { featureType: 'transit',               stylers: [{ visibility: 'off' }] },
  { featureType: 'water',                 elementType: 'geometry', stylers: [{ color: '#b8d4e8' }] },
  { featureType: 'water',                 elementType: 'labels.text.fill', stylers: [{ color: '#4a6d84' }] },
];
