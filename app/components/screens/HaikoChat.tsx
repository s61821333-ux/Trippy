'use client';

import React, { useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';

interface Msg { role: 'user' | 'assistant'; content: string }

const STARTERS_EN: { label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { label: 'Best local food?',     icon: 'fork'    },
  { label: 'How to get around?',   icon: 'plane'   },
  { label: 'Hidden gems nearby?',  icon: 'compass' },
  { label: 'Worth booking ahead?', icon: 'ticket'  },
  { label: 'Budget tips?',         icon: 'coins'   },
];
const STARTERS_HE: { label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { label: 'האוכל המקומי הכי טוב?', icon: 'fork'    },
  { label: 'איך מתניידים?',          icon: 'plane'   },
  { label: 'פנינים נסתרות?',         icon: 'compass' },
  { label: 'מה כדאי להזמין מראש?',  icon: 'ticket'  },
  { label: 'טיפים לתקציב?',         icon: 'coins'   },
];

export default function HaikoChat({ onClose }: { onClose: () => void }) {
  const { locale } = useI18n();
  const isHe = locale === 'he';
  const trip      = useAppStore(s => s.trip);
  const activeDay = useAppStore(s => s.activeDay);

  const dayMeta    = trip?.dayMeta?.[activeDay - 1];
  const sleepHotel = (trip?.hotels ?? []).find(h => h.checkInDay <= activeDay && activeDay < h.checkOutDay);
  const city       = dayMeta?.region || sleepHotel?.location || trip?.countries?.[0] || '';

  const greeting = isHe
    ? `שלום! אני Haiko 👋\n\nאני כאן כדי לעזור לכם עם הטיול.${city ? ` יש שאלות על ${city}?` : ' יש שאלות?'} שאלו על אוכל, תחבורה, מה לא לפספס, מה כדאי להזמין מראש — הכל.`
    : `Hey! I'm Haiko 👋\n\nYour travel helper from Trippy.${city ? ` Got questions about your time in ${city}?` : ' Got questions about your trip?'} Ask me about food, getting around, what not to miss, what to book ahead — anything.`;

  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: greeting }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    setError('');
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    inputRef.current?.focus();
    setLoading(true);
    try {
      const res  = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          messages: next.filter((m, i) => !(i === 0 && m.role === 'assistant')).map(m => ({ role: m.role, content: m.content })),
          context: {
            tripName:   trip?.name,
            countries:  trip?.countries,
            days:       trip?.days,
            currentDay: activeDay,
            city,
          },
        }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(isHe ? 'משהו השתבש. אנא נסו שוב.' : 'Something went wrong. Please try again.');
      } else {
        setMessages(m => [...m, { role: 'assistant', content: data.reply! }]);
      }
    } catch {
      setError(isHe ? 'אין חיבור. אנא נסו שוב.' : 'No connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const starters = isHe ? STARTERS_HE : STARTERS_EN;
  const showStarters = messages.length === 1 && !loading;
  const canSend = input.trim().length > 0 && !loading;

  return (
    <Sheet
      title={isHe ? 'שאלו את Haiko' : 'Ask Haiko'}
      subtitle={city
        ? (isHe ? `עוזר הטיול שלך · ${city}` : `Travel helper · ${city}`)
        : (isHe ? 'עוזר הטיול שלך' : 'Your travel helper')}
      onClose={onClose}
    >

      <div style={{ display: 'flex', flexDirection: 'column', height: 'min(62vh, 560px)' }}>

        {/* ── Messages ── */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label={isHe ? 'שיחה עם Haiko' : 'Chat with Haiko'}
          className="lg-scroll"
          style={{
            flex: 1, overflowY: 'auto', overscrollBehavior: 'contain',
            display: 'flex', flexDirection: 'column', gap: 12,
            padding: '4px 0 8px',
          }}
        >
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={i}
                className="haiko-msg"
                style={{
                  display: 'flex', alignItems: 'flex-end', gap: 8,
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  animationDelay: `${i === messages.length - 1 ? 0 : 0}ms`,
                }}
              >
                {!isUser && (
                  <div style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 10,
                    background: 'linear-gradient(145deg, var(--lg-terra-bright), var(--lg-terra))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 2,
                    boxShadow: '0 3px 10px oklch(65% 0.18 40 / 28%)',
                  }}>
                    <Icon name="ai" size={16} color="#fff" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '78%',
                    padding: isUser ? '10px 15px' : '11px 14px',
                    borderRadius: 18,
                    borderBottomRightRadius: isUser ? 4 : 18,
                    borderBottomLeftRadius:  isUser ? 18 : 4,
                    background: isUser
                      ? 'linear-gradient(155deg, var(--lg-terra-bright), var(--lg-terra))'
                      : 'var(--lg-panel)',
                    color: isUser ? '#fff' : 'var(--lg-ink)',
                    boxShadow: isUser
                      ? '0 4px 18px oklch(65% 0.18 40 / 28%), 0 1px 4px oklch(0% 0 0 / 10%)'
                      : '0 2px 8px oklch(0% 0 0 / 8%)',
                    fontSize: 14.5,
                    lineHeight: 1.58,
                    whiteSpace: 'pre-wrap',
                    letterSpacing: '-0.005em',
                  }}
                  dir="auto"
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="haiko-msg" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(145deg, var(--lg-terra-bright), var(--lg-terra))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 2,
                boxShadow: '0 3px 10px oklch(65% 0.18 40 / 28%)',
              }}>
                <Icon name="ai" size={16} color="#fff" />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '13px 16px', borderRadius: 18, borderBottomLeftRadius: 4,
                background: 'var(--lg-panel)',
                boxShadow: '0 2px 8px oklch(0% 0 0 / 8%)',
              }}>
                {[0, 1, 2].map(d => (
                  <span
                    key={d}
                    style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--lg-terra)',
                      display: 'block',
                      animation: `haikoDot 1.4s ${d * 0.16}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <m.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            style={{
              fontSize: 12.5, color: 'var(--danger)', textAlign: 'center',
              margin: '4px 0 2px', fontWeight: 500,
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--danger-bg)',
            }}
          >
            {error}
          </m.p>
        )}

        {/* ── Starter chips ── */}
        <AnimatePresence>
          {showStarters && (
            <m.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.22 }}
              className="lg-scroll"
              style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '8px 0 10px', overscrollBehavior: 'contain' }}
            >
              {starters.map((s, idx) => (
                <m.button
                  key={s.label}
                  className="haiko-chip"
                  onClick={() => send(s.label)}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 13px', borderRadius: 9999, cursor: 'pointer',
                    border: '1px solid oklch(from var(--lg-terra) l c h / 25%)',
                    background: 'oklch(from var(--lg-terra) l c h / 9%)',
                    color: 'var(--terra-text)',
                    fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600,
                    whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
                    transition: 'background .15s, transform .12s',
                  }}
                >
                  <Icon name={s.icon} size={12} color="var(--terra-text)" />
                  {s.label}
                </m.button>
              ))}
            </m.div>
          )}
        </AnimatePresence>

        {/* ── Composer ── */}
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          paddingTop: 10,
          borderTop: '1px solid oklch(50% 0.02 60 / 8%)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            rows={1}
            placeholder={isHe ? 'שאלו כל דבר על הטיול…' : 'Ask anything about your trip…'}
            dir="auto"
            aria-label={isHe ? 'הודעה לHaiko' : 'Message Haiko'}
            className="haiko-input"
            style={{
              flex: 1, resize: 'none', maxHeight: 100, minHeight: 44,
              background: 'var(--field-bg)', border: 'none', borderRadius: 22,
              padding: '11px 16px', fontSize: 15, color: 'var(--text)', outline: 'none',
              fontFamily: 'var(--font-sans)', lineHeight: 1.4,
              boxShadow: 'inset 0 0 0 1.5px var(--field-border)',
              transition: 'box-shadow .2s',
            }}
          />
          <m.button
            onClick={() => send(input)}
            disabled={!canSend}
            aria-label={isHe ? 'שלח הודעה' : 'Send message'}
            className="haiko-send"
            whileTap={canSend ? { scale: 0.90 } : {}}
            style={{
              height: 44, width: 44, flexShrink: 0, border: 0, borderRadius: '50%',
              background: canSend
                ? 'linear-gradient(155deg, var(--lg-terra-bright), var(--lg-terra))'
                : 'var(--lg-panel)',
              boxShadow: canSend
                ? '0 4px 18px oklch(65% 0.18 40 / 32%)'
                : 'var(--shadow-xs)',
              cursor: canSend ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s, box-shadow .2s, filter .12s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon
              name="send"
              size={18}
              color={canSend ? '#fff' : 'var(--text-3)'}
              style={{ transform: isHe ? 'scaleX(-1)' : 'none', marginInlineEnd: -2 }}
            />
          </m.button>
        </div>
      </div>
    </Sheet>
  );
}
