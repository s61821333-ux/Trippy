# Day detail — design spec

**File:** `day.jsx` › `DayDetail` (+ `EventAccordion`, `HotelAnchor`, `QuickAction`)
· **Route:** `tab='day'`. Inherits `GLOBAL.design.md`.

## Purpose
The hour-by-hour plan for one day, with rich expandable events and at-a-glance
context (weather, budget, lodging).

## Layout
**Sticky header** (flat screen, starts below status bar):
- Eyebrow "Adventure · USA 2026".
- Row: `.display-xl` 38px "Day N" (nowrap) + **List ⇄ Timeline** segmented toggle
  (`.lg`, terra active).
- Meta line: weekday · event count · free time.
- **Day-pill rail** (`overflow-x:auto`): one pill per day, active = forest + glow.

**Body** (scrolls, paddingBottom 130):
- **Context bar** — two `.lg` cards: **Weather** (sun, "24° · Clear") + **Day
  budget** (download icon, "$520").
- **List mode:**
  - `HotelAnchor` (top) — "Stay · Four Points by Sheraton" stamp row.
  - `EventAccordion` per event (see below).
  - `HotelAnchor end` (bottom) — "Checkout · 11:00".
  - Glass "Add an event" button.
- **Timeline mode:** vertical 24h ruler (2h ticks, mono labels) with absolutely
  positioned colored event blocks sized by duration (`top = startHr/2*52`).

## EventAccordion (the key interaction)
- **Collapsed:** left color bar (category), time/end stack (mono), Stamp 42, title
  + location, category pill, chevron (rotates 90° when open).
- **Expanded** (`max-height` spring): divider → Duration & Cost stats → Notes
  paragraph → **quick-action rail**: *Quick edit* (forest), *Reschedule* (terra),
  *Suggest nearby* (sand → opens AI sheet). Edit/Reschedule → `edit` sheet.
- Uses `borderInlineStart` so the color bar mirrors in RTL.

## Data
`DAY_PLAN` (events: time, end, stamp, title, place, tag, color, h, cost, notes),
`HOTEL` constant.

## Motion
Events `.a-rise` staggered; accordion body `max-height` on `--snap`; chevron
spring-rotates; timeline blocks `.a-pop`.

## Tokens
Toggle/pills forest+terra. Category colors inline per event. Cards `.lg`. Hotel
anchors `.lg-strong`.

## i18n / dark
- `t()` on titles, tags, "Day", "Weather", "Day budget", "Stay/Checkout",
  quick-action labels, "Add an event", List/Timeline.
- RTL: all insets via logical props; timeline ruler labels `text-align:end`,
  blocks `inset-inline-*`.
- Dark: cards/anchors → dark glass; ruler lines use neutral alpha that adapts.

## Notes
List is the default and primary; Timeline is the power view. Quick actions keep
edits one tap from the event without leaving the day.
