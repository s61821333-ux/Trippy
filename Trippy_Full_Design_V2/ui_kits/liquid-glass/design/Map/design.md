# Map — design spec

**File:** `explore.jsx` › `MapScreen` · **Route:** `tab='map'`. Inherits
`GLOBAL.design.md`.

## Purpose
Spatial view of the trip — see stops in relation to each other and discover
nearby places. (Stylized; production uses a real map engine, e.g. Leaflet.)

## Layout
- Full-bleed (paints behind status bar). Soft terrain gradient
  (green → sand) base.
- **Roads:** white SVG strokes (curved paths) at 55% opacity for a paper-map feel.
- **Route line:** terra dashed polyline connecting the day's stops.
- **Pins:** `Stamp` 46 markers at fixed coords, each `.a-pop` staggered, tappable.
- **Top controls** (top 56, below status bar): **Trip ⇄ Explore** segmented
  toggle (`.lg-strong`, forest active) + glass search field "Search your trip".
- **Nearby card** (bottom, above nav): `.lg-strong` row — Stamp 48 (museum),
  sand eyebrow "Sight · 4.8 ★ · 0.5km", name "MoMA", "Open · 8 min walk from
  hotel", terra **Route** button.

## Motion
Pins `.a-pop` staggered; nearby card `.a-rise`; buttons spring-tap.

## Tokens
Glass controls `.lg-strong`. Route line `--lg-terra`. Pins via stamp atlas.

## i18n / dark
- `t()` on Trip/Explore, search placeholder, Sight/Open, "8 min walk from hotel",
  Route. Place names unchanged.
- RTL: control row uses flex with `gap`; toggle mirrors; card row reverses via
  logical layout.
- Dark: terrain gradient stays (it's a "map surface"); chrome cards → dark glass.

## Notes
This is the one intentionally **cosmetic** screen. If wiring a real map: keep the
glass control cluster, route styling, and the bottom "nearby" card pattern — they
are the brand layer over whatever tiles you render.
