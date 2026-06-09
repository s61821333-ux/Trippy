'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Category → emoji ──────────────────────────────────────────────────────────

const CAT_EMOJI: Record<string, string> = {
  food:         '🍽',
  cafe:         '☕',
  attraction:   '🏛',
  hotel:        '🏨',
  rest:         '💤',
  transport:    '🚗',
  flight:       '✈',
  beach:        '🏖',
  museum:       '🎨',
  sport:        '⚽',
  concert:      '🎵',
  hiking:       '🥾',
  nature_walk:  '🌿',
  shopping:     '🛍',
  spa:          '💆',
  nightlife:    '🎉',
  winery:       '🍷',
  cooking:      '👨‍🍳',
  theater:      '🎭',
  photography:  '📷',
  safari:       '🦁',
  festival:     '🎪',
  water_sports: '🏄',
  ski:          '⛷',
  cycling:      '🚴',
  boat:         '⛵',
  golf:         '⛳',
  art:          '🖼',
  cinema:       '🎬',
  market:       '🧺',
  other:        '📍',
};

// ── Day colour palette ────────────────────────────────────────────────────────

const DAY_PALETTE = [
  '#C4714A', '#3B6E52', '#6B5CE7', '#2B7A8E',
  '#D4531A', '#C8944A', '#E05A3A', '#1B6A8A',
  '#A03CB4', '#2B8A6E', '#B45309', '#1E91AF',
];

// ── Custom DivIcon ────────────────────────────────────────────────────────────

function makeIcon(category: string, dayIndex: number, selected: boolean) {
  const color = DAY_PALETTE[dayIndex % DAY_PALETTE.length];
  const emoji = CAT_EMOJI[category] ?? '📍';
  const s = selected ? 46 : 36;
  const ring = selected
    ? `box-shadow:0 0 0 3px white,0 0 0 5px ${color},0 4px 16px rgba(0,0,0,.4);`
    : 'box-shadow:0 2px 10px rgba(0,0,0,.28);';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${s}px;height:${s}px;border-radius:50%;
      background:${color};
      display:flex;align-items:center;justify-content:center;
      border:2.5px solid rgba(255,255,255,.95);
      font-size:${selected ? 22 : 17}px;
      ${ring}
      transition:all .2s;cursor:pointer;
    ">${emoji}</div>`,
    iconSize:   [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

// ── Auto-fit bounds ───────────────────────────────────────────────────────────

function AutoFit({ latlngs }: { latlngs: [number, number][] }) {
  const map = useMap();
  const key = latlngs.map(p => p.join(',')).join('|');

  useEffect(() => {
    if (latlngs.length === 0) return;
    if (latlngs.length === 1) {
      map.setView(latlngs[0], 14);
      return;
    }
    const bounds = L.latLngBounds(latlngs.map(p => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [72, 72], maxZoom: 15 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface MapEvent {
  id:        string;
  name:      string;
  category:  string;
  lat:       number;
  lng:       number;
  day:       number;
  time:      string;
  location?: string;
  cost?:     number;
}

export interface MapHotel {
  id:       string;
  name?:    string;
  location?: string;
  lat:      number;
  lng:      number;
  checkInDay:  number;
  checkOutDay: number;
}

interface Props {
  events:     MapEvent[];
  selectedId: string | null;
  onSelect:   (ev: MapEvent | null) => void;
  tileApiKey: string;
  hotels?:    MapHotel[];
}

// ── Hotel icon ────────────────────────────────────────────────────────────────

function makeHotelIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:40px;height:40px;border-radius:10px;
      background:#3B6E52;
      display:flex;align-items:center;justify-content:center;
      border:2.5px solid rgba(255,255,255,.95);
      font-size:18px;
      box-shadow:0 2px 12px rgba(0,0,0,.32);
    ">🏨</div>`,
    iconSize:   [40, 40],
    iconAnchor: [20, 20],
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LeafletMap({ events, selectedId, onSelect, tileApiKey, hotels = [] }: Props) {
  // Default centre: use first event or first hotel or Tel Aviv
  const allPoints = [...events, ...hotels];
  const centre: [number, number] = allPoints.length > 0
    ? [allPoints[0].lat, allPoints[0].lng]
    : [32.0853, 34.7818];

  const latlngs: [number, number][] = events.map(e => [e.lat, e.lng]);
  const allLatlngs: [number, number][] = [
    ...latlngs,
    ...hotels.map(h => [h.lat, h.lng] as [number, number]),
  ];

  const tileUrl = tileApiKey
    ? `https://maps.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?apiKey=${tileApiKey}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <MapContainer
      center={centre}
      zoom={11}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url={tileUrl}
        attribution='&copy; <a href="https://geoapify.com">Geoapify</a> &copy; <a href="https://openstreetmap.org/copyright">OSM</a>'
      />

      <AutoFit latlngs={allLatlngs} />

      {/* Dashed route line */}
      {latlngs.length > 1 && (
        <Polyline
          positions={latlngs}
          pathOptions={{
            color:     '#C4714A',
            weight:    2.5,
            opacity:   0.7,
            dashArray: '5 11',
          }}
        />
      )}

      {/* Event markers */}
      {events.map((ev, i) => (
        <Marker
          key={ev.id}
          position={[ev.lat, ev.lng]}
          icon={makeIcon(ev.category, ev.day - 1, selectedId === ev.id)}
          zIndexOffset={selectedId === ev.id ? 1000 : i}
          eventHandlers={{
            click: () => onSelect(selectedId === ev.id ? null : ev),
          }}
        />
      ))}

      {/* Hotel markers — always visible, not filterable */}
      {hotels.map(h => (
        <Marker
          key={`hotel-${h.id}`}
          position={[h.lat, h.lng]}
          icon={makeHotelIcon()}
          zIndexOffset={500}
          eventHandlers={{
            click: () => onSelect(null),
          }}
        />
      ))}
    </MapContainer>
  );
}
