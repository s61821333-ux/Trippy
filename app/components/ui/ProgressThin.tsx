'use client';

import React from 'react';

interface ProgressThinProps {
  pct: number;
  gradient?: boolean;
  forest?: boolean;
  height?: number;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/** Thin progress bar (HANDOFF): terra fill, optional terra→sand gradient. */
function ProgressThin({ pct, gradient, forest, height = 6, style, 'aria-label': ariaLabel }: ProgressThinProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  const cls = gradient ? ' is-gradient' : forest ? ' is-forest' : '';
  return (
    <div
      className={`progress-thin${cls}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      style={{ height, ...style }}
    >
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}
export default React.memo(ProgressThin);
