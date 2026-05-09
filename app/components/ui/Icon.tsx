'use client';

import React, { CSSProperties } from 'react';

type IconName =
  | 'home' | 'calendar' | 'checklist' | 'settings' | 'plus' | 'chevR' | 'chevL'
  | 'share' | 'map' | 'sparkle' | 'trash' | 'edit' | 'x' | 'check' | 'sun'
  | 'wind' | 'lock' | 'pin' | 'download' | 'compass' | 'tent' | 'water'
  | 'calExport' | 'user' | 'search' | 'filter' | 'ai' | 'clock' | 'arrow' | 'menu' | 'grid';

interface IconProps {
  name: IconName;
  size?: number;
  style?: CSSProperties;
  color?: string;
}

const PATHS: Partial<Record<IconName, React.ReactNode>> = {
  home:      <><path d="M8 20V14h8v6"/><path d="M3 11l9-9 9 9"/><path d="M5 9v11h14V9"/></>,
  calendar:  <><path d="M12 22c5 0 9-4.5 9-10S17 2 12 2 3 6.5 3 12s4 10 9 10z"/><path d="M12 6v6l4 2"/></>,
  checklist: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></>,
  settings:  <><path d="M12 2C8 2 4 5 4 9c0 5 8 13 8 13s8-8 8-13c0-4-4-7-8-7z"/><circle cx="12" cy="9" r="2.5"/></>,
  plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  chevR:     <polyline points="9 18 15 12 9 6"/>,
  chevL:     <polyline points="15 18 9 12 15 6"/>,
  share:     <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  map:       <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
  sparkle:   <><path d="M12 3l1.68 5.17L19 10l-5.32 1.83L12 17l-1.68-5.17L5 10l5.32-1.83z"/><path d="M5 3l.84 2.58L8 7l-2.16.42L5 10l-.84-2.58L2 7l2.16-.42z" opacity="0.5"/><path d="M19 14l.84 2.58L22 17l-2.16.42L19 20l-.84-2.58L16 17l2.16-.42z" opacity="0.5"/></>,
  trash:     <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/><path d="M9 6V4h6v2"/></>,
  edit:      <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  check:     <polyline points="20 6 9 17 4 12"/>,
  sun:       <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
  wind:      <><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1114 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></>,
  lock:      <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
  pin:       <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
  download:  <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  compass:   <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
  tent:      <><path d="M3 20l9-16 9 16H3z"/><path d="M12 4L7 20m10 0L12 4"/></>,
  water:     <><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" opacity="0.4"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></>,
  calExport: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="12 14 12 18"/><line x1="10" y1="16" x2="14" y2="16"/></>,
  user:      <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  search:    <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  filter:    <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  ai:        <><path d="M12 3l1.68 5.17L19 10l-5.32 1.83L12 17l-1.68-5.17L5 10l5.32-1.83z"/></>,
  clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  arrow:     <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  menu:      <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  grid:      <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
};

export default function Icon({ name, size = 20, style = {}, color }: IconProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color, ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {PATHS[name] ?? null}
      </svg>
    </span>
  );
}
