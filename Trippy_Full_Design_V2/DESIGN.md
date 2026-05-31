# Trippy — Design System

> *"Plan trips with friends. Together, the easy way."*

**Trippy** is a collaborative, AI-assisted **trip planner**. A small crew of friends
builds a shared, hour-by-hour itinerary in real time — pick a destination, invite
people by link, vote on plans, pack together, split the budget, and watch the
countdown. The product is a mobile-first PWA (codebase name: *desert-trip-planner*)
with a warm, editorial, calm personality the team calls **"Jelly Liquid Glass."**

This folder is a self-contained design system: brand foundations, color + type
tokens, real visual assets (compass mark, two icon systems, the compass loader),
component specimens, and a clickable UI-kit recreation of the app.

---

## Sources

Everything here was reverse-engineered from materials the team provided. You may
not have access, but they're recorded so you can go deeper if you do:

- **GitHub — app codebase:** `https://github.com/s61821333-ux/Trippy`
  Next.js 16 + React 19 + Tailwind v4 + Framer Motion + Supabase. The source of
  truth. Key files: `tokens/design-system.ts` (token object), `app/globals.css`
  (1,200-line CSS layer), `app/components/ui/*` (primitives),
  `app/components/screens/*` (full screens). **Browse this repo to build
  higher-fidelity Trippy work than this system alone allows.**
- **Brand Book** (`uploads/Trippy Brand Book _standalone_.html`) — 16-page brand
  guide: essence, the mark, anatomy, color, type, voice & tone, in-context.
- **Icon Atlas** (`uploads/Trippy Icon Atlas _standalone_.html`) — "Volume II,"
  200 illustrated stamp seals across 12 chapters.
- **Globe / Compass Loader** (`uploads/Globe Loader _standalone_.html`) — the
  signature multi-orbit wait state.

---

## Content fundamentals

**Voice:** *"Like a thoughtful friend who's done this before."* Warm, never breezy.
Confident, never bossy. The three brand adjectives are **Warm · Calm · Confident**.

**Rules**
- **Plain words, short sentences.** Say the useful thing, then stop.
- **Second person, to the *group*** — "your six friends can edit anything," not
  "the user." Trippy is about a crew, not an individual.
- **No emoji. No hype. No exclamation stacking.** Save the single exclamation mark
  for a genuine celebration. The brand book's explicit *Avoid* example:
  ~~"OMG! Let's gooo!! 🎉 Time to plan your epic adventure 🚀"~~
- **Calm even in failure** — errors reassure: "Couldn't save that change. We've kept
  your last version safe — try again when you're back online."
- Sentence case for almost everything; UPPERCASE only for mono eyebrows/labels.
- Editorial serif moments are allowed for taglines ("Together, the easy way.").

**Tone by surface (from the brand book)**
| Surface | Example |
|---|---|
| Welcome | "Hey — ready to plan something? Add a few friends and tell us roughly where you're heading. We'll do the rest." |
| Push | "Mia voted for the Lisbon week. You're up — 3 days, then we lock it in." |
| Empty state | "No trips yet. The compass doesn't mind sitting still — but it's better with a destination." |
| Error | "Couldn't save that change. We've kept your last version safe — try again when you're back online." |
| Confirmation | "Trip locked in. Send the invite or share the link — your six friends can edit anything until departure day." |

---

## Visual foundations

**Aesthetic — "Jelly Liquid Glass" (a warm, 2027-era take on glassmorphism).**
Earthy, warm, worn-in. Translucent white glass panels float over warm paper, lit
by soft specular highlights, over a faint film **grain**.

- **Color vibe:** three brand colors over two neutrals — *forest green* leads on
  dense screens and headlines; *terracotta* is reserved for CTAs and accents;
  *sand gold* supports as a highlight, **never alone**. Neutrals are warm paper
  (a 75° hue runs through every "gray"). Everything is authored in **oklch**.
- **Backgrounds:** warm paper base, often with very soft radial color washes
  (sand / forest / terracotta at low chroma). No photography in chrome; imagery
  shows up as illustrated stamps. No purple-blue gradients, ever.
- **Surfaces / cards:** two families. **Glass** — `oklch(99% .004 80 / 52–72%)`,
  `backdrop-filter: blur(40–48px) saturate(1.85)`, a **directional 1px border**
  (bright top/left, shadowed bottom/right), an inner top specular line, and a
  diagonal `::before` sheen. **Solid** — warm opaque paper with the same
  directional border. Corners are **organic: 16px minimum**, 24px for cards,
  32px for containers/sheets, full pills for buttons & chips.
- **Shadows:** layered, **warm-ink oklch** (never pure black) —
  `0 4px 16px oklch(13% .012 55 / 8%)` + a tighter contact shadow, plus
  `inset 0 1px 0 white/60%` for the glass rim. Brand/terra "glow" shadows exist
  for primary buttons.
- **Blur & transparency:** used deliberately on floating chrome (nav, sheets,
  inputs, FABs, chips) — not on flat scroll content. Inputs are glass too.
- **Motion:** physics-based, intentional, never decorative. Signature easing
  `cubic-bezier(0.34, 1.56, 0.64, 1)` ("jelly" spring) and `(0.25,0,0,1)` ("snap").
  Entrances are **blur-fade-up** (opacity + 14px rise + 6px blur clearing) with
  short staggers; pop-in uses a jelly overshoot. Buttons spring-scale on tap
  (0.96) and lift slightly on hover. Durations 80–500ms.
- **Hover:** lift + scale 1.02 + deepen blur/shadow ("liquid hover").
  **Press:** scale down (0.92–0.96).
- **Focus:** 2px terracotta outline, 2px offset; inputs get a forest ring +
  `0 0 0 3px brand-muted` glow.
- **Type pairing:** **Instrument Serif** (display, used italic for editorial
  headlines & quoted voices) + **DM Sans** (geometric body, tight tracking) +
  **JetBrains Mono** (eyebrows, labels, code, data — wide 0.12–0.14em tracking,
  uppercase) + **Noto Sans Hebrew** (RTL). Scale is Major-Third (1.25).
- **Layout:** mobile-first; fixed floating bottom nav; safe-area aware; 4px
  spacing grid; generous whitespace; editorial left-aligned headers with a mono
  eyebrow above a large serif title.

See `colors_and_type.css` for every token and `assets/jelly-glass.css` for the
surface, grain and motion utilities.

---

## Iconography

Trippy ships **two complementary, fully custom icon systems** — no third-party
icon font, no emoji in product (emoji appears only as an *anti-pattern* in the
brand book).

1. **Line icons** — the primary in-app set. **24×24, stroke 1.5, round caps &
   joins, `fill:none`, `currentColor`.** ~32 glyphs (home, compass, map, tent,
   water, sparkle/AI, users, checklist…). Mirror of `app/components/ui/Icon.tsx`.
   → `assets/trippy-icons.js` exposes `TrippyIcon(name, {size, color})` and
   `TRIPPY_ICON_PATHS`. Use these for any in-app UI.

2. **Stamp seals** — illustrated, **circular, brand-colored** marks. **200 stamps
   across 12 chapters** (Wayfinding, Transport, Food & Drink, Lodging, Nature,
   Sights, Activities, Gear, Documents, People, Time, Souvenirs). Each is an
   80×80 disc (`r=38` saturated fill + faint paper ring echoing the compass +
   illustrated symbol). Used for trip themes, itinerary events, packing items,
   map pins, decoration. → `assets/trippy-stamps.js` (`window.TRIPPY_ATLAS.ATLAS`,
   shape `{ key, bg, sym }`); render with the `wrapStamp(bg, sym)` helper shown
   in `preview/brand-stamps.html`.

**The compass mark** is the logo: a 4-point rose on a 240-unit grid — terracotta
north, forest south, twin gold east/west, ink ring + hub. It adapts to dark mode
via CSS vars. → `assets/compass-mark.svg`, `assets/app-icon.svg`. The mark also
animates as the **compass loader** (`assets/globe-loader.html`).

> When building Trippy artifacts, **copy these assets in** — never redraw icons by
> hand, never substitute emoji or generic icon libraries.

---

## Index / manifest

**Root**
- `README.md` — this file.
- `colors_and_type.css` — all color, type, spacing, radius, shadow, blur & motion
  tokens + semantic element styles. Imports the four Google fonts. **Start here.**
- `SKILL.md` — Agent-Skill front matter for use in Claude Code.

**`assets/`** — real brand assets to copy into work
- `compass-mark.svg`, `app-icon.svg` — logo / app icon
- `trippy-icons.js` — line icon set + helper
- `trippy-stamps.js` — 200-stamp atlas data + symbols
- `globe-loader.html` — standalone compass loader
- `jelly-glass.css` — glass surfaces, grain, signature animations

**`preview/`** — design-system specimen cards (shown in the Design System tab):
type (display/body/mono/scale), color (forest/terracotta+sand/neutrals/semantic/
glass), spacing (radius/elevation/spacing), components (buttons/glass buttons/
fields/chips/card/nav), brand (logo/line icons/stamps/loader/voice).

**`ui_kits/`** — clickable app recreations
- `app/` — faithful recreation of the shipping app. See its `README.md`.
- `liquid-glass/` — **the 2027 "Liquid Glass" redesign** (Apple OS26 direction):
  cinematic trip hero, morphing hover nav, every screen reimagined. Open
  `ui_kits/liquid-glass/index.html`. **Start here for the current design direction.**

---

## Caveats / substitutions
- **Fonts** load from **Google Fonts** (DM Sans, Instrument Serif, JetBrains Mono,
  Noto Sans Hebrew) — these are the genuine families the app uses via `next/font`,
  so this is a CDN link, not a lookalike substitution. Swap for self-hosted files
  in production if you need offline/closed-network support.
- The UI kit's **Map** is a stylized stand-in (the app uses Leaflet); auth, sync,
  AI and live data are mocked.
