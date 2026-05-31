# Dashboard — design spec

**File:** `dash.jsx` › `Dashboard` · **Route:** `stage='trip'`, `tab='dashboard'`.
The centerpiece. Inherits `GLOBAL.design.md`.

## Purpose
The cinematic "trip cockpit" — one glance answers *where, when, who, what's next,
am I ready, what should I do.*

## Layout (scrolls, paddingBottom 110)
1. **Cinematic hero** (`.hero-mesh`, full-bleed behind status bar, paddingTop 52,
   bottom radius 34):
   - Soft terra radial glow top-trailing corner.
   - Top row: eyebrow "Active trip" · settings gear (`.lg-dark`) · share · crew
     avatars (overlapping, dark ring).
   - **Destination eyebrow** (sand mono) → **`.display-xl` 52px white** trip name.
   - **Status chip row** (`.lg-dark` pills): live countdown (pulsing terra dot +
     "N days to go") · **weather** "24° · NYC" (sun icon) · **local time** "09:41"
     (clock, mono).
   - **Day-journey scroller:** horizontal rail of day chips (50×62), day 1 active
     (terra gradient + glow), rest glass-on-dark. Tap → Day detail.
2. **AI summary card** (forest gradient + `--lg-glow-forest`, big faded sparkle):
   eyebrow "Trip summary", one-paragraph status, "See suggestions →". Tap → AI sheet.
3. **Next up** — featured `.lg` row: Stamp 56 (plane), sky eyebrow (day · time
   range), serif 22px title, location. Tap → Day 1.
4. **Quick stats** — two `.lg` cards:
   - **Packed** `Ring pct={62}` (terra) + label.
   - **Budget** serif "$1,372", progress bar (46%), "of $3,000" mono.
5. **Today preview** — eyebrow "Today · Day 1" + "N Days" link; list of
   `TODAY_EVENTS` (time · stamp · title · place · duration).

## Motion
Hero name/eyebrow/chips `.a-rise` staggered (`.d1`–`.d3`); day scroller `.d3`;
cards `.a-rise` with incremental delays; AI sparkle decorative.

## Data
`trip` prop (from `TRIPS`); `TODAY_EVENTS` constant. Weather/time/budget are
representative static values.

## Tokens
Hero `.hero-mesh` + `.lg-dark`. AI card = forest gradient. Stats/next-up/today =
`.lg`. Ring color terra. Sky eyebrow `--lg-sky`.

## i18n / dark
- `t()` on every label incl. the AI summary sentence, "days to go", "Packed",
  "Budget", "of", "Today", "Next up". Numbers/prices unchanged.
- RTL: avatars use `margin-inline-start`; glow uses `inset-inline-end`; chevron/
  arrow glyphs flip.
- Dark: hero unchanged (already dark); body cards → dark glass; ring/track adapt.

## Notes
This screen is the answer to "one strong leading design." Keep the hero dark and
editorial; everything below is calm glass so the hero always wins the eye.
