'use client';

import React, { CSSProperties, ReactNode } from 'react';

interface GlassProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

const BG = [
  'var(--surface-warm)',
  'var(--surface)',
  'var(--surface)',
] as const;

const SHADOWS = [
  'var(--shadow-xs)',
  'var(--shadow-sm)',
  'var(--shadow-md)',
] as const;

export default function Glass({ children, level = 2, style = {}, className = '', onClick }: GlassProps) {
  return (
    <div
      onClick={onClick}
      className={`glass glass-${level} ${className}`}
      style={{
        background: BG[level - 1],
        borderRadius: 'var(--radius-lg)',
        cursor: onClick ? 'pointer' : undefined,
        boxShadow: SHADOWS[level - 1],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
