# TRIPPY V2 — ARCHITECT CREW

> **Owner:** Architecture & Code Quality  
> **Branch:** `v2/arch`  
> **Reads:** `00_GLOBAL.md` first

---

## 1. ARCHITECTURE OVERVIEW

Trippy is a **thick-client SPA** built on Next.js 16 App Router. All rendering and state live in one persistent `AppShell` React tree. Screens switch via Zustand `screen` string — not URL routing. This works at current scale but limits deep-linking, browser history, and SEO.

**Data flow:**
```
Zustand (localStorage persisted) ← single source of truth
  ↕ optimistic updates + rollback
Next.js API Routes ← auth-verified proxies
  ↕
Supabase (DB + Auth + Realtime)
  +
External: Google Places · Weather · Exchange Rates · Anthropic Claude
```

**Key structural problems:**
- `lib/store.ts` is 840+ lines, one flat `AppState` interface of 40+ keys
- `DashboardScreen.tsx` is 1,290 lines — screen, data fetching, share sheet, and CRUD in one file
- `DayScreen.tsx` is 2,207 lines — contains 5 inline sub-components
- No URL routing — no browser back/forward, no deep links
- No React error boundaries anywhere

---

## 2. FEATURE INVENTORY

| Feature | Status | Notes |
|---------|--------|-------|
| Trip creation & management | ✅ | |
| Hour-by-hour timeline | ✅ | |
| Event CRUD + voting | ✅ | |
| AI suggestions (Claude Haiku) | ✅ | |
| Weather forecast | ✅ | |
| Exchange rate conversion | ✅ | |
| Real-time collaboration | ✅ | Full refetch pattern — see §3 |
| Email invitations | ✅ | |
| Invite link (token-based) | ✅ | |
| PDF export | ✅ | |
| Emergency contacts | ✅ | UI not in main nav |
| Supplies/packing list | ✅ | |
| Trip notes | ✅ | **UNREACHABLE from nav** |
| Expense tracking | ✅ | No settlement calc |
| Carbon footprint | ⚠️ | Logic exists in utils.ts, hidden |
| Offline mode | ⚠️ | Only 4 of 11 mutations replay offline |
| PWA install prompt | ❌ | Manifest exists, no install logic |
| Expense settlement ("who owes who") | ❌ | Missing |
| Trip map view | ❌ | lat/lng on events — no map screen |
| Trip picker (multiple trips) | ❌ | No proper multi-trip navigation layer |

---

## 3. TOP 15 CRITICAL ISSUES

| # | Issue | File:Line | Impact |
|---|-------|-----------|--------|
| 1 | Notes screen unreachable — no NavBar tab | `NavBar.tsx:14` (TABS array) | Core feature invisible |
| 2 | `pendingChanges` not persisted — offline edits lost on tab close | `store.ts:818` (partialize) | Silent data loss |
| 3 | Sheet.tsx has no focus trap, role, or aria-modal | `ui/Sheet.tsx:82` | WCAG 2.1 SC 4.1.3 fail |
| 4 | N+1 route-time API calls (one per event pair with coords) | `DayScreen.tsx:159` | Performance + Google quota |
| 5 | Full trip refetch on every Supabase realtime UPDATE | `store.ts:763` | Load flash on every collab edit |
| 6 | `dbGetTripEmailInvitations` missing `created_at` in SELECT | `lib/db.ts:431` | Timestamps always undefined |
| 7 | Weather coordinate logic duplicated 100+ lines | `DashboardScreen.tsx:75`, `DayScreen.tsx:774` | Bugs fixed in one place only |
| 8 | Timeline clips events before 07:00 | `DayTimelineView.tsx:13` | Early-morning events invisible |
| 9 | All icon-only buttons lack `aria-label` | `DayScreen.tsx:508`, throughout | Accessibility |
| 10 | `UpdateTripBody` schema mismatch (string vs string[]) | `schemas.ts:66` vs `db.ts:386` | Silent notes bug |
| 11 | Loading overlay hardcodes `#F4EFE8` — wrong in dark mode | `AppShell.tsx:208,332` | Dark mode regression |
| 12 | `--ink-2`/`--ink-3` CSS tokens undefined | `SuggestionsSheet.tsx:273,317` | Invisible text |
| 13 | `require()` inside `subscribeToTrip` — CommonJS in ESM | `store.ts:765` | Build risk in future Next.js |
| 14 | No React error boundaries — any throw tears down entire app | `AppShell.tsx` | Crashes instead of graceful errors |
| 15 | All 6 screens are in `screens/` but DashboardScreen & DayScreen contain sub-components | `DashboardScreen.tsx`, `DayScreen.tsx` | 1290-line and 2207-line files |

---

## 4. PERFORMANCE-RELEVANT ARCHITECTURE ISSUES

### 4.1 Parallel Weather Fetches

Both `DashboardScreen` and `DayScreen` independently fetch `/api/weather` with overlapping parameters. On initial app open, both screens may render and both fire their own weather effect, resulting in 2 calls in the same 50ms window. There is no shared client-side weather cache.

**Fix:** Extract a `useWeather(coords, startDate, days)` hook backed by `lib/weatherCache.ts`.

### 4.2 Realtime Full-Refetch Pattern

`subscribeToTrip` at `store.ts:763` listens to `postgres_changes` on the `trips` table and calls `loadTripById()` on any `UPDATE`. For a 3-person trip, every collaborator save triggers a full compound DB query + `isGlobalLoading = true` flash for every other user.

**Fix (Phase 2):** Subscribe to a normalized `trip_events` table instead, apply targeted patches. See `06_V2_SPEC.md §5.4`.

### 4.3 `JSON.stringify` in useEffect Deps

`DashboardScreen.tsx:112` uses `JSON.stringify(trip?.dayMeta?.map(...))` as a dependency. For a 30-day trip this serializes 60 numbers on every render.

**Fix:**
```typescript
const coordsKey = useMemo(
  () => (trip?.dayMeta ?? []).map(m => `${m.lat},${m.lng}`).join('|'),
  [trip?.dayMeta]
);
```

### 4.4 `require()` in Store

`store.ts:765` uses CommonJS `require('@/utils/supabase/client')` inside a function body. This bypasses tree-shaking and fires a synchronous module evaluation at runtime.

**Fix:** Move to a top-level import (safe — the store is already `'use client'`).

---

## 5. STATE MANAGEMENT REFACTOR PLAN

### 5.1 Current Problem

One 840-line flat `AppState` means:
- Any `set()` call anywhere re-renders all components subscribed to `useAppStore()`
- `AppShell` subscribes to 20+ fields in one call — every mutation re-renders the entire UI tree
- Testing any slice of state requires mocking the entire store

### 5.2 Target: Domain Slices

```typescript
// lib/store/index.ts
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),        // userId, authUser, termsAccepted, login/logout
      ...createTripListSlice(...a),    // userTrips[], createTrip, deleteTrip
      ...createActiveTripSlice(...a),  // trip, tripDbId, activeDay, loadTripById
      ...createEventsSlice(...a),      // addEvent, editEvent, deleteEvent, voteEvent
      ...createSuppliesSlice(...a),    // supplies[], toggleSupply, addSupplyItem
      ...createExpensesSlice(...a),    // expenses[], addExpense, deleteExpense
      ...createSyncSlice(...a),        // isOffline, pendingChanges, lastSyncError
      ...createUISlice(...a),          // screen, themeMode, highContrast, reducedMotion
    }),
    {
      name: 'trippy-storage',
      partialize: (s) => ({
        // UI + auth only — never trip data (always re-fetched from server)
        themeMode: s.themeMode,
        highContrast: s.highContrast,
        reducedMotion: s.reducedMotion,
        hideBudget: s.hideBudget,
        nickname: s.nickname,
        tripDbId: s.tripDbId,
        activeDay: s.activeDay,
        termsAccepted: s.termsAccepted,
        currencyByTrip: s.currencyByTrip,
        pendingChanges: s.pendingChanges,  // FIX: currently NOT persisted — must be
      }),
    }
  )
);
```

### 5.3 AppShell Selector Fix

```typescript
// Replace the mega-destructure with individual selectors:
const screen          = useAppStore(s => s.screen);
const trip            = useAppStore(s => s.trip);
const isGlobalLoading = useAppStore(s => s.isGlobalLoading);
// etc.

// For grouped reads, use useShallow:
import { useShallow } from 'zustand/react/shallow';
const { isOffline, pendingChanges } = useAppStore(
  useShallow(s => ({ isOffline: s.isOffline, pendingChanges: s.pendingChanges }))
);
```

---

## 6. `withOptimistic` WRAPPER

Standardizes the rollback pattern that is currently manual per-action:

```typescript
// lib/sync/optimistic.ts
export async function withOptimistic<T>(opts: {
  apply:    () => void;
  persist:  () => Promise<T>;
  rollback: () => void;
  onError?: (err: Error) => void;
}): Promise<T | null> {
  opts.apply();
  try {
    return await opts.persist();
  } catch (err) {
    opts.rollback();
    opts.onError?.(err as Error);
    return null;
  }
}
```

---

## 7. REACT ERROR BOUNDARY STRATEGY

```
Level 1 — App-level        → catches auth/init failures → AppCrashScreen
Level 2 — Screen-level     → catches render failures   → ScreenErrorCard + "Reload" button
Level 3 — Widget-level     → catches weather/rates     → RetryCard (already in AsyncError.tsx)
```

`AppShell.tsx` currently has no boundaries. Any unhandled throw — including from Framer Motion, Supabase, or a third-party package — tears down the full app tree.

---

## 8. NEW NAVIGATION LAYER (V2)

V1's flat `Screen` enum (`'login' | 'dashboard' | 'day' | ...`) becomes a 3-layer hierarchy:

```
Layer 0 — Auth Shell         (no trip context)
  /login
  /onboarding

Layer 1 — Trip Picker        (authenticated, no active trip)
  /trips                     ← NEW: lists all user trips + create button
  /trips/new                 ← NEW: 3-step creation wizard

Layer 2 — Trip Shell         (authenticated, trip loaded)
  /trip/:tripId/overview     ← replaces DashboardScreen
  /trip/:tripId/days         ← replaces DayScreen
  /trip/:tripId/supplies
  /trip/:tripId/crew         ← NEW: replaces Settings in primary nav
  /trip/:tripId/settings     ← moved to "More" bottom sheet
```

**Migration path:** Keep Zustand `screen` string as inner-shell router during transition. Introduce `useRouter` calls alongside `setScreen` so both stay in sync until full URL routing is wired up.

---

## 9. COMPONENT SPLIT PLAN

### DashboardScreen.tsx → `OverviewScreen/`

| New File | Content Extracted |
|----------|-------------------|
| `index.tsx` | Layout only, no data fetching inline |
| `HeroCard.tsx` | Trip title, countdown, participant avatars |
| `NextEventCard.tsx` | Next event display + weather inline |
| `WeatherStrip.tsx` | 7-day forecast strip |
| `BudgetBar.tsx` | Budget + carbon chips |
| `InsightsReel.tsx` | Horizontal scroll insights |
| `DaysGrid.tsx` | Day cards grid |
| `ExpensePanel.tsx` | Full expense CRUD (~200 lines) |

### DayScreen.tsx → `DaysScreen/`

| New File | Content Extracted |
|----------|-------------------|
| `index.tsx` | Layout: header + day strip + list/timeline |
| `DayStrip.tsx` | Horizontal day selector |
| `EventCard.tsx` | Single event row with all actions |
| `RouteConnector.tsx` | Travel time connector between events |
| `HotelBanner.tsx` | Hotel + travel-to-first-event |
| `AddEventSheet.tsx` | Add/edit event form |

---

## 10. POST-ACTION HEALTH CHECKS

```typescript
// lib/sync/healthCheck.ts
export async function verifyEventWritten(
  tripId: string, dayNumber: number, eventId: string, retries = 2
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    const row = await dbGetEvent(tripId, dayNumber, eventId);
    if (row) return true;
    await delay(600 * (i + 1));
  }
  return false;
}
```

| Action | Verify After | On Failure |
|--------|-------------|------------|
| `createTrip` | Query `trips` for new `tripDbId` | Block nav, show retry |
| `addEvent` | `verifyEventWritten` after 1s | Toast + re-queue in pendingChanges |
| `deleteEvent` | Confirm row gone after 800ms | Rollback (already exists in v1) |
| `inviteToTrip` | Query `trip_invitations` for email | "Invite may not have sent" toast |
| `leaveTrip` | Confirm participant removed | Force re-query |

---

## 11. IMPLEMENTATION ORDER

```
Week 1:  Fix critical UX bugs (Notes nav tab, dark mode overlay, --ink-* tokens)
Week 2:  Fix JSON.stringify dep, require() in store, schema mismatch
Week 3:  Split store into domain slices + fix AppShell selectors
Week 4:  Extract DashboardScreen sub-components
Week 5:  Extract DayScreen sub-components
Week 6:  Add React error boundaries (all 3 levels)
Week 7:  Add withOptimistic wrapper across all mutations
Week 8:  Add post-action health checks
Week 9:  Add TripPickerScreen + TripCreationWizard
Week 10: Wire URL routing alongside screen enum
```
