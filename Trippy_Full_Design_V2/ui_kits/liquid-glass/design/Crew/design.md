# Crew — design spec

**File:** `explore.jsx` › `CrewScreen` · **Route:** `tab='crew'`. Inherits
`GLOBAL.design.md`.

## Purpose
Invite friends and show who's on the trip.

## Layout (hero screen, scrolls)
- **Dark hero** (`.hero-mesh`, centered): floating paper compass disc (84px,
  `.a-float`), `.display-xl` 34px white "Gather the tribe", subtitle white@78%.
- **Invite card** (`.lg-strong`, pulled up −22 over hero curve):
  - `LGField` "Invite by email".
  - `Btn forest` full "Send invites".
  - Divider "or magic link".
  - Glass button showing the join link + share icon.
- **Crew list:** eyebrow "Current crew · N" + rows (`.lg`): Avatar 44, name
  (+ "· you" for self), role; trailing **Organizer** terra pill or forest check.

## Data
Local `crew` array `[name, role]`. Avatars colored by index.

## Motion
Compass `.a-float`; invite card + rows `.a-rise` staggered; buttons spring-tap.

## Tokens
Hero `.hero-mesh`. Invite card `.lg-strong`. Organizer pill = terra tint.

## i18n / dark
- `t()` on title, subtitle, field label, "Send invites", "or magic link",
  "Current crew", "Organizer/Member", "you". Names unchanged; link unchanged.
- RTL mirrors rows; divider symmetric.
- Dark: hero stays cinematic; invite card + rows → dark glass.

## Notes
Email + magic-link are parallel paths; the link button is glass (secondary) so
the forest "Send invites" stays primary.
