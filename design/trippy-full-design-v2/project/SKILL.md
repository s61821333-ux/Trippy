---
name: trippy-design
description: Use this skill to generate well-branded interfaces and assets for Trippy, the collaborative AI trip planner, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets
out and create static HTML files for the user to view. If working on production code,
you can copy assets and read the rules here to become an expert in designing with this
brand.

If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.

## Quick map
- `README.md` — brand context, content fundamentals, visual foundations, iconography, manifest.
- `colors_and_type.css` — every token + semantic element styles + Google-font imports. Link this first.
- `assets/jelly-glass.css` — glass surfaces, grain, signature animations.
- `assets/trippy-icons.js` — line icons: `TrippyIcon(name, {size, color})`.
- `assets/trippy-stamps.js` — 200 illustrated stamp seals: `window.TRIPPY_ATLAS.ATLAS`.
- `assets/compass-mark.svg`, `assets/app-icon.svg`, `assets/globe-loader.html` — logo & loader.
- `preview/` — specimen cards for every foundation & component.
- `ui_kits/app/` — clickable mobile-app recreation with reusable JSX components.

## Non-negotiables
- Forest green leads; terracotta = CTAs/accents only; sand gold supports, never alone; warm-paper neutrals; oklch throughout.
- Type: Instrument Serif (display, often italic) + DM Sans (body) + JetBrains Mono (eyebrows/labels).
- Organic radii (16px min), warm-ink layered shadows, jelly-spring motion, film grain, glass surfaces with directional borders.
- Voice: warm, calm, confident; plain words; second person to the group; **no emoji, no hype, no exclamation stacking.**
- Copy the real icon assets in — never redraw icons by hand or use emoji/generic icon sets.
