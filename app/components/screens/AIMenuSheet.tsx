'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';

// The AI entry point: two clear modes — Ask (Haiko chatbot) and Find (discovery).
export default function AIMenuSheet({ onClose, onAsk, onFind }: {
  onClose: () => void;
  onAsk: () => void;
  onFind: () => void;
}) {
  const { locale } = useI18n();
  const isHe = locale === 'he';

  const cards: { key: 'ask' | 'find'; icon: Parameters<typeof Icon>[0]['name']; title: string; desc: string; onClick: () => void; grad: string; glow: string }[] = [
    {
      key: 'ask',
      icon: 'ai',
      title: isHe ? 'לשאול' : 'Ask',
      desc: isHe ? 'שיחה עם Haiko — שאלו כל דבר על הטיול' : 'Chat with Haiko — anything about your trip',
      onClick: onAsk,
      grad: 'linear-gradient(135deg, var(--lg-terra-bright), var(--lg-terra))',
      glow: 'var(--lg-glow-terra)',
    },
    {
      key: 'find',
      icon: 'sparkle',
      title: isHe ? 'לגלות' : 'Find',
      desc: isHe ? 'גלו מקומות ופעילויות מותאמים ליום' : 'Discover places & experiences for your day',
      onClick: onFind,
      grad: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))',
      glow: 'var(--lg-glow-forest)',
    },
  ];

  return (
    <Sheet
      title={isHe ? 'עוזר ה-AI' : 'AI assistant'}
      subtitle={isHe ? 'איך אפשר לעזור?' : 'How can I help?'}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0 12px' }}>
        {cards.map(c => (
          <button
            key={c.key}
            onClick={c.onClick}
            className="lg"
            style={{
              display: 'flex', alignItems: 'center', gap: 16, width: '100%',
              padding: 18, border: 0, cursor: 'pointer', textAlign: 'start',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: c.grad, boxShadow: c.glow,
            }}>
              <Icon name={c.icon} size={24} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--lg-ink)' }}>
                {c.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.4 }}>
                {c.desc}
              </div>
            </div>
            <Icon name={isHe ? 'chevL' : 'chevR'} size={18} color="var(--text-3)" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </Sheet>
  );
}
