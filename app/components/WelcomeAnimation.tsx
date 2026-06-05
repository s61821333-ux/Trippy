'use client';

import React, { useEffect, useRef } from 'react';
import type { LoaderTheme } from '@/lib/deriveTheme';
import { BRAND_THEME } from '@/lib/deriveTheme';

export interface CountryEntry {
  name: string;
  accent: string;
}

interface Props {
  theme?: LoaderTheme;
  countries?: CountryEntry[];
  dark?: boolean;
  duration?: number;
  onDone?: () => void;
}

function WelcomeStyles() {
  return (
    <style>{`
      @keyframes wlHaloBreath {
        0%, 100% { transform: scale(0.86); opacity: 0.72; }
        50%       { transform: scale(1.05); opacity: 1; }
      }
      @keyframes wlSpinCW  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
      @keyframes wlSpinCCW { from { transform: rotate(360deg); } to { transform: rotate(0deg);    } }
      @keyframes wlIndeterminate {
        0%   { transform: translateX(-130%); }
        100% { transform: translateX(320%); }
      }
      @keyframes wlCompassIn {
        from { opacity: 0; transform: scale(0.62); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes wlBeadPop {
        0%   { opacity: 0; transform: scale(0); }
        60%  { opacity: 1; transform: scale(1.28); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes wlBlurUp {
        from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
        to   { opacity: 1; transform: none; filter: none; }
      }
      @keyframes wlSegDraw {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .wl-anim { animation: none !important; opacity: 1 !important;
          transform: none !important; filter: none !important; }
      }
    `}</style>
  );
}

export default function WelcomeAnimation({
  theme = BRAND_THEME,
  countries = [],
  dark = false,
  duration = 3.6,
  onDone,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDone?.(), duration * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = theme;
  const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const snap   = 'cubic-bezier(0.25, 0, 0, 1)';

  const textColor  = dark ? 'oklch(92% 0.006 80)' : 'oklch(13% 0.012 55)';
  const mutedColor = dark ? 'oklch(56% 0.014 55)' : 'oklch(60% 0.014 55)';
  const ruleColor  = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,20,16,0.12)';
  const paperHi    = dark ? '#211D18' : '#FFFCF8';
  const paper      = dark ? '#0E0C0A' : '#F9F5EE';

  const hasCountries = countries.length > 0 && countries.some(c => c.name);

  // Orbit bead config — each country rides its own ring
  const RADII = [96, 82, 68, 54];
  const DURS  = [5.4, 3.6, 4.7, 2.9];
  const beads = countries.map((c, i) => ({
    accent: c.accent,
    r:   RADII[i % RADII.length],
    dur: DURS[i % DURS.length],
    ccw: i % 2 === 1,
    delay: 0.15 + i * 0.12,
  }));

  // Compass point colors cycle through country accents
  const pt = (idx: number) => beads[idx % Math.max(beads.length, 1)]?.accent ?? [t.c2, t.c1, t.c3, t.c3][idx] ?? t.c2;

  // Destination phrase: "A", "A & B", "A, B & C"
  const n = countries.filter(c => c.name).length;
  const destParts = countries.filter(c => c.name).map((c, i) => {
    const sep = i === 0 ? '' : i === n - 1 ? ' & ' : ', ';
    return (
      <React.Fragment key={i}>
        {sep && <span style={{ opacity: 0.45 }}>{sep}</span>}
        {c.name}
      </React.Fragment>
    );
  });

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 'clamp(34px, 5.5vh, 58px)',
      background: [
        `radial-gradient(70% 55% at 50% 30%, ${t.c3}1a 0%, transparent 70%)`,
        `radial-gradient(60% 50% at 18% 88%, ${t.c1}14 0%, transparent 72%)`,
        `radial-gradient(60% 55% at 86% 80%, ${t.c2}14 0%, transparent 72%)`,
        paper,
      ].join(', '),
    }}>
      <WelcomeStyles />

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        opacity: dark ? 0.4 : 0.55,
        backgroundImage: 'radial-gradient(rgba(26,20,16,0.05) 1px, transparent 1.4px)',
        backgroundSize: '7px 7px',
      }} />
      {/* Soft vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        boxShadow: 'inset 0 0 240px rgba(26,20,16,0.10)',
      }} />

      {/* Loader column */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 'clamp(30px, 4.5vh, 50px)',
      }}>

        {/* ── Compass ─────────────────────────────────────────────── */}
        <div role="status" aria-label="Preparing your trip"
          style={{ position: 'relative', width: 224, height: 224 }}>
          <div className="wl-anim" style={{
            position: 'absolute', inset: 0,
            animation: `wlCompassIn 0.75s ${spring} both`,
          }}>
            {/* Halo */}
            <div className="wl-anim" style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle, ${t.c2}38 0%, ${t.c3}1a 30%, transparent 60%)`,
              animation: `wlHaloBreath 2.8s ease-in-out infinite`,
            }} />

            {/* Orbit rings */}
            {([
              { r: 96, stroke: t.c1, w: 1,   dash: '2 9',              dir: 'wlSpinCCW', dur: '9s',   op: 0.30 },
              { r: 90, stroke: t.c1, w: 1.5, dash: '120 84 18 357',    dir: 'wlSpinCW',  dur: '5.4s', op: 0.55 },
              { r: 78, stroke: t.c3, w: 1.5, dash: '58 38 22 410',     dir: 'wlSpinCCW', dur: '3.6s', op: 0.70 },
              { r: 64, stroke: t.c2, w: 2,   dash: '40 60 14 360',     dir: 'wlSpinCW',  dur: '2.4s', op: 0.80 },
            ] as const).map((o, i) => (
              <svg key={i} aria-hidden="true" viewBox="0 0 200 200" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                overflow: 'visible', transformOrigin: '50% 50%',
                animation: `${o.dir} ${o.dur} linear infinite`,
              }}>
                <circle cx="100" cy="100" r={o.r} fill="none"
                  stroke={o.stroke} strokeWidth={o.w}
                  strokeDasharray={o.dash} strokeLinecap="round" opacity={o.op} />
              </svg>
            ))}

            {/* Country beads */}
            {beads.map((b, i) => (
              <svg key={i} aria-hidden="true" viewBox="0 0 200 200" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                overflow: 'visible', transformOrigin: '50% 50%',
                animation: `wlSpinCW ${b.dur}s linear infinite`,
                animationDirection: b.ccw ? 'reverse' : 'normal',
              }}>
                <g className="wl-anim" style={{
                  transformBox: 'fill-box', transformOrigin: 'center',
                  animation: `wlBeadPop 0.6s ${spring} ${b.delay}s both`,
                }}>
                  <circle cx="100" cy={100 - b.r} r="9"   fill={b.accent} opacity="0.22" />
                  <circle cx="100" cy={100 - b.r} r="5"   fill={b.accent} />
                  <circle cx="100" cy={100 - b.r} r="1.8" fill={paperHi} opacity="0.85" />
                </g>
              </svg>
            ))}

            {/* Compass mark — slow full spin */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'wlSpinCW 20s linear infinite',
              transformOrigin: '50% 50%',
            }}>
              <svg width="150" height="150" viewBox="0 0 240 240"
                aria-hidden="true" style={{ overflow: 'visible', display: 'block' }}>
                <circle cx="120" cy="120" r="90" fill="none" stroke={textColor} strokeWidth="4" />
                <path d="M120 36 L138 120 L120 124 L102 120 Z" fill={pt(0)} />
                <path d="M120 204 L102 120 L120 116 L138 120 Z" fill={pt(1)} />
                <path d="M204 120 L120 102 L116 120 L120 138 Z" fill={pt(2)} />
                <path d="M36 120 L120 138 L124 120 L120 102 Z"  fill={pt(0)} opacity="0.6" />
                <circle cx="120" cy="120" r="6" fill={textColor} />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Caption ─────────────────────────────────────────────── */}
        {hasCountries && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 16, textAlign: 'center', width: 'min(640px, 88vw)',
          }}>
            <div className="wl-anim" style={{
              fontSize: '0.8rem', letterSpacing: '0.20em', color: mutedColor,
              fontFamily: 'var(--font-sans, system-ui)',
              animation: `wlBlurUp 500ms ${spring} 0.45s both`,
            }}>
              Preparing your trip
            </div>
            <h1 className="wl-anim" style={{
              margin: 0, width: '100%',
              fontFamily: 'var(--font-serif, "Instrument Serif", Georgia, serif)',
              fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(2.1rem, 6vw, 3.4rem)',
              lineHeight: 1.04, letterSpacing: '-0.02em',
              color: textColor,
              animation: `wlBlurUp 500ms ${spring} 0.55s both`,
            }}>
              {destParts}
            </h1>
            {/* Per-country color bars */}
            <div className="wl-anim" style={{
              display: 'flex', gap: 6, justifyContent: 'center',
              animation: `wlBlurUp 500ms ${spring} 0.7s both`,
            }}>
              {countries.filter(c => c.name).map((c, i) => (
                <span key={i} className="wl-anim" style={{
                  display: 'block',
                  width: 'clamp(24px, 6vw, 44px)', height: 4,
                  borderRadius: 9999, background: c.accent,
                  transformOrigin: 'left center',
                  animation: `wlSegDraw 0.5s ${snap} ${0.75 + i * 0.1}s both`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Progress bar ────────────────────────────────────────── */}
        <div className="wl-anim" aria-hidden="true" style={{
          position: 'relative', width: 176, height: 3, borderRadius: 9999,
          background: ruleColor, overflow: 'hidden',
          animation: `wlBlurUp 500ms ${spring} 0.9s both`,
        }}>
          <span style={{
            position: 'absolute', top: 0, left: 0, height: '100%', width: '42%',
            borderRadius: 9999,
            background: `linear-gradient(90deg, transparent, ${t.c2}, transparent)`,
            animation: `wlIndeterminate 1.7s cubic-bezier(0.65, 0, 0.35, 1) infinite`,
          }} />
        </div>

        {/* ── Wordmark ─────────────────────────────────────────────── */}
        <div className="wl-anim" style={{
          fontFamily: 'var(--font-sans, system-ui)',
          fontWeight: 700, letterSpacing: '-0.04em',
          fontSize: '1.25rem', color: textColor,
          animation: `wlBlurUp 500ms ${spring} 1s both`,
        }}>
          Trippy<span style={{ color: t.c2 }}>.</span>
        </div>
      </div>
    </div>
  );
}
