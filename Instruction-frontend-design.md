# Trippy — Full App Map & Improvement Instructions (Agent Brief)

> **Mission:** Work through this document **one issue at a time**. Each numbered item is a self-contained task: read the *Problem*, apply the *Fix*, verify the *Done-when*, commit, then move to the next item. Never batch unrelated fixes into one change.
>
> **Repo:** `https://github.com/s61821333-ux/Trippy` · **Live:** `https://letsexploring.com`
> **Stack:** Next.js 16 · React 19 · Tailwind v4 · Framer Motion · Supabase · Zustand
> **Design system:** "Jelly Liquid Glass" — tokens in `app/globals.css` + `tokens/design-system.ts`. Brand voice & content rules live in `Lauguage.md` (root) — treat it as binding for all copy work.

---

# PART A — FULL APP MAP

Read this first so you know what exists. Every fix in Part B refers back to this map.

## A1. Routes & entry points

| Route | File | What it is |
|---|---|---|
| `/` | `app/page.tsx` | Public landing: compass logo, wordmark, "Volunteering demo" label, `LandingSignIn` (OAuth), `LandingLangToggle`. Redirects to `/app` if an `sb-*-auth-token` cookie resolves to a user. |
| `/app` | `app/app/page.tsx` → `AppShell` | The whole product. One client shell, screens switched by Zustand `screen` state (no sub-routes). |
| `/join` | `app/join/` | Invite-link entry. Stashes trip id in `sessionStorage('trippy-pending-join')`, auto-loads after auth. |
| `/auth` | `app/auth/` | Supabase OAuth callback handlers. |
| `/account` | `app/account/` | Account management. |

## A2. Shell architecture (`app/components/AppShell.tsx`)

- **Providers:** `I18nProvider` → `ToastProvider` → `MotionConfig` (reducedMotion: `'always'` when user toggled, else `'user'`).
- **Watchers (headless):** `OfflineWatcher` (online/offline events, flushes `pendingChanges`), `BudgetAlertWatcher` (80% / over-budget toasts), `SyncErrorWatcher` (RLS / auth / join failures → toast).
- **Boot:** full-screen `CompassLoader` (160px) + LTR-isolated "Trippy." wordmark until `mounted && authResolved`.
- **Screen switch:** `AnimatePresence mode="wait"` + `screenVariants` from `lib/motion.ts`. Screens: `splash/home → Home_V2`, `dashboard`, `day`, `map`, `crew`, `supplies`, `settings`, `notes`.
- **Global overlays:** `TourOverlay`, `WishlistSheet`, `PersonaSheet`, `AISheet` (lazy), `SecuritySettings`, `MFAChallenge`, `TermsModal`, `TripEntryAnimation`, global loading overlay (`isGlobalLoading`, CompassLoader 200px).
- **Banners/indicators:** offline banner (top), "Saving…" pulse pill (bottom, above nav).
- **Modes wiring:** `data-dark`, `data-high-contrast`, `data-reduced-motion` attributes + `trippy-dark` cookie; `dir` from `useI18n().isRTL`; iOS pull-to-refresh suppression via `touchmove` preventDefault.

## A3. Screens

| Screen | File | Key contents |
|---|---|---|
| **Home (trip picker)** | `screens/Home_V2.tsx` | Dark `hero-mesh` header (wordmark, avatar, logout, greeting eyebrow, "Where to next?" display title) · Create-trip CTA · Resume banner · trips grid (stamp, date range, serif title, avatar, arrow/loader) · `CreateSheet` (theme scroller w/ 7 stamp themes, name, start/end dates, day count, `CountriesInput`, currency select auto-derived, nickname, create button) · hidden `PlanWithAISheet` entry. |
| **Dashboard** | `screens/Dashboard_V2.tsx` (~1,500 lines) | Hero (trip name, countdown / current day, live destination clock 30s tick, weather) · AI Budget Coach card · Weather-aware reschedule alerts · "Next up" event · Quick stats (Packed · Budget w/ `Ring`) · Today's schedule · Empty-trip CTA · Destination Intelligence cards (per country, max 3) · Calendar heatmap (collapsible) · `BudgetEditSheet`, `ExpenseSheet` (summary ring, change budget, `BudgetBreakdown` category bars, quick-add expense, expense list) · invite link creation. |
| **Day / Explore** | `screens/DayDetail_V2.tsx` (~1,400 lines) | Sticky header (back, day pills scroller, weather chip) · `HotelAnchor` (start/end) + `HotelSheet` · event list as `DraggableEvent` (Framer `Reorder`, drag handle) wrapping `EventAccordion` (expand: cost, location, notes, edit/reschedule/suggest/delete) · `TimelineView` (13 hour ticks) · `DayMapView` (lazy Leaflet, route polyline, Google-Maps deep link w/ ≤8 waypoints) · `AddEventSheet` (16 core + ~20 extended categories, duration presets `30m…6h/Custom`, time, cost, `PlacesInput`) · `RescheduleSheet` (move to other day/time) · 2 mobile FABs. |
| **Map** | `screens/Map_V2.tsx` | Full-screen Leaflet · floating glass search bar (`type="search"`, clear button) · day-filter chips · event pin popups (category stamp, open-in-Google-Maps) · selected-event card · export/share · empty state. |
| **Crew** | `screens/Crew_V2.tsx` | Dark hero · invite card (create/copy link, email invite) · crew list (avatars, roles) · pending invitations received. |
| **Packing** | `screens/Packing_V2.tsx` | Header · progress card (count, %, ring) · category filter rail (`All/Documents/Gear/Health/Food/Water/Other`) · swipe-to-delete `PackingItem` rows with spring `CheckCircle` · section dividers per category · `AddItemSheet` (auto-categorize via regex) · `AIPackingSheet` (suggest items, multi-select, add). |
| **Settings** | `screens/Settings_V2.tsx` | Back btn · Trip group (edit name/dates, currency picker sheet, language EN/עב segment, Export-PDF row) · Appearance (Light/Dark/System 3-button group) · Accessibility (High-contrast toggle) · Security row → `SecuritySettings` · Switch trip · Delete trip (confirm overlay) · version footer. |
| **Notes** | `screens/NotesScreen.tsx` | Shared trip notes (small screen, plain textarea-style). |

## A4. Sheets & overlays (all use `ui/Sheet.tsx`: bottom sheet, or full-screen slide-in when `full`)

`CreateSheet`, `PlanWithAISheet` (3 steps: form w/ chip groups → generating w/ progress msgs → preview → creates trip), `AISheet` (`Sheets_V2.tsx` — persona-aware streaming suggestions, `SuggCard` w/ rating/price dots/chips/source attribution/add-to-day, rotating loading messages, dismiss/exclude), `PersonaSheet` (taste profile before suggestions), `WishlistSheet` (saved ideas w/ optional `PlacesInput` location), `HotelSheet`, `AddEventSheet`, `RescheduleSheet`, `ExpenseSheet`, `BudgetEditSheet`, `AIPackingSheet`, `SecuritySettings` (MFA enroll), `MFAChallenge`, `TermsModal`, `TourOverlay` (8-step spotlight tour), `TripEntryAnimation` (country stamps fly-in on trip open).

## A5. Navigation (`NavBar_V2.tsx`)

- **Menu FAB** (52px, hamburger→45° rotate) opens **expand panel**: Switch trip · Notes · Crew · Settings · ─ · Log out.
- **Tab pill** (66px tall, 5 × 50px tabs): Dashboard("Home"/ראשי) · Day("Explore"/גלה) · Map(מפה) · Pack(ציוד) · Wishlist (action, opens sheet). Active **terracotta gradient blob** springs between tabs (`stiffness 380/damping 32`), RTL-aware (mirrors via `right` anchor + negative x).
- **AI FAB** (sparkle + "AI" micro-label) → `PersonaSheet`. **Add FAB** exists in code but `onAdd` is never passed from AppShell (dormant).
- Hidden behind menu only: Notes, Crew, Settings (no tab).

## A6. Component & control inventory (`app/components/ui/`)

| Control | File | Notes |
|---|---|---|
| Solid buttons | `Btn.tsx` | `kind`: forest / terra etc., `full` width. |
| Glass buttons | `GlassBtn.tsx` | variants incl. `ghost`, sizes; `lg-btn`, `lg-btn-forest`, `lg-btn-terra` CSS classes used directly too. |
| Chips | `Chip.tsx` + ad-hoc chip groups (`PlanWithAISheet ChipGroup`) | pills, selected = brand fill. |
| Text/date fields | `Field.tsx` | glass input, label, icon, `type="date"` supported. |
| Toggle | `Toggle.tsx` **and a duplicate local `Toggle` in `Settings_V2.tsx`** | iOS-style switch. |
| Selects | native `<select>` (currency, etc.) styled inline. |
| Country autocomplete | `CountriesInput.tsx` | multi-chip + suggestions. |
| Place autocomplete | `PlacesInput.tsx` | `type="search"`, geocoding, lat/lng capture. |
| Sheet | `Sheet.tsx` | dismissable bottom sheet / full slider; backdrop. |
| Toast | `Toast.tsx` | `useToast().show(msg)` — single-string API. |
| Progress ring | `Ring.tsx`, `.donut-ring` | budget/packing. |
| Skeleton | `Skeleton.tsx` + `.shimmer` | loading placeholders. |
| Icons (line) | `Icon.tsx` | 24×24 stroke-1.5 set (~40 names). **No `logout` glyph — screens reuse `x`.** |
| Stamps | `StampIcon.tsx` + `lib/stampIcons.ts` | 200 circular illustrated seals. |
| Compass mark | `CompassMark.tsx` | theme-adaptive via `--compass-*` vars. |
| Loaders | `TripLoaders.tsx` | `CompassLoader` (signature multi-orbit), `RouteLoader`, plus sync/arc/twinkle/shimmer/float keyframe set. Used at: boot, global overlay, screen lazy-fallback, button-level (22px), trips-list. |
| World clock | `WorldClock.tsx` | destination local time. |
| Currency | `CurrencyAmount.tsx`, `lib/currency.ts` | symbol map, per-trip currency. |

## A7. Effects & motion vocabulary

- **Glass:** `.lg` / `.lg-strong` (blur 40–48px, saturate 1.85, directional 1px border, specular `::before` sheen), `.v2-card`, `.card-solid`, grain overlay.
- **Backgrounds:** `hero-mesh` cinematic dark gradient heroes; ambient `body::before/::after` drifting orbs; `.scene-dune` warm blobs.
- **Motion:** blur-fade-up entrances (opacity + y14 + stagger), jelly spring `cubic-bezier(0.34,1.56,0.64,1)`, snap `(0.25,0,0,1)`, `whileTap scale 0.9–0.97`, `.press`, `.hoverlift`, nav blob spring, swipe-to-delete (Packing), drag-reorder (Day), `TripEntryAnimation` stamp fly-in, Tour spotlight cutout.
- **Reduced motion:** OS `prefers-reduced-motion` kills CSS animations globally (0.001ms); manual toggle sets `MotionConfig reducedMotion="always"` + `data-reduced-motion` (only partially wired to CSS — see B15.4).

## A8. Modes & persistence

| Mode | Mechanism | Persistence |
|---|---|---|
| Light / Dark / System | `themeMode` in store → `data-dark` on `<html>` + `@media(prefers-color-scheme)` fallback keyed on `:root:not([data-dark="false"])` | `trippy-dark` cookie (SSR pre-paint) + store persist |
| High contrast | `data-high-contrast` token override block; auto-enables from `prefers-contrast: more` (never auto-disables) | store |
| Reduced motion | manual toggle + OS media query | store |
| English / Hebrew | `I18nProvider` (`lib/i18n.tsx`, ~1,000 keys en+he), `isRTL`, sets `<html lang dir>`; RTL re-points all font vars to **Assistant** | `localStorage('trippy-locale')` + `trippy-locale` cookie |
| Offline | `OfflineWatcher`, `pendingChanges` queue, flush-on-reconnect toast | store |
| Demo | trip exists w/o `tripDbId`; click counter `recordDemoClick` | — |
| Search | Map event search · `PlacesInput` · `CountriesInput` · Packing category rail (no free-text search) | — |

---

# PART B — ISSUES & FIX INSTRUCTIONS

## How to work (binding)

1. **One item per change.** Read the item, open only the files it names, fix, verify, commit with message `fix(<area>): <item id> — <summary>`.
2. **Verify in all six mode combinations** that touch the item: light/dark × EN/HE(RTL), plus high-contrast and reduced-motion when relevant.
3. **Never invent colors/fonts/spacing.** Use existing tokens from `app/globals.css`. If a needed token is missing, add it to `:root` *and* to `[data-dark="true"]` *and* `[data-high-contrast="true"]`.
4. **All user-facing strings go through `t()`** (`lib/i18n.tsx`). Add both `en` and `he` keys. Hebrew must follow `Lauguage.md` rules (group address, gender agreement, no translated-English).
5. **No emoji in product UI** — the brand book is explicit. Replace with line icons (`ui/Icon.tsx`) or stamps (`StampIcon`).
6. **Priority order:** work P0 → P1 → P2 → P3 within each section; sections themselves are ordered by user visibility.

---

## B1. Global shell (`app/components/AppShell.tsx`)

**1.1 — Offline banner: hardcoded English + emoji (P0)**
- *Problem:* `📡 You're offline — N changes will sync…` is English-only and uses an emoji. Hebrew users see English; brand forbids emoji.
- *Fix:* Add i18n keys `offlineViewing`, `offlinePendingOne`, `offlinePendingMany` (en + he, e.g. he: `אתם במצב לא מקוון — צופים בתוכנית השמורה` / `…— {n} שינויים יסונכרנו כשתחזרו לרשת`). Replace the emoji with `<Icon name="wind" …/>`? No — add a proper `offline` glyph (crossed wifi arc, stroke 1.5) to `Icon.tsx` and use it. Use `useI18n()` inside the banner (it renders inside `Shell`, provider is available).
- *Done when:* banner fully localized both directions, no emoji, icon inherits `var(--danger)`.

**1.2 — "Saving…" indicator: hardcoded English + off-brand sky-blue (P0)**
- *Problem:* The pending-write pill says `Saving…` (EN only) and its pulse dot uses `var(--lg-sky, #38bdf8)` — a blue that violates the no-purple-blue palette rule; fallback colors `rgba(30,30,30,.85)` / `#aaa` ignore tokens.
- *Fix:* Localize (`saving`: en `Saving…`, he `שומר…`). Dot color → `var(--lg-terra)` or `var(--forest)`. Pill surface → `className="lg"` or `var(--lg-panel)`; text → `var(--text-2)` without hex fallbacks. Keep `pointer-events: none`.
- *Done when:* pill matches glass system in light+dark, localized, no raw hexes.

**1.3 — BudgetAlertWatcher: hardcoded English, emoji, suspect math (P0)**
- *Problem:* `⚠️ Over budget! Exceeded by ${fmt(remaining)}` / `💛 80% of budget used…` — EN-only, two emoji, exclamation, and when over budget the store's `remaining` is likely negative or actually-remaining, so "Exceeded by" may print the wrong number. Number formatting is `'en-US'` always.
- *Fix:* (a) In `lib/store.ts`, confirm what `lastBudgetAlert.remaining` holds; pass an explicit `overBy` amount for the `over` case (`Math.abs(spent - budget)`). (b) Localize both messages per the brand's calm-failure tone: en `Over budget by {amt}. Worth a look before the next expense.` · he `חרגתם מהתקציב ב־{amt}. שווה הצצה לפני ההוצאה הבאה.`; 80% case: en `80% of the budget is used — {amt} left.` (c) `toLocaleString(locale === 'he' ? 'he-IL' : 'en-US')`. (d) Drop emoji.
- *Done when:* correct amounts in both alert types, localized, no emoji.

**1.4 — Toast API can't queue or style (P2)**
- *Problem:* `useToast().show(msg)` takes one string; success/warn/error all look identical, and rapid events overwrite each other.
- *Fix:* Extend `ui/Toast.tsx` with `show(msg, { kind: 'success' | 'warn' | 'error' })` mapping to a 3px inline-start accent in `--forest` / `--sand-deep` / `--danger`, and a small FIFO queue (max 3, 3.5s each). Keep backward-compatible single-arg calls. Add `role="status"` (`aria-live="polite"`; `assertive` for errors).
- *Done when:* two toasts fired back-to-back both appear; kinds render distinctly; screen reader announces.

**1.5 — Pull-to-refresh suppressor can deadlock nested scrollers (P2)**
- *Problem:* The global `touchmove` preventDefault walks up for `overflow-y:auto|scroll` only; horizontal scrollers (day pills, theme picker, filter rails) at their top can get their vertical pan eaten, and `overflow: overlay/scroll` on `html` is skipped.
- *Fix:* In the walk, also allow when the ancestor scrolls horizontally (`overflowX` auto/scroll and `scrollWidth > clientWidth`) and the gesture is mostly horizontal (`|dx| > |dy|` — track `touchStartX` too).
- *Done when:* on iOS Safari, horizontal rails scroll freely while pull-to-refresh stays disabled.

**1.6 — Add FAB is dead code (P3)**
- *Problem:* `NavBar_V2` renders an Add FAB only when `onAdd` is passed; AppShell never passes it.
- *Fix:* Decide with the owner: either wire `onAdd` to context-sensitive add (Day → AddEventSheet, Packing → AddItemSheet) or delete the prop + button block. Do not leave dormant UI.

---

## B2. Navigation bar (`app/components/NavBar_V2.tsx`)

**2.1 — Wishlist tab not translated (P0)**
- *Problem:* `labelHe: 'Wishlist'` — the only English label in the Hebrew tab bar.
- *Fix:* `labelHe: 'משאלות'`. Verify it fits 50px width at the tab font size after fix 2.2 (if not, use `רשימה`).

**2.2 — Tab labels 8px / AI label 7px — illegibly small (P0)**
- *Problem:* `fontSize: 8` uppercase tracking labels under the icons and `fontSize: 7` on the AI FAB are below any legibility floor; on 5 tabs × 50px this is the primary wayfinding text.
- *Fix:* Raise to 10px (tabs) and 9px (AI), reduce `letterSpacing` to `0.03em`. If Hebrew labels overflow, drop `textTransform` for he (uppercase is meaningless in Hebrew) and allow 11px since Hebrew has no caps. Check blob width still covers.
- *Done when:* labels readable at arm's length on a 375px viewport, no wrap/clip in either language.

**2.3 — aria-labels hardcoded English (P1)**
- *Problem:* `aria-label="Menu"`, `ariaLabel: 'Overview' | 'Day planner' | …`, `aria-label="Main navigation"` never localized — Hebrew screen-reader users get English.
- *Fix:* Move tab `ariaLabel` to i18n keys (`navOverview`, `navDayPlanner`, `navMap`, `navPacking`, `navWishlist`, `navMenu`, `navMain`) and resolve through `t()`.

**2.4 — Menu panel item order & destructive separation (P2)**
- *Problem:* Log out sits one hairline divider below Settings in the same panel; the panel has no `role="menu"` semantics and no focus trap; Escape works but focus isn't returned to the FAB.
- *Fix:* Add `role="menu"` / `role="menuitem"`, focus first item on open, return focus to the menu FAB on close, arrow-key navigation. Keep Log out visually distinct (already `--danger`) and add a confirm step only if `pendingChanges.length > 0` (warn: unsynced changes).

**2.5 — RTL blob & panel verification (P1)**
- *Problem:* Blob mirroring uses `[isHe ? 'right' : 'left']: PILL_PAD` + negated x — correct in principle, but the expand panel and FAB row ordering are physical (`display:flex` default direction inherits `dir`, fine) while the panel anchors centered. Verify no drift at tab 5 in he.
- *Fix:* Manual QA in he: tap each tab, confirm blob lands exactly under it; if off, compute `blobX` from measured `offsetLeft` instead of index math.

---

## B3. Landing page (`app/page.tsx`, `LandingSignIn.tsx`, `LandingLangToggle.tsx`)

**3.1 — Positioning copy contradiction (P0)**
- *Problem:* Metadata title says `Trippy — Volunteer Trip Planner`, the page label says `Volunteering demo`, but the product (and brand book) is a *friends trip planner*. First impression is confused, and "demo" undermines trust on a production domain.
- *Fix:* Confirm intent with owner. Default: title `Trippy — Plan trips with friends`, replace the demo eyebrow with the tagline `Together, the easy way.` (he: per brand book, e.g. `ביחד, בקלות.`), keep mono-eyebrow styling. Update `app/layout.tsx` metadata + OpenGraph.

**3.2 — Landing has no value proposition (P1)**
- *Problem:* Logo + wordmark + two OAuth buttons. A new visitor gets zero explanation before being asked to sign in.
- *Fix:* Add ONE short line under the wordmark (brand welcome voice: "Hey — ready to plan something? Add a few friends and tell us roughly where you're heading. We'll do the rest." / Hebrew equivalent), and optionally a single `card-solid` strip of three mono eyebrows (PLAN TOGETHER · VOTE · COUNT DOWN). Do **not** add stock imagery, gradients, or feature grids — calm, editorial, nothing more. Ask owner before adding anything beyond the one line.

**3.3 — Sign-in error/cancel states (P1)**
- *Fix:* Audit `LandingSignIn.tsx`: OAuth popup blocked, user-cancelled, network fail must each show a calm localized message (brand error voice), not a silent stall or console error. Verify the loading state on each provider button uses `CompassLoader` at button scale (22px) like the rest of the app.

**3.4 — Landing dark mode + RTL pass (P2)**
- *Fix:* With OS dark + `trippy-locale=he` cookie: verify `.landing-header`, `.landing-card`, footer links, and the lang toggle all flip correctly (tokens exist — just QA), and the compass SVG uses `--compass-*` vars rather than fixed fills (in `app/page.tsx` it currently uses `var(--terra)/var(--brand)/var(--sand)` — confirm those resolve in dark).

---

## B4. Home / trip picker (`screens/Home_V2.tsx`)

**4.1 — Hero title "Where to next?" hardcoded English (P0)**
- *Problem:* The single most prominent line in the app never translates; Hebrew users get an English headline with a hard `<br/>`.
- *Fix:* i18n keys `homeHeroTitle` (en `Where to\nnext?`, he `לאן\nנוסעים?`), render with `white-space: pre-line` instead of `<br/>`. Subtitle is already bilingual — move it to keys too (`homeHeroSub`).

**4.2 — Logout button uses the "x" icon (P0)**
- *Problem:* The hero's sign-out button is an ✕ in a circle — reads as "close", not "sign out". Same `x` is reused for Log out in the nav menu.
- *Fix:* Add a `logout` glyph to `ui/Icon.tsx` (door + arrow: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>`, stroke 1.5, round caps — consistent with set). Use it here and in NavBar's menu panel. Localize `aria-label` (`signOut`: en `Sign out`, he `התנתקות`).
- *Done when:* no ✕ used anywhere to mean logout.

**4.3 — Dates always formatted `en-US` (P0)**
- *Problem:* `formatDateRange` uses `toLocaleDateString('en-US')` and a hardcoded `→`; Hebrew shows "Mar 4 → Mar 10" inside RTL text, with a wrong-direction arrow.
- *Fix:* Create one shared helper `lib/dates.ts → formatDateRange(start, days, locale)`: locale `'he' → 'he-IL'`, join with `–` (en dash, direction-neutral) instead of `→`. Replace all call sites: `Home_V2`, `Settings_V2` trip row, `Dashboard_V2.dayDateLabel`, `DayDetail_V2.dayDateStr/dayPillLabel` (those already take locale — route them through the shared helper anyway).
- *Done when:* `grep -rn "'en-US'" app/ lib/` returns only intentional cases (none in UI).

**4.4 — Inline `locale === 'he' ? … : …` ternaries instead of t() (P1)**
- *Problem:* ~10 strings in this file ("All your trips, right here.", "Pick up where you left off", "Resume trip", "ימים/days", currency hint, end-date validation…) bypass the dictionary — they can't be audited by the `Lauguage.md` content process.
- *Fix:* Move every inline ternary in this file into `lib/i18n.tsx` keys. Mechanical; keep copy identical for now (content rewrite is a separate pass, B19).

**4.5 — Avatar palette + white ring break brand & dark mode (P1)**
- *Problem:* `AVC` includes `#A03CB4` (magenta) and `#1E91AF`; the brand has no purple/magenta. `TripAvatar` ring is `0 0 0 2px #fff` — glows on dark surfaces.
- *Fix:* Define a tokenized avatar palette in `globals.css` (6 hues drawn from forest/terra/sand/teal-adjacent oklch, e.g. replace `#A03CB4` with `oklch(55% 0.09 30)` and `#1E91AF` with `oklch(55% 0.07 200)`), expose as `--avatar-1…6`, and ring → `0 0 0 2px var(--bg)`. Update the **identical duplicated `AVC` array in `Crew_V2.tsx`** from the same tokens (see also B20.2).

**4.6 — "Plan with AI" entry hidden (P1)**
- *Problem:* `showAIPlan` state + lazy `PlanWithAISheet` exist, but the launch button is commented out (`hidden for now`) — dead weight, and the flagship AI feature is unreachable from Home.
- *Fix:* Confirm with owner. If shipping: add a secondary `lg` glass button under the Create CTA — icon `sparkle`, text key `planWithAI` (en `Plan it with AI`, he `תכנון עם AI`), opening `setShowAIPlan(true)`. If not shipping: delete the state, import, and sheet render. **This is the "AI button on homepage" item — do it deliberately, not as a leftover.**

**4.7 — CreateSheet polish (P2)**
- a) Theme scroller mask uses `linear-gradient(to right, …)` — invert for RTL (`to left`) or use `mask-image` with logical direction by swapping when `isRTL`.
- b) `THEME_STAMP` has a `space` entry but `THEMES` has no `space` theme — remove the orphan or add the theme.
- c) End-date `<` start-date is only caught on submit — also clamp the end-date input's `min` attribute to `cDate`.
- d) The day-count line and currency hint: move to t() (covered by 4.4) and verify the date inputs render usable in dark mode (`color-scheme: dark` rule exists — QA it).

**4.8 — Empty state for zero trips (P1)**
- *Problem:* `(tripsLoading || trips.length > 0)` hides the whole section when a new user has no trips — they see only the create button, no reassurance.
- *Fix:* Add the brand-book empty state under the CTA when `!tripsLoading && trips.length === 0`: en `No trips yet. The compass doesn't mind sitting still — but it's better with a destination.` he equivalent; style: `eyebrow-lg` + serif italic line, with a small `CompassMark`, no card chrome.

---

## B5. Dashboard (`screens/Dashboard_V2.tsx`)

**5.1 — Off-brand chart colors (P1)**
- *Problem:* `STRIPE_COLORS` and `CAT_COLORS` include `#6B5CE7` (purple) and `#A03CB4` (magenta) — explicit brand violations, used in budget breakdown bars and category chips.
- *Fix:* Replace with brand-adjacent oklch values (define `--chart-1…8` tokens: terracotta, sand gold, forest, teal `oklch(55% 0.07 210)`, rust `oklch(48% 0.10 40)`, moss `oklch(60% 0.08 130)`, clay `oklch(65% 0.06 60)`, ink-soft). Use the same token list for `catColor()` and stripes so categories are stable across charts.

**5.2 — `buildAiSummary` & coach copy audit (P1)**
- *Fix:* Read the generated sentences in both languages against `Lauguage.md`: no "amazing/perfect/unforgettable", active voice, group address in Hebrew, correct gender agreement. Verify the AI Budget Coach card has: loading (CompassLoader 22px), error with retry button (calm copy), and empty (no budget set → invite to set one) states. Numbers through `CurrencyAmount`.

**5.3 — Destination Intelligence cards (P1)**
- *Fix:* Audit `DestinationIntelCard` data source for correctness and coverage: what renders for a country with no entry? Must show nothing (preferred) or a graceful "—", never `undefined`. Verify `INTEL_ICONS_HE` ordering matches EN and the card is fully RTL-safe (rows flip, icons stay start-aligned). Cap of 3 countries: add `+N more` indicator if `trip.countries.length > 3`.

**5.4 — Weather alerts & schedule (P2)**
- *Fix:* Weather fetch failure currently silent — acceptable, but ensure no skeleton is left pulsing forever; collapse the section. Reschedule-alert copy through t(), with day links (`onGoToDay`) keyboard-focusable. The 30s clock interval must clear on unmount (verify).

**5.5 — Calendar heatmap (P3)**
- *Fix:* The collapsible toggle needs `aria-expanded` and a localized label; heatmap day cells need `title`/`aria-label` ("Day 4 — 3 activities"). Verify colors come from tokens and have dark variants.

**5.6 — Quick stats & ExpenseSheet (P2)**
- *Fix:* In `ExpenseSheet`: quick-add input should accept decimal commas for he-IL; expense rows need swipe- or button-delete with confirm toast + undo (match Packing's interaction); "Change budget" button → t(). Ring percentages: clamp display at 999%+ overflow.

---

## B6. Day / Explore (`screens/DayDetail_V2.tsx`)

**6.1 — Duration presets English-only (P0)**
- *Problem:* `DUR_LABELS = ['30m','1h','1h 30m','2h','3h','4h','6h','Custom']` render as-is in Hebrew.
- *Fix:* Localize display while keeping the minute map as the source of truth: he → `30 דק׳`, `שעה`, `שעה וחצי`, `שעתיים`, `3 שעות`, `4 שעות`, `6 שעות`, `מותאם`. Build labels from `DUR_MINS` + locale formatter rather than a parallel array.

**6.2 — Duplicate EventAccordion (P1)**
- *Problem:* A full `EventAccordion` is defined inline here AND in `screens/explore/EventAccordion.tsx` — they will drift.
- *Fix:* Diff the two; keep the richer one in `screens/explore/EventAccordion.tsx`, import it here, delete the inline copy. No visual change allowed.

**6.3 — Drag-reorder affordance & a11y (P1)**
- *Fix:* The drag handle needs `aria-label` (localized "Reorder activity"), `role="button"`, and a keyboard fallback (Move up / Move down in the accordion's action row). Verify Reorder works with RTL layout (Framer Reorder is axis-based — vertical, should be fine; QA it).

**6.4 — Google Maps deep link silently drops stops (P2)**
- *Problem:* `buildGoogleMapsUrl` caps at 8 waypoints; days with more lose stops without notice.
- *Fix:* When truncating, toast: en `Google Maps allows 10 stops — opened the first part of the day.` he equivalent. Also URL-encode names (verify), and label the button "Open route in Google Maps" via t().

**6.5 — TimelineView fixed 13-hour window (P2)**
- *Fix:* `TICKS = 13` starting at a fixed hour — events before/after the window clip or vanish. Compute first/last tick from min/max event times (floor/ceil to hour, min 8 ticks), so late-night plans render.

**6.6 — DayMapView loading gradient hardcoded light colors (P2)**
- *Problem:* The Leaflet lazy-loading placeholder is a fixed light-sage gradient — flashes blinding in dark mode.
- *Fix:* Replace with `background: var(--bg-alt)` + 28px `CompassLoader` centered (consistent with every other loading state).

**6.7 — Day pills scroller (P2)**
- *Fix:* Active day pill should auto-scroll into view on day change — but **do not use `scrollIntoView`**; use `container.scrollTo({ left: pill.offsetLeft - …, behavior: 'smooth' })`. RTL: verify offset math mirrors.

**6.8 — AddEventSheet category grid (P2)**
- *Fix:* 16 core + extended categories behind "More" — verify the toggle is localized, `aria-expanded`, and that every category has a Hebrew label (the arrays carry he strings — spot-check all ~36 for gender/spelling). Cost field: numeric keyboard (`inputMode="decimal"`).

---

## B7. Map screen (`screens/Map_V2.tsx`)

**7.1 — Search bar hardcoded English (P0)**
- *Problem:* `placeholder="Search events…"`, `aria-label="Search events"`, `aria-label="Clear search"` — EN-only on a primary surface.
- *Fix:* Keys `mapSearchPlaceholder` (en `Search activities…`, he `חיפוש פעילויות…`), `mapSearchClear`. Input already `type="search"`; add `dir="auto"` so Hebrew queries align right.

**7.2 — Search has no result feedback (P1)**
- *Fix:* When `visibleEvents.length === 0` with an active query/filter, show a floating glass empty card: en `Nothing matches "{q}". Try another word or clear the day filter.` + clear-filters button; add `aria-live="polite"` results count for screen readers. When the trip has zero geocoded events at all, show the brand empty state pointing to the Day screen ("Add a location to an activity and it lands on the map.").

**7.3 — Day filter chips (P2)**
- *Fix:* Verify chips localize ("All days"/`כל הימים`, day labels through the shared date helper from B4.3), horizontal rail is RTL-mirrored, and the active chip meets contrast in dark mode.

**7.4 — Leaflet dark mode & RTL (P1)**
- *Fix:* Check `ui/LeafletMap.tsx`: if tiles are standard OSM, dark mode shows a glaring light map under dark chrome. Apply a dark tile style or a CSS `filter: brightness(.75) hue-rotate(…)` fallback on `[data-dark="true"] .leaflet-tile-pane` (test legibility), and verify attribution stays readable + popup cards use glass tokens. Zoom controls: ensure ≥44px hit targets and logical-side placement in RTL.

**7.5 — Pin/selected-card interplay (P2)**
- *Fix:* Selecting a pin should scroll/zoom it into view with `map.panTo` (never DOM scrollIntoView), and the selected card needs a close affordance + swipe-down dismiss to match Sheet behavior.

---

## B8. Packing (`screens/Packing_V2.tsx`)

**8.1 — Hebrew items never auto-categorize (P1)**
- *Problem:* `autoCategory()` regexes are English-only (`passport|visa|…`); items typed in Hebrew all fall to `Other`.
- *Fix:* Extend each regex with Hebrew equivalents (`דרכון|ויזה|כרטיס|ביטוח` → Documents; `תרופה|פלסטר|משחה` → Medical; `מים|בקבוק` → Water; `אוהל|פנס|שק שינה|מטען` → Gear; `חטיף|אוכל|שימורים` → Food). Keep it one function; add unit test with mixed-language list.

**8.2 — 'Health' filter vs 'Medical' store category (P2)**
- *Problem:* UI filter says Health, data category is Medical, mapped by `storeToFilter` — two names for one concept leaks into labels and the AI sheet.
- *Fix:* Pick one user-facing word (Health / `בריאות`) everywhere; keep `Medical` only as the stored enum. Centralize labels in `getCatLabel` and delete `STORE_CAT_LABELS` back-compat const after migrating call sites.

**8.3 — Swipe-to-delete: discoverability + RTL direction (P1)**
- *Fix:* (a) Swipe must mirror in RTL (reveal on the logical end). (b) Add a fallback delete in a long-press/3-dot menu since swipe is invisible to many users. (c) After delete, toast with **Undo** (5s) — restores the item; deleting from a shared list is destructive for the whole crew.

**8.4 — Progress card & filter rail (P2)**
- *Fix:* Progress strings through t() (`{packed}/{total} packed`, he `{packed}/{total} נארזו`); rail chips: `role="tab"`-like semantics already `role="group"` — add `aria-pressed`; rail mask/scroll RTL mirror (same fix pattern as B4.7a).

**8.5 — AIPackingSheet (P2)**
- *Fix:* Verify: loading uses CompassLoader + localized rotating messages (reuse pattern from `Sheets_V2`), suggestions render without emoji, every suggested item maps to a valid category, the select-all/none controls are localized, failure → calm retry copy. Items added should respect current filter so they visibly appear.

---

## B9. Crew (`screens/Crew_V2.tsx`)

**9.1 — Invite flow states (P1)**
- *Fix:* Audit the invite card: copy-link must confirm with toast (en `Link copied — anyone with it can join.` he `הקישור הועתק — כל מי שמקבל אותו יכול להצטרף.`), clipboard API failure fallback (select+copy), email invite validation + sent/failed states. Confirm the link format matches `/join` handler and works logged-out (stash → auth → auto-join, already wired in AppShell — test end-to-end).

**9.2 — Avatar palette duplication (P1)**
- *Fix:* Covered by B4.5 — consume the same `--avatar-*` tokens; delete this file's local `AVC`.

**9.3 — Roles, removal, and self (P2)**
- *Fix:* Verify the crew list distinguishes owner vs member, prevents removing yourself/owner without confirmation, and pending invitations have accept/decline with localized labels and a count badge. Empty crew state: brand-voice line encouraging the first invite (this screen is the heart of "plan with friends" — it must not be an afterthought).

---

## B10. Wishlist (`screens/WishlistSheet.tsx`)

**10.1 — Sheet/nav interplay (P2)**
- *Fix:* The nav blob highlights the Wishlist tab while the sheet is open (`wishlistOpen`) — verify closing via backdrop returns the blob to the underlying screen instantly (no stuck state). Escape key must close it.

**10.2 — Item lifecycle (P2)**
- *Fix:* Each wishlist item should offer "Add to a day" (→ RescheduleSheet-style day picker), not just sit there. Verify add/edit/delete all toast with localized confirmations and the optional `PlacesInput` location renders a map pin when set (cross-link with Map screen pins for wishlist items is a candidate feature — **ask owner first**, do not build unprompted).

---

## B11. AI surfaces (`Sheets_V2.tsx`, `PersonaSheet.tsx`, `PlanWithAISheet.tsx`, Budget Coach, AIPackingSheet)

**11.1 — Emoji throughout PlanWithAISheet options (P0)**
- *Problem:* `TRAVELER_OPTIONS` (🧳❤️👨‍👩‍👧…), `PACE_OPTIONS` (🌴⚖️…), `INTEREST_OPTIONS` (🍜🏛…), `BUDGET_OPTIONS` (💸💳…) — dozens of emoji on a flagship surface; the brand book's *only* anti-pattern example is emoji-laden copy.
- *Fix:* Replace every `emoji:` with a `stamp:` key from the 200-stamp atlas (`lib/stampIcons.ts` — e.g. solo→`backpack`, couple→`hearts`?? pick real keys from the atlas; food→`noodles`, nature→`pine_tree`, budget→`coins`). Render `StampIcon size={28}` in the chips. Where no stamp fits, use a line icon. Zero emoji remain.

**11.2 — PROGRESS_MSGS English-only + generic AI phrasing (P0)**
- *Problem:* `'Planning perfect meals…'` etc. — untranslated AND uses banned superlative style.
- *Fix:* Replace with localized, concrete pairs (follow the existing `LOADING_MSGS_EN/HE` pattern in `Sheets_V2.tsx`): en `Mapping the days…` / `Sorting mornings from evenings…` / `Checking distances…`; he `מסדרים את הימים…` / `בודקים מרחקים…`. Route through one shared `useRotatingMessages(msgs, intervalMs)` hook used by all three AI loading states (Sheets_V2, PlanWithAI, AIPacking) — delete the duplicated rotation logic.

**11.3 — `CAT_LABEL` and `priceDots` English-only (P1)**
- *Fix:* In `Sheets_V2.tsx`: category labels need he variants (reuse the canonical category label map from DayDetail's CATS arrays — extract to `lib/categoryTokens.ts` which already exists, single source); `priceDots` `'Free'` → t() key `free` (he `חינם`).

**11.4 — Suggestion lifecycle (P1)**
- *Fix:* Verify: stream abort on sheet close (AbortController — exists in PlanWithAI; confirm AISheet too), error state with retry (calm copy), dismissed suggestions persist to `exclude` so they don't return, "Add to day" confirms with toast + the event actually lands with category/time mapped. Long descriptions clamp at 3 lines with expand.

**11.5 — PersonaSheet flow (P2)**
- *Fix:* AI FAB always opens PersonaSheet; returning users should skip straight to suggestions with their saved persona and a small "Edit taste" link inside AISheet. Verify persona answers persist per trip and the sheet is fully bilingual.

**11.6 — Budget Coach + summary tone unification (P2)**
- *Fix:* All AI-written sentences (coach, `buildAiSummary`, suggestions descriptions) should pass the `Lauguage.md` critic checklist. Add a server-side instruction (in the API route) to write in the brand voice + target language so AI output is born compliant rather than patched client-side.

---

## B12. Settings (`screens/Settings_V2.tsx`)

**12.1 — Wrong row icons (P1)**
- *Problem:* Currency row uses the `download` icon; Language row uses `share` — semantically wrong glyphs picked from a limited set.
- *Fix:* Add `coins` (two stacked circles) and `globe` (circle + meridians) glyphs to `ui/Icon.tsx` (24×24, stroke 1.5, round caps) and use them. While there: the Export-PDF row's `calExport` is fine.

**12.2 — "Export as PDF" row is dead UI (P0)**
- *Problem:* The row has no `onClick` — it looks tappable (chevron!) and does nothing. i18n already contains `pdfComingSoon`, `tripExportedPDF`, `pdfPopupBlocked` keys — the feature is half-planned.
- *Fix:* Decide with owner: (a) implement print-view export (new `app/print/[tripId]` page with `@media print` styles, open via `window.open`, toast `pdfPopupBlocked` when blocked), or (b) remove the row. If neither this sprint: minimum viable honesty — `onClick={() => show(t('pdfComingSoon'))}`. Never leave a silent dead row.

**12.3 — Untranslated section labels & theme options (P1)**
- *Fix:* Eyebrow `Trip` is hardcoded; `t('Appearance') || 'Appearance'` pattern means the key probably doesn't exist (the `||` masks it). Audit every `t('X') || 'X'` in this file — add real keys (`settingsTrip`, `appearance`, `highContrast`, `highContrastSub`, `languageLabel`, `exportPDF`, `exportPDFSub`, theme option labels Light/Dark/System → he `בהיר/כהה/אוטומטי`) and remove the `||` fallbacks so missing keys fail loudly in dev.

**12.4 — Duplicate Toggle component (P2)**
- *Fix:* Delete the local `Toggle` in this file; use `ui/Toggle.tsx` (extend it with the `label`/aria props if missing). One switch implementation app-wide.

**12.5 — Trip dates `en-US` + delete confirm (P1)**
- *Fix:* Trip row date range → shared helper (B4.3). Delete-trip confirm overlay: verify it names the trip ("Delete 'Lisbon week'? This removes it for all 6 of you."), requires an explicit destructive button (danger fill), traps focus, and Escape cancels. Copy through t() in brand voice (calm, consequence-first).

**12.6 — Version footer (P3)**
- *Fix:* `Trippy · v2.0 · Liquid Glass` — read version from `package.json` at build (env var) instead of hardcoding, keep the mono styling.

---

## B13. Security, MFA, Terms (`SecuritySettings.tsx`, `MFAChallenge.tsx`, `TermsModal.tsx`)

**13.1 — MFA flows bilingual + error states (P1)**
- *Fix:* Audit both files: every label, instruction, and error (wrong code, expired, network) localized; code input uses `inputMode="numeric"` + `autoComplete="one-time-code"`; the challenge overlay cannot be dismissed by backdrop (security), but Sign-out escape hatch is present (it is — keep). Verify enroll QR has a copyable secret fallback.

**13.2 — TermsModal (P2)**
- *Fix:* Verify: scrollable content with safe-area padding, accept button disabled until scroll-end? (decide with owner), decline path exists (sign out), bilingual, and `termsChecked` flow doesn't flash for returning users (AppShell already gates — QA it).

---

## B14. Onboarding tour (`TourOverlay.tsx`)

**14.1 — Emoji in every step (P0)**
- *Problem:* 👋🗓️🤝🗺️➕✨🎒🚀 as step art + ⚡ inside body copy — brand violation, and the ⚡ refers to "Yellow ⚡ badges" which must match what the UI actually renders.
- *Fix:* Replace `emoji:` field with `stamp:`/`icon:` rendered via `StampIcon` (welcome→compass stamp, days→calendar stamp, crew→people stamp, etc.). Rewrite body copy to reference the real UI ("the gold *free time* chip", not "⚡ badges") — verify each claim against the current Dashboard/Day UI; the tour describes UI that may have drifted.

**14.2 — Hebrew gender & group address (P1)**
- *Problem:* `אתה מוכן!`, `בוא נסייר`, `תכנן`, `עקוב`, `הזמן` — masculine singular throughout; brand voice addresses the group.
- *Fix:* Rewrite all `bodyHe/titleHe` in plural/neutral: `אתם מוכנים!`, `בואו נסייר`, `תכננו`, `עקבו`, `הזמינו`. Run every string through the `Lauguage.md` Hebrew checklist.

**14.3 — Spotlight robustness (P2)**
- *Fix:* `findTourEl` queries selectors that can be absent (element below fold, screen changed). Each step must: skip gracefully when target missing (centered card, no cutout — verify), re-measure on resize/orientation (add listener), and the card must clamp within viewport in RTL. "Skip tour" available on every step, localized.

---

## B15. Dark mode — systematic sweep

**15.1 — Hardcoded light-mode values in components (P0)**
- *Fix:* Run `grep -rn "#fff\|#FFF\|rgba(255\|rgba(0,0,0\|#1A1410\|#FBF7F0" app/components/` and triage every hit: keep only where genuinely mode-invariant (text on a brand-color fill, e.g. white on terracotta blob — fine). Known offenders to fix: `TripAvatar` ring (B4.5), `DayMapView` placeholder (B6.6), `TripLoaders` RouteLoader pin dot `#FBF7F0` → `var(--bg)`, Home theme-picker pastel `bg` hexes (add dark variants: keep accent, swap bg to `oklch(25% …)` tints via a `darkBg` field).
- *Done when:* flipping dark mode on every screen shows no white flashes, light cards, or unreadable text.

**15.2 — Theme switch completeness QA (P1)**
- *Fix:* With each of Light/Dark/System: verify `<html data-dark>` updates live, the `trippy-dark` cookie is written, a hard reload pre-paints correctly (no flash), and System responds to a live OS change (the `matchMedia` listener exists — test it). Check the `:root:not([data-dark="false"])` media-query trick holds on the landing page where JS hasn't set the attribute.

**15.3 — Dark mode for third-party surfaces (P1)**
- *Fix:* Leaflet tiles (B7.4), native `<select>` dropdowns, date/time pickers (`color-scheme: dark` rule exists for inputs — extend to `select`), scrollbars (`::-webkit-scrollbar-thumb` uses tokens — verify dark values).

**15.4 — Manual reduced-motion toggle doesn't stop CSS animations (P1)**
- *Problem:* OS-level `prefers-reduced-motion` zeroes all animations via the global media query, but the **in-app toggle** only sets `MotionConfig` + `data-reduced-motion`, which CSS handles for `.skeleton` and body orbs only — CompassLoader orbits, shimmer, pulse keep spinning.
- *Fix:* Add `[data-reduced-motion="true"] *, [data-reduced-motion="true"] *::before, [data-reduced-motion="true"] *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }` mirroring the media query block (keep the loaders' `role="status"` so waiting is still communicated; consider letting `CompassLoader` render a static mark in this mode).

**15.5 — High contrast QA (P2)**
- *Fix:* With `data-high-contrast` (and the dark+HC combo): glass surfaces must gain solid backgrounds and visible borders (token block exists — walk every screen), the nav blob/labels must hit ≥4.5:1, and focus outlines remain visible. Fix by adjusting the HC token block only — never per-component.

---

## B16. Hebrew / RTL — systematic sweep

**16.1 — Hardcoded English strings inventory (P0)**
Fix each (most are covered by section items above — this is the checklist):
| File | String |
|---|---|
| `AppShell.tsx` | offline banner, `Saving…`, budget alerts |
| `NavBar_V2.tsx` | `labelHe: 'Wishlist'`, all aria-labels |
| `Home_V2.tsx` | `Where to next?`, `aria-label="Sign out"`, inline ternaries |
| `Map_V2.tsx` | `Search events…`, `Clear search`, export labels |
| `DayDetail_V2.tsx` | `DUR_LABELS`, `Day ${n}` fallbacks |
| `Sheets_V2.tsx` | `CAT_LABEL`, `Free` |
| `PlanWithAISheet.tsx` | `PROGRESS_MSGS`, option `desc` fields |
| `Settings_V2.tsx` | `Trip`, theme labels, `t('X') \|\| 'X'` fallbacks |
| `Dashboard_V2.tsx` | `INTEL_ICONS` EN labels path, `DAY` fallback, coach strings |
- *Done when:* switching to Hebrew shows **zero** Latin UI strings except the wordmark "Trippy." and "AI".

**16.2 — Physical CSS properties → logical (P1)**
- *Fix:* `grep -rn "marginLeft\|marginRight\|paddingLeft\|paddingRight\|left:\|right:\|textAlign: 'left'\|textAlign: 'right'\|'to right'\|'to left'" app/components/` — convert to `marginInlineStart/End`, `insetInlineStart/End`, `textAlign: 'start'`, and direction-aware gradients/masks (B4.7a, B8.4). Exceptions: truly physical positioning (nav blob math already handles RTL explicitly — leave, but comment it).

**16.3 — Date/number locale (P0)** — covered by B4.3; additionally sweep `toLocaleString('en-US'` (BudgetAlertWatcher, CurrencyAmount) → locale-aware.

**16.4 — Bidi isolation for mixed content (P2)**
- *Fix:* User-generated trip/event names (often Latin) inside Hebrew sentences need `unicode-bidi: isolate` (wrap in `<bdi>` or apply the existing wordmark pattern). Check: trip cards, toasts interpolating names, Settings trip row, delete-confirm.

**16.5 — Hebrew copy quality pass (P1)**
- *Fix:* After 16.1, run the full `Lauguage.md` Phase 2–4 process over `lib/i18n.tsx`'s `he` object: gender agreement, group address (אתם), no translated-English, Waze-test directness. Output the audit table to `/content-audit/` as that doc specifies.

---

## B17. Search modes

**17.1 — Map search (P0/P1):** B7.1 + B7.2.
**17.2 — PlacesInput (`ui/PlacesInput.tsx`) (P1)**
- *Fix:* Verify: debounce (≥300ms), loading indicator inside the field, localized empty result ("No places found — try the city name"), keyboard navigation (↑↓ + Enter, `role="listbox"/"option"`, `aria-activedescendant`), Hebrew query support against the geocoder (pass `accept-language` per locale), and `dir="auto"` on the input.
**17.3 — CountriesInput (`ui/CountriesInput.tsx`) (P1)**
- *Fix:* Same checklist as 17.2; plus chips removable by keyboard (Backspace + ✕ button with localized aria), and country names displayed in the UI locale (use `Intl.DisplayNames(locale, { type: 'region' })` if the data layer stores ISO codes; if it stores English names, map through DisplayNames where possible).
**17.4 — Packing free-text filter (P3)**
- *Fix:* Long lists are filterable only by category. Propose (ask owner) a small search field above the rail reusing the Map search styling; trivial filter on item name.

---

## B18. Loaders & waiting states — consistency contract

**18.1 — One loader system (P1)**
- *Fix:* Every wait >300ms uses `CompassLoader` at the established scales (boot/global 160–200, section 56, button 22) — sweep for stray spinners, bare "Loading" text, or skeletons used where a loader exists. Skeleton (`.shimmer`) is reserved for content-shaped placeholders (lists, cards) — Dashboard weather/intel cards should use skeletons, not blank space, while fetching.
**18.2 — Loader a11y (P2)**
- *Fix:* `CompassLoader` has `role="status" aria-label="Loading"` — localize the label via prop (`t('loading')`), and ensure long operations (AI generation) pair the loader with the rotating text in an `aria-live="polite"` region so progress is announced.
**18.3 — Timeouts (P2)**
- *Fix:* Global loading overlay (`isGlobalLoading`) has no escape: add a 20s watchdog that swaps to calm error copy + Retry / Back buttons (brand error voice). Same for AISheet streaming (abort at 60s with retry).

---

## B19. Content audit (cross-cutting)

**19.1 — Execute `Lauguage.md` (P1)**
- *Fix:* After B16.1 consolidates strings into `lib/i18n.tsx`, run the repo's own content-audit process end-to-end over both locales: inventory → flag (generic AI phrases: the CreateSheet subtitle `A few details and the adventure begins.` is a borderline case — rewrite per brand: en `A few details and you're off.`) → rewrite → critic pass → report in `/content-audit/`. Known emoji-in-copy to strip: `✓` in sync toasts is fine (typographic), `📡⚠️💛` are not.

---

## B20. Code health (enables everything above)

**20.1 — Split the mega-files (P2)**
- *Fix:* `Dashboard_V2.tsx` (~73KB) → extract `BudgetEditSheet`, `ExpenseSheet`, `BudgetBreakdown`, `DestinationIntelCard`, `CalendarHeatmap`, `WeatherAlerts` into `screens/dashboard/`. `DayDetail_V2.tsx` (~57KB) → extract sheets into `screens/day/`. Pure moves, no behavior change, one extraction per commit.
**20.2 — Deduplicate (P2)**
- *Fix:* One `Avatar` (Home `TripAvatar` + Crew `Avatar` → `ui/Avatar.tsx` with `--avatar-*` tokens); one `Toggle` (B12.4); one `EventAccordion` (B6.2); one rotating-messages hook (B11.2); one date-range formatter (B4.3).
**20.3 — Dead code & legacy CSS (P3)**
- *Fix:* `globals.css` "Legacy classes → visually neutral" block (`.readability-overlay`, `.ambient-orb`, `.emoji-glow`…) — grep usages; delete class + rule when unused. Remove `STORE_CAT_LABELS` back-compat (B8.2), dormant Add FAB (B1.6), hidden PlanWithAI entry resolution (B4.6).
**20.4 — Guard rails (P2)**
- *Fix:* Add a CI lint step: (a) fail on emoji codepoints in `app/components/**` source strings (allowlist: ✓ ✕ · — →), (b) fail on `toLocaleDateString('en-US'`/`toLocaleString('en-US'` in components, (c) fail on `t('…') || '…'` pattern. Add Playwright smoke specs per screen × {he, dark} using the existing `__trippySetState__` hook.

---

## Suggested execution order (sprint slices)

1. **P0 visibility batch:** B2.1, B2.2, B4.1, B4.2, B7.1, B6.1, B1.1, B1.2, B1.3, B12.2, B11.1, B11.2, B14.1, B15.1, B16.1, B16.3, B3.1
2. **P1 correctness batch:** B4.3–B4.6, B4.8, B5.1–B5.3, B6.2–B6.3, B7.2, B7.4, B8.1, B8.3, B9.1, B11.3–B11.4, B12.1, B12.3, B12.5, B13.1, B14.2, B15.2–B15.4, B16.2, B16.5, B17.2, B17.3, B18.1
3. **P2 polish batch:** everything remaining marked P2
4. **P3 / decisions queue:** B1.6, B5.5, B12.6, B17.4, B20.3 — each needs an owner decision first.

## Definition of done (per item)

- [ ] Fix applied in the named file(s) only; no drive-by changes
- [ ] Verified light + dark
- [ ] Verified EN + HE (layout mirrored, zero Latin leakage per B16.1)
- [ ] Strings via `t()` with both locales added
- [ ] No new hex colors — tokens only
- [ ] No emoji introduced
- [ ] Touch targets ≥44px, focus visible, aria labels localized
- [ ] `npm run lint` + existing Playwright tests pass
