'use client';

import React from 'react';
import Eyebrow from './Eyebrow';

interface Stat {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: 'default' | 'terra' | 'forest';
}

interface StatTripletProps {
  stats: Stat[];
  separators?: boolean;
  style?: React.CSSProperties;
}

/** Borderless stat triplet - mono label over bold value (HANDOFF dashboard). */
export default function StatTriplet({ stats, separators = true, style }: StatTripletProps) {
  return (
    <div className="stat-triplet" style={style}>
      {stats.map((s, i) => (
        <React.Fragment key={i}>
          {separators && i > 0 && <span className="sep" aria-hidden="true" />}
          <div className="cell">
            <Eyebrow>{s.label}</Eyebrow>
            <span className={`val${s.tone && s.tone !== 'default' ? ` is-${s.tone}` : ''}`}>{s.value}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
