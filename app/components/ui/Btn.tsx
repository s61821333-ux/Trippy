'use client';

import React from 'react';

// 2026 redesign: `ink` (var(--text) bg / var(--bg) text, inverts per theme) and
// `paper` (warm-white pill for dark canvases) added per HANDOFF PillButton spec.
type BtnKind = 'terra' | 'forest' | 'glass' | 'ink' | 'paper';

interface BtnProps {
  children: React.ReactNode;
  kind?: BtnKind;
  onClick?: () => void;
  style?: React.CSSProperties;
  full?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export default function Btn({ children, kind = 'terra', onClick, style, full, disabled, type = 'button', 'aria-label': ariaLabel }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`lg-btn lg-btn-${kind}`}
      style={{ height: 54, padding: '0 24px', fontSize: 15, width: full ? '100%' : undefined, ...style }}
    >
      {children}
    </button>
  );
}
