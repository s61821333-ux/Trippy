'use client';

// Usage: floating surfaces only — sheets, modals, NavBar, toasts, FABs.
// Do NOT use for inline page-scroll content (section cards, list items). Use plain <div> with var(--surface) + var(--border) instead.
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
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: 'var(--radius-lg)',
        cursor: onClick ? 'pointer' : undefined,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.40), ${SHADOWS[level - 1]}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
