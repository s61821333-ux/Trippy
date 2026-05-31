# Trippy 2027 — Liquid Glass (redesign)

A ground-up visual redesign of the Trippy app toward **Apple OS26 "Liquid Glass."**
This is the answer to the brief: *the old app felt stuck in 2020 — washed-out
cream-on-cream, weak hierarchy, no leading idea, flat and static.*

## What changed (the brief, point by point)
- **One strong leading design** → a **cinematic dark "journey" hero** anchors the
  whole app: destination in big editorial italic serif, live countdown, crew
  avatars, a horizontal day-scroller. Everything else is calm glass on warm paper.
- **Contrast & hierarchy** → saturated forest/terracotta accents, deep hero
  surfaces, bold type scale. No more cream-on-cream.
- **Liquid Glass** → genuinely translucent frosted panels (`.lg`) with bright
  specular edges, inner light, vibrant 1px rims, ultra-rounded corners, layered
  depth and soft brand-tinted shadows.
- **Hover nav bar you love** → `HoverNav`: a floating glass tab bar with a
  **liquid blob that springs between tabs**, icons that lift on select, and a
  separate floating **+** action that gently floats.
- **Animations / effects** → spring physics everywhere, blur/rise entrances with
  stagger, pop-in stamps, sliding sheets, progress rings, a breathing splash.
- **Real-app feel** → dynamic-island status bar, device bezel, sheets, segmented
  controls, toggles, RTL-ready structure.
- **Every screen covered** (see below).

## Screens & flow
```
Splash → Welcome → Home ("Where to next?")
   └─ open a trip ─→  Dashboard (cinematic hero, next-up, packed/budget, AI, today)
                      ├─ Days       (DayDetail: LIST ⇄ TIMELINE, day pills)
                      ├─ Map        (route + stamp pins, Trip/Explore, nearby)
                      ├─ Pack       (progress ring, categories, checklist)
                      ├─ Crew       ("Gather the tribe", invite, magic link)
                      └─ Settings   (appearance, a11y, currency, language, export)
   Sheets: Create trip · Add/Edit event · AI suggestions
```

## Files
| File | Contents |
|------|----------|
| `index.html` | Loads React + Babel, tokens, `ds.css`, fonts, then the JSX |
| `ds.css` | The Liquid Glass language: `.lg` panels, `.hero-mesh`, buttons, type, motion |
| `prims.jsx` | `Avatar` `Icon` `Stamp` `CompassMark` `Btn` `Ring` `StatusBar` `HoverNav` `Sheet` |
| `hero.jsx` | `Splash` `Welcome` `Home` + `TRIPS` data |
| `dash.jsx` | `Dashboard` (cinematic trip hero) |
| `day.jsx` | `DayDetail` (list/timeline) + `AddEventSheet` + `LGField` |
| `explore.jsx` | `MapScreen` `PackScreen` `CrewScreen` `SettingsScreen` `AISheet` |
| `app.jsx` | Phone shell, status-bar logic, state machine, `CreateSheet` |

Built on the shared design system: `../../colors_and_type.css`,
`../../assets/trippy-icons.js`, `../../assets/trippy-stamps.js`. Uses the real
USA 2026 trip content from the user's screenshots.

## Notes
- The **Map** is a stylized cosmetic surface (production uses Leaflet).
- Light/Dark/System and language toggles are visual; no real i18n/persistence here.
- Captured screens animate in the foreground; html-to-image can't grab the
  animated sheets, but they open and function (verified via DOM).
