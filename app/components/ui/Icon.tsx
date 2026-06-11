'use client';

import React, { CSSProperties } from 'react';

type IconName =
  | 'home' | 'calendar' | 'checklist' | 'settings' | 'plus' | 'chevR' | 'chevL'
  | 'share' | 'map' | 'sparkle' | 'trash' | 'edit' | 'x' | 'check' | 'sun'
  | 'wind' | 'lock' | 'pin' | 'download' | 'compass' | 'tent' | 'water'
  | 'calExport' | 'user' | 'users' | 'search' | 'filter' | 'ai' | 'clock' | 'arrow' | 'menu' | 'grid' | 'swap'
  | 'plane' | 'music' | 'film' | 'gift' | 'camera' | 'ship' | 'bike' | 'hot' | 'star'
  | 'fork' | 'cup' | 'wave' | 'ticket' | 'tag'
  | 'logout' | 'offline' | 'coins' | 'globe';

interface IconProps {
  name: IconName;
  size?: number;
  style?: CSSProperties;
  color?: string;
}

// Brand icon paths — 24×24, stroke 1.5, round caps/joins, fill:none via outer svg
const PATHS: Partial<Record<IconName, string>> = {
  home:      `<path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6h-6v6H4.5a1 1 0 0 1-1-1z"/>`,
  calendar:  `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>`,
  checklist: `<path d="M4 6.5l1.6 1.6L8.8 5M13 6.5h7M4 12.5l1.6 1.6L8.8 11M13 12.5h7M4 18.5l1.6 1.6L8.8 17M13 18.5h6"/>`,
  settings:  `<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V20a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H4a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3h.1a1.6 1.6 0 0 0 1-1.5V4a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7v.1a1.6 1.6 0 0 0 1.5 1H20a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>`,
  plus:      `<path d="M12 5v14M5 12h14"/>`,
  chevR:     `<path d="M9 5l7 7-7 7"/>`,
  chevL:     `<path d="M15 5l-7 7 7 7"/>`,
  share:     `<path d="M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/>`,
  map:       `<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>`,
  sparkle:   `<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>`,
  trash:     `<path d="M4 7h16M10 11v6M14 11v6M6 7l.9 12.1A2 2 0 0 0 8.9 21h6.2a2 2 0 0 0 2-1.9L18 7M9 7V4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5V7"/>`,
  edit:      `<path d="M4 20.5h4l11-11-4-4-11 11zM14.5 6l4 4M4 20.5l1-4"/>`,
  x:         `<path d="M6 6l12 12M18 6L6 18"/>`,
  check:     `<path d="M5 12l5 5L20 7"/>`,
  sun:       `<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>`,
  wind:      `<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8a3 3 0 1 0-3-3"/>`,
  lock:      `<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`,
  pin:       `<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>`,
  download:  `<path d="M12 4v12M8 12l4 4 4-4M5 20h14"/>`,
  compass:   `<circle cx="12" cy="12" r="9"/><path d="M15 9l-1.6 4.4L9 15l1.6-4.4z"/>`,
  tent:      `<path d="M3 20L12 4l9 16M12 4v16M9 20l3-4 3 4"/>`,
  water:     `<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/>`,
  calExport: `<rect x="3" y="5" width="13" height="15.5" rx="2"/><path d="M3 9.5h13M7 3v4M12 3v4M14 14h7M18 11l3 3-3 3"/>`,
  user:      `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
  users:     `<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 21a5 5 0 0 0-8-4"/>`,
  search:    `<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>`,
  filter:    `<path d="M3 5h18l-7 8v7l-4-2v-5z"/>`,
  ai:        `<path d="M13 3L5 13h6l-2 8 10-12h-7z"/>`,
  clock:     `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  arrow:     `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  menu:      `<path d="M4 7h16M4 12h16M4 17h16"/>`,
  grid:      `<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
  swap:      `<path d="M7 16V8M7 8L4 11M7 8l3 3M17 8v8M17 16l3-3M17 16l-3-3"/>`,
  plane:     `<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>`,
  music:     `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
  film:      `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5"/>`,
  gift:      `<path d="M20 12v10H4V12M22 7H2v5h20zM12 22V7M12 7a2 2 0 0 1-2-2c0-2 2-5 2-5s2 3 2 5a2 2 0 0 1-2 2z"/>`,
  camera:    `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
  ship:      `<path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4a11.6 11.6 0 0 0 1.62 6M10 3.5a2.5 2.5 0 0 1 5 0"/><path d="M12 3v4"/>`,
  bike:      `<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-1M9.5 14l5-8.5M12 17.5h3l3-8.5M6 10l1.5 7.5"/>`,
  hot:       `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/><path d="M12 22V12"/>`,
  star:      `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  fork:      `<path d="M5 3v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3M9 9v12M19 3v18M17 3v3a2 2 0 0 0 4 0V3"/>`,
  cup:       `<path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v3M10 2v3M14 2v3"/>`,
  wave:      `<path d="M2 12c1.5-2 3-3 5-3s3.5 2 5.5 2 3.5-2 5.5-2M2 6c1.5-2 3-3 5-3s3.5 2 5.5 2 3.5-2 5.5-2M2 18c1.5-2 3-3 5-3s3.5 2 5.5 2 3.5-2 5.5-2"/>`,
  ticket:    `<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM10 7v10"/>`,
  tag:       `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>`,
  logout:    `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>`,
  offline:   `<path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>`,
  coins:     `<circle cx="8" cy="14" r="6"/><path d="M16.5 9.5A6 6 0 0 1 22 15"/><path d="M16.5 9.5A6 6 0 0 0 11 4"/>`,
  globe:     `<circle cx="12" cy="12" r="9"/><path d="M12 3a14.5 14.5 0 0 0 0 18M12 3a14.5 14.5 0 0 1 0 18M3 12h18"/>`,
};

export default function Icon({ name, size = 20, style = {}, color }: IconProps) {
  const svg = PATHS[name] ?? '';
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', color, ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <g dangerouslySetInnerHTML={{ __html: svg }} />
      </svg>
    </span>
  );
}
