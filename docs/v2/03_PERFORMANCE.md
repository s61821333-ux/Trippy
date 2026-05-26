# TRIPPY V2 — PERFORMANCE CREW

> **Owner:** Performance & Loading  
> **Branch:** `v2/perf`  
> **Reads:** `00_GLOBAL.md` first

---

## 1. CURRENT BASELINE (Measured)

| Metric | Current | Target v2 | Technique |
|--------|---------|-----------|-----------|
| FCP (First Contentful Paint) | ~2.8s | ≤1.0s | next/font, lazy screens |
| TTI (Time to Interactive) | ~4.2s | ≤2.0s | Code split, defer Framer |
| Bundle size (main JS) | ~820KB gz | ≤320KB gz | LazyMotion, tree-shake |
| LCP (Largest Contentful Paint) | ~3.4s | ≤1.5s | Font preload, skeleton |
| Google Maps quota calls/day | ~300 (N+1) | ~40 (batched) | Batch route-time |
| Framer Motion bundle | ~180KB gz | ~45KB gz | LazyMotion migration |

---

## 2. QUICK WINS (< 2 hours each)

### QW-1: Migrate Fonts to `next/font`

**Current:** 4 `<link>` tags in `app/layout.tsx` → render-blocking, +200–400ms FCP  
**Fix:** Replace with `next/font/google` and `next/font/local` (Huninn is custom).

```typescript
// app/layout.tsx
import { Bricolage_Grotesque, Newsreader } from 'next/font/google';
import localFont from 'next/font/local';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
});

const huninn = localFont({
  src: '../public/fonts/Huninn-Regular.ttf',
  variable: '--font-hebrew',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html className={`${bricolage.variable} ${newsreader.variable} ${huninn.variable}`}>
      {children}
    </html>
  );
}
```

**Savings:** -200–400ms FCP. Fonts are inlined into the CSS, no blocking network request.

---

### QW-2: Fix `JSON.stringify` in `useEffect` Deps

**File:** `DashboardScreen.tsx:112`  
**Current:** Serializes all day coordinates on every render.

```typescript
// ❌ Current
useEffect(() => { ... }, [JSON.stringify(trip?.dayMeta?.map(m => [m.lat, m.lng]))]);

// ✅ Fix
const coordsKey = useMemo(
  () => (trip?.dayMeta ?? []).map(m => `${m.lat},${m.lng}`).join('|'),
  [trip?.dayMeta]
);
useEffect(() => { ... }, [coordsKey]);
```

**Savings:** Eliminates unnecessary weather re-fetches on renders that didn't change coordinates.

---

### QW-3: Move `require()` to Top-Level Import

**File:** `lib/store.ts:765` (and `lib/stores/tripStore.ts:189, 301`)

```typescript
// ❌ Current — CommonJS inside function body
const userId = (require('../store') as typeof import('../store')).useAppStore.getState().userId;

// ✅ Fix — top-level ESM import (safe: store.ts is 'use client')
import { useAppStore } from '../store';
// then inside function:
const userId = useAppStore.getState().userId;
```

**Savings:** Eliminates synchronous module evaluation at call time. Enables tree-shaking.

---

### QW-4: Migrate Framer Motion to `LazyMotion`

**Current:** Full Framer Motion bundle (~180KB gzip) imported everywhere  
**Target:** LazyMotion with domAnimation features (~45KB gzip)

```typescript
// app/layout.tsx — wrap once at root
import { LazyMotion, domAnimation } from 'framer-motion';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </body>
    </html>
  );
}
```

```typescript
// In every component — replace motion.div with m.div
import { m } from 'framer-motion';  // NOT motion

// ❌ Before
<motion.div animate={{ opacity: 1 }}>

// ✅ After  
<m.div animate={{ opacity: 1 }}>
```

**Savings:** ~135KB gzip off main bundle. **Biggest single win.**

---

### QW-5: Add `React.memo` to Static List Items

**Files:** `DayScreen.tsx` event list items, `SuppliesScreen.tsx` supply items

```typescript
// EventCard is re-rendered on every keystroke if parent re-renders
const EventCard = React.memo(function EventCard({ event, onEdit, onDelete }) {
  // ...
}, (prev, next) => prev.event.id === next.event.id && prev.event === next.event);
```

**Savings:** Eliminates cascade re-renders in long event lists.

---

### QW-6: Lazy-Load Non-Critical Screens

```typescript
// app/components/AppShell.tsx
import dynamic from 'next/dynamic';

const DayScreen       = dynamic(() => import('./screens/DayScreen'));
const SuppliesScreen  = dynamic(() => import('./screens/SuppliesScreen'));
const SettingsScreen  = dynamic(() => import('./screens/SettingsScreen'));
const NotesScreen     = dynamic(() => import('./screens/NotesScreen'));

// DashboardScreen loads immediately (first screen shown)
import DashboardScreen from './screens/DashboardScreen';
```

**Savings:** ~40KB off initial parse. Non-critical screens only load on first navigation to them.

---

## 3. MEDIUM EFFORT (1–3 days each)

### ME-1: Batch Route-Time API Calls

**Current:** `DayScreen.tsx:159` calls `/api/route-time` once per consecutive event pair → N-1 calls for N events.

For a 10-event day, that's 9 Google Distance Matrix API calls on each render.

**Fix:** Send all pairs in a single batched call:

```typescript
// app/api/route-time/route.ts — accept arrays
const body = z.object({
  pairs: z.array(z.object({
    origin: z.string(),
    destination: z.string(),
    mode: z.enum(['driving', 'walking', 'transit']),
    departureTime: z.number().optional(),
  })).max(25),  // Distance Matrix max
});

// Build single request with all origins and destinations
const origins      = pairs.map(p => p.origin);
const destinations = pairs.map(p => p.destination);

const response = await fetch(
  `https://maps.googleapis.com/maps/api/distancematrix/json?` +
  `origins=${origins.join('|')}&destinations=${destinations.join('|')}&key=${API_KEY}`
);
```

**Client usage:**
```typescript
// Instead of one useEffect per event pair:
const routeTimes = await fetch('/api/route-time', {
  method: 'POST',
  body: JSON.stringify({ pairs: allEventPairs }),
});
```

**Savings:** 9 API calls → 1 call per day view. Google quota: -89%.

---

### ME-2: Client-Side Route Cache (`lib/routeCache.ts`)

Even after batching, the same event pair route is re-fetched every time the day screen mounts.

```typescript
// lib/routeCache.ts
const cache = new Map<string, { result: RouteResult; ts: number }>();
const TTL = 5 * 60 * 1000;  // 5 minutes

export function getCachedRoute(origin: string, dest: string, mode: string) {
  const key = `${origin}→${dest}:${mode}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.result;
  return null;
}

export function setCachedRoute(origin: string, dest: string, mode: string, result: RouteResult) {
  cache.set(`${origin}→${dest}:${mode}`, { result, ts: Date.now() });
}
```

**Savings:** Route times serve from memory on repeated tab switches. Zero network calls for unchanged routes.

---

### ME-3: Shared Weather Cache (`lib/weatherCache.ts`)

**Problem:** `DashboardScreen` and `DayScreen` both call `/api/weather` independently. On initial load, both fire within the same 50ms window → 2 identical API calls.

```typescript
// lib/weatherCache.ts
interface WeatherCacheEntry {
  data: WeatherData;
  ts: number;
  lat: number;
  lng: number;
}

const cache: WeatherCacheEntry[] = [];
const TTL = 30 * 60 * 1000;  // 30 minutes

export async function getWeather(lat: number, lng: number, days: number): Promise<WeatherData> {
  const existing = cache.find(
    e => Math.abs(e.lat - lat) < 0.01 && Math.abs(e.lng - lng) < 0.01 &&
         Date.now() - e.ts < TTL
  );
  if (existing) return existing.data;

  const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}&days=${days}`);
  const data = await res.json();
  cache.push({ data, ts: Date.now(), lat, lng });
  return data;
}
```

**Usage:** Both `DashboardScreen` and `DayScreen` call `getWeather()` instead of `fetch('/api/weather')` directly.

**Savings:** Weather API calls: 2 → 1 on initial load. Subsequent renders: 0 network calls.

---

### ME-4: Targeted Realtime Updates (No Full Refetch)

**Current:** `subscribeToTrip` at `store.ts:763` calls `loadTripById()` on any Supabase UPDATE — triggers a full compound DB query plus `isGlobalLoading = true` flash visible to every collaborator.

**Fix (Phase 2):** Subscribe to individual tables and apply targeted patches:

```typescript
// Instead of:
channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips' }, () => {
  loadTripById(tripId);  // ❌ full refetch
});

// Do:
channel
  .on('postgres_changes', { event: 'INSERT', table: 'trip_events', filter: `trip_id=eq.${tripId}` },
    (payload) => {
      // Apply just the new event
      set(s => ({
        trip: {
          ...s.trip!,
          events: {
            ...s.trip!.events,
            [payload.new.day_number]: [...(s.trip!.events[payload.new.day_number] ?? []), payload.new],
          },
        },
      }));
    }
  )
  .on('postgres_changes', { event: 'UPDATE', table: 'trip_events', filter: `trip_id=eq.${tripId}` },
    (payload) => {
      // Patch just the updated event
      set(s => ({
        trip: {
          ...s.trip!,
          events: {
            ...s.trip!.events,
            [payload.new.day_number]: (s.trip!.events[payload.new.day_number] ?? []).map(
              e => e.id === payload.new.id ? { ...e, ...payload.new } : e
            ),
          },
        },
      }));
    }
  );
```

**Savings:** Eliminates loading flash on every collaborator edit. 10× improvement in perceived collaboration smoothness.

**Prerequisite:** Requires `trip_events` normalized table (see `06_V2_SPEC.md §5.4`).

---

### ME-5: `AppShell` Selector Granularity

**Current:** `AppShell` subscribes to many fields in a single destructure, causing full re-render on any state change.

**Fix:** Use individual selectors or `useShallow`:

```typescript
// ❌ Before — any state change re-renders AppShell
const { screen, trip, isGlobalLoading, themeMode, isOffline, ... } = useAppStore();

// ✅ After — only re-renders when these specific values change
const screen          = useAppStore(s => s.screen);
const isGlobalLoading = useAppStore(s => s.isGlobalLoading);
const themeMode       = useAppStore(s => s.themeMode);

// For grouped reads:
import { useShallow } from 'zustand/react/shallow';
const { isOffline, pendingChanges } = useAppStore(
  useShallow(s => ({ isOffline: s.isOffline, pendingChanges: s.pendingChanges }))
);
```

---

### ME-6: Server Components for Static Content

Currently `app/page.tsx` renders one `'use client'` island for the entire app. Extract at minimum the `<head>` metadata and `<body>` wrapper as Server Components.

```typescript
// app/page.tsx — Server Component (no 'use client')
import { Suspense } from 'react';
import AppShell from './components/AppShell';
import CompassLoader from './components/ui/CompassLoader';

export default function Page() {
  return (
    <Suspense fallback={<CompassLoader />}>
      <AppShell />
    </Suspense>
  );
}
```

This lets Next.js stream the initial HTML before the JS bundle downloads.

---

## 4. ARCHITECTURAL PERFORMANCE ISSUES

### A-1: No `pendingChanges` Persistence

**File:** `lib/store.ts` — `partialize` function  
**Impact:** All offline mutations are lost when user closes the tab.

```typescript
// lib/store.ts partialize — ADD pendingChanges:
partialize: (s) => ({
  themeMode: s.themeMode,
  highContrast: s.highContrast,
  reducedMotion: s.reducedMotion,
  tripDbId: s.tripDbId,
  activeDay: s.activeDay,
  termsAccepted: s.termsAccepted,
  currencyByTrip: s.currencyByTrip,
  pendingChanges: s.pendingChanges,  // ← ADD THIS
}),
```

---

### A-2: DayScreen `useEffect` Cascade

`DayScreen.tsx` has 12 `useEffect` hooks. Several share dependencies and could be merged. Each independent effect runs sequentially on mount, staggering data availability.

**Audit:** Run React DevTools Profiler on DayScreen mount and identify effect execution order.

---

### A-3: `jsPDF` Loaded in Main Bundle

`jsPDF` is ~400KB and only used for PDF export. It's currently imported at the top of a component file, included in the main bundle.

```typescript
// ❌ Before
import jsPDF from 'jspdf';

// ✅ After — only loads when PDF is requested
const { default: jsPDF } = await import('jspdf');
```

---

## 5. IMPLEMENTATION ORDER

```
Week 1:  QW-1 (fonts) + QW-3 (require) + QW-4 (LazyMotion) — biggest bang for effort
Week 2:  QW-2 (JSON.stringify) + QW-5 (React.memo) + QW-6 (lazy screens)
Week 3:  ME-1 (batch route-time) + ME-2 (route cache)
Week 4:  ME-3 (weather cache) + ME-5 (AppShell selectors)
Week 5:  A-1 (pendingChanges persistence) + A-3 (jsPDF dynamic import)
Week 6+: ME-4 (targeted realtime) — depends on DB schema changes
```

---

## 6. MEASURING SUCCESS

After each Quick Win, measure with Lighthouse CI:

```bash
# Run Lighthouse CI against local build
npm run build && npx lighthouse-ci autorun

# Or measure bundle with Next.js bundle analyzer
ANALYZE=true npm run build
```

**Target gates (block merge if failed):**
- FCP ≤ 1.5s (mobile 4G simulation)
- Bundle JS ≤ 350KB gzip
- No new Lighthouse performance regressions > 5 points
