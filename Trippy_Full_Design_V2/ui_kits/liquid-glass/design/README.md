# Trippy 2027 · Liquid Glass — Design docs

Per-screen and global design specifications for the redesign
(`ui_kits/liquid-glass/`). Each doc maps 1:1 to the code and cites the source file
+ component so design and implementation stay in lock-step.

## Read order
1. **`GLOBAL.design.md`** — system spec: canvas & responsivity, color (light +
   dark), the Liquid Glass surface recipe, type, motion, shared components,
   i18n/RTL, state model, voice. **Start here** — every page doc inherits it.

## Pages
| # | Doc | Component | Route |
|---|---|---|---|
| 01 | `01-Splash.design.md` | `hero.jsx › Splash` | `stage=splash` |
| 02 | `02-Welcome.design.md` | `hero.jsx › Welcome` | `stage=welcome` |
| 03 | `03-Home.design.md` | `hero.jsx › Home` | `stage=home` |
| 04 | `04-Dashboard.design.md` | `dash.jsx › Dashboard` | `trip / dashboard` |
| 05 | `05-DayDetail.design.md` | `day.jsx › DayDetail` | `trip / day` |
| 06 | `06-Map.design.md` | `explore.jsx › MapScreen` | `trip / map` |
| 07 | `07-Packing.design.md` | `explore.jsx › PackScreen` | `trip / supplies` |
| 08 | `08-Crew.design.md` | `explore.jsx › CrewScreen` | `trip / crew` |
| 09 | `09-Settings.design.md` | `explore.jsx › SettingsScreen` | `trip / settings` |

## Cross-cutting
| Doc | Covers |
|---|---|
| `10-Sheets.design.md` | Create-trip · Add/Edit-event · AI-suggestions overlays (`Sheet`) |
| `11-Navigation.design.md` | `HoverNav` — liquid blob, expand-on-focus, FAB, RTL |

## Conventions in every page doc
**Purpose · Layout · Data · Motion · Tokens · i18n/dark · Notes.** Colors are
oklch token names from `ds.css`; motion references the `--spring` / `--snap`
curves and `.a-*` classes; all spacing follows the 4px grid.
