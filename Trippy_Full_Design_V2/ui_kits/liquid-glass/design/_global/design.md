# Trippy 2027 — Global Design Spec

The system-wide design language for the **Liquid Glass** redesign
(`ui_kits/liquid-glass/`). Every per-page doc in this folder inherits from this
file. Tokens live in `ds.css`; base type/neutrals in `../../../colors_and_type.css`.

> **Aesthetic in one line:** warm editorial travel app, Apple OS26 "Liquid Glass" —
> translucent frosted panels floating over warm paper, anchored by a cinematic
> dark "journey" hero, with spring-physics motion.

---

## 1. Canvas & responsivity

- **Reference device:** 402 × 872 (iPhone 16 Pro logical px), inside a bezel with
  `border-radius: 56px` and 13px padding. Screen radius `44px`.
- **Mobile-first, single column.** No multi-column breakpoints — the app is a phone
  surface. The bezel scales as a unit to fit any viewport (centered, letterboxed).
- **Fluid internals:** content uses `flex`/`grid` + `gap`; horizontal rails
  (`day pills`, `category chips`, `duration chips`) are `overflow-x: auto` with
  hidden scrollbars (`.lg-scroll`). Nothing is pinned to a fixed pixel width except
  the device frame.
- **Safe areas:** status bar reserves the top `50px`; the floating nav reserves
  ~`110px` at the bottom (screens set `padding-bottom: 110–130px`).
- **Status bar offset rule:** *hero* screens (Splash, Welcome, Home, Dashboard,
  Crew, Map) paint full-bleed **behind** the status bar; *flat* screens (Days,
  Pack, Settings) start **below** it (`paddingTop: 50`). Logic lives in `app.jsx`
  (`fullBleed`).
- **Hit targets:** ≥ 44px. Buttons are 38 (sm) / 44 / 52 (lg) tall; nav items
  58×50; FAB 64.

---

## 2. Color

Authored in **oklch** (perceptually uniform, P3-ready). Two themes via
`data-theme="dark"` on the screen element.

### Brand (light)
| Token | Value | Use |
|---|---|---|
| `--lg-forest` | `oklch(45% .135 158)` | primary actions, selection, success |
| `--lg-forest-deep` | `oklch(28% .085 160)` | gradient floor of forest buttons |
| `--lg-terra` | `oklch(58% .175 36)` | accent, active nav, high-intent CTA |
| `--lg-terra-bright` | `oklch(65% .195 34)` | gradient top of terra elements |
| `--lg-sand` | `oklch(76% .150 76)` | highlights, eyebrows on dark, never alone |
| `--lg-sky` | `oklch(58% .12 235)` | transport/flight category accent |
| `--lg-ink` | `oklch(15% .02 60)` | primary text |

### Neutrals (from `colors_and_type.css`)
Warm paper: `--bg`, `--bg-warm`, `--surface`; text `--text` / `--text-2` /
`--text-3`. A subtle **75° warm hue** runs through every "gray."

### Cinematic hero
`--hero-1/2/3` (deep forest → near-black warm) composited by `.hero-mesh`
(four stacked radial + linear gradients). Glass-on-dark chrome uses `.lg-dark`.

### Dark mode
`[data-theme="dark"]` remaps `--bg` to `oklch(17% .022 62)`, lifts brand chroma
(forest `62%`, terra `64%`), swaps glass panels to dark translucent
(`oklch(34% .026 62 / 55%)`), deepens shadows to pure-black alphas, and flips the
compass mark to its light variant. `.lg` inner highlights are dimmed.

### Semantic
`--danger` / `--danger-bg` (delete). Success = forest. Category colors are inline
per event: Flight `#2A4894`, Hotel `#A03CB4`, Sight `#C8944A`, Food `#9C3F2C`.

---

## 3. Surfaces — the Liquid Glass recipe

The signature element is **`.lg`**:
- `background: var(--lg-panel)` (white @ 60%), `backdrop-filter: blur(28px) saturate(1.9)`.
- **Three-layer edge:** outer `--lg-shadow` (warm-ink, never pure black) + inner
  top highlight `inset 0 1px 0 white/70%` + hairline `inset 0 0 0 1px white/22%`.
- **`::before` diagonal specular sheen** (135°, white 55% → transparent).
- `border-radius: 26px`, `overflow: hidden`; children sit at `z-index: 1`.

Variants: **`.lg-strong`** (80% opacity, blur 44 — sheets, floating controls),
**`.lg-dark`** (white @12% over the hero, pill-shaped chrome).

| Token | px |
|---|---|
| `--lg-r-card` | 26 |
| `--lg-r-lg` | 34 (sheets, welcome card) |
| `--lg-r-pill` | 9999 (buttons, chips, nav) |

**Shadows:** `--lg-shadow`, `--lg-shadow-lg`, plus colored glows
`--lg-glow-terra` / `--lg-glow-forest` for primary buttons & active states.

---

## 4. Typography

- **Display** — Instrument Serif, **italic**, `.display-xl` (titles, hero names).
  Sizes 34–52px. *In Hebrew this auto-swaps to Heebo 800 upright* (see §7).
- **Body / UI** — DM Sans 400–700, tight tracking (−0.01 to −0.02em). 13–16px.
- **Eyebrows / labels / data** — JetBrains Mono, `.eyebrow-lg` (10px, 0.2em,
  uppercase). Times, costs, codes.
- **Numbers** read big & serif (countdowns, budgets, ring %).

---

## 5. Motion

Two named curves drive everything:
- `--spring: cubic-bezier(.34,1.56,.64,1)` — overshoot "jelly" (nav blob, taps,
  toggles, selection).
- `--snap: cubic-bezier(.22,1,.36,1)` — decisive ease-out (entrances, accordions).

| Class | Effect | Use |
|---|---|---|
| `.a-rise` | translateY(18→0) | content entrance |
| `.a-pop` | scale 0.9→1.03→1 | stamps, map pins, focus panel |
| `.a-float` | ±5px loop, 4s | FAB, splash ring, hero compass |
| `.a-fade` | opacity in | overlays |
| `.d1`–`.d6` | 0.06s stagger steps | sequence lists/hero |

- **Tap:** `.lg-btn:active { scale(.95) }`.
- **Nav blob & tab icons:** spring-translate / spring-scale.
- **Accordion:** `max-height` transition on `--snap`.
- **Sheets:** `@keyframes sheetUp` translateY(102%→0) on `--spring`.
- **Reduce motion:** `@media (prefers-reduced-motion)` collapses all durations to
  ~0; a Settings toggle exposes the same intent.

> ⚠️ Entrance keyframes animate **transform only** (not opacity to 0) so content
> is never invisible if a frame is captured mid-animation.

---

## 6. Components (shared)

- **Buttons** `.lg-btn` + `-terra` / `-forest` (gradient + glow) / `-glass`.
- **Pill nav** `HoverNav` — sliding liquid blob, lifts active icon; a **menu handle
  expands** a panel with *Switch trip* + *Settings*; separate floating **+** FAB.
- **Bottom sheet** `Sheet` — `.lg-strong`, grab handle, glass close button, scrolls.
- **Field** `LGField` — glass input, forest focus ring + soft glow, logical-property
  padding (RTL-safe), `text-align: start`.
- **Ring** `Ring` — SVG circular progress (packing/budget).
- **Stamp / Icon / Avatar / CompassMark** — from the shared design system
  (`assets/trippy-stamps.js`, `trippy-icons.js`).
- **StatusBar** — dynamic-island pill, light/dark aware.

---

## 7. Internationalization (EN / עברית)

- `window.LANG` (`'en'|'he'`); `t(str)` looks up Hebrew by English source string
  (`i18n.jsx`), falling back to the source. Proper nouns & numbers pass through.
- **RTL:** the screen sets `dir="rtl"`; layout uses **logical properties**
  (`margin-inline-start`, `inset-inline-end`, `padding-inline-*`, `text-align:start`)
  so it mirrors automatically. Directional glyphs (chevrons, arrows) flip via
  `scaleX(-1)` keyed on `window.LANG`.
- **Font:** `[dir="rtl"]` swaps all families to **Heebo**; `.display-xl` becomes
  upright Heebo 800 (italic serif doesn't suit Hebrew).
- **Nav blob** recomputes its travel direction for RTL.

---

## 8. State model (`app.jsx`)

`stage` = `splash → welcome → home → trip`; within `trip`, `tab` ∈
`dashboard | day | map | supplies | crew | settings`. `sheet` ∈
`create | add | edit | ai | null`. `lang` and `theme` are global. Splash
auto-advances after 1.9s. Opening a trip sets `trip` + `stage='trip'`.

---

## 9. Voice

Warm, calm, confident — like a thoughtful friend. Plain words, short sentences,
second person to the group. **No emoji, no hype, no exclamation stacking.** See
the brand book / root `README.md` for the full content guide.
