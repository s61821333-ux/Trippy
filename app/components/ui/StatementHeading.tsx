'use client';

import React from 'react';
import { m } from 'framer-motion';

interface StatementHeadingProps {
  /** [brightLine, mutedLine?] — line 1 in --text, line 2 in --text-3. */
  lines: React.ReactNode[];
  size?: 'sm' | 'base' | 'lg';
  as?: 'h1' | 'h2' | 'h3' | 'p';
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_CLASS = { sm: 'text-display-sm', base: 'text-display', lg: 'text-display-lg' } as const;
const MOTION_TAG = { h1: m.h1, h2: m.h2, h3: m.h3, p: m.p } as const;

/**
 * Two-tone statement headline (HANDOFF rule 2): bright fact / muted promise.
 * Bold DM Sans via .text-display* (Assistant 800 in Hebrew, handled in CSS).
 */
export default function StatementHeading({
  lines, size = 'base', as = 'h1', animate = true, className = '', style,
}: StatementHeadingProps) {
  const Tag = (animate ? MOTION_TAG[as] : as) as React.ElementType;
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        transition: { duration: 0.45, ease: [0.25, 0, 0, 1] as [number, number, number, number] },
      }
    : {};
  return (
    <Tag className={`statement ${SIZE_CLASS[size]} ${className}`.trim()} style={{ margin: 0, ...style }} {...motionProps}>
      <span className="line-1">{lines[0]}</span>
      {lines[1] != null && <span className="line-2">{lines[1]}</span>}
    </Tag>
  );
}
