'use client';

import React, { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import Icon from '../ui/Icon';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';

export default function NotesScreen() {
  const { trip, addTripNote, deleteTripNote, setScreen } = useAppStore();
  const { show } = useToast();
  const { t, locale, isRTL } = useI18n();
  const [newNote, setNewNote] = useState('');

  if (!trip) return null;

  const handleAdd = () => {
    if (!newNote.trim()) return;
    addTripNote(newNote.trim());
    setNewNote('');
    show(t('itemAdded'));
  };

  return (
    <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div className="resp-container" style={{ padding: '6px 20px 130px' }}>
      {/* Back button */}
      <button
        onClick={() => setScreen('dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6,
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Icon name={isRTL ? 'chevR' : 'chevL'} size={12} color="var(--text-3)" />
        {locale === 'he' ? 'לוח בקרה' : 'Dashboard'}
      </button>
      {/* Header */}
      <p className="eyebrow-lg a-rise" style={{ color: 'var(--lg-terra)', marginBottom: 2 }}>
        {trip.name}
      </p>
      <h1 className="display-xl a-rise d1" style={{ fontSize: 38, color: 'var(--lg-ink)', margin: '0 0 18px' }}>
        {t('travelNotes') as string || 'Notes'}
      </h1>

      {/* Add note field */}
      <div className="lg a-rise d2" style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder={t('notePlaceholder') as string || 'Write a note…'}
            rows={3}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAdd(); }}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '12px 16px',
              borderRadius: 14, border: 0, resize: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 14,
              color: 'var(--lg-ink)', lineHeight: 1.6, outline: 'none',
              background: 'var(--lg-panel-strong)',
              boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
              transition: 'box-shadow .2s',
            }}
          />
        </div>
        <button
          onClick={handleAdd}
          className="lg-btn lg-btn-forest"
          style={{ height: 48, width: '100%', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}
        >
          <Icon name="plus" size={16} color="#fff" />
          {t('addNote') as string || 'Add note'}
        </button>
      </div>

      {/* Notes list */}
      {(!trip.tripNotes || trip.tripNotes.length === 0) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', gap: 12, textAlign: 'center' }}>
          <Icon name="edit" size={40} color="var(--text-3)" />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', margin: 0 }}>No notes yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5, maxWidth: 260, margin: 0 }}>
            Keep passwords, addresses, and reminders here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {trip.tripNotes.map((note, i) => (
              <m.div
                key={i}
                className="lg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.16 } }}
                transition={{ delay: Math.min(i, 7) * 0.04 }}
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <Icon name="edit" size={18} color="var(--lg-terra)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span dir="auto" style={{ flex: 1, fontSize: 14, color: 'var(--lg-ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {note}
                </span>
                <m.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => { deleteTripNote(i); show(t('itemRemoved')); }}
                  aria-label={locale === 'he' ? 'מחק הערה' : 'Delete note'}
                  style={{
                    background: 'var(--danger-bg)', border: '1px solid oklch(48% 0.130 25 / 18%)',
                    borderRadius: 10, cursor: 'pointer', color: 'var(--danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, flexShrink: 0,
                    minWidth: 44, minHeight: 44,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <Icon name="trash" size={15} />
                </m.button>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      </div>{/* /resp-container */}
    </div>
  );
}
