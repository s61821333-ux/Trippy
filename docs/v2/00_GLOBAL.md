# TRIPPY V2 — GLOBAL INTEGRATION, DESIGN RULES & BRANCH GUIDE

> **Crew:** All teams read this first. This file defines the rules every contributor must follow regardless of which area they work in.

---

## TABLE OF CONTENTS

1. [V2 Branch & GitHub Workflow](#1-v2-branch--github-workflow)
2. [Design System Rules (Non-Negotiable)](#2-design-system-rules)
3. [UI/UX Review Checklist (Before Every PR)](#3-uiux-review-checklist)
4. [Integration Checks (After Every Significant Change)](#4-integration-checks)
5. [File & Component Naming Conventions](#5-file--component-naming-conventions)
6. [State & Data Rules](#6-state--data-rules)
7. [Accessibility Baseline](#7-accessibility-baseline)
8. [Animation Rules](#8-animation-rules)
9. [Security Baseline](#9-security-baseline)
10. [Definition of Done](#10-definition-of-done)

---

## 1. V2 BRANCH & GITHUB WORKFLOW

### Branch Structure

```
main                    ← production (v1, always deployable)
  └── v2                ← v2 integration branch (staging)
        ├── v2/arch     ← architecture refactor (store slices, routing)
        ├── v2/security ← security fixes (must merge to main ASAP)
        ├── v2/perf     ← performance (fonts, lazy motion, zustand)
        ├── v2/design   ← design system, motion tokens, native feel
        ├── v2/features ← new features (one branch per feature)
        └── v2/hebrew   ← RTL/Hebrew support
```

### Rules

- **`main` is sacred.** Nothing merges to `main` without a passing CI check and one peer review.
- **Security fixes are the exception** — critical security patches (`02_SECURITY.md` Phase 1 items) may merge directly to `main` with expedited review. Document the bypass reason in the PR.
- **Every PR to `v2` must reference its doc file** — e.g. "Implements QW-1 from `03_PERFORMANCE.md`".
- **Squash commits** before merging feature branches into `v2`. One logical change = one commit.
- **Never force-push to `main` or `v2`.**

### Creating the V2 Branch

```bash
git checkout main
git pull origin main
git checkout -b v2
git push -u origin v2
```

### PR Template (copy into every PR description)

```markdown
## What this does
[1–2 sentences]

## Which doc this implements
[e.g. "03_PERFORMANCE.md — QW-1: next/font migration"]

## UI/UX checklist (tick all that apply)
- [ ] Tested on mobile (Chrome Android or iOS Safari)
- [ ] Tested in dark mode
- [ ] Tested in Hebrew / RTL
- [ ] Tested with reduced motion enabled
- [ ] No new hardcoded colors (using CSS tokens only)
- [ ] No new hardcoded font stacks (using CSS variables only)
- [ ] No console.log left in production code

## Integration checks passed
- [ ] App loads without errors
- [ ] Auth flow works
- [ ] Trip creation works
- [ ] At least one event can be added and saved
- [ ] Realtime sync fires without errors in console

## Screenshots / recordings
[Attach mobile screenshot or screen recording]
```

### Commit Message Convention

```
type(scope): short description

Types: feat | fix | perf | refactor | style | security | docs | test
Scope: auth | trip | day | supplies | nav | store | api | design | hebrew

Examples:
feat(day): add language cards to event rows
perf(store): slice zustand store into domain modules
security(api): add auth check to /api/places endpoint
fix(hebrew): apply dir=rtl to html element instead of scroll div
```

---

## 2. DESIGN SYSTEM RULES

These rules are absolute. Any PR that violates them will be rejected.

### Colors — Use Tokens Only

```
✅ color: var(--terra)
✅ background: var(--surface)
✅ border-color: var(--border)

❌ color: #C4714A          ← hardcoded primitive
❌ background: rgba(255,255,255,0.72)  ← should be var(--surface)
❌ color: oklch(48% 0.16 158)  ← inline primitive
```

**Full token list lives in `app/globals.css`.** If a color you need doesn't have a token, add the token first, then use it.

### Typography — Use CSS Variables Only

```
✅ font-family: var(--font-sans)
✅ font-family: var(--font-serif)
✅ font-family: var(--font-mono)

❌ font-family: 'Bricolage Grotesque', sans-serif  ← hardcoded
❌ font-family: system-ui  ← naked fallback
```

**Hebrew rule:** `[lang="he"]` overrides `--font-sans` to `var(--font-hebrew)`. Never override fonts inline for Hebrew content.

### Spacing — Use CSS Space Tokens

```
✅ padding: var(--space-4)       /* 16px */
✅ gap: var(--space-2)           /* 8px */
✅ margin-inline-start: var(--space-3)  /* 12px, RTL-safe */

❌ padding: 16px                 ← unless it's truly a one-off
❌ margin-left: 8px              ← use margin-inline-start (RTL-safe)
```

### RTL — Always Use Logical Properties

```
✅ margin-inline-start     not  margin-left
✅ margin-inline-end       not  margin-right
✅ padding-inline-start    not  padding-left
✅ border-inline-start     not  border-left
✅ text-align: start       not  text-align: left
✅ inset-inline-start: 0   not  left: 0
```

**Exception:** The brand name "Trippy." is always LTR — use `direction: ltr; unicode-bidi: isolate` on that span only.

### Glass Surfaces — Three-Layer Rule

Never stack more than 3 glass panels on top of each other. Glass hierarchy:
1. Navigation chrome (tab bar, top context bar) — `var(--nav-surface)` / 92% opacity
2. Cards / sheets — `var(--surface)` / 72% opacity
3. Overlays / modals — `var(--surface-strong)` / 88% opacity

Content inside cards is **never itself a glass panel.** Text on glass must pass 4.5:1 contrast ratio (WCAG AA).

### Dark Mode

Every new component must be visually tested in dark mode before merge. If the component uses any inline `background` or `color` value, it must respond to `[data-dark="true"]`.

---

## 3. UI/UX REVIEW CHECKLIST

Run this checklist on every PR that touches a screen or component.

### Interaction

- [ ] Touch targets ≥ 44×44px on all tappable elements
- [ ] No grey tap flash on iOS: `-webkit-tap-highlight-color: transparent` applied
- [ ] No text selection on non-text UI: `user-select: none` on buttons, nav, cards
- [ ] `touch-action: manipulation` on all interactive elements (eliminates 300ms tap delay)
- [ ] Swipe gestures don't interfere with page scroll (check dx/dy ratio guard)

### Scroll & Layout

- [ ] Scrollable containers have `overscroll-behavior-y: contain`
- [ ] Scrollbars hidden on mobile, styled on desktop (check `globals.css`)
- [ ] If a list has a day-strip or horizontal scroller, active item auto-scrolls into view
- [ ] Bottom-safe-area padding applied on any fixed bottom element

### Forms & Keyboard

- [ ] All `<input>` and `<textarea>` have `dir="auto"`
- [ ] Bottom-anchored forms use `useKeyboardAvoidance` hook
- [ ] Forms show validation errors inline, not via `alert()`

### States

- [ ] Empty state: every list/screen has a meaningful empty state with a call to action
- [ ] Loading state: every async operation shows a skeleton or spinner (not a blank flash)
- [ ] Error state: every async operation has an error boundary or fallback card
- [ ] Offline state: if data can't be fetched, show a "cached" or "unavailable" state

### Accessibility

- [ ] All icon-only buttons have `aria-label`
- [ ] All modals/sheets have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] All modals/sheets have a focus trap
- [ ] Active nav tab has `aria-current="page"`
- [ ] Custom checkboxes have `role="checkbox"` and `aria-checked`
- [ ] Toggle switches have `role="switch"` and `aria-checked`
- [ ] Color is never the **only** indicator of state (always pair with text or icon)

### Hebrew / RTL

- [ ] All new strings added to both `en` and `he` in `lib/i18n.tsx`
- [ ] Hebrew strings follow brand voice guidelines (`07_HEBREW.md` §2)
- [ ] New layout elements use logical CSS properties
- [ ] Framer Motion entrance animations use direction-aware `slideVariants(isRTL)`

---

## 4. INTEGRATION CHECKS

Run these after any change to the store, API routes, DB schema, or auth flow.

### Smoke Tests (manual, 5 min)

```
1. App loads from cold start → CompassLoader appears → Dashboard loads
2. Sign out and sign back in (Google OAuth)
3. Create a new trip with 2 days
4. Add 3 events on Day 1 (different categories)
5. Edit one event (change time)
6. Delete one event — confirm undo works
7. Add a supply item, mark it packed, unmark it
8. Add an expense
9. Navigate all 4 nav tabs without errors in console
10. Change language to Hebrew → UI mirrors correctly
11. Switch to dark mode → no hardcoded light colors visible
12. Go offline (DevTools → Network → Offline) → offline banner appears
13. Come back online → pending changes flush
```

### After Store Changes

- Run smoke tests 1–13 above
- Check `localStorage` in DevTools: persisted state shape matches new slice structure
- Verify `partialize` correctly excludes ephemeral state (no `aiSuggestions`, `isOffline`, etc. in storage)
- Check that realtime subscription still fires and applies updates without full reload

### After API Route Changes

- Test the route directly with a valid session cookie (use browser DevTools Network tab)
- Test the route **without** a session cookie → must return 401
- Test the route with a valid session but wrong `tripId` (trip you don't belong to) → must return 403
- Verify Zod validation: send malformed body → must return 400 with details

### After DB Schema Changes

- Run migration in Supabase SQL Editor on staging
- Verify RLS policies are applied to any new table: `SELECT * FROM pg_policies WHERE tablename = 'your_table'`
- Verify the client can read the table with an authenticated session
- Verify the client **cannot** read with the anon key alone (no session)
- Update `lib/types.ts` if the DB shape changed

### After Dependency Updates

- Run `npm run build` — zero TypeScript errors, zero build errors
- Run `npm run lint` — zero new lint errors
- Check bundle size: `npx @next/bundle-analyzer` — no unexpected size regressions

### Post-Deploy Checklist (Vercel)

- [ ] Check Vercel function logs for any runtime errors
- [ ] Verify environment variables are set: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_MAPS_API_KEY`, `ANTHROPIC_API_KEY`
- [ ] Check Vercel Analytics dashboard — no spike in errors
- [ ] Test on a real mobile device (not just browser DevTools)
- [ ] Confirm PWA install prompt works (add to home screen)

---

## 5. FILE & COMPONENT NAMING CONVENTIONS

```
app/
  components/
    screens/
      OverviewScreen/
        index.tsx          ← screen root — layout only, no data fetching
        HeroCard.tsx       ← PascalCase, one component per file
        WeatherStrip.tsx
    ui/
      GlassBtn.tsx         ← PascalCase
      Sheet.tsx
  api/
    trips/
      route.ts             ← always route.ts, never index.ts
      [tripId]/
        events/
          route.ts
lib/
  store/
    index.ts               ← combines all slices
    authSlice.ts           ← camelCase + Slice suffix
    tripSlice.ts
  motion.ts                ← animation tokens
  haptics.ts               ← haptic helpers
  format.ts                ← date/currency formatters
  weatherCache.ts          ← module-level caches
  routeCache.ts
```

**Rules:**
- Screen components live in `app/components/screens/`
- Reusable UI atoms live in `app/components/ui/`
- Business logic (no JSX) lives in `lib/`
- API utilities (no JSX) live in `lib/`
- Never put a `useEffect` with a fetch inside a UI atom component
- Never put inline styles that use raw hex colors or pixel values without a token

---

## 6. STATE & DATA RULES

### What Goes in Zustand

✅ Auth state (user, session, termsAccepted)  
✅ Active trip data (trip, tripDbId, activeDay)  
✅ UI state (screen, themeMode, showAddEvent)  
✅ Offline queue (pendingChanges)  
✅ Sync status (isOffline, lastSyncError, isGlobalLoading)  

❌ Fetched-once static data (country list, currency codes) — use module-level constants  
❌ Component-local UI (isExpanded, hovered, focused) — use `useState`  
❌ Derived values (totalExpenses, tripBudget) — use `useMemo` in the component, not store  
❌ Form state — use `useState` inside the form component  

### Optimistic Updates

Every mutation must follow the `withOptimistic` pattern:
```typescript
withOptimistic({
  apply:    () => set(applyChange()),   // immediate local state
  persist:  () => dbCall(),             // async DB write
  rollback: () => set(undoChange()),    // restore on failure
  onError:  (err) => toast.error(err),
})
```
Never modify store state after a DB call succeeds — apply first, persist second.

### Persistence

The `partialize` function in `store/index.ts` defines what survives page refresh.

**Persisted:** themeMode, highContrast, reducedMotion, hideBudget, locale, nickname, activeDay, tripDbId  
**Never persisted:** aiSuggestions, isOffline, isGlobalLoading, pendingInvitations, lastSyncError  
**Pending changes:** `pendingChanges` MUST be persisted (it is not currently — fix in v2).

---

## 7. ACCESSIBILITY BASELINE

Every shipped screen must meet WCAG 2.1 AA. Non-negotiable.

| Requirement | Rule |
|-------------|------|
| Color contrast | Text on surface: minimum 4.5:1 |
| Touch targets | Minimum 44×44px |
| Focus indicators | Visible 2px outline using `var(--terra)` |
| Screen reader | All icon buttons labeled with `aria-label` |
| Modals | `role="dialog"`, `aria-modal="true"`, focus trap, `aria-labelledby` |
| Checkboxes/toggles | `role="checkbox"/"switch"`, `aria-checked` |
| Navigation | Active tab: `aria-current="page"` |
| Forms | All inputs have associated `<label>` (visible or `aria-label`) |
| Live regions | Toast messages use `role="status"` or `aria-live="polite"` |
| Skip link | A visually hidden "Skip to content" link at the top of the DOM |
| Reduced motion | All Framer Motion springs collapse to 0.01s when `reducedMotion === true` |

---

## 8. ANIMATION RULES

All animation values must come from `lib/motion.ts`. No inline spring values in components.

```typescript
import { spring, duration, stagger } from '@/lib/motion';

// Use named presets:
transition={spring.snap}      // nav pills, active indicators
transition={spring.default}   // cards, list items
transition={spring.gentle}    // sheets, overlays
transition={spring.float}     // decorative elements
```

### Motion Budget

A screen should have **at most 3 simultaneous animations** at any point. Stagger list items — don't animate all at once.

### Performance Rules

- All `motion.X` → `m.X` (LazyMotion). No exceptions after the LazyMotion migration.
- `useTransform` with an inline function: extract to `useMemo` or a named constant.
- Never animate `width`, `height`, or `top/left` — animate `transform` and `opacity` only.
- `filter: blur()` on full-viewport elements: use `will-change: transform` and cap blur radius at 16px for mobile.

### Reduced Motion

```typescript
// Always check before any motion:
const { reducedMotion } = useAppStore(s => s.reducedMotion);
// OR use Framer Motion's built-in:
<MotionConfig reducedMotion="user">
```

---

## 9. SECURITY BASELINE

Every API route must have these three lines at the top before any business logic:

```typescript
// 1. Get authenticated user (never getSession() — always getUser())
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// 2. Validate input with Zod
const parsed = MySchema.safeParse(await request.json());
if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

// 3. Verify trip membership (for any tripId route)
const { data: participant } = await checkClient
  .from('trip_participants').select('user_id')
  .eq('trip_id', tripId).eq('user_id', user.id).maybeSingle();
if (!participant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

**See `02_SECURITY.md` for the full audit and remediation plan.**

---

## 10. DEFINITION OF DONE

A task is **done** when:

- [ ] Code is written and working locally
- [ ] UI/UX checklist (§3) is fully ticked
- [ ] Integration smoke tests (§4) pass
- [ ] No TypeScript errors (`npm run build` clean)
- [ ] No new ESLint errors (`npm run lint` clean)
- [ ] PR description filled out with template (§1)
- [ ] Mobile screenshot or recording attached to PR
- [ ] Tested in dark mode
- [ ] Tested in Hebrew/RTL (if UI change)
- [ ] Tested with reduced motion (if animation change)
- [ ] Security baseline (§9) applied (if new API route)
- [ ] Peer reviewed and approved
- [ ] Merged to `v2` branch (or `main` for critical security fixes)

---

*This document is the source of truth for all contributors. When in doubt, ask — don't assume.*
