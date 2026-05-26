# TRIPPY V2 — V2 SPEC CREW

> **Owner:** V2 Full Redesign Specification  
> **Branch:** `v2` (integration branch)  
> **Reads:** `00_GLOBAL.md` first, then all other crew docs

---

## 1. V2 NORTH STAR

Trippy v2 must feel like a **native iOS 26 app running on the web** — not a mobile-responsive website. Key pillars:

1. **Instant feel:** Every interaction responds in < 100ms
2. **Glass everything:** Surfaces breathe with the content behind them
3. **Swipe everywhere:** Day nav, screen nav, event management — all swipeable
4. **No dead ends:** Notes, map, crew — all reachable in ≤ 2 taps
5. **Offline-first:** The app works fully offline; syncs silently on reconnect

---

## 2. SCREEN HIERARCHY

```
Auth Shell (unauthenticated)
├── /login              ← Google OAuth + email magic link
└── /onboarding         ← First-time setup (nickname, language, theme)

Trip Picker (authenticated, no active trip)
├── /trips              ← All trips list + create button
└── /trips/new          ← 3-step creation wizard

Trip Shell (authenticated, trip loaded)
├── /trip/:id/overview  ← Dashboard (redesigned)
├── /trip/:id/days      ← Day planner (redesigned)
├── /trip/:id/map       ← NEW: Full-screen map
├── /trip/:id/supplies  ← Existing (polished)
├── /trip/:id/crew      ← NEW: Members, voting, roles
└── /trip/:id/settings  ← Moved to secondary nav
    ├── Notes           ← FIXED: Was unreachable
    ├── Expenses        ← Moved here from dashboard
    └── Export / Leave
```

**V1 → V2 screen mapping:**

| V1 screen string | V2 route | Notes |
|-----------------|----------|-------|
| `'login'` | `/login` | Unchanged |
| `'dashboard'` | `/trip/:id/overview` | Renamed |
| `'day'` | `/trip/:id/days` | Renamed |
| `'supplies'` | `/trip/:id/supplies` | Unchanged |
| `'settings'` | `/trip/:id/settings` | Now secondary |
| *(missing)* | `/trip/:id/notes` | **Fixed** |
| *(missing)* | `/trip/:id/map` | **New** |
| *(missing)* | `/trips` | **New** |

---

## 3. WIREFRAMES

### 3.1 Trip Picker Screen (`/trips`)

```
┌────────────────────────────────────────────────┐
│  ← Back         Your Trips              + New  │
├────────────────────────────────────────────────┤
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │  🇮🇹 Italy & France         T-14 days  │  │
│  │  Jun 12 – Jun 20 · 3 crew members       │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │  🇯🇵 Japan 2025             Completed  │  │
│  │  Mar 3 – Mar 10 · 2 crew members        │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│  │  +  Plan a new trip                    │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
│                                                │
└────────────────────────────────────────────────┘
```

### 3.2 Trip Creation Wizard (`/trips/new`)

```
Step 1/3 — Where & When
┌────────────────────────────────────────────────┐
│  ✕              New Trip                       │
│                                                │
│  Trip name                                     │
│  ┌─────────────────────────────────────────┐  │
│  │  Italy & France Summer 2026             │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  Countries (search to add)                     │
│  ┌─────────────────────────────────────────┐  │
│  │  🇮🇹 Italy  🇫🇷 France  + Add          │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  Start date         Duration                   │
│  ┌──────────┐       ┌──────────────────────┐  │
│  │ Jun 12   │       │  8 days          ─ + │  │
│  └──────────┘       └──────────────────────┘  │
│                                                │
│              ───────────────────               │
│              Continue →                        │
└────────────────────────────────────────────────┘

Step 2/3 — Crew & Vibe
┌────────────────────────────────────────────────┐
│  ← Back        New Trip  2/3                   │
│                                                │
│  Your nickname                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  Guy                                    │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  Travel vibe                                   │
│  ○ Explorer   ○ Relaxed   ○ Foodie             │
│  ○ Budget     ● Balanced                       │
│                                                │
│  Base currency                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  € EUR                               ▼  │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│              ───────────────────               │
│              Continue →                        │
└────────────────────────────────────────────────┘

Step 3/3 — Theme
┌────────────────────────────────────────────────┐
│  ← Back        New Trip  3/3                   │
│                                                │
│  Choose your trip vibe                         │
│                                                │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │  🌊  │  │  🏔️  │  │  🌆  │  │  🌿  │      │
│  │Beach │  │Moun- │  │ City │  │ Wild │      │
│  └──────┘  │tain  │  └──────┘  └──────┘      │
│            └──────┘                            │
│                                                │
│              ───────────────────               │
│              ✓ Create Trip                     │
└────────────────────────────────────────────────┘
```

### 3.3 Overview Screen (`/trip/:id/overview`)

```
┌────────────────────────────────────────────────┐
│  ⚙️           Trippy.           🌙             │  ← top bar (glass)
├────────────────────────────────────────────────┤
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │  🇮🇹 Italy & France                    │  │
│  │  Jun 12 → Jun 20  ·  T-14 days          │  │
│  │                                         │  │
│  │  [○] Guy  [○] Sarah  [○] +1             │  │
│  │                                         │  │
│  │  Next: Colosseum Tour · 09:00 tomorrow  │  │
│  │  🌤 22° · Time there: 14:30             │  │  ← World Clock
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌── Weather ──────────────────────────────┐  │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun      │  │
│  │  🌤  🌥   🌦   ☀️  ☀️  🌤  🌦         │  │
│  │  22° 19°  17°  26° 28° 24° 20°         │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌── Budget ───────────────────────────────┐  │
│  │  €340 / €800  ████░░░░░  42%            │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌── Days ─────────────────────────────────┐  │
│  │  [Day 1]  [Day 2]  [Day 3]  ...         │  │
│  │  Rome     Rome     Paris                │  │
│  │  4 events 3 events 5 events             │  │
│  └─────────────────────────────────────────┘  │
│                                                │
├────────────────────────────────────────────────┤
│  🧭  📅  🗺️  🧳  👥     ← floating tab bar   │
└────────────────────────────────────────────────┘
```

### 3.4 Day Screen (`/trip/:id/days`)

```
┌────────────────────────────────────────────────┐
│  ← Overview    Day 2 — Rome         📅 Share  │
├────────────────────────────────────────────────┤
│  Day 1   [Day 2]  Day 3   Day 4  →            │  ← Day strip
│  Rome     Rome    Paris   Paris               │
├────────────────────────────────────────────────┤
│                                                │
│  🏨 Hotel Artemide                             │
│     Via Nazionale 22  ·  Check-in today       │
│     ─────  🚶 8 min to next event ──────      │
│                                                │
│  09:00  Colosseum Tour              2h 30m    │
│  Via Sacra, Rome                 🏛️ Culture  │
│          👍 2  👎 0                           │
│  ────────  🚶 12 min  ──────────────────      │
│                                                │
│  12:00  Lunch at Trastevere         1h 00m    │
│  Piazza di Santa Maria           🍽️ Food    │
│          👍 3  👎 1                           │
│  ────────  🚕 15 min  ──────────────────      │
│                                                │
│  14:30  Vatican Museums             3h 00m    │
│  Viale Vaticano                  🏛️ Culture  │
│                                                │
│                      ┌───┐                    │
│                      │ + │   ← FAB            │
│                      └───┘                    │
├────────────────────────────────────────────────┤
│  🧭  📅  🗺️  🧳  👥                           │
└────────────────────────────────────────────────┘
```

### 3.5 Crew Screen (`/trip/:id/crew`)

```
┌────────────────────────────────────────────────┐
│  ← Overview    Crew                  + Invite │
├────────────────────────────────────────────────┤
│                                                │
│  Members                                       │
│  ┌─────────────────────────────────────────┐  │
│  │  [G]  Guy Dagan         Owner           │  │
│  │  [S]  Sarah K.          Member          │  │
│  │  [M]  Mike T.           Member          │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  Invite                                        │
│  ┌─────────────────────────────────────────┐  │
│  │  📧 Email invite                    →   │  │
│  │  🔗 Copy invite link                →   │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  Pending Invitations                           │
│  ┌─────────────────────────────────────────┐  │
│  │  alex@example.com        Sent 2h ago    │  │
│  └─────────────────────────────────────────┘  │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 4. NEW NAVIGATION TAB STRUCTURE

**V1 Tabs:** Overview · Day · Supplies · Settings  
**V2 Tabs:** Overview · Days · Map · Supplies · Crew

```typescript
// app/components/NavBar.tsx — updated TABS
const TABS = [
  { id: 'dashboard', icon: CompassIcon,  label: 'Overview' },
  { id: 'day',       icon: CalendarIcon, label: 'Days' },
  { id: 'map',       icon: MapIcon,      label: 'Map' },       // NEW
  { id: 'supplies',  icon: BackpackIcon, label: 'Supplies' },
  { id: 'crew',      icon: UsersIcon,    label: 'Crew' },      // NEW (was Settings)
] as const;
```

**Notes** moves to `Settings → More`. Expenses panel moves to `Settings → Expenses`.

---

## 5. DATABASE SCHEMA CHANGES

### 5.1 Add `trip_events` Normalized Table

Currently, all events are stored as a JSON blob inside the `trips` table. This prevents targeted Realtime subscriptions.

```sql
CREATE TABLE trip_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  name text NOT NULL,
  category text,
  time text,
  duration integer,  -- minutes
  location text,
  lat double precision,
  lng double precision,
  added_by text,
  votes jsonb DEFAULT '{}',
  timezone text,     -- NEW: IANA timezone for the event location
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_events_trip_id ON trip_events(trip_id);
CREATE INDEX idx_trip_events_day ON trip_events(trip_id, day_number);

ALTER TABLE trip_events ENABLE ROW LEVEL SECURITY;
-- Apply RLS policies from 02_SECURITY.md
```

**Migration:** Copy events from `trips.events` JSONB column to the new table. Keep both until all clients are updated (phased migration).

### 5.2 Add `trip_proposals` Table

For the Collaborative Voting Board feature:
```sql
CREATE TABLE trip_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  proposed_by text,
  votes jsonb DEFAULT '{}',
  status text DEFAULT 'proposed',
  created_at timestamptz DEFAULT now()
);
```

### 5.3 Add `expires_at` to `trip_invitations`

```sql
ALTER TABLE trip_invitations
  ADD COLUMN expires_at timestamptz DEFAULT now() + interval '7 days';
```

### 5.4 Realtime Subscription Migration

Once `trip_events` table exists, update `subscribeToTrip` to subscribe to it instead of the `trips` table. This enables targeted patches instead of full refetch (see `03_PERFORMANCE.md §ME-4`).

---

## 6. STATE MANAGEMENT — V2 SLICES

```typescript
// lib/store/index.ts — V2 target structure
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),       // userId, authUser, termsAccepted
      ...createTripListSlice(...a),   // userTrips[], isLoadingTrips
      ...createActiveTripSlice(...a), // trip, tripDbId, activeDay
      ...createEventsSlice(...a),     // addEvent, editEvent, deleteEvent, voteEvent
      ...createSuppliesSlice(...a),   // supplies[], toggleSupply, addSupplyItem
      ...createExpensesSlice(...a),   // expenses[], addExpense, deleteExpense
      ...createSyncSlice(...a),       // isOffline, pendingChanges, lastSyncError
      ...createUISlice(...a),         // screen, themeMode, highContrast, reducedMotion
    }),
    {
      name: 'trippy-v2-storage',
      partialize: (s) => ({
        themeMode:      s.themeMode,
        highContrast:   s.highContrast,
        reducedMotion:  s.reducedMotion,
        hideBudget:     s.hideBudget,
        locale:         s.locale,
        nickname:       s.nickname,
        tripDbId:       s.tripDbId,
        activeDay:      s.activeDay,
        termsAccepted:  s.termsAccepted,
        currencyByTrip: s.currencyByTrip,
        pendingChanges: s.pendingChanges,  // FIXED: was not persisted
      }),
    }
  )
);
```

---

## 7. COMPONENT TREE

```
app/
  layout.tsx                   ← fonts, LazyMotion, MotionConfig
  page.tsx                     ← Server Component, Suspense wrapper
  components/
    AppShell.tsx               ← auth gate + screen router
    NavBar.tsx                 ← floating tab bar (5 tabs)
    screens/
      LoginScreen/
        index.tsx
      OnboardingScreen/
        index.tsx
      TripPickerScreen/
        index.tsx
        TripCard.tsx
        CreateTripWizard/
          index.tsx            ← 3-step wizard
          Step1Where.tsx
          Step2Crew.tsx
          Step3Theme.tsx
      OverviewScreen/
        index.tsx              ← layout only
        HeroCard.tsx
        NextEventCard.tsx
        WeatherStrip.tsx
        BudgetBar.tsx
        DaysGrid.tsx
        ExpensePanel.tsx       ← (accessible from settings in v2)
      DaysScreen/
        index.tsx              ← swipe container
        DayStrip.tsx
        EventCard.tsx
        RouteConnector.tsx
        HotelBanner.tsx
        AddEventSheet.tsx
      MapScreen/
        index.tsx              ← Mapbox GL JS
      SuppliesScreen/
        index.tsx
      CrewScreen/
        index.tsx
        MemberRow.tsx
        InviteSheet.tsx
      SettingsScreen/
        index.tsx
        NotesSection.tsx       ← FIXED: now reachable
        ExpensesSection.tsx
    ui/
      Sheet.tsx                ← role=dialog, focus trap, aria-modal
      GlassBtn.tsx
      Skeleton.tsx
      Toast.tsx
      WorldClock.tsx           ← NEW
      LanguageCard.tsx         ← NEW
```

---

## 8. MIGRATION STRATEGY

### Phase A — V1 Compatibility Layer (Week 1-4)

Keep V1 screen strings working alongside V2. Every `setScreen('dashboard')` call also sets the URL.

```typescript
// Shim: during transition, both stay in sync
export function navigateTo(screen: Screen) {
  setScreen(screen);
  // Map old screen names to URLs
  const url = SCREEN_TO_URL[screen];
  if (url) window.history.pushState({}, '', url);
}
```

### Phase B — URL-First Navigation (Week 5-8)

Remove `setScreen` calls. Navigation is URL-driven via Next.js App Router. Zustand holds data only, not navigation state.

### Phase C — Server Components (Week 9+)

Once navigation is URL-based, trip data can be fetched server-side and streamed. Initial load improves significantly.

---

## 9. ONBOARDING FLOW (V2 NEW)

First-time users see a 3-screen onboarding:

```
Screen 1: "Welcome to Trippy."
  ← animated compass + brand mark
  [Get Started]

Screen 2: "What should we call you?"
  ← nickname input
  [Continue]

Screen 3: "How do you like your Trippy?"
  ← language selector (EN / HE / more)
  ← theme selector (Light / Dark / Auto)
  [Start Planning →]
```

After onboarding: `termsAccepted = true`, stored in `localStorage`. Never shown again.

---

## 10. DEFINITION OF V2 DONE

V2 ships when all of the following are true:

- [ ] Notes screen is reachable from NavBar
- [ ] Crew screen replaces Settings in primary nav
- [ ] Map screen shows all event pins
- [ ] Trip Picker screen with multi-trip navigation
- [ ] Floating tab bar (not flat strip)
- [ ] All 19 security vulnerabilities from `02_SECURITY.md` fixed
- [ ] LazyMotion migration complete (`m.div` everywhere)
- [ ] `next/font` migration complete (no CDN font links)
- [ ] Zustand store split into domain slices
- [ ] `pendingChanges` persisted across sessions
- [ ] React error boundaries at 3 levels
- [ ] `withOptimistic` wrapper on all mutations
- [ ] Full Hebrew RTL support (see `07_HEBREW.md`)
- [ ] World clock widget live (see `08_WORLD_CLOCK_TRAVEL.md`)
- [ ] Expense settlement calculator live
- [ ] CI passes: 0 TypeScript errors, 0 lint errors
- [ ] Lighthouse performance score ≥ 85 on mobile
