'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Icon from '../ui/Icon';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';

export default function NotesScreen() {
  const { trip, addTripNote, deleteTripNote } = useAppStore();
  const { show } = useToast();
  const { t } = useI18n();
  const [newNote, setNewNote] = useState('');

  if (!trip) return null;

  const handleAdd = () => {
    if (!newNote.trim()) return;
    addTripNote(newNote.trim());
    setNewNote('');
    show(t('itemAdded'));
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32, delay: 0.04 }}
        className="px-[var(--page-px)] shrink-0"
        style={{ paddingTop: 'var(--page-pt)', paddingBottom: 20 }}
      >
        <p className="eyebrow" style={{ marginBottom: 4 }}>🔐 {t('navNotes')}</p>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
          fontWeight: 800, letterSpacing: '-0.025em',
          color: 'var(--text)', lineHeight: 1.1,
        }}>
          {t('travelNotes')}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>
          {t('travelNotesSub')}
        </p>
      </motion.div>

      {/* Add note */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-[var(--page-px)] shrink-0"
        style={{ marginBottom: 16 }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAdd(); }}
            className="input-premium"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)',
              fontSize: 13, background: 'var(--surface)',
              border: '1px solid var(--border)', outline: 'none',
              color: 'var(--text)', fontFamily: 'var(--font-sans)',
              resize: 'none', lineHeight: 1.5,
            }}
          />
          <GlassBtn variant="accent" onClick={handleAdd} style={{ alignSelf: 'stretch', minWidth: 44, padding: '0 14px' }}>
            <Icon name="plus" size={16} />
          </GlassBtn>
        </div>
      </motion.div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-[var(--page-px)] pb-8">
        {(!trip.tripNotes || trip.tripNotes.length === 0) ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '48px 20px', gap: 10,
            }}
          >
            <span style={{ fontSize: 40 }}>🔐</span>
            <p style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center', fontWeight: 500, lineHeight: 1.55, maxWidth: 280 }}>
              {t('noNotes')}
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {trip.tripNotes.map((note, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.16 } }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <span style={{ fontSize: 18, marginTop: 1, flexShrink: 0 }}>📝</span>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {note}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => { deleteTripNote(i); show(t('itemRemoved')); }}
                    style={{
                      background: 'var(--danger-bg)', border: '1px solid rgba(192,57,43,0.15)',
                      borderRadius: 8, cursor: 'pointer', color: 'var(--danger)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 30, height: 30, flexShrink: 0,
                    }}
                  >
                    <Icon name="trash" size={13} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
