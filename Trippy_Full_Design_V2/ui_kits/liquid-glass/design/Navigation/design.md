# Navigation (HoverNav) — design spec

**File:** `prims.jsx` › `HoverNav` · present on all `stage='trip'` screens.
Inherits `GLOBAL.design.md`.

## Purpose
The persistent floating control: switch primary tabs, reveal secondary actions on
focus, and add content — the interaction the brief specifically called out.

## Anatomy
- Floating cluster pinned bottom-center (paddingBottom 14), two pieces:
  1. **Tab bar** (`.lg .lg-strong`, pill, height 64): a **menu handle** (44px) +
     5 tabs (Trip/Days/Map/Pack/Crew), each 58×50, icon + mono label.
  2. **FAB** (`.lg-btn-forest`, 64 circle, `.a-float`): context add — opens the
     `add` sheet (or `create` on Crew).
- **Liquid blob:** an absolutely-positioned terra-gradient pill (58×50) that
  **springs** (`translateX`) to sit under the active tab; active icon lifts +
  scales, label turns white. Inactive = `--text-3`.

## Expand-on-focus (the requested behavior)
Tapping the **menu handle** toggles an **expanded panel** above the bar
(`.lg .lg-strong`, `.a-pop`) with two actions:
- **Switch trip** (swap icon, terra) → returns to Home (`onSwitch`).
- **Settings** (gear, forest) → opens the Settings tab (`onSettings`).
The handle chevron/menu glyph rotates 180° while open. Selecting a tab or an
action collapses it.

## RTL
The blob's anchor side and travel direction recompute for `window.LANG === 'he'`
(`left`↔`right`, sign-flipped `translateX`), so the active pill tracks correctly
in mirrored layout. Labels localize via `t()`.

## Motion
Blob & icons on `--spring`; expand panel `.a-pop`; handle rotation spring; FAB
floats; all taps spring-scale.

## Tokens
Bar `.lg-strong`; blob terra gradient + `--lg-glow-terra`; FAB forest gradient +
`--lg-glow-forest`.

## Notes
Keep exactly 5 primary tabs; overflow goes into the expand panel, not a 6th tab.
The FAB is deliberately separate from the bar so "add" never competes with
navigation.
