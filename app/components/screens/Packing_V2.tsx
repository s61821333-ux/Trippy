'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { StampIcon } from '../ui/StampIcon';
import { supplyStamp } from '@/lib/categoryStamp';
import Ring from '../ui/Ring';
import Icon from '../ui/Icon';

// ── Category rail ─────────────────────────────────────────────────────────────
// Spec rails: All / Documents / Gear / Health / Food
// Store category "Medical" maps to "Health" filter.

type FilterCat = 'All' | 'Documents' | 'Gear' | 'Health' | 'Food';
const CATS: FilterCat[] = ['All', 'Documents', 'Gear', 'Health', 'Food'];

function storeToFilter(cat: string): FilterCat | null {
  if (cat === 'Medical') return 'Health';
  if (CATS.includes(cat as FilterCat)) return cat as FilterCat;
  return null;
}

// ── Check circle ──────────────────────────────────────────────────────────────

function CheckCircle({ done }: { done: boolean }) {
  return (
    <m.span
      animate={{ scale: done ? 1 : 1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background:  done ? 'var(--lg-forest)' : 'transparent',
        boxShadow:   done ? 'var(--lg-glow-forest)' : 'inset 0 0 0 2px oklch(50% 0.02 60 / 22%)',
        transition:  'background 0.2s, box-shadow 0.2s',
      }}
      aria-hidden="true"
    >
      {done && <Icon name="check" size={16} color="#fff" />}
    </m.span>
  );
}

// ── Main Packing_V2 ───────────────────────────────────────────────────────────

export default function Packing_V2() {
  const { t, locale } = useI18n();

  const { trip, supplies, toggleSupply } = useAppStore(
    useShallow(s => ({ trip: s.trip, supplies: s.supplies, toggleSupply: s.toggleSupply }))
  );

  const [activeCat, setActiveCat] = useState<FilterCat>('All');

  const packed = supplies.filter(s => s.checked).length;
  const total  = supplies.length;
  const pct    = total > 0 ? Math.round((packed / total) * 100) : 0;

  const filtered = activeCat === 'All'
    ? supplies
    : supplies.filter(s => {
        const mapped = storeToFilter(s.category);
        return mapped === activeCat;
      });

  if (!trip) return null;

  return (
    <div
      className="lg-scroll"
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', padding: '6px 20px 130px' }}
    >
      {/* ── Header ── */}
      <m.p
        className="eyebrow-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{ color: 'var(--lg-terra)', marginBottom: 2 }}
      >
        {t('adventurePrep') || 'Adventure prep'}
      </m.p>

      <m.h1
        className="display-xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontSize: 38, color: 'var(--lg-ink)', margin: '0 0 16px' }}
      >
        {t('suppliesLabel') || 'Packing'}
      </m.h1>

      {/* ── Progress card ── */}
      <m.div
        className="lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}
      >
        <Ring pct={pct} size={76} stroke={6} color="var(--lg-terra)">
          {pct}%
        </Ring>

        <div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 22, color: 'var(--lg-ink)', lineHeight: 1.1,
          }}>
            {pct === 100
              ? (t('allPacked') || 'All packed!')
              : (t('almostThere') || 'Almost there')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>
            {packed}/{total} {t('packedShared') || 'packed · shared with crew'}
          </div>
        </div>
      </m.div>

      {/* ── Category rail ── */}
      <div
        className="lg-scroll"
        role="group"
        aria-label="Filter by category"
        style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}
      >
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            aria-pressed={activeCat === c}
            style={{
              flexShrink: 0, border: 0, cursor: 'pointer',
              borderRadius: 9999, padding: '8px 15px',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
              background: activeCat === c ? 'var(--lg-forest)' : 'var(--lg-panel)',
              backdropFilter: 'var(--lg-blur)',
              color:      activeCat === c ? '#fff' : 'var(--text-2)',
              boxShadow:  activeCat === c
                ? 'var(--lg-glow-forest)'
                : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
              transition: 'all .3s',
              whiteSpace: 'nowrap',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {t(c) || c}
          </button>
        ))}
      </div>

      {/* ── Item list ── */}
      <div
        role="list"
        aria-label={t('suppliesLabel') || 'Packing list'}
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {filtered.map((item, i) => {
          const stampKey = supplyStamp(item.category);
          return (
            <m.button
              key={item.id}
              role="listitem"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + i * 0.04, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleSupply(item.id)}
              aria-label={`${item.name}${item.checked ? ', packed' : ', not packed'}`}
              aria-pressed={item.checked}
              className="lg"
              style={{
                display: 'flex', alignItems: 'center', gap: 13,
                padding: 13, border: 0, cursor: 'pointer',
                textAlign: locale === 'he' ? 'right' : 'left',
                opacity: item.checked ? 0.6 : 1,
                transition: 'opacity 0.2s',
                width: '100%',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <StampIcon iconKey={stampKey} size={38} aria-hidden="true" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)',
                  textDecoration: item.checked ? 'line-through' : 'none',
                  textDecorationColor: 'var(--text-3)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-3)', marginTop: 2,
                }}>
                  {t(item.category) || item.category}
                </div>
              </div>

              <CheckCircle done={item.checked} />
            </m.button>
          );
        })}

        {total === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 0',
            fontFamily: 'var(--font-sans)', fontSize: 14,
            color: 'var(--text-3)', lineHeight: 1.6,
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎒</div>
            {locale === 'he'
              ? 'אין פריטים ברשימה עדיין.'
              : 'No packing items yet. Add items from the pack list.'}
          </div>
        )}
        {total > 0 && filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '32px 0',
            fontFamily: 'var(--font-sans)', fontSize: 14,
            color: 'var(--text-3)',
          }}>
            {locale === 'he' ? 'אין פריטים בקטגוריה זו' : 'No items in this category'}
          </div>
        )}
      </div>
    </div>
  );
}
