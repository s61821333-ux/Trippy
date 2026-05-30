'use client';

import React from 'react';

interface RingProps {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}

export default function Ring({ pct = 0, size = 56, stroke = 5, color = 'var(--lg-terra)', children }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(20% 0.03 60 / 12%)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 0.8s var(--snap, cubic-bezier(0.22,1,0.36,1))' }}
        />
      </svg>
      <span style={{
        position: 'absolute',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: size * 0.26,
        color: 'var(--lg-ink)',
      }}>
        {children}
      </span>
    </span>
  );
}
