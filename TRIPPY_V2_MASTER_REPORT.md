# TRIPPY V2 — MASTER ANALYSIS & RECOMMENDATIONS REPORT

> **Generated:** 2026-05-25 | **6-Agent Deep Analysis + Manual Deep-Dive** | Covers: Architecture · Security · Performance · Design · Features · V2 Spec · Hebrew/RTL · World Clock · Travel Time · Motion · Native Feel

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [App Analysis — Architecture & Code Quality](#2-app-analysis)
3. [Security Audit — 19 Vulnerabilities Found](#3-security-audit)
4. [Performance — How to Cut 35–45% Load Time](#4-performance)
5. [Design & UI/UX — 2026 Direction](#5-design--uiux)
6. [15 New Features + Roadmap](#6-new-features)
7. [V2 Complete Specification](#7-v2-specification)
8. [Integration & Automated Checks](#8-integration--automated-checks)
9. [Full Hebrew & RTL Support](#9-full-hebrew--rtl-support)
10. [World Clock](#10-world-clock)
11. [Better Travel Time Calculation](#11-better-travel-time-calculation)
12. [Better Effects & Motion](#12-better-effects--motion)
13. [Native App Feel on Web](#13-native-app-feel-on-web)
14. [Priority Action List](#14-priority-action-list)

---

## 1. EXECUTIVE SUMMARY

Trippy has **excellent bones**: a unique desert aesthetic, real-time collaboration, AI suggestions, strong feature breadth, and a well-crafted animation system. The codebase is functional and ships. But it has accumulated **structural and security debt** that must be addressed before v2 can be built on top.

**The 5 most urgent issues to fix before anything else:**

| # | Issue | Risk | Effort |
|---|-------|------|--------|
| 1 | RLS not applied in Supabase dashboard | **DATA BREACH** — any user can read/write any trip | 1 hour (Supabase UI) |
| 2 | Notes screen has no NavBar tab — unreachable | Core feature invisible | 30 min |
| 3 | Account deletion email is commented out — tokens log to console | Production blocker | 1 day |
| 4 | Any authenticated user can mutate any trip's events/expenses | **CRITICAL auth bypass** | 2 hours |
| 5 | 4 Google Fonts via CDN `<link>` tags | -200–400ms FCP | 2 hours |

---

## 2. APP ANALYSIS

### 2.1 Architecture Overview

Trippy is a **thick-client SPA** built on Next.js 16 App Router. All rendering and state live in one persistent `AppShell` React tree. Screens are switched via Zustand `screen` string — not URL routing. This works at current scale but limits deep-linking, browser navigation, and SEO.

**Data flow:**
```
Zustand (localStorage persisted) ← single source of truth
  ↕ optimistic updates + rollback
Next.js API Routes ← thin auth-verified proxies
  ↕
Supabase (DB + Auth + Realtime)
  +
External: Google Places · Weather · Exchange Rates · Anthropic Claude
```

### 2.2 Feature Inventory

| Feature | Status | Notes |
|---------|--------|-------|
| Trip creation & management | ✅ | |
| Hour-by-hour timeline | ✅ | |
| Event CRUD + voting | ✅ | |
| AI suggestions (Claude Haiku) | ✅ | |
| Weather forecast | ✅ | |
| Exchange rate conversion | ✅ | |
| Real-time collaboration | ✅ | Full refetch pattern (see §4) |
| Email invitations | ✅ | |
| Invite link (token-based) | ✅ | |
| PDF export | ✅ | |
| Emergency contacts | ✅ | UI not in main nav |
| Supplies/packing list | ✅ | |
| Trip notes | ✅ | **UNREACHABLE from nav** |
| Expense tracking | ✅ | No settlement calc (who owes who) |
| Carbon footprint | ⚠️ | Logic exists, hidden behind a toggle |
| Offline mode | ⚠️ | 4/11 mutation types replay offline |
| PWA | ⚠️ | No install prompt logic |
| Expense settlement | ❌ | Missing |
| Trip map view | ❌ | lat/lng on events, no map screen |

### 2.3 Top 15 Critical Issues

| # | Issue | File | Impact |
|---|-------|------|--------|
| 1 | RLS not applied | Supabase dashboard | **Data breach** |
| 2 | Notes unreachable from NavBar | `NavBar.tsx:14` (TABS array) | Core feature invisible |
| 3 | `pendingChanges` not persisted — offline edits lost on tab close | `store.ts:818` | Silent data loss |
| 4 | Sheet.tsx has no focus trap, role, or aria-modal | `ui/Sheet.tsx:82` | WCAG fail |
| 5 | AI prompt injection via user-controlled trip.name / event names | `api/ai/suggestions/route.ts:110` | Security |
| 6 | N+1 route-time API calls (one per event pair with coords) | `DayScreen.tsx:159` | Performance + cost |
| 7 | Full trip refetch on every Supabase realtime UPDATE | `store.ts:763` | Performance + loading flash |
| 8 | `dbGetTripEmailInvitations` missing `created_at` in SELECT | `lib/db.ts:431` | Bug: timestamps always undefined |
| 9 | Weather coordinate logic duplicated 100+ lines | `DashboardScreen.tsx:75`, `DayScreen.tsx:774` | Maintenance debt |
| 10 | Timeline clips events before 07:00 | `DayTimelineView.tsx:13` | Events invisible |
| 11 | All icon-only buttons lack `aria-label` | `DayScreen.tsx:508`, throughout | Accessibility |
| 12 | `UpdateTripBody` schema mismatch (string vs string[]) | `schemas.ts:66` vs `db.ts:386` | Silent bug |
| 13 | Loading overlay hardcodes `#F4EFE8` — wrong in dark mode | `AppShell.tsx:208,332` | UI regression |
| 14 | `--ink-2`/`--ink-3` CSS tokens don't exist | `SuggestionsSheet.tsx:273,317` | Invisible text |
| 15 | `require()` inside `subscribeToTrip` — CommonJS in ESM | `store.ts:765` | Build risk |

---

## 3. SECURITY AUDIT

### 3.1 Critical Vulnerabilities (CVSS 9+)

#### CRIT-1 — Any authenticated user can mutate any trip's events/expenses/supplies
**File:** `app/api/trips/[tripId]/events/route.ts:51`, same pattern in expenses, supplies, hotels, day-meta  
**CVSS:** 9.1

When `SUPABASE_SERVICE_ROLE_KEY` is missing or `tryAdminClient()` returns null, the participation check is **completely skipped**. The comment says "trust RLS" — but MEMORY.md explicitly states RLS has not been applied in Supabase yet.

**Fix:**
```typescript
// Make participation check unconditional — remove the `if (admin)` guard
const checkClient = tryAdminClient() ?? (await getUserClient());
const { data: participant } = await checkClient
  .from('trip_participants')
  .select('user_id')
  .eq('trip_id', tripId)
  .eq('user_id', user.id)
  .maybeSingle();
if (!participant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

#### CRIT-2 — Any user can reject/cancel any invitation by ID
**File:** `app/api/invitations/route.ts:76–127`  
**CVSS:** 9.1  
PATCH/DELETE on invitations don't verify the caller is the invitee or trip owner.

**Fix:** Add `.eq('invited_email', user.email)` to PATCH, verify trip ownership on DELETE.

#### CRIT-3 — Invite link TOCTOU: use_count increment is not atomic
**File:** `app/api/invite/[token]/route.ts:101–136`  
**CVSS:** 9.0  
Concurrent requests can all pass the `use_count >= max_uses` gate simultaneously.

**Fix:** Use `SELECT ... FOR UPDATE` or a Postgres atomic function.

#### CRIT-4 — Account deletion email is commented out — tokens logged to console
**File:** `app/api/account/delete/request/route.ts:61–77`  
**CVSS:** 9.3  
The Resend integration is a TODO. Deletion tokens are `console.info`'d. Anyone with Vercel log access can delete any account.

**Fix:** Implement email before any public launch. This is a production blocker.

---

### 3.2 High Vulnerabilities (CVSS 7–8)

| ID | Issue | File | Fix |
|----|-------|------|-----|
| HIGH-1 | In-memory rate limiter useless on Vercel serverless — each lambda has empty store | `lib/rateLimit.ts` | Replace with Upstash Redis + `@upstash/ratelimit` |
| HIGH-2 | `/api/places` and `/api/places/details` fully unauthenticated — Google Maps quota abusable | Both route files | Add auth check + rate limit |
| HIGH-3 | Weather endpoint IP rate limit bypassable via `x-forwarded-for` spoofing | `api/weather/route.ts:156` | Use `x-real-ip`, add auth check |
| HIGH-4 | `PATCH /api/trips/[tripId]` body parsed without Zod validation | `api/trips/[tripId]/route.ts:47` | Use existing `UpdateTripBody` schema |
| HIGH-5 | Event POST has no input validation — arbitrary data written to DB | `api/.../events/route.ts:53` | Create and use `AddEventBody` Zod schema |
| HIGH-6 | Open redirect in auth callback — `//evil.com` bypasses `/` check | `app/auth/callback/route.ts:13` | Use `new URL(next, origin)` and verify `url.origin === origin` |
| HIGH-7 | Direct Supabase client fallbacks in `db.ts` bypass server-side auth | `lib/db.ts:183–254` | Remove all `!tripId` fallback paths |

---

### 3.3 Medium Vulnerabilities

| ID | Issue |
|----|-------|
| MED-1 | Rate limiter Map never evicts expired entries — memory leak |
| MED-2 | Deletion token only logged, never emailed (same as CRIT-4) |
| MED-3 | `getSession()` used instead of `getUser()` — revoked sessions appear valid |
| MED-4 | `GOOGLE_MAPS_API_KEY` silently falls back to empty string |
| MED-5 | `console.log` with sensitive data in production routes |
| MED-6 | No Content-Security-Policy, X-Frame-Options, or security headers |
| MED-7 | Invite token stored in plaintext in `trips` table |
| MED-8 | AI prompt injection via user-controlled `tripName` and `exclude` fields |

---

### 3.4 Security Remediation Plan

**Phase 1 — Fix before ANY public launch:**
1. Apply RLS policies in Supabase dashboard
2. Make participation checks unconditional in all `[tripId]` routes (CRIT-1)
3. Fix invitation PATCH/DELETE ownership (CRIT-2)
4. Implement account deletion email (CRIT-4)
5. Fix auth callback open redirect (HIGH-6)
6. Add auth + rate limiting to `/api/places` (HIGH-2)

**Phase 2 — Within one week:**
7. Replace in-memory rate limiter with Upstash Redis (HIGH-1)
8. Add Zod validation to PATCH trips and POST events (HIGH-4, HIGH-5)
9. Fix `getSession()` → `getUser()` (MED-3)
10. Add security headers in `next.config.js` (MED-6)
11. Fix TOCTOU on invite link (CRIT-3)

**Phase 3 — Within one month:**
12. Remove all direct Supabase fallback paths from `lib/db.ts` (HIGH-7)
13. Sanitize user input before AI prompt interpolation (MED-8)
14. Add rate limiter memory eviction (MED-1)
15. Structured logging — remove `console.log` in production routes

---

## 4. PERFORMANCE

### 4.1 Current Performance Issues

| Issue | File | Impact |
|-------|------|--------|
| 4 Google Fonts via CDN `<link>` — 4 render-blocking round-trips | `layout.tsx:29–38` | +200–400ms FCP |
| `Math.random()` called inside JSX render in BackgroundScene | `BackgroundScene.tsx:251` | Constant CLS, 200+ random values per render |
| AppShell subscribes to all 20+ Zustand fields — any mutation = full re-render | `AppShell.tsx:85` | ~30% unnecessary re-renders |
| 8 separate SVG elements in CompassLoader — 8 GPU layers | `ui/CompassLoader.tsx:34` | Compositor jank on low-end mobile |
| Full trip refetch on every Supabase realtime UPDATE | `store.ts:763–779` | Loading flash on every collaborator edit |
| Weather fetch duplicated: both Dashboard + Day fire independently | `DashboardScreen.tsx:109`, `DayScreen.tsx` | Double API calls on navigation |
| `JSON.stringify()` in useEffect dependency array | `DashboardScreen.tsx:112` | O(n) serialization every render |
| Route-time N+1: one API call per event pair with coordinates | `DayScreen.tsx:159` | 5+ API calls on a busy day |
| Entire app is a single `'use client'` island — no Server Components | `page.tsx:1`, `AppShell.tsx:1` | Max LCP bottleneck |
| `require()` inside `subscribeToTrip` — bypasses tree-shaking | `store.ts:765` | Build risk, no optimization |
| `TripEntryAnimation`: `filter: blur(60px)` on 100vmax element | `TripEntryAnimation.tsx:52` | Heavy GPU on mobile |
| `unstable_cache` closure reconstructed on every request | `api/exchange-rates/route.ts` | Defeats caching |

---

### 4.2 Quick Wins (0–2 days, ~35% FCP improvement combined)

**QW-1: Migrate to `next/font` — biggest single win (-200–400ms FCP)**
```tsx
// layout.tsx — replace all <link> tags with:
import { Bricolage_Grotesque, Newsreader, JetBrains_Mono } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'], variable: '--font-bricolage', display: 'swap',
  weight: ['400','500','600','700'], axes: ['opsz'],
});
// Repeat for Newsreader and JetBrains_Mono
// Huninn: use next/font/local with downloaded WOFF2
```

**QW-2: Fix `Math.random()` in BackgroundScene renders**
```tsx
// Wrap in useMemo — computed once on mount, never on re-render
const buildingData = useMemo(() => bgBuildings.map(b => ({
  ...b,
  windowGrid: Array.from({ length: Math.floor(b.h/22) }, () =>
    Array.from({ length: Math.floor(b.w/14) }, () => Math.random() > 0.4)
  )
})), []);
```

**QW-3: Slice Zustand selectors in AppShell (-30% re-renders)**
```tsx
// Replace the single useAppStore() mega-destructure with individual selectors:
const screen = useAppStore(s => s.screen);
const trip = useAppStore(s => s.trip);
// For grouped: use useShallow from 'zustand/react/shallow'
```

**QW-4: Fix `JSON.stringify` in useEffect deps**
```tsx
const coordsKey = useMemo(
  () => (trip?.dayMeta ?? []).map(m => `${m.lat},${m.lng}`).join('|'),
  [trip?.dayMeta]
);
```

**QW-5: Replace `require()` with top-level import** in `store.ts:765`

---

### 4.3 Medium Effort (1 week, additional ~15% improvement)

**ME-1: LazyMotion + `m` components (-20kb initial bundle)**
```tsx
import { LazyMotion, domAnimation, m } from 'framer-motion';
// Wrap Shell in <LazyMotion features={domAnimation} strict>
// Replace all <motion.div> with <m.div> throughout
```

**ME-2: Client-side weather cache (eliminates duplicate API calls)**
```ts
// lib/weatherCache.ts — module-level Map with 30min TTL
```

**ME-3: Consolidate CompassLoader to single SVG (8 GPU layers → 1)**

**ME-4: Delta-based realtime updates (no more full refetch on collaborator edits)**
```ts
// Subscribe to trip_events table directly instead of trips table
// Apply targeted patch instead of calling loadTripById()
// Add 500ms debounce on any remaining full-refetch triggers
```

**ME-5: `useTransition` for screen changes (better INP)**
```tsx
const [isPending, startTransition] = useTransition();
const handleSetScreen = (s: Screen) => startTransition(() => setScreen(s));
```

---

### 4.4 Total Estimated Impact

| Optimizations | FCP | LCP | TTI | Load Time |
|---------------|-----|-----|-----|-----------|
| Quick Wins only | -400ms | -200ms | -80ms | **-35%** |
| + Medium Effort | -500ms | -300ms | -250ms | **-45%** |
| + Architectural (RSC) | -800ms | -600ms | -600ms | **-60%** |

**Target of 30% is achievable with just QW-1 + QW-3 + ME-1 (~4 days of work).**

---

## 5. DESIGN & UI/UX

### 5.1 2026 Design Context

- **Trippy's terracotta/sand palette is perfectly aligned with the dominant 2026 color moment** — warm earth tones are mainstream, not niche. Lean harder into this.
- **Apple iOS 26 Liquid Glass** is the new standard: floating rounded tab bars (28px radius, inset 12px from edges), shrink on scroll, expand on scroll-up, detached FAB to the right.
- **Glassmorphism has matured** from "trend" to "foundational chrome." Rule: glass = navigation layer, not content layer. Content lives below and through it.
- **Bento asymmetric layouts** replace uniform card grids — the active trip deserves a full-width hero card.
- **Haptics are non-negotiable** — distinct signatures per action type.

---

### 5.2 Current UI/UX Issues

1. **Notes screen is a dead end** — no nav tab, no back button; navigating away means it's gone
2. **Leave Trip is in the Share sheet** — destructive action buried in collaboration UI
3. **Expense tracker has no settlement view** — every group needs "who owes who"
4. **No expense settlement** — most expected feature of any expense tracker
5. **Day strip doesn't auto-scroll to active day** — on a 30-day trip the user scrolls manually
6. **Empty state for Notes doesn't explain the privacy model**
7. **Settings screen may render i18n keys as literals** if translations are missing

---

### 5.3 "Desert Glass" — V2 Design Direction

**The Vision:** Trippy V2 is warm terracotta and parchment sand viewed through physically-correct glass that **glows amber from the heat beneath it**. Navigation floats. Every card tells a story. Every action has weight.

#### Color System (V2 tokens)

```css
/* Primitives */
--palette-sand-100: #F4EFE8;    /* page background */
--palette-terra-400: #C4714A;   /* brand primary */
--palette-ink-900:  #1A1410;    /* near-black */

/* Semantic */
--bg:            var(--palette-sand-100);
--bg-elevated:   #FAF6F0;
--surface:       rgba(255,255,255,0.72);   /* glass cards */
--surface-strong: rgba(255,255,255,0.88);
--terra:         var(--palette-terra-400);
--terra-muted:   rgba(196,113,74,0.10);
--overlay:       rgba(26,20,16,0.48);
--nav-surface:   rgba(244,239,232,0.92);   /* floating tab bar */
```

#### Typography (keep all 4 fonts, formalize scale)

```
Display:  Bricolage Grotesque, 32–40px, weight 700   → trip names, hero moments
Title:    Bricolage Grotesque, 22–26px, weight 600   → screen headers
Headline: Bricolage Grotesque, 17px,   weight 600   → card titles
Body:     Newsreader, 14px, weight 400               → descriptions, notes
Caption:  Bricolage Grotesque, 11px, weight 600      → eyebrows, metadata
Mono:     JetBrains Mono, 13px, weight 400           → trip codes, coordinates
```

**Rule: Build hierarchy through weight, not size.** A section title (600) and body (400) can be the same 17px and still read clearly distinct.

#### Navigation (iOS 26 Floating Tab Bar)

```
Before: flush bottom nav, 4 tabs (Camp / Explore / Pack / Setup)
After:  floating glass pill, 4 tabs (Home / Days / Pack / Crew)
        border-radius: 28px
        inset: 12px sides, 16px bottom
        backdrop-filter: blur(20px) saturate(180%)
        shrinks on scroll-down, expands on scroll-up
        detached terra FAB (52px) to the right
```

**Settings moves to a "More" sheet** — 95% of users don't adjust settings mid-trip. This frees a primary slot for **Crew** (collaboration), Trippy's core differentiator.

#### Haptic Map

| Action | Haptic | Animation |
|--------|--------|-----------|
| Add stop | Soft pulse | Green glow on new card |
| Confirm edit | Medium click | Card scales 1.02 → 1.0 |
| Delete / Leave | Heavy thud | Red sweep + fade out |
| Trip saved | Success burst | Particle explosion from save button |
| Gesture threshold | Medium click | Action chip slides into view |

---

### 5.4 5 Components to Redesign

**1. Trip Card (Dashboard) → Bento Hero**
- Full-width hero for active/soonest trip: destination photo with glass overlay (70% opacity, amber tint)
- Smaller compact tiles for past trips
- Swipe-left reveals: Pin (amber), Share (blue), Delete (red)
- Small animated compass needle showing trip's cardinal direction from user

**2. Itinerary Stop Row → Glass Pills**
- Horizontal glass pill on sand background (not a flat list item)
- Left: numbered terracotta circle; Right: 3-dot → bottom sheet (not dropdown)
- Swipe-left: Edit + Delete with haptic threshold
- Long-press: drag-to-reorder with lifted shadow (scale 1.03)
- Confirmed state: green left-border stripe + spring-bounce checkmark

**3. Trip Entry Screen → Branded Moment**
- Glass disc grows to 60% screen height
- Parallax desert landscape behind disc (CSS, no video)
- Compass needle spins through cardinals → locks to North with heavy haptic
- Trip name animates character-by-character (Fraunces Display, 30ms stagger)
- Member avatars arc below in staggered reveal
- Minimum 800ms — let the brand moment breathe

**4. Group Member Panel → Persistent Bottom Sheet Handle**
- Replace separate screen with persistent bottom sheet handle: glass pill showing avatar stack + "4 members"
- Drag up to expand: member list with last action timestamps, status dots
- Owner has compass rose badge on avatar
- Invite row: dashed glass pill with "+" — tap copies code + triggers native share sheet

**5. Destination Search / Stop Builder → Map-First**
- Replace form with full-screen map (Mapbox muted terracotta/sand tile skin)
- Glass pill search bar floats at top
- Results appear as animated pins dropping onto map in real time
- Select pin → bottom sheet rises with: place name, photo strip, hours/rating, "Add to Day X" button
- Day selector: horizontal scroll of glass pills

---

## 6. NEW FEATURES

### 6.1 Priority Top 10 (ranked by User Value × Feasibility)

> ⚠️ **Removed from recommendations:** Real-time flight tracking and emergency contact/personal document storage have been deliberately excluded. Flight tracking via third-party APIs can fail, be delayed, or return incorrect data — a user relying on it for a real flight could miss it. Storing passports, ID documents, or personal emergency data creates serious liability if that data is lost, corrupted, or unavailable offline. These features are not appropriate for Trippy to own.

| # | Feature | Wave | Effort | APIs Needed |
|---|---------|------|--------|-------------|
| 1 | **AI Packing List Optimizer** | 1 | 1-2 days | Claude (existing) |
| 2 | **Expense Settlement Calculator** | 1 | 2-3 days | None |
| 3 | **Trip Stamps & Achievement Badges** | 1 | 3-4 days | None (StampIcon exists!) |
| 4 | **Carbon Footprint Dashboard Card** | 1 | 1 day | None (logic exists!) |
| 5 | **Trip Map View** | 2 | 4-5 days | Mapbox GL JS (free tier) |
| 6 | **Collaborative Wishlist / Voting Board** | 2 | 4-5 days | Supabase (existing) |
| 7 | **AI Trip Disruption Replanner** | 2 | 3-4 days | Claude (existing) |
| 8 | **Smart Morning Briefing** | 2 | 3-4 days | Web Push + Claude |
| 9 | **Group Chat & Reaction Threads** | 3 | 4-5 days | Supabase Realtime (existing) |
| 10 | **Destination Inspiration Feed** | 3 | 3-4 days | Claude + Unsplash API |

---

### 6.2 Feature Details

#### Feature 1: AI Packing List Optimizer
**How it works:** Claude analyzes trip countries + weather + event categories (beach, hiking, concerts, flights) + duration → generates personalized `SupplyItem[]`. Shows "Merge with existing list" confirmation sheet.  
**Why easy:** Claude already integrated. `SuppliesScreen` and `SupplyItem` type already exist. New `/api/packing-list` route is ~50 lines.

#### Feature 2: Expense Settlement Calculator
**How it works:** Debt-simplification algorithm (~50 lines TypeScript). Calculates minimum transactions to zero out all debts. Shows "Alex pays Sam $42" settlement cards. Members mark as paid.  
**Schema addition:** `splitAmong?: string[]` on `Expense` type + `settlements` Supabase table.

#### Feature 3: Trip Stamps & Badges
**How it works:** `StampIcon` already exists! Define milestone triggers: first trip, 5 countries, 100 events, "Budget Master," "Night Owl," "Group Leader." Animated stamp-press effect on first earn.  
**Schema:** `user_badges(user_id, badge_id, earned_at)` table.

#### Feature 4: Carbon Footprint Card
**How it works:** `estimateCarbonKg` already exists in `utils.ts`. `showCarbonBudget` flag already in store — just hidden. Promote to animated progress ring card with AI tips button.

#### Feature 5: Trip Map View
**How it works:** All `TripEvent` objects already have `lat`/`lng`. Mapbox GL JS via `next/dynamic` + `ssr: false`. One polyline per day, different color per day. Cluster nearby pins.  
**New:** `map` Screen value + `MapScreen` component + new NavBar tab slot.

#### Feature 6: Collaborative Wishlist / Voting Board
**How it works:** Members add candidate places before itinerary is locked. Upvote/downvote/comment. Threshold reached → "Add to Itinerary" CTA. Extends existing vote patterns.  
**Schema:** `wishlist_items(trip_id, place_id, name, lat, lng, category, added_by, votes_up, votes_down, status)`

#### Feature 7: AI Trip Disruption Replanner
**How it works:** Flight cancelled / venue closed → user taps "Replan" on event card → Claude receives full day context → returns JSON diff of updated events → before/after diff sheet using existing `Sheet`.  
**Implementation:** Extend `/api/suggestions` with `mode: 'replan'` payload.

#### Feature 8: Smart Morning Briefing
**How it works:** Supabase Edge Function cron (configurable time per trip/user timezone) → fetches day events + weather + flight status → Claude generates daily tip → Web Push with "View Today" deep link.

#### Features 9–10 (Wave 3)
- **Group Chat & Reaction Threads** — Supabase Realtime chat in `ChatSheet`, emoji reactions on events
- **Destination Inspiration Feed** — Claude + Unsplash API, drives new trip creation, pre-fills destination

#### Also in Wave 3 (utility)
- **Multi-Currency Receipt OCR** — Tesseract.js (free, client-side), camera capture, auto-fill expense form
- **Viator Activity Booking** — affiliate commission revenue (~8%), in-app booking for AI-suggested activities
- **Offline Mode** — Workbox + IndexedDB, full itinerary cached, sync queue

> ⚠️ **Not recommended:** Real-time flight tracking (liability if API fails or returns wrong data), personal document storage (passport photos, IDs — not appropriate to store), SOS/emergency-contact features (critical safety infrastructure should not depend on a hobby travel app's uptime).

---

### 6.3 Feature Roadmap

**Wave 1 — "Depth & Delight" (Weeks 1–4)**  
Zero new external API dependencies. All builds on existing infrastructure.
- AI Packing List Optimizer (1-2 days)
- Expense Settlement Calculator (2-3 days)
- Trip Stamps & Badges (3-4 days)
- Carbon Footprint Dashboard Card (1 day)

**Wave 2 — "Collaboration & Navigation" (Weeks 5–10)**  
Introduces Mapbox, fine-grained Realtime.
- Trip Map View (4-5 days)
- Collaborative Wishlist / Voting Board (4-5 days)
- AI Trip Disruption Replanner (3-4 days)
- Smart Morning Briefing (3-4 days)

**Wave 3 — "Commerce & Power Features" (Weeks 11–18)**  
Monetizable integrations and power-user features.
- Group Chat & Reaction Threads (4-5 days)
- Receipt OCR Expense Capture (4-5 days)
- Viator Activity Booking (5-7 days, requires partner approval)
- Destination Inspiration Feed (3-4 days)
- Offline Mode (6-8 days)

> ⚠️ **Excluded deliberately:** Real-time flight tracking, SOS/emergency features, and personal document storage (passport/ID). See rationale in §6.1.

**Monetization:** Bundle Map View + AI Replanner + Offline Mode + Viator → **Trippy Pro at $4.99/mo**

---

## 7. V2 SPECIFICATION

### 7.1 Information Architecture

V1's flat `Screen` enum becomes a **3-layer navigation hierarchy:**

```
Layer 0 — Auth Shell
  /login
  /onboarding
  /join/:token

Layer 1 — Trip Picker (authenticated, no active trip)
  /trips                  ← NEW: lists all user trips
  /trips/new              ← NEW: trip creation wizard

Layer 2 — Trip Shell (authenticated, trip loaded)
  /trip/:tripId/overview  ← replaces DashboardScreen
  /trip/:tripId/days      ← replaces DayScreen
  /trip/:tripId/supplies  ← kept, refactored
  /trip/:tripId/crew      ← NEW: replaces Settings in primary nav
  /trip/:tripId/settings  ← moved to "More" sub-sheet
```

Notes dissolves into a panel within Overview and accessible from Days via contextual sheet.

---

### 7.2 New Navigation Model

| V1 Tab | V1 Label | V2 Tab | V2 Label | Change |
|--------|----------|--------|----------|--------|
| dashboard | CAMP | overview | HOME | Renamed, richer |
| day | EXPLORE | days | DAYS | Same core |
| supplies | PACK | supplies | PACK | Keep |
| settings | SETUP | crew | CREW | **Replaced** — collab first |
| — | — | more (…) | MORE | **New** — Notes + Settings |

---

### 7.3 ASCII Wireframes

#### Trip Picker (Layer 1)
```
┌──────────────────────────────────────┐
│  ◉ Trippy                       [+] │
├──────────────────────────────────────┤
│  UPCOMING                            │
│  ┌────────────────────────────────┐  │
│  │ ✈  Tokyo Adventure       [→]  │  │
│  │    Jun 12–24 · 13 days         │  │
│  │    ●●● Alex, You, Sam   +2    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🏖  Greek Islands        [→]  │  │
│  │    Jul 4–11 · 8 days           │  │
│  └────────────────────────────────┘  │
│  PAST                                │
│  ┌────────────────────────────────┐  │
│  │ 🏔  Patagonia Hike       [↗]  │  │
│  └────────────────────────────────┘  │
│  ┌  + Plan a new adventure       ┐   │
└──────────────────────────────────────┘
```

#### Trip Overview (replaces Dashboard)
```
┌──────────────────────────────────────┐
│  ACTIVE TRIP            ●●● [share] │
│  ┌────────────────────────────────┐  │
│  │  Tokyo Adventure    [Day 3]    │  │
│  │  13 days · 47 events           │  │
│  │  Jun 12–24, 2026               │  │
│  │  ████████░░░░░  62% packed     │  │
│  └────────────────────────────────┘  │
│  NEXT EVENT                          │
│  ┌────────────────────────────────┐  │
│  │ [🍜] Ramen at Ichiran          │  │
│  │      Day 3 · 19:00–20:30       │  │
│  │      Shinjuku · 🌧 18°/12°     │  │
│  └────────────────────────────────┘  │
│  FORECAST [Tue][Wed][Thu][Fri]...   │
│  [🌧] [⛅] [☀️] [☀️] [🌦]          │
│  14°   17°  22°  24°  19°           │
│  INSIGHTS  [⚡ 2hr gap][🌅 Sunrise] │
│  DAYS  ┌──────────┐ ┌──────────┐   │
│         │ Day 1    │ │ Day 2    │   │
│         │ 4 events │ │ 7 events │   │
│         └──────────┘ └──────────┘   │
└──────────────────────────────────────┘
  [HOME]    [DAYS]    [PACK]    [CREW]
```

#### Day Timeline (improved)
```
┌──────────────────────────────────────┐
│  ← Your Journey          [ONLINE ●] │
│  [SUN][MON][TUE]③[WED][THU][FRI]    │  ← active = terra circle
│  🗼 Asakusa · 7 events · ⚠️1 overlap │
│  ──────────────────────────────────  │
│           [≡ LIST]  [⏱ TIMELINE]    │
│  🏨 Shinjuku Excel → 🗼  🚗18min     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [🗼] Senso-ji Temple  09:00    │  │
│  │      📍Asakusa  🌅  👍3 👎0    │  │
│  └────────────────────────────────┘  │
│  ··· 🗼→🍜  🚌22min  ⚡1h gap       │
│      [✨ Suggest]  [+ add here]      │
│  ┌────────────────────────────────┐  │
│  │ [🍜] Ramen at Ichiran  12:30   │  │
│  └────────────────────────────────┘  │
│                              [  +  ] │  ← terra FAB
└──────────────────────────────────────┘
```

#### Quick-Add Panel
```
╔══════════════════════════════════════╗
║  Add to Day 3                        ║
║  QUICK PRESETS                       ║
║  [🚗 Drive][🍽 Meal][☕ Café]        ║
║  [⛺ Rest][✈ Flight][⛽ Gas]        ║
║  ──────────────────────────────────  ║
║  Event name                          ║
║  ┌──────────────────────────────┐   ║
║  │ 🗼 Senso-ji Temple           │   ║
║  └──────────────────────────────┘   ║
║  Category: [🏛 ATTRACTION  ✓]       ║
║  Time: [09:00]  Duration: [−30][+30] ║
║  Location: [📍 Search places...]    ║
║                                      ║
║  [  + Add to Day 3  ]                ║
╚══════════════════════════════════════╝
```

#### Crew Screen (new)
```
┌──────────────────────────────────────┐
│  CREW                       [Invite] │
│  YOUR TEAM                           │
│  ┌────────────────────────────────┐  │
│  │  ● Alex M.         (owner) ◉  │  │  ← compass rose badge
│  │  ● You             (member)   │  │
│  │  ○ Sam K.          (pending)  │  │
│  │    sam@work.com  [resend][×]  │  │
│  └────────────────────────────────┘  │
│  TOP PICKS                           │
│  [🍣] Sushi at Sukiyabashi      👍5  │
│  [🗼] TeamLab Planets           👍4  │
│  RECENT ACTIVITY                     │
│  ● Alex added "Shibuya Crossing"     │
│    Day 4 · 2 min ago          [view] │
│  ● Sam voted 👍 on "TeamLab"         │
└──────────────────────────────────────┘
  [HOME]    [DAYS]    [PACK]    [CREW]
```

---

### 7.4 Component Architecture

```
app/
  components/
    shell/
      AppShell.tsx          ← keep, refactor to use router
      NavBar.tsx            ← keep, add 'crew', add 'more'
      OfflineWatcher.tsx    ← EXTRACT from AppShell
      SyncErrorWatcher.tsx  ← EXTRACT from AppShell
      GlobalLoader.tsx      ← EXTRACT from AppShell

    screens/
      auth/
        LoginScreen.tsx     ← auth UI only (remove trip creation)
        OnboardingScreen.tsx
        TermsModal.tsx

      trips/                ← NEW
        TripPickerScreen.tsx
        TripCreationWizard/ ← extracted from LoginScreen
          Step1_Details.tsx
          Step2_Theme.tsx   ← live BackgroundScene preview!
          Step3_Crew.tsx

      trip/
        OverviewScreen/     ← replaces DashboardScreen (7 components)
          index.tsx
          HeroCard.tsx
          NextEventCard.tsx
          WeatherStrip.tsx
          BudgetBar.tsx
          InsightsReel.tsx
          DaysGrid.tsx
          ExpensePanel.tsx

        DaysScreen/         ← replaces DayScreen (6 components)
          index.tsx
          DayStrip.tsx
          EventCard.tsx
          RouteConnector.tsx
          HotelBanner.tsx
          AddEventSheet.tsx
          SuggestionsSheet.tsx (move here)

        CrewScreen/         ← NEW
          index.tsx
          MemberCard.tsx
          InvitePanel.tsx   ← extracted from DashboardScreen share sheet
          ActivityFeed.tsx
          VoteLeaderboard.tsx

        SuppliesScreen.tsx  ← keep, minor refactor
        MoreSheet.tsx       ← NEW: Notes + Settings

    ui/                     ← keep all existing, add:
      QuickAddFAB.tsx       ← NEW
      SegmentedControl.tsx  ← NEW (replace inline toggle)
      AvatarStack.tsx       ← EXTRACT
      SyncStatusDot.tsx     ← NEW (green/amber/red dot in nav)
      ProgressRing.tsx      ← NEW (supplies % ring)
```

---

### 7.5 State Management (Domain Slices)

```typescript
// lib/store/index.ts
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),        // userId, authUser, termsAccepted
      ...createTripListSlice(...a),    // userTrips[], createTrip, deleteTrip
      ...createActiveTripSlice(...a),  // trip, tripDbId, activeDay, loadTripById
      ...createEventsSlice(...a),      // addEvent, editEvent, deleteEvent, voteEvent
      ...createSuppliesSlice(...a),    // supplies[], toggleSupply, addSupplyItem
      ...createExpensesSlice(...a),    // expenses[], addExpense, deleteExpense
      ...createSyncSlice(...a),        // isOffline, pendingChanges, lastSyncError
      ...createUISlice(...a),          // screen, themeMode, highContrast
    }),
    { name: 'trippy-storage', partialize: /* UI + auth only */ }
  )
);
```

---

### 7.6 Animation Tokens (centralize in `lib/motion.ts`)

```typescript
export const spring = {
  snappy:  { type: 'spring', stiffness: 500, damping: 35 }, // pill indicators
  default: { type: 'spring', stiffness: 360, damping: 38 }, // screen transitions
  gentle:  { type: 'spring', stiffness: 280, damping: 32 }, // cards, sheets
  float:   { type: 'spring', stiffness: 200, damping: 20 }, // overlays
};

export const duration = {
  fast:   0.18,  // hover states
  normal: 0.25,  // opacity fades
  slow:   0.45,  // progress bars
  enter:  0.85,  // trip entry animation
};

export const stagger = {
  cards: { staggerChildren: 0.06, delayChildren: 0.05 },
  list:  { staggerChildren: 0.04, delayChildren: 0.02 },
};
```

---

## 8. INTEGRATION & AUTOMATED CHECKS

### 8.1 Post-Action Health Checks

```typescript
// lib/sync/healthCheck.ts
export async function verifyEventWritten(
  tripId: string, dayNumber: number, eventId: string, retries = 2
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    const row = await dbGetEvent(tripId, dayNumber, eventId);
    if (row) return true;
    await delay(600 * (i + 1)); // 600ms, 1200ms back-off
  }
  return false;
}
```

| Action | Check | On Failure |
|--------|-------|------------|
| createTrip | Query trips table for new tripDbId | Block nav, show retry |
| addEvent | verifyEventWritten after 1s | Toast + re-queue |
| deleteEvent | Confirm row gone after 800ms | Rollback (V1 already does this) |
| inviteToTrip | Query trip_invitations for email | "Invite may not have sent" toast |
| leaveTrip | Confirm participant removed | Force re-query |

### 8.2 Error Boundary Strategy

```
Level 1 — App (auth/init failures) → AppCrashScreen
Level 2 — Screen (render failures) → ScreenErrorCard with "Reload" button
Level 3 — Widget (weather/rates fails) → RetryCard — already partially in AsyncError.tsx
```

V1 has **zero** React error boundaries. Any unhandled throw tears down the entire app.

### 8.3 `withOptimistic` Wrapper

```typescript
// Standardize V1's manual per-action rollback pattern:
export async function withOptimistic<T>(opts: {
  apply: () => void;       // immediate local state
  persist: () => Promise<T>;  // async DB call
  rollback: () => void;    // undo if persist fails
  onError?: (err: Error) => void;
}): Promise<T | null> {
  opts.apply();
  try { return await opts.persist(); }
  catch (err) { opts.rollback(); opts.onError?.(err as Error); return null; }
}
```

### 8.4 Fine-Grained Realtime (V2)

Current: `trips` table UPDATE → `loadTripById()` (full refetch, loading flash)

V2: Subscribe to `trip_events` table directly:
- `INSERT` → `applyRemoteEventAdd()` — targeted patch, no full refetch
- `DELETE` → `applyRemoteEventDelete()` — targeted remove
- `trips` UPDATE → keep broad listener only for metadata changes (name, theme)

**Requires:** New `trip_events` table (normalized from JSONB) + migration script.

---

---

## 9. FULL HEBREW & RTL SUPPORT

### 9.1 Current State

The app has a solid translation foundation: `lib/i18n.tsx` contains 200+ translated keys in Hebrew, auto-detects `navigator.language`, and exposes `isRTL`. The i18n provider correctly sets `isRTL = true` for Hebrew. **BUT** the actual RTL rendering has critical gaps.

### 9.2 What's Broken

**A. `dir` applied to the wrong element**

`AppShell.tsx:232` sets `dir={isRTL ? 'rtl' : 'ltr'}` on the main scroll div — not on `<html>`. Screen readers, browser bidirectional text algorithms, and CSS inheriting `direction` from the root all expect `dir` on `<html>`.

```tsx
// layout.tsx — needs to be dynamic based on user locale
// Problem: layout.tsx is a Server Component; locale is client-side state
// Solution: use a cookie to persist locale and read it server-side
// app/layout.tsx:
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = cookies().get('trippy-locale')?.value ?? 'en';
  const isRTL = locale === 'he';
  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} style={{ height: '100%' }}>
```

**B. Fonts: Hebrew characters have no matching font loaded**

`layout.tsx` loads Bricolage Grotesque, Newsreader, JetBrains Mono, and Huninn — none of which support Hebrew Unicode block (U+0590–U+05FF). Hebrew text falls back to the OS system font (usually Noto Sans Hebrew or system-ui), which has a completely different weight, line-height, and x-height from Bricolage Grotesque. The visual result is jarring: English UI renders in the brand font, Hebrew text in the system font.

**Fix:** Add an explicit Hebrew font using `next/font/google`:
```tsx
import { Heebo } from 'next/font/google';
// Heebo is the standard modern Hebrew sans-serif — similar proportions to Bricolage Grotesque
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-hebrew',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});
// In globals.css — apply conditionally:
[lang="he"] {
  --font-sans: var(--font-hebrew), system-ui, sans-serif;
  --font-mono: var(--font-hebrew), monospace; /* Hebrew has no mono variant — use sans */
}
```

**Why Heebo?** It's designed specifically to pair with Latin typefaces, has excellent weight range, and is widely used in Israeli apps. Alternatives: `Rubik` (rounder) or `Assistant` (more geometric).

**C. CSS uses physical properties instead of logical properties**

Throughout the app, layout uses `margin-left`, `padding-left`, `border-left`, `left: 0`, `text-align: left` — all of which do not flip in RTL. In Hebrew layout, these should be on the right side.

**Fix:** Replace physical properties with CSS logical properties:

```css
/* Before */
padding-left: var(--page-px);
margin-left: 8px;
border-left: 3px solid var(--terra);
text-align: left;

/* After — flips automatically in RTL */
padding-inline-start: var(--page-px);
margin-inline-start: 8px;
border-inline-start: 3px solid var(--terra);
text-align: start;
```

Key files to audit: `AppShell.tsx`, `DayScreen.tsx` (event card borders), `DashboardScreen.tsx` (insight cards), `NavBar.tsx` (tab layout), `Sheet.tsx` (close button position).

**D. Numbers and dates are not locale-formatted**

Date and number formatting is likely hardcoded as English. In Hebrew, dates should follow Israeli convention (DD/MM/YYYY) and numbers should use Hebrew numeral formatting where appropriate.

```typescript
// lib/format.ts — locale-aware formatters
export function fmtDate(date: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  }).format(new Date(date));
}

export function fmtCurrency(amount: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount);
}
```

**E. Input placeholder alignment**

HTML `<input>` and `<textarea>` elements need `dir="auto"` to correctly handle right-to-left placeholder text:
```tsx
// Field.tsx, PlacesInput.tsx, CountriesInput.tsx
<input dir="auto" placeholder={placeholder} ... />
```

`dir="auto"` lets the browser infer direction from the first typed character — so typing Hebrew starts RTL, typing English starts LTR. Essential for mixed-language inputs.

**F. The NavBar brand "Trippy." is hardcoded `direction: 'ltr'`**

`NavBar.tsx:69` — this is correct (the brand name stays LTR). But the tab labels should inherit RTL when in Hebrew: tabs should render right-to-left and the icon should appear on the right of the label text in RTL. Current layout uses `gap` between icon and text but doesn't reverse order.

```tsx
// NavBar.tsx — icon/label order flips with flexbox RTL
// When dir="rtl" is on <html>, flex-row automatically reverses, so the icon
// will naturally appear to the right of the label. No code change needed here
// as long as dir is on <html> correctly.
```

**G. Framer Motion animations use fixed directions**

Slide-in transitions use `x: 40` or `y: 40` — in RTL, a screen entering from the right should slide in from `x: -40`. The current enter/exit animations don't account for layout direction.

```tsx
// lib/motion.ts — direction-aware entrance
export function slideVariants(isRTL: boolean) {
  const dir = isRTL ? -1 : 1;
  return {
    initial: { opacity: 0, x: 32 * dir },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -32 * dir },
  };
}
```

**H. PDF export is hardcoded LTR**

`DashboardScreen.tsx` PDF export generates raw HTML with no `dir` attribute. Hebrew trip names and event names will render LTR in the exported PDF.

```typescript
// In handleExportPDF — add dir attribute
const html = `<!DOCTYPE html><html lang="${locale}" dir="${isRTL ? 'rtl' : 'ltr'}">...`;
```

---

### 9.2b Hebrew Brand Voice & Natural Language

This is about more than translation. Hebrew Trippy should feel like it was **written by a real Israeli trip planner** — warm, slightly informal, with a desert-and-adventure personality. Not corporate, not Google Translate.

**The personality:**
- **Casual and warm** — "יאללה, מתכננים?" not "ברוכים הבאים לאפליקציה"
- **Israeli slang where natural** — "יאללה" for "let's go / OK go", "סבבה" for "sounds good", "אחלה" for "excellent/nice"
- **Short and direct** — Hebrew is naturally more compact than English; use that. Don't pad.
- **Desert-forward** — the app's soul is exploration. Words like "מסע" (journey), "הרפתקה" (adventure), "גילוי" (discovery) feel more alive than "טיול" (trip) alone.
- **Group energy** — Israeli travel culture is deeply social. "הקבוצה", "החבר'ה", "כולנו" feel right.

**Before / After examples:**

| English | Generic Hebrew (current) | Brand Hebrew (proposed) |
|---------|--------------------------|-------------------------|
| "Plan. Explore. Experience." | "תכנן. חקור. חווה." | "יוצאים. מגלים. חיים את זה." |
| "Start New Trip" | "צור טיול חדש" | "יאללה, מסע חדש" |
| "Your Journey" | "המסלול שלך" | "ההרפתקה שלך" |
| "No upcoming events" | "אין אירועים קרובים" | "הכל פתוח — רגע טוב להוסיף עצירה?" |
| "Trip Insights" | "תובנות הטיול" | "מה קורה במסע" |
| "Get Suggestions" | "הצע" | "מה יש בסביבה?" |
| "Add Event" | "הוסף אירוע" | "הוסיפו עצירה" |
| "Tap to plan your day" | "לחץ על חריץ זמן…" | "הזמן שלכם — מה תשימו בו?" |
| "Budget on track" | "תקציב במסלול" | "הכסף מחזיק, יפה 👌" |
| "Trip is on track" | "הטיול במסלול הנכון" | "אחלה תכנון — יוצאים?" |
| "No notes yet" | "אין הערות עדיין" | "שמרו כאן מה שחשוב — קוד הזמנה, מספר טיסה, סיסמת WiFi" |
| "Loving the demo?" | "אוהב את ההדגמה?" | "שווה, נכון? שמרו את זה" |
| "Sign in to create a trip" | "התחבר כדי ליצור טיול" | "כנסו ותתחילו לתכנן — חינם לגמרי" |
| "Day X has free time" | "ביום X יש זמן פנוי" | "יום X פתוח — AI יכול להציע משהו" |

**Principles for writing new Hebrew strings:**

1. **Prefer active verbs over nouns:** "יוצאים" (going out) > "יציאה" (departure)
2. **Use second-person plural when addressing the group:** "מה תרצו לעשות?" > "מה תרצה?"
3. **Exclamation points are Israeli-natural** — use them on success states: "נוסף! ✓" not just "נוסף ✓"
4. **Emoji are part of the voice** — Hebrew informal writing uses them freely; so should Trippy
5. **"אתם" not "אתה"** — the app is for groups; address the group
6. **Desert-brand words to use:** מסע, הרפתקה, גילוי, עצירה (stop/waypoint), מסלול, שביל, אופק
7. **Words to avoid:** "משתמש" (user — too corporate), "פעולה" (action), "מערכת" (system), "נתונים" (data)

**Onboarding copy example (full brand voice):**
```
Slide 1: "יאללה, מתכננים"
         "כל מסע מתחיל בנקודה אחת.
          Trippy עוזר לכם לאסוף את כולן."

Slide 2: "הקבוצה מתכננת ביחד"
         "כולם רואים, כולם מוסיפים.
          בלי וואטסאפ, בלי בלגן."

Slide 3: "יוצאים? יאללה"
         "הכל במקום אחד —
          לוחות זמנים, תקציב, ציוד."

CTA: "בואו נתחיל"
```

**Toast messages in brand voice:**
```typescript
// Hebrew brand toasts
eventAdded:    'עצירה נוספה! ✓',
eventRemoved:  'עצירה הוסרה',
itemAdded:     'פריט נוסף לציוד ✓',
nicknameUpdated: 'שם עודכן, יאללה',
linkCopied:    'הקישור מוכן — שלחו לחבר\'ה ✓',
inviteSent:    'ההזמנה בדרך ✓',
tripUpdated:   'הטיול עודכן ✓',
```

---

### 9.3 Missing Translations

The following UI strings appear to not have Hebrew equivalents in `i18n.tsx` (keys that exist in `en` but are absent or identical in `he`):
- All the new keys added for V2 features need Hebrew equivalents from launch
- AI suggestion output from Claude is in English — when locale is `he`, the Claude prompt should request Hebrew output: add `"Respond in Hebrew."` to the system prompt when `locale === 'he'`
- Error messages from the API (`error: 'Not a participant'`, etc.) are English-only — these surface in toasts

---

### 9.4 Hebrew Support Implementation Checklist

```
□ Add locale cookie (set in I18nProvider, read in layout.tsx)
□ Set dir + lang on <html> server-side from cookie
□ Add Heebo font via next/font/google
□ Add [lang="he"] CSS rule to override --font-sans
□ Replace margin-left/right with margin-inline-start/end in:
  □ AppShell.tsx
  □ DayScreen.tsx (event card left-border stripe)
  □ DashboardScreen.tsx (insight card borders)
  □ NavBar.tsx (desktop padding)
  □ Sheet.tsx (close button positioning)
□ Add dir="auto" to all <input> and <textarea> elements
□ Add locale-aware fmtDate(), fmtCurrency() in lib/format.ts
□ Fix Framer Motion enter/exit animations to respect RTL direction
□ Fix PDF export dir attribute
□ Add Hebrew to Claude prompt when locale === 'he'
□ Audit ::placeholder CSS — should use text-align: start
□ Test: select Hebrew in Settings → every screen should mirror correctly
```

---

## 10. WORLD CLOCK

### 10.1 Why This Matters

Trippy has no concept of timezones. Every event time is displayed in the device's local timezone with no labeling. For a trip from Tel Aviv to Tokyo:
- "Flight at 22:00" — 22:00 where? Departure city? Destination? Device timezone?
- A collaborator in New York planning the same trip sees the same "22:00" — but their local time is 6 hours behind
- Meeting someone at "10:00 Day 3" — what timezone are we talking about?

This is a real source of trip planning confusion and a source of missed events.

### 10.2 Proposed Implementation

**A. Per-event timezone metadata**

When a user adds an event with a location (via PlacesInput), automatically resolve and store the timezone of that location:

```typescript
// Extend TripEvent type:
interface TripEvent {
  // ... existing fields
  timezone?: string;  // IANA timezone string: "Asia/Tokyo", "Europe/Paris"
  localTime?: string; // "09:00" in event's local timezone (stored separately from display)
}
```

The timezone is resolved via the Google Time Zone API when coordinates are available:
```
GET https://maps.googleapis.com/maps/api/timezone/json
  ?location={lat},{lng}&timestamp={unix_timestamp}&key={key}
```

This API call is triggered **only once** when a location is first geocoded — not on every render. The result is stored on the event.

**B. World Clock Widget**

A new `WorldClockWidget` component, displayed on the Dashboard when a trip spans multiple timezones:

```
┌──────────────────────────────────────────┐
│  🕐 WORLD CLOCK                          │
│  ──────────────────────────────────────  │
│  📍 Your Location    Tel Aviv            │
│     21:34 Mon          UTC+3             │
│                                          │
│  ✈  Destination      Tokyo              │
│     03:34 Tue          UTC+9             │
│                                          │
│  🏠 Home Timezone    New York  (Alex)    │
│     14:34 Mon          UTC-4             │
└──────────────────────────────────────────┘
```

The widget shows:
1. **Your device timezone** — always shown
2. **Trip destination timezone** — resolved from the trip's `countries` / `dayMeta.lat/lng` data already in the store
3. **Collaborators' timezones** — if trip members are in different timezones, show their current local time (requires storing timezone in user profile — a new `user_preferences` Supabase column: `home_timezone: string`)

**C. Event time display with timezone badge**

When displaying an event whose timezone differs from the device timezone, show a small timezone badge:

```
[🍜] Ramen at Ichiran
     19:00 – 20:30  📍 Shinjuku
     🕐 JST (your time: 13:00 IST)   ← only shown when timezone differs
```

This is not always-visible — only appears when there's a mismatch. Declutters the default view.

**D. Time zone conversion when adding events**

When a user adds an event while in their home timezone for a future trip in a different timezone, show a small helper:
```
Time: [19:00]  📍 Tokyo  → That's 13:00 in your timezone (IST)
```

**E. "Current local time" indicator in Day view**

The Day timeline `DayTimelineView` has a current-time indicator line. This should show the time in the **trip's timezone**, not the device timezone. Add a small label: `NOW — 14:32 JST`.

### 10.3 Implementation Notes

- **Timezone resolution:** Google Time Zone API is cheap ($5 per 1000 requests, most trips need <10 calls). Call once per new location, cache on the event.
- **Display library:** Use `Intl.DateTimeFormat` with `timeZone` option — no library needed, built into all modern browsers:
  ```typescript
  const localTime = new Intl.DateTimeFormat('en', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: event.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(eventDate);
  ```
- **Store change:** Add `homeTimezone: string` to the `AppState` — auto-detected on app init via `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- **No breaking changes** — timezone display is purely additive. Events without timezone data continue to show without the badge.

---

## 11. BETTER TRAVEL TIME CALCULATION

### 11.1 Current Implementation Audit

**What works:**
- Google Distance Matrix API (`/api/route-time`) returns driving, walking, and transit times
- 3 modes fetched in parallel
- 5-minute server-side cache (`revalidate: 300`)
- `RouteConnector` component in `DayScreen` displays the result between events with coordinates

**What's broken or suboptimal:**

**A. N+1 API calls — one request per adjacent event pair**

A day with 6 events with coordinates fires 5 separate calls to `/api/route-time`. Each call fetches 3 modes × 1 API request = 5 calls × 3 = 15 Distance Matrix requests per day load.

The Google Distance Matrix API supports **batched requests**: one call can compute distances for multiple origin/destination pairs simultaneously:
```
origins=A|B|C|D|E&destinations=B|C|D|E|F
```

**Fix:** Batch all pairs in one request per day:
```typescript
// api/route-time/batch/route.ts — new endpoint
// Body: { pairs: [{olat, olng, dlat, dlng}][] }
// Returns: { results: RouteResult[] }
// One Distance Matrix call for all pairs in the day
```

**B. No time-of-day awareness (rush hour)**

The Distance Matrix API supports a `departure_time` parameter. A 10km city drive takes 12 minutes at 2pm but 45 minutes at 8am rush hour. Currently all route estimates ignore departure time.

```typescript
// In fetchMode(), add departure_time for driving mode:
if (mode === 'driving') {
  const depTime = Math.floor(eventStartTimestamp / 1000); // Unix timestamp
  url.searchParams.set('departure_time', String(depTime));
  url.searchParams.set('traffic_model', 'best_guess'); // or 'pessimistic' for safety
}
```

This makes driving estimates dramatically more accurate for city trips (Tel Aviv, Tokyo, Paris, NYC).

**C. No smart mode recommendation**

The connector currently shows all 3 modes and the user must decide. But the app has enough context to recommend a mode:

```typescript
function recommendMode(event1: TripEvent, event2: TripEvent, distanceKm: number): 'driving' | 'walking' | 'transit' {
  if (distanceKm < 1.2) return 'walking';
  if (event1.category === 'flight' || event2.category === 'flight') return 'driving';
  if (distanceKm > 50) return 'driving';
  // In cities with good transit, prefer transit for medium distances
  if (distanceKm < 15 && event2.category !== 'hotel') return 'transit';
  return 'driving';
}
```

Display the recommended mode prominently and the others collapsed in a "see other options" expand.

**D. No client-side result caching**

The server caches for 5 minutes, but the client re-fetches on every mount of `DayScreen`. Navigating Dashboard → Day → Dashboard → Day makes 2 identical requests within seconds.

```typescript
// lib/routeCache.ts
const routeCache = new Map<string, { data: RouteResult; ts: number }>();
const ROUTE_TTL = 15 * 60 * 1000; // 15 min client-side cache

export function getCachedRoute(key: string) { ... }
export function setCachedRoute(key: string, data: RouteResult) { ... }
```

**E. No consideration of transport category on events**

If an event has `category: 'flight'`, the travel time to the airport is already in the trip (Drive to Airport event). Showing another "route time" connector after a flight event doesn't make sense — the next connector should start from the destination airport.

If `event1.category === 'flight'` and `event2` has no coordinates, or the coordinates are the arrival airport, skip the route-time call entirely.

**F. Endpoint is completely unauthenticated**

Any external script can call `/api/route-time` indefinitely, burning your Google Maps quota. Add the same auth check as all other routes.

### 11.2 Improved Architecture

```
DayScreen mounts
  → collectAllEventPairs(day.events) → filter pairs with both coords
  → check clientCache for each pair
  → for uncached pairs: one batch POST to /api/route-time/batch
    → server: single Distance Matrix call with all pairs, departure_time aware
    → response: all pairs' results in one payload
  → update clientCache
  → distribute results to RouteConnector components via context or prop drilling
```

**Estimated API cost reduction:** 5 individual calls → 1 batched call = **80% fewer Google API requests per day view**.

### 11.3 UX Improvements to RouteConnector

```
Current:  🚗 22min  🚶 45min  🚌 18min
                                        ← all modes equal weight, user confused

Improved: 🚌 18min  (recommended for 4.2km city)
          ↳ 🚗 22min · 🚶 45min         ← secondary, collapsed

Walking:  🚶 8min   (recommended for 0.7km)
          ↳ 🚗 5min  (if you have a car) ← only shown if relevant

Flight:   ✈ In-flight                   ← no connector shown (event is a flight)
```

Also: add **"Move earlier to avoid overlap"** CTA directly on the connector when travel time + start time = conflict with next event.

---

## 12. BETTER EFFECTS & MOTION

### 12.1 Current State Audit

The app uses Framer Motion well in several places (NavBar pill transition, screen enter/exit, trip entry animation) but has significant gaps and inconsistencies.

**What's good:**
- NavBar pill spring (stiffness 500, damping 35) — snappy and correct
- Screen transitions (y offset + opacity) — functional
- TripEntryAnimation — high quality, branded moment
- Toast slide-in — clean

**What's missing or poor:**

### 12.2 Issues & Fixes

**A. All Framer Motion is the full bundle (LazyMotion not used)**

As noted in §4, the full Framer Motion import is ~25kb gzipped extra in the initial bundle. Every `motion.div` in the app loads the full engine including layout animations, drag, 3D transforms — none of which are needed on initial load.

**Fix:** Migrate to `LazyMotion + m` (see §4.3 ME-1 for full code).

**B. No centralized motion tokens — every component hard-codes springs**

Springs are scattered:
- NavBar pill: `stiffness: 500, damping: 35`
- Some cards: `stiffness: 340, damping: 30`
- TripEntry: custom values inline
- Sheet: different values again

This makes the app feel inconsistent — different parts of the UI respond at different speeds with no coherent personality.

**Fix — `lib/motion.ts`:**
```typescript
export const spring = {
  // Snappy — for indicators, active states, pills
  snap:    { type: 'spring', stiffness: 520, damping: 38 } as const,
  // Default — for cards, list items, most transitions
  default: { type: 'spring', stiffness: 380, damping: 40 } as const,
  // Gentle — for overlays, modals, sheets
  gentle:  { type: 'spring', stiffness: 260, damping: 34 } as const,
  // Float — for decorative elements, background animations
  float:   { type: 'spring', stiffness: 180, damping: 22 } as const,
};

export const duration = {
  instant: 0.10,  // color swaps, active border
  fast:    0.18,  // hover, small state changes
  normal:  0.26,  // opacity fades, page elements
  slow:    0.45,  // progress bars, number counters
  enter:   0.80,  // trip entry, first-view reveals
};

export const stagger = {
  fast:   { staggerChildren: 0.04, delayChildren: 0.02 },  // compact lists
  normal: { staggerChildren: 0.07, delayChildren: 0.05 },  // day cards
  slow:   { staggerChildren: 0.12, delayChildren: 0.08 },  // hero reveals
};
```

**C. Screen transitions are too slow and too simple**

Current screen change: opacity fade only, sometimes a y-translate. On mobile, this feels sluggish and flat compared to native apps.

**Fix — directional screen transitions:**
```typescript
// lib/motion.ts
export const screenVariants = {
  // Forward navigation (Dashboard → Day)
  enterForward:  { opacity: 0, x:  24, filter: 'blur(4px)' },
  // Back navigation (Day → Dashboard)
  enterBackward: { opacity: 0, x: -24, filter: 'blur(4px)' },
  visible:       { opacity: 1, x:   0, filter: 'blur(0px)',
                   transition: spring.default },
  exitForward:   { opacity: 0, x: -24, filter: 'blur(4px)' },
  exitBackward:  { opacity: 0, x:  24, filter: 'blur(4px)' },
};
```

Track navigation direction in the store (`navDirection: 'forward' | 'back'`) and use the correct variants. The blur adds a soft depth-of-field effect — it's subtle (4px) and fast, making transitions feel spatial.

**D. No scroll-linked animations**

The Dashboard's hero section (trip name, countdown, weather) should subtly compress and fade as the user scrolls down — giving a sense of depth and focus shift.

```tsx
// In OverviewScreen — hero parallax on scroll
import { useScroll, useTransform } from 'framer-motion';

const { scrollY } = useScroll({ container: scrollRef });
const heroScale    = useTransform(scrollY, [0, 120], [1,    0.96]);
const heroOpacity  = useTransform(scrollY, [0,  80], [1,    0.5]);
const heroBlur     = useTransform(scrollY, [0, 120], [0,    6]);

<m.div style={{ scale: heroScale, opacity: heroOpacity,
                filter: useTransform(heroBlur, v => `blur(${v}px)`) }}>
  {/* Trip hero card */}
</m.div>
```

**E. No "pulse" animation on new collaborative events**

When a collaborator adds an event and the store updates, the new event card just appears. It should pulse — a brief glow or scale bounce — to communicate "something just happened here."

```tsx
// EventCard — detect when it's a brand-new event
const [isNew, setIsNew] = useState(event.isNew ?? false);
useEffect(() => {
  if (isNew) {
    const t = setTimeout(() => setIsNew(false), 2000);
    return () => clearTimeout(t);
  }
}, [isNew]);

// In render:
<m.div
  animate={isNew ? {
    boxShadow: ['0 0 0 rgba(196,113,74,0)', '0 0 20px rgba(196,113,74,0.6)', '0 0 0 rgba(196,113,74,0)'],
  } : {}}
  transition={{ duration: 1.2, ease: 'easeOut' }}
>
```

**F. CompassLoader should have a "completion bloom" animation**

When the loader completes (trip data arrives), the CompassLoader should bloom outward and fade — not just disappear. Currently it cuts off instantly.

```tsx
<AnimatePresence>
  {isLoading && (
    <m.div
      key="loader"
      exit={{ scale: 1.4, opacity: 0, filter: 'blur(12px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <CompassLoader />
    </m.div>
  )}
</AnimatePresence>
```

**G. Buttons lack a proper press ripple**

`whileTap={{ scale: 0.95 }}` is everywhere but it's the same for every button. Primary CTAs (terra-colored) should have a radial ripple effect:

```tsx
// GlassBtn.tsx — add ripple
const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

const handlePointerDown = (e: React.PointerEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  setTimeout(() => setRipple(null), 500);
};

// In render — inside the button:
{ripple && (
  <m.div
    key={`${ripple.x}-${ripple.y}`}
    initial={{ scale: 0, opacity: 0.35 }}
    animate={{ scale: 3, opacity: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    style={{
      position: 'absolute',
      width: 40, height: 40,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.6)',
      left: ripple.x - 20, top: ripple.y - 20,
      pointerEvents: 'none',
    }}
  />
)}
```

**H. Glass surfaces are static — no dynamic blur response**

The glass cards currently have a fixed `backdrop-filter: blur(12px)`. On iOS 26 / Liquid Glass principle, the blur intensity can subtly respond to scroll depth or content density:

```css
/* Deeper into the page = slightly stronger blur (more content "beneath") */
.glass-card {
  --blur-base: 12px;
  backdrop-filter: blur(var(--blur-amount, var(--blur-base))) saturate(1.4);
}
```

Update `--blur-amount` via a scroll listener to create a subtle depth-of-field effect as the user scrolls.

**I. Day card entrance stagger is missing section-level choreography**

Currently the day cards stagger individually. The Dashboard should have a section-level reveal order: hero → next event → weather strip → insights → days grid, each section entering 60–100ms after the previous.

```tsx
// OverviewScreen — wrap each section in a motion container
const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { ...spring.gentle, delay: i * 0.07 },
  }),
};

// Apply to sections with custom={sectionIndex}:
<m.div variants={sectionVariants} custom={0}>Hero</m.div>
<m.div variants={sectionVariants} custom={1}>Next Event</m.div>
<m.div variants={sectionVariants} custom={2}>Weather</m.div>
<m.div variants={sectionVariants} custom={3}>Days Grid</m.div>
```

---

## 13. NATIVE APP FEEL ON WEB

### 13.1 What "Native Feel" Means

A native iOS/Android app has behaviors that web apps traditionally don't: momentum scrolling, scroll snap, swipe navigation, long-press context menus, haptic feedback, no text selection on press, no grey tap flash, no rubber-band artifacts, no visible scrollbars, gesture thresholds that feel calibrated. Every missing piece reminds the user "this is a website."

Trippy is a PWA targeting mobile-first use. This section covers every layer of native feel.

### 13.2 Touch & Interaction Baseline

**A. Remove iOS tap highlight (the grey flash on press)**
```css
/* globals.css */
* {
  -webkit-tap-highlight-color: transparent;
}
```

**B. Prevent text selection on non-text interactive elements**
```css
button, [role="button"], nav, .card, .event-row {
  user-select: none;
  -webkit-user-select: none;
}
```

**C. Remove tap delay on older browsers**
```css
button, a, [role="button"], input, select, textarea {
  touch-action: manipulation; /* eliminates 300ms tap delay */
}
```

**D. Momentum scrolling for all scrollable containers**
```css
.scroll-container, [data-scroll], .day-list, .supplies-list {
  -webkit-overflow-scrolling: touch; /* legacy, but still relevant for WKWebView */
  overscroll-behavior-y: contain;   /* prevent page scroll leak */
  scroll-behavior: smooth;          /* smooth programmatic scrolls */
}
```

**E. Custom scrollbar (hide on mobile, style on desktop)**
```css
/* Hide scrollbar on mobile — scrolling should feel gestural, not scrollbar-driven */
@media (max-width: 768px) {
  ::-webkit-scrollbar { display: none; }
  * { scrollbar-width: none; }
}

/* Styled on desktop */
@media (min-width: 769px) {
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--terra-muted); border-radius: 2px; }
}
```

**F. Terra-colored text selection**
```css
::selection {
  background: rgba(196, 113, 74, 0.2);
  color: var(--text);
}
```

### 13.3 Scroll Behavior

**A. Scroll snap for Day-to-Day navigation**

Currently the day strip is a scrolling `<div>` with no snap points. When swiping to see the next/previous day button, the strip scrolls freely. Add scroll snap:

```css
.day-strip {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.day-strip .day-button {
  scroll-snap-align: center;
}
```

Also: when `activeDay` changes, auto-scroll the strip to center the active day:
```tsx
// DayStrip — currently missing this
useEffect(() => {
  const activeBtn = stripRef.current?.querySelector(`[data-day="${activeDay}"]`);
  activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}, [activeDay]);
```

**B. Overscroll behavior to prevent page pull-down artifact**

On iOS PWA, overscrolling a list can accidentally trigger browser-level refresh or navigation. Contain overscroll:
```css
.app-shell, .screen-container {
  overscroll-behavior: contain;
}
html, body {
  overscroll-behavior: none; /* prevent rubber-banding on the root */
}
```

**C. Bottom sheet drag with native feel**

`Sheet.tsx` already implements drag-to-dismiss via Framer Motion's `drag="y"`. Ensure:
1. The sheet has `overscroll-behavior-y: contain` so inner scroll doesn't accidentally dismiss
2. The drag constraint uses `dragElastic: 0.2` for a rubber-band feel at the top (you can't drag up past the resting position)
3. Velocity threshold is 500 (not pixel threshold) — dismissal should feel gestural, not positional

```tsx
// Sheet.tsx
<m.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={{ top: 0.15, bottom: 1 }}
  onDragEnd={(_, info) => {
    if (info.offset.y > 80 || info.velocity.y > 500) onClose();
  }}
>
```

### 13.4 Swipe Navigation Between Tabs

Currently only the Day-to-Day swipe is implemented. The main tabs (Dashboard, Day, Supplies, Settings) should be swipe-navigable:

```tsx
// AppShell.tsx — add horizontal swipe between tabs
const SCREEN_ORDER: Screen[] = ['dashboard', 'day', 'supplies', 'settings'];

const handleSwipe = (dx: number, dy: number) => {
  if (Math.abs(dx) < Math.abs(dy) * 1.5) return; // ignore mostly vertical swipes
  if (Math.abs(dx) < 40) return; // minimum gesture distance
  const currentIdx = SCREEN_ORDER.indexOf(screen);
  if (dx < 0 && currentIdx < SCREEN_ORDER.length - 1) setScreen(SCREEN_ORDER[currentIdx + 1]);
  if (dx > 0 && currentIdx > 0) setScreen(SCREEN_ORDER[currentIdx - 1]);
};
```

Use Framer Motion's `useDrag` or the existing `onPointerDown/Move/Up` pattern already in `DayScreen` for day navigation.

### 13.5 Long-Press Context Menus

Native apps universally support long-press for context actions. Implement for:
- **Trip cards** (long press → context menu: Open, Pin/Unpin, Share, Delete)
- **Event rows** (long press → context menu: Edit, Move Day, Duplicate, Delete)
- **Supply items** (long press → context menu: Mark Critical, Assign, Delete)

```tsx
// hooks/useLongPress.ts
export function useLongPress(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const start = () => {
    timerRef.current = setTimeout(() => {
      onLongPress();
      // Haptic feedback
      if ('vibrate' in navigator) navigator.vibrate(30);
    }, delay);
  };
  const cancel = () => clearTimeout(timerRef.current);

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
  };
}
```

The context menu itself is a bottom sheet (not a popover) — more natural on mobile.

### 13.6 Haptic Feedback

The Web Vibration API (`navigator.vibrate()`) is supported in Chrome/Android. iOS PWA does not support it. Use it as progressive enhancement:

```typescript
// lib/haptics.ts
export const haptics = {
  soft:    () => navigator.vibrate?.(10),       // add to cart, select item
  medium:  () => navigator.vibrate?.(25),       // confirm, save
  heavy:   () => navigator.vibrate?.(50),       // delete, destructive action
  success: () => navigator.vibrate?.([10,20,10]), // pattern: success burst
  error:   () => navigator.vibrate?.([50,30,50]), // pattern: error shake
};
```

Apply across the app:
- `haptics.soft()` → tap nav tab, add supply item
- `haptics.medium()` → save event, confirm edit
- `haptics.heavy()` → delete event, leave trip
- `haptics.success()` → trip created, invitation sent
- `haptics.error()` → form validation error, network failure

### 13.7 Pull-to-Refresh

On mobile, users expect pull-down to refresh. On the Dashboard, pulling down should reload the trip data:

```tsx
// DashboardScreen — pull-to-refresh
const [pullY, setPullY] = useState(0);
const [isRefreshing, setIsRefreshing] = useState(false);
const PULL_THRESHOLD = 80;

// Detect pull-down gesture on the scroll container
// When pullY > PULL_THRESHOLD: trigger loadTripById, haptics.medium()
// Show a small CompassLoader spinning at the top during refresh
```

### 13.8 Keyboard Avoidance (Comprehensive)

The `Sheet.tsx` component already uses `visualViewport` to shift up when the keyboard appears. But `AddEventSheet`, `NotesScreen`, and expense forms don't. All bottom-anchored forms need the same treatment:

```tsx
// hooks/useKeyboardAvoidance.ts
export function useKeyboardAvoidance() {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, []);

  return keyboardOffset;
}
```

Apply `paddingBottom: keyboardOffset` to any bottom-anchored input sheet.

### 13.9 Native-Feel Checklist

```
□ -webkit-tap-highlight-color: transparent globally
□ user-select: none on all interactive non-text elements
□ touch-action: manipulation on all buttons/inputs
□ overscroll-behavior: contain on scroll containers
□ overscroll-behavior: none on html/body
□ Scroll snap on day strip
□ Auto-scroll day strip to active day on change
□ Hide scrollbars on mobile, style on desktop
□ Custom ::selection color (terra-tinted)
□ Swipe-left/right to navigate between main tabs
□ Long-press context menus on trip cards, event rows, supply items
□ useLongPress hook with 30ms haptic vibration
□ lib/haptics.ts with soft/medium/heavy/success/error patterns
□ Pull-to-refresh on Dashboard (CompassLoader spinner at top)
□ useKeyboardAvoidance hook applied to all bottom-anchored forms
□ Sheet.tsx dragElastic + velocity threshold dismissal
□ Directional screen transitions (slide from correct side)
```

---

---

## 14. NEXT-LEVEL INNOVATIONS — FEATURES NO OTHER TRAVEL APP HAS

> These features are not incremental improvements. Each one is a **category-defining differentiator** — the kind of thing that ends up in product teardowns, goes viral, and defines what Trippy *is* vs. what every other trip planner does.

---

### INNOVATION 1 — "Swipe to Decide" Group Mode

**The problem:** Group trip planning always ends in someone saying "whatever you want" and someone else silently resentful about the restaurant choice. WhatsApp polls are clunky, voting buttons in the itinerary feel formal.

**The idea:** When a time gap exists in the itinerary, any member can tap "Decide Together." The app generates 5 activity cards for that gap using Claude (same AI suggestions engine, already built). Each member independently swipes right (yes) or left (no) on each card — privately, without seeing others' votes. When all members have swiped, the app reveals a **match card**: shows which activity everyone agreed on with a celebratory animation, or if no full match, ranks by total votes with the top pick highlighted.

It's Tinder for trip planning — and it's genuinely fun.

```
┌─────────────────────────────────┐
│  DECIDE TOGETHER                │
│  Gap: 14:00–17:00, Day 3        │
│  ─────────────────────────────  │
│  ┌───────────────────────────┐  │
│  │  🏯 Osaka Castle          │  │
│  │  ★ 4.6  · 2.5km away      │  │
│  │  ~2 hours · Free entry    │  │
│  │                           │  │
│  │  [✕  SKIP]  [♥  YES]     │  │
│  └───────────────────────────┘  │
│                                  │
│  Waiting: Alex ✓  You ✓  Sam…   │
│  Sam is deciding...              │
└─────────────────────────────────┘

→ MATCH! Everyone wants Osaka Castle 🎉
```

**APIs needed:** Anthropic Claude (existing), Google Places (existing)  
**New infrastructure:** `wishlist_decisions(trip_id, gap_id, user_id, activity_id, vote, created_at)` Supabase table + Realtime subscription  
**Complexity:** Medium (3-5 days)  
**Why it's unique:** No other travel app has this. Wanderlog, TripIt, Google Trips — none of them. This is a feature journalists write about.

---

### INNOVATION 2 — AI Trip Narrator (Living Journal)

**The problem:** You come home from a trip and all you have is a list of event names and timestamps. The memories fade. Sharing the trip with someone who wasn't there means reading a dry schedule.

**The idea:** After a trip (or at any point), tap "Write My Story." Claude receives the full trip — every event, day notes, destination, country, weather for each day, and any notes written — and generates a beautifully written **travel narrative** in the user's chosen style: "Field Journal" (terse, explorer), "Personal Essay" (reflective), "Group Chronicle" (third-person, funny), or "Social Caption Pack" (8 Instagram captions, one per highlight).

The output is shown in a beautiful reading view (Newsreader font, desert-toned cards) and exportable as a styled PDF or shareable link.

```typescript
// /api/ai/narrate/route.ts
const prompt = `You are a travel writer. Transform this itinerary into a 
${style} narrative. Write in ${locale === 'he' ? 'Hebrew' : 'English'}.
Trip: ${tripName}, ${countries.join(', ')}
Days: ${days} days, ${totalEvents} events
Weather highlights: ${weatherSummary}
Day-by-day itinerary:
${formattedItinerary}
Day notes from travelers:
${tripNotes.join('\n')}

Write a vivid, engaging story. Use sensory details. Make it feel like the 
reader was there. Keep it under 800 words.`;
```

**Style options:**
- 📓 **Field Journal** — short, punchy, explorer voice
- ✍️ **Personal Essay** — reflective, emotional, first-person  
- 🗞 **Group Chronicle** — fun third-person: "The crew woke to desert heat..."
- 📱 **Social Pack** — 8 captions + hashtag sets, one per trip highlight

**APIs needed:** Anthropic Claude (existing)  
**Complexity:** Low-Medium (2-3 days)  
**Why it's unique:** This turns Trippy from a planning tool into a **memory preservation platform**. It's the feature users show their family. It creates emotional attachment to the app that purely functional tools never achieve.

---

### INNOVATION 3 — Trip DNA Card (Shareable Visual Fingerprint)

**The problem:** Spotify Wrapped went viral because it turned listening data into a beautiful shareable story. Nobody does this for travel.

**The idea:** At any point, a user can generate their **Trip DNA** — a beautiful, branded visual card that encodes the personality of the trip into a unique visual identity. It's generated entirely client-side (no backend needed) using Canvas API.

The card shows:
- A unique "gene sequence" visualization — bars whose height = events per day, color = category distribution
- **Trip personality type** (calculated from the trip's event category mix): "Adventure-First 🏔", "Food Pilgrim 🍜", "Culture Vulture 🎨", "Night Owl 🦉", "Efficient Explorer ⚡"
- Key stats in a beautiful grid: km traveled, countries, events, days, total hours planned
- **A unique trip color palette** — extracted from the destination country flags or weather data
- The Trippy compass logo watermark

```
╔══════════════════════════════════════╗
║  TRIPPY DNA                          ║
║  Tokyo Adventure · Jun 2026          ║
╠══════════════════════════════════════╣
║                                      ║
║  ▄▄▃▄▄▅▄▃▄▄▄▅▄▃▄▄▄▅▄▃▄▄▄▅          ║  ← gene bars per day
║                                      ║
║  🏔 ADVENTURE-FIRST                  ║
║  "You move fast, pack it in,         ║
║   and sleep when you're home."       ║
╠══════════════════════════════════════╣
║  3,847 KM  ·  47 STOPS  ·  13 DAYS  ║
║  ████ Culture  ██ Food  █ Rest       ║
║                                      ║
║              ◉ Trippy                ║
╚══════════════════════════════════════╝
```

Tapping "Share" opens the native share sheet with the card as an image. On iOS this goes directly to Instagram Stories, WhatsApp, iMessage.

**APIs needed:** None — Canvas API (browser built-in)  
**Complexity:** Medium (3-4 days, all client-side)  
**Why it's unique:** This is a **viral acquisition loop**. Every shared card is a Trippy ad. Nobody who sees "◉ Trippy" on a beautiful travel card won't want to make their own.

---

### INNOVATION 4 — Mood Replanning ("We're Tired")

**The problem:** Every travel planner assumes you'll execute the plan perfectly. Real trips don't work that way — it's 3pm, you're exhausted, and the next 4 hours of activities sound overwhelming.

**The idea:** A persistent "Today's Energy" button on the Day screen. Tap it and select your group's current energy level (1-5 battery icons). Claude instantly rebalances the remaining hours of the day to match that energy:

- **⚡⚡⚡⚡⚡ Energized** → Adds an extra stop from suggestions, tightens gaps, moves dinner later
- **🔋🔋🔋 Normal** → Keeps the plan as-is, just confirms it
- **🔋🔋 Low** → Cuts one activity (the lowest-voted), adds a 45-min "rest stop" (suggests a café with high ratings near the next event), moves dinner 30 min earlier
- **🔋 Exhausted** → Reschedules everything after the current time to "tomorrow or later," keeps only dinner, suggests the hotel check-in time if not already added

The result is shown as a diff: crossed-out items (removed), new items (added in green), unchanged items. One tap to accept.

```typescript
const moodPrompt = `The trip group is currently at energy level ${energy}/5.
Current time: ${currentTime}. Remaining events today: ${remainingEvents}.
Rebalance the afternoon to match this energy level.
- Energy 1-2: Remove 1-2 activities, add one rest stop, keep dinner
- Energy 3: Keep plan, optionally shift 30min
- Energy 4-5: Consider adding one more stop from nearby suggestions
Return a JSON diff of changes.`;
```

**APIs needed:** Anthropic Claude (existing)  
**Complexity:** Medium (3-4 days)  
**Why it's unique:** This is the first travel app that **adapts to how you feel in real time**. It treats the itinerary as a living document, not a contract.

---

### INNOVATION 5 — Contextual Language Cards

**The problem:** You arrive in Japan and you don't know how to order at a ramen counter. Google Translate is clunky. Phrasebook apps are disconnected from your actual itinerary.

**The idea:** For each event in the itinerary, Trippy automatically generates a **contextual language card** — a small expandable card showing the 3-5 most useful phrases for that specific event type, in the local language of the destination.

```
[🍜] Ramen at Ichiran     ← tap this card
  ─────────────────────────────────────────
  📖 USEFUL PHRASES — JAPANESE
  
  "One person, please"
  → 一人です (hitori desu)
  → [🔊 hear it]
  
  "I can't eat [pork]"  
  → 豚肉が食べられません (butaniku ga taberaremasen)
  
  "The bill, please"
  → お会計をお願いします (okaikei wo onegaishimasu)
  
  "This is delicious!"
  → おいしい！(oishii!)
  ─────────────────────────────────────────
```

Claude generates the phrases. A text-to-speech `<audio>` tag (Web Speech API, built into all browsers) plays the pronunciation. Cards are generated once when the event is first viewed and cached on the event object.

**Language coverage:** Claude handles all major tourist languages (Japanese, French, Spanish, Italian, German, Thai, Arabic, Mandarin, Korean, Portuguese, etc.).

**APIs needed:** Anthropic Claude (existing) + Web Speech API (browser built-in, free)  
**Complexity:** Low-Medium (2-3 days)  
**Why it's unique:** Language help that's **contextual to your specific itinerary** — not a generic phrasebook. The ramen counter card is different from the museum card which is different from the taxi card.

---

### INNOVATION 6 — Schedule Feasibility AI Scan

**The problem:** Users over-plan without realizing it. Day 4 has 7 activities, 60km of driving, a museum that takes 3 hours, and dinner at 7pm — but the timeline math doesn't work.

**The idea:** A one-tap "Sanity Check" button on any day (and on the full trip). Claude analyzes the **entire day holistically** and returns a visual feasibility report:

```
┌─────────────────────────────────────────┐
│  📋 DAY 4 SANITY CHECK                  │
│  ─────────────────────────────────────  │
│  ❌ PROBLEM: Arrival at Colosseum 09:30  │
│     Queue time: ~90min. Museum: 2h.     │
│     You'd leave at 13:00 — but Trevi   │
│     Fountain is 35min away and you     │
│     have lunch at 13:15. Impossible.   │
│                                         │
│  ❌ PROBLEM: 4:30pm gelato + 5:00pm     │
│     Vatican closes at 6pm. 30min walk.  │
│     You'd arrive at 5:30 — only 30min.  │
│                                         │
│  ✅ Morning is realistic (good pacing)  │
│  ✅ Dinner timing works                 │
│                                         │
│  🔧 AI CAN FIX THIS   [Apply fixes]    │
└─────────────────────────────────────────┘
```

The "Apply fixes" button sends the issues back to Claude, which returns a patched version of the day with events reordered/trimmed/moved. The diff sheet shows before/after — one tap accepts.

**Claude prompt includes:** event names, times, durations, locations, travel times between events (from the route-time cache), typical queue/wait times for attraction types, and day meta.

**APIs needed:** Anthropic Claude (existing) + cached route times (existing)  
**Complexity:** Medium (3-4 days)  
**Why it's unique:** No travel app does holistic day-level feasibility analysis. TripIt tracks bookings. Wanderlog suggests places. Nobody tells you "this day is mathematically impossible and here's the proof."

---

### INNOVATION 7 — Trip Time Capsule

**The problem:** The trip ends and the app becomes a graveyard. Users delete it or abandon it. The memories — all those notes, events, the weather on each day, the group dynamics — disappear.

**The idea:** When a trip's end date passes, Trippy shows a one-time prompt: "Your trip just ended. Want to seal it?" Sealing a trip creates a **Time Capsule** — a beautiful, immutable snapshot of the entire journey:

- Auto-generated trip narrative (§ Innovation 2 — AI Narrator)
- Interactive route replay: a line animates across a Mapbox map, tracing the route day by day, with event names popping up as timestamps
- Stats card: total km, countries, events, expenses, members, longest day, most expensive day, most popular event (most votes)
- A "Message to Future Self" field: write a note that unlocks in 1 year ("Open on Jun 12, 2027")
- Shareable as a public link: `trippy.app/memories/tokyo-2026-abc123`

The Time Capsule page is public-safe: no personal data, no booking references — just the narrative, the map, and the stats.

**APIs needed:** Mapbox GL JS (for animated route), Anthropic Claude (narrative), Supabase (read-only public share link)  
**Complexity:** High (5-7 days)  
**Why it's unique:** Transforms Trippy from a planning tool into a **travel memory platform**. Users share the capsule link forever. Each one is a permanent Trippy ad. The "open in 1 year" message is genuinely emotional and drives re-engagement.

---

### INNOVATION 8 — AI Conflict Mediator

**The problem:** One person votes up on the Louvre, another votes down. One person wants beach day, another wants history. Group dynamics cause avoidance instead of discussion.

**The idea:** When two or more members have conflicting votes on the same activity — or when the wishlist shows clear preference splits — Trippy detects the pattern and offers an AI Mediation:

```
┌─────────────────────────────────────────┐
│  🤝 FINDING MIDDLE GROUND               │
│                                         │
│  Alex loves: museums, art, history      │
│  Sam loves: food, markets, exploring    │
│                                         │
│  How about...                           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎨 Marché aux Puces de Clignancourt│  │
│  │ Antique market & flea market      │  │
│  │ Art + history + food stalls       │  │
│  │ ★ 4.4 · Half day · Free entry    │  │
│  └─────────────────────────────────┘   │
│                                         │
│  [Skip]   [Everyone vote →]            │
└─────────────────────────────────────────┘
```

Claude infers each member's preference profile from their voting history (which event categories they've upvoted/downvoted) and finds activities that overlap multiple preference vectors.

**APIs needed:** Anthropic Claude (existing) + Google Places (existing)  
**Complexity:** Medium (3 days — builds on existing vote infrastructure)  
**Why it's unique:** This is the first travel app that actively manages **group dynamics**, not just logistics. It replaces the awkward "I don't mind, whatever you want" with AI-facilitated compromise.

---

### INNOVATION 9 — "Surprise Day"

**The problem:** Some travelers don't want to plan — they want to be surprised. But they also want to make sure the surprise is good, fits their budget, and respects their time.

**The idea:** Any day in the trip can be designated as a **Surprise Day**. The trip owner (or all members by vote) sets parameters: budget, energy level, preference tags (outdoor/indoor, touristy/local, fast/slow). Claude builds the entire day in secret — nobody can see the events.

On the morning of the Surprise Day, events are **revealed one at a time**: the first event is unlocked when you tap "I'm ready." The second unlocks when the first is marked as done. And so on — like an escape room, but it's your city.

```
Day 5 — 🎁 SURPRISE DAY

Currently locked...

  [  REVEAL FIRST STOP  ]

  After you complete each stop,
  the next one unlocks.
  Trust the process. יאללה.
```

**APIs needed:** Anthropic Claude (existing) + Google Places (existing)  
**Complexity:** Low (2-3 days — mostly UI logic)  
**Why it's unique:** This is pure delight. It's the kind of feature that gets written up. "Travel app hides your own itinerary from you" is a headline. It also perfectly showcases the AI — making Claude the architect of a mystery experience.

---

### INNOVATION 10 — Local Persona Cards

**The problem:** Travel apps give you logistics. None of them tell you how to *be* in a place — how locals think, what's considered rude, what the unspoken rules are.

**The idea:** For each country in the trip, Trippy generates a **Local Persona Card** — a brief, human-written (by Claude) cultural guide that covers:
- **The vibe:** What do locals value? What's the social tempo?
- **Do / Don't:** 3 concrete dos, 3 concrete don'ts (specific, not generic)
- **At the table:** How dining works locally (ordering customs, tipping, what to say)
- **Getting around:** How locals actually navigate (apps they use, transport etiquette)
- **The phrase that changes everything:** One local phrase/concept that unlocks social acceptance

Cards appear in the Dashboard when a country is added to the trip, and contextually in the Day view when you enter a new country.

```
╔═══════════════════════════════════════╗
║  🇯🇵 JAPAN: LOCAL PERSONA             ║
╠═══════════════════════════════════════╣
║  THE VIBE                             ║
║  Quiet competence. Precision matters. ║
║  Punctuality is respect.              ║
║                                       ║
║  ✓ DO                                 ║
║  • Queue orderly — always             ║
║  • Bow slightly when thanking         ║
║  • Carry a small bag (cashless is new)║
║                                       ║
║  ✗ DON'T                              ║
║  • Talk on the phone on trains        ║
║  • Eat/drink while walking            ║
║  • Tip — it can cause confusion       ║
║                                       ║
║  THE PHRASE THAT CHANGES EVERYTHING   ║
║  "Sumimasen" (すみません)              ║
║  Use it for everything: excuse me,    ║
║  sorry, getting attention. Universal. ║
╚═══════════════════════════════════════╝
```

**APIs needed:** Anthropic Claude (existing)  
**Complexity:** Low (1-2 days — generates once per country, cached)  
**Why it's unique:** Gives Trippy a **travel culture layer** that no logistics app has. Rick Steves built a media empire on this insight. Claude can deliver it per-country, per-context, at zero marginal cost.

---

### INNOVATION 11 — Live Spending Pulse

**The problem:** You log expenses during the trip but only realize you're over-budget on day 5 of 7.

**The idea:** A persistent, ambient **spending pulse** on the Dashboard — not a widget you have to open, but a living indicator on the budget bar itself. It shows:
- **Burn rate:** You're spending X per day. At this rate: [you'll finish under/over by Y]
- **Projection line:** A small animated sparkline showing actual spend vs. ideal spend curve
- **"Pace" badge:** 🟢 On pace / 🟡 Running hot / 🔴 Over budget — calculated from (total spent / days elapsed) vs (total budget / total days)

When the pace badge turns yellow, a gentle notification: "You're spending 18% faster than planned. Today's budget for meals: [suggests amount]."

This is not an alert system — it's an **ambient financial awareness layer** that makes budget management feel natural, not punishing.

```
BUDGET                        🟡 Running Hot
████████████████░░░░░░    ₪ 3,240 / ₪ 4,800
                           Day 4 of 7 · +18% pace

Projected over budget by ₪ 290
→ Aim for ₪ 180/day to finish on track
```

**APIs needed:** None — pure calculation on existing expense data + exchange rates (both already in store)  
**Complexity:** Low (1-2 days — calculation + UI)  
**Why it's unique:** Most expense trackers are reactive ("you went over"). This is **predictive**. It tells you before you go over, while you can still change behavior.

---

### INNOVATION 12 — AI "What Could Go Wrong" Pre-Trip Briefing

**The problem:** You've planned everything, you're excited — but you haven't thought about what might actually go wrong. Most travelers discover problems at the airport.

**The idea:** 48 hours before a trip starts, Trippy runs an **automated pre-trip risk scan** (triggered by a push notification: "Your trip starts in 2 days — want a briefing?"). Claude reviews the entire itinerary and flags:

```
┌─────────────────────────────────────────┐
│  🔍 PRE-TRIP BRIEFING                   │
│  Tokyo Adventure · starts in 2 days     │
│  ─────────────────────────────────────  │
│  ⚠️ WORTH CHECKING                      │
│                                         │
│  • TeamLab Planets requires advance     │
│    booking — timed entry tickets.       │
│    → Book at teamlabplanets.com         │
│                                         │
│  • Day 2 has 4 walking events but       │
│    Jun 14 forecast: 34°C, high          │
│    humidity. Consider 1 indoor swap.    │
│                                         │
│  • Shinjuku → Asakusa on Day 3 at       │
│    08:30 = peak commute hour on JR.     │
│    Consider leaving at 09:15.           │
│                                         │
│  ✅ 3 things look great                 │
│  • Weather Days 1, 4, 5: perfect ☀     │
│  • Budget: you're well within range    │
│  • All days have a meal planned        │
│  ─────────────────────────────────────  │
│  [Dismiss]    [Act on suggestions]     │
└─────────────────────────────────────────┘
```

Claude generates this from: event types/names, weather forecast, day pacing, travel times, and general knowledge about attraction booking requirements.

**APIs needed:** Anthropic Claude (existing) + Weather API (existing)  
**Complexity:** Medium (3-4 days — trigger mechanism + prompt engineering)  
**Why it's unique:** Proactive trip intelligence. No other travel app sends you a "here's what could go wrong" briefing before departure. This is the kind of feature that makes travelers say "Trippy saved my trip."

---

### INNOVATION 13 — Ambient Trip Soundtrack (Spotify/Apple Music)

**The problem:** Music sets the mood of travel. But making a trip playlist is either random or requires effort.

**The idea:** Members can each add one song per day to a shared **Trip Playlist** — a running soundtrack that builds throughout the trip. Each day gets its own section: "Day 1 — Tel Aviv," "Day 2 — Osaka." The playlist appears as a card on the Day screen.

Additionally: Claude generates a "vibe description" for each day based on the itinerary (calm morning hike → intense city sightseeing → dinner) and suggests a **mood descriptor** ("This day has the energy of a morning run turning into a night out") which the user can paste into Spotify's search to find matching playlists.

For the brave: a Spotify API integration (OAuth, PKCE) lets Trippy create the playlist directly in Spotify and share it as a group collab playlist.

```
Day 3 — Shinjuku                    [▶ Play]
🎵 Alex:  "Tokyo Drift" (Teriyaki Boyz)
🎵 You:   "Midnight City" (M83)
🎵 Sam:   "Gold" (Chet Faker)
─────────────────────────────────────────
Vibe: "Fast, neon-lit, something to prove"
→ Open in Spotify
```

**APIs needed:** Spotify Web API (OAuth PKCE, free) — `https://developer.spotify.com/documentation/web-api`; or Apple MusicKit JS  
**Complexity:** Medium (4-5 days)  
**Why it's unique:** Travel apps are visual and logistical. Adding a **sonic layer** is entirely unexplored territory. The shared playlist becomes a musical souvenir — users listen to it months later and remember the trip.

---

### INNOVATION SUMMARY TABLE

| # | Feature | Wow Factor | Complexity | Viral Potential |
|---|---------|-----------|-----------|----------------|
| 1 | Swipe to Decide | ★★★★★ | Medium | ★★★★★ |
| 2 | AI Trip Narrator | ★★★★★ | Low-Med | ★★★★★ |
| 3 | Trip DNA Card | ★★★★★ | Medium | ★★★★★ |
| 4 | Mood Replanning | ★★★★☆ | Medium | ★★★☆☆ |
| 5 | Language Cards | ★★★★☆ | Low-Med | ★★★☆☆ |
| 6 | Feasibility Scan | ★★★★★ | Medium | ★★★★☆ |
| 7 | Trip Time Capsule | ★★★★★ | High | ★★★★★ |
| 8 | AI Conflict Mediator | ★★★★☆ | Medium | ★★★☆☆ |
| 9 | Surprise Day | ★★★★★ | Low | ★★★★★ |
| 10 | Local Persona Cards | ★★★★☆ | Low | ★★★★☆ |
| 11 | Live Spending Pulse | ★★★☆☆ | Low | ★★☆☆☆ |
| 12 | Pre-Trip Risk Briefing | ★★★★★ | Medium | ★★★★☆ |
| 13 | Trip Soundtrack | ★★★★☆ | Medium | ★★★★★ |

### IMPLEMENTATION WAVE (additive to existing roadmap)

**Ship first (highest wow / lowest effort):**
1. **Surprise Day** — 2-3 days, pure delight, headline feature
2. **Local Persona Cards** — 1-2 days, uses Claude (existing), no new infrastructure
3. **Live Spending Pulse** — 1-2 days, pure math on existing data
4. **Language Cards** — 2-3 days, uses Claude (existing), cached per event
5. **Trip DNA Card** — 3-4 days, all client-side Canvas

**Ship second (medium complexity, high virality):**
6. **AI Trip Narrator** — 2-3 days, uses Claude (existing)
7. **Swipe to Decide** — 3-5 days, new Supabase table + Realtime
8. **Mood Replanning** — 3-4 days, extends existing AI suggestions route
9. **Feasibility Scan** — 3-4 days, uses Claude + existing route-time cache
10. **AI Conflict Mediator** — 3 days, extends existing vote infrastructure

**Ship third (bigger builds):**
11. **Pre-Trip Risk Briefing** — 3-4 days + push notification trigger
12. **Trip Soundtrack** — 4-5 days + Spotify OAuth
13. **Trip Time Capsule** — 5-7 days + Mapbox animated replay

---

---

## 15. PRIORITY ACTION LIST

### Immediate (before anything else — Week 0)

- [ ] Apply RLS policies in Supabase dashboard (1 hour)
- [ ] Add Notes tab to NavBar `TABS` array (30 min)
- [ ] Fix participation check — remove `if (admin)` guard in events/expenses/supplies routes (2 hours)
- [ ] Fix invitation PATCH/DELETE ownership checks (1 hour)
- [ ] Fix open redirect in auth callback (30 min)
- [ ] Add auth + rate limiting to `/api/places` endpoints (1 hour)

### Week 1 — Security & Performance

- [ ] Migrate to `next/font` — remove all Google Fonts `<link>` tags (2 hours)
- [ ] Fix `Math.random()` in BackgroundScene renders — use `useMemo` (1 hour)
- [ ] Slice Zustand selectors in AppShell (2-3 hours)
- [ ] Fix `JSON.stringify` in useEffect deps (30 min)
- [ ] Replace `require()` with top-level import in store.ts (15 min)
- [ ] Replace in-memory rate limiter with Upstash Redis
- [ ] Fix `getSession()` → `getUser()` in lib/db.ts
- [ ] Add security headers to next.config.js

### Week 2 — Performance & UX Fixes

- [ ] Implement `LazyMotion` + `m` components (-20kb bundle)
- [ ] Add delta-based realtime updates (no full refetch on collaborator edits)
- [ ] Fix `--ink-2`/`--ink-3` CSS token references in SuggestionsSheet
- [ ] Fix dark mode loading overlay hardcoded color
- [ ] Add `aria-label` to all icon-only buttons
- [ ] Add `role="dialog"` + focus trap to Sheet.tsx
- [ ] Fix DayTimelineView clip at 07:00 (handle early-morning events)
- [ ] Fix `UpdateTripBody` schema mismatch (string vs string[])
- [ ] Implement account deletion email (Resend integration)

### Week 3-4 — Wave 1 Features

- [ ] AI Packing List Optimizer
- [ ] Expense Settlement Calculator
- [ ] Trip Stamps & Achievement Badges
- [ ] Carbon Footprint Dashboard Card (promote hidden logic)

### Week 5-10 — V2 Architecture Begins

- [ ] Split `DashboardScreen.tsx` into `OverviewScreen/` (7 components)
- [ ] Split `DayScreen.tsx` into `DaysScreen/` (6 components)
- [ ] Extract trip creation from LoginScreen → TripCreationWizard
- [ ] Add TripPickerScreen
- [ ] Split store into domain slices
- [ ] Add CrewScreen tab
- [ ] Centralize animation tokens in `lib/motion.ts`
- [ ] Add React error boundaries (all 3 levels)
- [ ] Add `withOptimistic` wrapper across all mutations
- [ ] Migrate `trip_events` to normalized table for fine-grained realtime

---

## APPENDIX: TECH STACK CONTEXT

| Layer | Current | V2 Recommended |
|-------|---------|----------------|
| Framework | Next.js 16.2.4 | Keep |
| React | 19.2.4 | Keep |
| State | Zustand v5 (1 monolithic store) | Zustand v5 (domain slices) |
| Styling | Tailwind v4 + CSS vars | Keep, formalize token system |
| Animation | Framer Motion v12 (full import) | Framer Motion v12 (LazyMotion) |
| Auth + DB | Supabase | Keep |
| Rate Limiting | In-memory Map (broken on serverless) | Upstash Redis |
| Fonts | 4x Google Fonts CDN `<link>` | next/font/google + next/font/local |
| Maps | None | Mapbox GL JS (free tier) |
| SMS | None | Twilio (Wave 3) |
| Booking | None | Viator Partner API (Wave 3) |
| OCR | None | Tesseract.js (client-side, free) |
| Push | PWA service worker (partial) | Complete VAPID + Supabase Edge Function cron |

---

*Report generated by 6 parallel AI agents: Architect · Security Engineer · Performance Engineer · Design Researcher · Product Manager · V2 Designer*
