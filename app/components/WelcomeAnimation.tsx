'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { LoaderTheme } from '@/lib/deriveTheme';
import { BRAND_THEME } from '@/lib/deriveTheme';

interface Props {
  theme?: LoaderTheme;
  speed?: number;
  dark?: boolean;
  duration?: number;
  loop?: boolean;
  onDone?: () => void;
}

// Injected once — continuous animations used by the orbits/ribbons
function WelcomeStyles() {
  return (
    <style>{`
      @keyframes wlSpin  { from { transform: rotate(0);    } to { transform: rotate(360deg);  } }
      @keyframes wlSpinR { from { transform: rotate(0);    } to { transform: rotate(-360deg); } }
      @keyframes wlWave  { 0%   { transform: translateX(-8%) skewY(-7deg) scaleY(1);    }
                           50%  { transform: translateX(8%)  skewY(7deg)  scaleY(1.08); }
                           100% { transform: translateX(-8%) skewY(-7deg) scaleY(1);    } }
      @keyframes wlHalo  { 0%,100% { transform: scale(.9);    opacity:.6; }
                           50%     { transform: scale(1.08);  opacity:1;  } }
      @keyframes wlPing  { 0%   { transform: scale(.4);  opacity:.8; }
                           100% { transform: scale(2.4);  opacity:0;  } }
    `}</style>
  );
}

export default function WelcomeAnimation({
  theme = BRAND_THEME,
  speed = 1,
  dark = false,
  duration = 4,
  loop = false,
  onDone,
}: Props) {
  const t = theme;
  const dur = Math.max(1.4, duration / speed);
  const [p, setP] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = 0;
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      let prog = (now - startRef.current) / (dur * 1000);
      if (prog >= 1) {
        if (loop) { startRef.current = now; prog = 0; }
        else prog = 1;
      }
      setP(prog);
      if (prog < 1 || loop) rafRef.current = requestAnimationFrame(tick);
      else if (onDone) onDone();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dur, loop]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── easing helpers ────────────────────────────────────────────────────────
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const ph = (a: number, b: number) => clamp((p - a) / (b - a));
  const smooth = (x: number) => x * x * (3 - 2 * x);
  const back = (x: number) => {
    const c = 1.7; const u = x - 1;
    return 1 + (c + 1) * u * u * u + c * u * u;
  };

  // ── phase envelopes ───────────────────────────────────────────────────────
  const ribbonIn      = smooth(ph(0, 0.16));
  const ribbonOut     = smooth(ph(0.74, 0.96));
  const ribbonOpacity = ribbonIn * (1 - ribbonOut) * (dark ? 0.5 : 0.62);

  const orbitIn       = smooth(ph(0.08, 0.4));
  const orbitConverge = smooth(ph(0.58, 0.8));
  const orbitScale    = 0.4 + 0.6 * orbitIn - 0.82 * orbitConverge;
  const orbitOpacity  = orbitIn * (1 - orbitConverge);

  const markP       = ph(0.6, 0.82);
  const markScale   = markP < 1 ? 0.2 + 0.8 * back(markP) : 1;
  const markOpacity = smooth(ph(0.6, 0.74));
  const settle      = smooth(ph(0.86, 1));

  const wash = t.wash && t.wash.length ? t.wash : [t.c1, t.c2, t.c3];
  const paper = dark ? '#17140F' : '#F4EFE8';
  const sp = (s: number) => `${s / speed}s`;

  const Orbit = (r: number, dash: string, color: string, w: number, dir: string, durS: number, op: number) => (
    <svg viewBox="0 0 240 240" style={{
      position: 'absolute', inset: 0, overflow: 'visible',
      animation: `${dir} ${sp(durS)} linear infinite`, transformOrigin: '50% 50%',
    }}>
      <circle cx="120" cy="120" r={r} fill="none" stroke={color} strokeWidth={w}
        strokeDasharray={dash} strokeLinecap="round" opacity={op} />
    </svg>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: paper,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <WelcomeStyles />

      {/* flag-color ribbons */}
      <div style={{
        position: 'absolute', inset: '-30%', opacity: ribbonOpacity,
        filter: 'blur(2px)', display: 'flex', flexDirection: 'column',
      }}>
        {wash.concat(wash.slice(0, Math.max(0, 5 - wash.length))).slice(0, 6).map((c, i) => (
          <div key={i} style={{
            flex: 1, background: c, transformOrigin: 'center',
            animation: `wlWave ${sp(3.2 + i * 0.35)} ease-in-out infinite`,
            animationDelay: sp(i * -0.4),
          }} />
        ))}
      </div>

      {/* paper veil so ribbons read as a soft wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(60% 55% at 50% 50%, ${paper}cc 0%, ${paper}66 55%, transparent 100%)`,
      }} />

      {/* halo */}
      <div style={{
        position: 'absolute', width: '62%', aspectRatio: '1', borderRadius: '50%',
        background: `radial-gradient(circle, ${t.c1}44 0%, ${t.c1}1f 34%, transparent 64%)`,
        opacity: orbitOpacity + markOpacity * 0.6,
        animation: `wlHalo ${sp(2.6)} ease-in-out infinite`,
      }} />

      {/* assembling orbits */}
      <div style={{
        position: 'absolute', width: '58%', aspectRatio: '1',
        transform: `scale(${orbitScale})`, opacity: orbitOpacity,
      }}>
        {Orbit(104, '150 320', t.c1, 1.6, 'wlSpinR', 9, 0.5)}
        {Orbit(96, '120 84 18 357', t.c2, 2, 'wlSpin', 5.4, 0.85)}
        {Orbit(86, '58 38 22 410', t.c3, 2, 'wlSpinR', 3.6, 0.9)}
        {Orbit(76, '44 60 18 356', t.c1, 2.6, 'wlSpin', 2.4, 0.95)}
      </div>

      {/* resolve: the recolored compass mark */}
      <div style={{
        position: 'absolute', width: '46%', aspectRatio: '1',
        transform: `scale(${markScale})`, opacity: markOpacity,
      }}>
        {markP > 0 && markP < 1 && (
          <div style={{
            position: 'absolute', inset: '14%', borderRadius: '50%',
            border: `2px solid ${t.c2}`,
            animation: `wlPing ${sp(1.1)} ease-out infinite`,
          }} />
        )}
        <svg viewBox="0 0 240 240" style={{
          width: '100%', height: '100%', overflow: 'visible',
          transform: `rotate(${(1 - settle) * -22}deg)`,
        }}>
          <circle cx="120" cy="120" r="92" fill="none" stroke={t.ink} strokeWidth="4" opacity="0.92" />
          <path d="M120 36 L138 120 L120 124 L102 120 Z" fill={t.c2} />
          <path d="M120 204 L102 120 L120 116 L138 120 Z" fill={t.c1} />
          <path d="M204 120 L120 102 L116 120 L120 138 Z" fill={t.c3} />
          <path d="M36 120 L120 138 L124 120 L120 102 Z" fill={t.c3} />
          <circle cx="120" cy="120" r="6.5" fill={t.ink} />
        </svg>
      </div>
    </div>
  );
}
