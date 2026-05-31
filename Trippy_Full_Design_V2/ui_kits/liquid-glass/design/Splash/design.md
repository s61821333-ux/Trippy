# Splash — design spec

**File:** `hero.jsx` › `Splash` · **Route:** `stage = 'splash'` (auto-advances to
`welcome` after **1900ms**). Inherits `GLOBAL.design.md`.

## Purpose
A 1.9-second branded "ignition" moment while the app boots. Sets the warm,
premium tone before any UI appears.

## Layout
- Full-bleed, centered column. No status-bar offset (hero screen).
- **Background:** a warm sunset mesh — three stacked radials (sand `oklch(62% .13 78)`
  top-left, terra `oklch(55% .16 36)` bottom-right, forest `oklch(40% .10 158)`
  bottom) over a forest→ink linear base.
- **Orbit ring:** a 520px circle, `1px` white @14% border, slowly floating
  (`.a-float`) — suggests a compass dial / globe.
- **Logo lockup:** glass disc (124px, white @16%, `blur(20px)`, inner highlight) →
  paper disc (90px `#F4EFE8`) → `CompassMark` 64px. Enters with `.a-pop`.
- **Wordmark:** "Trippy" white + sand period, `.a-rise .d2`.

## Motion
- Logo: `.a-pop` (scale 0.9→1.03→1, spring).
- Wordmark: `.a-rise` delayed `.d2`.
- Ring: continuous `.a-float` (±5px, 4s).
- Exit: replaced by Welcome (no explicit transition; Welcome plays its own entrance).

## Tokens
Mesh colors inline (not themed — splash is always the warm brand moment). Discs
use glass recipe values. Compass via `--compass-*`.

## States / i18n / dark
Single state. Not localized (logo only). Theme-independent (always warm).

## Notes
Timing is fixed in `app.jsx` `useEffect`. If you add async boot work, gate the
transition on it instead of the timer.
