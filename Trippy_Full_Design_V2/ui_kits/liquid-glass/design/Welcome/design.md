# Welcome — design spec

**File:** `hero.jsx` › `Welcome` · **Route:** `stage = 'welcome'` → `onContinue` →
`home`. Inherits `GLOBAL.design.md`.

## Purpose
First real screen. Establishes brand promise and routes into the app with one
primary action.

## Layout
- Full-bleed warm gradient (terra radial top over a terra→deep-terra linear).
- **Floating compass** disc (96px paper `#F4EFE8`) pinned ~110px from top,
  `.a-float`, with a strong drop shadow — the "hero object."
- **Glass card** (`.lg .lg-strong`, radius `--lg-r-lg`, margin 20) pinned to the
  bottom, centered text:
  - Wordmark "Trippy." in `.display-xl` 52px, forest + terra period.
  - Italic serif tagline 19px terra: *"Plan together. Discover more."*
  - 14px body paragraph (max 280px), `--text-2`.
  - **Primary CTA** `Btn kind="forest"` full-width, uppercase mono label +
    arrow: *"Start an adventure."*
  - Mono footer row: Document · Discover · Collaborate (terra dot separators).

## Motion
- Card: `.a-rise` (slides up).
- Compass: `.a-float`.
- CTA: spring tap (`.lg-btn:active`).

## Tokens
Forest CTA = `.lg-btn-forest` (gradient + `--lg-glow-forest`). Card = glass-strong.
Headline uses `.display-xl`.

## i18n / dark
- All strings via `t()` — tagline, body, CTA, footer chips localize to Hebrew.
- In RTL the card text aligns naturally (centered); arrow flips.
- Theme-independent visually (always warm welcome), but text colors use tokens so
  dark still reads.

## Notes
Single CTA only — resist adding secondary buttons here; the choice is "begin."
