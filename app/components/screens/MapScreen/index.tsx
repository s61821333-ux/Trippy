'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { m } from 'framer-motion';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';

// Day palette — 10 distinct hues cycling for any trip length
const DAY_COLORS = [
  '#C4714A', '#3B6E52', '#5B8DBE', '#C8944A', '#8B5E9F',
  '#E07252', '#4A9A65', '#6B9FD4', '#D4A050', '#A070B8',
];

interface PinnedEvent {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dayNum: number;
  time: string;
  category: string;
}

export default function MapScreen() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<import('leaflet').Marker[]>([]);
  const { trip } = useAppStore();
  const { t } = useI18n();
  const themeMode = useAppStore(s => s.themeMode);
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [pinCount, setPinCount] = useState(0);

  // Collect all events that have lat/lng
  const allPins = useMemo<PinnedEvent[]>(() => {
    if (!trip) return [];
    const pins: PinnedEvent[] = [];
    for (let d = 1; d <= trip.days; d++) {
      for (const ev of trip.events[d] ?? []) {
        if (ev.lat != null && ev.lng != null) {
          pins.push({ id: ev.id, name: ev.name, lat: ev.lat, lng: ev.lng, dayNum: d, time: ev.time, category: ev.category });
        }
      }
    }
    return pins;
  }, [trip]);

  const visiblePins = useMemo(
    () => selectedDay === 'all' ? allPins : allPins.filter(p => p.dayNum === selectedDay),
    [allPins, selectedDay],
  );

  // Resolve dark mode
  const [osDark, setOsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setOsDark(mq.matches);
    const h = (e: MediaQueryListEvent) => setOsDark(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && osDark);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamically import to avoid SSR crash
    import('leaflet').then(L => {
      // Patch default marker icons (Leaflet + webpack asset path issue)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: false,
      }).setView([20, 15], 2);

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution (compact)
      L.control.attribution({ prefix: false })
        .addAttribution('© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>')
        .addTo(map);

      leafletMapRef.current = map;
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update tile layer when dark mode changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    import('leaflet').then(L => {
      const map = leafletMapRef.current!;
      map.eachLayer(l => { if ((l as import('leaflet').TileLayer).setUrl) map.removeLayer(l); });
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    });
  }, [isDark]);

  // Re-render markers whenever visiblePins changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    import('leaflet').then(L => {
      const map = leafletMapRef.current!;

      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (visiblePins.length === 0) { setPinCount(0); return; }

      const bounds: [number, number][] = [];

      visiblePins.forEach(pin => {
        const color = DAY_COLORS[(pin.dayNum - 1) % DAY_COLORS.length];

        // Custom SVG circle marker (no external image dependency)
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:32px;height:32px;
            background:${color};
            border:3px solid #fff;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([pin.lat, pin.lng], { icon })
          .bindPopup(`
            <div style="font-family:system-ui;min-width:140px">
              <strong style="font-size:14px">${pin.name}</strong><br/>
              <span style="font-size:12px;color:#666">Day ${pin.dayNum} · ${pin.time}</span>
            </div>
          `)
          .addTo(map);

        markersRef.current.push(marker);
        bounds.push([pin.lat, pin.lng]);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }

      setPinCount(visiblePins.length);
    });
  }, [visiblePins]);

  const hasPins = allPins.length > 0;
  const daysWithPins = useMemo(
    () => [...new Set(allPins.map(p => p.dayNum))].sort((a, b) => a - b),
    [allPins],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Header */}
      <div style={{
        padding: 'var(--space-4) var(--page-px) var(--space-2)',
        flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          marginBottom: 4,
        }}>
          {t('mapTitle')}
        </h1>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
          {pinCount === 0
            ? t('mapNoEvents')
            : pinCount === 1
            ? t('mapEventCount').replace('{count}', '1')
            : t('mapEventCountPlural').replace('{count}', String(pinCount))}
        </p>
      </div>

      {/* Day filter chips */}
      {hasPins && (
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '0 var(--page-px) var(--space-3)',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {/* "All" chip */}
          <m.button
            onClick={() => setSelectedDay('all')}
            whileTap={{ scale: 0.94 }}
            transition={spring.snap}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${selectedDay === 'all' ? 'var(--terra)' : 'var(--border)'}`,
              background: selectedDay === 'all' ? 'var(--terra-muted)' : 'var(--surface)',
              color: selectedDay === 'all' ? 'var(--terra)' : 'var(--text-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            {t('mapAllDays')}
          </m.button>

          {daysWithPins.map(d => {
            const color = DAY_COLORS[(d - 1) % DAY_COLORS.length];
            const isActive = selectedDay === d;
            return (
              <m.button
                key={d}
                onClick={() => setSelectedDay(d)}
                whileTap={{ scale: 0.94 }}
                transition={spring.snap}
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${isActive ? color : 'var(--border)'}`,
                  background: isActive ? `${color}22` : 'var(--surface)',
                  color: isActive ? color : 'var(--text-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                {t('mapDay').replace('{day}', String(d))}
              </m.button>
            );
          })}
        </div>
      )}

      {/* Map or empty state */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {!hasPins ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: '0 var(--page-px)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 48 }}>🗺️</span>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-md)' }}>
              {t('mapNoEvents')}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-2)', fontSize: 'var(--text-sm)', maxWidth: 280, lineHeight: 1.5 }}>
              {t('mapNoEventsHint')}
            </p>
          </div>
        ) : (
          <div
            ref={mapRef}
            style={{ width: '100%', height: '100%', borderRadius: 0 }}
          />
        )}
      </div>
    </div>
  );
}
