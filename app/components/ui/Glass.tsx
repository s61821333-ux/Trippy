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

export default function Glass({ children, level = 2, style = {}, className = '', onClick }: GlassProps) {
  return (
    <div
      onClick={onClick}
      className={`glass glass-${level} ${className}`}
      style={{
        // .glass in globals.css owns background, backdrop-filter, border (directional),
        // box-shadow (rim + depth), and ::before specular sheen.
        // Only override cursor and radius here; consumers use the style prop for the rest.
        borderRadius: 'var(--radius-lg)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
