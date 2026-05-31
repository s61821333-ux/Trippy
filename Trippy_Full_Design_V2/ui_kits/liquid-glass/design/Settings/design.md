# Settings — design spec

**File:** `explore.jsx` › `SettingsScreen` (+ `Toggle`, `Row`) · **Route:**
`tab='settings'`. Inherits `GLOBAL.design.md`. **Controls global `theme` + `lang`.**

## Purpose
Appearance, accessibility, and trip preferences — and the live switches for
**dark mode** and **Hebrew**.

## Layout (flat screen, scrolls)
- Eyebrow "Trip & preferences" + `.display-xl` 38px "Settings".
- **Appearance** card `.lg`: three-up selector **Light / Dark / System** (icon +
  label, forest fill + glow when active) → calls `onTheme(id)`.
- **A11y** card: rows with `Toggle` — **High contrast** (on by default),
  **Reduce motion**.
- **Trip** card: rows — **Currency** (chevron), **Language** with an inline
  **EN / עב** segmented switch → `onLang()` flips the whole app to RTL+Heebo;
  **Export as PDF** (chevron).
- **Delete trip** — danger button (`--danger-bg` / `--danger`).
- Version footer (mono).

## Components
- `Toggle` — 50×30 pill, knob springs 20px, forest track + glow when on.
- `Row` — icon chip (glass) + title/sub + right slot; optional `onClick`.

## Interaction
Theme buttons set `theme` in `app.jsx` (`dark` applies `data-theme="dark"` to the
screen). Language row/segment toggles `lang` (`'en'⇄'he'`) → `dir` + Heebo + `t()`.

## Motion
Cards `.a-rise` staggered; theme/toggle selections spring.

## Tokens
Active = forest + `--lg-glow-forest`. Danger semantic. Chevrons flip in RTL.

## i18n / dark
- Every label via `t()` incl. theme names, a11y rows, Currency/Language/Export,
  "Delete trip".
- This screen is where dark & Hebrew are toggled — verify both from here.
- Dark: cards → dark glass; toggles/selectors keep forest accents.

## Notes
Currency / Export / System-follow are represented but not wired to real logic in
the kit. High-contrast & Reduce-motion toggles are local-state placeholders that
mirror the `prefers-*` intents.
