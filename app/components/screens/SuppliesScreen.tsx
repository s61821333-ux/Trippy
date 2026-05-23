'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Glass from '../ui/Glass';
import GlassBtn from '../ui/GlassBtn';
import Chip from '../ui/Chip';
import Icon from '../ui/Icon';
import { SupplyIcon } from '../ui/EventIcon';
import Field from '../ui/Field';
import { useAppStore } from '@/lib/store';
import { SupplyItem } from '@/lib/types';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';

type Category = SupplyItem['category'];
const CATS: Category[] = ['Water', 'Food', 'Gear', 'Medical', 'Documents', 'Other'];

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
};
const itemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 32 }
  },
};

export default function SuppliesScreen() {
  const { supplies, toggleSupply, addSupplyItem, deleteSupplyItem, toggleSupplyCritical } = useAppStore();
  const { show } = useToast();
  const { t } = useI18n();

  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<Category>('Gear');
  const [newAssignee, setNewAssignee] = useState('');
  const [newCritical, setNewCritical] = useState(false);
  const [nudgeId, setNudgeId] = useState<string | null>(null);

  const filtered = (filter === 'All' ? supplies : supplies.filter(s => s.category === filter))
    .slice()
    .sort((a, b) => {
      // Critical unchecked → first; checked → last
      if (a.critical && !a.checked && !(b.critical && !b.checked)) return -1;
      if (b.critical && !b.checked && !(a.critical && !a.checked)) return 1;
      return Number(a.checked) - Number(b.checked);
    });

  const packed = supplies.filter(s => s.checked).length;
  const total = supplies.length;
  // Progress turns success green only when all critical items are also checked
  const allCriticalDone = supplies.filter(s => s.critical).every(s => s.checked);
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;
  const progressColor = pct === 100 && allCriticalDone ? 'var(--success)' : pct > 0 && !allCriticalDone ? 'var(--warning)' : 'var(--terra)';

  const handleAdd = () => {
    if (!newName.trim()) { show(t('enterItemName')); return; }
    addSupplyItem(newName.trim(), newCat, newAssignee.trim() || undefined, newCritical);
    setNewName('');
    setNewAssignee('');
    setNewCritical(false);
    show(t('itemAdded'));
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[1200px] mx-auto overflow-hidden">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32, delay: 0.04 }}
        className="shrink-0"
        style={{ paddingTop: 'var(--page-pt)', paddingBottom: 20, paddingLeft: 'var(--page-px)', paddingRight: 'var(--page-px)' }}
      >
        <div style={{ marginBottom: 16 }}>
          <p className="eyebrow" style={{ marginBottom: 4 }}>
            {packed} {t('of')} {total} {t('items')} · {pct}%
            {!allCriticalDone && supplies.some(s => s.critical) && (
              <span style={{ color: 'var(--danger)', marginLeft: 8, fontWeight: 700 }}>
                · {t('criticalItemsUnpacked')}
              </span>
            )}
          </p>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text)',
            lineHeight: 1.1,
          }}>
            {t('suppliesLabel')}
          </h1>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 8, background: 'var(--border)',
          borderRadius: 4, overflow: 'hidden', marginBottom: 16,
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.2, duration: 0.55, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 4, background: progressColor }}
          />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, paddingRight: 'var(--page-px)', scrollbarWidth: 'none' }}>
          {(['All', ...CATS] as const).map(c => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.92 }}
              onClick={() => setFilter(c)}
              style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: 12, fontWeight: 600,
                background: filter === c ? 'var(--terra)' : 'var(--surface)',
                color: filter === c ? 'white' : 'var(--text-2)',
                border: filter === c ? 'none' : '1px solid var(--border)',
                boxShadow: filter === c ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              {c !== 'All' && <SupplyIcon category={c as Category} size={13} />} {c}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto pb-8 w-full flex justify-center" style={{ paddingLeft: 'var(--page-px)', paddingRight: 'var(--page-px)' }}>
        <div className="w-full max-w-5xl flex flex-col gap-6">
          <motion.div
            key={filter}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            <AnimatePresence>
              {filtered.map(item => (
                <motion.div
                  key={item.id}
                  variants={itemVariant}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.18 } }}
                  layout
                >
                  <motion.div
                    animate={nudgeId === item.id ? { x: [0, 4, 0] } : { x: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    onAnimationComplete={() => { if (nudgeId === item.id) setNudgeId(null); }}
                    style={{
                      background: 'var(--surface)',
                      border: item.critical && !item.checked
                        ? '2px solid var(--danger)'
                        : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      opacity: item.checked ? 0.55 : 1,
                      transition: 'opacity 0.25s, border 0.2s',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    {/* Checkbox */}
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => {
                        toggleSupply(item.id);
                        setNudgeId(item.id);
                      }}
                      style={{
                        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                        border: item.checked ? 'none' : item.critical ? '1.5px solid var(--danger)' : '1.5px solid var(--border-strong)',
                        background: item.checked ? 'var(--terra)' : 'var(--surface)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s, border 0.2s',
                      }}
                    >
                      <AnimatePresence>
                        {item.checked && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring' as const, stiffness: 500, damping: 22 }}
                          >
                            <Icon name="check" size={12} style={{ color: 'white' }} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <p style={{
                          fontSize: 14, fontWeight: 600, color: 'var(--text)',
                          textDecoration: item.checked ? 'line-through' : 'none',
                          transition: 'text-decoration 0.2s',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.name}
                        </p>
                        {item.critical && !item.checked && (
                          <span style={{
                            fontSize: 9, fontWeight: 800, color: 'var(--danger)',
                            background: 'var(--danger-bg)',
                            borderRadius: 100, padding: '1px 6px',
                            letterSpacing: '0.05em',
                          }}>
                            {t('criticalBadge')}
                          </span>
                        )}
                      </div>
                      {item.assignee && (
                        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>
                          👤 {item.assignee}
                        </p>
                      )}
                    </div>

                    <Chip v="neutral" style={{ fontSize: 10, flexShrink: 0 }}>
                      <SupplyIcon category={item.category} size={11} /> {item.category}
                    </Chip>

                    {/* Critical pin toggle */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      title={item.critical ? 'Unmark as critical' : 'Mark as critical'}
                      onClick={() => toggleSupplyCritical(item.id)}
                      style={{
                        background: 'none', border: 'none',
                        cursor: 'pointer',
                        color: item.critical ? 'var(--danger)' : 'var(--text-3)',
                        padding: 4, flexShrink: 0,
                        fontSize: 14,
                      }}
                    >
                      <Icon name="pin" size={14} style={{ color: item.critical ? 'var(--danger)' : 'var(--text-3)' }} />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => { deleteSupplyItem(item.id); show(t('itemRemoved')); }}
                      style={{
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: 'var(--text-3)', padding: 4, flexShrink: 0,
                      }}
                    >
                      <Icon name="x" size={14} />
                    </motion.button>

                    {/* Green checkmark fades in at right edge when checked */}
                    <AnimatePresence>
                      {item.checked && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          style={{ color: 'var(--success)', fontSize: 16, flexShrink: 0, lineHeight: 1 }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--terra-muted)', border: '1.5px solid rgba(196,113,74,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <SupplyIcon category="Gear" size={36} style={{ color: 'var(--terra)' }} />
                </motion.div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Your bag is empty
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>
                  {filter === 'All' ? 'Add your first item below' : `No ${filter.toLowerCase()} items yet`}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Add item */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, type: 'spring' as const, stiffness: 340, damping: 32 }}
          >
            <Glass level={2} style={{ borderRadius: 'var(--radius-lg)', padding: '16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.04em', marginBottom: 12, textTransform: 'uppercase' }}>
                {t('addItem')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Field
                  placeholder={t('itemNamePlaceholder')}
                  value={newName}
                  onChange={setNewName}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />

                {/* Assignee input */}
                <input
                  value={newAssignee}
                  onChange={e => setNewAssignee(e.target.value)}
                  placeholder={t('assigneePlaceholder')}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    fontSize: 13, fontWeight: 500,
                    background: 'var(--bg)', color: 'var(--text)',
                    border: '1px solid var(--border)', outline: 'none',
                    boxSizing: 'border-box' as const,
                  }}
                />

                {/* Category buttons */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATS.map(c => (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.90 }}
                      onClick={() => setNewCat(c)}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600,
                        background: newCat === c ? 'var(--terra)' : 'var(--bg)',
                        color: newCat === c ? 'white' : 'var(--text-2)',
                        border: newCat === c ? 'none' : '1px solid var(--border)',
                        boxShadow: newCat === c ? 'var(--shadow-sm)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <SupplyIcon category={c} size={13} /> {c}
                    </motion.button>
                  ))}
                </div>

                {/* Critical toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setNewCritical(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                      fontSize: 12, fontWeight: 600,
                      background: newCritical ? 'var(--danger-bg)' : 'var(--bg)',
                      color: newCritical ? 'var(--danger)' : 'var(--text-2)',
                      border: newCritical ? '1.5px solid var(--danger)' : '1px solid var(--border)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <Icon name="pin" size={13} /> {newCritical ? t('unmarkCritical') : t('markCritical')}
                  </motion.button>
                  {newCritical && (
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {t('criticalBlocksBar')}
                    </span>
                  )}
                </div>

                <GlassBtn variant="accent" onClick={handleAdd} style={{ width: '100%' }}>
                  <Icon name="plus" size={14} /> {t('addItem')}
                </GlassBtn>
              </div>
            </Glass>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
