'use client';

import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { StampIcon } from '../ui/StampIcon';
import { catStamp } from '@/lib/categoryStamp';
import Icon from '../ui/Icon';
import Btn from '../ui/Btn';

// ── Types ─────────────────────────────────────────────────────────────────────

type MapMode = 'trip' | 'explore';

interface Pin {
  key: string;      // stamp icon key
  x: number;        // absolute px from left
  y: number;        // absolute px from top
  label: string;    // event name
  delay: number;    // a-pop stagger delay
}

// ── Decorative pin layout — mirrors explore.jsx reference ─────────────────────
// Falls back to these when the trip has no geocoded events.

const DECORATIVE_PINS: Omit<Pin, 'label'>[] = [
  { key: 'plane',  x: 60,  y: 130, delay: 0     },
  { key: 'hotel',  x: 250, y: 200, delay: 0.08  },
  { key: 'museum', x: 140, y: 300, delay: 0.16  },
  { key: 'wine',   x: 270, y: 380, delay: 0.24  },
  { key: 'coffee', x: 90,  y: 440, delay: 0.32  },
];

// ── Route polyline points (matches DECORATIVE_PINS order) ─────────────────────
const ROUTE_D = 'M80 150 L268 218 L160 318 L286 398 L110 458';

// ── Derive pins from trip events that have lat/lng ────────────────────────────
// Maps geocoded coords → viewport positions within a 402×640 canvas.
// Falls back to DECORATIVE_PINS when fewer than 2 events have coords.

function deriveViewPins(
  events: Record<number, import('@/lib/types').TripEvent[]>,
  days: number,
): Pin[] {
  const geocoded: Array<{ lat: number; lng: number; cat: string; name: string }> = [];
  for (let d = 1; d <= days; d++) {
    for (const ev of events[d] ?? []) {
      if (ev.lat != null && ev.lng != null) {
        geocoded.push({ lat: ev.lat, lng: ev.lng, cat: ev.category, name: ev.name });
      }
    }
  }

  if (geocoded.length < 2) {
    return DECORATIVE_PINS.map((p, i) => ({ ...p, label: '' }));
  }

  const lats = geocoded.map(e => e.lat);
  const lngs = geocoded.map(e => e.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const W = 362, H = 560, PAD = 40;

  return geocoded.slice(0, 8).map((e, i) => ({
    key:   catStamp(e.cat).key,
    x:     PAD + ((e.lng - minLng) / lngRange) * (W - PAD * 2),
    y:     PAD + (1 - (e.lat - minLat) / latRange) * (H - PAD * 2),
    label: e.name,
    delay: i * 0.08,
  }));
}

function buildRoutePath(pins: Pin[]): string {
  if (pins.length < 2) return ROUTE_D;
  return pins.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x + 23} ${p.y + 23}`).join(' ');
}

// ── Trip / Explore segmented toggle ──────────────────────────────────────────

function ModeToggle({ mode, onChange }: { mode: MapMode; onChange: (m: MapMode) => void }) {
  return (
    <div
      className="lg lg-strong"
      style={{ display: 'flex', padding: 4, borderRadius: 9999, flexShrink: 0 }}
      role="group"
      aria-label="Map mode"
    >
      {(['trip', 'explore'] as MapMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          style={{
            border: 0, cursor: 'pointer',
            borderRadius: 9999,
            padding: '8px 15px',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
            background: mode === m ? 'var(--lg-forest)' : 'transparent',
            color:      mode === m ? '#fff' : 'var(--text-3)',
            boxShadow:  mode === m ? 'var(--lg-glow-forest)' : 'none',
            transition: 'all .3s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {m === 'trip' ? 'Trip' : 'Explore'}
        </button>
      ))}
    </div>
  );
}

// ── Stamp pin ─────────────────────────────────────────────────────────────────

function MapPin({ pin, onClick }: { pin: Pin; onClick: () => void }) {
  return (
    <m.button
      onClick={onClick}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: pin.delay,
        type: 'spring', stiffness: 380, damping: 22,
      }}
      whileTap={{ scale: 0.92 }}
      aria-label={pin.label || pin.key}
      style={{
        position: 'absolute',
        left: pin.x,
        top:  pin.y,
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
        filter: 'drop-shadow(0 4px 10px oklch(20% 0.03 60 / 28%))',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      <StampIcon iconKey={pin.key} size={46} />
    </m.button>
  );
}

// ── Nearby card ───────────────────────────────────────────────────────────────

function NearbyCard({ t }: { t: (k: string) => string }) {
  return (
    <m.div
      className="lg lg-strong"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}
    >
      <StampIcon iconKey="museum" size={48} aria-hidden="true" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="eyebrow-lg"
          style={{ color: 'var(--lg-sand)', fontSize: 9, marginBottom: 2 }}
        >
          {t('Sight')} · 4.8 ★ · 0.5km
        </div>
        <div style={{
          fontSize: 15, fontWeight: 600,
          color: 'var(--lg-ink)', lineHeight: 1.2, marginTop: 1,
        }}>
          MoMA
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
          {t('Open')} · {t('8 min walk from hotel')}
        </div>
      </div>

      <Btn
        kind="terra"
        aria-label={t('Route')}
        style={{ height: 42, padding: '0 18px', fontSize: 13, flexShrink: 0 }}
      >
        {t('Route')}
      </Btn>
    </m.div>
  );
}

// ── Main Map_V2 ───────────────────────────────────────────────────────────────

export default function Map_V2() {
  const { t } = useI18n();

  const { trip } = useAppStore(useShallow(s => ({ trip: s.trip })));

  const [mode,        setMode]        = useState<MapMode>('trip');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const pins = useMemo(
    () => trip ? deriveViewPins(trip.events, trip.days) : DECORATIVE_PINS.map(p => ({ ...p, label: '' })),
    [trip],
  );

  const routeD = useMemo(() => buildRoutePath(pins), [pins]);

  if (!trip) return null;

  return (
    <div
      style={{ height: '100%', position: 'relative', overflow: 'hidden' }}
      aria-label={t('mapTitle') || 'Trip map'}
    >
      {/* ── Terrain base ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(165deg, #E3EBE4 0%, #DCE6DD 35%, #EBE2D2 70%, #E8DCC8 100%)',
      }} aria-hidden="true" />

      {/* ── Road strokes ── */}
      <svg
        width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, opacity: 0.55, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <path d="M-20 160 Q120 120 250 200 T520 180" stroke="#fff" strokeWidth="14" fill="none" opacity="0.6" />
        <path d="M70 -20 Q120 220 90 460 T160 880" stroke="#fff" strokeWidth="16" fill="none" opacity="0.6" />
        <path d="M-20 420 Q200 380 420 460"          stroke="#fff" strokeWidth="10" fill="none" opacity="0.6" />
      </svg>

      {/* ── Terra dashed route line ── */}
      <svg
        width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <path
          d={routeD}
          stroke="var(--lg-terra)"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="2 9"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* ── Stamp pins ── */}
      {pins.map((pin, i) => (
        <MapPin
          key={`${pin.key}-${i}`}
          pin={pin}
          onClick={() => setSelectedPin(selectedPin?.key === pin.key && selectedPin?.x === pin.x ? null : pin)}
        />
      ))}

      {/* ── Top controls: toggle + search ── */}
      <div style={{
        position: 'absolute', top: 56, left: 16, right: 16,
        display: 'flex', gap: 10, zIndex: 20,
      }}>
        <ModeToggle mode={mode} onChange={m => { setMode(m); setSelectedPin(null); }} />

        <div
          className="lg lg-strong"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 14px', borderRadius: 9999, height: 42, minWidth: 0,
          }}
        >
          <Icon name="search" size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('Search your trip')}
            aria-label={t('Search your trip')}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'var(--text)', caretColor: 'var(--lg-terra)',
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-3)', padding: '2px 4px', flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Pin tooltip (tap label) ── */}
      <AnimatePresence>
        {selectedPin && selectedPin.label && (
          <m.div
            key="pin-tip"
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={spring.snap}
            style={{
              position: 'absolute',
              left: selectedPin.x + 46 + 6,
              top:  selectedPin.y + 6,
              zIndex: 30,
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: 12,
              padding: '5px 12px',
              fontFamily: 'var(--font-sans)',
              fontSize: 13, fontWeight: 600,
              color: 'var(--lg-ink)',
              boxShadow: '0 4px 16px rgba(26,20,16,0.10)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {selectedPin.label}
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Nearby card (above nav) ── */}
      <div style={{
        position: 'absolute', left: 16, right: 16,
        bottom: 'calc(var(--nav-total-h, 92px) + 8px)',
        zIndex: 20,
      }}>
        <NearbyCard t={t} />
      </div>
    </div>
  );
}
