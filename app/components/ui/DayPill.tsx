'use client';

import React from 'react';

interface DayPillProps {
  label: React.ReactNode;
  num: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
}

/** Itinerary day scroller pill (HANDOFF): 48×60, mono DAY over number, active terra. */
export default function DayPill({ label, num, active, onClick, 'aria-label': ariaLabel }: DayPillProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={active ? 'true' : undefined}
      className={`day-pill${active ? ' is-active' : ''}`}
      style={{ scrollSnapAlign: 'start' }}
    >
      <span className="d-label">{label}</span>
      <span className="d-num">{num}</span>
    </button>
  );
}
