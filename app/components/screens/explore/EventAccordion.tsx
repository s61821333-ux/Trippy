'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import Icon from '../../ui/Icon';
import { StampIcon } from '../../ui/StampIcon';
import { CAT_META, CAT_FALLBACK, fmtDuration, toMins, toTime } from '@/lib/utils';
import { catStamp } from '@/lib/categoryStamp';
import { TripEvent } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

function QuickAction({ icon, label, onClick, color }: { icon: string; label: string; onClick: () => void; color: string }) {
  return (
    <m.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      style={{
        height: 38, padding: '0 12px', gap: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        background: 'var(--lg-panel-strong)', color: 'var(--lg-ink)',
        border: 'none', borderRadius: 9999, cursor: 'pointer',
        boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Icon name={icon as any} size={15} color={color} />
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </m.button>
  );
}

interface EventAccordionProps {
  event: TripEvent;
  index: number;
  onEdit: (e: TripEvent) => void;
  onSuggest: () => void;
}

export default function EventAccordion({ event, index, onEdit, onSuggest }: EventAccordionProps) {
  const [open, setOpen] = useState(false);
  const { locale } = useI18n();
  const { color } = catStamp(event.category);
  const meta = CAT_META[event.category];
  const stampKey = CAT_FALLBACK[event.category];
  const endT = toTime(toMins(event.time) + event.duration);

  return (
    <div className="lg a-rise" style={{ animationDelay: `${index * 0.05}s`, borderInlineStart: `3px solid ${color}`, margin: '0 20px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: 14, border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'start' }}
      >
        <div style={{ flex: 'none', textAlign: 'center', width: 42 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--lg-ink)' }}>{event.time}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{endT}</div>
        </div>
        <StampIcon iconKey={stampKey} size={42} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--lg-ink)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.name}
          </div>
          {event.location && (
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="pin" size={12} color="var(--text-3)" />
              {event.location}
            </div>
          )}
          <span style={{ display: 'inline-block', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color, background: `${color}1f`, padding: '3px 9px', borderRadius: 9999 }}>
            {meta?.label ?? event.category}
          </span>
        </div>
        <m.span animate={{ rotate: open ? 90 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} style={{ alignSelf: 'center', display: 'flex', flexShrink: 0 }}>
          <Icon name="chevR" size={18} color="var(--text-3)" />
        </m.span>
      </button>

      <div style={{ maxHeight: open ? 320 : 0, overflow: 'hidden', transition: 'max-height .4s var(--snap)' }}>
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 12%)', margin: '0 0 12px' }} />
          <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
            <div>
              <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{locale === 'he' ? 'משך' : 'Duration'}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>{event.time}–{endT} ({fmtDuration(event.duration)})</div>
            </div>
            {event.cost != null && event.cost > 0 && (
              <div>
                <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{locale === 'he' ? 'עלות' : 'Cost'}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>${event.cost}</div>
              </div>
            )}
          </div>
          {event.notes && <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)', margin: '0 0 14px' }}>{event.notes}</p>}
          <div className="lg-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            <QuickAction icon="edit"    label={locale === 'he' ? 'עריכה'    : 'Edit'}       color="var(--lg-forest)" onClick={() => { setOpen(false); onEdit(event); }} />
            <QuickAction icon="clock"   label={locale === 'he' ? 'שינוי זמן' : 'Reschedule'} color="var(--lg-terra)"  onClick={() => { setOpen(false); onEdit(event); }} />
            <QuickAction icon="sparkle" label={locale === 'he' ? 'הצע'      : 'Ideas'} color="var(--lg-sand)"  onClick={() => { setOpen(false); onSuggest(); }} />
          </div>
        </div>
      </div>
    </div>
  );
}
