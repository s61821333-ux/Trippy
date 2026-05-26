# TRIPPY V2 — WORLD CLOCK & TRAVEL TIME CREW

> **Owner:** Timezone Intelligence & Route Calculation  
> **Branch:** `v2/features` (sub-branch `v2/features/world-clock`)  
> **Reads:** `00_GLOBAL.md` first

---

## 1. WORLD CLOCK WIDGET

### 1.1 What It Shows

A 2-line compact widget in the Dashboard hero card:

```
┌─────────────────────────────────────────────┐
│  🕐 Rome, Italy           14:32 (now here)  │
│  🏠 Your time             09:32 (+5h ahead) │
└─────────────────────────────────────────────┘
```

Updates every second. No API needed — the browser's `Intl` API handles timezone conversions.

### 1.2 Component

```typescript
// app/components/ui/WorldClock.tsx
'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';

interface WorldClockProps {
  destinationTimezone: string;  // IANA: "Europe/Rome"
  destinationCity: string;      // "Rome"
}

export function WorldClock({ destinationTimezone, destinationCity }: WorldClockProps) {
  const [now, setNow] = useState(() => new Date());
  const { t, locale } = useLocale();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (tz: string) =>
    new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
      hour12: false,
    }).format(now);

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const destTime  = fmt(destinationTimezone);
  const localTime = fmt(localTz);

  const offsetH = getTimezoneOffsetHours(destinationTimezone, localTz, now);
  const offsetLabel =
    offsetH === 0
      ? t('worldClock.sameZone')
      : offsetH > 0
        ? t('worldClock.ahead', { h: offsetH })
        : t('worldClock.behind', { h: Math.abs(offsetH) });

  return (
    <div className="world-clock">
      <div className="world-clock__row">
        <span className="world-clock__icon">🕐</span>
        <span className="world-clock__city">{destinationCity}</span>
        <span className="world-clock__time">{destTime}</span>
      </div>
      <div className="world-clock__row world-clock__row--local">
        <span className="world-clock__icon">🏠</span>
        <span className="world-clock__city">{t('worldClock.yourTime')}</span>
        <span className="world-clock__time">
          {localTime}
          <span className="world-clock__offset"> ({offsetLabel})</span>
        </span>
      </div>
    </div>
  );
}

function getTimezoneOffsetHours(tz1: string, tz2: string, date: Date): number {
  const getOffset = (tz: string) => {
    const str = new Intl.DateTimeFormat('en', {
      timeZone: tz, timeZoneName: 'shortOffset',
    }).formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? 'UTC+0';
    const match = str.match(/([+-])(\d+)(?::(\d+))?/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    return sign * (parseInt(match[2]) + (parseInt(match[3] ?? '0') / 60));
  };
  return Math.round(getOffset(tz1) - getOffset(tz2));
}
```

### 1.3 Timezone Detection for Events

Each event should store the IANA timezone of its location. This is determined at event-creation time via the Google Time Zone API:

```typescript
// app/api/timezone/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coords' }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const url = `https://maps.googleapis.com/maps/api/timezone/json?` +
    `location=${lat},${lng}&timestamp=${timestamp}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });  // cache 24h — timezones don't change
  const data = await res.json();

  return NextResponse.json({ timeZoneId: data.timeZoneId });
}
```

**Cost:** Google Time Zone API is $5 per 1,000 requests. Cache aggressively — same lat/lng never re-fetched within 24h.

**Fallback:** If no lat/lng on the event, derive timezone from the trip's destination country using a bundled country→timezone map.

### 1.4 Where to Show the World Clock

- **Dashboard hero card:** Shows destination timezone vs. home timezone, updating live
- **Event detail:** Shows the event's local time in both destination and home timezone
- **Day header:** Subtle `Rome 14:32` timestamp

---

## 2. TRAVEL TIME CALCULATION — REDESIGN

### 2.1 Current Problems

1. **N+1 API calls:** One Google Distance Matrix call per consecutive event pair
2. **No departure time:** Ignores rush hour — "15 min" might be "45 min at 8am"
3. **No mode recommendation:** Always shows all 3 modes, user must decide
4. **Distance not shown:** Users want to know how far, not just how long
5. **No caching:** Same route re-fetched on every day view mount

### 2.2 Batched Route API (Fix for N+1)

See `03_PERFORMANCE.md §ME-1` for the full batched API implementation.

Summary: instead of calling the route API once per pair, send all pairs in a single `POST /api/route-time` request with up to 25 pairs.

### 2.3 Smart Mode Recommendation

After fetching distances, apply a recommendation engine:

```typescript
// lib/travelMode.ts
export type TravelMode = 'walking' | 'transit' | 'driving';

export interface RouteResult {
  walking?:  { duration: number; distance: number };  // minutes, meters
  transit?:  { duration: number; distance: number };
  driving?:  { duration: number; distance: number };
  recommended: TravelMode;
  reason: string;
}

export function recommendMode(
  walking: { duration: number } | null,
  transit: { duration: number } | null,
  driving: { duration: number } | null,
  distanceMeters: number,
  gapMinutes: number,
): { mode: TravelMode; reason: string } {

  // Under 600m: always walk
  if (distanceMeters < 600 && walking) {
    return { mode: 'walking', reason: 'short_walk' };
  }

  // Comfortable walk (under 20 min) with no time pressure: suggest walking
  if (walking && walking.duration <= 20 && gapMinutes >= walking.duration + 15) {
    return { mode: 'walking', reason: 'pleasant_walk' };
  }

  // Time-crunched: pick fastest
  if (gapMinutes < 30) {
    const fastest = [
      { mode: 'walking'  as TravelMode, t: walking?.duration ?? Infinity },
      { mode: 'transit'  as TravelMode, t: transit?.duration ?? Infinity },
      { mode: 'driving'  as TravelMode, t: driving?.duration ?? Infinity },
    ].sort((a, b) => a.t - b.t)[0];
    return { mode: fastest.mode, reason: 'time_critical' };
  }

  // Default: prefer transit over driving in cities
  if (transit && transit.duration <= (driving?.duration ?? Infinity) * 1.3) {
    return { mode: 'transit', reason: 'eco_convenient' };
  }

  return { mode: 'driving', reason: 'fastest' };
}
```

### 2.4 Rush-Hour Awareness

The Google Distance Matrix API accepts `departure_time` for driving estimates. Use the event's scheduled time:

```typescript
// In the batch route-time API:
const eventTime = new Date(`${tripStartDate}T${event.time}`);
const departureTime = Math.floor(eventTime.getTime() / 1000);

// Include in the API call:
`&departure_time=${departureTime}&traffic_model=best_guess`
```

**Result:** If an event is at 08:30 in Rome, the travel time will account for morning rush hour, not the free-flow average.

### 2.5 Route Connector UI

The `RouteConnector` component between events shows:

```
  ────────  🚶 12 min · 900m  ────────
```

For recommended mode, with a small icon. Tap to expand:

```
┌─────────────────────────────────────┐
│  Rome Colosseum → Vatican Museums   │
│                                     │
│  🚶 Walk     28 min  · 2.1 km       │
│  🚇 Transit  18 min  · ← Recommended│  ← green chip
│  🚗 Drive    22 min  (rush hour est) │
│                                     │
│  Departure at 11:30                 │
└─────────────────────────────────────┘
```

```typescript
// app/components/screens/DaysScreen/RouteConnector.tsx
interface RouteConnectorProps {
  fromEvent: TripEvent;
  toEvent: TripEvent;
  route: RouteResult;
  gapMinutes: number;
}

export function RouteConnector({ fromEvent, toEvent, route, gapMinutes }: RouteConnectorProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLocale();
  const rec = route.recommended;

  const modeIcon = { walking: '🚶', transit: '🚇', driving: '🚗' };
  const recResult = route[rec];

  return (
    <button
      className="route-connector"
      onClick={() => setExpanded(e => !e)}
      aria-label={t('routeConnector.expand')}
    >
      <div className="route-connector__line" />
      <div className="route-connector__badge">
        {modeIcon[rec]} {recResult ? formatDuration(recResult.duration) : '—'}
        {recResult?.distance && ` · ${formatDistance(recResult.distance)}`}
      </div>
      <div className="route-connector__line" />

      {expanded && (
        <RouteExpandedSheet
          route={route}
          fromName={fromEvent.name}
          toName={toEvent.name}
          onClose={() => setExpanded(false)}
        />
      )}
    </button>
  );
}
```

### 2.6 Client-Side Route Cache

```typescript
// lib/routeCache.ts
interface CacheEntry {
  result: RouteResult;
  ts: number;
  departureTime?: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 5 * 60 * 1000;  // 5 minutes

function key(origin: string, dest: string, departureTime?: number): string {
  // Round departure time to nearest 30min to improve cache hit rate
  const roundedDep = departureTime
    ? Math.round(departureTime / 1800) * 1800
    : 0;
  return `${origin}→${dest}:${roundedDep}`;
}

export function getCachedRoute(
  origin: string, dest: string, departureTime?: number
): RouteResult | null {
  const hit = cache.get(key(origin, dest, departureTime));
  if (hit && Date.now() - hit.ts < TTL) return hit.result;
  return null;
}

export function setCachedRoute(
  origin: string, dest: string, result: RouteResult, departureTime?: number
): void {
  cache.set(key(origin, dest, departureTime), { result, ts: Date.now(), departureTime });
}
```

**Cache key design:** Departure times are rounded to the nearest 30 minutes. An event at 09:05 and an event at 09:20 use the same cache entry (both round to 09:00 slot), avoiding redundant API calls for events close in time.

---

## 3. TIMEZONE BADGES ON EVENTS

For multi-timezone trips (e.g., London → Tokyo), show a timezone badge on the first event in a new timezone:

```
  Day 4 — Tokyo, Japan
  ─────────────────────────────────────
  📍 Timezone change: now JST (UTC+9)
  ─────────────────────────────────────
  
  09:00  Shibuya Crossing Tour    🏙️
```

```typescript
// In DaysScreen — detect timezone boundary between events
function detectTimezoneBoundary(prevEvent: TripEvent | null, currEvent: TripEvent): boolean {
  if (!prevEvent?.timezone || !currEvent.timezone) return false;
  return prevEvent.timezone !== currEvent.timezone;
}
```

---

## 4. GAP CALCULATION

The `gapMinutes` between two consecutive events is used by the mode recommender and the UI to show urgency:

```typescript
// lib/eventGap.ts
export function getGapMinutes(current: TripEvent, next: TripEvent): number {
  const endTime = addMinutes(parseEventTime(current.time), current.duration ?? 60);
  const nextStart = parseEventTime(next.time);
  return differenceInMinutes(nextStart, endTime);
}

function parseEventTime(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
```

**Visual urgency:**

| Gap | RouteConnector color | Label |
|-----|---------------------|-------|
| < 0 min (overlap) | Red | ⚠️ Overlap! |
| 0–10 min | Orange | Tight connection |
| 10–30 min | Amber | Allow travel time |
| 30+ min | Default | Comfortable |

```typescript
export function getGapUrgency(gapMinutes: number, travelMinutes: number): 'overlap' | 'tight' | 'warning' | 'ok' {
  const buffer = gapMinutes - travelMinutes;
  if (buffer < 0) return 'overlap';
  if (buffer < 10) return 'tight';
  if (buffer < 20) return 'warning';
  return 'ok';
}
```

---

## 5. TIMELINE CLIP FIX

**Current bug:** `DayTimelineView.tsx:13` clips events before 07:00 — early morning events are invisible.

**Fix:**
```typescript
// DayTimelineView.tsx
// ❌ Old — hardcoded start at 07:00
const START_HOUR = 7;

// ✅ Fix — use earliest event time, minimum 06:00
const START_HOUR = Math.min(
  6,
  ...events.map(e => parseInt(e.time.split(':')[0]))
);
```

This makes the timeline always show all events, while defaulting to 06:00 start if there are no early events.

---

## 6. IMPLEMENTATION CHECKLIST

```
Week 1:
  [ ] WorldClock component (§1.2)
  [ ] Add to Dashboard hero card
  [ ] Timezone detection API route (§1.3)

Week 2:
  [ ] Batched route-time API (03_PERFORMANCE.md §ME-1)
  [ ] Client-side route cache (§2.6)
  [ ] Smart mode recommendation logic (§2.3)

Week 3:
  [ ] Rush-hour departure_time param (§2.4)
  [ ] RouteConnector expanded sheet UI (§2.5)
  [ ] Gap urgency coloring (§4)

Week 4:
  [ ] Timezone boundary badges (§3)
  [ ] Timeline clip fix (§5)
  [ ] i18n keys for all new strings (07_HEBREW.md §8)
```

---

## 7. APIs SUMMARY

| Feature | API | Cost | Notes |
|---------|-----|------|-------|
| World Clock display | `Intl.DateTimeFormat` | Free | Browser built-in |
| Timezone lookup | Google Time Zone API | $5/1,000 req | Cache 24h — timezones stable |
| Route time (batched) | Google Distance Matrix | $5/1,000 ele | Max 25 pairs/request |
| Rush-hour traffic | Distance Matrix + `departure_time` | Same as above | Requires `traffic_model` param |
| Smart mode recommendation | None (internal logic) | Free | `lib/travelMode.ts` |
