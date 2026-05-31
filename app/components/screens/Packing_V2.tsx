'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { useShallow as useShallowPacking } from 'zustand/react/shallow';
import { useI18n } from '@/lib/i18n';
import { StampIcon } from '../ui/StampIcon';
import { supplyStamp } from '@/lib/categoryStamp';
import Ring from '../ui/Ring';
import Icon from '../ui/Icon';
import Sheet from '../ui/Sheet';
import Field from '../ui/Field';
import GlassBtn from '../ui/GlassBtn';
import { useToast } from '../ui/Toast';
import { SupplyItem } from '@/lib/types';

// ── Category configuration ────────────────────────────────────────────────────

type FilterCat = 'All' | 'Documents' | 'Gear' | 'Health' | 'Food' | 'Water' | 'Other';
const FILTER_CATS: FilterCat[] = ['All', 'Documents', 'Gear', 'Health', 'Food', 'Water', 'Other'];

const STORE_CATS: SupplyItem['category'][] = ['Documents', 'Gear', 'Medical', 'Food', 'Water', 'Other'];
const STORE_CAT_LABELS: Record<SupplyItem['category'], string> = {
  Documents: 'Documents',
  Gear:      'Gear',
  Medical:   'Health',
  Food:      'Food',
  Water:     'Water',
  Other:     'Other',
};

function storeToFilter(cat: string): FilterCat | null {
  if (cat === 'Medical') return 'Health';
  if (FILTER_CATS.includes(cat as FilterCat)) return cat as FilterCat;
  return null;
}

// ── Auto-categorize ───────────────────────────────────────────────────────────

function autoCategory(name: string): SupplyItem['category'] {
  const n = name.toLowerCase();
  if (/passport|visa|ticket|boarding|document|id card|insurance|permit|certificate/i.test(n)) return 'Documents';
  if (/water|bottle|hydration|filter|purif/i.test(n)) return 'Water';
  if (/food|snack|protein|bar|nuts|bread|fruit|meal|sandwich|granola/i.test(n)) return 'Food';
  if (/medicine|medical|first aid|bandage|pill|tablet|spray|sunscreen|cream|lotion|antiseptic|painkiller|antibiotic|plaster|syringe/i.test(n)) return 'Medical';
  if (/tent|sleeping|backpack|jacket|coat|boot|shoe|sock|hat|glove|rope|compass|headlamp|torch|knife|lighter|matches|camera|battery|charger|cable|adapter|towel|umbrella|bag|luggage|gear/i.test(n)) return 'Gear';
  return 'Other';
}

// ── Check circle ──────────────────────────────────────────────────────────────

function CheckCircle({ done }: { done: boolean }) {
  return (
    <m.span
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

// ── Add Item Sheet ────────────────────────────────────────────────────────────

function AddItemSheet({ onClose }: { onClose: () => void }) {
  const { addSupplyItem, trip } = useAppStore();
  const { show } = useToast();
  const { locale } = useI18n();

  const [itemName,  setItemName]  = useState('');
  const [category,  setCategory]  = useState<SupplyItem['category']>('Gear');
  const [assignee,  setAssignee]  = useState('');
  const [autoDetected, setAutoDetected] = useState(false);

  const crewNames = (trip?.participants ?? []).map(p => p.name);

  const handleNameChange = (v: string) => {
    setItemName(v);
    if (v.trim().length > 2) {
      const detected = autoCategory(v);
      setCategory(detected);
      setAutoDetected(true);
    } else {
      setAutoDetected(false);
    }
  };

  const handleSave = () => {
    if (!itemName.trim()) { show(locale === 'he' ? 'הכנס שם פריט' : 'Enter an item name'); return; }
    addSupplyItem(itemName.trim(), category, assignee.trim() || undefined);
    show(locale === 'he' ? 'פריט נוסף' : 'Item added');
    onClose();
  };

  const monoLabel: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-3)', marginBottom: 8, fontWeight: 600,
  };

  return (
    <Sheet
      title={locale === 'he' ? 'הוסף פריט' : 'Add packing item'}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <Field
            label={locale === 'he' ? 'שם הפריט' : 'Item name'}
            placeholder="e.g. Sunscreen, Passport…"
            value={itemName}
            onChange={handleNameChange}
            autoFocus
          />
          {autoDetected && (
            <p style={{ fontSize: 11, color: 'var(--lg-forest)', marginTop: 5, fontFamily: 'var(--font-sans)' }}>
              Auto-categorized as {STORE_CAT_LABELS[category]}
            </p>
          )}
        </div>

        <div>
          <label style={monoLabel}>{locale === 'he' ? 'קטגוריה' : 'Category'}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {STORE_CATS.map(c => (
              <button
                key={c}
                onClick={() => { setCategory(c); setAutoDetected(false); }}
                style={{
                  border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 13px',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5,
                  background: category === c ? 'var(--lg-forest)' : 'var(--lg-panel)',
                  color: category === c ? '#fff' : 'var(--text-2)',
                  boxShadow: category === c ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                  transition: 'all .25s',
                }}
              >
                {STORE_CAT_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Assign to crew member */}
        {crewNames.length > 1 && (
          <div>
            <label style={monoLabel}>{locale === 'he' ? 'הקצה ל' : 'Assign to'}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {['Anyone', ...crewNames].map(name => (
                <button
                  key={name}
                  onClick={() => setAssignee(name === 'Anyone' ? '' : name)}
                  style={{
                    border: 0, cursor: 'pointer', borderRadius: 9999, padding: '7px 13px',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5,
                    background: (assignee === '' && name === 'Anyone') || assignee === name ? 'var(--lg-forest)' : 'var(--lg-panel)',
                    color: (assignee === '' && name === 'Anyone') || assignee === name ? '#fff' : 'var(--text-2)',
                    boxShadow: (assignee === '' && name === 'Anyone') || assignee === name ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                    transition: 'all .25s',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <GlassBtn variant="accent" size="lg" onClick={handleSave} style={{ flex: 2 }}>
            {locale === 'he' ? 'הוסף' : 'Add item'}
          </GlassBtn>
          <GlassBtn size="lg" onClick={onClose} style={{ flex: 1 }}>
            {locale === 'he' ? 'ביטול' : 'Cancel'}
          </GlassBtn>
        </div>
      </div>
    </Sheet>
  );
}

// ── Main Packing_V2 ───────────────────────────────────────────────────────────

export default function Packing_V2() {
  const { t, locale } = useI18n();

  const { trip, supplies, toggleSupply } = useAppStore(
    useShallow(s => ({ trip: s.trip, supplies: s.supplies, toggleSupply: s.toggleSupply }))
  );

  const [activeCat, setActiveCat] = useState<FilterCat>('All');
  const [showAdd,   setShowAdd]   = useState(false);

  const packed = supplies.filter(s => s.checked).length;
  const total  = supplies.length;
  const pct    = total > 0 ? Math.round((packed / total) * 100) : 0;

  const filtered = activeCat === 'All'
    ? supplies
    : supplies.filter(s => storeToFilter(s.category) === activeCat);

  if (!trip) return null;

  return (
    <div
      className="lg-scroll"
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}
    >
      <div className="resp-container" style={{ padding: '6px 20px 130px' }}>
      {/* ── Header ── */}
      <m.p
        className="eyebrow-lg"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{ color: 'var(--lg-terra)', marginBottom: 2 }}
      >
        {t('adventurePrep') || 'Adventure prep'}
      </m.p>

      <m.h1
        className="display-xl"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontSize: 38, color: 'var(--lg-ink)', margin: '0 0 16px' }}
      >
        {t('suppliesLabel') || 'Packing'}
      </m.h1>

      {/* ── Progress card ── */}
      <m.div
        className="lg"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}
      >
        <Ring pct={pct} size={76} stroke={6} color="var(--lg-terra)">{pct}%</Ring>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--lg-ink)', lineHeight: 1.1 }}>
            {pct === 100
              ? (t('allPacked') || 'All packed!')
              : (t('almostThere') || 'Almost there')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>
            {packed}/{total} {t('packedShared') || 'packed · shared with crew'}
          </div>
        </div>

        {/* Add item button */}
        <button
          onClick={() => setShowAdd(true)}
          className="lg-btn lg-btn-forest"
          aria-label="Add packing item"
          style={{
            width: 42, height: 42, padding: 0, flexShrink: 0, borderRadius: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="plus" size={20} color="#fff" />
        </button>
      </m.div>

      {/* ── Category rail ── */}
      <div
        className="lg-scroll"
        role="group"
        aria-label="Filter by category"
        style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}
      >
        {FILTER_CATS.map(c => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            aria-pressed={activeCat === c}
            style={{
              flexShrink: 0, border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 15px',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
              background: activeCat === c ? 'var(--lg-forest)' : 'var(--lg-panel)',
              backdropFilter: 'var(--lg-blur)',
              color:      activeCat === c ? '#fff' : 'var(--text-2)',
              boxShadow:  activeCat === c ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
              transition: 'all .3s', whiteSpace: 'nowrap',
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
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + i * 0.04, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleSupply(item.id)}
              aria-label={`${item.name}${item.checked ? ', packed' : ', not packed'}`}
              aria-pressed={item.checked}
              className="lg"
              style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: 13, border: 0, cursor: 'pointer',
                textAlign: locale === 'he' ? 'right' : 'left',
                opacity: item.checked ? 0.6 : 1, transition: 'opacity 0.2s', width: '100%',
                WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
              }}
            >
              <StampIcon iconKey={stampKey} size={38} aria-hidden="true" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)', textDecoration: item.checked ? 'line-through var(--text-3)' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginTop: 2 }}>
                  {STORE_CAT_LABELS[item.category] ?? item.category}
                  {item.assignee && ` · ${item.assignee}`}
                </div>
              </div>
              <CheckCircle done={item.checked} />
            </m.button>
          );
        })}

        {total === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 14 }}>
              <Icon name="checklist" size={40} color="var(--text-3)" />
            </div>
            <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--lg-ink)' }}>
              Nothing packed yet.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="lg-btn lg-btn-forest"
              style={{ height: 44, padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: 7 }}
            >
              <Icon name="plus" size={16} color="#fff" />
              Add first item
            </button>
          </div>
        )}
        {total > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-3)' }}>
            {locale === 'he' ? 'אין פריטים בקטגוריה זו' : 'No items in this category'}
          </div>
        )}
      </div>

      {/* Add item floating button (visible when list is not empty) */}
      {total > 0 && (
        <m.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setShowAdd(true)}
          className="lg-btn lg-btn-glass"
          style={{
            width: '100%', height: 50, marginTop: 16, gap: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="plus" size={17} color="var(--lg-forest)" />
          {locale === 'he' ? 'הוסף פריט' : 'Add item'}
        </m.button>
      )}

      {showAdd && <AddItemSheet onClose={() => setShowAdd(false)} />}
      </div>{/* /resp-container */}
    </div>
  );
}
