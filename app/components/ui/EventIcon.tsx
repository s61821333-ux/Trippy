'use client';

import React, { CSSProperties } from 'react';
import { StampIcon } from './StampIcon';

type EventCategory = 'food' | 'cafe' | 'attraction' | 'hotel' | 'rest' | 'transport' | 'flight' | 'concert' | 'theme_park' | 'sport' | 'beach' | 'other';
type SupplyCategory = 'Water' | 'Food' | 'Gear' | 'Medical' | 'Documents' | 'Other';

const EVENT_STAMP: Record<EventCategory, string> = {
  food:       'noodles',
  cafe:       'coffee',
  attraction: 'museum',
  hotel:      'hotel',
  rest:       'tent',
  transport:  'car',
  flight:     'plane',
  concert:    'concert',
  theme_park: 'theme_park',
  sport:      'sport',
  beach:      'beach',
  other:      'globe',
};

const SUPPLY_STAMP: Record<SupplyCategory, string> = {
  Water:     'water_bottle',
  Food:      'noodles',
  Gear:      'backpack',
  Medical:   'first_aid',
  Documents: 'passport',
  Other:     'globe',
};

// Fallback stroke paths for small sizes (< 20px) where stamp discs would be unreadable
const EVENT_PATHS: Record<EventCategory, string> = {
  food:      `<path d="M7 3v8a2 2 0 0 0 2 2v8M9 3v6M5 3v6M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>`,
  cafe:      `<path d="M4 11h12v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 12h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2M7 3c-.5 1 .5 2 0 3M11 3c-.5 1 .5 2 0 3"/>`,
  attraction:`<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>`,
  hotel:     `<rect x="4" y="4" width="16" height="17" rx="1.5"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M10 21v-5h4v5"/>`,
  rest:      `<path d="M3 20L12 4l9 16M12 4v16M9 20l3-4 3 4"/>`,
  transport: `<path d="M4 14l1.2-5a2 2 0 0 1 2-2h9.6a2 2 0 0 1 2 2L20 14M3 14h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM7 17h1M16 17h1"/>`,
  flight:     `<path d="M19.5 4c1 0 1.5 1 .5 2l-4 4 2 7-2 1-3-5-4 3v3l-1 1-1.5-3L3 15.5l1-1h3l3-4-5-2 1-2 7 1.5 4-3.5c0-.5.5-.5 1-.5z"/>`,
  concert:    `<path d="M12 2a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>`,
  theme_park: `<circle cx="12" cy="9" r="5"/><circle cx="12" cy="9" r="1.5"/><line x1="12" y1="4" x2="12" y2="14"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="8.8" y1="5.8" x2="15.2" y2="12.2"/><line x1="15.2" y1="5.8" x2="8.8" y2="12.2"/><path d="M9.5 14l2.5 5M14.5 14l-2.5 5"/>`,
  sport:      `<ellipse cx="12" cy="16" rx="9" ry="4"/><ellipse cx="12" cy="16" rx="5" ry="2"/><path d="M3 12h18M12 12V7"/><path d="M6 7h12l-1-4H7z"/>`,
  beach:      `<circle cx="12" cy="8" r="3"/><path d="M12 4V2M12 11v1M7 8H5M19 8h-2M8.9 5.9l-1.4-1.4M16.5 14.5l-1.4-1.4M8.9 10.1l-1.4 1.4"/><path d="M4 20Q7 18 10 20Q13 22 16 20Q19 18 22 20"/>`,
  other:      `<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>`,
};

const SUPPLY_PATHS: Record<SupplyCategory, string> = {
  Water:     `<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/>`,
  Food:      `<path d="M5 12a7 7 0 0 1 14 0v1H5zM5 13h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>`,
  Gear:      `<path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M5 9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM9 12h6v3H9z"/>`,
  Medical:   `<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M12 10v6M9 13h6M8 6V4h8v2"/>`,
  Documents: `<path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M9 13h6M9 17h4"/>`,
  Other:     `<path d="M14 5l4-2v3l3 3-3 3v3l-4-2-4 6-2 4-3-1 1-3 6-4z"/>`,
};

interface EventIconProps {
  category: EventCategory;
  size?: number;
  style?: CSSProperties;
}

interface SupplyIconProps {
  category: SupplyCategory;
  size?: number;
  style?: CSSProperties;
}

export function EventIcon({ category, size = 20, style = {} }: EventIconProps) {
  if (size >= 20) {
    const key = EVENT_STAMP[category] ?? 'globe';
    return <StampIcon iconKey={key} size={size} style={style} />;
  }
  const svg = EVENT_PATHS[category] ?? EVENT_PATHS.other;
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <g dangerouslySetInnerHTML={{ __html: svg }} />
    </svg>
  );
}

export function SupplyIcon({ category, size = 16, style = {} }: SupplyIconProps) {
  if (size >= 20) {
    const key = SUPPLY_STAMP[category] ?? 'backpack';
    return <StampIcon iconKey={key} size={size} style={style} />;
  }
  const svg = SUPPLY_PATHS[category] ?? SUPPLY_PATHS.Other;
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <g dangerouslySetInnerHTML={{ __html: svg }} />
    </svg>
  );
}
