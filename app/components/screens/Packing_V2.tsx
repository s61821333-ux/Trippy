'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { m, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { StampIcon } from '../ui/StampIcon';
import { supplyStamp } from '@/lib/categoryStamp';
import Ring from '../ui/Ring';
import Icon from '../ui/Icon';
import Sheet from '../ui/Sheet';
import { PackLoader, BRAND_THEME } from '../ui/TripLoaders';
import Field from '../ui/Field';
import GlassBtn from '../ui/GlassBtn';
import Eyebrow from '../ui/Eyebrow';
import { useToast } from '../ui/Toast';
import { SupplyItem } from '@/lib/types';

// ── Category configuration ────────────────────────────────────────────────────

type FilterCat = 'All' | 'Documents' | 'Gear' | 'Health' | 'Food' | 'Water' | 'Other';
const FILTER_CATS: FilterCat[] = ['All', 'Documents', 'Gear', 'Health', 'Food', 'Water', 'Other'];

const STORE_CATS: SupplyItem['category'][] = ['Documents', 'Gear', 'Medical', 'Food', 'Water', 'Other'];
const STORE_CAT_LABELS_EN: Record<SupplyItem['category'], string> = {
  Documents: 'Documents',
  Gear:      'Gear',
  Medical:   'Health',
  Food:      'Food',
  Water:     'Drinks & Water',
  Other:     'Other',
};
const STORE_CAT_LABELS_HE: Record<SupplyItem['category'], string> = {
  Documents: 'מסמכים',
  Gear:      'ציוד',
  Medical:   'בריאות',
  Food:      'אוכל',
  Water:     'שתייה',
  Other:     'אחר',
};
function getCatLabel(cat: string, locale: string): string {
  const labels = locale === 'he' ? STORE_CAT_LABELS_HE : STORE_CAT_LABELS_EN;
  return (labels as Record<string, string>)[cat] ?? cat;
}
// Keep a default for backward compat in places that don't have locale
const STORE_CAT_LABELS = STORE_CAT_LABELS_EN;

// Accent colors that mirror stamp bg colors for visual coherence
const CAT_ACCENT: Record<string, string> = {
  Documents: '#1446B4',
  Gear:      '#3B6E52',
  Medical:   '#C0392B',
  Food:      '#C4714A',
  Water:     '#5BB4D2',
  Other:     '#C8944A',
};

function storeToFilter(cat: string): FilterCat | null {
  if (cat === 'Medical') return 'Health';
  if (FILTER_CATS.includes(cat as FilterCat)) return cat as FilterCat;
  return null;
}

// ── Auto-categorize ───────────────────────────────────────────────────────────

function autoCategory(name: string): SupplyItem['category'] {
  const n = name.toLowerCase();
  // Hebrew equivalents listed after the pipe - no case folding needed for Hebrew
  if (/passport|visa|ticket|boarding|document|id card|insurance|permit|certificate|דרכון|ויזה|כרטיס טיסה|ביטוח|תעודה|היתר|רישיון/i.test(n)) return 'Documents';
  if (/water|bottle|hydration|filter|purif|מים|בקבוק|סינון|מסנן/i.test(n)) return 'Water';
  if (/food|snack|protein|bar|nuts|bread|fruit|meal|sandwich|granola|אוכל|חטיף|פירות|לחם|ארוחה|כריך|אגוזים|פרוטאין/i.test(n)) return 'Food';
  if (/medicine|medical|first aid|bandage|pill|tablet|spray|sunscreen|cream|lotion|antiseptic|painkiller|antibiotic|plaster|syringe|תרופה|אנטיביוטיקה|קרם|משחה|תחבושת|כדור|ספריי|משכך|חיטוי|פלסטר/i.test(n)) return 'Medical';
  if (/tent|sleeping|backpack|jacket|coat|boot|shoe|sock|hat|glove|rope|compass|headlamp|torch|knife|lighter|matches|camera|battery|charger|cable|adapter|towel|umbrella|bag|luggage|gear|אוהל|שק שינה|תרמיל|מעיל|נעל|גרב|כובע|כפפה|חבל|מצפן|פנס|סכין|מצת|גפרורים|מצלמה|סוללה|מטען|מגבת|מטריה|תיק|ציוד/i.test(n)) return 'Gear';
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
        boxShadow:   done
          ? 'var(--lg-glow-forest), inset 0 1px 0 oklch(100% 0 0 / 30%)'
          : 'inset 0 0 0 2px oklch(50% 0.02 60 / 22%)',
        transition:  'background var(--dur-base), box-shadow var(--dur-base)',
      }}
      aria-hidden="true"
    >
      {done && <Icon name="check" size={14} color="#fff" />}
    </m.span>
  );
}

// ── Swipe-to-delete item row ──────────────────────────────────────────────────

function PackingItem({ item, i, onToggle, onDelete, locale }: {
  item: SupplyItem;
  i: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  locale: string;
}) {
  const x = useMotionValue(0);
  const DELETE_THRESHOLD = -72;
  const didDrag = React.useRef(false);
  const stampKey  = supplyStamp(item.category);
  const accentColor = CAT_ACCENT[item.category] ?? 'var(--lg-terra)';
  const isRTL = locale === 'he';

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.22 } }}
      transition={{ delay: 0.06 + i * 0.04, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      role="listitem"
      aria-label={`${item.name}${item.checked ? ', packed' : ', not packed'}`}
      style={{ position: 'relative', borderRadius: 20 }}
    >
      <m.div
        drag="x"
        dragConstraints={{ left: DELETE_THRESHOLD, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        whileTap={{ scale: 0.985 }}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (!didDrag.current && (e.key === 'Enter' || e.key === ' ')) onToggle(item.id);
        }}
        onDragStart={() => { didDrag.current = false; }}
        onDrag={(_, info) => { if (Math.abs(info.offset.x) > 5) didDrag.current = true; }}
        onDragEnd={(_, info) => {
          if (info.offset.x <= DELETE_THRESHOLD) {
            animate(x, -320, { duration: 0.18 }).then(() => onDelete(item.id));
          } else {
            animate(x, 0, { type: 'spring', stiffness: 500, damping: 35 });
          }
        }}
        onClick={() => {
          if (didDrag.current) { didDrag.current = false; return; }
          onToggle(item.id);
        }}
        aria-pressed={item.checked}
        style={{
          x,
          position: 'relative',
          display: 'flex', alignItems: 'center',
          padding: 0,
          textAlign: 'start',
          width: '100%',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'pan-y',
          borderRadius: 18,
          background: 'var(--lg-panel)',
          backdropFilter: 'blur(14px) saturate(1.7)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.7)',
          boxShadow: item.checked
            ? 'none'
            : 'var(--lg-shadow), inset 0 1px 0 oklch(100% 0 0 / 22%)',
          transition: 'box-shadow var(--dur-base)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {/* Category accent stripe */}
        <div
          aria-hidden="true"
          style={{
            flexShrink: 0,
            alignSelf: 'stretch',
            width: 4,
            background: accentColor,
            opacity: item.checked ? 0.3 : 0.9,
            transition: 'opacity var(--dur-base)',
            borderRadius: isRTL ? '0 18px 18px 0' : '18px 0 0 18px',
          }}
        />

        {/* Content - opacity only fades this inner layer, keeping glass bg opaque */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 11,
          flex: 1, minWidth: 0,
          padding: '12px 10px 12px 12px',
          opacity: item.checked ? 0.46 : 1,
          transition: 'opacity var(--dur-base)',
        }}>
          <StampIcon iconKey={stampKey} size={36} style={{ flexShrink: 0 }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14.5, fontWeight: 600, lineHeight: 1.3,
              color: 'var(--lg-ink)',
              textDecoration: item.checked ? `line-through oklch(60% 0.01 60 / 55%)` : 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600,
              color: item.checked ? 'var(--text-3)' : accentColor,
              marginTop: 2,
            }}>
              {getCatLabel(item.category, locale)}
              {item.assignee && ` · ${item.assignee}`}
            </div>
          </div>

          <CheckCircle done={item.checked} />
        </div>

        {/* Trash button - always visible, tapping deletes the item */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(item.id); }}
          aria-label={`Delete ${item.name}`}
          style={{
            flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0 14px 0 8px',
            alignSelf: 'stretch',
            display: 'flex', alignItems: 'center',
            color: 'var(--text-3)',
            opacity: 0.55,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            transition: 'opacity var(--dur-base)',
          }}
          onPointerEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          onPointerLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.55'; }}
        >
          <Icon name="trash" size={15} color="currentColor" />
        </button>
      </m.div>
    </m.div>
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
            autoComplete="off"
            autoFocus
          />
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
                  background: category === c ? 'var(--lg-forest)' : 'var(--field-bg)',
                  color: category === c ? '#fff' : 'var(--field-label)',
                  boxShadow: category === c ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px var(--field-border)',
                  transition: 'all var(--dur-base)',
                }}
              >
                {getCatLabel(c, locale)}
              </button>
            ))}
          </div>
          {autoDetected && (
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 7, fontFamily: 'var(--font-sans)', paddingInlineStart: 2 }}>
              {locale === 'he' ? `זוהה אוטומטית: ${getCatLabel(category, locale)} - אפשר לשנות` : `Suggested: ${getCatLabel(category, locale)} - tap to change`}
            </p>
          )}
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
                    background: (assignee === '' && name === 'Anyone') || assignee === name ? 'var(--lg-forest)' : 'var(--field-bg)',
                    color: (assignee === '' && name === 'Anyone') || assignee === name ? '#fff' : 'var(--field-label)',
                    boxShadow: (assignee === '' && name === 'Anyone') || assignee === name ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px var(--field-border)',
                    transition: 'all var(--dur-base)',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <GlassBtn variant="forest" size="lg" onClick={handleSave} style={{ flex: 2 }}>
            {locale === 'he' ? 'הוסף' : 'Add item'}
          </GlassBtn>
          <GlassBtn variant="ghost" size="lg" onClick={onClose} style={{ flex: 1, color: 'var(--text-2)' }}>
            {locale === 'he' ? 'ביטול' : 'Cancel'}
          </GlassBtn>
        </div>
      </div>
    </Sheet>
  );
}

// ── AI Packing Smart-Fill sheet ───────────────────────────────────────────────

type AISuggestedItem = { name: string; category: SupplyItem['category']; selected: boolean };


function AIPackingSheet({ trip, supplies, onClose }: {
  trip: NonNullable<ReturnType<typeof useAppStore.getState>['trip']>;
  supplies: SupplyItem[];
  onClose: () => void;
}) {
  const { addSupplyItem } = useAppStore();
  const { locale } = useI18n();
  const { show } = useToast();
  const isHe = locale === 'he';

  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestedItem[] | null>(null);
  const [fetched,     setFetched]     = useState(false);

  // Gather trip context
  const eventCats = useMemo(() => {
    const cats: string[] = [];
    for (let d = 1; d <= trip.days; d++) {
      for (const ev of trip.events[d] ?? []) cats.push(ev.category);
    }
    return [...new Set(cats)];
  }, [trip]);

  const existingNames = useMemo(() => supplies.map(s => s.name), [supplies]);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/ai/packing', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trip.countries?.join(', ') || trip.name,
          days:        trip.days,
          startDate:   trip.startDate,
          locale,
          existing:    existingNames,
          eventCats,
        }),
      });
      if (!res.ok) { setError(true); return; }
      const data = await res.json() as { items?: { name: string; category: SupplyItem['category'] }[] };
      if (data.items?.length) {
        setSuggestions(data.items.map(i => ({ ...i, selected: true })));
        setFetched(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [trip, locale, existingNames, eventCats]);

  // Kick off on mount
  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const toggle = (i: number) => setSuggestions(prev =>
    prev ? prev.map((s, idx) => idx === i ? { ...s, selected: !s.selected } : s) : prev
  );

  const handleAdd = () => {
    const toAdd = (suggestions ?? []).filter(s => s.selected);
    toAdd.forEach(s => addSupplyItem(s.name, s.category));
    show(isHe ? `${toAdd.length} פריטים נוספו` : `${toAdd.length} items added`);
    onClose();
  };

  // Group by category
  const grouped = useMemo(() => {
    if (!suggestions) return {};
    return suggestions.reduce<Record<string, { item: AISuggestedItem; idx: number }[]>>((acc, item, idx) => {
      const k = item.category;
      if (!acc[k]) acc[k] = [];
      acc[k].push({ item, idx });
      return acc;
    }, {});
  }, [suggestions]);

  const selectedCount = (suggestions ?? []).filter(s => s.selected).length;

  return (
    <Sheet title={isHe ? 'מה לארוז?' : 'What to pack?'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Loading state — official PackLoader from design system */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '32px 0 24px' }}>
            <PackLoader theme={BRAND_THEME} size={110} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--lg-ink)', margin: '0 0 5px' }}>
                {isHe ? 'מכין רשימת ציוד…' : 'Building your packing list…'}
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: 0 }}>
                {isHe ? 'מותאם לטיול ולפעילויות שלך' : 'Tailored to your trip & activities'}
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '36px 0 20px', textAlign: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1.5px oklch(50% 0.15 30 / 20%)',
            }}>
              <Icon name="x" size={26} color="var(--terra-text)" />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, color: 'var(--lg-ink)', margin: '0 0 5px' }}>
                {isHe ? 'לא הצלחנו לטעון' : "Couldn't load suggestions"}
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '0 0 18px' }}>
                {isHe ? 'בדוק חיבור לאינטרנט ונסה שוב' : 'Check your connection and try again'}
              </p>
              <button
                onClick={() => fetchSuggestions()}
                style={{
                  height: 46, padding: '0 26px', border: 0, borderRadius: 'var(--lg-r-btn)', cursor: 'pointer',
                  background: 'var(--lg-forest)', color: 'var(--text-inv)',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
                  boxShadow: 'var(--lg-glow-forest)',
                }}
              >
                {isHe ? 'נסה שוב' : 'Try again'}
              </button>
            </div>
          </div>
        )}

        {/* Suggestions list */}
        {!loading && !error && suggestions && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
                {isHe ? `${selectedCount} פריטים נבחרו` : `${selectedCount} items selected`}
              </p>
              <button
                onClick={() => setSuggestions(s => s?.map(i => ({ ...i, selected: !s.every(x => x.selected) })) ?? s)}
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {(suggestions.every(s => s.selected)) ? (isHe ? 'בטל הכל' : 'Deselect all') : (isHe ? 'בחר הכל' : 'Select all')}
              </button>
            </div>

            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 0 8px' }}>
                  <StampIcon iconKey={supplyStamp(cat)} size={22} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', margin: 0, fontWeight: 600 }}>
                    {getCatLabel(cat, isHe ? 'he' : 'en')}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map(({ item, idx }) => (
                    <button
                      key={idx}
                      onClick={() => toggle(idx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', border: 0, borderRadius: 14, cursor: 'pointer', textAlign: 'start',
                        background: item.selected ? 'var(--lg-panel)' : 'transparent',
                        boxShadow: item.selected ? 'inset 0 0 0 1.5px var(--lg-forest)' : 'var(--shadow-xs)',
                        transition: 'all var(--dur-fast)',
                      }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: item.selected ? 'var(--lg-forest)' : 'transparent',
                        boxShadow: item.selected ? 'var(--lg-glow-forest)' : 'inset 0 0 0 2px oklch(50% 0.02 60 / 25%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all var(--dur-fast)',
                      }}>
                        {item.selected && <Icon name="check" size={12} color="#fff" />}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--lg-ink)' }}>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={handleAdd}
                disabled={selectedCount === 0}
                style={{
                  flex: 2, height: 50, border: 0, borderRadius: 'var(--lg-r-btn)', cursor: 'pointer',
                  background: 'var(--lg-forest)', color: 'var(--text-inv)',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15,
                  boxShadow: 'var(--lg-glow-forest)',
                  opacity: selectedCount === 0 ? 0.4 : 1,
                }}
              >
                {isHe ? `הוסף ${selectedCount} פריטים` : `Add ${selectedCount} items`}
              </button>
              <button
                onClick={() => { setSuggestions(null); fetchSuggestions(); }}
                style={{
                  flex: 0, width: 50, height: 50, border: 0, borderRadius: 'var(--lg-r-btn)', cursor: 'pointer',
                  background: 'var(--lg-panel)', color: 'var(--text-2)',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="Refresh"
              >
                <Icon name="swap" size={17} color="var(--text-2)" />
              </button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}

// ── Section divider ────────────────────────────────────────────────────────────

function SectionDivider({
  label,
  count,
  open,
  onToggle,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '10px 2px', border: 0, cursor: 'pointer',
        background: 'none', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ flex: 1, height: 1, background: 'oklch(50% 0.01 60 / 14%)' }} />
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em',
        textTransform: 'uppercase', fontWeight: 700,
        color: 'var(--text-3)',
      }}>
        {label} · {count}
      </span>
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform var(--dur-base) ease',
        color: 'var(--text-3)',
      }}>
        <Icon name="chevR" size={13} color="var(--text-3)" />
      </span>
      <div style={{ flex: 1, height: 1, background: 'oklch(50% 0.01 60 / 14%)' }} />
    </button>
  );
}

// ── Main Packing_V2 ───────────────────────────────────────────────────────────

export default function Packing_V2() {
  const { t, locale } = useI18n();

  const { trip, supplies, suppliesLoaded, loadSupplies, toggleSupply, deleteSupplyItem } = useAppStore(
    useShallow(s => ({ trip: s.trip, supplies: s.supplies, suppliesLoaded: s.suppliesLoaded, loadSupplies: s.loadSupplies, toggleSupply: s.toggleSupply, deleteSupplyItem: s.deleteSupplyItem }))
  );

  useEffect(() => { loadSupplies(); }, [loadSupplies]);

  const [activeCat,  setActiveCat]  = useState<FilterCat>('All');
  const [showAdd,    setShowAdd]    = useState(false);
  const [showAI,     setShowAI]     = useState(false);
  const [packedOpen, setPackedOpen] = useState(true);

  const packed = supplies.filter(s => s.checked).length;
  const total  = supplies.length;
  const pct    = total > 0 ? Math.round((packed / total) * 100) : 0;

  const filtered = activeCat === 'All'
    ? supplies
    : supplies.filter(s => storeToFilter(s.category) === activeCat);

  const unpackedItems = filtered.filter(s => !s.checked);
  const packedItems   = filtered.filter(s =>  s.checked);
  const hasBothGroups = unpackedItems.length > 0 && packedItems.length > 0;

  if (!trip) return null;

  return (
    <div
      className="lg-scroll"
      style={{ height: '100%', overflowY: 'auto', background: 'transparent' }}
    >
      <div className="resp-container" style={{ padding: `6px 20px calc(130px + env(safe-area-inset-bottom, 0px))` }}>
        {!suppliesLoaded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 52, borderRadius: 12, background: 'var(--surface)', opacity: 0.6 + i * 0.05 }} className="skeleton" />
            ))}
          </div>
        )}

        {/* ── Header ── */}
        <m.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 14 }}
        >
          <Eyebrow tone="terra" style={{ marginBottom: 6 }}>
            {locale === 'he' ? 'הכנה להרפתקה' : 'Adventure prep'}
          </Eyebrow>
          <h1 className="text-display-sm" style={{ margin: 0 }}>
            {t('suppliesLabel') || (locale === 'he' ? 'ציוד' : 'Packing')}
          </h1>
        </m.div>

        {/* ── Progress card ── */}
        <m.div
          className="lg lg-strong"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 16, overflow: 'hidden', position: 'relative' }}
        >
          {/* Gradient tint - shifts terra→forest as you pack more */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
            background: pct === 100
              ? 'linear-gradient(135deg, oklch(50% 0.12 155 / 14%) 0%, transparent 65%)'
              : pct > 0
                ? `linear-gradient(135deg, oklch(62% 0.14 ${44 - pct * 0.16}deg / 10%) 0%, transparent 65%)`
                : 'none',
            transition: 'background var(--dur-slow) ease',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 16px', position: 'relative' }}>
            <Ring pct={pct} size={76} stroke={6} color={pct === 100 ? 'var(--lg-forest)' : 'var(--lg-terra)'} aria-label={locale === 'he' ? 'התקדמות אריזה' : 'Packing progress'}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{pct}%</span>
            </Ring>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-0.03em',
                fontSize: 19, color: 'var(--lg-ink)', lineHeight: 1.15,
                display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
              }}>
                {total === 0
                  ? (locale === 'he' ? 'מוכן להתחיל?' : 'Ready to pack?')
                  : pct === 100
                    ? <>{t('allPacked2')} <StampIcon iconKey="stargaze" size={22} /></>
                    : t('almostThere')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 5 }}>
                {total === 0
                  ? (locale === 'he' ? 'הוסף פריטים לרשימה' : 'Start adding items below')
                  : (
                    <span>
                      <span style={{ fontWeight: 700, color: pct === 100 ? 'var(--lg-forest)' : 'var(--lg-terra)' }}>
                        {packed}
                      </span>
                      <span style={{ color: 'var(--text-3)' }}>/{total}</span>
                      {' '}
                      {t('packedShared')}
                    </span>
                  )}
              </div>
            </div>

            {/* AI fill + add buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setShowAI(true)}
                className="lg-btn"
                aria-label={locale === 'he' ? 'רעיונות לציוד' : 'Packing suggestions'}
                title={locale === 'he' ? 'רעיונות לפריטי ציוד' : 'Get packing suggestions'}
                style={{
                  width: 40, height: 40, padding: 0, borderRadius: 9999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--lg-panel)',
                  boxShadow: 'inset 0 0 0 1.5px var(--lg-terra), var(--lg-shadow)',
                }}
              >
                <Icon name="sparkle" size={16} color="var(--lg-terra)" />
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="lg-btn lg-btn-forest"
                aria-label={locale === 'he' ? 'הוסף פריט' : 'Add item'}
                style={{
                  width: 40, height: 40, padding: 0, borderRadius: 9999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="plus" size={19} color="#fff" />
              </button>
            </div>
          </div>
        </m.div>

        {/* ── Category filter rail ── */}
        <div
          role="group"
          aria-label="Filter by category"
          style={{
            display: 'flex', gap: 7, overflowX: 'auto', paddingTop: 28, paddingBottom: 48, paddingInline: 2, marginTop: -28, marginBottom: -28,
            scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 8px, black calc(100% - 8px), transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0, black 8px, black calc(100% - 8px), transparent 100%)',
          } as React.CSSProperties}
        >
          {FILTER_CATS.map(c => {
            const isActive = activeCat === c;
            const accent = c !== 'All' && c !== 'Health'
              ? CAT_ACCENT[c]
              : c === 'Health' ? CAT_ACCENT['Medical'] : undefined;
            const label = c === 'All' ? t('packCatAll')
              : c === 'Documents' ? t('packCatDocuments')
              : c === 'Gear' ? t('packCatGear')
              : c === 'Health' ? t('packCatHealth')
              : c === 'Food' ? t('packCatFood')
              : c === 'Water' ? t('packCatDrinks')
              : t('packCatOther');
            return (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                aria-pressed={isActive}
                style={{
                  flexShrink: 0, border: 0, cursor: 'pointer', borderRadius: 9999,
                  padding: '8px 14px', scrollSnapAlign: 'start',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                  background: isActive ? 'var(--lg-forest)' : 'var(--surface-2)',
                  color:      isActive ? '#fff' : 'var(--text-2)',
                  boxShadow:  isActive
                    ? 'var(--lg-glow-forest), inset 0 1px 0 oklch(100% 0 0 / 28%)'
                    : 'var(--shadow-sm), inset 0 1px 0 oklch(100% 0 0 / 65%), inset 0 0 0 1px oklch(100% 0 0 / 18%)',
                  backdropFilter: isActive ? undefined : 'blur(16px) saturate(1.6)',
                  WebkitBackdropFilter: isActive ? undefined : 'blur(16px) saturate(1.6)',
                  transition: 'all var(--dur-base)', whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {!isActive && accent && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: accent, flexShrink: 0, opacity: 0.85,
                  }} />
                )}
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Item list ── */}
        <div
          role="list"
          aria-label={t('suppliesLabel') || 'Packing list'}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <AnimatePresence initial={false}>
            {unpackedItems.map((item, i) => (
              <PackingItem
                key={item.id}
                item={item}
                i={i}
                onToggle={toggleSupply}
                onDelete={deleteSupplyItem}
                locale={locale}
              />
            ))}
          </AnimatePresence>

          {/* Packed section */}
          {packedItems.length > 0 && (
            <>
              <SectionDivider
                label={locale === 'he' ? 'ארוז' : 'Packed'}
                count={packedItems.length}
                open={packedOpen}
                onToggle={() => setPackedOpen(p => !p)}
              />
              <AnimatePresence initial={false}>
                {packedOpen && packedItems.map((item, i) => (
                  <PackingItem
                    key={item.id}
                    item={item}
                    i={i}
                    onToggle={toggleSupply}
                    onDelete={deleteSupplyItem}
                    locale={locale}
                  />
                ))}
              </AnimatePresence>
            </>
          )}

          {/* Empty states */}
          {total === 0 && (
            <m.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center', padding: '48px 24px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}
            >
              <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
                <StampIcon iconKey="backpack" size={80} />
              </div>
              <p className="text-display-sm" style={{ margin: '0 0 8px' }}>
                {locale === 'he' ? 'הרשימה ריקה' : 'Your packing list is empty'}
              </p>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-3)' }}>
                {locale === 'he' ? 'הוסף פריטים שתצטרך לטיול' : 'Add items you\'ll need for this trip'}
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="lg-btn lg-btn-forest"
                style={{ height: 46, padding: '0 22px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}
              >
                <Icon name="plus" size={16} color="#fff" />
                {locale === 'he' ? 'הוסף את הפריט הראשון' : 'Add your first item'}
              </button>
            </m.div>
          )}
          {total > 0 && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-3)' }}>
              {locale === 'he' ? 'אין פריטים בקטגוריה זו' : 'No items in this category'}
            </div>
          )}
        </div>

        {/* Add item button (when list is not empty) */}
        {total > 0 && (
          <m.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setShowAdd(true)}
            className="lg-btn lg-btn-forest"
            style={{
              width: '100%', height: 52, marginTop: 16, gap: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
            }}
          >
            <Icon name="plus" size={16} color="#fff" />
            {locale === 'he' ? 'הוסף פריט' : 'Add item'}
          </m.button>
        )}

        {showAdd && <AddItemSheet onClose={() => setShowAdd(false)} />}
        {showAI && trip && (
          <AIPackingSheet
            trip={trip}
            supplies={supplies}
            onClose={() => setShowAI(false)}
          />
        )}
      </div>{/* /resp-container */}
    </div>
  );
}

