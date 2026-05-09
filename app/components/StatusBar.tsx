'use client';

import React, { useEffect, useState } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = () => {
      const n = new Date();
      return `${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`;
    };
    setTime(fmt());
    const iv = setInterval(() => setTime(fmt()), 30000);
    return () => clearInterval(iv);
  }, []);

  const ink = 'rgba(28,18,8,0.80)';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 52,
      zIndex: 50, pointerEvents: 'none',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '0 22px 7px',
      color: ink, fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: 13, fontWeight: 600,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {/* Signal bars */}
        <svg width="16" height="11" viewBox="0 0 16 11">
          {[0, 1, 2, 3].map(i => (
            <rect key={i} x={i * 4.2} y={11 - (i + 1) * 2.8} width="2.8" height={(i + 1) * 2.8} rx="0.6" fill={ink}/>
          ))}
        </svg>
        {/* Wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11">
          <path d="M7.5 7.8a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fill={ink}/>
          <path d="M3.8 5.3a5.3 5.3 0 017.4 0" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M1 2.6a9.3 9.3 0 0113 0" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {/* Battery */}
        <svg width="24" height="12" viewBox="0 0 24 12">
          <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke={ink} strokeOpacity="0.4" fill="none"/>
          <rect x="2" y="2" width="13" height="8" rx="2" fill={ink}/>
          <path d="M22 4v4c.8-.3 1.5-1.2 1.5-2s-.7-1.7-1.5-2z" fill={ink} fillOpacity="0.35"/>
        </svg>
      </div>
    </div>
  );
}
