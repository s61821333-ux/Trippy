'use client';

import React from 'react';

const AVC = [
  'var(--avatar-1)', 'var(--avatar-2)', 'var(--avatar-3)',
  'var(--avatar-4)', 'var(--avatar-5)', 'var(--avatar-6)',
];
// Sand-gold (index 1) needs dark initials for contrast.
const TEXT_OVERRIDE: Record<number, string> = { 1: 'var(--avatar-2-text)' };

interface AvatarStackProps {
  names: string[];
  size?: number;
  max?: number;
}

/** Overlapping avatar stack with 2px --bg ring (HANDOFF component inventory). */
export default function AvatarStack({ names, size = 22, max = 4 }: AvatarStackProps) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  const overlap = Math.round(size * 0.32);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {shown.map((name, i) => {
        const ci = i % AVC.length;
        const initials = (name || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
        return (
          <span
            key={i}
            aria-label={name}
            title={name}
            style={{
              width: size, height: size, borderRadius: '50%', flexShrink: 0,
              marginInlineStart: i === 0 ? 0 : -overlap,
              background: AVC[ci], color: TEXT_OVERRIDE[ci] ?? '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size * 0.4,
              boxShadow: '0 0 0 2px var(--bg)', boxSizing: 'border-box',
            }}
          >
            {initials}
          </span>
        );
      })}
      {extra > 0 && (
        <span
          style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0, marginInlineStart: -overlap,
            background: 'var(--bg-alt)', color: 'var(--text-2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size * 0.34,
            boxShadow: '0 0 0 2px var(--bg)', boxSizing: 'border-box',
          }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
