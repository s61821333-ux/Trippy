'use client';

import React from 'react';
import { m } from 'framer-motion';

interface Option {
  value: string;
  label: React.ReactNode;
}

interface SegmentedPillProps {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  variant?: 'terra' | 'forest' | 'ink';
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/**
 * Glass segmented control (HANDOFF). Active label sits over a spring-animated
 * blob shared via layoutId.
 */
export default function SegmentedPill({
  options, value, onChange, variant = 'terra', style, 'aria-label': ariaLabel,
}: SegmentedPillProps) {
  const cls = variant === 'forest' ? ' is-forest' : variant === 'ink' ? ' is-ink' : '';
  const reactId = React.useId();
  const blobId = `seg-${ariaLabel ?? reactId}`;
  return (
    <div role="tablist" aria-label={ariaLabel} className={`segmented${cls}`} style={style}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={active ? 'is-active' : ''}
          >
            {active && (
              <m.span
                layoutId={blobId}
                className="seg-blob"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 'var(--z-base)' }}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
