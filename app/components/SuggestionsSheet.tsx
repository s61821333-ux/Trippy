'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sheet from './ui/Sheet';
import Glass from './ui/Glass';
import GlassBtn from './ui/GlassBtn';
import Chip from './ui/Chip';
import Icon from './ui/Icon';
import { useAppStore } from '@/lib/store';
import { CAT_META } from '@/lib/utils';
import { AiSuggestion } from '@/lib/types';
import { useToast } from './ui/Toast';
import { useI18n } from '@/lib/i18n';

interface Props { dayNumber: number }

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const cardVariant = {
  hidden:  { opacity: 0, y: 18, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 360, damping: 30 } },
};

export default function SuggestionsSheet({ dayNumber }: Props) {
  const { setShowSuggestions, addSuggestionToDay, setAiSuggestions, trip, activeGapStart, activeGapEnd } = useAppStore();
  const { show }  = useToast();
  const { t, locale } = useI18n();
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [dismissed, setDismissed]     = useState<string[]>([]);
  const [elapsed, setElapsed]         = useState(0);
  const elapsedRef                    = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSuggestions = (exclude: string[] = []) => {
    if (!trip) return;
    const existingEvents = trip.events[dayNumber] ?? [];
    const dayMeta = trip.dayMeta[dayNumber - 1];

    return fetch('/api/ai/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayNumber, dayMeta, existingEvents, tripName: trip.name, countries: trip.countries ?? [], exclude, gapStart: activeGapStart ?? undefined, gapEnd: activeGapEnd ?? undefined, locale }),
    })
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(body.error ?? `Server error ${res.status}`);
        }
        return res.json() as Promise<AiSuggestion[]>;
      });
  };

  useEffect(() => {
    setElapsed(0);
    elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    fetchSuggestions()
      ?.then(data => {
        setSuggestions(data);
        setAiSuggestions(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        setLoading(false);
      })
      .finally(() => {
        if (elapsedRef.current) clearInterval(elapsedRef.current);
      });
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [dayNumber, trip]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    const shownNames = suggestions.map(s => s.name);
    fetchSuggestions(shownNames)
      ?.then(data => {
        const withOffset = data.map((s, i) => ({ ...s, id: `ai-more-${Date.now()}-${i}` }));
        setSuggestions(prev => [...prev, ...withOffset]);
        setAiSuggestions([...suggestions, ...withOffset]);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const visible = suggestions.filter(s => !dismissed.includes(s.id));

  return (
    <Sheet
      onClose={() => setShowSuggestions(false)}
      title={t('aiSuggestions')}
      subtitle={t('aiSugSub')}
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer" style={{ height: 82, borderRadius: 16 }} />
          ))}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '14px 16px',
            marginTop: 4,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', fontSize: 18, lineHeight: 1 }}
              >
                ✨
              </motion.span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                {locale === 'he' ? 'מחפש פעילויות מומלצות...' : 'Finding great activities for you…'}
              </span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                color: elapsed >= 8 ? 'var(--warning)' : 'var(--text-3)',
              }}>
                {elapsed}s
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${Math.min(95, elapsed * 10)}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--brand), #5B4FCF)', borderRadius: 2 }}
              />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
              {locale === 'he'
                ? '⚡ מופעל על ידי Claude Haiku · בדרך כלל 3–8 שניות'
                : '⚡ Powered by Claude Haiku · Usually ready in 3–8 sec'}
            </p>
          </div>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-2)' }}
        >
          <span style={{ fontSize: 34, display: 'block', marginBottom: 10 }}>⚠️</span>
          <p style={{ fontWeight: 600 }}>AI unavailable</p>
          <p style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-3)' }}>{error}</p>
        </motion.div>
      ) : visible.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-2)' }}
        >
          <span style={{ fontSize: 34, display: 'block', marginBottom: 10 }}>✨</span>
          <p style={{ fontWeight: 600 }}>{t('noMoreSuggestions')}</p>
          <p style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-3)' }}>{t('tryAddingEvents')}</p>
        </motion.div>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <AnimatePresence>
            {visible.map((s: AiSuggestion) => {
              const meta = CAT_META[s.category];
              return (
                <motion.div
                  key={s.id}
                  variants={cardVariant}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.22 } }}
                  layout
                >
                  <Glass level={1} style={{ padding: '14px', borderRadius: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                        background: meta.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, border: '1px solid rgba(255,255,255,0.75)',
                      }}>
                        {meta.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.name}</span>
                          <Chip v={s.open ? 'open' : 'closed'} style={{ fontSize: 10 }}>
                            {s.open ? `● ${t('open')}` : `● ${t('closed')}`}
                          </Chip>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 6 }}>
                          {s.description}
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Chip v="neutral" style={{ fontSize: 10 }}>
                            <Icon name="clock" size={10} /> {s.time} · {s.duration}min
                          </Chip>
                          <Chip v="neutral" style={{ fontSize: 10 }}>
                            <Icon name="pin" size={10} /> {s.distance}
                          </Chip>
                          {s.location && (
                            <Chip v="neutral" style={{ fontSize: 10 }}>
                              <Icon name="map" size={10} /> {s.location}
                            </Chip>
                          )}
                          {s.cost !== undefined && (
                            <Chip v="neutral" style={{ fontSize: 10 }}>
                              {t('estCost')}: ₪{s.cost}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <GlassBtn
                        size="sm"
                        onClick={() => setDismissed(d => [...d, s.id])}
                        style={{ flex: 1 }}
                      >
                        {t('dismiss')}
                      </GlassBtn>
                      <GlassBtn
                        variant="accent"
                        size="sm"
                        disabled={!s.open}
                        onClick={() => {
                          addSuggestionToDay(dayNumber, s.id);
                          show(`${s.name} added ✓`);
                        }}
                        style={{ flex: 2 }}
                      >
                        <Icon name="plus" size={13} /> {t('addToDay')}
                      </GlassBtn>
                    </div>
                  </Glass>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && !error && (
        <GlassBtn
          onClick={handleLoadMore}
          disabled={loadingMore}
          style={{ width: '100%', marginTop: 4 }}
        >
          {loadingMore ? (
            <span className="an-pulse">
              <Icon name="sparkle" size={13} style={{ color: 'var(--accent)' }} /> Loading…
            </span>
          ) : (
            <><Icon name="sparkle" size={13} style={{ color: 'var(--accent)' }} /> Load more</>
          )}
        </GlassBtn>
      )}
      <div style={{ height: 6 }} />
      <GlassBtn onClick={() => setShowSuggestions(false)} style={{ width: '100%' }}>
        {t('close')}
      </GlassBtn>
    </Sheet>
  );
}
