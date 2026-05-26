'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Minimal ambient shim so we don't need @types/google.maps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GMarker = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapStyleEntry = Record<string, unknown>;
// window.google is injected at runtime; tell TypeScript about it
declare global {
  interface Window { google?: Record<string, unknown>; }
}
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { TripEvent } from '@/lib/types';
import Icon from '../ui/Icon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapPin {
  eventId: string;
  day: number;
  event: TripEvent;
  lat: number;
  lng: number;
}

// ─── Category colours (matches existing design system) ───────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  food:       '#E07052',
  cafe:       '#C4A44A',
  attraction: '#3B6E52',
  hotel:      '#7B5EA7',
  transport:  '#4A8FC4',
  flight:     '#4A8FC4',
  concert:    '#E07052',
  theme_park: '#C4714A',
  sport:      '#3B6E52',
  beach:      '#4A8FC4',
  rest:       '#A09080',
  other:      '#A09080',
};

function pinColor(category: string) {
  return CATEGORY_COLORS[category] ?? '#C4714A';
}

// ─── Day filter pill ─────────────────────────────────────────────────────────

function DayPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <m.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={spring.snap}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        border: active ? '1px solid rgba(196,113,74,0.4)' : '1px solid var(--border)',
        background: active ? 'var(--terra)' : 'var(--surface)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        color: active ? '#fff' : 'var(--text-2)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: active ? 700 : 500,
        letterSpacing: '0.08em',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      } as React.CSSProperties}
    >
      {label}
    </m.button>
  );
}

// ─── Event detail panel (slides up from bottom) ───────────────────────────────

function EventPanel({
  pin, onClose,
}: { pin: MapPin; onClose: () => void }) {
  const { t } = useI18n();
  const e = pin.event;

  return (
    <m.div
      key={pin.eventId}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={spring.gentle}
      style={{
        position: 'absolute',
        bottom: 0,
        insetInline: 0,
        zIndex: 50,
        padding: 'var(--space-4) var(--page-px)',
        paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom, 0px))',
        background: 'var(--surface-strong)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderTop: '1px solid var(--border)',
        borderTopLeftRadius: 'var(--radius-xl)',
        borderTopRightRadius: 'var(--radius-xl)',
      }}
    >
      {/* drag handle */}
      <div style={{
        width: 36, height: 4, borderRadius: 2,
        background: 'var(--border)',
        margin: '0 auto var(--space-3)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        {/* colour dot */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: pinColor(e.category),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {categoryEmoji(e.category)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            color: 'var(--text)',
            lineHeight: 1.3,
          }}>
            {e.name}
          </div>
          {e.location && (
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-2)',
              marginTop: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <Icon name="pin" size={12} style={{ color: 'var(--terra)', flexShrink: 0 }} />
              {e.location}
            </div>
          )}
          <div style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-3)',
            letterSpacing: '0.06em',
          }}>
            {e.time && <span>{e.time}</span>}
            {e.duration ? <span>{e.duration} min</span> : null}
            <span style={{ color: 'var(--text-3)' }}>Day {pin.day}</span>
          </div>
        </div>

        <m.button
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
          transition={spring.snap}
          aria-label="Close"
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--surface-strong)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-2)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            flexShrink: 0,
          }}
        >
          <Icon name="x" size={14} />
        </m.button>
      </div>
    </m.div>
  );
}

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    food: '🍽️', cafe: '☕', attraction: '🏛️', hotel: '🏨',
    transport: '🚌', flight: '✈️', concert: '🎵', theme_park: '🎢',
    sport: '⚽', beach: '🏖️', rest: '😴', other: '📍',
  };
  return map[cat] ?? '📍';
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MapScreen() {
  const { t } = useI18n();

  const { trip } = useAppStore(useShallow(s => ({ trip: s.trip })));

  const mapRef     = useRef<HTMLDivElement>(null);
  const googleMap  = useRef<GMap>(null);
  const markers    = useRef<GMarker[]>([]);

  const [mapReady, setMapReady]         = useState(false);
  const [mapError, setMapError]         = useState(false);
  const [selectedPin, setSelectedPin]   = useState<MapPin | null>(null);
  const [activeDayFilter, setActiveDay] = useState<number | 'all'>('all');

  // ── Collect all pins ─────────────────────────────────────────────────────
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

  // ── Load Google Maps ──────────────────────────────────────────────────────
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
      center,
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: mapStyles,
    });

    setMapReady(true);
  }, []);

  useEffect(() => {
    // Google Maps is loaded by PlacesInput on demand via @googlemaps/js-api-loader.
    // We piggyback on that or load it ourselves.
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapError(true); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps) {
      initMap();
      return;
    }

    const existingScript = document.querySelector('script[data-maps]');
    if (existingScript) {
      existingScript.addEventListener('load', initMap);
      return () => existingScript.removeEventListener('load', initMap);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-maps', 'true');
    script.onload = initMap;
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-render markers when filter or pins change ──────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gm = (window as any).google?.maps;
    if (!googleMap.current || !gm) return;

    // Clear old markers
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
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => setSelectedPin(pin));
      markers.current.push(marker);
      bounds.extend({ lat: pin.lat, lng: pin.lng });
    });

    if (visiblePins.length > 1) {
      googleMap.current.fitBounds(bounds, { top: 60, bottom: 160, left: 24, right: 24 });
    } else {
      googleMap.current.setCenter({ lat: visiblePins[0].lat, lng: visiblePins[0].lng });
      googleMap.current.setZoom(15);
    }
  }, [visiblePins, mapReady]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!trip) return null;

  if (mapError) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--page-px)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>🗺️</div>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: 'var(--text)',
        }}>
          {t('mapTitle')}
        </div>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-2)',
          maxWidth: 280,
        }}>
          Map unavailable — add a{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
          {' '}to enable the map view.
        </div>
        {allPins.length > 0 && (
          <div style={{
            marginTop: 'var(--space-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-3)',
          }}>
            {allPins.length} event{allPins.length !== 1 ? 's' : ''} with location data
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* ── Google Map canvas ── */}
      <div
        ref={mapRef}
        style={{ position: 'absolute', inset: 0 }}
        aria-label={t('mapTitle')}
      />

      {/* ── Loading shimmer ── */}
      <AnimatePresence>
        {!mapReady && (
          <m.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--bg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <div style={{ fontSize: 48 }}>🗺️</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.1em',
              color: 'var(--text-3)',
            }}>
              Loading map…
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Day filter strip ── */}
      {mapReady && (
        <div style={{
          position: 'absolute',
          top: 'var(--space-3)',
          insetInline: 0,
          zIndex: 20,
          display: 'flex',
          overflowX: 'auto',
          gap: 'var(--space-2)',
          padding: '0 var(--page-px)',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}>
          <DayPill
            label={t('mapAllDays')}
            active={activeDayFilter === 'all'}
            onClick={() => { setActiveDay('all'); setSelectedPin(null); }}
          />
          {days.map(d => (
            <DayPill
              key={d}
              label={t('mapDay').replace('{day}', String(d))}
              active={activeDayFilter === d}
              onClick={() => { setActiveDay(d); setSelectedPin(null); }}
            />
          ))}
        </div>
      )}

      {/* ── Pin count badge ── */}
      {mapReady && visiblePins.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'var(--space-3)',
          insetInlineEnd: 'var(--page-px)',
          zIndex: 20,
          background: 'var(--surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'var(--text-2)',
        }}>
          {visiblePins.length} pin{visiblePins.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* ── Empty state overlay ── */}
      {mapReady && allPins.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          pointerEvents: 'none',
          padding: 'var(--page-px)',
          textAlign: 'center',
        }}>
          <div style={{
            background: 'var(--surface-strong)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            padding: 'var(--space-5)',
            maxWidth: 300,
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📍</div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 6,
            }}>
              {t('mapNoEvents')}
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-2)',
              lineHeight: 1.5,
            }}>
              {t('mapNoEventsHint')}
            </div>
          </div>
        </div>
      )}

      {/* ── Selected event panel ── */}
      <AnimatePresence>
        {selectedPin && (
          <EventPanel
            key={selectedPin.eventId}
            pin={selectedPin}
            onClose={() => setSelectedPin(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Map styles — muted sand palette matching the design system ───────────────

const mapStyles: MapStyleEntry[] = [
  { elementType: 'geometry',        stylers: [{ color: '#f0ebe3' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b5c4e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f4efe8' }] },
  { featureType: 'administrative',   elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi',              stylers: [{ visibility: 'off' }] },
  { featureType: 'road',             elementType: 'geometry', stylers: [{ color: '#e0d8cf' }] },
  { featureType: 'road',             elementType: 'geometry.stroke', stylers: [{ color: '#d4ccc3' }] },
  { featureType: 'road.highway',     elementType: 'geometry', stylers: [{ color: '#d4c4b4' }] },
  { featureType: 'transit',          stylers: [{ visibility: 'off' }] },
  { featureType: 'water',            elementType: 'geometry', stylers: [{ color: '#b8d4e8' }] },
  { featureType: 'water',            elementType: 'labels.text.fill', stylers: [{ color: '#4a6d84' }] },
];
