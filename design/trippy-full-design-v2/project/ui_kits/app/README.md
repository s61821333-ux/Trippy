# Trippy — App UI Kit

A high-fidelity, clickable recreation of the **Trippy** mobile app (a collaborative
AI trip planner). Cosmetic rebuild of the real Next.js codebase
(`s61821333-ux/Trippy`) — pixel-faithful visuals, simplified logic.

## Run it
Open `index.html`. It boots into the **welcome** screen → tap *Start an Adventure*
→ land on the **trips list** → open a trip to reach the full tab bar.

## Flow
```
Welcome  →  Home (trips list + Create sheet)  →  Trip
                                                  ├─ Camp     (DashboardScreen)
                                                  ├─ Explore  (DayScreen — hour-by-hour)
                                                  ├─ Map      (MapScreen)
                                                  ├─ Pack     (SuppliesScreen — checklist)
                                                  ├─ Crew     (CrewScreen)
                                                  └─ Settings
```

## Files
| File | Contents |
|------|----------|
| `index.html` | Loads React 18 + Babel, tokens, fonts, then the JSX below |
| `primitives.jsx` | `CompassMark`, `Wordmark`, `Icon`, `Stamp`, `GlassBtn`, `Chip`, `Field`, `Avatar` |
| `welcome.jsx` | `WelcomeScreen`, `HomeScreen`, `CreateSheet`, `TRIP_THEMES` |
| `screens.jsx` | `DashboardScreen`, `DayScreen`, `CrewScreen`, `SuppliesScreen`, `EventRow` |
| `app.jsx` | Phone shell, status bar, `BottomNav`, `MapScreen`, state machine |

Each `.jsx` file publishes its components to `window` (Babel scripts don't share
scope) — load order is primitives → welcome → screens → app.

## Dependencies (relative to project root)
- `../../colors_and_type.css` — tokens + type
- `../../assets/jelly-glass.css` — glass surfaces, grain, motion
- `../../assets/trippy-icons.js` — line icons (`TrippyIcon`, `TRIPPY_ICON_PATHS`)
- `../../assets/trippy-stamps.js` — stamp atlas (`window.TRIPPY_ATLAS.ATLAS`)

## Coverage & shortcuts
- **Real, lifted from source:** colors, type, glass surfaces, the compass mark,
  both icon systems, button/field/chip/card styling, nav structure
  (Camp/Explore/Map/Pack/Crew + Settings), the four trip *themes*
  (Desert/Nature/City/Beach), and authentic copy where it was visible.
- **Simplified:** the Map is a stylized cosmetic surface (the real app uses
  Leaflet); auth, Supabase sync, AI suggestions, i18n/RTL and live data are
  faked. Settings opens nothing in this kit.
- Copy follows the brand voice (warm, plain, no emoji/hype). Some strings are
  on-brand inventions because the app stores them as i18n keys, not literals.
