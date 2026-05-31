# Home — design spec

**File:** `hero.jsx` › `Home` · **Route:** `stage = 'home'`. Inherits
`GLOBAL.design.md`.

## Purpose
The trip launcher — "Where to next?" Greets the user, offers two ways to create,
and lists existing trips.

## Layout (scrolls)
1. **Dark hero header** (`.hero-mesh`, radius bottom 32px):
   - Wordmark + user avatar row.
   - Eyebrow "Hey, Guy Ahron" (sand).
   - `.display-xl` 40px white: *"Where to / next?"* (`.a-rise .d1`).
   - 14px subtitle white@75%.
2. **Action stack** (pulled up −16px over the hero curve):
   - `Btn forest` full, 60px: *Create a new trip* (plus + arrow, space-between).
   - `Btn glass` full, 52px: *Plan one with AI* (sparkle, terra).
3. **Trips list** — eyebrow "Your trips" + cards:
   - Each card `.lg`, row: **Stamp 52** (theme), eyebrow (date · days, terra),
     serif 23px name, overlapping crew avatars, trailing forest circular arrow.
   - Cards stagger in (`.a-rise`, delay `0.1 + i*0.07`).

## Data
`TRIPS` array (`hero.jsx`): `{ id, name, stamp, dest, days, countdown, crew,
dateRange, events }`. Tapping → `onOpen(trip)` → Dashboard.

## Motion
Hero text `.a-rise` staggered; action buttons `.a-rise .d1`; cards staggered;
all buttons spring-tap.

## Tokens
Hero = `.hero-mesh` + `.lg-dark` accents. Cards = `.lg`. Forest/glass buttons.

## i18n / dark
- Greeting, headings, button labels, "Your trips" via `t()`. Trip names = proper
  nouns (unchanged); `days` localizes.
- RTL mirrors the card row (logical props); arrow flips.
- Dark mode: hero stays cinematic; cards become dark glass, paper bg → dark.

## Notes
Two creation paths share one `CreateSheet`. The AI path is a future entry point —
visually distinct (glass) so it doesn't compete with the primary forest CTA.
