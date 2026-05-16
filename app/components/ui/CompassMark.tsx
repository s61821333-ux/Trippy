'use client';

import React from 'react';

interface Props {
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Trippy brand compass mark. Colors automatically adapt to light/dark mode
 * via CSS custom properties defined in globals.css.
 *
 * Anatomy (brand book):
 *   North  → terracotta  (--compass-n)
 *   South  → forest      (--compass-s)
 *   E / W  → sand gold   (--compass-ew)
 *   Ring   → ink         (--compass-ring)
 *   Hub    → ink         (--compass-hub)
 */
export default function CompassMark({ size = 48, style }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={style}
    >
      <circle
        cx="120" cy="120" r="90"
        stroke="var(--compass-ring)"
        strokeWidth="4"
        fill="none"
      />
      {/* North — terracotta */}
      <path
        d="M120 36 L138 120 L120 124 L102 120 Z"
        fill="var(--compass-n)"
      />
      {/* South — forest */}
      <path
        d="M120 204 L102 120 L120 116 L138 120 Z"
        fill="var(--compass-s)"
      />
      {/* East — gold */}
      <path
        d="M204 120 L120 102 L116 120 L120 138 Z"
        fill="var(--compass-ew)"
        opacity="0.85"
      />
      {/* West — gold */}
      <path
        d="M36 120 L120 138 L124 120 L120 102 Z"
        fill="var(--compass-ew)"
        opacity="0.85"
      />
      {/* Hub */}
      <circle cx="120" cy="120" r="6" fill="var(--compass-hub)" />
    </svg>
  );
}
