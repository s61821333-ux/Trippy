'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';

interface Msg { role: 'user' | 'assistant'; content: string }

const STARTERS_EN = [
  "Best local food here?",
  "How do I get around?",
  "Hidden gems nearby?",
  "What's worth booking ahead?",
];
const STARTERS_HE = [
  'האוכל המקומי הכי טוב?',
  'איך מתניידים?',
  'פנינים נסתרות בסביבה?',
  'מה כדאי להזמין מראש?',
];

export default function HaikoChat({ onClose }: { onClose: () => void }) {
  const { locale } = useI18n();
  const isHe = locale === 'he';
  const trip = useAppStore(s => s.trip);
  const activeDay = useAppStore(s => s.activeDay);

  const greeting = isHe
    ? 'היי, אני Haiko 🌍 שאלו אותי כל דבר על הטיול — אוכל, מקומות, תחבורה, תקציב…'
    : "Hi, I'm Haiko 🌍 Ask me anything about your trip — food, places, transport, budget…";

  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const dayMeta = trip?.dayMeta?.[activeDay - 1];
  const sleepHotel = (trip?.hotels ?? []).find(h => h.checkInDay <= activeDay && activeDay < h.checkOutDay);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    setError('');
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          // Drop the canned greeting before sending to the model.
          messages: next.filter((m, i) => !(i === 0 && m.role === 'assistant')).map(m => ({ role: m.role, content: m.content })),
          context: {
            tripName: trip?.name,
            countries: trip?.countries,
            days: trip?.days,
            currentDay: activeDay,
            city: dayMeta?.region || sleepHotel?.location || trip?.countries?.[0],
          },
        }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(isHe ? 'משהו השתבש — נסו שוב' : 'Something went wrong — try again');
      } else {
        setMessages(m => [...m, { role: 'assistant', content: data.reply! }]);
      }
    } catch {
      setError(isHe ? 'אין חיבור — נסו שוב' : 'No connection — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      title={isHe ? 'שאלו את Haiko' : 'Ask Haiko'}
      subtitle={isHe ? 'בן הלוויה החכם לטיול' : 'Your AI travel companion'}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: 'min(64vh, 560px)' }}>
        {/* Messages */}
        <div
          ref={scrollRef}
          className="lg-scroll"
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 2px 8px' }}
        >
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isUser ? 'row-reverse' : 'row' }}>
                {!isUser && <StampIcon iconKey="compass" size={34} style={{ flexShrink: 0 }} aria-hidden="true" />}
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '10px 14px',
                    borderRadius: 18,
                    borderBottomRightRadius: isUser ? 6 : 18,
                    borderBottomLeftRadius: isUser ? 18 : 6,
                    background: isUser ? 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))' : 'var(--lg-panel)',
                    color: isUser ? '#fff' : 'var(--lg-ink)',
                    boxShadow: isUser ? 'var(--lg-glow-terra)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                  dir="auto"
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <StampIcon iconKey="compass" size={34} style={{ flexShrink: 0 }} aria-hidden="true" />
              <div style={{ display: 'flex', gap: 4, padding: '14px 16px', borderRadius: 18, borderBottomLeftRadius: 6, background: 'var(--lg-panel)', boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)' }}>
                <style>{`@keyframes haikoDot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}`}</style>
                {[0, 1, 2].map(d => (
                  <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lg-terra)', animation: `haikoDot 1.2s ${d * 0.15}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p style={{ fontSize: 12, color: 'var(--danger)', textAlign: 'center', margin: '4px 0' }}>{error}</p>
        )}

        {/* Suggested starter questions — shown until the user asks something */}
        {messages.length === 1 && !loading && (
          <div className="lg-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '6px 0 10px' }}>
            {(isHe ? STARTERS_HE : STARTERS_EN).map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                style={{
                  flexShrink: 0, padding: '7px 13px', borderRadius: 9999, cursor: 'pointer',
                  border: '1px solid var(--lg-terra)', background: 'var(--terra-muted)',
                  color: 'var(--terra-text)', fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600,
                  whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 8, borderTop: '1px solid oklch(50% 0.02 60 / 12%)' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            rows={1}
            placeholder={isHe ? 'כתבו הודעה…' : 'Type a message…'}
            dir="auto"
            style={{
              flex: 1, resize: 'none', maxHeight: 96, minHeight: 44,
              background: 'var(--field-bg)', border: 'none', borderRadius: 14,
              padding: '11px 14px', fontSize: 16, color: 'var(--text)', outline: 'none',
              fontFamily: 'var(--font-sans)', lineHeight: 1.4,
              boxShadow: 'inset 0 0 0 1px var(--field-border)',
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            aria-label={isHe ? 'שלח' : 'Send'}
            style={{
              height: 44, width: 44, flexShrink: 0, border: 0, borderRadius: 14,
              background: input.trim() && !loading ? 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))' : 'var(--lg-panel)',
              boxShadow: input.trim() && !loading ? 'var(--lg-glow-terra)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="arrow" size={20} color={input.trim() && !loading ? '#fff' : 'var(--text-3)'} style={{ transform: isHe ? 'scaleX(-1) rotate(-90deg)' : 'rotate(-90deg)' }} />
          </button>
        </div>
      </div>
    </Sheet>
  );
}
