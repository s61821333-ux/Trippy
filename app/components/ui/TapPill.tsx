'use client';

import React from 'react';

interface TapPillProps {
  children: React.ReactNode;
  /** pending = solid terra + glow (action needed); muted = terra-muted; settled = quiet. */
  variant?: 'pending' | 'muted' | 'settled';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
}

/** Vote/claim affordance (HANDOFF) - the only colored pills in a list. */
export default function TapPill({
  children, variant = 'muted', onClick, disabled, className = '', style, ...aria
}: TapPillProps) {
  const v = variant === 'pending' ? ' is-pending' : variant === 'settled' ? ' is-settled' : '';
  return (
    <button onClick={onClick} disabled={disabled} className={`tap-pill${v} ${className}`.trim()} style={style} {...aria}>
      {children}
    </button>
  );
}
