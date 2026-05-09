'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Icon from '../ui/Icon';
import Field from '../ui/Field';
import Sheet from '../ui/Sheet';
import PlacesInput from '../ui/PlacesInput';
import { useAppStore } from '@/lib/store';
import { CAT_META, fmtDate, fmtDuration, toMins, toTime, getConflicts, getGoldenHourType, getDayBudget } from '@/lib/utils';
import { Category, TripEvent } from '@/lib/types';
import { useToast } from '../ui/Toast';
import SuggestionsSheet from '../SuggestionsSheet';
import { useI18n, TranslationKey } from '@/lib/i18n';

const CATEGORIES: Category[] = ['food', 'cafe', 'attraction', 'hotel', 'rest', 'transport', 'flight', 'other'];
const DAY_ABBREVS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const CAT_GRADIENTS: Record<Category, string> = {
  food:       'linear-gradient(135deg, #E8A87C 0%, #C4714A 100%)',
  cafe:       'linear-gradient(135deg, #D4A96A 0%, #9A6830 100%)',
  attraction: 'linear-gradient(135deg, #7BBCD4 0%, #3B7E9E 100%)',
  hotel:      'linear-gradient(135deg, #C48AD4 0%, #7A3A9E 100%)',
  rest:       'linear-gradient(135deg, #8BC48A 0%, #3B6E52 100%)',
  transport:  'linear-gradient(135deg, #8EA8D4 0%, #4A6EAE 100%)',
  flight:     'linear-gradient(135deg, #6B9FD4 0%, #1A3F8A 100%)',
  other:      'linear-gradient(135deg, #C4A87A 0%, #8A6440 100%)',
};

/* ── Category thumbnail ────────────────────────────────────────── */
function EventThumbnail({ category }: { category: Category }) {
  const meta = CAT_META[category];
  return (
    <div style={{
      width: 68, height: 68,
      borderRadius: 14,
      background: CAT_GRADIENTS[category],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 28,
      flexShrink: 0,
    }}>
      {meta.icon}
    </div>
  );
}

/* ── Route connector between events ──────────────────────────── */
interface ConnectorProps {
  gapMins: number;
  gapStart: number;
  fromEv?: TripEvent;
  toEv?: TripEvent;
  onSuggest: () => void;
  onAdd: () => void;
  t: (k: TranslationKey) => string;
}

function RouteConnector({ gapMins, gapStart: _gapStart, fromEv, toEv, onSuggest, onAdd, t }: ConnectorProps) {
  const [travelMins, setTravelMins] = useState<number | null>(null);
  const [travelKm,   setTravelKm]   = useState<number | null>(null);
  const [fetching,   setFetching]   = useState(false);

  const isFree    = gapMins >= 45;
  const canRoute  = !!(fromEv?.lat && fromEv?.lng && toEv?.lat && toEv?.lng);

  useEffect(() => {
    if (!canRoute) return;
    setFetching(true);
    setTravelMins(null);
    const key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '';
    fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${fromEv!.lat},${fromEv!.lng}|${toEv!.lat},${toEv!.lng}&mode=drive&apiKey=${key}`
    )
      .then(r => r.json())
      .then(d => {
        const p = d?.features?.[0]?.properties;
        if (p?.time != null) {
          setTravelMins(Math.max(1, Math.round(p.time / 60)));
          setTravelKm(p.distance != null ? Math.round(p.distance / 100) / 10 : null);
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  // re-fetch only when coordinates change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromEv?.lat, fromEv?.lng, toEv?.lat, toEv?.lng]);

  const dashColor = isFree ? 'var(--warning)' : travelMins !== null ? 'rgba(99,102,241,0.6)' : 'var(--border)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '4px var(--page-px) 4px calc(var(--page-px) + 12px)',
    }}>
      {/* Dashed vertical timeline thread */}
      <div style={{
        width: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 2, height: 6, borderRadius: 1, marginBottom: 3,
            background: dashColor,
            opacity: isFree ? (1 - i * 0.25) : 0.45,
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>

        {/* ── Estimated travel time badge ── */}
        {fetching ? (
          <span style={{
            fontSize: 11, fontWeight: 500, color: 'var(--text-3)',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', lineHeight: 1 }}
            >
              ⟳
            </motion.span>
            Estimating travel time…
          </span>
        ) : travelMins !== null ? (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: '#4F46E5',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.22)',
            borderRadius: 100,
            padding: '4px 11px',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            letterSpacing: '0.01em',
          }}>
            🚗 Estimated Travel Time
            <span style={{ opacity: 0.45, fontWeight: 400 }}>·</span>
            {fmtDuration(travelMins)}
            {travelKm !== null && (
              <>
                <span style={{ opacity: 0.45, fontWeight: 400 }}>·</span>
                {travelKm} km
              </>
            )}
          </span>
        ) : null}

        {/* ── Free time badge + AI suggest ── */}
        {isFree && (
          <>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--warning)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              ⚡ {fmtDuration(gapMins)} {t('freeTime')}
            </span>
            <motion.button
              whileTap={{ scale: 0.90 }}
              onClick={onSuggest}
              style={{
                background: 'linear-gradient(135deg, rgba(91,79,207,0.12) 0%, rgba(59,126,212,0.12) 100%)',
                border: '1px solid rgba(91,79,207,0.25)',
                borderRadius: 100, padding: '4px 12px',
                fontSize: 10, fontWeight: 700,
                color: '#5B4FCF',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <Icon name="sparkle" size={10} /> {t('suggestBtn')}
            </motion.button>
          </>
        )}

        {/* ── Add event button ── */}
        <motion.button
          whileTap={{ scale: 0.90 }}
          onClick={onAdd}
          style={{
            background: 'var(--brand-muted)',
            border: '1px solid rgba(59,110,82,0.25)',
            borderRadius: 100, padding: '4px 10px',
            fontSize: 10, fontWeight: 700,
            color: 'var(--brand)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <Icon name="plus" size={10} />
        </motion.button>
      </div>
    </div>
  );
}

/* ── Event card ───────────────────────────────────────────────── */
interface EventCardProps {
  event: TripEvent;
  onEdit: (e: TripEvent) => void;
  onDelete: (id: string) => void;
  onReschedule: (e: TripEvent, newTime: string) => void;
  isConflict: boolean;
  goldenHour: 'sunrise' | 'sunset' | null;
  nickname: string;
  dayNumber: number;
}

function EventCard({ event, onEdit, onDelete, onReschedule, isConflict, goldenHour, nickname, dayNumber }: EventCardProps) {
  const meta          = CAT_META[event.category];
  const endT          = toTime(toMins(event.time) + event.duration);
  const { voteEvent } = useAppStore();

  const [rescheduling, setRescheduling] = useState(false);
  const [pendingTime,  setPendingTime]  = useState(event.time);

  // Reset local time whenever the store updates the event
  useEffect(() => { setPendingTime(event.time); }, [event.time]);

  const openReschedule = () => { setPendingTime(event.time); setRescheduling(true); };
  const cancelReschedule = () => setRescheduling(false);
  const shift = (mins: number) =>
    setPendingTime(t => toTime(Math.max(0, Math.min(23 * 60 + 55, toMins(t) + mins))));
  const confirm = () => {
    onReschedule(event, pendingTime);
    setRescheduling(false);
  };

  const upVotes   = Object.values(event.votes ?? {}).filter(v => v === 'up').length;
  const downVotes = Object.values(event.votes ?? {}).filter(v => v === 'down').length;
  const myVote    = (event.votes ?? {})[nickname];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.16 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0 var(--page-px)' }}
    >
      {/* Timeline dot */}
      <div style={{
        width: 22, height: 22, marginTop: 18, borderRadius: '50%', flexShrink: 0,
        border: isConflict ? '2px solid var(--danger)' : '2px dashed var(--border-strong)',
        background: isConflict ? 'var(--danger-bg)' : 'transparent',
      }} />

      {/* Card */}
      <div style={{
        flex: 1,
        background: 'var(--surface)',
        borderRadius: 18,
        boxShadow: rescheduling
          ? '0 0 0 2px var(--brand), 0 4px 20px rgba(0,0,0,0.12)'
          : isConflict
            ? '0 0 0 1.5px var(--danger), 0 2px 8px rgba(0,0,0,0.07)'
            : '0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        border: rescheduling ? '1.5px solid var(--brand)' : isConflict ? '1.5px solid var(--danger)' : '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'box-shadow 0.18s, border 0.18s',
      }}>
        {isConflict && !rescheduling && (
          <div style={{ width: '100%', height: 4, background: 'var(--danger)' }} />
        )}

        {/* Main content row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' }}>
          <EventThumbnail category={event.category} />

          <div style={{ flex: 1, minWidth: 0 }}>
            {(isConflict || goldenHour) && (
              <div style={{ display: 'flex', gap: 5, marginBottom: 5, flexWrap: 'wrap' }}>
                {isConflict && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: 'var(--danger-bg)', color: 'var(--danger)',
                    borderRadius: 100, padding: '2px 8px',
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
                  }}>⚠️ Overlap</span>
                )}
                {goldenHour && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: 'rgba(212,160,50,0.15)', color: 'var(--sand)',
                    borderRadius: 100, padding: '2px 8px',
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
                  }}>
                    {goldenHour === 'sunset' ? '🌅 Golden Hour' : '🌄 Sunrise'}
                  </span>
                )}
              </div>
            )}

            <p style={{
              fontSize: 15, fontWeight: 800, color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginBottom: 3, letterSpacing: '-0.01em',
            }}>
              {event.name}
            </p>

            {/* Time chip — tap to reschedule */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={openReschedule}
              title="Tap to reschedule"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: rescheduling ? 'var(--brand)' : 'var(--bg)',
                color: rescheduling ? '#fff' : 'var(--text-2)',
                border: rescheduling ? 'none' : '1px solid var(--border)',
                borderRadius: 100, padding: '3px 10px',
                fontSize: 11, fontWeight: 700,
                cursor: 'pointer', marginBottom: 6,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon name="clock" size={10} />
              {event.time} – {endT}
            </motion.button>

            {event.cost != null && event.cost > 0 && (
              <span style={{
                display: 'inline-flex', marginLeft: 6,
                fontSize: 11, color: 'var(--success)', fontWeight: 700,
              }}>
                💰 ${event.cost}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: meta.bg, color: meta.color,
                borderRadius: 100, padding: '3px 9px',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.02em',
              }}>
                {meta.icon} {meta.label}
              </span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => voteEvent(dayNumber, event.id, nickname, 'up')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  background: myVote === 'up' ? 'rgba(40,160,90,0.15)' : 'transparent',
                  border: myVote === 'up' ? '1px solid rgba(40,160,90,0.35)' : '1px solid var(--border)',
                  borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                  color: myVote === 'up' ? 'var(--success)' : 'var(--text-3)', cursor: 'pointer',
                }}>
                👍 {upVotes > 0 ? upVotes : ''}
              </motion.button>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => voteEvent(dayNumber, event.id, nickname, 'down')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  background: myVote === 'down' ? 'var(--danger-bg)' : 'transparent',
                  border: myVote === 'down' ? '1px solid rgba(192,57,43,0.25)' : '1px solid var(--border)',
                  borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                  color: myVote === 'down' ? 'var(--danger)' : 'var(--text-3)', cursor: 'pointer',
                }}>
                👎 {downVotes > 0 ? downVotes : ''}
              </motion.button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => onEdit(event)}
              style={{
                width: 32, height: 32, borderRadius: 9, background: 'var(--bg)',
                border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name="edit" size={13} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => onDelete(event.id)}
              style={{
                width: 32, height: 32, borderRadius: 9, background: 'var(--danger-bg)',
                border: '1px solid rgba(192,57,43,0.15)', cursor: 'pointer', color: 'var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name="trash" size={13} />
            </motion.button>
          </div>
        </div>

        {/* Inline reschedule panel */}
        <AnimatePresence>
          {rescheduling && (
            <motion.div
              key="reschedule-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                borderTop: '1px solid var(--border)',
                padding: '12px 12px 14px',
                display: 'flex', flexDirection: 'column', gap: 10,
                background: 'var(--bg)',
              }}>
                {/* Shift buttons + time display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {([-60, -30, +30, +60] as const).map(d => (
                    <motion.button key={d} whileTap={{ scale: 0.9 }} onClick={() => shift(d)}
                      style={{
                        padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: 'var(--surface)', cursor: 'pointer',
                        color: d < 0 ? 'var(--danger)' : 'var(--brand)',
                        border: `1px solid ${d < 0 ? 'rgba(192,57,43,0.2)' : 'rgba(59,110,82,0.25)'}`,
                      }}>
                      {d > 0 ? `+${d}m` : `${d}m`}
                    </motion.button>
                  ))}
                  <input
                    type="time"
                    value={pendingTime}
                    onChange={e => setPendingTime(e.target.value)}
                    style={{
                      padding: '5px 10px', borderRadius: 8,
                      fontSize: 13, fontWeight: 800,
                      background: 'var(--surface)', color: 'var(--text)',
                      border: '1px solid var(--border)', outline: 'none', marginLeft: 'auto',
                    }}
                  />
                </div>

                {/* Preview */}
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Move to{' '}
                  <strong style={{ color: 'var(--brand)' }}>{pendingTime}</strong>
                  {' '}–{' '}
                  <strong style={{ color: 'var(--brand)' }}>{toTime(toMins(pendingTime) + event.duration)}</strong>
                  {pendingTime !== event.time && (
                    <span style={{ color: 'var(--text-3)', fontSize: 11 }}>
                      {' '}({toMins(pendingTime) > toMins(event.time) ? '+' : ''}{toMins(pendingTime) - toMins(event.time)}m)
                    </span>
                  )}
                </p>

                {/* Confirm / Cancel */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={cancelReschedule}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: 'var(--surface)', color: 'var(--text-2)',
                      border: '1px solid var(--border)', cursor: 'pointer',
                    }}>
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={confirm}
                    disabled={pendingTime === event.time}
                    style={{
                      flex: 2, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 800,
                      background: pendingTime !== event.time ? 'var(--brand)' : 'var(--border)',
                      color: pendingTime !== event.time ? '#fff' : 'var(--text-3)',
                      border: 'none', cursor: pendingTime !== event.time ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}>
                    ✓ Confirm move
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Main screen ──────────────────────────────────────────────── */
export default function DayScreen() {
  const {
    trip, activeDay, setActiveDay,
    addEvent, editEvent, deleteEvent,
    setShowSuggestions, showSuggestions,
    updateDayMeta,
    setScreen,
    nickname,
  } = useAppStore();
  const { show } = useToast();
  const { t } = useI18n();
  const stripRef = useRef<HTMLDivElement>(null);

  const [showAdd, setShowAdd]             = useState(false);
  const [editTarget, setEditTarget]       = useState<TripEvent | null>(null);
  const [fTime, setFTime]                 = useState('09:00');
  const [fDur,  setFDur]                  = useState('60');
  const [fName, setFName]                 = useState('');
  const [fCat,  setFCat]                  = useState<Category>('attraction');
  const [fLoc,  setFLoc]                  = useState('');
  const [fLat,  setFLat]                  = useState<number | undefined>(undefined);
  const [fLng,  setFLng]                  = useState<number | undefined>(undefined);
  const [fNotes, setFNotes]               = useState('');
  const [manualCat, setManualCat]         = useState(false);
  const [fCost, setFCost]                     = useState('');
  const [showEditDay, setShowEditDay]         = useState(false);
  const [editDayName, setEditDayName]         = useState('');
  const [editDayEmoji, setEditDayEmoji]       = useState('');
  const [showDrivePrompt, setShowDrivePrompt] = useState(false);
  const [driveMinutes, setDriveMinutes]   = useState('');
  const [savedFlightTime, setSavedFlightTime] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const up   = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);


  // Auto-detect category from event name when user hasn't manually chosen one
  useEffect(() => {
    if (manualCat || editTarget) return;
    const n = fName.toLowerCase();
    let cat: Category = 'attraction';
    if (/coffee|cafe|espresso|cappuccino|latte|tea|קפה|בית קפה/.test(n))                                                                                          cat = 'cafe';
    else if (/eat|food|lunch|dinner|breakfast|meal|restaurant|falafel|pizza|burger|אוכל|ארוחה|מסעדה/.test(n))                                                    cat = 'food';
    else if (/flight|airport|landing|takeoff|take.?off|boarding|terminal|runway|plane|check.?in|טיסה|שדה תעופה/.test(n))                                         cat = 'flight';
    else if (/drive|driving|car|bus|taxi|uber|train|transport|road|gas|fuel|נסיעה|נהיגה|אוטובוס|רכב/.test(n))                                                   cat = 'transport';
    else if (/hotel|hostel|airbnb|check.?in|check.?out|accommodation|lodg|inn|resort|apartment|stay|motel|מלון|לינה|צ'ק אין/.test(n))                            cat = 'hotel';
    else if (/rest|sleep|camp|nap|relax|overnight|חניה|מנוחה|שינה/.test(n))                                                                                      cat = 'rest';
    setFCat(cat);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fName]);

  const QUICK_PRESETS: { icon: string; label: string; name: string; cat: Category; dur: number }[] = [
    { icon: '🚗', label: 'Drive',   name: 'Drive',        cat: 'transport', dur: 30  },
    { icon: '🍽️', label: 'Meal',    name: 'Meal',         cat: 'food',      dur: 60  },
    { icon: '☕',  label: 'Coffee',  name: 'Coffee stop',  cat: 'cafe',      dur: 30  },
    { icon: '⛺', label: 'Rest',    name: 'Rest stop',    cat: 'rest',      dur: 20  },
    { icon: '⛽', label: 'Gas',     name: 'Gas & fuel',   cat: 'transport', dur: 15  },
  ];

  if (!trip) return null;

  const evs         = [...(trip.events[activeDay] ?? [])].sort((a, b) => toMins(a.time) - toMins(b.time));
  const meta        = trip.dayMeta[activeDay - 1];
  const conflicts   = getConflicts(evs);
  const dayDate     = trip.startDate
    ? new Date(new Date(trip.startDate).getTime() + (activeDay - 1) * 86_400_000).toISOString().split('T')[0]
    : trip.startDate ?? new Date().toISOString().split('T')[0];
  const dayLat      = meta?.lat ?? 32;
  const dayBudget   = getDayBudget(evs);

  const openMapForDay = () => {
    const firstWithLocation = evs.find(e => e.location);
    const query = firstWithLocation?.location ?? meta?.region ?? 'map';
    window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`, '_blank');
  };

  // Build interleaved list: event → connector → event → …
  type ListItem =
    | { type: 'event'; ev: TripEvent }
    | { type: 'connector'; gapMins: number; gapStart: number; fromEv?: TripEvent; toEv?: TripEvent };

  const items: ListItem[] = [];
  for (let i = 0; i < evs.length; i++) {
    items.push({ type: 'event', ev: evs[i] });
    if (i < evs.length - 1) {
      const curEnd    = toMins(evs[i].time) + evs[i].duration;
      const nextStart = toMins(evs[i + 1].time);
      items.push({ type: 'connector', gapMins: Math.max(0, nextStart - curEnd), gapStart: curEnd, fromEv: evs[i], toEv: evs[i + 1] });
    }
  }
  // Gap after last event (free time before end of day)
  if (evs.length > 0) {
    const lastEnd = toMins(evs[evs.length - 1].time) + evs[evs.length - 1].duration;
    const endOfDay = 23 * 60;
    if (endOfDay - lastEnd >= 45) {
      items.push({ type: 'connector', gapMins: endOfDay - lastEnd, gapStart: lastEnd });
    }
  }

  const openAdd = (prefillTime?: string) => {
    setFTime(prefillTime ?? '09:00');
    setFDur('60'); setFName(''); setFCat('attraction'); setFLoc(''); setFLat(undefined); setFLng(undefined); setFNotes(''); setFCost('');
    setEditTarget(null);
    setManualCat(false);
    setShowAdd(true);
  };

  const openEdit = (e: TripEvent) => {
    setFTime(e.time); setFDur(String(e.duration));
    setFName(e.name); setFCat(e.category);
    setFLoc(e.location ?? ''); setFLat(e.lat); setFLng(e.lng); setFNotes(e.notes ?? '');
    setFCost(e.cost != null ? String(e.cost) : '');
    setEditTarget(e);
    setManualCat(true);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!fName.trim()) { show(t('enterEventName')); return; }
    const dur  = parseInt(fDur, 10) || 60;
    const cost = fCost.trim() ? parseFloat(fCost) : undefined;
    if (editTarget) {
      editEvent(activeDay, editTarget.id, {
        time: fTime, duration: dur, name: fName, category: fCat,
        location: fLoc || undefined, lat: fLat, lng: fLng, notes: fNotes || undefined,
        cost: cost && !isNaN(cost) ? cost : undefined,
      });
      show(t('eventUpdated'));
      setShowAdd(false);
    } else {
      addEvent(activeDay, {
        time: fTime, duration: dur, name: fName, category: fCat,
        location: fLoc || undefined, lat: fLat, lng: fLng, notes: fNotes || undefined,
        cost: cost && !isNaN(cost) ? cost : undefined,
      });
      show(t('eventAdded'));
      setShowAdd(false);
      if (fCat === 'flight') {
        setSavedFlightTime(fTime);
        setDriveMinutes('');
        setShowDrivePrompt(true);
      }
    }
  };

  const handleDrivePromptSave = () => {
    const mins = parseInt(driveMinutes, 10);
    if (mins > 0) {
      const flightStart = toMins(savedFlightTime);
      const driveStart  = Math.max(0, flightStart - mins);
      addEvent(activeDay, {
        time: toTime(driveStart),
        duration: mins,
        name: 'Drive to Airport',
        category: 'transport',
      });
      show('Drive to airport added!');
    }
    setShowDrivePrompt(false);
  };

  const handleDelete = (id: string) => {
    const victim = evs.find(e => e.id === id);
    if (!victim) return;
    deleteEvent(activeDay, id);
    show(`${victim.name} removed`, {
      action: {
        label: 'Undo',
        onClick: () => {
          addEvent(activeDay, {
            time: victim.time, duration: victim.duration, name: victim.name,
            category: victim.category, location: victim.location,
            lat: victim.lat, lng: victim.lng, notes: victim.notes,
          });
        },
      },
    });
  };

  const handleReschedule = (e: TripEvent, newTime: string) => {
    editEvent(activeDay, e.id, { time: newTime });
    show(`${e.name} moved to ${newTime}`);
  };

  // Day strip helpers
  const getDayInfo = (dayNum: number) => {
    const base = trip.startDate ? new Date(trip.startDate) : new Date();
    base.setDate(base.getDate() + dayNum - 1);
    return { abbrev: DAY_ABBREVS[base.getDay()], dateNum: base.getDate() };
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: 'var(--bg)' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: 'var(--page-pt) var(--page-px) 0',
          flexShrink: 0,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setScreen('dashboard')}
          style={{
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', padding: '4px 2px',
          }}
        >
          <Icon name="chevL" size={22} />
        </motion.button>

        <h1 style={{
          flex: 1,
          fontSize: 22, fontWeight: 800,
          color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          {t('yourJourney')}
        </h1>

        <span style={{
          background: isOnline ? 'rgba(40,160,90,0.10)' : 'rgba(0,0,0,0.06)',
          color: isOnline ? 'var(--success)' : 'var(--text-3)',
          borderRadius: 100, padding: '4px 11px',
          fontSize: 11, fontWeight: 700,
          border: `1px solid ${isOnline ? 'rgba(40,160,90,0.25)' : 'var(--border)'}`,
          transition: 'all 0.3s',
        }}>
          {isOnline ? '● Online' : '○ Offline'}
        </span>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={openMapForDay}
          title="Open in Google Maps"
          style={{
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', padding: 4,
          }}
        >
          <Icon name="map" size={21} />
        </motion.button>
      </motion.div>

      {/* ── Day strip ────────────────────────────────────────── */}
      <motion.div
        ref={stripRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        style={{
          display: 'flex', gap: 4,
          padding: '14px var(--page-px) 10px',
          paddingRight: 'var(--page-px)',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}
      >
        {Array.from({ length: trip.days }, (_, i) => {
          const dayNum  = i + 1;
          const isActive = dayNum === activeDay;
          const { abbrev, dateNum } = getDayInfo(dayNum);
          return (
            <motion.button
              key={dayNum}
              onClick={() => setActiveDay(dayNum)}
              whileTap={{ scale: 0.88 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '4px 8px', minWidth: 50,
                background: 'transparent', border: 'none',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.07em',
                color: isActive ? 'var(--brand)' : 'var(--text-3)',
                fontFamily: 'var(--font-sans)',
              }}>
                {abbrev}
              </span>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isActive ? 'var(--brand)' : 'transparent',
                border: isActive ? 'none' : '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.18s ease, border 0.18s ease',
              }}>
                <span style={{
                  fontSize: 17, fontWeight: 800,
                  color: isActive ? 'white' : 'var(--text-2)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {dateNum}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Day subtitle (tap to edit city name) ────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16 }}
          onClick={() => {
            setEditDayName(meta?.region ?? `Day ${activeDay}`);
            setEditDayEmoji(meta?.emoji ?? '📍');
            setShowEditDay(true);
          }}
          style={{
            padding: '0 var(--page-px) 12px',
            display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
            flexShrink: 0, cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 16 }}>{meta?.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
            {meta?.region}
            {trip.startDate ? ` · ${fmtDate(trip.startDate, activeDay - 1)}` : ''}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 2 }}>
            · {evs.length} {evs.length === 1 ? 'stop' : 'stops'}
          </span>
          {dayBudget > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--success)',
              background: 'var(--success-bg)',
              border: '1px solid rgba(40,160,90,0.2)',
              borderRadius: 100, padding: '1px 8px', marginLeft: 2,
            }}>
              💰 ${dayBudget}
            </span>
          )}
          {conflicts.size > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--danger)',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: 100, padding: '1px 8px',
            }}>
              ⚠️ {conflicts.size / 2 | 0 || 1} overlap
            </span>
          )}
          <Icon name="edit" size={11} style={{ color: 'var(--text-3)', marginLeft: 2 }} />
        </motion.div>
      </AnimatePresence>

      {/* ── Itinerary list ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto day-list-pb">
        <AnimatePresence>
          {evs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '48px 20px', gap: 10,
              }}
            >
              <span style={{ fontSize: 40 }}>{meta?.emoji}</span>
              <p style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center', fontWeight: 500 }}>
                {t('tapToAdd')}
              </p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
              {items.map((item, idx) =>
                item.type === 'event' ? (
                  <EventCard
                    key={item.ev.id}
                    event={item.ev}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onReschedule={handleReschedule}
                    isConflict={conflicts.has(item.ev.id)}
                    goldenHour={getGoldenHourType(toMins(item.ev.time), item.ev.duration, dayLat, dayDate)}
                    nickname={nickname}
                    dayNumber={activeDay}
                  />
                ) : (
                  <RouteConnector
                    key={`conn-${idx}`}
                    gapMins={item.gapMins}
                    gapStart={item.gapStart}
                    fromEv={item.fromEv}
                    toEv={item.toEv}
                    onSuggest={() => setShowSuggestions(true, item.gapStart, item.gapStart + item.gapMins)}
                    onAdd={() => openAdd(toTime(item.gapStart))}
                    t={t}
                  />
                )
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Add / Edit sheet ─────────────────────────────────── */}
      {showAdd && (
        <Sheet
          onClose={() => setShowAdd(false)}
          title={editTarget ? t('editEvent') : t('addEvent')}
          subtitle={editTarget
            ? `${t('editingLabel')}: ${editTarget.name}`
            : `${t('day')} ${activeDay} — ${meta?.region}`
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Quick-add presets (only on new event) */}
            {!editTarget && (
              <div>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
                  letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8,
                }}>
                  {t('quickAdd')}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {QUICK_PRESETS.map(p => (
                    <motion.button
                      key={p.label}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        setFName(p.name);
                        setFCat(p.cat);
                        setFDur(String(p.dur));
                        setManualCat(true);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 8,
                        fontSize: 12, fontWeight: 600,
                        background: fName === p.name && fCat === p.cat ? 'var(--brand-light)' : 'var(--bg)',
                        color: fName === p.name && fCat === p.cat ? 'var(--brand)' : 'var(--text-2)',
                        border: fName === p.name && fCat === p.cat
                          ? '1.5px solid var(--brand)'
                          : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <span>{p.icon}</span> {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <Field
              label={t('eventName')} placeholder="e.g. Masada Hike"
              value={fName} onChange={setFName} autoFocus
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Field label={t('startTime')} type="time" value={fTime} onChange={setFTime} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-2)', marginBottom: 6,
                }}>
                  {t('duration')}
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[30, 60, 90, 120].map(d => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setFDur(String(d))}
                      style={{
                        padding: '6px 10px', borderRadius: 8,
                        fontSize: 12, fontWeight: 600,
                        background: fDur === String(d) ? 'var(--brand)' : 'var(--bg)',
                        color: fDur === String(d) ? 'white' : 'var(--text-2)',
                        border: fDur === String(d) ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                    >
                      {fmtDuration(d)}
                    </motion.button>
                  ))}
                  <input
                    type="number"
                    placeholder="min"
                    value={![30, 60, 90, 120].includes(parseInt(fDur)) ? fDur : ''}
                    onChange={e => setFDur(e.target.value)}
                    style={{
                      width: 64, padding: '6px 8px', borderRadius: 8,
                      fontSize: 12, fontWeight: 600,
                      background: 'var(--bg)', color: 'var(--text)',
                      outline: 'none', border: '1px solid var(--border)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-2)', marginBottom: 8,
              }}>
                {t('category')}
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => {
                  const m = CAT_META[c];
                  return (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { setFCat(c); setManualCat(true); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 8,
                        fontSize: 12, fontWeight: 600,
                        background: fCat === c ? m.bg : 'var(--bg)',
                        color: fCat === c ? m.color : 'var(--text-2)',
                        border: fCat === c ? `1px solid ${m.color}40` : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {m.icon} {m.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <PlacesInput
              label={t('locationOpt')} placeholder="e.g. Masada, Dead Sea"
              value={fLoc}
              onChange={name => { setFLoc(name); setFLat(undefined); setFLng(undefined); }}
              onSelect={({ name, lat, lng }) => { setFLoc(name); setFLat(lat); setFLng(lng); }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Field
                  label={t('notesOpt')} placeholder="Any extra info…"
                  value={fNotes} onChange={setFNotes} rows={2}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                  {t('costLabel')}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder={t('costPlaceholder')}
                  value={fCost}
                  onChange={e => setFCost(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    fontSize: 14, fontWeight: 500,
                    background: 'var(--bg)', color: 'var(--text)',
                    border: '1px solid var(--border)', outline: 'none',
                    boxSizing: 'border-box' as const,
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <GlassBtn onClick={() => setShowAdd(false)} style={{ flex: 1 }}>
                {t('cancel')}
              </GlassBtn>
              <GlassBtn variant="accent" onClick={handleSave} style={{ flex: 2 }}>
                <Icon name="check" size={14} />
                {editTarget ? t('saveChanges') : t('addEvent')}
              </GlassBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* ── Edit day metadata sheet ──────────────────────────────── */}
      {showEditDay && (
        <Sheet
          onClose={() => setShowEditDay(false)}
          title={`Day ${activeDay} — ${t('editEvent')}`}
          subtitle="Set a city name and emoji for this day"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field
              label="City / Location"
              placeholder="e.g. Paris, Rome, Amsterdam"
              value={editDayName}
              onChange={setEditDayName}
              autoFocus
            />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                Emoji
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['🏙️','🗼','🌊','🏖️','🏔️','🌲','✈️','🚂','🛳️','🏛️','🗺️','🎡','🌅','❄️','🍷','🎭','🎨','⛷️'].map(em => (
                  <motion.button
                    key={em}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setEditDayEmoji(em)}
                    style={{
                      width: 38, height: 38, borderRadius: 10, fontSize: 20,
                      background: editDayEmoji === em ? 'var(--brand-light)' : 'var(--bg)',
                      border: editDayEmoji === em ? '2px solid var(--brand)' : '1px solid var(--border)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {em}
                  </motion.button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <GlassBtn onClick={() => setShowEditDay(false)} style={{ flex: 1 }}>
                {t('cancel')}
              </GlassBtn>
              <GlassBtn
                variant="accent"
                onClick={() => {
                  updateDayMeta(activeDay - 1, { region: editDayName.trim() || `Day ${activeDay}`, emoji: editDayEmoji });
                  show('Day updated');
                  setShowEditDay(false);
                }}
                style={{ flex: 2 }}
              >
                <Icon name="check" size={14} /> Save
              </GlassBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* ── Drive-to-airport prompt ─────────────────────────────── */}
      {showDrivePrompt && (
        <Sheet
          onClose={() => setShowDrivePrompt(false)}
          title="Drive to Airport ✈️"
          subtitle="How long is the drive? We'll add it before your flight."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-2)', marginBottom: 8,
              }}>
                Driving time (minutes)
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {[20, 30, 45, 60, 90].map(d => (
                  <motion.button
                    key={d}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setDriveMinutes(String(d))}
                    style={{
                      padding: '6px 14px', borderRadius: 8,
                      fontSize: 13, fontWeight: 600,
                      background: driveMinutes === String(d) ? 'var(--brand)' : 'var(--bg)',
                      color: driveMinutes === String(d) ? 'white' : 'var(--text-2)',
                      border: driveMinutes === String(d) ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                  >
                    {fmtDuration(d)}
                  </motion.button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom minutes…"
                value={driveMinutes}
                onChange={e => setDriveMinutes(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                  background: 'var(--bg)', color: 'var(--text)',
                  outline: 'none', border: '1px solid var(--border)',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <GlassBtn onClick={() => setShowDrivePrompt(false)} style={{ flex: 1 }}>
                Skip
              </GlassBtn>
              <GlassBtn variant="accent" onClick={handleDrivePromptSave} style={{ flex: 2 }}>
                <Icon name="plus" size={14} />
                Add Drive
              </GlassBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* ── FABs (mobile) ────────────────────────────────────── */}
      {/* AI suggest FAB — wired to SuggestionsSheet, ready for future AI connection */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.28 }}
        whileTap={{ scale: 0.90 }}
        onClick={() => setShowSuggestions(true)}
        style={{
          position: 'fixed',
          bottom: 'max(140px, calc(128px + env(safe-area-inset-bottom, 0px)))',
          right: 20, zIndex: 40,
          width: 52, height: 52, borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #5B4FCF 0%, #3B7ED4 100%)',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(91,79,207,0.40)',
        }}
        className="md:hidden"
      >
        <Icon name="sparkle" size={22} />
      </motion.button>

      {/* Add event FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.2 }}
        whileTap={{ scale: 0.90 }}
        onClick={() => openAdd()}
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 'max(80px, calc(64px + env(safe-area-inset-bottom, 0px)))',
          right: 20, zIndex: 40,
          width: 52, height: 52, borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          background: 'var(--brand)',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Icon name="plus" size={24} />
      </motion.button>


      {showSuggestions && <SuggestionsSheet dayNumber={activeDay} />}
    </div>
  );
}
