'use client';

import React from 'react';

interface GaugeProps {
  pct: number;
  size?: number;
  stroke?: number;
  arc?: string;
  number: React.ReactNode;
  label?: React.ReactNode;
  status?: React.ReactNode;
  statusColor?: string;
  'aria-label'?: string;
}

/**
 * Large dashboard gauge (HANDOFF §1 dashboard): dotted track (.gauge-track,
 * stroke-dasharray 2 9), round-cap progress arc, center number + mono label +
 * status line. Builds on the same ring math as Ring.tsx.
 */
function Gauge({
  pct, size = 210, stroke = 10, arc = 'var(--terra)',
  number, label, status, statusColor = 'var(--brand)', 'aria-label': ariaLabel,
}: GaugeProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle className="gauge-track" cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--rule)" strokeWidth={stroke} strokeLinecap="round" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={arc} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - clamped / 100)}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center', padding: '0 12px' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: size * 0.28, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--text)' }}>
          {number}
        </span>
        {label != null && <span className="mono-eyebrow" style={{ marginTop: 2 }}>{label}</span>}
        {status != null && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: statusColor, marginTop: 2 }}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
export default React.memo(Gauge);
