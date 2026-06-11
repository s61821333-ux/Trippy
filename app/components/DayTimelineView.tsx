'use client';

import React from 'react';
import { m } from 'framer-motion';
import { TripEvent } from '@/lib/types';
import { toMins } from '@/lib/utils';
import { EventIcon } from './ui/EventIcon';
import Icon from './ui/Icon';

const PX_PER_HOUR = 64;

// §5 timeline clip fix: use earliest event hour (min 06:00) so pre-7am
// events are never clipped. Computed per render in DayTimelineView.
function getStartHour(events: TripEvent[]): number {
  if (events.length === 0) return 7;
  const earliest = Math.min(...events.map(e => parseInt(e.time.split(':')[0], 10)));
  return Math.min(6, earliest);
}

function minutesToPx(mins: number, startHour: number): number {
  return ((mins - startHour * 60) * PX_PER_HOUR) / 60;
}

interface TimelineEvent {
  event: TripEvent;
  column: number;
  totalColumns: number;
  isConflict: boolean;
}

function resolveColumns(events: TripEvent[]): TimelineEvent[] {
  const result: TimelineEvent[] = [];
  const groups: TripEvent[][] = [];

  for (const ev of events) {
    const evStart = toMins(ev.time);
    const evEnd = evStart + ev.duration;
    let placed = false;
    for (const group of groups) {
      const overlaps = group.some(g => {
        const gStart = toMins(g.time);
        const gEnd = gStart + g.duration;
        return evStart < gEnd && evEnd > gStart;
      });
      if (overlaps) {
        group.push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([ev]);
  }

  const conflictIds = new Set<string>();
  for (const group of groups) {
    if (group.length > 1) group.forEach(e => conflictIds.add(e.id));
  }

  for (const group of groups) {
    const totalColumns = group.length;
    group.forEach((ev, col) => {
      result.push({ event: ev, column: col, totalColumns, isConflict: conflictIds.has(ev.id) });
    });
  }

  return result;
}

interface FreeGap {
  startMins: number;
  endMins: number;
}

function getFreeGaps(events: TripEvent[], dayEndHour: number, startHour: number): FreeGap[] {
  const gaps: FreeGap[] = [];
  const dayEnd = dayEndHour * 60;
  const sorted = [...events].sort((a, b) => toMins(a.time) - toMins(b.time));

  let cursor = startHour * 60;
  for (const ev of sorted) {
    const start = toMins(ev.time);
    if (start - cursor >= 30) gaps.push({ startMins: cursor, endMins: start });
    cursor = Math.max(cursor, start + ev.duration);
  }
  if (dayEnd - cursor >= 30) gaps.push({ startMins: cursor, endMins: dayEnd });
  return gaps;
}

interface DayTimelineViewProps {
  events: TripEvent[];
  dayEndHour: number;
  onAdd: (prefillTime: string) => void;
  onSuggest: (gapStart: number, gapEnd: number) => void;
  onFocus: (e: TripEvent) => void;
}

export default function DayTimelineView({ events, dayEndHour, onAdd, onSuggest, onFocus }: DayTimelineViewProps) {
  const startHour = getStartHour(events);
  const hours = Array.from({ length: dayEndHour - startHour }, (_, i) => startHour + i);
  const totalHeight = (dayEndHour - startHour) * PX_PER_HOUR;

  const resolved = resolveColumns(events);
  const gaps = getFreeGaps(events, dayEndHour, startHour);

  const toTimeStr = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px var(--page-px) 140px',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: totalHeight,
          minHeight: totalHeight,
        }}
      >
        {/* Hour grid lines */}
        {hours.map(h => (
          <div
            key={h}
            style={{
              position: 'absolute',
              top: (h - startHour) * PX_PER_HOUR,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'flex-start',
              pointerEvents: 'none',
            }}
          >
            <span style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-3)',
              fontWeight: 500,
              width: 40,
              flexShrink: 0,
              lineHeight: 1,
              paddingTop: 2,
            }}>
              {h.toString().padStart(2, '0')}:00
            </span>
            <div style={{
              flex: 1,
              borderTop: '1px solid var(--border)',
              opacity: 0.6,
              marginTop: 6,
            }} />
          </div>
        ))}

        {/* Free gap zones */}
        {gaps.map((gap, i) => {
          const top = minutesToPx(gap.startMins, startHour);
          const height = Math.max(28, minutesToPx(gap.endMins, startHour) - minutesToPx(gap.startMins, startHour));
          const gapMins = gap.endMins - gap.startMins;
          return (
            <m.div
              key={`gap-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute',
                top,
                left: 44,
                right: 0,
                height,
                border: '1.5px dashed var(--border)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingInlineStart: 10,
                backgroundColor: 'transparent',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="sparkle" size={10} aria-hidden />
                {gapMins}min free
              </span>
              <m.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onSuggest(gap.startMins, gap.endMins)}
                style={{
                  background: 'linear-gradient(135deg, rgba(91,79,207,0.12) 0%, rgba(59,126,212,0.12) 100%)',
                  border: '1px solid rgba(91,79,207,0.25)',
                  borderRadius: 100, padding: '3px 10px',
                  fontSize: 10, fontWeight: 700, color: '#5B4FCF',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Icon name="sparkle" size={10} /> AI Suggest
              </m.button>
              <m.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onAdd(toTimeStr(gap.startMins))}
                aria-label="Add event"
                style={{
                  background: 'var(--brand-muted)',
                  border: '1px solid rgba(59,110,82,0.25)',
                  borderRadius: 100, padding: '3px 8px',
                  fontSize: 10, fontWeight: 700, color: 'var(--brand)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                }}
              >
                <Icon name="plus" size={10} aria-hidden />
              </m.button>
            </m.div>
          );
        })}

        {/* Event blocks */}
        {resolved.map(({ event: ev, column, totalColumns, isConflict }) => {
          const startMins = toMins(ev.time);
          const top = Math.max(0, minutesToPx(startMins, startHour));
          const rawHeight = (ev.duration * PX_PER_HOUR) / 60;
          const height = Math.max(36, rawHeight);

          const colWidth = totalColumns > 1 ? `calc((100% - 44px) / ${totalColumns})` : 'calc(100% - 44px)';
          const colLeft = totalColumns > 1
            ? `calc(44px + (100% - 44px) / ${totalColumns} * ${column})`
            : '44px';

          const CAT_COLORS: Record<string, string> = {
            food: '#FFAA78', cafe: '#F2CC72', attraction: '#62CCFA',
            hotel: '#DC9EF4', rest: '#72E09A', transport: '#7CBAF2',
            flight: '#68AAEE', other: '#F2CA92',
          };
          const catColor = CAT_COLORS[ev.category] ?? '#ccc';

          return (
            <m.div
              key={ev.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={() => onFocus(ev)}
              role="button"
              tabIndex={0}
              aria-label={ev.name}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFocus(ev); } }}
              style={{
                position: 'absolute',
                top,
                left: colLeft,
                width: colWidth,
                height,
                borderRadius: 10,
                background: 'var(--surface)',
                border: isConflict
                  ? '1px solid var(--danger)'
                  : '1px solid var(--border)',
                borderLeft: isConflict ? '3px solid var(--danger)' : `3px solid ${catColor}`,
                boxShadow: 'var(--shadow-xs)',
                cursor: 'pointer',
                overflow: 'hidden',
                padding: '4px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 2,
                transition: 'box-shadow 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <EventIcon category={ev.category as any} size={12} style={{ color: catColor, flexShrink: 0 }} />
                <span style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}>
                  {ev.name}
                </span>
              </div>
              {height >= 48 && (
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {ev.time} · {ev.duration}min
                </span>
              )}
            </m.div>
          );
        })}
      </div>
    </div>
  );
}
