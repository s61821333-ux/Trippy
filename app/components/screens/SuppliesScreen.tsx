'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';
import Ring from '../ui/Ring';
import { StampIcon } from '../ui/StampIcon';
import { supplyStamp } from '@/lib/categoryStamp';
import { useAppStore } from '@/lib/store';
import { SupplyItem } from '@/lib/types';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';

type Category = SupplyItem['category'];
const CATS: Category[] = ['Water', 'Food', 'Gear', 'Medical', 'Documents', 'Other'];

export default function SuppliesScreen() {
  const { supplies, toggleSupply, addSupplyItem, deleteSupplyItem, toggleSupplyCritical } = useAppStore();
  const { show } = useToast();
  const { t } = useI18n();

  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<Category>('Gear');
  const [newAssignee, setNewAssignee] = useState('');
  const [newCritical, setNewCritical] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = (filter === 'All' ? supplies : supplies.filter(s => s.category === filter))
    .slice()
    .sort((a, b) => {
      if (a.critical && !a.checked && !(b.critical && !b.checked)) return -1;
      if (b.critical && !b.checked && !(a.critical && !a.checked)) return 1;
      return Number(a.checked) - Number(b.checked);
    });

  const packed = supplies.filter(s => s.checked).length;
  const total = supplies.length;
  const allCriticalDone = supplies.filter(s => s.critical).every(s => s.checked);
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;
  const ringColor = pct === 100 && allCriticalDone ? 'var(--success)' : pct > 0 && !allCriticalDone ? 'var(--warning)' : 'var(--lg-terra)';

  const handleAdd = () => {
    if (!newName.trim()) { show(t('enterItemName')); return; }
    addSupplyItem(newName.trim(), newCat, newAssignee.trim() || undefined, newCritical);
    setNewName(''); setNewAssignee(''); setNewCritical(false);
    show(t('itemAdded'));
  };

  return (
    <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', padding: '6px 20px 130px' }}>
      {/* Header */}
      <p className="eyebrow-lg a-rise" style={{ color: 'var(--lg-terra)', marginBottom: 2 }}>
        {t('adventurePrep') as string || 'Adventure prep'}
      </p>
      <h1 className="display-xl a-rise d1" style={{ fontSize: 38, color: 'var(--lg-ink)', margin: '0 0 16px' }}>
        {t('suppliesLabel') as string || 'Packing'}
      </h1>

      {/* Progress card */}
      <div className="lg a-rise d2" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
        <Ring pct={pct} size={76} stroke={6} color={ringColor}>{pct}%</Ring>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--lg-ink)', lineHeight: 1.1 }}>
            {pct === 100 ? 'All packed!' : 'Almost there'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>
            {packed}/{total} {t('packedShared') as string || 'packed · shared with crew'}
          </div>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="lg-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 16 }}>
        {(['All', ...CATS] as const).map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              flexShrink: 0, border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 15px',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
              background: filter === c ? 'var(--lg-forest)' : 'var(--lg-panel)',
              backdropFilter: 'var(--lg-blur)',
              color: filter === c ? '#fff' : 'var(--text-2)',
              boxShadow: filter === c ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
              transition: 'all .3s',
            }}
          >
            {c === 'All' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 20px', textAlign: 'center' }}>
          <Icon name="checklist" size={40} color="var(--text-3)" />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', margin: 0 }}>Your bag is empty</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            {filter === 'All' ? 'Add your first item below' : `No ${String(filter).toLowerCase()} items yet`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.button
                key={item.id}
                layout
                className="lg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.16 } }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleSupply(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 13, padding: 13,
                  border: 0, cursor: 'pointer', textAlign: 'start',
                  opacity: item.checked ? 0.6 : 1,
                  transition: 'opacity .2s',
                  borderInlineStart: item.critical && !item.checked ? '3px solid var(--danger)' : 'none',
                }}
              >
                <StampIcon
                  iconKey={supplyStamp(item.category)}
                  size={38}
                  style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 6px oklch(20% 0.03 60 / 18%))' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)',
                    textDecoration: item.checked ? 'line-through' : 'none',
                    textDecorationColor: 'var(--text-3)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginTop: 2 }}>
                    {item.category}{item.assignee ? ` · ${item.assignee}` : ''}
                  </div>
                </div>
                {/* Critical flag */}
                <button
                  onClick={e => { e.stopPropagation(); toggleSupplyCritical(item.id); }}
                  aria-label={item.critical ? 'Unmark critical' : 'Mark critical'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="pin" size={14} color={item.critical ? 'var(--danger)' : 'var(--text-3)'} />
                </button>
                {/* Delete */}
                <button
                  onClick={e => { e.stopPropagation(); deleteSupplyItem(item.id); show(t('itemRemoved')); }}
                  aria-label="Remove item"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="x" size={14} color="var(--text-3)" />
                </button>
                {/* Check indicator */}
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: item.checked ? 'var(--lg-forest)' : 'transparent',
                  boxShadow: item.checked ? 'var(--lg-glow-forest)' : 'inset 0 0 0 2px oklch(50% 0.02 60 / 22%)',
                }}>
                  {item.checked && <Icon name="check" size={16} color="#fff" />}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add item panel */}
      <button
        onClick={() => setShowAdd(v => !v)}
        className="lg-btn lg-btn-glass"
        style={{ width: '100%', height: 48, gap: 8, marginBottom: 12 }}
      >
        <Icon name="plus" size={17} color="var(--lg-forest)" />
        {t('addItem') as string || 'Add an item'}
      </button>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="lg"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden', padding: 16 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={t('itemNamePlaceholder') as string || 'Item name'}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{
                  width: '100%', boxSizing: 'border-box', height: 48, border: 0, borderRadius: 14,
                  padding: '0 16px', fontFamily: 'var(--font-sans)', fontSize: 15,
                  color: 'var(--lg-ink)', outline: 'none',
                  background: 'var(--lg-panel-strong)',
                  boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
                }}
              />
              <input
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                placeholder={t('assigneePlaceholder') as string || 'Assignee (optional)'}
                style={{
                  width: '100%', boxSizing: 'border-box', height: 44, border: 0, borderRadius: 14,
                  padding: '0 16px', fontFamily: 'var(--font-sans)', fontSize: 14,
                  color: 'var(--lg-ink)', outline: 'none',
                  background: 'var(--lg-panel-strong)',
                  boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
                }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {CATS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewCat(c)}
                    style={{
                      border: 0, cursor: 'pointer', borderRadius: 9999, padding: '7px 13px',
                      fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5,
                      background: newCat === c ? 'var(--lg-forest)' : 'var(--lg-panel)',
                      color: newCat === c ? '#fff' : 'var(--text-2)',
                      boxShadow: newCat === c ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                      transition: 'all .25s',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setNewCritical(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', border: 0,
                  borderRadius: 9999, cursor: 'pointer', alignSelf: 'flex-start',
                  background: newCritical ? 'oklch(48% 0.130 25 / 12%)' : 'var(--lg-panel)',
                  color: newCritical ? 'var(--danger)' : 'var(--text-2)',
                  boxShadow: newCritical ? 'inset 0 0 0 1.5px var(--danger)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                }}
              >
                <Icon name="pin" size={14} color={newCritical ? 'var(--danger)' : 'var(--text-3)'} />
                {newCritical ? (t('unmarkCritical') as string || 'Critical') : (t('markCritical') as string || 'Mark critical')}
              </button>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={handleAdd}
                  className="lg-btn lg-btn-forest"
                  style={{ height: 48, flex: 1, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}
                >
                  {t('addItem') as string || 'Add item'}
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="lg-btn lg-btn-glass"
                  style={{ height: 48, padding: '0 20px' }}
                >
                  {t('cancel') as string || 'Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
