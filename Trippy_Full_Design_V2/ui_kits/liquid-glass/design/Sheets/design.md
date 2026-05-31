# Sheets (overlays) — design spec

Bottom-sheet overlays shared across the app, built on the `Sheet` primitive
(`prims.jsx`). Inherits `GLOBAL.design.md`. Driven by `app.jsx` `sheet` state.

## `Sheet` primitive
- Full-screen layer; **scrim** (`oklch(16% .018 60 / 42%)` + `blur(3px)`), tap to
  dismiss (`.a-fade`).
- Panel: `.lg .lg-strong`, top radius 36px, `max-height: 90%`, **slides up** via
  `@keyframes sheetUp` on `--spring`.
- Header (sticky): grab handle, title (serif 24), optional sub, glass close button.
- Body: scrolls (`.lg-scroll`), 8/24/28 padding.

---

## 1. Create trip — `app.jsx › CreateSheet` (`sheet='create'`)
Triggered from Home (both create buttons) and the nav FAB on Crew.
- **Background** picker: 2×2 grid of theme tiles (Desert/Nature/City/Beach) —
  Stamp + label, selected tile gets a colored ring + glow in that theme's accent.
- `LGField` Trip name · `LGField` Your nickname.
- `Btn forest` full "Create trip".

## 2. Add / Edit event — `day.jsx › AddEventSheet` (`sheet='add' | 'edit'`)
Triggered by the nav FAB on Day, "Add an event", or an accordion's Quick edit /
Reschedule (opens in `editing` mode pre-filled).
- `LGField` Event name.
- Row: **Start** time field + **Duration** chip rail (30m…3h, terra active).
- **Category** chips (Flight/Drive/Rest/Hotel/Sight/Cafe/Food/Beach/Sport/Other),
  forest active, each with an icon.
- `LGField` Location, `LGField` Cost.
- Footer: `Btn forest` "Add event" / "Save changes" + glass "Cancel".

## 3. AI suggestions — `explore.jsx › AISheet` (`sheet='ai'`)
Triggered from the Dashboard AI card and an accordion's "Suggest nearby".
- List of `SUGGS` cards (`.lg`): Stamp 46, sand meta (type · rating · distance),
  title, time/cost, description, then **Add to day** (forest) + **Dismiss** (glass).

---

## Motion
All: scrim `.a-fade`, panel `sheetUp` spring. Inner cards `.a-rise` staggered.
Chips/selectors spring on select. Buttons spring-tap.

## i18n / dark
- `t()` on every title, label, chip, and button. Theme names & categories
  localize; place names don't.
- RTL: fields use logical padding + `text-align:start`; chip rails scroll either
  direction; layout mirrors.
- Dark: panel = dark glass-strong; fields/chips adopt dark tokens; selected states
  keep forest/terra accents.

## Notes
One `Sheet` shell, three payloads — keeps motion and chrome identical so overlays
feel like one system. `add` vs `edit` differ only by pre-filled values + button label.
