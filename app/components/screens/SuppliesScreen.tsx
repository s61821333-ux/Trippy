'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { blurUpVariants, staggerContainer } from '@/lib/motion';
import Glass from '../ui/Glass';
import GlassBtn from '../ui/GlassBtn';
import Icon from '../ui/Icon';
import { SupplyIcon } from '../ui/EventIcon';
import Field from '../ui/Field';
import { useAppStore } from '@/lib/store';
import { SupplyItem } from '@/lib/types';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';

type Category = SupplyItem['category'];
const CATS: Category[] = ['Water', 'Food', 'Gear', 'Medical', 'Documents', 'Other'];

const listVariants = staggerContainer;
const itemVariant  = blurUpVariants;

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
    <div className="flex flex-col h-full w-full max-w-[1200px] mx-auto overflow-hidden" style={{ position: 'relative' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
        transition={{ duration: 0.42, ease: [0.25, 0, 0, 1] }}
        className="shrink-0"
        style={{ paddingTop: 'var(--page-pt)', paddingBottom: 16, paddingLeft: 'var(--page-px)', paddingRight: 'var(--page-px)' }}
      >
        {/* Eyebrow + title */}
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.18em', color: 'var(--terra)',
          textTransform: 'uppercase', marginBottom: 6,
        }}>
          ADVENTURE PREP
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          lineHeight: 1.05,
          marginBottom: 16,
        }}>
          {t('suppliesLabel')}
        </h1>

        {/* Circular donut progress card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.95)',
          borderRadius: 28,
          padding: '24px 20px',
          marginBottom: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(26,20,16,0.06)',
        }}>
          {/* Donut SVG */}
          <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 16 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Track */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border)" strokeWidth="8" />
              {/* Progress arc */}
              <motion.circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke={progressColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 38}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - pct / 100) }}
                transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            {/* Center text */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 20, fontWeight: 800, color: 'var(--text)',
                fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em',
              }}>
                {pct}%
              </span>
            </div>
          </div>

          {/* Status message */}
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>
            {pct === 100 ? '🎉 All packed!' : pct >= 80 ? 'Almost ready to go!' : pct >= 50 ? 'Making progress!' : 'Let\'s get packing!'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 14, maxWidth: 240 }}>
            You&apos;ve packed {packed} of {total} items.
            {!allCriticalDone && supplies.some(s => s.critical) && ' The team still needs to confirm critical items.'}
          </p>

          {/* Confirmed / Pending pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 14px', borderRadius: 9999,
              background: 'rgba(40,160,90,0.10)', border: '1px solid rgba(40,160,90,0.25)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', color: 'var(--success)',
            }}>
              <Icon name="check" size={10} /> {packed} Items Confirmed
            </span>
            {total - packed > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 14px', borderRadius: 9999,
                background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.20)',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', color: 'var(--danger)',
              }}>
                <Icon name="clock" size={10} /> {total - packed} Pending
              </span>
            )}
          </div>
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {(['All', ...CATS] as const).map(c => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.92 }}
              onClick={() => setFilter(c)}
              style={{
                flexShrink: 0, padding: '7px 16px', borderRadius: 9999,
                fontSize: 12, fontWeight: 700,
                background: filter === c ? 'var(--brand)' : 'rgba(255,255,255,0.80)',
                color: filter === c ? 'white' : 'var(--text-2)',
                border: filter === c ? 'none' : '1px solid rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                boxShadow: filter === c ? '0 4px 14px rgba(59,110,82,0.28)' : '0 2px 6px rgba(26,20,16,0.04)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              {c === 'All' ? 'All Items' : c}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto pb-8 w-full" style={{ paddingLeft: 'var(--page-px)', paddingRight: 'var(--page-px)' }}>
        <div className="w-full flex flex-col">
          {/* Group by category when showing All; flat list otherwise */}
          {filtered.length === 0 ? (
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
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Your bag is empty</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>
                {filter === 'All' ? 'Add your first item below' : `No ${filter.toLowerCase()} items yet`}
              </p>
            </motion.div>
          ) : (
            // Group items by category
            (filter === 'All' ? CATS : [filter as Category]).map(cat => {
              const catItems = filtered.filter(i => i.category === cat);
              if (catItems.length === 0) return null;
              const catLabels: Record<Category, string> = {
                Water: 'Water & Hydration', Food: 'Food & Provisions',
                Gear: 'Essential Gear', Medical: 'Medical & Safety',
                Documents: 'Documents & IDs', Other: 'Other Items',
              };
              return (
                <div key={cat} style={{ marginBottom: 20 }}>
                  {/* Category section header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <SupplyIcon category={cat} size={16} style={{ color: 'var(--text-2)' }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                      {catLabels[cat] || cat}
                    </span>
                  </div>

                  {/* Items */}
                  <motion.div variants={listVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <AnimatePresence>
                      {catItems.map(item => (
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
                              background: 'rgba(255,255,255,0.88)',
                              border: item.critical && !item.checked
                                ? '1.5px solid rgba(192,57,43,0.40)'
                                : '1px solid rgba(255,255,255,0.95)',
                              borderRadius: 18,
                              padding: '14px 14px',
                              opacity: item.checked ? 0.60 : 1,
                              transition: 'opacity 0.25s, border 0.2s',
                              display: 'flex', alignItems: 'center', gap: 12,
                              boxShadow: '0 2px 8px rgba(26,20,16,0.05)',
                            }}
                          >
                            {/* Circle checkbox — demo style */}
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => { toggleSupply(item.id); setNudgeId(item.id); }}
                              style={{
                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                border: item.checked
                                  ? 'none'
                                  : item.critical ? '1.5px solid var(--danger)' : '1.5px solid var(--border-strong)',
                                background: item.checked ? 'var(--brand)' : 'transparent',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.2s, border 0.2s',
                              }}
                            >
                              <AnimatePresence>
                                {item.checked && (
                                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring' as const, stiffness: 500, damping: 22 }}>
                                    <Icon name="check" size={12} style={{ color: 'white' }} />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.button>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: 14, fontWeight: 700, color: 'var(--text)',
                                textDecoration: item.checked ? 'line-through' : 'none',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                letterSpacing: '-0.01em',
                              }}>
                                {item.name}
                              </p>
                              {item.assignee && (
                                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, fontWeight: 500 }}>
                                  {item.assignee}
                                </p>
                              )}
                            </div>

                            {/* Assignee avatar if provided */}
                            {item.assignee && (
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: 'white',
                              }}>
                                {item.assignee[0]?.toUpperCase()}
                              </div>
                            )}

                            {/* Critical toggle */}
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              title={item.critical ? 'Unmark critical' : 'Mark critical'}
                              onClick={() => toggleSupplyCritical(item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                            >
                              <Icon name="pin" size={14} style={{ color: item.critical ? 'var(--danger)' : 'var(--border-strong)' }} />
                            </motion.button>

                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => { deleteSupplyItem(item.id); show(t('itemRemoved')); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                            >
                              <Icon name="x" size={14} style={{ color: 'var(--text-3)' }} />
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })
          )}

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

      {/* Floating FAB: add item — matches demo's orange + button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          const el = document.querySelector('input[placeholder]') as HTMLInputElement | null;
          el?.focus();
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
        style={{
          position: 'absolute',
          bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          right: 'var(--page-px)',
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'var(--terra)',
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(196,113,74,0.45)',
          zIndex: 20,
          color: '#fff',
        }}
      >
        <Icon name="plus" size={22} />
      </motion.button>
    </div>
  );
}
