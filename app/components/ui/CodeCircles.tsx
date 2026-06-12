'use client';

import React from 'react';

interface CodeCirclesProps {
  length?: number;
  value: string;
  activeIndex?: number;
}

/** Invite-code circle slots (HANDOFF B3): filled / active / idle outline states. */
export default function CodeCircles({ length = 4, value, activeIndex }: CodeCirclesProps) {
  const ai = activeIndex ?? value.length;
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => {
        const filled = i < value.length;
        const active = i === ai;
        return (
          <span key={i} className={`code-circle${filled ? ' is-filled' : active ? ' is-active' : ''}`}>
            {value[i] ?? ''}
          </span>
        );
      })}
    </div>
  );
}
