'use client';

import React, { CSSProperties, ReactNode } from 'react';

type ChipVariant = 'neutral' | 'gap' | 'open' | 'closed' | 'accent' | 'warn';

interface ChipProps {
  children: ReactNode;
  v?: ChipVariant;
  style?: CSSProperties;
}

const VARIANTS: Record<ChipVariant, { bg: string; color: string; border: string }> = {
  neutral: { bg: 'var(--bg)',         color: 'var(--text-2)',  border: '1px solid var(--border)' },
  gap:     { bg: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(180,83,9,0.18)' },
  open:    { bg: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(46,125,85,0.18)' },
  closed:  { bg: 'var(--danger-bg)',  color: 'var(--danger)',  border: '1px solid rgba(192,57,43,0.18)' },
  accent:  { bg: 'var(--brand-light)',color: 'var(--brand)',   border: '1px solid rgba(59,110,82,0.18)' },
  warn:    { bg: 'var(--terra-light)',color: 'var(--terra)',   border: '1px solid rgba(196,113,74,0.18)' },
};

export default function Chip({ children, v = 'neutral', style = {} }: ChipProps) {
  const s = VARIANTS[v];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '3px 9px', borderRadius: 'var(--radius-sm)',
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color, border: s.border,
      ...style,
    }}>
      {children}
    </span>
  );
}
