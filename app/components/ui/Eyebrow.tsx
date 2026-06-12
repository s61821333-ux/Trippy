'use client';

import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  tone?: 'muted' | 'terra';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Mono metadata eyebrow (HANDOFF rule 5). The `.mono-eyebrow` rule in
 * globals.css swaps to Assistant + sentence case in Hebrew automatically.
 */
export default function Eyebrow({ children, tone = 'muted', className = '', style }: EyebrowProps) {
  return (
    <span className={`mono-eyebrow${tone === 'terra' ? ' is-terra' : ''} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
}
