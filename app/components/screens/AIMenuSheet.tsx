'use client';

import React from 'react';
import { m } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';

export default function AIMenuSheet({ onClose, onAsk, onFind }: {
  onClose: () => void;
  onAsk: () => void;
  onFind: () => void;
}) {
  const { locale } = useI18n();
  const isHe = locale === 'he';

  const cards: {
    key: 'ask' | 'find';
    icon: Parameters<typeof Icon>[0]['name'];
    badge: string;
    title: string;
    desc: string;
    hint: string;
    onClick: () => void;
    grad: string;
    glow: string;
    orb: string;
  }[] = [
    {
      key: 'ask',
      icon: 'ai',
      badge: 'HAIKO AI',
      title: isHe ? 'שאלו את Haiko' : 'Chat with Haiko',
      desc: isHe ? 'אוכל, תחבורה, מה לא לפספס — שאלו כל דבר על הטיול' : 'Food, getting around, what not to miss — ask anything about your trip',
      hint: isHe ? 'עונה תוך שניות' : 'Answers in seconds',
      onClick: onAsk,
      grad: 'linear-gradient(145deg, var(--lg-terra-bright) 0%, var(--lg-terra) 60%, oklch(55% 0.155 30) 100%)',
      glow: '0 8px 32px oklch(65% 0.180 40 / 35%)',
      orb: 'oklch(75% 0.200 44 / 22%)',
    },
    {
      key: 'find',
      icon: 'sparkle',
      badge: isHe ? 'גילוי' : 'DISCOVER',
      title: isHe ? 'גלו אטרקציות מקומיות' : 'Discover local spots',
      desc: isHe ? 'מסעדות, אטרקציות ופעילויות — מסוננות ליום הנוכחי' : 'Restaurants, sights and things to do — matched to today\'s day',
      hint: isHe ? 'לפי המיקום של היום' : 'Based on where you are today',
      onClick: onFind,
      grad: 'linear-gradient(145deg, var(--lg-forest) 0%, var(--lg-forest-deep) 100%)',
      glow: '0 8px 32px oklch(50% 0.130 155 / 30%)',
      orb: 'oklch(60% 0.120 155 / 20%)',
    },
  ];

  return (
    <Sheet
      title={isHe ? 'שאלו את Haiko' : 'Ask Haiko'}
      subtitle={isHe ? 'מה תרצו לדעת?' : 'What do you want to know?'}
      onClose={onClose}
    >
      {/* Ambient orb behind content */}
      <div aria-hidden style={{
        position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
        width: 280, height: 140, borderRadius: '50%',
        background: 'radial-gradient(ellipse, oklch(65% 0.170 40 / 10%) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0 8px', position: 'relative' }}>
        {cards.map((c, idx) => (
          <m.button
            key={c.key}
            onClick={c.onClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.975 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 0,
              width: '100%', border: 0, cursor: 'pointer',
              borderRadius: 22, overflow: 'hidden', position: 'relative',
              background: c.grad, boxShadow: c.glow,
              WebkitTapHighlightColor: 'transparent', textAlign: 'start',
              padding: 0,
            }}
          >
            {/* Orb highlight inside card */}
            <div aria-hidden style={{
              position: 'absolute', top: -20, right: -20, width: 120, height: 120,
              borderRadius: '50%', background: c.orb, pointerEvents: 'none',
            }} />

            {/* Icon column */}
            <div style={{
              width: 80, flexShrink: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '20px 0',
              borderInlineEnd: '1px solid rgba(255,255,255,0.12)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}>
                <Icon name={c.icon} size={22} color="#fff" />
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.10em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)', fontWeight: 600,
              }}>
                {c.badge}
              </span>
            </div>

            {/* Text column */}
            <div style={{ flex: 1, minWidth: 0, padding: '18px 16px 18px 18px' }}>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 800,
                letterSpacing: '-0.015em', color: '#fff', marginBottom: 5,
                lineHeight: 1.1,
              }}>
                {c.title}
              </div>
              <div style={{
                fontSize: 12.5, color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.45, marginBottom: 10,
              }}>
                {c.desc}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.14)',
                borderRadius: 9999, padding: '3px 10px',
                fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(4px)',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'inline-block' }} />
                {c.hint}
              </div>
            </div>

            {/* Chevron */}
            <div style={{ paddingInlineEnd: 16, paddingInlineStart: 4, flexShrink: 0 }}>
              <Icon name={isHe ? 'chevL' : 'chevR'} size={16} color="rgba(255,255,255,0.55)" />
            </div>
          </m.button>
        ))}

        {/* Powered-by footer */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            paddingTop: 6,
          }}
        >
          <Icon name="sparkle" size={11} color="var(--text-3)" />
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            {isHe ? 'מופעל על-ידי Claude AI' : 'Powered by Claude AI'}
          </span>
        </m.div>
      </div>
    </Sheet>
  );
}
