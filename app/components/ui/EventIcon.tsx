'use client';

import React, { CSSProperties } from 'react';

// Event category keys used in DayScreen
type EventCategory = 'food' | 'cafe' | 'attraction' | 'hotel' | 'rest' | 'transport' | 'flight' | 'other';

// Supply category keys used in SuppliesScreen
type SupplyCategory = 'Water' | 'Food' | 'Gear' | 'Medical' | 'Documents' | 'Other';

// Brand-spec SVG paths for event categories (24×24, stroke currentColor)
const EVENT_PATHS: Record<EventCategory, string> = {
  food:      `<path d="M7 3v8a2 2 0 0 0 2 2v8M9 3v6M5 3v6M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>`,
  cafe:      `<path d="M4 11h12v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 12h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2M7 3c-.5 1 .5 2 0 3M11 3c-.5 1 .5 2 0 3"/>`,
  attraction:`<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>`,
  hotel:     `<rect x="4" y="4" width="16" height="17" rx="1.5"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M10 21v-5h4v5"/>`,
  rest:      `<path d="M3 20L12 4l9 16M12 4v16M9 20l3-4 3 4"/>`,
  transport: `<path d="M4 14l1.2-5a2 2 0 0 1 2-2h9.6a2 2 0 0 1 2 2L20 14M3 14h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM7 17h1M16 17h1"/>`,
  flight:    `<path d="M19.5 4c1 0 1.5 1 .5 2l-4 4 2 7-2 1-3-5-4 3v3l-1 1-1.5-3L3 15.5l1-1h3l3-4-5-2 1-2 7 1.5 4-3.5c0-.5.5-.5 1-.5z"/>`,
  other:     `<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>`,
};

// Brand-spec SVG paths for supply categories (24×24, stroke currentColor)
const SUPPLY_PATHS: Record<SupplyCategory, string> = {
  Water:     `<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/>`,
  Food:      `<path d="M5 12a7 7 0 0 1 14 0v1H5zM5 13h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM5 16h14"/>`,
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
