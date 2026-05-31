'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recommendMode, getGapUrgency, URGENCY_COLORS, MODE_ICON } from '@/lib/travelMode';
import GlassBtn from '../ui/GlassBtn';
import Icon from '../ui/Icon';
import { EventIcon } from '../ui/EventIcon';
import { StampIcon } from '../ui/StampIcon';
import { catStamp } from '@/lib/categoryStamp';
import Field from '../ui/Field';
import Sheet from '../ui/Sheet';
import PlacesInput from '../ui/PlacesInput';
import { useAppStore } from '@/lib/store';
import { CAT_META, CAT_FALLBACK, fmtDate, fmtDuration, toMins, toTime, getConflicts, getGoldenHourType, getDayBudget } from '@/lib/utils';
import { getCapitalCoords } from '@/lib/capitals';
import { getCurrencySymbol } from '@/lib/currency';
import { Category, HotelStay, TripEvent } from '@/lib/types';
import { useToast } from '../ui/Toast';
import { AISheet } from '../Sheets_V2';
import DayTimelineView from '../DayTimelineView';
import { useI18n, TranslationKey } from '@/lib/i18n';
import { slideVariants, spring } from '@/lib/motion';

const CATEGORIES: Category[] = ['food', 'cafe', 'attraction', 'hotel', 'rest', 'transport', 'flight', 'concert', 'theme_park', 'sport', 'beach', 'other'];

function getMapsUrl(location: string, lat?: number, lng?: number): string {
  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  if (lat && lng) {
    return isIOS
      ? `maps://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(location)}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const q = encodeURIComponent(location);
  return isIOS
    ? `maps://maps.apple.com/?q=${q}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}
const DAY_ABBREVS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_ABBREVS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

/* ── Category stamp thumbnail — uses illustrated seal from atlas ── */
function EventThumbnail({ category }: { category: Category }) {
  const { key } = catStamp(category);
  return (
    <StampIcon
      iconKey={key}
      size={52}
      style={{ flexShrink: 0, filter: 'drop-shadow(0 3px 8px oklch(20% 0.03 60 / 22%))' }}
    />
  );
}

/* ── Shared travel types & badge component ───────────────────── */
interface TravelMode { durationMins: number; distanceKm: number }
interface TravelModes { driving: TravelMode | null; walking: TravelMode | null; transit: TravelMode | null }

function TravelBadges({ modes, fetching }: { modes: TravelModes | null; fetching: boolean }) {
  if (fetching) {
    return (
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', lineHeight: 1 }}>⟳</motion.span>
        Estimating travel…
      </span>
    );
  }
  if (!modes) return null;
  const modeItems: { icon: string; m: TravelMode }[] = [];
  if (modes.driving)  modeItems.push({ icon: 'car', m: modes.driving });
  if (modes.walking)  modeItems.push({ icon: 'walk', m: modes.walking });
  if (modes.transit)  modeItems.push({ icon: 'train', m: modes.transit });
  if (!modeItems.length) return null;
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {modeItems.map(({ icon, m }) => (
        <span key={icon} style={{
          fontSize: 11, fontWeight: 700,
          color: 'var(--route-badge-text)',
          background: 'var(--route-badge-bg)',
          border: '1px solid var(--route-badge-border)',
          borderRadius: 100, padding: '4px 10px',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Icon name={icon as any} size={11} /> {fmtDuration(m.durationMins)}
          <span style={{ opacity: 0.5, fontWeight: 400 }}>· {m.distanceKm} km</span>
        </span>
      ))}
    </div>
  );
}

/* ── Hotel → first event travel time ─────────────────────────── */
interface HotelTravelRowProps {
  hotelLat: number; hotelLng: number;
  eventLat: number; eventLng: number;
  eventName: string;
}
function HotelTravelRow({ hotelLat, hotelLng, eventLat, eventLng, eventName }: HotelTravelRowProps) {
  const [modes, setModes] = useState<TravelModes | null>(null);
  const [fetching, setFetching] = useState(false);
  const [routeRetry, setRouteRetry] = useState(0);

  useEffect(() => {
    setFetching(true);
    setModes(null);
    fetch(`/api/route-time?olat=${hotelLat}&olng=${hotelLng}&dlat=${eventLat}&dlng=${eventLng}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setModes(d); })
      .catch(() => {})
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelLat, hotelLng, eventLat, eventLng, routeRetry]);

  if (!fetching && !modes) return null;

  return (
    <div style={{
      margin: '0 var(--page-px) 4px',
      padding: '8px 12px',
      background: 'var(--hotel-route-bg)',
      border: '1px solid var(--hotel-route-border)',
      borderRadius: 10,
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}>
      <span dir="ltr" style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>
        <Icon name="pin" size={11} style={{ display: 'inline-flex' }} /> {eventName}
      </span>
      <TravelBadges modes={modes} fetching={fetching} />
    </div>
  );
}

/* ── Route connector between events ──────────────────────────── */
interface ConnectorProps {
  gapMins: number;
  gapStart: number;
  fromEv?: TripEvent;
  toEv?: TripEvent;
  tripStartDate?: string;
  onSuggest: () => void;
  onAdd: () => void;
  t: (k: TranslationKey | string) => string;
}

function RouteConnector({ gapMins, gapStart: _gapStart, fromEv, toEv, tripStartDate, onSuggest, onAdd, t }: ConnectorProps) {
  const [modes, setModes] = useState<TravelModes | null>(null);
  const [fetching, setFetching] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { locale } = useI18n();

  const isFree = gapMins >= 45;
  const bothExist = !!(fromEv && toEv);
  const canRoute = !!(fromEv?.lat && fromEv?.lng && toEv?.lat && toEv?.lng);

  const [routeRetry, setRouteRetry] = useState(0);

  // Compute departure unix timestamp for rush-hour awareness (§2.4)
  const departureTime = (() => {
    if (!fromEv?.time || !tripStartDate) return undefined;
    try {
      const ts = Math.floor(new Date(`${tripStartDate}T${fromEv.time}`).getTime() / 1000);
      return isNaN(ts) ? undefined : ts;
    } catch { return undefined; }
  })();

  useEffect(() => {
    if (!canRoute) return;
    setFetching(true);
    setModes(null);
    const params = new URLSearchParams({
      olat: String(fromEv!.lat), olng: String(fromEv!.lng),
      dlat: String(toEv!.lat), dlng: String(toEv!.lng),
    });
    if (departureTime) params.set('departureTime', String(departureTime));
    fetch(`/api/route-time?${params.toString()}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setModes(d); })
      .catch(() => {})
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromEv?.lat, fromEv?.lng, toEv?.lat, toEv?.lng, routeRetry]);

  // Smart mode recommendation + urgency (§2.3 + §4)
  const rec = modes ? recommendMode(modes, gapMins) : null;
  const recMode = rec?.mode;
  const recResult = recMode && modes ? modes[recMode] : null;
  const recTravelMins = recResult?.durationMins ?? 0;
  const urgency = getGapUrgency(gapMins, recTravelMins);
  const urgencyStyle = URGENCY_COLORS[urgency];

  const hasTravel = modes?.driving || modes?.walking || modes?.transit;
  const dashColor = isFree
    ? 'var(--warning)'
    : hasTravel
      ? urgencyStyle.line
      : 'var(--border)';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '4px var(--page-px) 4px calc(var(--page-px) + 12px)',
    }}>

      {/* ── Smart travel row with recommended mode badge ── */}
      {bothExist && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span dir="ltr" style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
            display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0,
          }}>
            {fromEv!.name}
            <span style={{ opacity: 0.5 }}>→</span>
            {toEv!.name}
          </span>

          {canRoute ? (
            <>
              {fetching ? (
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', lineHeight: 1 }}>⟳</motion.span>
                  {t('estimatingTravel')}
                </span>
              ) : recMode && recResult ? (
                /* Recommended mode compact badge — tap to expand */
                <button
                  onClick={() => setExpanded(e => !e)}
                  aria-label={t('routeConnector.expand')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: urgencyStyle.badge,
                    border: `1px solid ${urgencyStyle.line}`,
                    borderRadius: 100, padding: '4px 10px',
                    fontSize: 11, fontWeight: 700, color: 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  {MODE_ICON[recMode]} {fmtDuration(recResult.durationMins)}
                  <span style={{ opacity: 0.6, fontWeight: 400 }}>· {recResult.distanceKm} km</span>
                  {urgency !== 'ok' && (
                    <span style={{ color: urgencyStyle.line, fontWeight: 800 }}>
                      {t(`routeConnector.${urgency}`)}
                    </span>
                  )}
                  <span style={{ fontSize: 9, opacity: 0.5 }}>▾</span>
                </button>
              ) : modes ? (
                <TravelBadges modes={modes} fetching={false} />
              ) : (
                <button onClick={() => setRouteRetry(c => c + 1)} style={{ fontSize: 10, color: 'var(--terra)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                  ↻ retry
                </button>
              )}
            </>
          ) : (
            <span style={{ fontSize: 10, color: 'var(--text-3)', opacity: 0.65, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Icon name="pin" size={10} style={{ display: 'inline-flex' }} /> {locale === 'he' ? 'הוסף מיקום לחישוב זמן נסיעה' : 'Add locations for travel time'}
            </span>
          )}
        </div>
      )}

      {/* ── Expanded sheet: all modes + departure info (§2.5) ── */}
      <AnimatePresence>
        {expanded && modes && recMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--surface)',
              border: `1px solid ${urgencyStyle.line}`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              marginTop: 4,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }} dir="ltr">
                {fromEv!.name} → {toEv!.name}
              </p>
              {(['walking', 'transit', 'driving'] as const).map(mode => {
                const r = modes[mode];
                if (!r) return null;
                const isRec = mode === recMode;
                return (
                  <div key={mode} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 8px', borderRadius: 'var(--radius-sm)',
                    background: isRec ? urgencyStyle.badge : 'transparent',
                    border: isRec ? `1px solid ${urgencyStyle.line}` : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{MODE_ICON[mode]}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: isRec ? 700 : 500, color: 'var(--text)' }}>
                      {fmtDuration(r.durationMins)}
                      <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>
                        · {r.distanceKm} km
                        {mode === 'driving' && departureTime ? ` (${locale === 'he' ? 'עם פקקים' : 'with traffic'})` : ''}
                      </span>
                    </span>
                    {isRec && (
                      <span style={{
                        fontSize: 10, fontWeight: 800,
                        background: urgencyStyle.line, color: 'white',
                        borderRadius: 100, padding: '2px 8px',
                      }}>
                        {t('routeConnector.recommended')}
                      </span>
                    )}
                  </div>
                );
              })}
              {fromEv?.time && (
                <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                  {t('routeConnector.departure')} {fromEv.time}
                  {urgency !== 'ok' && (
                    <span style={{ color: urgencyStyle.line, fontWeight: 700, marginLeft: 8 }}>
                      {t(`routeConnector.${urgency}`)}
                    </span>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gap / free time row — matches demo dashed pill style ── */}
      {isFree ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px',
          border: '1.5px dashed rgba(26,20,16,0.18)',
          borderRadius: 9999, gap: 10,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: 'var(--text-3)', letterSpacing: '0.10em', textTransform: 'uppercase',
          }}>
            {fmtDuration(gapMins)} FREE TIME
          </span>
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={onSuggest}
            style={{
              background: 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))',
              border: 'none',
              borderRadius: 9999, padding: '6px 14px',
              fontSize: 11, fontWeight: 700, color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              flexShrink: 0, boxShadow: 'var(--lg-glow-terra)',
            }}
          >
            <Icon name="sparkle" size={10} /> {t('suggestBtn')}
          </motion.button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: dashColor,
              opacity: 1 - i * 0.3,
            }} />
          ))}
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={onAdd}
            style={{
              marginLeft: 4,
              background: 'var(--terra-muted)',
              border: '1px solid rgba(196,113,74,0.25)',
              borderRadius: 100, padding: '4px 10px',
              fontSize: 10, fontWeight: 700, color: 'var(--terra)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Icon name="plus" size={10} />
          </motion.button>
        </div>
      )}
    </div>
  );
}

/* ── Timezone boundary badge (§3) ────────────────────────────── */
function TimezoneBadge({ timezone }: { timezone: string }) {
  const { t, locale } = useI18n();
  const now = new Date();
  const tzShort = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'short' })
    .formatToParts(now).find(p => p.type === 'timeZoneName')?.value ?? timezone;
  const offsetLabel = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'shortOffset' })
    .formatToParts(now).find(p => p.type === 'timeZoneName')?.value ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: '4px var(--page-px)',
        padding: '6px 12px',
        background: 'var(--brand-muted)',
        border: '1px solid rgba(59,110,82,0.20)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      <Icon name="pin" size={14} color="var(--brand)" />
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>
        {t('timezoneBadge.change')}: {t('timezoneBadge.nowIn')} {tzShort}
        {offsetLabel ? <span style={{ fontWeight: 400, marginLeft: 4, opacity: 0.75 }}>({offsetLabel})</span> : null}
      </span>
    </motion.div>
  );
}

/* ── Event card ───────────────────────────────────────────────── */
interface EventCardProps {
  event: TripEvent;
  onEdit: (e: TripEvent) => void;
  onDelete: (id: string) => void;
  onReschedule: (e: TripEvent, newTime: string) => void;
  onMove: (event: TripEvent, targetDay: number) => void;
  onFocus: (e: TripEvent) => void;
  isConflict: boolean;
  goldenHour: 'sunrise' | 'sunset' | null;
  nickname: string;
  dayNumber: number;
  tripDays: number;
  startDate: string;
  locale: string;
  isNew?: boolean;
}

function EventCard({ event, onEdit, onDelete, onReschedule, onMove, onFocus, isConflict, goldenHour, nickname, dayNumber, tripDays, startDate, locale, isNew }: EventCardProps) {
  const meta = CAT_META[event.category];
  const endT = toTime(toMins(event.time) + event.duration);
  const { voteEvent } = useAppStore();
  const currSym = useAppStore(s => getCurrencySymbol((s.tripDbId && s.currencyByTrip[s.tripDbId]) || 'USD'));
  const { t } = useI18n();

  const [rescheduling, setRescheduling] = useState(false);
  const [pendingTime, setPendingTime] = useState(event.time);
  const [moving, setMoving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Reset local time whenever the store updates the event
  useEffect(() => { setPendingTime(event.time); }, [event.time]);

  const openReschedule = () => { setPendingTime(event.time); setRescheduling(true); setMoving(false); setExpanded(false); };
  const cancelReschedule = () => setRescheduling(false);
  const shift = (mins: number) =>
    setPendingTime(t => toTime(Math.max(0, Math.min(23 * 60 + 55, toMins(t) + mins))));
  const confirm = () => {
    onReschedule(event, pendingTime);
    setRescheduling(false);
  };

  const upVotes = Object.values(event.votes ?? {}).filter(v => v === 'up').length;
  const downVotes = Object.values(event.votes ?? {}).filter(v => v === 'down').length;
  const myVote = (event.votes ?? {})[nickname];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 24, filter: 'blur(4px)', transition: { duration: 0.16 } }}
      transition={{ duration: 0.38, ease: [0.25, 0, 0, 1] }}
      style={{ display: 'flex', alignItems: 'flex-start', padding: '0 var(--page-px)' }}
    >
      {/* Timeline left column: dot + line */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 28, flexShrink: 0, marginTop: 4, marginRight: 12,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: isConflict ? 'var(--danger)' : 'var(--terra)',
          border: '2px solid var(--bg)',
          boxShadow: `0 0 0 2px ${isConflict ? 'var(--danger)' : 'var(--terra)'}`,
          flexShrink: 0,
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingBottom: 8 }}>
        {/* Time label above card */}
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          color: 'var(--terra)', letterSpacing: '0.04em',
          marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {event.time} {Number(event.time.split(':')[0]) < 12 ? 'AM' : 'PM'}
        </p>

      {/* Card */}
      <motion.div
        initial={isNew ? { boxShadow: '0 0 0 4px var(--terra-muted), 0 4px 20px rgba(196,113,74,0.18)' } : false}
        animate={{
          boxShadow: rescheduling
            ? 'var(--lg-shadow), 0 0 0 2px var(--lg-terra)'
            : isConflict
              ? 'var(--lg-shadow), 0 0 0 1.5px var(--danger)'
              : 'var(--lg-shadow)',
        }}
        transition={rescheduling || isConflict ? { duration: 0.18 } : { duration: 0.6, ease: 'easeOut' }}
        className="lg"
        style={{
          flex: 1, width: '100%',
          borderRadius: 'var(--lg-r-card)',
          borderInlineStart: isConflict ? '3px solid var(--danger)' : `3px solid ${catStamp(event.category).color}`,
          background: rescheduling ? 'oklch(99% 0.004 80 / 72%)' : undefined,
          overflow: 'hidden',
          transition: 'border 0.18s',
        }}>
        {isConflict && !rescheduling && (
          <div style={{ width: '100%', height: 3, background: 'var(--danger)' }} />
        )}

        {/* Main content row — tap to focus event */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', cursor: 'pointer' }}
          onClick={() => { setExpanded(e => !e); onFocus(event); }}
        >
          <StampIcon iconKey={CAT_FALLBACK[event.category]} size={48} />

          <div style={{ flex: 1, minWidth: 0 }}>
            {(isConflict || goldenHour) && (
              <div style={{ display: 'flex', gap: 5, marginBottom: 5, flexWrap: 'wrap' }}>
                {isConflict && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: 'var(--danger-bg)', color: 'var(--danger)',
                    borderRadius: 100, padding: '2px 8px',
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
                  }}>{t('conflictWarning')}</span>
                )}
                {goldenHour && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: 'rgba(212,160,50,0.15)', color: 'var(--sand)',
                    borderRadius: 100, padding: '2px 8px',
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
                  }}>
                    {goldenHour === 'sunset' ? t('goldenHourSunset') : t('goldenHourSunrise')}
                  </span>
                )}
              </div>
            )}

            <p style={{
              fontSize: 15, fontWeight: 800, color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginBottom: 3, letterSpacing: '-0.01em',
            }}>
              {t(event.name as any)}
            </p>

            {/* Time chip — tap to reschedule */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={e => { e.stopPropagation(); openReschedule(); }}
              title="Tap to reschedule"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: rescheduling ? 'var(--terra)' : 'var(--bg)',
                color: rescheduling ? '#fff' : 'var(--text-2)',
                border: rescheduling ? 'none' : '1px solid var(--border)',
                borderRadius: 100, padding: '3px 10px',
                fontSize: 11, fontWeight: 700,
                cursor: 'pointer', marginBottom: 6,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon name="clock" size={10} />
              <span dir="ltr">{event.time} – {endT}</span>
            </motion.button>

            {event.cost != null && event.cost > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6,
                fontSize: 11, color: 'var(--success)', fontWeight: 700,
              }}>
                {currSym}{event.cost}
              </span>
            )}

            {/* Location — tappable deep link to maps (Apple Maps on iOS, Google Maps elsewhere) */}
            {event.location && (
              <div style={{ marginBottom: 4 }}>
                <a
                  href={getMapsUrl(event.location, event.lat, event.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, color: 'var(--terra)', fontWeight: 600,
                    textDecoration: 'none',
                    background: 'var(--terra-muted)',
                    border: '1px solid rgba(59,110,82,0.22)',
                    borderRadius: 100, padding: '2px 9px',
                  }}
                >
                  <Icon name="pin" size={11} color="var(--lg-terra)" />{event.location}
                </a>
              </div>
            )}

            {/* Custom tags */}
            {event.tags && event.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                {event.tags.map((tag, ti) => (
                  <span key={ti} style={{
                    display: 'inline-flex', alignItems: 'center',
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--route-badge-text)',
                    background: 'var(--route-badge-bg)',
                    border: '1px solid var(--route-badge-border)',
                    borderRadius: 100, padding: '2px 8px',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: `${catStamp(event.category).color}1f`,
                color: catStamp(event.category).color,
                borderRadius: 100, padding: '3px 9px',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}>
                {meta.label}
              </span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={e => { e.stopPropagation(); voteEvent(dayNumber, event.id, nickname, 'up'); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  background: myVote === 'up' ? 'rgba(40,160,90,0.15)' : 'transparent',
                  border: myVote === 'up' ? '1px solid rgba(40,160,90,0.35)' : '1px solid var(--border)',
                  borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                  color: myVote === 'up' ? 'var(--success)' : 'var(--text-3)', cursor: 'pointer',
                }}>
                👍 {upVotes > 0 ? upVotes : ''}
              </motion.button>
              <motion.button whileTap={{ scale: 0.85 }} onClick={e => { e.stopPropagation(); voteEvent(dayNumber, event.id, nickname, 'down'); }}
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
            <motion.button whileTap={{ scale: 0.88 }} onClick={e => { e.stopPropagation(); onEdit(event); }}
              style={{
                width: 32, height: 32, borderRadius: 9, background: 'var(--bg)',
                border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name="edit" size={13} />
            </motion.button>
            {tripDays > 1 && (
              <motion.button whileTap={{ scale: 0.88 }} onClick={e => { e.stopPropagation(); setMoving(v => !v); setRescheduling(false); }}
                style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: moving ? 'var(--terra-muted)' : 'var(--bg)',
                  border: moving ? '1.5px solid var(--terra)' : '1px solid var(--border)',
                  cursor: 'pointer', color: moving ? 'var(--terra)' : 'var(--text-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s, border 0.15s',
                }}>
                <Icon name="swap" size={13} />
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.88 }} onClick={e => { e.stopPropagation(); onDelete(event.id); }}
              style={{
                width: 32, height: 32, borderRadius: 9, background: 'var(--danger-bg)',
                border: '1px solid rgba(192,57,43,0.15)', cursor: 'pointer', color: 'var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name="trash" size={13} />
            </motion.button>
            {/* Expand toggle */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              style={{
                width: 32, height: 32, borderRadius: 9, background: expanded ? 'var(--brand-muted)' : 'var(--bg)',
                border: expanded ? '1px solid rgba(59,110,82,0.25)' : '1px solid var(--border)',
                cursor: 'pointer', color: expanded ? 'var(--brand)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}>
              <Icon name="chevR" size={13} />
            </motion.button>
          </div>
        </div>

        {/* ── Quick Actions accordion ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="quick-actions"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px 12px', background: 'var(--bg-alt)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Event details summary */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{t('duration')}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{event.time}–{endT}</div>
                  </div>
                  {event.cost != null && event.cost > 0 && (
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{t('cost')}</span>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>{getCurrencySymbol('USD')}{event.cost}</div>
                    </div>
                  )}
                </div>
                {event.notes && (
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)', margin: 0 }}>{event.notes}</p>
                )}
                {/* Quick action buttons */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={e => { e.stopPropagation(); setExpanded(false); onEdit(event); }}
                    className="lg-btn lg-btn-glass"
                    style={{ height: 38, padding: '0 12px', gap: 6, fontSize: 12, fontWeight: 600, flexShrink: 0 }}
                  >
                    <Icon name="edit" size={14} style={{ color: 'var(--lg-forest)' }} />
                    {t('quickEdit') || 'Quick edit'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={e => { e.stopPropagation(); setExpanded(false); openReschedule(); }}
                    className="lg-btn lg-btn-glass"
                    style={{ height: 38, padding: '0 12px', gap: 6, fontSize: 12, fontWeight: 600, flexShrink: 0 }}
                  >
                    <Icon name="clock" size={14} style={{ color: 'var(--lg-terra)' }} />
                    {t('reschedule') || 'Reschedule'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={e => { e.stopPropagation(); setExpanded(false); }}
                    className="lg-btn lg-btn-glass"
                    style={{ height: 38, padding: '0 12px', gap: 6, fontSize: 12, fontWeight: 600, flexShrink: 0 }}
                  >
                    <Icon name="sparkle" size={14} style={{ color: 'var(--lg-sand)' }} />
                    {t('suggestNearby') || 'Suggest nearby'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                        padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        minHeight: 44, minWidth: 52,
                        background: 'var(--surface)', cursor: 'pointer',
                        color: d < 0 ? 'var(--danger)' : 'var(--terra)',
                        border: `1px solid ${d < 0 ? 'rgba(192,57,43,0.2)' : 'rgba(196,113,74,0.25)'}`,
                        touchAction: 'manipulation',
                      }}>
                      {d > 0 ? `+${d}m` : `${d}m`}
                    </motion.button>
                  ))}
                  <input
                    type="time"
                    value={pendingTime}
                    onChange={e => setPendingTime(e.target.value)}
                    style={{
                      padding: '8px 10px', borderRadius: 8, minHeight: 44,
                      fontSize: 15, fontWeight: 800,
                      background: 'var(--surface)', color: 'var(--text)',
                      border: '1px solid var(--border)', outline: 'none', marginLeft: 'auto',
                      boxSizing: 'border-box' as const,
                    }}
                  />
                </div>

                {/* Preview */}
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  {t('moveToTime')}{' '}
                  <span dir="ltr" style={{ display: 'inline' }}>
                    <strong style={{ color: 'var(--terra)' }}>{pendingTime}</strong>
                    {' '}–{' '}
                    <strong style={{ color: 'var(--terra)' }}>{toTime(toMins(pendingTime) + event.duration)}</strong>
                    {pendingTime !== event.time && (
                      <span style={{ color: 'var(--text-3)', fontSize: 11 }}>
                        {' '}({toMins(pendingTime) > toMins(event.time) ? '+' : ''}{toMins(pendingTime) - toMins(event.time)}m)
                      </span>
                    )}
                  </span>
                </p>

                {/* Confirm / Cancel */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={cancelReschedule}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: 'var(--surface)', color: 'var(--text-2)',
                      border: '1px solid var(--border)', cursor: 'pointer',
                    }}>
                    {t('cancel')}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={confirm}
                    disabled={pendingTime === event.time}
                    style={{
                      flex: 2, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 800,
                      background: pendingTime !== event.time ? 'var(--terra)' : 'var(--border)',
                      color: pendingTime !== event.time ? '#fff' : 'var(--text-3)',
                      border: 'none', cursor: pendingTime !== event.time ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}>
                    ✓ {t('confirmMove')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline move-to-day panel */}
        <AnimatePresence>
          {moving && (
            <motion.div
              key="move-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                borderTop: '1px solid var(--border)',
                padding: '12px 12px 14px',
                background: 'var(--bg)',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 10 }}>
                  {locale === 'he' ? 'העבר ליום:' : 'Move to day:'}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Array.from({ length: tripDays }, (_, i) => i + 1).filter(d => d !== dayNumber).map(d => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { onMove(event, d); setMoving(false); }}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        minHeight: 36,
                        background: 'var(--surface)', cursor: 'pointer',
                        color: 'var(--terra)',
                        border: '1px solid rgba(196,113,74,0.25)',
                        touchAction: 'manipulation',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                      }}
                    >
                      <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
                        {locale === 'he' ? `יום ${d}` : `Day ${d}`}
                      </span>
                      <span>{fmtDate(startDate, d - 1, locale)}</span>
                    </motion.button>
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setMoving(false)}
                  style={{
                    marginTop: 10, width: '100%', padding: '6px 0', borderRadius: 8,
                    fontSize: 12, fontWeight: 700, background: 'var(--surface)',
                    color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer',
                  }}>
                  {t('cancel')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Main screen ──────────────────────────────────────────────── */
export default function DayScreen() {
  const {
    trip, activeDay, setActiveDay,
    addEvent, editEvent, deleteEvent, moveEvent,
    addHotel, editHotel, deleteHotel,
    setShowSuggestions, showSuggestions,
    updateDayMeta,
    setScreen,
    nickname,
    dayEndHour,
    currencyByTrip, tripDbId,
  } = useAppStore();
  const { show } = useToast();
  const { t, locale, isRTL } = useI18n();

  const stripRef = useRef<HTMLDivElement>(null);

  // Swipe gesture refs for day navigation
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

  const [weather, setWeather] = useState<{ temp: number; code: number; icon?: string; label?: string } | null>(null);

  const [navDirection, setNavDirection] = useState<'forward' | 'back'>('forward');
  const [glowKey, setGlowKey] = useState<string | null>(null);

  const navigateToDay = (dayNum: number) => {
    setNavDirection(dayNum > activeDay ? 'forward' : 'back');
    setActiveDay(dayNum);
  };

  const savingRef = useRef(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<TripEvent | null>(null);
  const [fTime, setFTime] = useState('09:00');
  const [fDur, setFDur] = useState('60');
  const [fName, setFName] = useState('');
  const [fCat, setFCat] = useState<Category>('attraction');
  const [fLoc, setFLoc] = useState('');
  const [fLat, setFLat] = useState<number | undefined>(undefined);
  const [fLng, setFLng] = useState<number | undefined>(undefined);
  const [fNotes, setFNotes] = useState('');
  const [manualCat, setManualCat] = useState(false);
  const [fCost, setFCost] = useState('');
  const [fTags, setFTags] = useState(''); // comma-separated tag input
  const [showEditDay, setShowEditDay] = useState(false);
  const [editDayName, setEditDayName] = useState('');
  const [editDayEmoji, setEditDayEmoji] = useState('');
  const [showDrivePrompt, setShowDrivePrompt] = useState(false);
  const [driveMinutes, setDriveMinutes] = useState('');
  const [focusedEvent, setFocusedEvent] = useState<TripEvent | null>(null);
  const [savedFlightTime, setSavedFlightTime] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Budget breakdown state
  const [showBudget, setShowBudget] = useState(false);
  const [budgetEdit, setBudgetEdit] = useState<Record<string, string>>({});

  // Hotel management state
  const [showHotelSheet, setShowHotelSheet] = useState(false);
  const [editHotelTarget, setEditHotelTarget] = useState<string | null>(null); // hotel id being edited
  const [hLocation, setHLocation] = useState('');
  const [hLat, setHLat] = useState<number | null>(null);
  const [hLng, setHLng] = useState<number | null>(null);
  const [hCheckIn, setHCheckIn] = useState(1);
  const [hCheckOut, setHCheckOut] = useState(2);

  // View mode: list (default) or timeline — session-scoped, resets on app close
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // Fetch weather for the active day via our /api/weather proxy (Google → Open-Meteo fallback)
  // Coordinate resolution order:
  //   1. Events on this day with valid coords
  //   2. dayMeta for this day (only if not in the Israel-default ~31,35 area)
  //   3. Any other day's dayMeta with valid non-default coords
  //   4. Capital of the first destination country
  useEffect(() => {
    if (!trip) return;

    const isDefaultIsrael = (lat: number, lng: number) =>
      Math.abs(lat - 31) < 3 && Math.abs(lng - 35) < 3;

    const dayEvs = trip.events[activeDay] ?? [];
    let lat: number | undefined;
    let lng: number | undefined;

    // 1. Events on this day
    for (const ev of dayEvs) {
      if (ev.lat && ev.lng && !isDefaultIsrael(ev.lat, ev.lng)) {
        lat = ev.lat; lng = ev.lng; break;
      }
    }

    // 2. dayMeta for this day
    if (!lat) {
      const m = trip.dayMeta[activeDay - 1];
      if (m?.lat && m?.lng && !isDefaultIsrael(m.lat, m.lng)) {
        lat = m.lat; lng = m.lng;
      }
    }

    // 3. Any other day's dayMeta
    if (!lat) {
      for (const m of trip.dayMeta ?? []) {
        if (m?.lat && m?.lng && !isDefaultIsrael(m.lat, m.lng)) {
          lat = m.lat; lng = m.lng; break;
        }
      }
    }

    // 4. Capital of the destination country
    if (!lat && trip.countries?.length) {
      const capital = getCapitalCoords(trip.countries[0]);
      if (capital) { lat = capital.lat; lng = capital.lng; }
    }

    if (!lat || !lng) return;

    const startDate = trip.startDate ?? new Date().toISOString().split('T')[0];
    const params = new URLSearchParams({
      lat: String(lat), lng: String(lng), start: startDate, days: String(trip.days),
    });
    fetch(`/api/weather?${params}`)
      .then(r => r.json())
      .then(d => {
        const times: string[] = d?.daily?.time ?? [];
        const dayDate = new Date(new Date(startDate).getTime() + (activeDay - 1) * 86_400_000).toISOString().split('T')[0];
        const idx = times.indexOf(dayDate);
        if (idx >= 0) {
          const icons: string[] = d?.daily?.icon ?? [];
          const labels: string[] = d?.daily?.label ?? [];
          setWeather({
            code: d.daily.weathercode?.[idx] ?? 0,
            temp: Math.round(d.daily.temperature_2m_max?.[idx] ?? 0),
            icon: icons[idx],
            label: labels[idx],
          });
        }
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, trip?.startDate, JSON.stringify(trip?.dayMeta), JSON.stringify((trip?.events[activeDay] ?? []).map(e => [e.lat, e.lng]))]);


  // Auto-detect category from event name when user hasn't manually chosen one
  useEffect(() => {
    if (manualCat || editTarget) return;
    const n = fName.toLowerCase();
    let cat: Category = 'attraction';
    if (/coffee|cafe|espresso|cappuccino|latte|tea|קפה|בית קפה/.test(n)) cat = 'cafe';
    else if (/eat|food|lunch|dinner|breakfast|meal|restaurant|falafel|pizza|burger|אוכל|ארוחה|מסעדה/.test(n)) cat = 'food';
    else if (/flight|airport|landing|takeoff|take.?off|boarding|terminal|runway|plane|check.?in|טיסה|שדה תעופה/.test(n)) cat = 'flight';
    else if (/drive|driving|car|bus|taxi|uber|train|transport|road|gas|fuel|נסיעה|נהיגה|אוטובוס|רכב/.test(n)) cat = 'transport';
    else if (/hotel|hostel|airbnb|check.?in|check.?out|accommodation|lodg|inn|resort|apartment|stay|motel|מלון|לינה|צ'ק אין/.test(n)) cat = 'hotel';
    else if (/rest|sleep|camp|nap|relax|overnight|חניה|מנוחה|שינה/.test(n)) cat = 'rest';
    setFCat(cat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fName]);

  const QUICK_PRESETS: { cat: Category; label: string; name: string; dur: number }[] = [
    { label: t('quickDriveLabel'), name: t('quickDriveName'), cat: 'transport', dur: 30 },
    { label: t('quickMealLabel'), name: t('quickMealName'), cat: 'food', dur: 60 },
    { label: t('quickCoffeeLabel'), name: t('quickCoffeeName'), cat: 'cafe', dur: 30 },
    { label: t('quickRestLabel'), name: t('quickRestName'), cat: 'rest', dur: 20 },
    { label: t('quickGasLabel'), name: t('quickGasName'), cat: 'transport', dur: 15 },
  ];

  if (!trip) return null;

  const evs = [...(trip.events[activeDay] ?? [])].sort((a, b) => toMins(a.time) - toMins(b.time));
  const meta = trip.dayMeta[activeDay - 1];
  const conflicts = getConflicts(evs);
  const dayDate = trip.startDate
    ? new Date(new Date(trip.startDate).getTime() + (activeDay - 1) * 86_400_000).toISOString().split('T')[0]
    : trip.startDate ?? new Date().toISOString().split('T')[0];
  const dayLat = meta?.lat ?? 32;
  const dayBudget = getDayBudget(evs);
  const currSym = getCurrencySymbol((tripDbId && currencyByTrip[tripDbId]) || 'USD');

  const openMapForDay = () => {
    const withCoords = evs.filter(e => e.lat && e.lng);
    if (withCoords.length >= 2) {
      const stops = withCoords.map(e => `${e.lat},${e.lng}`).join('/');
      window.open(`https://www.google.com/maps/dir/${stops}/`, 'trippy-map');
    } else if (withCoords.length === 1) {
      const e = withCoords[0];
      window.open(`https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`, 'trippy-map');
    } else {
      const withLoc = evs.filter(e => e.location);
      if (withLoc.length >= 2) {
        const stops = withLoc.map(e => encodeURIComponent(e.location!)).join('/');
        window.open(`https://www.google.com/maps/dir/${stops}/`, 'trippy-map');
      } else {
        const query = withLoc[0]?.location ?? meta?.region ?? 'map';
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, 'trippy-map');
      }
    }
  };

  const weatherEmoji = (code: number) => {
    if (code === 0) return 'sun';
    if (code <= 3) return 'sun';
    if (code <= 48) return 'sun';
    if (code <= 67) return 'sun';
    if (code <= 77) return 'sun';
    if (code <= 82) return 'sun';
    if (code <= 86) return 'sun';
    return 'sun';
  };

  // Build interleaved list: event → connector → event → …
  type ListItem =
    | { type: 'event'; ev: TripEvent }
    | { type: 'connector'; gapMins: number; gapStart: number; fromEv?: TripEvent; toEv?: TripEvent }
    | { type: 'tz-badge'; timezone: string };

  const items: ListItem[] = [];
  let prevTz: string | undefined;
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i];
    // §3: inject timezone boundary badge when crossing timezones
    if (ev.timezone && prevTz && ev.timezone !== prevTz) {
      items.push({ type: 'tz-badge', timezone: ev.timezone });
    }
    if (ev.timezone) prevTz = ev.timezone;
    items.push({ type: 'event', ev });
    if (i < evs.length - 1) {
      const curEnd = toMins(evs[i].time) + evs[i].duration;
      const nextStart = toMins(evs[i + 1].time);
      items.push({ type: 'connector', gapMins: Math.max(0, nextStart - curEnd), gapStart: curEnd, fromEv: evs[i], toEv: evs[i + 1] });
    }
  }
  // Gap after last event (free time before end of day, respects night-owl setting)
  if (evs.length > 0) {
    const lastEnd = toMins(evs[evs.length - 1].time) + evs[evs.length - 1].duration;
    const endOfDay = dayEndHour * 60;
    if (endOfDay - lastEnd >= 45) {
      items.push({ type: 'connector', gapMins: endOfDay - lastEnd, gapStart: lastEnd });
    }
  }

  const openAdd = (prefillTime?: string) => {
    savingRef.current = false;
    // Default start time: after the last event, or 09:00 for first event
    let defaultStart = '09:00';
    if (prefillTime) {
      defaultStart = prefillTime;
    } else if (evs.length > 0) {
      const last = evs[evs.length - 1];
      defaultStart = toTime(toMins(last.time) + last.duration);
    }
    setFTime(defaultStart);
    setFDur('60'); setFName(''); setFCat('attraction'); setFLoc(''); setFLat(undefined); setFLng(undefined); setFNotes(''); setFCost(''); setFTags('');
    setEditTarget(null);
    setManualCat(false);
    setShowAdd(true);
  };

  const openEdit = (e: TripEvent) => {
    savingRef.current = false;
    setFTime(e.time); setFDur(String(e.duration));
    setFName(e.name); setFCat(e.category);
    setFLoc(e.location ?? ''); setFLat(e.lat); setFLng(e.lng); setFNotes(e.notes ?? '');
    setFCost(e.cost != null ? String(e.cost) : '');
    setFTags((e.tags ?? []).join(', '));
    setEditTarget(e);
    setManualCat(true);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    if (!fName.trim()) { savingRef.current = false; show(t('enterEventName')); return; }
    const dur = parseInt(fDur, 10) || 60;
    const cost = fCost.trim() ? parseFloat(fCost) : undefined;
    const tags = fTags.split(',').map(t => t.trim()).filter(Boolean);

    // Fetch IANA timezone for the event's location (§1.3 — cached 24h on server)
    let timezone: string | undefined;
    if (fLat && fLng) {
      try {
        const tzRes = await fetch(`/api/timezone?lat=${fLat}&lng=${fLng}`);
        if (tzRes.ok) {
          const tzData = await tzRes.json();
          if (tzData.timeZoneId) timezone = tzData.timeZoneId;
        }
      } catch { /* save without timezone on network failure */ }
    }

    if (editTarget) {
      editEvent(activeDay, editTarget.id, {
        time: fTime, duration: dur, name: fName, category: fCat,
        location: fLoc || undefined, lat: fLat, lng: fLng, notes: fNotes || undefined,
        cost: cost && !isNaN(cost) ? cost : undefined,
        tags: tags.length ? tags : undefined,
        timezone,
      });
      show(t('eventUpdated'));
      setShowAdd(false);
    } else {
      addEvent(activeDay, {
        time: fTime, duration: dur, name: fName, category: fCat,
        location: fLoc || undefined, lat: fLat, lng: fLng, notes: fNotes || undefined,
        cost: cost && !isNaN(cost) ? cost : undefined,
        tags: tags.length ? tags : undefined,
        timezone,
      });
      show(t('eventAdded'));
      setShowAdd(false);
      const newGlowKey = fTime + '|' + fName;
      setGlowKey(newGlowKey);
      setTimeout(() => setGlowKey(k => k === newGlowKey ? null : k), 1500);
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
      const driveStart = Math.max(0, flightStart - mins);
      addEvent(activeDay, {
        time: toTime(driveStart),
        duration: mins,
        name: t('driveToAirportName'),
        category: 'transport',
      });
      show(t('driveAddedToast'));
    }
    setShowDrivePrompt(false);
  };

  const handleDelete = (id: string) => {
    const victim = evs.find(e => e.id === id);
    if (!victim) return;
    deleteEvent(activeDay, id);
    show(`${victim.name} ${t('removedSuffix')}`, {
      action: {
        label: t('undoLabel'),
        onClick: () => {
          addEvent(activeDay, {
            time: victim.time, duration: victim.duration, name: victim.name,
            category: victim.category, location: victim.location,
            lat: victim.lat, lng: victim.lng, notes: victim.notes,
            cost: victim.cost, tags: victim.tags,
          });
        },
      },
    });
  };

  const handleReschedule = (e: TripEvent, newTime: string) => {
    editEvent(activeDay, e.id, { time: newTime });
    show(`${e.name} ${t('movedToSuffix')} ${newTime}`);
  };

  const handleMove = (e: TripEvent, targetDay: number) => {
    moveEvent(activeDay, targetDay, e.id);
    show(`${e.name} → Day ${targetDay}`);
  };

  const openHotelSheet = (hotelId?: string) => {
    if (hotelId) {
      const h = (trip?.hotels ?? []).find(h => h.id === hotelId);
      if (!h) return;
      setEditHotelTarget(hotelId);
      setHLocation(h.location ?? '');
      setHLat(h.lat ?? null);
      setHLng(h.lng ?? null);
      setHCheckIn(h.checkInDay);
      setHCheckOut(h.checkOutDay);
    } else {
      setEditHotelTarget(null);
      setHLocation('');
      setHLat(null);
      setHLng(null);
      setHCheckIn(activeDay);
      setHCheckOut(activeDay + 1);
    }
    setShowHotelSheet(true);
  };

  const handleSaveHotel = () => {
    if (!hLocation.trim()) { show(locale === 'he' ? 'הכנס מיקום' : 'Enter a location'); return; }
    if (hCheckOut <= hCheckIn) { show(locale === 'he' ? 'תאריך הצ\'ק-אאוט חייב להיות אחרי הצ\'ק-אין' : 'Checkout must be after check-in'); return; }
    const patch = {
      location: hLocation,
      lat: hLat ?? undefined,
      lng: hLng ?? undefined,
      checkInDay: hCheckIn,
      checkOutDay: hCheckOut,
    };
    if (editHotelTarget) {
      editHotel(editHotelTarget, patch);
    } else {
      addHotel(patch);
    }
    setShowHotelSheet(false);
  };

  // Day strip helpers
  const getDayInfo = (dayNum: number) => {
    const base = trip.startDate ? new Date(trip.startDate + 'T00:00:00') : new Date();
    base.setDate(base.getDate() + dayNum - 1);
    const dow = base.getDay();
    const abbrev = locale === 'he' ? DAY_ABBREVS_HE[dow] : DAY_ABBREVS_EN[dow];
    return { abbrev, dateNum: base.getDate() };
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: 'var(--bg)' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: 'var(--page-pt) var(--page-px) 0',
          flexShrink: 0,
        }}
      >
        {/* Eyebrow */}
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.20em', color: 'var(--terra)',
          textTransform: 'uppercase', margin: '0 0 8px',
        }}>
          HOUR BY HOUR
        </p>

        {/* Big heading: Day N · Region */}
        <h1 className="display-xl" style={{
          fontSize: 'clamp(1.9rem, 6vw, 2.8rem)',
          color: 'var(--lg-ink)',
          marginBottom: 0,
        }}>
          {`${t('day')} ${activeDay}`}
          {meta?.region && (
            <span style={{ color: 'var(--text-2)', fontStyle: 'normal', fontSize: '0.55em', fontWeight: 600 }}>
              {' · '}<span style={{ color: 'var(--text)' }}>{meta.region}</span>
            </span>
          )}
        </h1>
      </motion.div>

      {/* ── Day strip ────────────────────────────────────────── */}
      <motion.div
        ref={stripRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        style={{
          display: 'flex', gap: 6,
          padding: '14px var(--page-px) 12px',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}
      >
        {Array.from({ length: Math.min(trip.days, 30) }, (_, i) => {
          const dayNum = i + 1;
          const isActive = dayNum === activeDay;
          const { abbrev, dateNum } = getDayInfo(dayNum);
          const MONTH_ABBREVS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
          const base2 = trip.startDate ? new Date(trip.startDate + 'T00:00:00') : new Date();
          base2.setDate(base2.getDate() + i);
          const monthAbbrev = MONTH_ABBREVS[base2.getMonth()];
          return (
            <motion.button
              key={dayNum}
              onClick={() => navigateToDay(dayNum)}
              whileTap={{ scale: 0.88 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '8px 15px', flexShrink: 0, gap: 1,
                background: isActive
                  ? 'linear-gradient(180deg, var(--lg-forest), var(--lg-forest-deep))'
                  : 'var(--lg-panel)',
                backdropFilter: 'var(--lg-blur)',
                WebkitBackdropFilter: 'var(--lg-blur)',
                border: 'none',
                borderRadius: 9999, cursor: 'pointer',
                boxShadow: isActive ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)',
                color: isActive ? '#fff' : 'var(--text-2)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: isActive ? 0.85 : 0.7, lineHeight: 1 }}>
                {monthAbbrev}
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 800, lineHeight: 1.1 }}>
                {dateNum}
              </span>
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
            setEditDayEmoji(meta?.emoji ?? 'compass');
            setShowEditDay(true);
          }}
          style={{
            padding: '0 var(--page-px) 12px',
            display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
            flexShrink: 0, cursor: 'pointer',
          }}
        >
          {meta?.emoji && <StampIcon iconKey={meta.emoji} size={20} />}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
            {meta?.region}
            {trip.startDate ? ` · ${fmtDate(trip.startDate, activeDay - 1, locale)}` : ''}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 2 }}>
            · {evs.length} {evs.length === 1 ? t('stopSingular') : t('stopPlural')}
          </span>
          {dayBudget > 0 && (
            <motion.span
              whileTap={{ scale: 0.94 }}
              onClick={e => {
                e.stopPropagation();
                setBudgetEdit(Object.fromEntries(evs.map(ev => [ev.id, ev.cost != null ? String(ev.cost) : ''])));
                setShowBudget(true);
              }}
              style={{
                fontSize: 11, fontWeight: 700, color: 'var(--success)',
                background: 'var(--success-bg)',
                border: '1px solid rgba(40,160,90,0.2)',
                borderRadius: 100, padding: '1px 8px', marginLeft: 2,
                cursor: 'pointer',
              }}
            >
              💰 {currSym}{dayBudget}
            </motion.span>
          )}
          {conflicts.size > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--danger)',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: 100, padding: '1px 8px',
            }}>
              ⚠️ {conflicts.size / 2 | 0 || 1} {t('overlapCount')}
            </span>
          )}
          {weather && (() => {
            const loc = evs.find(e => e.location)?.location ?? meta?.region ?? trip?.name ?? '';
            const icon = 'sun';
            return (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(loc + ' weather')}`}
                target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--text-2)',
                  background: 'var(--bg-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 100, padding: '1px 8px', marginLeft: 2,
                  textDecoration: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}
                title={weather.label}
              >
                <Icon name="sun" size={11} color="var(--lg-sand)" /> {weather.temp}°C
              </a>
            );
          })()}
          <Icon name="edit" size={11} style={{ color: 'var(--text-3)', marginLeft: 2 }} />
        </motion.div>
      </AnimatePresence>

      {/* ── View mode toggle (List / Timeline) ───────────────── */}
      {evs.length > 0 && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          padding: '0 var(--page-px) 8px',
          flexShrink: 0,
        }}>
          <div className="lg" style={{ display: 'flex', padding: 4, borderRadius: 9999, gap: 2 }}>
            {(['list', 'timeline'] as const).map(mode => (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.94 }}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '7px 13px',
                  borderRadius: 9999,
                  fontSize: 10, fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  background: viewMode === mode ? 'var(--lg-terra)' : 'transparent',
                  color: viewMode === mode ? '#fff' : 'var(--text-3)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                {mode === 'list' ? t('list') as string || 'List' : t('timeline') as string || 'Timeline'}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Itinerary list ───────────────────────────────────── */}
      {(() => {
        // Hotel you sleep in tonight (check-in day up to, but not including, checkout day)
        const tonightHotel = (trip.hotels ?? []).find(
          h => h.checkInDay <= activeDay && activeDay < h.checkOutDay,
        );
        // Hotel you're checking out of this morning
        const checkoutHotel = (trip.hotels ?? []).find(
          h => h.checkOutDay === activeDay,
        );
        // Top shows the checkout hotel (leaving this morning), or tonight's hotel if not check-in day
        const topHotel = checkoutHotel ?? (tonightHotel?.checkInDay !== activeDay ? tonightHotel : null);
        // Bottom always reflects tonight — null means show "Add hotel"
        const bottomHotel = tonightHotel;
        const hotelBanner = (pos: 'top' | 'bottom') => {
          const hotel = pos === 'top' ? topHotel : bottomHotel;
          if (pos === 'top' && topHotel == null) return null;
          return (
            <div
              className="lg"
              onClick={() => openHotelSheet(hotel?.id)}
              style={{
                margin: pos === 'top' ? '8px var(--page-px) 6px' : '6px var(--page-px) 8px',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px',
                cursor: 'pointer',
                background: hotel ? 'var(--lg-panel)' : 'transparent',
                backdropFilter: hotel ? 'var(--lg-blur)' : 'none',
                WebkitBackdropFilter: hotel ? 'var(--lg-blur)' : 'none',
                border: hotel ? 'none' : '1px dashed var(--border)',
                borderRadius: 18,
                boxShadow: hotel ? 'var(--lg-shadow), inset 0 1px 0 oklch(100% 0 0 / 60%)' : 'none',
              }}
            >
              <StampIcon iconKey="hotel" size={34} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5, marginBottom: 1, display: 'block' }}>
                  {pos === 'bottom' && hotel ? (locale === 'he' ? 'צ\'ק-אאוט' : 'Checkout') : (locale === 'he' ? 'לינה' : 'Stay')}
                </span>
                {hotel ? (
                  <p dir="ltr" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'start' }}>
                    {hotel.location}
                  </p>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, margin: 0 }}>
                    {locale === 'he' ? 'הוסף מלון / לינה' : 'Add hotel / accommodation'}
                  </p>
                )}
              </div>
              {hotel && hotel.lat != null && hotel.lng != null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${hotel.lat},${hotel.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', color: 'var(--terra)', flexShrink: 0 }}
                >
                  <Icon name="pin" size={16} />
                </a>
              )}
              {hotel && (
                <span style={{ fontSize: 11, color: 'var(--lg-forest)', fontWeight: 700 }}>
                  {locale === 'he' ? 'ערוך' : 'Edit'}
                </span>
              )}
            </div>
          );
        };

        /* ─── Weather + Day Budget bar ─── */
        const weatherBudgetBar = (weather || dayBudget > 0) && (
          <div style={{ display: 'flex', gap: 10, margin: '0 var(--page-px) 8px' }}>
            {weather && (
              <div className="lg" style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="sun" size={22} color="var(--lg-sand)" />
                <div>
                  <span className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5, marginBottom: 1 }}>{locale === 'he' ? 'מזג אוויר' : 'Weather'}</span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{weather.temp}° · {weather.label ?? ''}</div>
                </div>
              </div>
            )}
            {dayBudget > 0 && (
              <div className="lg" style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                onClick={() => { setBudgetEdit(Object.fromEntries(evs.map(ev => [ev.id, ev.cost != null ? String(ev.cost) : '']))); setShowBudget(true); }}>
                <Icon name="download" size={20} style={{ color: 'var(--lg-terra)', flexShrink: 0 }} />
                <div>
                  <span className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5, marginBottom: 1 }}>{locale === 'he' ? 'תקציב יום' : 'Day budget'}</span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{currSym}{dayBudget}</div>
                </div>
              </div>
            )}
          </div>
        );
        return (
          <div
            className="flex-1 overflow-y-auto day-list-pb"
            onTouchStart={e => {
              swipeStartX.current = e.touches[0].clientX;
              swipeStartY.current = e.touches[0].clientY;
            }}
            onTouchEnd={e => {
              if (!trip) return;
              const dx = e.changedTouches[0].clientX - swipeStartX.current;
              const dy = e.changedTouches[0].clientY - swipeStartY.current;
              if (Math.abs(dx) > Math.abs(dy) * 1.8 && Math.abs(dx) > 55) {
                // In RTL, swipe directions are flipped (right-to-left reads backward)
                const fwd = isRTL ? dx > 0 : dx < 0;
                const bwd = isRTL ? dx < 0 : dx > 0;
                if (fwd && activeDay < trip.days) navigateToDay(activeDay + 1);
                if (bwd && activeDay > 1) navigateToDay(activeDay - 1);
              }
            }}
            style={{ overflowX: 'hidden' }}
          >
            <AnimatePresence mode="wait" custom={navDirection} initial={false}>
              <motion.div
                key={activeDay}
                custom={navDirection}
                variants={slideVariants(isRTL)}
                initial="enter"
                animate="center"
                exit="exit"
                transition={spring.gentle}
              >
            {weatherBudgetBar}
            {hotelBanner('top')}
            {(() => {
              const firstWithCoords = evs.find(e => e.lat != null && e.lng != null);
              if (tonightHotel?.lat != null && tonightHotel?.lng != null && firstWithCoords) {
                return (
                  <HotelTravelRow
                    hotelLat={tonightHotel.lat!}
                    hotelLng={tonightHotel.lng!}
                    eventLat={firstWithCoords.lat!}
                    eventLng={firstWithCoords.lng!}
                    eventName={firstWithCoords.name}
                  />
                );
              }
              return null;
            })()}
        {/* Timeline view — shown instead of list when toggled */}
        {viewMode === 'timeline' && evs.length > 0 ? (
          <DayTimelineView
            events={evs}
            dayEndHour={dayEndHour}
            onAdd={prefillTime => openAdd(prefillTime)}
            onSuggest={(gapStart, gapEnd) => setShowSuggestions(true, gapStart, gapEnd)}
            onFocus={setFocusedEvent}
          />
        ) : (
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
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <StampIcon iconKey="compass" size={72} style={{ filter: 'drop-shadow(0 4px 12px oklch(20% 0.03 60 / 20%))' }} />
                </motion.div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', textAlign: 'center', margin: 0 }}>
                  Nothing planned for this day yet
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5, margin: 0 }}>
                  Add your first event to start building the day
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAdd()}
                  className="lg-btn lg-btn-terra"
                  style={{ height: 52, padding: '0 28px', fontSize: 14 }}
                >
                  <Icon name="plus" size={16} color="#fff" />
                  Add first event
                </motion.button>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
                {items.map((item, idx) =>
                  item.type === 'tz-badge' ? (
                    <TimezoneBadge key={`tz-${idx}`} timezone={item.timezone} />
                  ) : item.type === 'event' ? (
                    <EventCard
                      key={item.ev.id}
                      event={item.ev}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onReschedule={handleReschedule}
                      onMove={handleMove}
                      onFocus={setFocusedEvent}
                      isConflict={conflicts.has(item.ev.id)}
                      goldenHour={getGoldenHourType(toMins(item.ev.time), item.ev.duration, dayLat, dayDate)}
                      nickname={nickname}
                      dayNumber={activeDay}
                      tripDays={trip.days}
                      startDate={trip.startDate}
                      locale={locale}
                      isNew={glowKey === item.ev.time + '|' + item.ev.name}
                    />
                  ) : (
                    <RouteConnector
                      key={`conn-${idx}`}
                      gapMins={item.gapMins}
                      gapStart={item.gapStart}
                      fromEv={item.fromEv}
                      toEv={item.toEv}
                      tripStartDate={trip.startDate}
                      onSuggest={() => setShowSuggestions(true, item.gapStart, item.gapStart + item.gapMins)}
                      onAdd={() => openAdd(toTime(item.gapStart))}
                      t={t}
                    />
                  )
                )}
              </div>
            )}
          </AnimatePresence>
        )}
            {hotelBanner('bottom')}
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })()}

      {/* ── Event detail sheet ──────────────────────────────────── */}
      {focusedEvent && (() => {
        const ev = focusedEvent;
        const meta2 = CAT_META[ev.category];
        const endT2 = toTime(toMins(ev.time) + ev.duration);
        return (
          <Sheet
            onClose={() => setFocusedEvent(null)}
            title={t(ev.name as any)}
            subtitle={`${meta2.label} · ${ev.time} – ${endT2}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Duration */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 100, padding: '5px 12px',
                  fontSize: 12, fontWeight: 700, color: 'var(--text-2)',
                }}>
                  🕐 <span dir="ltr">{ev.time} – {endT2}</span>
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: meta2.bg, color: meta2.color,
                  borderRadius: 100, padding: '5px 12px',
                  fontSize: 12, fontWeight: 800,
                }}>
                  <EventIcon category={ev.category as any} size={12} /> {fmtDuration(ev.duration)}
                </span>
                {ev.cost != null && ev.cost > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'var(--success-bg)', color: 'var(--success)',
                    borderRadius: 100, padding: '5px 12px',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    💰 {currSym}{ev.cost}
                  </span>
                )}
              </div>

              {/* Location */}
              {ev.location && (
                <a
                  href={getMapsUrl(ev.location, ev.lat, ev.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 14, color: 'var(--terra)', fontWeight: 600,
                    textDecoration: 'none',
                    background: 'var(--terra-muted)',
                    border: '1px solid rgba(59,110,82,0.22)',
                    borderRadius: 'var(--radius-md)', padding: '10px 14px',
                    width: 'fit-content',
                  }}
                >
                  <Icon name="pin" size={14} style={{ display: 'inline-flex', verticalAlign: 'middle' }} /> {ev.location}
                </a>
              )}

              {/* Notes */}
              {ev.notes && (
                <div style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '12px 14px',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    {locale === 'he' ? 'הערות' : 'Notes'}
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>{ev.notes}</p>
                </div>
              )}

              {/* Tags */}
              {ev.tags && ev.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ev.tags.map((tag, ti) => (
                    <span key={ti} style={{
                      display: 'inline-flex', alignItems: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: 'var(--route-badge-text)',
                      background: 'var(--route-badge-bg)',
                      border: '1px solid var(--route-badge-border)',
                      borderRadius: 100, padding: '4px 10px',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <GlassBtn
                  size="sm"
                  variant="accent"
                  style={{ flex: 1 }}
                  onClick={() => { setFocusedEvent(null); openEdit(ev); }}
                >
                  <Icon name="edit" size={13} /> {t('editEvent')}
                </GlassBtn>
                <GlassBtn
                  size="sm"
                  variant="danger"
                  style={{ flex: 1 }}
                  onClick={() => { setFocusedEvent(null); handleDelete(ev.id); }}
                >
                  <Icon name="trash" size={13} /> {locale === 'he' ? 'מחק' : 'Delete'}
                </GlassBtn>
              </div>
            </div>
          </Sheet>
        );
      })()}

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
                        background: fName === p.name && fCat === p.cat ? 'var(--terra-muted)' : 'var(--bg)',
                        color: fName === p.name && fCat === p.cat ? 'var(--terra)' : 'var(--text-2)',
                        border: fName === p.name && fCat === p.cat
                          ? '1.5px solid var(--terra)'
                          : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <StampIcon iconKey={CAT_FALLBACK[p.cat]} size={16} /> {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <Field
              label={t('eventName')} placeholder={t('eventNamePlaceholder')}
              value={fName} onChange={setFName} autoFocus
            />

            {/* Start time + Duration — full-width stacked for mobile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label={t('startTime')} type="time" value={fTime} onChange={setFTime} />
              <div>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-2)', marginBottom: 8,
                }}>
                  {t('duration')}
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {[30, 60, 90, 120].map(d => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setFDur(String(d))}
                      style={{
                        padding: '8px 14px', borderRadius: 10,
                        fontSize: 13, fontWeight: 600, flex: '1 1 auto',
                        background: fDur === String(d) ? 'var(--terra)' : 'var(--bg)',
                        color: fDur === String(d) ? 'white' : 'var(--text-2)',
                        border: fDur === String(d) ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'background 0.15s',
                        minWidth: 52, textAlign: 'center',
                      }}
                    >
                      {fmtDuration(d)}
                    </motion.button>
                  ))}
                  {/* End-time picker: lets user pick when the event ends instead of typing minutes */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.05em' }}>
                      {locale === 'he' ? 'סיום' : 'ENDS AT'}
                    </span>
                    <input
                      type="time"
                      value={toTime(toMins(fTime) + (parseInt(fDur, 10) || 60))}
                      onChange={e => {
                        const endMins = toMins(e.target.value);
                        const startMins = toMins(fTime);
                        const dur = Math.max(5, endMins > startMins ? endMins - startMins : 24 * 60 - startMins + endMins);
                        setFDur(String(dur));
                      }}
                      style={{
                        padding: '8px 10px', borderRadius: 10, minHeight: 44,
                        fontSize: 15, fontWeight: 700,
                        background: ![30, 60, 90, 120].includes(parseInt(fDur)) ? 'var(--terra)' : 'var(--bg)',
                        color: ![30, 60, 90, 120].includes(parseInt(fDur)) ? 'white' : 'var(--text)',
                        border: ![30, 60, 90, 120].includes(parseInt(fDur)) ? 'none' : '1px solid var(--border)',
                        outline: 'none', cursor: 'pointer',
                        boxSizing: 'border-box' as const,
                      }}
                    />
                  </div>
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
                      <EventIcon category={c as any} size={12} /> {m.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <PlacesInput
              label={t('locationOpt')} placeholder={t('locationFullPlaceholder')}
              value={fLoc}
              onChange={name => { setFLoc(name); setFLat(undefined); setFLng(undefined); }}
              onSelect={({ name, lat, lng }) => { setFLoc(name); setFLat(lat); setFLng(lng); }}
            />
            <Field
              label={t('notesOpt')} placeholder={t('notesFullPlaceholder')}
              value={fNotes} onChange={setFNotes} rows={2}
            />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                {t('costLabel')}
              </label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                placeholder={t('costPlaceholder')}
                value={fCost}
                onChange={e => setFCost(e.target.value)}
                className="input-premium"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)',
                  fontSize: 15, fontWeight: 500, minHeight: 44,
                  background: 'var(--bg)', color: 'var(--text)',
                  border: '1px solid var(--border)', outline: 'none',
                  boxSizing: 'border-box' as const,
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            {/* Tags input */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                {t('tagsLabel')} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({t('tagsOptional')})</span>
              </label>
              <input
                value={fTags}
                onChange={e => setFTags(e.target.value)}
                placeholder={t('tagsPlaceholder')}
                className="input-premium"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)',
                  fontSize: 15, fontWeight: 500, minHeight: 44,
                  background: 'var(--bg)', color: 'var(--text)',
                  border: '1px solid var(--border)', outline: 'none',
                  boxSizing: 'border-box' as const,
                  fontFamily: 'var(--font-sans)',
                }}
              />
              {fTags.trim() && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                  {fTags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 700,
                      color: 'var(--route-badge-text)',
                      background: 'var(--route-badge-bg)',
                      border: '1px solid var(--route-badge-border)',
                      borderRadius: 100, padding: '2px 8px',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
          title={`${t('day')} ${activeDay} — ${t('editEvent')}`}
          subtitle={t('editDaySubtitle')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field
              label={t('editDayCityLabel')}
              placeholder={t('editDayCityPlaceholder')}
              value={editDayName}
              onChange={setEditDayName}
              autoFocus
            />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                {t('emojiLabel')}
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['museum', 'eiffel', 'ocean', 'beach', 'mountain', 'pine_tree', 'plane', 'train', 'ferry', 'ferris_wheel', 'sunrise', 'snow', 'wine', 'theater', 'painting', 'skiing', 'hiking', 'compass'].map(key => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setEditDayEmoji(key)}
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: editDayEmoji === key ? 'var(--terra-muted)' : 'var(--bg)',
                      border: editDayEmoji === key ? '2px solid var(--terra)' : '1px solid var(--border)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 4,
                    }}
                  >
                    <StampIcon iconKey={key} size={32} />
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
                  updateDayMeta(activeDay - 1, { region: editDayName.trim() || `${t('day')} ${activeDay}`, emoji: editDayEmoji });
                  show(t('dayUpdated'));
                  setShowEditDay(false);
                }}
                style={{ flex: 2 }}
              >
                <Icon name="check" size={14} /> {t('saveBtn')}
              </GlassBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* ── Drive-to-airport prompt ─────────────────────────────── */}
      {showDrivePrompt && (
        <Sheet
          onClose={() => setShowDrivePrompt(false)}
          title={t('driveToAirportTitle')}
          subtitle={t('driveToAirportSub')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-2)', marginBottom: 8,
              }}>
                {t('drivingTimeLabel')}
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
                      background: driveMinutes === String(d) ? 'var(--terra)' : 'var(--bg)',
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
                inputMode="numeric"
                placeholder={t('customMinutesPlaceholder')}
                value={driveMinutes}
                onChange={e => setDriveMinutes(e.target.value)}
                className="input-premium"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  fontSize: 15, fontWeight: 600, minHeight: 44,
                  background: 'var(--bg)', color: 'var(--text)',
                  outline: 'none', border: '1px solid var(--border)',
                  boxSizing: 'border-box' as const,
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <GlassBtn onClick={() => setShowDrivePrompt(false)} style={{ flex: 1 }}>
                {t('skipBtn')}
              </GlassBtn>
              <GlassBtn variant="accent" onClick={handleDrivePromptSave} style={{ flex: 2 }}>
                <Icon name="plus" size={14} />
                {t('addDriveBtn')}
              </GlassBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* ── Hotel management sheet ─────────────────────────────── */}
      {showHotelSheet && trip && (
        <Sheet
          onClose={() => setShowHotelSheet(false)}
          title={locale === 'he' ? 'מלון / לינה' : 'Hotel / Accommodation'}
          subtitle={locale === 'he' ? 'הגדר את הלינה לתאריכים אלה' : 'Set accommodation for date range'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PlacesInput
              label={locale === 'he' ? 'מיקום' : 'Location'}
              placeholder={locale === 'he' ? 'חפש מלון, כתובת...' : 'Search hotel, address...'}
              value={hLocation}
              onChange={v => { setHLocation(v); setHLat(null); setHLng(null); }}
              onSelect={place => { setHLocation(place.name); setHLat(place.lat); setHLng(place.lng); }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                  {locale === 'he' ? 'יום צ׳ק-אין' : 'Check-in day'}
                </label>
                <select
                  value={hCheckIn}
                  onChange={e => { const v = Number(e.target.value); setHCheckIn(v); if (hCheckOut <= v) setHCheckOut(v + 1); }}
                  style={{
                    width: '100%', padding: '11px 10px', borderRadius: 'var(--radius-md)',
                    fontSize: 15, fontWeight: 600, minHeight: 44,
                    background: 'var(--bg)', color: 'var(--text)',
                    border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const,
                  }}
                >
                  {Array.from({ length: trip.days }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>
                      {trip.startDate ? fmtDate(trip.startDate, d - 1, locale) : (locale === 'he' ? `יום ${d}` : `Day ${d}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                  {locale === 'he' ? 'יום צ׳ק-אאוט' : 'Checkout day'}
                </label>
                <select
                  value={hCheckOut}
                  onChange={e => setHCheckOut(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '11px 10px', borderRadius: 'var(--radius-md)',
                    fontSize: 15, fontWeight: 600, minHeight: 44,
                    background: 'var(--bg)', color: 'var(--text)',
                    border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const,
                  }}
                >
                  {Array.from({ length: trip.days }, (_, i) => i + 2).filter(d => d > hCheckIn && d <= trip.days + 1).map(d => (
                    <option key={d} value={d}>
                      {trip.startDate ? fmtDate(trip.startDate, d - 1, locale) : (locale === 'he' ? `יום ${d}` : `Day ${d}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
              {(() => {
                const from = trip.startDate ? fmtDate(trip.startDate, hCheckIn - 1, locale) : `Day ${hCheckIn}`;
                const to   = trip.startDate ? fmtDate(trip.startDate, hCheckOut - 2, locale) : `Day ${hCheckOut - 1}`;
                const out  = trip.startDate ? fmtDate(trip.startDate, hCheckOut - 1, locale) : `Day ${hCheckOut}`;
                return locale === 'he'
                  ? `יוצג מ-${from} עד ${to} (לא ב-${out})`
                  : `Shown ${from} – ${to} (not on ${out})`;
              })()}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {editHotelTarget && (
                <GlassBtn onClick={() => { deleteHotel(editHotelTarget); setShowHotelSheet(false); }} style={{ flex: 1, color: 'var(--danger)' }}>
                  <Icon name="trash" size={13} /> {locale === 'he' ? 'מחק' : 'Delete'}
                </GlassBtn>
              )}
              <GlassBtn onClick={() => setShowHotelSheet(false)} style={{ flex: 1 }}>
                {t('cancel')}
              </GlassBtn>
              <GlassBtn variant="accent" onClick={handleSaveHotel} style={{ flex: 2 }}>
                <Icon name="check" size={14} />
                {locale === 'he' ? 'שמור' : 'Save'}
              </GlassBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* ── Budget breakdown sheet ─────────────────────────────── */}
      {showBudget && (
        <Sheet
          onClose={() => setShowBudget(false)}
          title={locale === 'he' ? '💰 פירוט הוצאות' : '💰 Budget Breakdown'}
          subtitle={locale === 'he' ? 'ערוך עלויות לפי אירוע' : 'Edit cost per event'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {evs.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>
                {locale === 'he' ? 'אין אירועים ביום זה' : 'No events on this day'}
              </p>
            ) : (
              <>
                {evs.map(ev => (
                  <div key={ev.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                  }}>
                    <StampIcon
                      iconKey={catStamp(ev.category).key}
                      size={34}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.name}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>{ev.time} · {ev.duration}min</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{currSym}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={budgetEdit[ev.id] ?? ''}
                        onChange={e => setBudgetEdit(prev => ({ ...prev, [ev.id]: e.target.value }))}
                        onBlur={() => {
                          const val = parseFloat(budgetEdit[ev.id] ?? '');
                          editEvent(activeDay, ev.id, { cost: !isNaN(val) && val >= 0 ? val : undefined });
                        }}
                        placeholder="0"
                        style={{
                          width: 72, padding: '6px 8px', borderRadius: 8,
                          fontSize: 14, fontWeight: 700, textAlign: 'right',
                          background: 'var(--surface)', color: 'var(--text)',
                          border: '1px solid var(--border)', outline: 'none',
                          fontFamily: 'var(--font-sans)',
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px',
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(40,160,90,0.2)',
                  borderRadius: 12, marginTop: 4,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>
                    {locale === 'he' ? 'סה״כ יום' : 'Day Total'}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--success)' }}>
                    {currSym}{evs.reduce((sum, ev) => {
                      const v = parseFloat(budgetEdit[ev.id] ?? '');
                      return sum + (!isNaN(v) && v >= 0 ? v : ev.cost ?? 0);
                    }, 0).toLocaleString()}
                  </span>
                </div>
              </>
            )}
            <GlassBtn onClick={() => setShowBudget(false)} style={{ width: '100%', marginTop: 4 }}>
              {locale === 'he' ? 'סגור' : 'Close'}
            </GlassBtn>
          </div>
        </Sheet>
      )}

      {/* ── FABs (mobile) ────────────────────────────────────── */}
      {/* AI suggest FAB — wired to SuggestionsSheet, ready for future AI connection */}
      <motion.button
        data-tour="ai-fab"
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
        data-tour="add-event-fab"
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
          background: 'var(--terra)',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Icon name="plus" size={24} />
      </motion.button>


      {showSuggestions && <AISheet dayNumber={activeDay} />}
    </div>
  );
}
