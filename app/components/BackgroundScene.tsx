'use client';

import React, { useEffect, useRef } from 'react';
import { TripTheme } from '@/lib/types';

interface Props {
  theme?: TripTheme;
}

/* ── Desert ─────────────────────────────────────────────────── */
function DesertBg() {
  const cloud1Ref = useRef<SVGGElement>(null);
  const cloud2Ref = useRef<SVGGElement>(null);
  const midRef    = useRef<SVGGElement>(null);
  const fgRef     = useRef<SVGGElement>(null);
  const rocksRef  = useRef<SVGGElement>(null);
  const sunRef    = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let ticking = false;
    const move = (e: MouseEvent | TouchEvent) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth / 2) : e.clientX;
        const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight / 2) : e.clientY;
        const dx = cx / window.innerWidth  - 0.5;
        const dy = cy / window.innerHeight - 0.5;
        if (cloud1Ref.current) cloud1Ref.current.style.transform = `translate(${dx*18}px,${dy*6}px)`;
        if (cloud2Ref.current) cloud2Ref.current.style.transform = `translate(${dx*10}px,${dy*4}px)`;
        if (midRef.current)    midRef.current.style.transform    = `translate(${dx*6}px,${dy*3}px)`;
        if (fgRef.current)     fgRef.current.style.transform     = `translate(${dx*12}px,${dy*5}px)`;
        if (rocksRef.current)  rocksRef.current.style.transform  = `translate(${dx*4}px,${dy*2}px)`;
        if (sunRef.current)    sunRef.current.style.transform    = `translate(${dx*8}px,${dy*5}px)`;
        ticking = false;
      });
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
  }, []);

  return (
    <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#9ecfe8"/>
          <stop offset="45%"  stopColor="#d4edf9"/>
          <stop offset="75%"  stopColor="#f2dfc0"/>
          <stop offset="100%" stopColor="#e8c888"/>
        </linearGradient>
        <linearGradient id="dg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d4a85a"/><stop offset="100%" stopColor="#b8843a"/></linearGradient>
        <linearGradient id="dg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8c070"/><stop offset="100%" stopColor="#c8943e"/></linearGradient>
        <linearGradient id="dg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0d090"/><stop offset="100%" stopColor="#d4a85a"/></linearGradient>
        <linearGradient id="dRock" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0%" stopColor="#c09050"/><stop offset="100%" stopColor="#8a6030"/></linearGradient>
        <filter id="dBlur2"><feGaussianBlur stdDeviation="2"/></filter>
        <filter id="dBlur5"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <rect width="800" height="600" fill="url(#dSky)"/>
      <circle ref={sunRef} cx="620" cy="110" r="52" fill="#ffe080" opacity="0.82"/>
      <circle cx="620" cy="110" r="30" fill="#fffbe0" opacity="0.85"/>
      <g ref={cloud1Ref} style={{ animation: 'cloudDrift 9s ease-in-out infinite alternate' }}>
        <ellipse cx="140" cy="100" rx="70" ry="24" fill="white" opacity="0.78" filter="url(#dBlur2)"/>
        <ellipse cx="175" cy="106" rx="45" ry="14" fill="white" opacity="0.6" filter="url(#dBlur2)"/>
      </g>
      <g ref={cloud2Ref} style={{ animation: 'cloudDrift 12s ease-in-out infinite alternate-reverse' }}>
        <ellipse cx="460" cy="70" rx="55" ry="18" fill="white" opacity="0.55" filter="url(#dBlur2)"/>
      </g>
      <g opacity="0.45" filter="url(#dBlur5)">
        <polygon points="0,380 80,240 160,320 240,200 320,310 400,230 480,290 560,210 640,280 720,220 800,270 800,380" fill="#b09060"/>
      </g>
      <g ref={midRef}>
        <ellipse cx="-20" cy="490" rx="200" ry="80" fill="url(#dg1)"/>
        <ellipse cx="220" cy="510" rx="240" ry="90" fill="url(#dg2)"/>
        <ellipse cx="520" cy="495" rx="220" ry="85" fill="url(#dg1)"/>
        <ellipse cx="780" cy="505" rx="180" ry="78" fill="url(#dg2)"/>
      </g>
      <g ref={fgRef}>
        <ellipse cx="50"  cy="580" rx="200" ry="100" fill="url(#dg3)"/>
        <ellipse cx="310" cy="595" rx="260" ry="110" fill="url(#dg3)"/>
        <ellipse cx="620" cy="585" rx="240" ry="100" fill="url(#dg3)"/>
      </g>
      <g ref={rocksRef}>
        <polygon points="680,450 700,360 730,340 760,355 780,450" fill="url(#dRock)"/>
        <polygon points="60,460 80,390 100,375 125,388 140,460" fill="url(#dRock)"/>
      </g>
      <g fill="#6a8a4a" opacity="0.7">
        <rect x="350" y="430" width="6" height="40" rx="3"/>
        <rect x="334" y="442" width="22" height="5" rx="2.5"/>
        <rect x="328" y="436" width="6" height="18" rx="3"/>
        <rect x="350" y="442" width="22" height="5" rx="2.5"/>
        <rect x="366" y="436" width="6" height="18" rx="3"/>
      </g>
    </svg>
  );
}

/* ── Nature ──────────────────────────────────────────────────── */
function NatureBg() {
  const treesRef = useRef<SVGGElement>(null);
  const mtnRef   = useRef<SVGGElement>(null);
  const cloudRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let ticking = false;
    const move = (e: MouseEvent | TouchEvent) => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth/2) : e.clientX;
        const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight/2) : e.clientY;
        const dx = cx/window.innerWidth-0.5, dy = cy/window.innerHeight-0.5;
        if (treesRef.current) treesRef.current.style.transform = `translate(${dx*10}px,${dy*4}px)`;
        if (mtnRef.current)   mtnRef.current.style.transform   = `translate(${dx*5}px,${dy*3}px)`;
        if (cloudRef.current) cloudRef.current.style.transform = `translate(${dx*14}px,${dy*5}px)`;
        ticking = false;
      });
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
  }, []);

  return (
    <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fa8d6"/>
          <stop offset="55%" stopColor="#a8d8f0"/>
          <stop offset="100%" stopColor="#d4eecc"/>
        </linearGradient>
        <linearGradient id="nGrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5aaa4a"/>
          <stop offset="100%" stopColor="#3a7a30"/>
        </linearGradient>
        <linearGradient id="nMtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8ab8a0"/>
          <stop offset="60%" stopColor="#4a7858"/>
          <stop offset="100%" stopColor="#2a5838"/>
        </linearGradient>
        <filter id="nBlur3"><feGaussianBlur stdDeviation="3"/></filter>
        <filter id="nBlur6"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <rect width="800" height="600" fill="url(#nSky)"/>
      {/* Sun */}
      <circle cx="680" cy="90" r="42" fill="#fff8a0" opacity="0.9"/>
      <circle cx="680" cy="90" r="30" fill="#fffce0" opacity="0.75"/>
      {/* Clouds */}
      <g ref={cloudRef} style={{ animation: 'cloudDrift 10s ease-in-out infinite alternate' }}>
        <ellipse cx="200" cy="90" rx="80" ry="28" fill="white" opacity="0.85" filter="url(#nBlur3)"/>
        <ellipse cx="160" cy="98" rx="48" ry="20" fill="white" opacity="0.7" filter="url(#nBlur3)"/>
        <ellipse cx="500" cy="65" rx="60" ry="22" fill="white" opacity="0.72" filter="url(#nBlur3)"/>
      </g>
      {/* Far mountains */}
      <g ref={mtnRef} opacity="0.65" filter="url(#nBlur6)">
        <polygon points="0,420 100,220 200,350 300,180 400,300 500,200 600,310 700,170 800,260 800,420" fill="#7aaa88"/>
      </g>
      {/* Near mountains */}
      <polygon points="0,480 120,280 240,400 360,240 480,360 600,260 720,350 800,280 800,480" fill="url(#nMtn)"/>
      {/* Ground */}
      <ellipse cx="400" cy="620" rx="500" ry="120" fill="url(#nGrass)"/>
      {/* Trees */}
      <g ref={treesRef}>
        {[60,130,200,580,640,720].map((x,i) => (
          <g key={i} transform={`translate(${x},${i%2===0?400:420})`}>
            <rect x="-5" y="60" width="10" height="50" rx="4" fill="#5a3a18"/>
            <polygon points="0,0 -28,70 28,70" fill={i%2===0?"#2d7a38":"#3a8a40"}/>
            <polygon points="0,20 -22,75 22,75" fill={i%2===0?"#38a050":"#44b05a"}/>
          </g>
        ))}
        {/* Some bushes */}
        <ellipse cx="340" cy="500" rx="40" ry="22" fill="#4a9040" opacity="0.8"/>
        <ellipse cx="460" cy="510" rx="36" ry="18" fill="#3a8838" opacity="0.7"/>
      </g>
      {/* Foreground grass */}
      <ellipse cx="400" cy="590" rx="520" ry="80" fill="#4aaa40" opacity="0.7"/>
    </svg>
  );
}

/* ── City ────────────────────────────────────────────────────── */
function CityBg() {
  const bldgRef = useRef<SVGGElement>(null);
  const fgRef   = useRef<SVGGElement>(null);

  useEffect(() => {
    let ticking = false;
    const move = (e: MouseEvent | TouchEvent) => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth/2) : e.clientX;
        const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight/2) : e.clientY;
        const dx = cx/window.innerWidth-0.5, dy = cy/window.innerHeight-0.5;
        if (bldgRef.current) bldgRef.current.style.transform = `translate(${dx*6}px,${dy*3}px)`;
        if (fgRef.current)   fgRef.current.style.transform   = `translate(${dx*12}px,${dy*5}px)`;
        ticking = false;
      });
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
  }, []);

  /* buildings data: x, y (bottom), w, h, color */
  const bgBuildings = [
    {x:10, y:480, w:55, h:200, c:'#8898b0'}, {x:70, y:460, w:45, h:220, c:'#7a8ca0'},
    {x:120, y:430, w:65, h:250, c:'#9aaccC'}, {x:190, y:460, w:50, h:220, c:'#8090a8'},
    {x:250, y:400, w:70, h:280, c:'#aabccc'}, {x:330, y:440, w:55, h:240, c:'#8898b0'},
    {x:395, y:380, w:80, h:300, c:'#c0d0e0'}, {x:485, y:420, w:60, h:260, c:'#9aaabA'},
    {x:555, y:450, w:50, h:230, c:'#8090a8'}, {x:615, y:400, w:75, h:280, c:'#b0c0d0'},
    {x:700, y:460, w:50, h:220, c:'#8898b0'}, {x:755, y:430, w:55, h:250, c:'#9aaabA'},
  ];
  const fgBuildings = [
    {x:-10, y:520, w:80, h:180, c:'#60748a'}, {x:75, y:490, w:70, h:210, c:'#506880'},
    {x:150, y:470, w:90, h:230, c:'#708090'}, {x:245, y:500, w:65, h:200, c:'#5a6e84'},
    {x:320, y:460, w:100, h:240, c:'#687888'}, {x:430, y:480, w:75, h:220, c:'#5e7284'},
    {x:515, y:470, w:95, h:230, c:'#6a7a8c'}, {x:620, y:500, w:70, h:200, c:'#5a6e84'},
    {x:700, y:475, w:85, h:225, c:'#687888'},
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a4a7a"/>
          <stop offset="40%" stopColor="#4a6898"/>
          <stop offset="75%" stopColor="#8aa0c0"/>
          <stop offset="100%" stopColor="#c8d8e8"/>
        </linearGradient>
        <linearGradient id="cGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a4a"/>
          <stop offset="100%" stopColor="#2a2a38"/>
        </linearGradient>
        <filter id="cBlur4"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <rect width="800" height="600" fill="url(#cSky)"/>
      {/* Moon */}
      <circle cx="680" cy="80" r="36" fill="#fff8e0" opacity="0.9"/>
      <circle cx="694" cy="72" r="30" fill="url(#cSky)" opacity="0.6"/>
      {/* Stars */}
      {[[80,60],[180,40],[300,30],[420,55],[540,25],[660,50],[150,110],[360,80],[500,100]].map(([sx,sy],i) => (
        <circle key={i} cx={sx} cy={sy} r="1.5" fill="white" opacity={0.6+Math.random()*0.3}/>
      ))}
      {/* Background glow */}
      <ellipse cx="400" cy="500" rx="450" ry="100" fill="#ffb030" opacity="0.12" filter="url(#cBlur4)"/>
      {/* Background buildings */}
      <g ref={bldgRef}>
        {bgBuildings.map((b,i) => (
          <g key={i}>
            <rect x={b.x} y={b.y-b.h} width={b.w} height={b.h} fill={b.c} opacity="0.75"/>
            {/* Windows */}
            {Array.from({length: Math.floor(b.h/22)}, (_, r) =>
              Array.from({length: Math.floor(b.w/14)}, (_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={b.x+4+c*14} y={b.y-b.h+6+r*22}
                  width="8" height="12" rx="1"
                  fill={Math.random()>0.4 ? '#fffaaa' : 'none'}
                  opacity={Math.random()>0.4 ? 0.6 : 0}
                />
              ))
            )}
          </g>
        ))}
      </g>
      {/* Foreground buildings */}
      <g ref={fgRef}>
        {fgBuildings.map((b,i) => (
          <g key={i}>
            <rect x={b.x} y={b.y-b.h} width={b.w} height={b.h} fill={b.c}/>
            {Array.from({length: Math.floor(b.h/20)}, (_, r) =>
              Array.from({length: Math.floor(b.w/16)}, (_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={b.x+4+c*16} y={b.y-b.h+5+r*20}
                  width="9" height="12" rx="1"
                  fill={Math.random()>0.5 ? '#ffe880' : '#fff4a0'}
                  opacity={Math.random()>0.5 ? 0.75 : 0.4}
                />
              ))
            )}
          </g>
        ))}
      </g>
      {/* Ground / road */}
      <rect x="0" y="520" width="800" height="80" fill="url(#cGround)"/>
      <rect x="0" y="540" width="800" height="4" fill="rgba(255,255,200,0.18)"/>
      {/* Road dashes */}
      {[40,120,200,280,360,440,520,600,680,760].map(x => (
        <rect key={x} x={x} y="560" width="40" height="4" rx="2" fill="rgba(255,255,200,0.3)"/>
      ))}
    </svg>
  );
}

/* ── Beach ───────────────────────────────────────────────────── */
function BeachBg() {
  const wave1Ref = useRef<SVGGElement>(null);
  const wave2Ref = useRef<SVGGElement>(null);
  const palmRef  = useRef<SVGGElement>(null);

  useEffect(() => {
    let ticking = false;
    const move = (e: MouseEvent | TouchEvent) => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth/2) : e.clientX;
        const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight/2) : e.clientY;
        const dx = cx/window.innerWidth-0.5, dy = cy/window.innerHeight-0.5;
        if (wave1Ref.current) wave1Ref.current.style.transform = `translate(${dx*14}px,${dy*4}px)`;
        if (wave2Ref.current) wave2Ref.current.style.transform = `translate(${dx*8}px,${dy*3}px)`;
        if (palmRef.current)  palmRef.current.style.transform  = `translate(${dx*6}px,${dy*3}px)`;
        ticking = false;
      });
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
  }, []);

  return (
    <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a88cc"/>
          <stop offset="50%" stopColor="#5ab8e8"/>
          <stop offset="80%" stopColor="#a8ddf0"/>
          <stop offset="100%" stopColor="#f0e8c0"/>
        </linearGradient>
        <linearGradient id="bSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a90c8"/>
          <stop offset="100%" stopColor="#0a5890"/>
        </linearGradient>
        <linearGradient id="bSand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d880"/>
          <stop offset="100%" stopColor="#d8c060"/>
        </linearGradient>
        <filter id="bBlur3"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="800" height="600" fill="url(#bSky)"/>
      {/* Sun */}
      <circle cx="650" cy="100" r="58" fill="#fff0a0" opacity="0.88"/>
      <circle cx="650" cy="100" r="40" fill="#fffce0" opacity="0.75"/>
      {/* Sun shimmer rays */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i) => (
        <line
          key={i}
          x1={650+Math.cos(deg*Math.PI/180)*62} y1={100+Math.sin(deg*Math.PI/180)*62}
          x2={650+Math.cos(deg*Math.PI/180)*82} y2={100+Math.sin(deg*Math.PI/180)*82}
          stroke="#ffe870" strokeWidth="2.5" opacity="0.5" strokeLinecap="round"
        />
      ))}
      {/* Ocean */}
      <rect x="0" y="320" width="800" height="180" fill="url(#bSea)"/>
      {/* Wave 2 (back) */}
      <g ref={wave2Ref} opacity="0.45">
        <path d="M-50,350 Q100,330 250,350 Q400,370 550,350 Q700,330 850,350 L850,370 L-50,370 Z" fill="#5ac8f0"/>
      </g>
      {/* Wave 1 (front) */}
      <g ref={wave1Ref} style={{ animation: 'cloudDrift 4s ease-in-out infinite alternate' }}>
        <path d="M-50,380 Q120,360 280,380 Q440,400 600,380 Q720,362 850,380 L850,402 L-50,402 Z" fill="rgba(255,255,255,0.55)"/>
      </g>
      {/* Sand */}
      <ellipse cx="400" cy="540" rx="520" ry="110" fill="url(#bSand)"/>
      <ellipse cx="400" cy="580" rx="520" ry="90" fill="#e8cc70"/>
      {/* Palm trees */}
      <g ref={palmRef}>
        {/* Left palm */}
        <g transform="translate(120,400)">
          <path d="M0,160 Q8,80 15,0" stroke="#6a4820" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <path d="M15,0 Q60,-30 90,-20 Q70,10 35,15 Z" fill="#38882a"/>
          <path d="M15,0 Q-30,-30 -50,-15 Q-30,10 10,18 Z" fill="#2d7a22"/>
          <path d="M15,0 Q30,-50 55,-50 Q40,-20 20,15 Z" fill="#44952e"/>
          <path d="M15,0 Q-20,-50 -35,-45 Q-18,-18 12,15 Z" fill="#38882a"/>
          <path d="M15,0 Q70,-15 80,5 Q55,20 22,15 Z" fill="#2d7a22"/>
        </g>
        {/* Right palm */}
        <g transform="translate(660,410)">
          <path d="M0,150 Q-6,75 -12,0" stroke="#6a4820" strokeWidth="9" fill="none" strokeLinecap="round"/>
          <path d="M-12,0 Q-60,-28 -85,-18 Q-65,12 -32,16 Z" fill="#38882a"/>
          <path d="M-12,0 Q30,-28 48,-14 Q28,12 -5,18 Z" fill="#2d7a22"/>
          <path d="M-12,0 Q-28,-48 -52,-48 Q-38,-18 -16,15 Z" fill="#44952e"/>
          <path d="M-12,0 Q18,-48 32,-42 Q16,-18 -8,15 Z" fill="#38882a"/>
        </g>
      </g>
      {/* Sailboat */}
      <g transform="translate(380,330)" opacity="0.7">
        <line x1="0" y1="0" x2="0" y2="-50" stroke="#8a6030" strokeWidth="2"/>
        <path d="M0,-48 L30,0 L0,0 Z" fill="white" opacity="0.85"/>
        <path d="M0,-48 L-22,0 L0,0 Z" fill="#f0e0c0" opacity="0.7"/>
        <rect x="-18" y="-2" width="36" height="6" rx="3" fill="#8a6030"/>
      </g>
      {/* Beach umbrella */}
      <g transform="translate(240,490)">
        <line x1="0" y1="0" x2="0" y2="-80" stroke="#8a3018" strokeWidth="4" strokeLinecap="round"/>
        <path d="M0,-78 Q-55,-58 -60,-40 Q-30,-55 0,-52 Q30,-55 60,-40 Q55,-58 0,-78 Z" fill="#e84820" opacity="0.85"/>
        <path d="M-60,-40 Q-30,-55 0,-52 Z" fill="#f05830" opacity="0.5"/>
      </g>
    </svg>
  );
}

  /* ── Mountain ────────────────────────────────────────────────── */
  function MountainBg() {
    const backRef = useRef<SVGGElement>(null);
    const midRef = useRef<SVGGElement>(null);
    const foreRef = useRef<SVGGElement>(null);
    useEffect(() => {
      let t = false;
      const mv = (e: MouseEvent | TouchEvent) => { if (t) return; t = true; requestAnimationFrame(() => {
        const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth/2) : e.clientX;
        const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight/2) : e.clientY;
        const dx = cx/window.innerWidth-0.5, dy = cy/window.innerHeight-0.5;
        if (backRef.current) backRef.current.style.transform = `translate(${dx*6}px,${dy*3}px)`;
        if (midRef.current)  midRef.current.style.transform  = `translate(${dx*10}px,${dy*4}px)`;
        if (foreRef.current) foreRef.current.style.transform = `translate(${dx*14}px,${dy*6}px)`;
        t = false;
      }); };
      window.addEventListener('mousemove', mv); window.addEventListener('touchmove', mv, { passive: true });
      return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('touchmove', mv); };
    }, []);

    return (
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8fb4d8"/><stop offset="100%" stopColor="#e8f4ff"/></linearGradient>
          <linearGradient id="mMtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dfe8f0"/><stop offset="100%" stopColor="#9aa8b8"/></linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#mSky)"/>
        <g ref={backRef} opacity="0.9">
          <polygon points="0,420 120,200 260,380 400,160 540,380 680,220 800,420" fill="#cfdce6"/>
        </g>
        <g ref={midRef} opacity="0.95">
          <polygon points="0,480 160,260 320,460 480,240 640,460 800,300" fill="url(#mMtn)"/>
        </g>
        <g ref={foreRef}>
          <ellipse cx="400" cy="610" rx="520" ry="130" fill="#f6fbff"/>
          <g transform="translate(80,420)" fill="#2f4a34" opacity="0.9">
            <rect x="0" y="70" width="10" height="40" rx="3"/>
            <polygon points="5,0 -25,80 35,80"/>
          </g>
        </g>
      </svg>
    );
  }

  /* ── Lake ────────────────────────────────────────────────────── */
  function LakeBg() {
    const waterRef = useRef<SVGGElement>(null);
    const cloudRef = useRef<SVGGElement>(null);
    useEffect(() => {
      let t=false; const mv=(e:MouseEvent|TouchEvent)=>{ if(t) return; t=true; requestAnimationFrame(()=>{ const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth/2) : e.clientX; const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight/2) : e.clientY; const dx=cx/window.innerWidth-0.5, dy=cy/window.innerHeight-0.5; if(waterRef.current) waterRef.current.style.transform = `translate(${dx*10}px,${dy*6}px)`; if(cloudRef.current) cloudRef.current.style.transform = `translate(${dx*6}px,${dy*3}px)`; t=false; }); };
      window.addEventListener('mousemove', mv); window.addEventListener('touchmove', mv, { passive:true });
      return ()=>{ window.removeEventListener('mousemove', mv); window.removeEventListener('touchmove', mv); };
    }, []);

    return (
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9ecbe8"/><stop offset="100%" stopColor="#e8f7ff"/></linearGradient>
          <linearGradient id="lWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2aa0d8"/><stop offset="100%" stopColor="#1a6f98"/></linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#lSky)"/>
        <g ref={cloudRef} style={{ animation: 'cloudDrift 12s ease-in-out infinite alternate' }}>
          <ellipse cx="140" cy="100" rx="70" ry="22" fill="white" opacity="0.8"/>
        </g>
        <g>
          <rect x="0" y="320" width="800" height="220" fill="url(#lWater)"/>
          <g ref={waterRef} opacity="0.6">
            <ellipse cx="400" cy="520" rx="520" ry="120" fill="#1a85b8"/>
          </g>
        </g>
        <g>
          <path d="M0,360 C120,340 260,380 400,360 C540,340 680,380 800,360 L800,600 L0,600 Z" fill="#cfeaf8" opacity="0.6"/>
        </g>
      </svg>
    );
  }

  /* ── Snow ────────────────────────────────────────────────────── */
  function SnowBg() {
    const flakesRef = useRef<SVGGElement>(null);
    useEffect(()=>{
      let t=false; const mv=(e:MouseEvent|TouchEvent)=>{ if(t) return; t=true; requestAnimationFrame(()=>{ const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth/2) : e.clientX; const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight/2) : e.clientY; const dx=cx/window.innerWidth-0.5, dy=cy/window.innerHeight-0.5; if(flakesRef.current) flakesRef.current.style.transform = `translate(${dx*8}px,${dy*4}px)`; t=false; }); };
      window.addEventListener('mousemove', mv); window.addEventListener('touchmove', mv, { passive:true });
      return ()=>{ window.removeEventListener('mousemove', mv); window.removeEventListener('touchmove', mv); };
    }, []);

    return (
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cfe6ff"/><stop offset="100%" stopColor="#f8fbff"/></linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#sSky)"/>
        <g ref={flakesRef} opacity="0.9">
          {Array.from({length:60}).map((_,i)=>{
            const x = Math.floor(Math.random()*820)-10, y = Math.floor(Math.random()*620)-20, r = 1+Math.random()*2.5;
            return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={0.8}/>;
          })}
        </g>
        <g>
          <polygon points="0,480 140,260 300,420 450,240 600,420 740,280 800,480" fill="#e6eef6"/>
          <ellipse cx="400" cy="620" rx="520" ry="110" fill="#ffffff"/>
        </g>
      </svg>
    );
  }

  /* ── Space ───────────────────────────────────────────────────── */
  function SpaceBg() {
    const starsRef = useRef<SVGGElement>(null);
    useEffect(()=>{
      let t=false; const mv=(e:MouseEvent|TouchEvent)=>{ if(t) return; t=true; requestAnimationFrame(()=>{ const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth/2) : e.clientX; const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight/2) : e.clientY; const dx=cx/window.innerWidth-0.5, dy=cy/window.innerHeight-0.5; if(starsRef.current) starsRef.current.style.transform = `translate(${dx*4}px,${dy*2}px)`; t=false; }); };
      window.addEventListener('mousemove', mv); window.addEventListener('touchmove', mv, { passive:true });
      return ()=>{ window.removeEventListener('mousemove', mv); window.removeEventListener('touchmove', mv); };
    }, []);

    return (
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#050814"/>
        <g ref={starsRef}>
          {Array.from({length:120}).map((_,i)=>{
            const x = Math.floor(Math.random()*800), y = Math.floor(Math.random()*600), r = Math.random()*1.6;
            return <circle key={i} cx={x} cy={y} r={r} fill={Math.random()>0.6? '#ffd8b0' : '#cfe8ff'} opacity={0.8}/>;
          })}
        </g>
        <g>
          <circle cx="640" cy="120" r="70" fill="#ffd8b0" opacity="0.12"/>
        </g>
      </svg>
    );
  }

  /* ── Sunset ─────────────────────────────────────────────────── */
  function SunsetBg() {
    const refA = useRef<SVGGElement>(null);
    useEffect(()=>{ let t=false; const mv=(e:MouseEvent|TouchEvent)=>{ if(t) return; t=true; requestAnimationFrame(()=>{ const cx = e instanceof TouchEvent ? (e.touches[0]?.clientX ?? window.innerWidth/2) : e.clientX; const cy = e instanceof TouchEvent ? (e.touches[0]?.clientY ?? window.innerHeight/2) : e.clientY; const dx=cx/window.innerWidth-0.5, dy=cy/window.innerHeight-0.5; if(refA.current) refA.current.style.transform = `translate(${dx*10}px,${dy*5}px)`; t=false; }); };
      window.addEventListener('mousemove', mv); window.addEventListener('touchmove', mv, { passive:true });
      return ()=>{ window.removeEventListener('mousemove', mv); window.removeEventListener('touchmove', mv); };
    }, []);

    return (
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="suSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffb07a"/><stop offset="60%" stopColor="#ff7a90"/><stop offset="100%" stopColor="#5a2a6a"/></linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#suSky)"/>
        <g ref={refA}>
          <circle cx="420" cy="340" r="140" fill="#ffd890" opacity="0.9"/>
          <ellipse cx="400" cy="620" rx="500" ry="120" fill="#2a0a2a" opacity="0.12"/>
        </g>
      </svg>
    );
  }

/* ── Selector ────────────────────────────────────────────────── */
export default function BackgroundScene({ theme = 'desert' }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {theme === 'desert' && <DesertBg />}
      {theme === 'nature' && <NatureBg />}
      {theme === 'city'   && <CityBg />}
      {theme === 'beach'  && <BeachBg />}
      {theme === 'mountain' && <MountainBg />}
      {theme === 'lake' && <LakeBg />}
      {theme === 'snow' && <SnowBg />}
      {theme === 'space' && <SpaceBg />}
      {theme === 'sunset' && <SunsetBg />}
    </div>
  );
}
