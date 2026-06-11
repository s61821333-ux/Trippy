'use client';

// Usage: floating surfaces only — sheets, modals, NavBar, toasts, FABs.
// Do NOT use for inline page-scroll content (section cards, list items). Use plain <div> with var(--surface) + var(--border) instead.
import React, { CSSProperties, KeyboardEvent, ReactNode } from 'react';

interface GlassProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  /** Accessible label required when card is clickable and has no visible text label */
  ariaLabel?: string;
}

export default function Glass({ children, level = 2, style = {}, className = '', onClick, ariaLabel }: GlassProps) {
  const isInteractive = !!onClick;

  // Row 643: clickable cards must be keyboard-accessible
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      className={`glass glass-${level} ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        cursor: isInteractive ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
