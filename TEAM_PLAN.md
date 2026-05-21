# Trippy — Team Definitions & Full Action Plan

> This document defines each team, their responsibilities, and every step they must complete.
> Priority levels: **P0** = do it now (blocks launch) · **P1** = this sprint · **P2** = next sprint · **P3** = backlog.

---

## Table of Contents

1. [UX/UI Team](#1-uxui-team--maya--tom)
2. [Design Team](#2-design-team--lena-ari-zoe)
3. [Frontend Development Team](#3-frontend-development-team--dan--sara)
4. [Backend Development Team](#4-backend-development-team--oren--niv)
5. [Security Team](#5-security-team--rex--hana)

---

---

## 1. UX/UI Team — Maya & Tom

### Who We Are

The UX/UI team owns how users **feel** when using Trippy. We are responsible for every interaction, flow, and moment of confusion or delight. We do not implement — we define the expected behavior, write the interaction spec, and sign off that the implementation matches. Our deliverables are: user flows, interaction specs, acceptance criteria, and final approval on any screen before it ships.

**Maya** focuses on user flows, information architecture, onboarding, and empty states.
**Tom** focuses on interaction design, touch targets, accessibility, and motion logic.

We work from two principles:
- Every screen must make the next action obvious.
- No user should ever be stranded — there is always a CTA or a path forward.

---

### Steps

---

#### STEP UX-1 — First-Time Onboarding Flow `P2`

**Why:** New users land on a login screen with no context about what Trippy does. There is no product explanation anywhere before sign-up.

**Steps:**

1. Design 3 onboarding screens in Figma (or as written specs if no Figma):
   - Screen 1: headline `Plan your trip. Together.` + animated card preview + 3-dot indicator
   - Screen 2: headline `Every detail. Every day.` + mock EventCard preview
   - Screen 3: headline `Start in seconds.` + two CTAs: `Create trip` and `Join with invite`
2. Write the gate condition: onboarding only shows when `localStorage.getItem('trippy-onboarded')` is null.
3. Specify the skip interaction: a `Skip` text link top-right on all 3 screens. Tapping Skip jumps directly to the LoginScreen and sets the localStorage flag.
4. Define the transition: swiping left on each screen advances to the next. Tapping `Next →` also advances.
5. Hand the spec to Frontend. Approve the implementation before merge.
6. Define the flag write: after `Get started →` fires, `localStorage.setItem('trippy-onboarded', '1')` is written.
7. Write acceptance criteria checklist:
   - [ ] Onboarding only appears on first device visit
   - [ ] Skip works on all 3 screens
   - [ ] After onboarding, LoginScreen appears
   - [ ] Returning users never see onboarding

---

#### STEP UX-2 — Invite Modal UX Overhaul `P3`

**Why:** The current invite sheet removes the email input when the 4-invite limit is hit, stranding the user with no clear next action. Cancel has no confirmation. There are no timestamps on pending invites.

**Steps:**

1. Redesign the invite sheet layout:
   - At limit (4/4): keep the email input visible but disabled. Add a tooltip: `Cancel a pending invite to free up a slot`. The limit counter turns red.
   - Below limit: input is enabled, send button is active.
2. Specify the pending-invite row structure:
   - Email address
   - Relative timestamp (`2 days ago`, `just now`)
   - Two action buttons: `[Resend]` and `[Cancel]`
3. Define the Cancel confirmation UX:
   - Tapping `Cancel` replaces that row's action buttons with: `Remove this invite? [Yes] [Keep]`
   - If no action taken within 3 seconds, the row reverts to the default state automatically.
4. Define the Resend interaction:
   - Tapping `Resend` shows a spinner on the button, calls the send endpoint, then shows a brief `Sent ✓` state before returning to normal.
5. Specify the empty pending list:
   - When no pending invites exist, show italic text: `No pending invites.`
6. Hand spec to Frontend and Backend (Backend needs to add `created_at` to invite records for timestamps).
7. Write acceptance criteria:
   - [ ] Input disabled (not removed) at limit
   - [ ] Relative timestamps visible on all pending invites
   - [ ] Cancel shows confirmation before firing
   - [ ] Resend works with loading state
   - [ ] Counter turns red at 4/4

---

#### STEP UX-3 — Timeline View for Day Screen `P2`

**Why:** The Day screen is a flat list. Users with 6+ events cannot see temporal gaps or overlaps without reading every card individually.

**Steps:**

1. Define the toggle: a segmented control with two states — `List` and `Timeline`. Placed in the Day screen header, right of the weather badge.
2. Specify the timeline grid:
   - Y-axis spans 07:00 to `dayEndHour:00` (from user settings).
   - Each hour = 64px of vertical height.
   - Hour labels (`08:00`, `09:00`, etc.) sit on the left margin, 11px mono font, muted color.
3. Specify event positioning:
   - `top = (toMins(event.time) - 7 * 60) * (64 / 60)` px from the grid top.
   - `height = event.duration * (64 / 60)` px.
   - Events have a minimum visible height of 36px regardless of duration.
4. Specify free gap zones:
   - Any unscheduled block ≥ 30 minutes renders as a dashed-border zone.
   - Inside: `⚡ 90 min free` label + small `AI Suggest` button (same as in list view).
5. Specify conflict rendering:
   - Two overlapping events render side-by-side in two columns, each at 50% width.
   - Both get a 3px red left border.
6. Specify interactions:
   - Tap event → opens detail sheet (same as list view).
   - Tap `+` in a free zone → opens add-event sheet with `time` pre-filled to the tapped slot.
7. Specify responsive behavior:
   - On screen ≥ 768px: show list and timeline side-by-side. No toggle needed.
   - On screen < 768px: show toggle only.
8. Specify state persistence: `dayViewMode: 'list' | 'timeline'` in the UI store, session-scoped (resets on app close).
9. Write acceptance criteria:
   - [ ] Toggle works without losing the active day
   - [ ] All events at correct vertical position
   - [ ] Conflicts shown side-by-side
   - [ ] Free gaps have AI suggest button
   - [ ] No horizontal scroll on mobile

---

#### STEP UX-4 — Nav Bar Touch Target Fix `P1`

**Why:** Current nav bar tappable areas are approximately 36px — below the 44px minimum required by WCAG 2.5.5 and Apple HIG. Active state is not visually distinct enough on bright screens.

**Steps:**

1. Audit every nav item in `NavBar.tsx`. Measure: open the app on a 375px-wide viewport, use browser DevTools element inspector, confirm computed height and width of each tappable element.
2. Specify the fix: every nav button must have `min-width: 44px; min-height: 44px`. If the visual icon is smaller, use padding (not element size) to expand the hit area.
3. Specify the active state design:
   - Inactive: icon + label below in `--text-3` color, no background.
   - Active: icon + label inside a pill/rounded rectangle with `background: var(--brand-muted)`. Icon color `var(--brand)`. Label color `var(--brand)`, weight 800.
   - The transition between states must be animated: `transition: background 0.18s, color 0.18s`.
4. Specify safe area: the nav bar bottom must include `padding-bottom: env(safe-area-inset-bottom, 8px)` to avoid iPhone home indicator overlap.
5. Hand to Frontend. Review on a real device (or browser device emulator with iPhone SE viewport).
6. Write acceptance criteria:
   - [ ] All 5 nav items have ≥ 44×44px hit area (verified in DevTools)
   - [ ] Active state uses pill background, not just color change
   - [ ] Safe area padding applied
   - [ ] Works on iPhone SE 2 (375px) and Galaxy A14 (360px)

---

#### STEP UX-5 — Empty States with Illustrations and CTAs `P3`

**Why:** Every screen's empty state currently shows italic placeholder text with no call-to-action. This is the worst moment to be unhelpful — the user has nothing to do and no guidance.

**Steps:**

1. Define the three-element pattern for every empty state: **illustration**, **message**, **CTA button**.
2. Specify each screen's empty state:

   | Screen | Condition | Illustration | Message | CTA label | CTA action |
   |---|---|---|---|---|---|
   | Day | 0 events on day | Map pin, floating animation | `Nothing planned for this day yet` | `Add first event` | Open add-event sheet |
   | Dashboard | 0 upcoming events | Hourglass, slow rotate | `Add events to start planning` | `Plan Day 1` | Navigate to Day 1 |
   | Supplies | 0 items | Backpack, gentle bounce | `Your bag is empty` | `Add first item` | Open add-item input |
   | Notes | 0 notes | Pencil, wave animation | `No notes yet` | `Write a note` | Focus note input |
   | Expenses | 0 expenses | Coin, toss animation | `No expenses logged` | `Log expense` | Open expense form |

3. Specify illustration technique: pure CSS `@keyframes`. Example: `float` keyframe — `0% translateY(0)` → `50% translateY(-10px)` → `100% translateY(0)`, duration 3s, ease-in-out, infinite. Emoji at `font-size: 56px`.
4. Specify accessibility: animations must stop when `data-reduced-motion="true"` is on the root element. Use `@media (prefers-reduced-motion: reduce)` as a fallback.
5. Hand spec to Frontend.
6. Write acceptance criteria:
   - [ ] All 5 screens have illustration + message + CTA in empty state
   - [ ] CTA buttons route/action correctly
   - [ ] Animations disabled with reducedMotion active
   - [ ] Visually correct in both light and dark mode

---

---

## 2. Design Team — Lena, Ari, Zoe

### Who We Are

The Design team owns the **visual language** of Trippy. We define how things look: colors, type, spacing, shadows, motion, component styles. We do not define user flows (that is UX) and we do not write production code (that is Frontend) — but we write the precise specs that make both possible.

**Lena** owns color systems, dark mode, and token architecture.
**Ari** owns component design, glass system, and depth hierarchy.
**Zoe** owns typography, spacing scale, and motion spec.

We work from one principle: **every visual decision must be a token, not a magic number**. If a value is hardcoded in a component file, it has escaped the design system.

---

### Steps

---

#### STEP DES-1 — Dark / Light / System Theme `P1`

**Why:** The app has a boolean `darkMode` toggle but no `system` mode. Users who switch to dark manually can never return to "follow the OS." The body background is hardcoded (`#0E0C0A`) instead of using a CSS variable.

**Steps:**

1. Replace the `darkMode: boolean` store field with `themeMode: 'light' | 'dark' | 'system'`.
2. Define the derived value: `resolvedDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)`.
3. Define the three-segment toggle UI for SettingsScreen:
   - Three buttons in a pill group: `☀ Light`, `🌓 System`, `☾ Dark`
   - Active segment has `background: var(--brand)`, white label.
   - Inactive segments have transparent background.
4. Audit every CSS variable in `globals.css`. Every token must have both a `:root` (light) value and a `[data-dark="true"]` value. Required tokens (minimum):

   | Token | Light | Dark |
   |---|---|---|
   | `--bg` | `#F4EFE8` | `#0E0C0A` |
   | `--surface` | `#FFFFFF` | `#1C1814` |
   | `--border` | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.09)` |
   | `--text` | `#1A1410` | `#F0EBE3` |
   | `--text-2` | `rgba(26,20,16,0.65)` | `rgba(240,235,227,0.65)` |
   | `--text-3` | `rgba(26,20,16,0.38)` | `rgba(240,235,227,0.36)` |
   | `--brand` | `#3B6E52` | `#5CA878` |
   | `--brand-muted` | `rgba(59,110,82,0.12)` | `rgba(92,168,120,0.15)` |
   | `--terra` | `oklch(52% 0.14 50)` | `oklch(62% 0.14 50)` |
   | `--success` | `#28A05A` | `#4DC87A` |
   | `--success-bg` | `rgba(40,160,90,0.09)` | `rgba(40,160,90,0.14)` |
   | `--danger` | `#C0392B` | `#E05545` |
   | `--danger-bg` | `rgba(192,57,43,0.09)` | `rgba(192,57,43,0.15)` |

5. Fix the hardcoded body background in `AppShell.tsx`:
   - Find: `document.body.style.background = darkMode ? '#0E0C0A' : '#F4EFE8'`
   - Replace with: `document.body.style.background = 'var(--bg)'`
6. Walk through every screen in dark mode (manually) and document any rendering issues. Hand the issue list to Frontend to fix.
7. Write acceptance criteria:
   - [ ] Three-way toggle works and persists
   - [ ] System mode follows OS changes in real time
   - [ ] All 6 screens correct in dark mode (no white boxes, no invisible text)
   - [ ] Body background uses CSS variable

---

#### STEP DES-2 — Glass Usage Audit `P3`

**Why:** Glassmorphism (backdrop-filter blur) is applied to section cards and containers where it creates visual noise. The design principle: glass is for floating surfaces only.

**Steps:**

1. Audit all usages of `backdrop-filter: blur` and `Glass` component imports across the codebase. Create a list of every location.
2. Classify each usage as **correct** or **incorrect**:
   - **Correct:** Sheet/modal backgrounds, NavBar background, Toast notifications, SuggestionsSheet panel, floating action buttons (icon-only).
   - **Incorrect:** Section cards, list item containers, inline stats/chips, any container that is part of the scrollable page content.
3. For every **incorrect** usage, specify the replacement:
   - Replace with: `background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);`
   - No `backdrop-filter`. No `blur`.
4. Define a new `variant="flat"` for `GlassBtn`:
   - No blur, no translucency.
   - `background: var(--surface); border: 1px solid var(--border);`
   - Use for: inline list actions (edit, move, delete buttons on event cards already have their own styling — this variant is for future cases).
5. Write a comment at the top of `Glass.tsx` and `GlassBtn.tsx` documenting the correct usage rules (3 lines max).
6. Write acceptance criteria:
   - [ ] No `backdrop-filter` on any inline content card
   - [ ] `flat` variant added to GlassBtn
   - [ ] `Glass.tsx` has usage rules documented
   - [ ] Depth hierarchy is visually clear: bg < card < modal

---

#### STEP DES-3 — Design Token Centralization `P2`

**Why:** Inline `rgba(...)` and `oklch(...)` values appear directly in component files. This means theming requires finding and changing multiple files instead of one source of truth.

**Steps:**

1. Create `/lib/tokens.ts`. Export a `const tokens` object with every raw value used across the app:
   ```ts
   export const tokens = {
     brand: 'oklch(45% 0.12 155)',
     brandHover: 'oklch(40% 0.12 155)',
     terra: 'oklch(52% 0.14 50)',
     sand: 'oklch(72% 0.12 82)',
     // insight chip colors:
     insightGapBg: 'rgba(240,170,30,0.10)',
     insightGapBorder: 'rgba(240,170,30,0.25)',
     insightGapText: 'oklch(58% 0.18 75)',
     // ... all values
   } as const;
   ```
2. Map every token to a CSS variable in `globals.css`. Add both light and dark values.
3. Find every component with hardcoded color values. Replace with CSS variable references:
   - `DashboardScreen.tsx` — `INSIGHT_COLORS` record: replace all 7 hardcoded colour objects with CSS variables.
   - `DayScreen.tsx` — `CAT_GRADIENTS` and `CAT_GLOW` records: move to `/lib/categoryTokens.ts` shared file.
4. Run a final `grep -r "rgba(" app/components/` and `grep -r "oklch(" app/components/`. Every match is a token that escaped. Fix each one.
5. Write acceptance criteria:
   - [ ] `/lib/tokens.ts` exists with all raw values
   - [ ] Zero inline `rgba()` / `oklch()` in component files for theme colours
   - [ ] `INSIGHT_COLORS` uses CSS variables
   - [ ] `CAT_GRADIENTS` / `CAT_GLOW` in shared lib file

---

#### STEP DES-4 — Typography 5-Level Scale `P3`

**Why:** `DashboardScreen.tsx` alone has 9 different font sizes, all set inline. The type scale is not defined anywhere. Accessibility requires body text ≥ 13px.

**Steps:**

1. Define the 5-level type scale as CSS custom properties in `globals.css`:

   | Level | Token | Size | Weight | Line-height | Use case |
   |---|---|---|---|---|---|
   | Display | `--t-display` | `clamp(1.9rem, 5vw, 2.8rem)` | 800 | 1.0 | Trip name hero |
   | Heading | `--t-heading` | `1.25rem` (20px) | 700 | 1.2 | Screen titles |
   | Body | `--t-body` | `0.9375rem` (15px) | 500 | 1.5 | Event names, descriptions |
   | Caption | `--t-caption` | `0.8125rem` (13px) | 500 | 1.4 | Meta text, labels |
   | Micro | `--t-micro` | `0.6875rem` (11px) | 600 | 1.3 | Chips, badges, eyebrows |

2. Ban `fontSize: 10` and `fontSize: 12` across the entire codebase. Any current 12px text becomes 13px (caption level) or 11px (micro level with higher weight).
3. Standardize the `.eyebrow` CSS class (used inconsistently across files). Define it once in `globals.css`:
   ```css
   .eyebrow {
     font-size: var(--t-micro);
     font-weight: 700;
     letter-spacing: 0.12em;
     text-transform: uppercase;
     color: var(--text-3);
   }
   ```
   Audit all files: replace any inline eyebrow-style element with `className="eyebrow"`.
4. Audit `DashboardScreen.tsx` and `DayScreen.tsx` for every `fontSize: N` value. Map each one to a type token. Hand the mapping table to Frontend.
5. Write acceptance criteria:
   - [ ] 5 CSS type tokens defined
   - [ ] No inline `fontSize: 10` or `fontSize: 12` in any component
   - [ ] `.eyebrow` class used consistently
   - [ ] All text ≥ 13px (WCAG minimum)

---

#### STEP DES-5 — Motion Audit and Micro-Interaction Gaps `P3`

**Why:** Framer Motion is in the project but critical interaction moments lack animations — supplies checkbox, new event creation, expense logging, and day navigation all feel flat.

**Steps:**

1. Create a motion budget table. Define allowed values per interaction type:

   | Interaction | Duration | Type | Note |
   |---|---|---|---|
   | Card entrance (new item) | 280ms | spring stiff=420, damp=28 | Distinct from page-load entrance |
   | Card exit (delete) | 180ms | tween ease-out | Slide right + fade |
   | Screen transition | 260ms | spring stiff=360, damp=38 | Already implemented |
   | Button tap feedback | 80ms | scale 0.94 | Already on most buttons |
   | Checkbox toggle | 200ms | spring stiff=500, damp=30 | Missing |
   | Sheet open | 320ms | spring stiff=340, damp=36 | Already implemented |
   | Number counter change | 400ms | tween ease-out | Missing (budget total, counts) |

2. Specify 4 missing micro-interactions:

   **A — Supplies checkbox:**
   - On check: item text gets `text-decoration: line-through` via CSS transition (0.2s).
   - The row nudges right 4px then back (spring, ~200ms).
   - A green checkmark icon fades in at the right edge.

   **B — New event "land" animation:**
   - After add sheet closes, the new card enters with `initial={{ scale: 0.9, opacity: 0 }}`.
   - Additional glow: `box-shadow` pulses from `0 0 0 3px var(--brand-muted)` to `none` over 600ms.
   - This distinguishes "just added" cards from existing cards.

   **C — Day swipe direction:**
   - When navigating forward (next day), the event list slides out left and new content enters from right.
   - When navigating backward (previous day), reverse directions.
   - Use Framer Motion `custom` direction prop with `variants`.

   **D — Expense total counter:**
   - When a new expense is added, the total at the top of the section animates to the new value using `useMotionValue` + Framer `animate()`.
   - Duration: 400ms, ease-out.

3. Specify the reduced-motion override: every custom animation must be wrapped in a check against the `data-reduced-motion` root attribute. When true, all animations are instant (duration: 0).
4. Hand the full motion spec to Frontend.
5. Write acceptance criteria:
   - [ ] Supplies checkbox has line-through transition
   - [ ] New event card has distinct glow entrance
   - [ ] Day swipe has correct directional slide
   - [ ] Expense total animates to new value
   - [ ] All animations instant when reducedMotion active

---

---

## 3. Frontend Development Team — Dan & Sara

### Who We Are

The Frontend team builds the user-facing React and Next.js code. We own everything in `app/components/`, the Zustand store, client-side data fetching, performance, and service workers. We implement specs from the UX and Design teams and coordinate with Backend on API contracts.

**Dan** leads architecture decisions, store structure, streaming, and performance.
**Sara** leads component implementation, accessibility, loading states, and offline support.

We work from three principles:
- Every async operation has a loading state, an error state, and a retry path.
- No magic numbers in components — values come from tokens or the type system.
- Ship nothing that breaks on a bad network.

---

### Steps

---

#### STEP FE-1 — Store Decomposition `P3`

**Why:** `useAppStore` is subscribed to by virtually every component in the app. A single `darkMode` toggle re-renders the entire tree. This is a performance problem that will compound as the app grows.

**Steps:**

1. Create `/lib/stores/userStore.ts` with Zustand:
   - Fields: `authUser`, `userId`, `nickname`, `setNickname`, `logout`, `checkAuth`, `deleteAccount`
2. Create `/lib/stores/tripStore.ts`:
   - Fields: `trip`, `tripDbId`, `activeDay`, `setActiveDay`, `supplies`, `notes`, `expenses`, and all mutation functions (`addEvent`, `editEvent`, `deleteEvent`, `moveEvent`, `voteEvent`, `addHotel`, `editHotel`, `deleteHotel`, `addExpense`, `deleteExpense`, `addSupply`, `updateSupply`, `deleteSupply`, `inviteToTrip`, `leaveTrip`, `loadTripById`, `createTrip`, `updateTripInfo`, `currencyByTrip`, `setCurrency`)
3. Create `/lib/stores/uiStore.ts`:
   - Fields: `screen`, `setScreen`, `themeMode` (replaces `darkMode` boolean — see DES-1), `toggleTheme`, `highContrast`, `toggleHighContrast`, `reducedMotion`, `toggleReducedMotion`, `hideBudget`, `toggleHideBudget`, `showCarbonBudget`, `toggleShowCarbonBudget`, `dayEndHour`, `setDayEndHour`, `showSuggestions`, `setShowSuggestions`, `showTour`, `lastSyncError`
4. Create `/lib/stores/sessionStore.ts`:
   - Fields: `tripEntryCountries`, `clearTripEntry`, `demoClickCount`, `recordDemoClick`, `termsAccepted`
5. Keep `/lib/store.ts` as a re-export façade during migration:
   ```ts
   export const useAppStore = () => ({
     ...useUserStore(),
     ...useTripStore(),
     ...useUIStore(),
     ...useSessionStore(),
   });
   ```
   This preserves all existing `useAppStore(s => s.xxx)` call sites with zero breakage.
6. Migrate call sites one file at a time — replace `useAppStore(s => s.darkMode)` with `useUIStore(s => s.themeMode)`, etc.
7. Verify with React DevTools Profiler: toggling dark mode must not re-render `EventCard` components.
8. Write acceptance criteria:
   - [ ] 4 slice files created
   - [ ] `useAppStore` façade works (all existing imports unbroken)
   - [ ] Dark mode toggle does not re-render DayScreen event cards
   - [ ] Zustand devtools shows 4 separate stores

---

#### STEP FE-2 — Loading and Error States for All Async Operations `P1`

**Why:** Every async call in the app currently has `.catch(() => {})` — silent failure. Users see a blank section and assume the app is broken.

**Steps:**

1. Add a `.skeleton` CSS class to `globals.css`:
   ```css
   .skeleton {
     background: linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%);
     background-size: 200% 100%;
     animation: skeleton-sweep 1.4s ease-in-out infinite;
   }
   @keyframes skeleton-sweep {
     0% { background-position: 200% 0; }
     100% { background-position: -200% 0; }
   }
   [data-reduced-motion="true"] .skeleton { animation: none; }
   ```
2. Create a reusable `<AsyncError>` component at `app/components/ui/AsyncError.tsx`:
   - Props: `message: string`, `onRetry: () => void`, `compact?: boolean`
   - Renders: warning icon + message text + `Retry` button
   - Compact mode: single line, no icon
3. Audit every `useEffect` with a `fetch()` or async call. Add 3 state fields per async block:
   - `const [loading, setLoading] = useState(true)`
   - `const [error, setError] = useState<string | null>(null)`
   - `const [retryCount, setRetryCount] = useState(0)` — incrementing this re-triggers the `useEffect`
4. Update each async block:
   ```ts
   useEffect(() => {
     setLoading(true);
     setError(null);
     fetchWeatherForTrip(lat, lng, startDate, days)
       .then(setWeather)
       .catch(err => setError('Could not load weather'))
       .finally(() => setLoading(false));
   }, [lat, lng, startDate, days, retryCount]);
   ```
5. Update each render section to use `loading`, `error`, and the retry mechanism:
   ```tsx
   {loading ? (
     <div style={{ display: 'flex', gap: 6 }}>
       {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ width: 58, height: 88, borderRadius: 12 }} />)}
     </div>
   ) : error ? (
     <AsyncError message="Couldn't load weather" onRetry={() => setRetryCount(c => c + 1)} compact />
   ) : weather.length > 0 ? (
     // existing weather strip
   ) : null}
   ```
6. Apply this pattern to every async data source:
   - [ ] Dashboard: weather forecast
   - [ ] Dashboard: exchange rates
   - [ ] Day screen: day weather
   - [ ] Day screen: route time (between events)
   - [ ] Day screen: hotel-to-event travel time
   - [ ] Suggestions sheet: AI suggestions fetch
7. Write acceptance criteria:
   - [ ] Every async section shows a skeleton during load
   - [ ] Every failure shows error + Retry button
   - [ ] Retry actually re-fetches
   - [ ] Skeletons animate (unless reducedMotion)
   - [ ] No `.catch(() => {})` without setting error state

---

#### STEP FE-3 — AI Suggestions Streaming `P2`

**Why:** The AI suggestions endpoint blocks for 2–4 seconds and returns all content at once. Streaming gives users visible progress and faster perceived performance.

**Steps:**

1. Update `/app/api/ai/suggestions/route.ts`:
   - Replace `client.messages.create({...})` with `client.messages.stream({...})`
   - Return a `ReadableStream` response instead of `Response.json()`
   - Accumulate chunks, then after the stream ends, run `enrichWithPlaces()` and send a final sentinel line: `\n__ENRICHED__` + the enriched JSON
   - Set response headers: `Content-Type: text/plain; charset=utf-8`
2. Update `SuggestionsSheet.tsx`:
   - Use `fetch()` + `response.body.getReader()` to read the stream incrementally
   - Maintain a `streamingText` state that grows as chunks arrive
   - Detect the `__ENRICHED__` sentinel and parse the final suggestions array
   - Set `suggestions` state and clear `streamingText`
3. Add a streaming UI in the sheet:
   - While streaming: show a translucent blurred box with the raw streaming text inside — typewriter effect
   - When complete: fade the streaming box out (`opacity: 0`, transition 300ms), fade the formatted suggestion cards in
4. Handle stream errors: if the fetch fails or the stream closes unexpectedly, set `error` state and show `<AsyncError>`.
5. Write acceptance criteria:
   - [ ] Server uses `messages.stream()` not `messages.create()`
   - [ ] Client shows streaming text character-by-character
   - [ ] Enriched suggestions replace streaming text with animation
   - [ ] Stream error shows error state, not blank

---

#### STEP FE-4 — Offline Mode (Read-Only) `P2`

**Why:** Users are on planes, in national parks, in tunnels. The app must show their trip with no network connection.

**Steps:**

1. Add to `useUIStore`:
   - `isOffline: boolean`
   - `pendingChanges: OfflineChange[]`
   - `addPendingChange(change: OfflineChange): void`
   - `flushPendingChanges(): Promise<void>`
2. In `AppShell.tsx`, wire up network state listeners:
   ```ts
   useEffect(() => {
     const goOnline = () => { useUIStore.setState({ isOffline: false }); flushPendingChanges(); };
     const goOffline = () => useUIStore.setState({ isOffline: true });
     window.addEventListener('online', goOnline);
     window.addEventListener('offline', goOffline);
     return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
   }, []);
   ```
3. Wrap every mutation function in `tripStore` with offline detection:
   - If `isOffline`, push the change to `pendingChanges` queue and apply it optimistically to local state only.
   - If online, proceed normally.
4. Implement `flushPendingChanges()`: when the device goes online, replay each queued change against the API in order. Show a toast: `"Back online — X changes synced ✓"`.
5. Create `/public/sw.js` — a Service Worker:
   - On install: cache app shell JS bundles and static assets
   - Runtime strategy for `/api/weather`: `StaleWhileRevalidate`, TTL 1 hour
   - Runtime strategy for `/api/trips`: `CacheFirst`, TTL 24 hours
   - Runtime strategy for `/api/route-time`: `CacheFirst`, TTL 7 days
   - No cache for `/api/ai/suggestions` — always needs network
6. Register the Service Worker in `AppShell.tsx`:
   ```ts
   useEffect(() => {
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/sw.js');
     }
   }, []);
   ```
7. Add an offline banner to every screen:
   ```tsx
   {isOffline && (
     <div style={{ background: 'var(--danger-bg)', borderBottom: '1px solid var(--danger)', padding: '6px var(--page-px)', fontSize: 12, fontWeight: 600, color: 'var(--danger)' }}>
       📡 Offline — {pendingChanges.length > 0 ? `${pendingChanges.length} changes pending` : 'viewing saved data'}
     </div>
   )}
   ```
8. Disable Share and AI Suggest buttons when `isOffline: true` (grey + tooltip).
9. Write acceptance criteria:
   - [ ] Trip data readable with no network (Zustand persist already handles this)
   - [ ] Changes offline are queued, not lost
   - [ ] On reconnect, queued changes sync automatically
   - [ ] Offline banner shows with pending change count
   - [ ] Share/AI buttons disabled when offline
   - [ ] Service Worker registered and caching static assets

---

#### STEP FE-5 — Next.js Image Optimization `P3`

**Why:** Raw `<img>` tags bypass Next.js image optimization — no lazy loading, no WebP conversion, no responsive sizing. This hurts Core Web Vitals (LCP, layout shift).

**Steps:**

1. Run `grep -r "<img " app/` and list every match.
2. Replace every `<img>` that renders a static asset with `<Image>` from `next/image`.
3. For every `<Image>`:
   - Add `width` and `height` (or `fill` for responsive containers with `position: relative` parent)
   - Add `alt=""` for decorative images (with `aria-hidden="true"`)
   - Add `priority` only for above-the-fold images (the Trippy compass logo in the loading state)
4. For background images in `DesertScene.tsx` / `BackgroundScene.tsx`:
   - Wrap in a `position: relative` container
   - Use `<Image fill style={{ objectFit: 'cover' }} alt="" aria-hidden />` inside it
5. Update `next.config.ts`:
   ```ts
   images: {
     formats: ['image/avif', 'image/webp'],
   }
   ```
6. Run Lighthouse on the production build. Verify "Properly sized images" and "Modern image formats" pass.
7. Write acceptance criteria:
   - [ ] Zero raw `<img>` tags for static/decorative assets
   - [ ] All `<Image>` have `alt` attributes
   - [ ] `avif` and `webp` formats enabled
   - [ ] LCP image has `priority` attribute
   - [ ] Lighthouse image checks pass

---

---

## 4. Backend Development Team — Oren & Niv

### Who We Are

The Backend team owns everything in `app/api/`, the Supabase database schema, server-side data logic, caching, and real-time infrastructure. We also own the contract between the client and server — API shapes, error formats, and response codes.

**Oren** leads database design, RLS policy coordination with Security, real-time subscriptions, and pagination.
**Niv** leads API route implementation, validation, caching, rate limiting, and infrastructure.

We work from three principles:
- Every API route must validate its input before touching the database.
- Every external API call must be cached server-side.
- The database is the source of truth — client state is derived from it.

---

### Steps

---

#### STEP BE-1 — Rate Limiting on API Routes `P1`

**Why:** The `/api/ai/suggestions` route calls Claude API (paid). Zero rate limiting means a single user could cost $100 in a single hour. `/api/invitations/send` has no limit — invite spam is trivially possible.

**Steps:**

1. Create `/lib/rateLimit.ts`:
   ```ts
   // In-memory store: { key: { count, resetAt } }
   const store = new Map<string, { count: number; resetAt: number }>();

   export function checkRateLimit(
     key: string,
     limit: number,
     windowSecs: number
   ): { allowed: boolean; remaining: number; retryAfter: number } {
     const now = Date.now();
     const entry = store.get(key);
     if (!entry || now > entry.resetAt) {
       store.set(key, { count: 1, resetAt: now + windowSecs * 1000 });
       return { allowed: true, remaining: limit - 1, retryAfter: 0 };
     }
     if (entry.count >= limit) {
       return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
     }
     entry.count++;
     return { allowed: true, remaining: limit - entry.count, retryAfter: 0 };
   }
   ```
   Note: swap this for `@upstash/ratelimit` if Redis is available — the interface stays the same.
2. Apply rate limiting to these routes with these limits:

   | Route | Key | Limit | Window |
   |---|---|---|---|
   | `POST /api/ai/suggestions` | `userId` | 10 | 60s |
   | `POST /api/invitations/send` | `userId` | 5 | 60s |
   | `POST /api/trips/create` | `userId` | 10 | 60s |
   | `GET /api/weather` | IP | 30 | 60s |
   | `GET /api/route-time` | IP | 60 | 60s |
   | `DELETE /api/account/delete` | `userId` | 1 | 3600s |

3. When rate limit is exceeded, return:
   ```ts
   return Response.json(
     { error: 'Too many requests', retryAfter: retryAfter },
     {
       status: 429,
       headers: {
         'Retry-After': String(retryAfter),
         'X-RateLimit-Limit': String(limit),
         'X-RateLimit-Remaining': '0',
       }
     }
   );
   ```
4. Update the client (coordinate with Frontend): `SuggestionsSheet` and the invite flow must handle 429 by showing: `"Try again in X seconds"` with a countdown.
5. Write acceptance criteria:
   - [ ] All 6 routes have rate limiting
   - [ ] AI suggestions capped at 10/min per user
   - [ ] 429 includes `retryAfter` value
   - [ ] Client shows countdown on rate limit
   - [ ] Normal usage (< 5 req/min) never blocked

---

#### STEP BE-2 — Zod Server-Side Validation `P1`

**Why:** All API routes cast `await request.json()` directly to TypeScript interfaces. TypeScript types are compile-time only — at runtime, any payload shape reaches the DB.

**Steps:**

1. Add `zod` to dependencies: `npm install zod`.
2. Create `/lib/schemas.ts` and define one Zod schema per API route:

   ```ts
   import { z } from 'zod';

   const TimeString = z.string().regex(/^\d{2}:\d{2}$/);
   const Category = z.enum(['food', 'cafe', 'attraction', 'hotel', 'rest', 'transport', 'flight', 'other']);

   export const AiSuggestionsBody = z.object({
     dayNumber: z.number().int().min(1).max(366),
     dayMeta: z.object({
       region: z.string(),
       desc: z.string().optional(),
       lat: z.number().optional(),
       lng: z.number().optional(),
       emoji: z.string().optional(),
     }).optional(),
     existingEvents: z.array(z.object({
       id: z.string(),
       time: TimeString,
       duration: z.number().int().min(5).max(1440),
       name: z.string().min(1).max(200),
       category: Category,
       location: z.string().optional(),
       lat: z.number().optional(),
       lng: z.number().optional(),
     })),
     tripName: z.string().min(1).max(100),
     countries: z.array(z.string()).optional(),
     exclude: z.array(z.string()).optional(),
     gapStart: z.number().int().min(0).max(1440).optional(),
     gapEnd: z.number().int().min(0).max(1440).optional(),
     locale: z.string().optional(),
   });

   export const CreateTripBody = z.object({
     name: z.string().min(1).max(100),
     days: z.number().int().min(1).max(365),
     startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
     countries: z.array(z.string()).optional(),
   });

   export const AddExpenseBody = z.object({
     description: z.string().min(1).max(200),
     amount: z.number().positive().max(1_000_000),
     paidBy: z.string().min(1).max(100),
     splitCount: z.number().int().min(1).max(20),
   });

   // Add one schema per route
   ```

3. Apply in every route handler — use this pattern:
   ```ts
   const raw = await request.json();
   const parsed = AiSuggestionsBody.safeParse(raw);
   if (!parsed.success) {
     return Response.json(
       { error: 'Invalid request', details: parsed.error.flatten() },
       { status: 400 }
     );
   }
   const { dayNumber, dayMeta, ... } = parsed.data; // fully typed
   ```
4. Routes that need validation:
   - [ ] `POST /api/ai/suggestions`
   - [ ] `POST /api/trips/create`
   - [ ] `PUT /api/trips/[tripId]`
   - [ ] `POST /api/invitations/send`
   - [ ] `POST /api/invitations/accept`
   - [ ] `POST /api/invite/[token]` (join trip body, if any)
   - [ ] `DELETE /api/account/delete` (no body, but validate auth header exists)
   - [ ] `POST /api/trips/[tripId]/hotels`
5. Write acceptance criteria:
   - [ ] All 8 routes validate with Zod before touching the DB
   - [ ] Invalid payloads return 400 with field-level error details
   - [ ] Valid payloads pass through correctly
   - [ ] Schemas exported from a single `/lib/schemas.ts` file

---

#### STEP BE-3 — Cursor Pagination for Trips and Events `P4`

**Why:** `GET /api/trips` returns all trips for a user. A user with 100 trips and 200 events each sends a ~500KB JSON on every page load.

**Steps:**

1. Update `GET /api/trips` to support cursor pagination:
   - Accept query params: `?cursor=<last_trip_id>&limit=20`
   - Use Supabase keyset pagination: `.select('id, name, days, startDate, countries, theme').order('created_at', { ascending: false }).limit(20)`
   - If `cursor` provided: find the `created_at` of that ID first, then `.lt('created_at', cursorTimestamp)`
   - Return: `{ trips: [...], nextCursor: "uuid" | null }`
2. Update the client (Dashboard) to use infinite scroll or a `Load more` button.
3. Plan event lazy-loading (larger architectural change — defer to a future sprint unless trips already have a separate `trip_events` table):
   - If events are embedded in the trip JSON: accept this for now, just paginate the trips list.
   - If a separate table exists: add `GET /api/trips/[tripId]/events?day=N` route.
4. Add `Cache-Control: private, max-age=30` to the trips list response (30s browser cache).
5. Write acceptance criteria:
   - [ ] `GET /api/trips` supports `?cursor` and `?limit`
   - [ ] Response includes `nextCursor` field
   - [ ] Initial payload for a user with 100 trips is ≤ 20 trips in first response
   - [ ] Client loads more on scroll/button click

---

#### STEP BE-4 — Server-Side Exchange Rate Cache `P2`

**Why:** Exchange rates are fetched from the browser on every dashboard mount — one external API call per user per session. With 1000 users, that's 1000 external calls. Rates change at most once per day.

**Steps:**

1. Create `GET /api/exchange-rates?base=USD`:
   ```ts
   import { unstable_cache } from 'next/cache';

   const getCachedRates = unstable_cache(
     async (base: string) => {
       const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
       if (!res.ok) throw new Error('Exchange rate fetch failed');
       const data = await res.json();
       return data.rates as Record<string, number>;
     },
     ['exchange-rates'],
     { revalidate: 3600 } // revalidate every 1 hour
   );

   export async function GET(request: NextRequest) {
     const base = request.nextUrl.searchParams.get('base') ?? 'USD';
     const allowedBases = ['USD', 'EUR', 'ILS', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];
     if (!allowedBases.includes(base)) {
       return Response.json({ error: 'Unsupported base currency' }, { status: 400 });
     }
     const rates = await getCachedRates(base);
     return Response.json(rates, {
       headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
     });
   }
   ```
2. Update `/lib/currency.ts` — change `getExchangeRates(base)` to call `/api/exchange-rates?base=${base}` instead of the external API directly.
3. Validate: open Network tab, load the dashboard, reload — second load must not show a new external exchange-rate API call.
4. Write acceptance criteria:
   - [ ] `/api/exchange-rates` route exists
   - [ ] Client `getExchangeRates()` calls internal proxy only
   - [ ] `Cache-Control` header set on response
   - [ ] Second load within 1h makes 0 external API calls
   - [ ] Stale rates (up to 24h) serve if external API is down

---

#### STEP BE-5 — Real-Time Sync via Supabase Channels `P2`

**Why:** Two participants on the same trip cannot see each other's changes without a page refresh. Supabase has built-in real-time via PostgreSQL change data capture.

**Steps:**

1. In `tripStore.ts`, add a `subscribeToTrip(tripId: string)` function:
   ```ts
   subscribeToTrip: (tripId: string) => {
     const supabase = createClient();
     const channel = supabase
       .channel(`trip:${tripId}`)
       .on('postgres_changes', {
         event: 'UPDATE',
         schema: 'public',
         table: 'trips',
         filter: `id=eq.${tripId}`,
       }, (payload) => {
         const updated = payload.new as TripData;
         // Only apply if remote timestamp is newer than local last edit
         useTripStore.setState(state => ({
           trip: mergeTrip(state.trip, updated),
         }));
         // Show notification
         useToast.show(`Trip updated by another participant`);
       })
       .subscribe();
     return () => supabase.removeChannel(channel);
   }
   ```
2. Call `subscribeToTrip(tripDbId)` in `AppShell.tsx` when `tripDbId` is set. Return the cleanup function.
3. Implement `mergeTrip(local, remote)`:
   - For arrays (events, participants, supplies): merge by item ID — keep the newer version of each item.
   - For simple fields (name, days, startDate): remote wins if different.
4. Add Supabase Presence to show who is currently active:
   ```ts
   channel.track({ userId, nickname, screen: currentScreen, joinedAt: Date.now() });
   channel.on('presence', { event: 'sync' }, () => {
     const state = channel.presenceState();
     setActiveParticipants(Object.values(state).flat());
   });
   ```
5. Show presence in the Dashboard header: participant avatars with a green dot if they're currently active in the app.
6. Add a visual pulse on the affected day card when a real-time update arrives for that day.
7. Write acceptance criteria:
   - [ ] Changes by participant A appear for participant B within 2 seconds
   - [ ] Subscription set up when trip loads, cleaned up when unloaded
   - [ ] Simultaneous edits do not corrupt trip data
   - [ ] Toast shows when another participant makes a change
   - [ ] Presence dots visible on participant avatars

---

---

## 5. Security Team — Rex & Hana

### Who We Are

The Security team is responsible for protecting users' data, preventing unauthorized access, and ensuring the app meets basic security hygiene standards. We do not own feature development — we own threat modeling, security policy, and sign-off on any auth or data access change before it ships.

**Rex** leads application security: CSRF, injection, rate limiting policy, and API surface audit.
**Hana** leads data security: RLS policies, account lifecycle, session security, and environment variable hygiene.

We work from one non-negotiable principle: **a security issue blocks the release — it is never deferred**.

P0 items are active risks that must be resolved before any new feature ships to production.

---

### Steps

---

#### STEP SEC-1 — Confirm and Test RLS Policies `P0 — BLOCKS LAUNCH`

**Why:** The memory audit records that RLS policies were *written* but not confirmed *applied*. Until this is verified, any authenticated user may be able to read or modify any other user's trip. This is a critical data breach risk.

**Steps:**

1. Log into the Supabase dashboard. Navigate to each table and confirm "Row Level Security" is enabled (green toggle). Tables to check:
   - `trips`
   - `trip_participants`
   - `trip_invitations`
   - `privacy_consents`
2. Verify the following policies exist on `trips`:
   - **SELECT**: only users who are in `trip_participants` for that trip can read it.
   - **INSERT**: any authenticated user can create a trip.
   - **UPDATE**: only participants can update.
   - **DELETE**: only the trip creator can delete.
   If any policy is missing, apply it using the SQL below:
   ```sql
   ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "trip_select_participant" ON trips
     FOR SELECT TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM trip_participants
         WHERE trip_participants.trip_id = trips.id
         AND trip_participants.user_id = auth.uid()
       )
     );

   CREATE POLICY "trip_update_participant" ON trips
     FOR UPDATE TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM trip_participants
         WHERE trip_participants.trip_id = trips.id
         AND trip_participants.user_id = auth.uid()
       )
     );

   CREATE POLICY "trip_delete_owner" ON trips
     FOR DELETE TO authenticated
     USING (created_by = auth.uid());
   ```
3. Apply equivalent policies to `trip_participants`, `trip_invitations`, and `privacy_consents`. Each table must only allow the owning user to access their own rows.
4. Create `/scripts/test-rls.ts` — an automated verification script:
   - Create two test users (User A, User B) via Supabase admin API.
   - User A creates a trip → is added as participant.
   - User B (not invited) authenticates and tries to `SELECT` the trip → must return 0 rows.
   - User B tries to `UPDATE` the trip → must return an error or 0 rows affected.
   - User B tries to `DELETE` the trip → must return an error.
   - Log PASS/FAIL for each assertion.
   - Script exits with code 1 if any assertion fails.
5. Add the script to CI (GitHub Actions or equivalent). It runs on every PR that touches `app/api/` or the Supabase schema.
6. Write acceptance criteria:
   - [ ] RLS enabled on all 4 tables (with screenshots in the PR)
   - [ ] `test-rls.ts` passes all assertions
   - [ ] Unauthorized user reads 0 rows from another user's trip
   - [ ] Unauthorized update/delete returns error
   - [ ] RLS test runs automatically in CI

---

#### STEP SEC-2 — Invite Token Expiry and Single-Use `P0 — BLOCKS LAUNCH`

**Why:** The `invite_token` on a trip has no expiry. An invite link emailed to someone in January is still valid in December. There is no single-use enforcement.

**Steps:**

1. Create a new Supabase table `trip_invite_links`:
   ```sql
   CREATE TABLE trip_invite_links (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
     token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
     created_by UUID NOT NULL REFERENCES auth.users(id),
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
     max_uses INTEGER NOT NULL DEFAULT 1,
     use_count INTEGER NOT NULL DEFAULT 0
   );
   ```
2. Apply RLS on `trip_invite_links`:
   - SELECT: anyone can read a link by token (needed for the join page).
   - INSERT: only trip participants can create invite links.
   - UPDATE: only the creator can update (increment use_count via server-side with service role).
3. Update `GET /api/invite/[token]`:
   - Query `trip_invite_links` instead of `trips.invite_token`.
   - Check `expires_at > now()` → if expired, return HTTP 410 with `{ error: 'This invite link has expired' }`.
   - Check `use_count < max_uses` → if at limit, return HTTP 410 with `{ error: 'This invite link has already been used' }`.
4. Update `POST /api/invite/[token]` (join trip):
   - After successfully inserting into `trip_participants`, increment `use_count` on the invite link.
   - Use the service role key for this update (not anon key).
5. Add a `POST /api/trips/[tripId]/invite-link` route:
   - Creates a new row in `trip_invite_links`.
   - Returns `{ token: "hexstring", expiresAt: "ISO date" }`.
   - Replace the current "copy invite link" button in the share sheet to call this endpoint.
6. Apply the same expiry to email invites:
   - Add `expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days'` to `trip_invitations` table.
   - In `/api/invitations/accept`, check `expires_at` before accepting.
7. Update `/app/join/[token]/page.tsx`:
   - When API returns 410, show: `"This invite link has expired or already been used. Ask the trip organizer to send a new one."` with a `[Back to home]` button.
8. Write acceptance criteria:
   - [ ] `trip_invite_links` table created with expiry and use_count fields
   - [ ] Expired tokens return 410 (not 404)
   - [ ] Used tokens (at max_uses) return 410
   - [ ] Join page shows informative expired-link message
   - [ ] Regenerate link button works in share sheet
   - [ ] Email invitations also expire after 7 days

---

#### STEP SEC-3 — CSRF Protection `P1`

**Why:** State-mutating API routes (`/api/account/delete`, `/api/trips/create`) use cookie-based auth. Without SameSite protection, a malicious website can submit a form to these endpoints using the user's session cookie.

**Steps:**

1. Locate where Supabase session cookies are set — likely in `/utils/supabase/server.ts` and `/utils/supabase/client.ts`. Add `sameSite: 'strict'` and `secure: process.env.NODE_ENV === 'production'` to every `cookieStore.set()` call.
2. Check if `/middleware.ts` exists. If not, create it. Add Origin validation for all API routes:
   ```ts
   import { NextRequest, NextResponse } from 'next/server';

   const ALLOWED_ORIGINS = [
     process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
   ];

   export function middleware(request: NextRequest) {
     const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
     if (isMutation) {
       const origin = request.headers.get('origin');
       if (origin && !ALLOWED_ORIGINS.includes(origin)) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
     }
     return NextResponse.next();
   }

   export const config = { matcher: '/api/:path*' };
   ```
3. Add Content-Type enforcement in every mutating route handler:
   ```ts
   const ct = request.headers.get('content-type') ?? '';
   if (!ct.includes('application/json')) {
     return Response.json({ error: 'Invalid content type' }, { status: 415 });
   }
   ```
4. Add `NEXT_PUBLIC_APP_URL` to `.env.example` and ensure it is set in the production environment.
5. Test: simulate a cross-origin POST (using a different localhost port) to `/api/trips/create` — must return 403.
6. Write acceptance criteria:
   - [ ] Supabase session cookies have `SameSite=Strict` and `Secure`
   - [ ] Middleware blocks unlisted origins on all API routes
   - [ ] Mutating routes verify `Content-Type: application/json`
   - [ ] Cross-origin form POST returns 403
   - [ ] Same-origin browser requests work correctly

---

#### STEP SEC-4 — Account Deletion Grace Period and Email Confirmation `P1`

**Why:** `/api/account/delete` hard-deletes the account instantly. A compromised account can be immediately and irreversibly destroyed. GDPR best practice requires a confirmation step and a cancellation window.

**Steps:**

1. Create `account_deletions` table:
   ```sql
   CREATE TABLE account_deletions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id),
     requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
     confirmed_at TIMESTAMPTZ,
     cancelled_at TIMESTAMPTZ,
     confirmation_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex')
   );
   ```
2. Replace `DELETE /api/account/delete` with two new routes:

   **`POST /api/account/delete/request`** (step 1 — user taps "Delete account"):
   - Verifies auth.
   - Inserts a row into `account_deletions`.
   - Sends a confirmation email to `user.email` containing:
     - A link to confirm: `{APP_URL}/account/confirm-delete?token={confirmation_token}`
     - A link to cancel: `{APP_URL}/account/cancel-delete?token={confirmation_token}`
     - Text: "Your account will be deleted in 24 hours unless you cancel."
   - Returns `{ message: 'Confirmation email sent. You have 24 hours to confirm.' }`.

   **`POST /api/account/delete/confirm?token={token}`** (step 2 — user clicks email link):
   - Verifies the `confirmation_token` matches a row in `account_deletions`.
   - Checks it has not already been cancelled.
   - Sets `confirmed_at = now()`.
   - Runs the actual deletion logic (same as the original DELETE handler).
   - Returns `{ ok: true }`.

   **`POST /api/account/delete/cancel?token={token}`** (cancel path):
   - Sets `cancelled_at = now()` on the row.
   - Returns `{ message: 'Account deletion cancelled.' }`.

3. Create `/app/account/confirm-delete/page.tsx` — a page that calls the confirm endpoint when loaded (with the token from the URL query string). Shows: `"Your account has been deleted."` or `"Something went wrong — your account has not been deleted."`.

4. Create `/app/account/cancel-delete/page.tsx` — calls the cancel endpoint. Shows: `"Account deletion cancelled. You're still in."` with a `[Go to app]` button.

5. Update `SettingsScreen.tsx` — the "Delete account" confirm dialog text changes to: `"Are you sure? We'll email you a link to confirm. You'll have 24 hours to change your mind."` CTA: `"Send confirmation email"`.

6. Write acceptance criteria:
   - [ ] Original `DELETE /api/account/delete` removed
   - [ ] Confirmation email sent within 30 seconds of request
   - [ ] Email link expires when `scheduled_for` passes (24h)
   - [ ] Unconfirmed requests never delete the account
   - [ ] User can cancel via email link or app settings within 24h
   - [ ] Actual deletion only runs after confirmed_at is set

---

#### STEP SEC-5 — Remove NEXT_PUBLIC_ Variables from API Routes `P0 — BLOCKS LAUNCH`

**Why:** `NEXT_PUBLIC_` prefixed environment variables are bundled into the client JavaScript and visible to anyone who inspects the page source. Using them in server-side API routes is a code smell that risks developers accidentally promoting a secret to `NEXT_PUBLIC_`.

**Steps:**

1. Run this audit command and document every match:
   ```bash
   grep -r "NEXT_PUBLIC_" app/api/
   ```
2. For every match:
   - Confirm whether the variable is truly safe to be public (e.g. `NEXT_PUBLIC_SUPABASE_URL` — the Supabase project URL is not secret).
   - Create a server-only alias without the `NEXT_PUBLIC_` prefix in `.env` and `.env.example`.
   - Replace the `NEXT_PUBLIC_` reference in the API route with the server-only alias.
3. Set up the complete environment variable structure in `.env.example`:
   ```bash
   # CLIENT SAFE — bundled into browser JS, visible in page source
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
   NEXT_PUBLIC_APP_URL=https://trippy.app

   # SERVER ONLY — never use NEXT_PUBLIC_ prefix for these
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJxxx
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx
   GOOGLE_MAPS_API_KEY=AIzaxxx
   ANTHROPIC_API_KEY=sk-ant-xxx
   CRON_SECRET=randomly-generated-string
   ```
4. Add a pre-commit hook to prevent future regressions. Create `.husky/pre-commit` (or add to existing):
   ```bash
   #!/bin/sh
   if grep -rn "NEXT_PUBLIC_" app/api/; then
     echo ""
     echo "ERROR: NEXT_PUBLIC_ env var found in app/api/."
     echo "API routes are server-only. Use non-prefixed env vars instead."
     echo ""
     exit 1
   fi
   ```
5. Verify the client JavaScript bundle contains no secrets: build the app (`npm run build`), open `.next/static/chunks/`, search the JS files for `ANTHROPIC_API_KEY`, `SERVICE_ROLE_KEY`, and `GOOGLE_MAPS_API_KEY`. All must return zero results.
6. Write acceptance criteria:
   - [ ] `grep -r "NEXT_PUBLIC_" app/api/` returns zero results
   - [ ] `.env.example` documents public/server split clearly
   - [ ] Pre-commit hook blocks `NEXT_PUBLIC_` in `app/api/`
   - [ ] Built JS bundle contains no secret key values
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` has zero `NEXT_PUBLIC_` form anywhere in the codebase

---

---

## Priority Summary

| ID | Team | Priority | Effort | Description |
|---|---|---|---|---|
| SEC-1 | Security | **P0 — Blocks launch** | Medium | Apply and test RLS policies |
| SEC-2 | Security | **P0 — Blocks launch** | Medium | Invite token expiry + single-use |
| SEC-5 | Security | **P0 — Blocks launch** | Low | Remove `NEXT_PUBLIC_` from API routes |
| SEC-3 | Security | P1 | Low | SameSite=Strict cookies + Origin validation |
| SEC-4 | Security | P1 | High | Account deletion grace period + email confirmation |
| BE-1 | Backend | P1 | Medium | Rate limiting on all API routes |
| BE-2 | Backend | P1 | Medium | Zod validation on all POST/PUT/DELETE handlers |
| FE-2 | Frontend | P1 | Medium | Loading skeletons + error states + retry for all async data |
| UX-4 | UX/UI | P1 | Low | 44px touch targets + strong active state in nav bar |
| DES-1 | Design | P1 | Medium | Dark/Light/System three-way theme |
| UX-1 | UX/UI | P2 | Medium | 3-screen first-time onboarding flow |
| UX-3 | UX/UI | P2 | High | Timeline view for Day screen |
| FE-3 | Frontend | P2 | Medium | Stream AI suggestions (real-time typewriter effect) |
| FE-4 | Frontend | P2 | High | Offline read mode + change queue |
| BE-5 | Backend | P2 | Medium | Supabase real-time sync between participants |
| BE-4 | Backend | P2 | Low | Server-side exchange rate cache |
| DES-3 | Design | P2 | Medium | Design token centralization |
| DES-2 | Design | P3 | Low | Glass usage audit and hierarchy fix |
| DES-4 | Design | P3 | Medium | Typography 5-level scale |
| UX-2 | UX/UI | P3 | Low | Invite modal UX overhaul |
| UX-5 | UX/UI | P3 | Low | Empty states with illustrations and CTAs |
| FE-1 | Frontend | P3 | High | Zustand store decomposition into 4 slices |
| FE-5 | Frontend | P3 | Low | Next.js Image optimization |
| DES-5 | Design | P3 | Medium | Motion audit and micro-interactions |
| BE-3 | Backend | P4 | High | Cursor pagination for trips and lazy event loading |

---

*Document version: 1.0 — Approved items will be tracked in the sprint board.*
