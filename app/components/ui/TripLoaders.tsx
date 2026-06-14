'use client';

import React from 'react';
import type { LoaderTheme } from '@/lib/deriveTheme';
import { BRAND_THEME } from '@/lib/deriveTheme';

export type { LoaderTheme };
export { BRAND_THEME };

// ─── Shared keyframes - inject once at the root ──────────────────────────────
export function LoaderStyles() {
  return (
    <style>{`
      @keyframes tlSpinCW   { from { transform: rotate(0);       } to { transform: rotate(360deg);  } }
      @keyframes tlSpinCCW  { from { transform: rotate(360deg);  } to { transform: rotate(0);       } }
      @keyframes tlHalo     { 0%,100% { transform: scale(.84); opacity:.55; } 50% { transform: scale(1.06); opacity:1; } }
      @keyframes tlDraw     { 0% { stroke-dashoffset: var(--tl-len); } 55% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; } }
      @keyframes tlTravel   { 0% { offset-distance:0%;  opacity:0; } 8%  { opacity:1; } 92% { opacity:1; } 100% { offset-distance:100%; opacity:0; } }
      @keyframes tlPinPop   { 0%,18% { transform: translateY(6px) scale(.4); opacity:0; } 34% { transform: translateY(-3px) scale(1.12); opacity:1; } 46%,100% { transform: translateY(0) scale(1); opacity:1; } }
      @keyframes tlDrop     { 0% { transform: translateY(-58px) scale(.7); opacity:0; }
                              14% { opacity:1; }
                              46% { transform: translateY(0) scale(1); }
                              56% { transform: translateY(-4px) scaleY(1.08) scaleX(.94); }
                              66% { transform: translateY(0) scaleY(.94) scaleX(1.06); }
                              76% { transform: translateY(0) scale(1); }
                             100% { transform: translateY(0) scale(1); opacity:1; } }
      @keyframes tlSync     { 0%,70%,100% { transform: scale(.66); opacity:.35; }
                              18% { transform: scale(1.18); opacity:1; }
                              40% { transform: scale(1); opacity:.9; } }
      @keyframes tlSyncRing { 0% { transform: scale(.6); opacity:.7; } 60%,100% { transform: scale(1.7); opacity:0; } }
      @keyframes tlArc      { 0% { stroke-dashoffset: var(--tl-len); } 70%,100% { stroke-dashoffset: 0; } }
      @keyframes tlTwinkle  { 0%,100% { transform: scale(.5) rotate(-8deg); opacity:.25; } 50% { transform: scale(1) rotate(0); opacity:1; } }
      @keyframes tlShimmer  { 0% { transform: translateX(-130%); } 100% { transform: translateX(230%); } }
      @keyframes tlFloat    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    `}</style>
  );
}

interface LoaderProps {
  theme?: LoaderTheme;
  speed?: number;
  size?: number;
}

// ─── 1 · Compass - signature multi-orbit mark ─────────────────────────────────
export function CompassLoader({ theme = BRAND_THEME, speed = 1, size = 124 }: LoaderProps) {
  const t = theme;
  const d = (s: number) => `${s / speed}s`;
  const orbit = (
    r: number, dash: string, color: string, dur: number,
    dir: 'tlSpinCW' | 'tlSpinCCW', w: number, op: number,
  ) => (
    <svg viewBox="0 0 200 200" style={{
      position: 'absolute', inset: 0, overflow: 'visible',
      animation: `${dir} ${d(dur)} linear infinite`, transformOrigin: '50% 50%',
    }}>
      <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth={w}
        strokeDasharray={dash} strokeLinecap="round" opacity={op} />
    </svg>
  );
  return (
    <div style={{ width: size, height: size, position: 'relative' }} role="status" aria-label="Loading">
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, ${t.c2}38 0%, ${t.c2}18 30%, transparent 60%)`,
        animation: `tlHalo ${d(2.8)} ease-in-out infinite`,
      }} />
      {orbit(96, '170 433', t.c1, 9, 'tlSpinCCW', 1, 0.35)}
      {orbit(92, '120 84 18 357', t.c2, 5.4, 'tlSpinCW', 1.5, 0.8)}
      {orbit(84, '58 38 22 410', t.c3, 3.6, 'tlSpinCCW', 1.5, 0.9)}
      {orbit(76, '44 60 18 356', t.c1, 2, 'tlSpinCW', 2.4, 0.92)}
      {/* leading dot on the fast orbit */}
      <svg viewBox="0 0 200 200" style={{
        position: 'absolute', inset: 0, overflow: 'visible',
        animation: `tlSpinCW ${d(2)} linear infinite`, transformOrigin: '50% 50%',
      }}>
        <circle cx="176" cy="100" r="3.6" fill={t.c1} />
      </svg>
      {/* compass mark, slow rotation */}
      <svg viewBox="0 0 240 240" style={{
        position: 'absolute', inset: 0, overflow: 'visible',
        animation: `tlSpinCW ${d(6)} linear infinite`, transformOrigin: '50% 50%',
      }}>
        <circle cx="120" cy="120" r="62" fill="none" stroke={t.ink} strokeWidth="3.5" opacity="0.92" />
        <path d="M120 64 L134 120 L120 123 L106 120 Z" fill={t.c2} />
        <path d="M120 176 L106 120 L120 117 L134 120 Z" fill={t.c1} />
        <path d="M176 120 L120 106 L117 120 L120 134 Z" fill={t.c3} />
        <path d="M64 120 L120 134 L123 120 L120 106 Z" fill={t.c3} />
        <circle cx="120" cy="120" r="5.5" fill={t.ink} />
      </svg>
    </div>
  );
}

// ─── Dashboard boot skeleton - branded perceived-performance placeholder ─────
// Shown while a returning user's trip loads, instead of a blank full-screen
// spinner. Mirrors the real Dashboard layout (cinematic hero + glass cards) so
// the app feels present immediately.
export function DashboardSkeleton() {
  const heroBlock = (w: number | string, h: number, r: number, mt = 0, op = 0.14) => (
    <div style={{ width: w, height: h, borderRadius: r, marginTop: mt, background: `oklch(100% 0 0 / ${op})`, flexShrink: 0 }} />
  );
  return (
    <div style={{ height: '100%', overflow: 'hidden', background: 'var(--bg)' }} aria-hidden="true">
      <div className="hero-mesh" style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 52px) 22px 26px',
        borderRadius: '0 0 34px 34px', marginBottom: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {heroBlock(90, 12, 6, 0, 0.18)}
          <div style={{ display: 'flex', gap: 8 }}>
            {heroBlock(38, 38, 19)}
            {heroBlock(34, 34, 17)}
          </div>
        </div>
        <div style={{ marginTop: 28 }}>
          {heroBlock(110, 12, 6, 0, 0.18)}
          {heroBlock('70%', 40, 14, 12, 0.22)}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[66, 74, 58].map((w, i) => <React.Fragment key={i}>{heroBlock(w, 28, 99)}</React.Fragment>)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            {[0, 1, 2, 3, 4].map(i => <React.Fragment key={i}>{heroBlock(54, 62, 16, 0, 0.12)}</React.Fragment>)}
          </div>
        </div>
      </div>
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[140, 96, 96].map((h, i) => (
          <div key={i} className="lg" style={{ height: h, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: '78%', height: 16, borderRadius: 8 }} />
            {h > 120 && <div className="skeleton" style={{ width: '58%', height: 12, borderRadius: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2 · Route - drawing a path between two pins ─────────────────────────────
const ROUTE_PATH = 'M26 86 C 60 30, 96 124, 130 70 S 178 26, 190 34';

export function RouteLoader({ theme = BRAND_THEME, speed = 1, size = 124 }: LoaderProps) {
  const t = theme;
  const d = (s: number) => `${s / speed}s`;
  const Pin = ({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) => (
    <g style={{ transformOrigin: `${x}px ${y}px`, animation: `tlPinPop ${d(3.4)} ${d(delay)} ease-in-out infinite` }}>
      <path d={`M${x} ${y} C ${x - 8} ${y - 12} ${x - 8} ${y - 23} ${x} ${y - 29} C ${x + 8} ${y - 23} ${x + 8} ${y - 12} ${x} ${y} Z`} fill={color} />
      <circle cx={x} cy={y - 19} r="4.5" fill="#FBF7F0" />
    </g>
  );
  return (
    <div style={{ width: size, height: size * 0.72, position: 'relative' }} role="status" aria-label="Loading">
      <svg viewBox="0 0 216 116" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <path d={ROUTE_PATH} fill="none" stroke={t.ink} strokeWidth="2" strokeDasharray="2 7"
          strokeLinecap="round" opacity="0.18" />
        <path d={ROUTE_PATH} fill="none" stroke={t.c1} strokeWidth="3" strokeLinecap="round"
          style={{ '--tl-len': 320, strokeDasharray: 320, animation: `tlDraw ${d(3.4)} cubic-bezier(.45,0,.2,1) infinite` } as React.CSSProperties} />
        <Pin x={26} y={86} color={t.c1} delay={0} />
        <Pin x={190} y={34} color={t.c2} delay={1.7} />
      </svg>
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: 11, height: 11, marginLeft: -5.5, marginTop: -5.5,
          borderRadius: '50%', background: t.c2, boxShadow: `0 0 0 4px ${t.c2}33`,
          offsetPath: `path('${ROUTE_PATH}')`,
          animation: `tlTravel ${d(3.4)} cubic-bezier(.5,0,.3,1) infinite`,
        } as React.CSSProperties} />
      </div>
    </div>
  );
}

// ─── 3 · Pack - stamps dropping into the bag ─────────────────────────────────
export function PackLoader({ theme = BRAND_THEME, speed = 1, size = 124 }: LoaderProps) {
  const t = theme;
  const d = (s: number) => `${s / speed}s`;
  const cs = [t.c1, t.c2, t.c3];
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6,
    }} role="status" aria-label="Loading">
      <div style={{
        position: 'absolute', top: 4, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 12,
      }}>
        {cs.map((c, i) => (
          <span key={i} style={{
            width: 20, height: 20, borderRadius: '50%', background: c,
            border: `1.5px solid ${t.ink}22`, boxShadow: 'inset 0 1px 0 #ffffff66',
            display: 'block',
            animation: `tlDrop ${d(2.4)} ${d(i * 0.42)} cubic-bezier(.4,0,.2,1) infinite`,
          }} />
        ))}
      </div>
      <svg viewBox="0 0 120 64" style={{ width: size * 0.82, height: size * 0.45, position: 'relative' }}>
        <path d="M14 14 H106 a6 6 0 0 1 6 6 l-6 34 a8 8 0 0 1 -8 7 H22 a8 8 0 0 1 -8 -7 L8 20 a6 6 0 0 1 6 -6 Z"
          fill="#FBF7F0" stroke={t.ink} strokeWidth="2.4" strokeLinejoin="round" opacity="0.96" />
        <path d="M40 14 c0 -10 8 -16 20 -16 c12 0 20 6 20 16" fill="none" stroke={t.ink}
          strokeWidth="2.4" strokeLinecap="round" />
        <path d="M9 24 H111" stroke={t.ink} strokeWidth="2" opacity="0.25" />
      </svg>
    </div>
  );
}

// ─── 4 · Sync - the crew saving together ─────────────────────────────────────
export function SyncLoader({ theme = BRAND_THEME, speed = 1, size = 124 }: LoaderProps) {
  const t = theme;
  const d = (s: number) => `${s / speed}s`;
  const cs = [t.c1, t.c2, t.c3, t.c1];
  const n = 4, gap = 30, startX = 24, y = 40;
  return (
    <div style={{ width: size, height: size * 0.66, position: 'relative' }} role="status" aria-label="Loading">
      <svg viewBox="0 0 132 76" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <path d={`M${startX} ${y} H${startX + gap * (n - 1)}`} stroke={t.ink} strokeWidth="2"
          strokeLinecap="round" opacity="0.16" />
        <path d={`M${startX} ${y} H${startX + gap * (n - 1)}`} stroke={t.c1} strokeWidth="2.4" strokeLinecap="round"
          style={{ '--tl-len': gap * (n - 1), strokeDasharray: gap * (n - 1), animation: `tlArc ${d(2.6)} ease-in-out infinite` } as React.CSSProperties} />
        {cs.map((c, i) => {
          const x = startX + gap * i;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="9" fill={c} opacity="0.25"
                style={{ transformOrigin: `${x}px ${y}px`, animation: `tlSyncRing ${d(2.6)} ${d(i * 0.42)} ease-out infinite` }} />
              <g style={{ transformOrigin: `${x}px ${y}px`, animation: `tlSync ${d(2.6)} ${d(i * 0.42)} ease-in-out infinite` }}>
                <circle cx={x} cy={y} r="9.5" fill={c} stroke="#FBF7F0" strokeWidth="2" />
                <circle cx={x} cy={y - 3} r="3" fill="#FBF7F0" />
                <path d={`M${x - 4.5} ${y + 6} a4.5 4 0 0 1 9 0`} fill="#FBF7F0" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── 5 · Sparkle - Triplly is thinking (AI suggestions) ───────────────────────
const SPARK_PATH = 'M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4z';

export function SparkleLoader({ theme = BRAND_THEME, speed = 1, size = 124 }: LoaderProps) {
  const t = theme;
  const d = (s: number) => `${s / speed}s`;
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
    }} role="status" aria-label="Loading">
      <div style={{ position: 'relative', width: 70, height: 56, animation: `tlFloat ${d(3)} ease-in-out infinite` }}>
        <svg viewBox="0 0 22 20" width="46" height="42" style={{
          position: 'absolute', left: 12, top: 6,
          animation: `tlTwinkle ${d(1.8)} ease-in-out infinite`, transformOrigin: '11px 10px',
        }}>
          <path d={SPARK_PATH} fill={t.c1} />
        </svg>
        <svg viewBox="0 0 22 20" width="22" height="20" style={{
          position: 'absolute', left: 0, top: 0,
          animation: `tlTwinkle ${d(1.8)} ${d(0.5)} ease-in-out infinite`, transformOrigin: '11px 10px',
        }}>
          <path d={SPARK_PATH} fill={t.c2} />
        </svg>
        <svg viewBox="0 0 22 20" width="16" height="15" style={{
          position: 'absolute', right: 0, top: 18,
          animation: `tlTwinkle ${d(1.8)} ${d(0.9)} ease-in-out infinite`, transformOrigin: '11px 10px',
        }}>
          <path d={SPARK_PATH} fill={t.c3} />
        </svg>
      </div>
      <div style={{
        width: size * 0.6, height: 8, borderRadius: 99,
        background: `${t.ink}14`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: '45%', borderRadius: 99,
          background: `linear-gradient(90deg, transparent, ${t.c1}, transparent)`,
          animation: `tlShimmer ${d(1.6)} ease-in-out infinite`,
        }} />
      </div>
    </div>
  );
}
