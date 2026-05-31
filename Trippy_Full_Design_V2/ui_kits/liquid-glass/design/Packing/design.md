# Packing — design spec

**File:** `explore.jsx` › `PackScreen` · **Route:** `tab='supplies'`. Inherits
`GLOBAL.design.md`.

## Purpose
Shared, categorized packing checklist with visible progress.

## Layout (flat screen, scrolls)
- Eyebrow "Adventure prep" + `.display-xl` 38px "Packing".
- **Progress card** `.lg`: `Ring pct` (terra, 76px) + serif "Almost there" +
  "N/total packed · shared with crew".
- **Category rail** (`overflow-x:auto`): All / Documents / Gear / Health / Food,
  forest active pill.
- **Item list:** each row `.lg`, tappable — Stamp 38, item name (strikes through +
  60% opacity when done), mono category, trailing **check circle** (forest fill +
  glow when done, hollow ring when not). Filter by selected category.

## Interaction
Tap a row → toggles `done` in local state; ring + count update live with a spring.

## Data
Local `items` array `{ stamp, t, cat, done }`; `cats` list.

## Motion
Progress card `.a-rise`; ring animates `stroke-dashoffset` on change; row opacity
transition; check circle springs.

## Tokens
Ring/active = terra/forest. Cards `.lg`. Done check = forest + `--lg-glow-forest`.

## i18n / dark
- `t()` on heading, "Almost there", "packed · shared with crew", category names,
  and item labels. Counts/percent unchanged.
- RTL mirrors row (logical gap); strike-through is direction-agnostic.
- Dark: cards → dark glass; hollow ring uses neutral alpha that adapts.

## Notes
Progress is the hero here — keep the ring prominent. Category chips scroll rather
than wrap to preserve the single-glance rhythm.
