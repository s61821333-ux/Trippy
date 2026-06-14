'use client';

import React, { useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';

interface Msg { role: 'user' | 'assistant'; content: string }

const STARTERS_EN: { label: string; icon: string }[] = [
  { label: 'Best local food?',       icon: 'fork'    },
  { label: 'How to get around?',     icon: 'plane'   },
  { label: 'Hidden gems nearby?',    icon: 'compass' },
  { label: 'Worth booking ahead?',   icon: 'ticket'  },
  { label: 'Budget tips?',           icon: 'coins'   },
];
const STARTERS_HE: { label: string; icon: string }[] = [
  { label: 'האוכל המקומי הכי טוב?', icon: 'fork'    },
  { label: 'איך מתניידים?',          icon: 'plane'   },
  { label: 'פנינים נסתרות בסביבה?', icon: 'compass' },
  { label: 'מה כדאי להזמין מראש?',  icon: 'ticket'  },
  { label: 'טיפים לתקציב?',         icon: 'coins'   },
];

export default function HaikoChat({ onClose }: { onClose: () => void }) {
  const { locale } = useI18n();
  const isHe = locale === 'he';
  const trip     = useAppStore(s => s.trip);
  const activeDay = useAppStore(s => s.activeDay);

  const dayMeta    = trip?.dayMeta?.[activeDay - 1];
  const sleepHotel = (trip?.hotels ?? []).find(h => h.checkInDay <= activeDay && activeDay < h.checkOutDay);
  const city       = dayMeta?.region || sleepHotel?.location || trip?.countries?.[0] || '';

  const greeting = isHe
    ? `שלום! אני Haiko, בן הלוויה החכם של Trippy.${city ? ` שאלו אותי כל דבר על הטיול ב${city}` : ' שאלו אותי כל דבר על הטיול'} — אוכל מקומי, תחבורה, המלצות ומה לא לפספס.`
    : `Hey! I'm Haiko, your travel companion from Trippy.${city ? ` Ask me anything about your trip to ${city}` : ' Ask me anything about your trip'} — local food, transport, hidden gems and what to book ahead.`;

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
        ? (isHe ? `בן הלוויה החכם לטיול · ${city}` : `Your AI travel companion · ${city}`)
        : (isHe ? 'בן הלוויה החכם לטיול' : 'Your AI travel companion')}
      onClose={onClose}
    >
      <style>{`
        @keyframes haikoDot {
          0%,80%,100% { opacity:.2; transform:translateY(0) }
          40% { opacity:1; transform:translateY(-4px) }
        }
        @keyframes haikoFadeUp {
          from { opacity:0; transform:translateY(8px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .haiko-msg { animation: haikoFadeUp 0.22s ease both; }
        .haiko-chip:hover { opacity:.85; }
        .haiko-send:not(:disabled):hover { filter: brightness(1.1); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'min(62vh, 540px)' }}>

        {/* ── Messages ── */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label={isHe ? 'שיחה עם Haiko' : 'Chat with Haiko'}
          className="lg-scroll"
          style={{
            flex: 1, overflowY: 'auto', overscrollBehavior: 'contain',
            display: 'flex', flexDirection: 'column', gap: 14,
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
                }}
              >
                {!isUser && (
                  <StampIcon
                    iconKey="compass"
                    size={32}
                    style={{ flexShrink: 0, marginBottom: 2 }}
                    aria-hidden="true"
                  />
                )}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: isUser ? '10px 16px' : '11px 15px',
                    borderRadius: 20,
                    borderBottomRightRadius: isUser ? 5 : 20,
                    borderBottomLeftRadius:  isUser ? 20 : 5,
                    background: isUser
                      ? 'linear-gradient(160deg, var(--lg-terra-bright), var(--lg-terra))'
                      : 'var(--lg-panel)',
                    color: isUser ? '#fff' : 'var(--lg-ink)',
                    boxShadow: isUser
                      ? 'var(--lg-glow-terra), 0 2px 8px oklch(0% 0 0 / 12%)'
                      : '0 2px 8px oklch(0% 0 0 / 6%)',
                    fontSize: 14.5,
                    lineHeight: 1.55,
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
              <StampIcon iconKey="compass" size={32} style={{ flexShrink: 0, marginBottom: 2 }} aria-hidden="true" />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '14px 18px', borderRadius: 20, borderBottomLeftRadius: 5,
                background: 'var(--lg-panel)',
                boxShadow: 'var(--shadow-xs)',
              }}>
                {[0, 1, 2].map(d => (
                  <span
                    key={d}
                    style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--lg-terra)',
                      animation: `haikoDot 1.3s ${d * 0.18}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p role="alert" style={{ fontSize: 12.5, color: 'var(--danger)', textAlign: 'center', margin: '4px 0 2px', fontWeight: 500 }}>
            {error}
          </p>
        )}

        {/* ── Starter chips ── */}
        <AnimatePresence>
          {showStarters && (
            <m.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="lg-scroll"
              style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '8px 0 10px', overscrollBehavior: 'contain' }}
            >
              {starters.map(s => (
                <button
                  key={s.label}
                  className="haiko-chip"
                  onClick={() => send(s.label)}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 9999, cursor: 'pointer',
                    border: '1px solid oklch(from var(--lg-terra) l c h / 30%)',
                    background: 'var(--terra-muted)',
                    color: 'var(--terra-text)',
                    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                    whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
                    transition: 'opacity .15s',
                  }}
                >
                  <Icon name={s.icon as any} size={13} color="var(--terra-text)" />
                  {s.label}
                </button>
              ))}
            </m.div>
          )}
        </AnimatePresence>

        {/* ── Composer ── */}
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          paddingTop: 10,
          borderTop: '1px solid oklch(50% 0.02 60 / 10%)',
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
            style={{
              flex: 1, resize: 'none', maxHeight: 100, minHeight: 44,
              background: 'var(--field-bg)', border: 'none', borderRadius: 22,
              padding: '11px 16px', fontSize: 15, color: 'var(--text)', outline: 'none',
              fontFamily: 'var(--font-sans)', lineHeight: 1.4,
              boxShadow: 'inset 0 0 0 1.5px var(--field-border)',
              transition: 'box-shadow .2s',
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!canSend}
            aria-label={isHe ? 'שלח הודעה' : 'Send message'}
            className="haiko-send"
            style={{
              height: 44, width: 44, flexShrink: 0, border: 0, borderRadius: '50%',
              background: canSend
                ? 'linear-gradient(160deg, var(--lg-terra-bright), var(--lg-terra))'
                : 'var(--lg-panel)',
              boxShadow: canSend
                ? 'var(--lg-glow-terra)'
                : 'var(--shadow-xs)',
              cursor: canSend ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s, box-shadow .2s, filter .15s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon
              name="send"
              size={18}
              color={canSend ? '#fff' : 'var(--text-3)'}
              style={{ transform: isHe ? 'scaleX(-1)' : 'none', marginInlineEnd: -2 }}
            />
          </button>
        </div>
      </div>
    </Sheet>
  );
}
