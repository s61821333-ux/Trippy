'use client';

import React, { useEffect, useRef } from 'react';

export default function DesertScene() {
  const cloud1Ref = useRef<SVGGElement>(null);
  const cloud2Ref = useRef<SVGGElement>(null);
  const midRef    = useRef<SVGGElement>(null);
  const fgRef     = useRef<SVGGElement>(null);
  const rocksRef  = useRef<SVGGElement>(null);
  const sunRef    = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        let cx: number, cy: number;
        if (e instanceof TouchEvent) {
          cx = e.touches[0]?.clientX ?? window.innerWidth / 2;
          cy = e.touches[0]?.clientY ?? window.innerHeight / 2;
        } else {
          cx = (e as MouseEvent).clientX;
          cy = (e as MouseEvent).clientY;
        }
        const dx = (cx / window.innerWidth  - 0.5);
        const dy = (cy / window.innerHeight - 0.5);
        if (cloud1Ref.current) cloud1Ref.current.style.transform = `translate(${dx * 18}px,${dy * 6}px)`;
        if (cloud2Ref.current) cloud2Ref.current.style.transform = `translate(${dx * 10}px,${dy * 4}px)`;
        if (midRef.current)    midRef.current.style.transform    = `translate(${dx * 6}px,${dy * 3}px)`;
        if (fgRef.current)     fgRef.current.style.transform     = `translate(${dx * 12}px,${dy * 5}px)`;
        if (rocksRef.current)  rocksRef.current.style.transform  = `translate(${dx * 4}px,${dy * 2}px)`;
        if (sunRef.current)    sunRef.current.style.transform    = `translate(${dx * 8}px,${dy * 5}px)`;
        ticking = false;
      });
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#a8d4f0"/>
            <stop offset="45%"  stopColor="#d8eefc"/>
            <stop offset="75%"  stopColor="#f0e0c0"/>
            <stop offset="100%" stopColor="#e8c888"/>
          </linearGradient>
          <linearGradient id="dg1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d4a85a"/>
            <stop offset="100%" stopColor="#b8843a"/>
          </linearGradient>
          <linearGradient id="dg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e8c070"/>
            <stop offset="100%" stopColor="#c8943e"/>
          </linearGradient>
          <linearGradient id="dg3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f0d090"/>
            <stop offset="100%" stopColor="#d4a85a"/>
          </linearGradient>
          <linearGradient id="rockGrad" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%"   stopColor="#c09050"/>
            <stop offset="100%" stopColor="#8a6030"/>
          </linearGradient>
          <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
          <filter id="blur5"><feGaussianBlur stdDeviation="5"/></filter>
        </defs>

        {/* Sky */}
        <rect width="800" height="600" fill="url(#skyGrad)"/>

        {/* Sun */}
        <circle ref={sunRef} cx="620" cy="110" r="52" fill="#ffe080" opacity="0.82"/>
        <circle cx="620" cy="110" r="42" fill="#fff4a0" opacity="0.6"/>
        <circle cx="620" cy="110" r="30" fill="#fffbe0" opacity="0.85"/>

        {/* Clouds */}
        <g ref={cloud1Ref} style={{ animation: 'cloudDrift 9s ease-in-out infinite alternate' }}>
          <ellipse cx="140" cy="100" rx="70" ry="24" fill="white" opacity="0.78" filter="url(#blur2)"/>
          <ellipse cx="110" cy="108" rx="40" ry="16" fill="white" opacity="0.6"  filter="url(#blur2)"/>
          <ellipse cx="175" cy="106" rx="45" ry="14" fill="white" opacity="0.6"  filter="url(#blur2)"/>
        </g>
        <g ref={cloud2Ref} style={{ animation: 'cloudDrift 12s ease-in-out infinite alternate-reverse' }}>
          <ellipse cx="460" cy="70" rx="55" ry="18" fill="white" opacity="0.55" filter="url(#blur2)"/>
          <ellipse cx="435" cy="76" rx="30" ry="12" fill="white" opacity="0.4"  filter="url(#blur2)"/>
        </g>

        {/* Far mountains */}
        <g opacity="0.45" filter="url(#blur5)">
          <polygon points="0,380 80,240 160,320 240,200 320,310 400,230 480,290 560,210 640,280 720,220 800,270 800,380" fill="#b09060"/>
        </g>

        {/* Mid dunes */}
        <g ref={midRef}>
          <ellipse cx="-20"  cy="490" rx="200" ry="80"  fill="url(#dg1)"/>
          <ellipse cx="220"  cy="510" rx="240" ry="90"  fill="url(#dg2)"/>
          <ellipse cx="520"  cy="495" rx="220" ry="85"  fill="url(#dg1)"/>
          <ellipse cx="780"  cy="505" rx="180" ry="78"  fill="url(#dg2)"/>
        </g>

        {/* Foreground dunes */}
        <g ref={fgRef}>
          <ellipse cx="50"  cy="580" rx="200" ry="100" fill="url(#dg3)"/>
          <ellipse cx="310" cy="595" rx="260" ry="110" fill="url(#dg3)"/>
          <ellipse cx="620" cy="585" rx="240" ry="100" fill="url(#dg3)"/>
          <ellipse cx="850" cy="590" rx="200" ry="95"  fill="url(#dg3)"/>
        </g>

        {/* Rock formations */}
        <g ref={rocksRef}>
          <polygon points="680,450 700,360 730,340 760,355 780,450" fill="url(#rockGrad)"/>
          <polygon points="700,450 715,380 740,365 760,380 775,450" fill="#a07840" opacity="0.7"/>
          <polygon points="60,460  80,390  100,375 125,388 140,460" fill="url(#rockGrad)"/>
          <polygon points="75,460  90,400 108,385 128,398 142,460" fill="#a07840" opacity="0.6"/>
        </g>

        {/* Cactus */}
        <g fill="#6a8a4a" opacity="0.7">
          <rect x="350" y="430" width="6" height="40" rx="3"/>
          <rect x="334" y="442" width="22" height="5" rx="2.5"/>
          <rect x="328" y="436" width="6" height="18" rx="3"/>
          <rect x="350" y="442" width="22" height="5" rx="2.5"/>
          <rect x="366" y="436" width="6" height="18" rx="3"/>
        </g>

        {/* Heat shimmer */}
        <rect x="0" y="340" width="800" height="18" fill="url(#skyGrad)" opacity="0.3" filter="url(#blur5)"/>
      </svg>
    </div>
  );
}
