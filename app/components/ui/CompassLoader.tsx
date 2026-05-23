'use client';

import React from 'react';

interface Props {
  size?: number;
}

/**
 * Trippy brand loader — orbiting arcs + slowly rotating compass mark.
 * Matches the Globe Loader design spec exactly.
 */
export default function CompassLoader({ size = 200 }: Props) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ width: s, height: s, position: 'relative' }}
    >
      {/* Pulse halo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, rgba(196,113,74,0.22) 0%, rgba(196,113,74,0.10) 28%, rgba(244,239,232,0) 58%)',
        animation: 'compHaloBreathe 2.8s ease-in-out infinite',
      }} />

      {/* Outermost: faint forest streak, very slow CCW */}
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', animation: 'compSpinCCW 9.0s linear infinite', transformOrigin: 'center' }}
        viewBox={`0 0 ${s} ${s}`} width={s} height={s} aria-hidden="true">
        <circle cx={cx} cy={cy} r={cx * 0.96} fill="none"
          stroke="#3B6E52" strokeWidth={s * 0.005}
          strokeDasharray={`${s * 0.85} ${s * 2.165}`} strokeLinecap="round"
          opacity="0.35" />
      </svg>

      {/* Outer: terracotta long arc, slow CW */}
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', animation: 'compSpinCW 5.4s linear infinite', transformOrigin: 'center' }}
        viewBox={`0 0 ${s} ${s}`} width={s} height={s} aria-hidden="true">
        <circle cx={cx} cy={cy} r={cx * 0.92} fill="none"
          stroke="#C4714A" strokeWidth={s * 0.0075}
          strokeDasharray={`${s * 0.6} ${s * 0.42} ${s * 0.09} ${s * 1.785}`} strokeLinecap="round"
          opacity="0.75" />
      </svg>

      {/* Tiny terracotta dot on outer orbit */}
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', animation: 'compSpinCW 5.4s linear infinite', transformOrigin: 'center' }}
        viewBox={`0 0 ${s} ${s}`} width={s} height={s} aria-hidden="true">
        <circle cx={cx} cy={cy * 0.08} r={s * 0.016} fill="#C4714A" />
      </svg>

      {/* Mid: gold counter-rotating streaks */}
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', animation: 'compSpinCCW 3.6s linear infinite', transformOrigin: 'center' }}
        viewBox={`0 0 ${s} ${s}`} width={s} height={s} aria-hidden="true">
        <circle cx={cx} cy={cy} r={cx * 0.84} fill="none"
          stroke="#C8944A" strokeWidth={s * 0.0075}
          strokeDasharray={`${s * 0.29} ${s * 0.19} ${s * 0.11} ${s * 2.05}`} strokeLinecap="round"
          opacity="0.9" />
      </svg>

      {/* Gold diamond bead on mid orbit */}
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', animation: 'compSpinCCW 3.6s linear infinite', transformOrigin: 'center' }}
        viewBox={`0 0 ${s} ${s}`} width={s} height={s} aria-hidden="true">
        <g transform={`translate(${cx} ${s * 0.92}) rotate(45)`}>
          <rect x={-s * 0.018} y={-s * 0.018} width={s * 0.036} height={s * 0.036} fill="#C8944A" />
        </g>
      </svg>

      {/* Inner: forest crisp arcs, fast CW */}
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', animation: 'compSpinCW 2.4s linear infinite', transformOrigin: 'center' }}
        viewBox={`0 0 ${s} ${s}`} width={s} height={s} aria-hidden="true">
        <circle cx={cx} cy={cy} r={cx * 0.76} fill="none"
          stroke="#3B6E52" strokeWidth={s * 0.01}
          strokeDasharray={`${s * 0.22} ${s * 0.3} ${s * 0.09} ${s * 1.78}`} strokeLinecap="round"
          opacity="0.92" />
      </svg>

      {/* Forest dot + sparkle on inner orbit */}
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', animation: 'compSpinCW 2.4s linear infinite', transformOrigin: 'center' }}
        viewBox={`0 0 ${s} ${s}`} width={s} height={s} aria-hidden="true">
        <circle cx={s * 0.88} cy={cy} r={s * 0.018} fill="#3B6E52" />
        <circle cx={cx} cy={s * 0.12} r={s * 0.011} fill="#E0916B" opacity="0.9" />
      </svg>

      {/* Compass mark — slow CW rotation */}
      <svg
        style={{ position: 'absolute', inset: 0, overflow: 'visible', animation: 'compSpinCW 6.0s linear infinite', transformOrigin: 'center' }}
        viewBox="0 0 240 240"
        width={s}
        height={s}
        aria-hidden="true"
      >
        <circle cx="120" cy="120" r="90" stroke="var(--compass-ring, #1A1410)" strokeWidth="4" fill="none" />
        <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="var(--compass-n, #C4714A)" />
        <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="var(--compass-s, #3B6E52)" />
        <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="var(--compass-ew, #C8944A)" />
        <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="var(--compass-ew, #C8944A)" />
        <circle cx="120" cy="120" r="6" fill="var(--compass-hub, #1A1410)" />
      </svg>

    </div>
  );
}
