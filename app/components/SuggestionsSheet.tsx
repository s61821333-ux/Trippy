'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sheet from './ui/Sheet';
import Glass from './ui/Glass';
import GlassBtn from './ui/GlassBtn';
import Chip from './ui/Chip';
import Icon from './ui/Icon';
import AsyncError from './ui/AsyncError';
import { SparkleLoader, LoaderStyles, BRAND_THEME } from './ui/TripLoaders';
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
  const [streamingText, setStreamingText] = useState('');
  const [showCards, setShowCards]     = useState(false);
  const elapsedRef                    = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryRef                      = useRef(0);

  const fetchSuggestions = (exclude: string[] = []): Promise<AiSuggestion[]> => {
    return new Promise((resolve, reject) => {
      if (!trip) { reject(new Error('No trip')); return; }
      const existingEvents = trip.events[dayNumber] ?? [];
      const dayMeta = trip.dayMeta[dayNumber - 1];

      fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber, dayMeta, existingEvents, tripName: trip.name, countries: trip.countries ?? [], exclude, gapStart: activeGapStart ?? undefined, gapEnd: activeGapEnd ?? undefined, locale }),
      }).then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string; retryAfter?: number };
          if (res.status === 429 && body.retryAfter) {
            reject(new Error(`Rate limited — try again in ${body.retryAfter}s`));
          } else {
            reject(new Error(body.error ?? `Server error ${res.status}`));
          }
          return;
        }

        // Consume the text stream
        const reader = res.body?.getReader();
        if (!reader) { reject(new Error('No response body')); return; }

        const decoder = new TextDecoder();
        let accumulated = '';

        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;

            // Check for terminal sentinels
            const enrichedIdx = accumulated.indexOf('\n__ENRICHED__');
            const errorIdx    = accumulated.indexOf('\n__ERROR__');

            if (enrichedIdx !== -1) {
              const jsonStr = accumulated.slice(enrichedIdx + '\n__ENRICHED__'.length);
              try {
                const enriched = JSON.parse(jsonStr) as AiSuggestion[];
                resolve(enriched);
              } catch {
                reject(new Error('Failed to parse enriched suggestions'));
              }
              return;
            }

            if (errorIdx !== -1) {
              const msg = accumulated.slice(errorIdx + '\n__ERROR__'.length);
              reject(new Error(msg || 'AI request failed'));
              return;
            }

            // Stream text up to any potential sentinel prefix
            const safeText = accumulated.replace(/\n__[A-Z]*$/, '');
            setStreamingText(safeText);
          }
          // Stream ended without sentinel — try parsing what we have
          const clean = accumulated.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
          try {
            resolve(JSON.parse(clean) as AiSuggestion[]);
          } catch {
            reject(new Error('Incomplete stream response'));
          }
        };

        pump().catch(reject);
      }).catch(reject);
    });
  };

  const runFetch = (exclude: string[] = []) => {
    setLoading(true);
    setError(null);
    setStreamingText('');
    setShowCards(false);
    setSuggestions([]);
    setElapsed(0);
    elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);

    fetchSuggestions(exclude)
      .then(data => {
        setSuggestions(data);
        setAiSuggestions(data);
        // Fade out typewriter, fade in cards
        setStreamingText('');
        setTimeout(() => setShowCards(true), 50);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        setStreamingText('');
        setLoading(false);
      })
      .finally(() => {
        if (elapsedRef.current) clearInterval(elapsedRef.current);
      });
  };

  useEffect(() => {
    runFetch();
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
    // Only re-fetch when navigating to a different day
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayNumber]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    const shownNames = suggestions.map(s => s.name);
    fetchSuggestions(shownNames)
      .then(data => {
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
          {/* Streaming typewriter preview */}
          {streamingText ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'rgba(0,0,0,0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '12px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-3)',
                lineHeight: 1.6,
                maxHeight: 140,
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {streamingText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                style={{ display: 'inline-block', width: 6, height: 12, background: 'var(--brand)', marginLeft: 2, verticalAlign: 'middle' }}
              />
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 82, borderRadius: 16 }} />
              ))}
            </div>
          )}

          {/* Progress bar + status */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <LoaderStyles />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SparkleLoader theme={BRAND_THEME} size={36} speed={1.2} />
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
          style={{ padding: '8px 0' }}
        >
          <AsyncError
            message={error}
            onRetry={() => { retryRef.current++; runFetch(); }}
          />
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
        <AnimatePresence mode="wait">
          {showCards && (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
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
                                {s.rating !== undefined && (
                                  <Chip v="neutral" style={{ fontSize: 10 }}>
                                    ★ {s.rating.toFixed(1)}{s.ratingCount ? ` (${s.ratingCount.toLocaleString()})` : ''}
                                  </Chip>
                                )}
                                {s.mapsUrl && (
                                  <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <Chip v="neutral" style={{ fontSize: 10, cursor: 'pointer', color: 'var(--brand)' }}>
                                      <Icon name="map" size={10} /> {locale === 'he' ? 'מפות Google' : 'Google Maps'}
                                    </Chip>
                                  </a>
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
                            <GlassBtn size="sm" onClick={() => setDismissed(d => [...d, s.id])} style={{ flex: 1 }}>
                              {t('dismiss')}
                            </GlassBtn>
                            <GlassBtn
                              variant="accent" size="sm"
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
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {!loading && !error && (
        <GlassBtn onClick={handleLoadMore} disabled={loadingMore} style={{ width: '100%', marginTop: 4 }}>
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
