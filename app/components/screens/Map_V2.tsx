'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getCurrencySymbol } from '@/lib/currency';
import type { MapEvent } from '../ui/LeafletMap';
import Icon from '../ui/Icon';

// ── Dynamically import Leaflet (client-only, no SSR) ─────────────────────────

const LeafletMap = dynamic(() => import('../ui/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(165deg, #E3EBE4 0%, #DCE6DD 35%, #EBE2D2 70%, #E8DCC8 100%)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid transparent',
        borderTopColor: '#C4714A',
        animation: 'spin 0.9s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  ),
});

// ── Day-label colours (matches LeafletMap palette) ───────────────────────────

const DAY_PALETTE = [
  '#C4714A', '#3B6E52', '#6B5CE7', '#2B7A8E',
  '#D4531A', '#C8944A', '#E05A3A', '#1B6A8A',
];

// ── Event-detail card shown when a pin is tapped ─────────────────────────────

function EventCard({
  ev,
  currSym,
  onClose,
  onGoToDay,
}: {
  ev: MapEvent;
  currSym: string;
  onClose: () => void;
  onGoToDay: (day: number) => void;
}) {
  const dayColor = DAY_PALETTE[(ev.day - 1) % DAY_PALETTE.length];

  return (
    <m.div
      key={ev.id}
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="lg lg-strong"
      style={{ padding: '14px 16px', borderRadius: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Day badge */}
        <div style={{
          flexShrink: 0, width: 40, height: 40, borderRadius: 12,
          background: dayColor,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,.8)', lineHeight: 1, letterSpacing: '0.05em' }}>DAY</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: '#fff', lineHeight: 1 }}>{ev.day}</span>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ev.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{ev.time}</span>
            {ev.location && (
              <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icon name="pin" size={11} color="var(--text-3)" />
                {ev.location}
              </span>
            )}
            {ev.cost != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--lg-terra)' }}>
                {currSym}{ev.cost}
              </span>
            )}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
        >
          <Icon name="x" size={16} color="var(--text-3)" />
        </button>
      </div>

      {/* Go-to-day button */}
      <button
        onClick={() => onGoToDay(ev.day)}
        style={{
          marginTop: 12, width: '100%', height: 40, border: 0, borderRadius: 12, cursor: 'pointer',
          background: dayColor, color: '#fff',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}
      >
        <Icon name="compass" size={14} color="#fff" />
        Open Day {ev.day}
      </button>
    </m.div>
  );
}

// ── No-pins empty state ───────────────────────────────────────────────────────

function EmptyMapState({ onGoToDay }: { onGoToDay: (d: number) => void }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.45 }}
      className="lg lg-strong"
      style={{ padding: '18px 16px', borderRadius: 20, textAlign: 'center' }}
    >
      <Icon name="map" size={32} color="var(--text-3)" />
      <p style={{ margin: '10px 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--lg-ink)' }}>
        No locations yet
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
        Add a location to events on your day plan and they'll appear here as pins.
      </p>
      <button
        onClick={() => onGoToDay(1)}
        style={{
          height: 38, padding: '0 18px', border: 0, borderRadius: 10, cursor: 'pointer',
          background: 'var(--lg-forest)', color: '#fff',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
      >
        <Icon name="compass" size={14} color="#fff" />
        Add events
      </button>
    </m.div>
  );
}

// ── Day legend pill ───────────────────────────────────────────────────────────

function DayLegend({ days, selectedDay, onSelect }: {
  days: number;
  selectedDay: number | null;
  onSelect: (d: number | null) => void;
}) {
  return (
    <div
      className="lg-scroll"
      style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}
    >
      <button
        onClick={() => onSelect(null)}
        style={{
          flexShrink: 0, height: 30, padding: '0 12px', borderRadius: 9999, border: 0, cursor: 'pointer',
          background: selectedDay == null ? 'var(--lg-terra)' : 'var(--lg-panel)',
          color: selectedDay == null ? '#fff' : 'var(--text-3)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.06em', boxShadow: selectedDay == null ? 'var(--lg-glow-terra)' : 'none',
          transition: 'all .2s',
        }}
      >
        ALL
      </button>
      {Array.from({ length: days }, (_, i) => i + 1).map(d => (
        <button
          key={d}
          onClick={() => onSelect(selectedDay === d ? null : d)}
          style={{
            flexShrink: 0, height: 30, padding: '0 12px', borderRadius: 9999, border: 0, cursor: 'pointer',
            background: selectedDay === d ? DAY_PALETTE[(d - 1) % DAY_PALETTE.length] : 'var(--lg-panel)',
            color: selectedDay === d ? '#fff' : 'var(--text-3)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            transition: 'all .2s',
          }}
        >
          D{d}
        </button>
      ))}
    </div>
  );
}

// ── Main Map_V2 ───────────────────────────────────────────────────────────────

export default function Map_V2() {
  const { trip, setScreen, setActiveDay, tripDbId, currencyByTrip } = useAppStore(
    useShallow(s => ({
      trip:           s.trip,
      setScreen:      s.setScreen,
      setActiveDay:   s.setActiveDay,
      tripDbId:       s.tripDbId,
      currencyByTrip: s.currencyByTrip,
    }))
  );
  const { t } = useI18n();

  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [filterDay,   setFilterDay]   = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currency = (tripDbId && currencyByTrip[tripDbId]) || 'USD';
  const currSym  = getCurrencySymbol(currency);

  // Collect all geocoded events
  const allMapEvents = useMemo<MapEvent[]>(() => {
    if (!trip) return [];
    const out: MapEvent[] = [];
    for (let d = 1; d <= trip.days; d++) {
      for (const ev of trip.events[d] ?? []) {
        if (ev.lat != null && ev.lng != null) {
          out.push({
            id:       ev.id,
            name:     ev.name,
            category: ev.category,
            lat:      ev.lat,
            lng:      ev.lng,
            day:      d,
            time:     ev.time,
            location: ev.location,
            cost:     ev.cost,
          });
        }
      }
    }
    return out;
  }, [trip]);

  // Apply day filter + search
  const visibleEvents = useMemo(() => {
    let evs = allMapEvents;
    if (filterDay != null) evs = evs.filter(e => e.day === filterDay);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      evs = evs.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.location ?? '').toLowerCase().includes(q)
      );
    }
    return evs;
  }, [allMapEvents, filterDay, searchQuery]);

  const selectedEvent = visibleEvents.find(e => e.id === selectedId) ?? null;

  const handleGoToDay = (day: number) => {
    setActiveDay(day);
    setScreen('day');
  };

  const tileApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '';

  if (!trip) return null;

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* ── Real Leaflet map (full bleed) ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <LeafletMap
          events={visibleEvents}
          selectedId={selectedId}
          onSelect={ev => setSelectedId(ev?.id ?? null)}
          tileApiKey={tileApiKey}
        />
      </div>

      {/* ── Top controls overlay ── */}
      <div style={{
        position: 'absolute', top: 56, left: 16, right: 16,
        display: 'flex', flexDirection: 'column', gap: 10, zIndex: 20,
        pointerEvents: 'none',
      }}>
        {/* Search bar */}
        <div
          className="lg lg-strong"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 14px', borderRadius: 9999, height: 44,
            pointerEvents: 'auto',
          }}
        >
          <Icon name="search" size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events…"
            aria-label="Search events"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'var(--text)', caretColor: 'var(--lg-terra)', minWidth: 0,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px 4px', flexShrink: 0 }}
            >
              <Icon name="x" size={14} />
            </button>
          )}
          {allMapEvents.length > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>
              {visibleEvents.length}/{allMapEvents.length}
            </span>
          )}
        </div>

        {/* Day filter strip */}
        {trip.days > 1 && (
          <div style={{ pointerEvents: 'auto' }}>
            <DayLegend days={trip.days} selectedDay={filterDay} onSelect={setFilterDay} />
          </div>
        )}
      </div>

      {/* ── Bottom card: event detail OR empty state ── */}
      <div style={{
        position: 'absolute', left: 16, right: 16,
        bottom: 'calc(var(--nav-total-h, 92px) + 8px)',
        zIndex: 20,
      }}>
        <AnimatePresence mode="wait">
          {selectedEvent ? (
            <EventCard
              key={selectedEvent.id}
              ev={selectedEvent}
              currSym={currSym}
              onClose={() => setSelectedId(null)}
              onGoToDay={handleGoToDay}
            />
          ) : allMapEvents.length === 0 ? (
            <EmptyMapState key="empty" onGoToDay={handleGoToDay} />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
