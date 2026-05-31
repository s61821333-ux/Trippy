'use client';

/**
 * Sheets_V2 — shared overlay payloads for Trippy 2.0 Liquid Glass.
 *
 * Exports:
 *  - AISheet   replaces SuggestionsSheet.tsx
 *
 * Sheet primitive: app/components/ui/Sheet.tsx (already spec-compliant).
 * CreateSheet: inline in Home_V2.tsx (already spec-compliant).
 * AddEventSheet: inline in DayDetail_V2.tsx (already spec-compliant).
 */

import React from 'react';
import { m } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { AiSuggestion } from '@/lib/types';
import { catStamp } from '@/lib/categoryStamp';
import { StampIcon } from './ui/StampIcon';
import Sheet from './ui/Sheet';
import Btn from './ui/Btn';
import Icon from './ui/Icon';

// ── Category label map ────────────────────────────────────────────────────────

const CAT_LABEL: Record<string, string> = {
  food:       'Food',  cafe: 'Café',  attraction: 'Sight',
  hotel:      'Stay',  rest: 'Rest',  transport:  'Transit',
  flight:     'Flight', concert: 'Event', theme_park: 'Park',
  sport:      'Sport', beach: 'Beach', other: 'Place',
};

// ── Suggestion card ───────────────────────────────────────────────────────────

function SuggCard({
  s, onAdd, onDismiss,
}: { s: AiSuggestion; onAdd: (s: AiSuggestion) => void; onDismiss: (s: AiSuggestion) => void }) {
  const { t } = useI18n();
  const { key: stampKey, color } = catStamp(s.category);
  const label = CAT_LABEL[s.category] ?? 'Place';

  const meta = [
    label,
    s.rating ? `${s.rating} ★` : null,
    s.distance || null,
  ].filter(Boolean).join(' · ');

  const timeCost = [
    s.duration > 0 ? `${s.duration} min` : null,
    s.cost != null ? `$${s.cost}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <m.div
      className="lg"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.snap, delay: 0 }}
      style={{ padding: 15 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', gap: 13, marginBottom: 10 }}>
        <StampIcon iconKey={stampKey} size={46} aria-hidden="true" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="eyebrow-lg"
            style={{ color: 'var(--lg-sand)', fontSize: 9, marginBottom: 2 }}
          >
            {meta}
          </div>
          <div style={{
            fontSize: 16, fontWeight: 600,
            color: 'var(--lg-ink)', lineHeight: 1.2, marginTop: 1,
          }}>
            {s.name}
          </div>
        </div>

        {timeCost && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--text-3)', whiteSpace: 'nowrap', alignSelf: 'flex-start',
          }}>
            {timeCost}
          </span>
        )}
      </div>

      {/* Description */}
      {s.description && (
        <p style={{
          fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)',
          margin: '0 0 12px',
        }}>
          {s.description}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn
          kind="forest"
          full
          onClick={() => onAdd(s)}
          style={{ height: 44, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="plus" size={15} color="#fff" />
          {t('Add to day') || 'Add to day'}
        </Btn>
        <button
          onClick={() => onDismiss(s)}
          className="lg-btn lg-btn-glass"
          style={{ height: 44, padding: '0 20px', flexShrink: 0 }}
        >
          {t('Dismiss') || 'Dismiss'}
        </button>
      </div>
    </m.div>
  );
}

// ── AISheet — replaces SuggestionsSheet ──────────────────────────────────────

interface AISheetProps {
  dayNumber: number;
}

export function AISheet({ dayNumber }: AISheetProps) {
  const { t } = useI18n();

  const { aiSuggestions, setShowSuggestions, addSuggestionToDay } = useAppStore(
    useShallow(s => ({
      aiSuggestions:      s.aiSuggestions,
      setShowSuggestions: s.setShowSuggestions,
      addSuggestionToDay: s.addSuggestionToDay,
    }))
  );

  const handleAdd = (s: AiSuggestion) => {
    addSuggestionToDay(dayNumber, s.id);
    setShowSuggestions(false);
  };

  const handleDismiss = (_s: AiSuggestion) => {
    // Dismiss just closes for now; future: remove suggestion from list
    setShowSuggestions(false);
  };

  return (
    <Sheet
      onClose={() => setShowSuggestions(false)}
      title={t('AI suggestions') || 'AI suggestions'}
      subtitle={t('Tailored to your day & pace') || 'Tailored to your day & pace'}
    >
      <div
        role="list"
        aria-label={t('AI suggestions') || 'AI suggestions'}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {aiSuggestions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 0',
            fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-3)',
          }}>
            {t('noSuggestions') || 'No suggestions yet'}
          </div>
        ) : (
          aiSuggestions.map((s, i) => (
            <div key={s.id} role="listitem">
              <m.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <SuggCard s={s} onAdd={handleAdd} onDismiss={handleDismiss} />
              </m.div>
            </div>
          ))
        )}
      </div>
    </Sheet>
  );
}
