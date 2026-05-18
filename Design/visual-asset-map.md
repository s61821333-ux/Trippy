# Trippy App — Visual Asset Map for Brand & Graphic Design

## App Color Palette

| Token | Value | Role |
|-------|-------|------|
| `--brand` | `#3B6E52` | Forest green — primary brand |
| `--accent` | `#C4714A` | Terracotta — secondary/accent |
| `--sand` | `#C8944A` | Sand gold — warm highlight |
| `--success` | `#2E7D55` | Confirmation green |
| `--warning` | `#B45309` | Warning amber |
| `--danger` | `#C0392B` | Error/delete red |
| `--bg-light` | `#F4EFE8` | Warm parchment — app background |
| `--bg-dark` | `#0E0C0A` | Near-black — dark mode background |
| `--text-1` | `#1A1410` | Primary text (dark brown) |
| `--text-2` | `#6B5C4E` | Secondary text |
| `--text-3` | `#A8998A` | Tertiary/muted text |

---

## App Icon (Public SVG)

| File | Purpose | Size | Colors Used |
|------|---------|------|-------------|
| `public/icon.svg` | App icon — compass rose | Scalable | BG: `#F4EFE8`, ring: `#1A1410`, primary: `#C4714A`, secondary: `#3B6E52`, gold: `#C8944A` |
| `public/apple-icon.png` | Apple home screen icon | **MISSING** — needs 180×180px | Match icon.svg |
| `public/icon-192.png` | PWA icon small | **MISSING** — needs 192×192px | Match icon.svg |
| `public/icon-512.png` | PWA icon large | **MISSING** — needs 512×512px | Match icon.svg |

---

## Custom UI Icons (Icon.tsx — 28 icons, all 20px SVG)

All icons: 24×24px viewBox, 1.5px stroke, `currentColor` fill, inherit text color from context.

| # | Icon Name | Used In | Context |
|---|-----------|---------|---------|
| 1 | `home` | NavBar | Bottom nav tab |
| 2 | `calendar` | NavBar | Bottom nav tab |
| 3 | `checklist` | NavBar | Bottom nav tab (supplies) |
| 4 | `settings` | NavBar | Bottom nav tab |
| 5 | `plus` | Dashboard, DayScreen, Notes | Add new event / note / day button |
| 6 | `chevR` | Dashboard, lists | Right arrow / navigate forward |
| 7 | `chevL` | DayScreen | Left arrow / back in day navigation |
| 8 | `share` | Dashboard | Share trip button |
| 9 | `map` | SuggestionsSheet, EventDetails | Open map / location link |
| 10 | `sparkle` | DayScreen FAB, loading state | AI suggest button |
| 11 | `trash` | DayScreen, Notes | Delete event / note |
| 12 | `edit` | DayScreen, event cards | Edit event / item |
| 13 | `x` | Sheets, chips | Close sheet / remove tag |
| 14 | `check` | Confirm dialogs, SettingsScreen | Confirm / save action |
| 15 | `sun` | Settings | Weather widget (future) |
| 16 | `wind` | Settings | Weather widget (future) |
| 17 | `lock` | (reserved) | Private trip indicator |
| 18 | `pin` | PlacesInput, SuggestionsSheet | Location marker |
| 19 | `download` | SettingsScreen | Export / download action |
| 20 | `compass` | (reserved) | Navigation / explore |
| 21 | `tent` | LoginScreen / trip creation | Trip type icon |
| 22 | `water` | (reserved) | Water / supply category |
| 23 | `calExport` | SettingsScreen | Export to calendar |
| 24 | `user` | LoginScreen | User profile form field |
| 25 | `search` | (reserved) | Search functionality |
| 26 | `filter` | (reserved) | Filter / sort |
| 27 | `ai` | (reserved) | AI features general |
| 28 | `clock` | DayScreen event cards | Time / duration indicator |

---

## Event Category Icons (EventIcon.tsx — 8 icons)

Used on event cards and the category selector row. Displayed at 10–12px inside chips, 29px as hero icon.

| # | Category | Icon Description | Icon Color | Background Chip Color |
|---|----------|-----------------|------------|----------------------|
| 1 | `food` | Fork & knife | `oklch(58% 0.16 55)` warm orange | `rgba(200,120,30,0.12)` |
| 2 | `cafe` | Coffee cup | `oklch(52% 0.14 65)` amber | `rgba(160,100,30,0.12)` |
| 3 | `attraction` | Pin / map marker | `oklch(52% 0.16 195)` teal | `rgba(30,145,175,0.12)` |
| 4 | `hotel` | Building | `oklch(52% 0.14 310)` purple | `rgba(160,60,180,0.11)` |
| 5 | `rest` | Tent | `oklch(52% 0.15 148)` green | `rgba(40,160,90,0.11)` |
| 6 | `transport` | Car | `oklch(50% 0.13 255)` blue | `rgba(60,100,200,0.11)` |
| 7 | `flight` | Airplane | `oklch(46% 0.15 230)` deep blue | `rgba(20,70,180,0.12)` |
| 8 | `other` | Sparkle / star `✦` | `oklch(52% 0.10 30)` brown | `rgba(180,90,50,0.10)` |

---

## Supply Category Icons (SupplyIcon — 6 icons)

Displayed at 11–13px inside supply list rows and category filter chips.

| # | Category | Icon Description | Used In |
|---|----------|-----------------|---------|
| 1 | `Water` | Droplet | SuppliesScreen category filter + list |
| 2 | `Food` | Bowl / plate | SuppliesScreen category filter + list |
| 3 | `Gear` | Backpack | SuppliesScreen category filter + list |
| 4 | `Medical` | First aid kit | SuppliesScreen category filter + list |
| 5 | `Documents` | Document / file | SuppliesScreen category filter + list |
| 6 | `Other` | Generic miscellaneous | SuppliesScreen category filter + list |

---

## Emoji Usage (UI decorative — not icon library)

### Trip Theme Emojis

| Theme | Emoji | Display Size | Context |
|-------|-------|-------------|---------|
| Desert | 🏜️ | 22px (select) / 52px (display) | Login theme picker, Join page |
| Nature | 🌲 | 22px / 52px | Login theme picker, Join page |
| City | 🌆 | 22px / 52px | Login theme picker, Join page |
| Beach | 🏖️ | 22px / 52px | Login theme picker, Join page |
| Fallback | 🌍 | 20px | Default globe when theme unknown |

### Day Emoji Picker (18 selectable emojis)

| Emoji | Meaning | Container Size |
|-------|---------|---------------|
| 🏙️ | City | 38×38px button |
| 🗼 | Landmark | 38×38px button |
| 🌊 | Ocean / waves | 38×38px button |
| 🏖️ | Beach | 38×38px button |
| 🏔️ | Mountain | 38×38px button |
| 🌲 | Forest / nature | 38×38px button |
| ✈️ | Flight | 38×38px button |
| 🚂 | Train | 38×38px button |
| 🛳️ | Ferry / cruise | 38×38px button |
| 🏛️ | Museum / historic | 38×38px button |
| 🗺️ | Map / explore | 38×38px button |
| 🎡 | Fun / amusement | 38×38px button |
| 🌅 | Sunset / golden hour | 38×38px button |
| ❄️ | Snow / cold | 38×38px button |
| 🍷 | Wine / dining | 38×38px button |
| 🎭 | Theater / culture | 38×38px button |
| 🎨 | Art | 38×38px button |
| ⛷️ | Ski | 38×38px button |

### Onboarding Tour Step Emojis

| Step | Emoji | Tour Message Topic |
|------|-------|------------------|
| 1 | 👋 | Welcome |
| 2 | 🗓️ | Planner / calendar |
| 3 | 🤝 | Collaboration |
| 4 | 🗺️ | Map view |
| 5 | ➕ | Add events |
| 6 | ✨ | AI suggestions |
| 7 | 🎒 | Packing / supplies |
| 8 | 🚀 | Ready to go |

---

## Typography

| Font | Weights | Role |
|------|---------|------|
| `Bricolage Grotesque` | 400, 500, 600, 700 | Primary UI font (sans-serif) |
| `Newsreader` | 400, 500, 600 | Accent / editorial serif |
| `Huninn` | — | Hebrew language support |
| `JetBrains Mono` | 400, 500, 600 | Monospace / code |

---

## Missing Assets — Deliverables Needed from Designer

| Asset | Specs | Priority |
|-------|-------|---------|
| `apple-icon.png` | 180×180px PNG, transparent BG or brand BG | High |
| `icon-192.png` | 192×192px PNG, PWA standard | High |
| `icon-512.png` | 512×512px PNG, PWA store quality | High |
| App logo lockup | Wordmark + compass rose, horizontal & stacked | High |
| Branded splash / loading screen | Web app first-paint screen | Medium |
| OG / social share image | 1200×630px for link previews | Medium |

---

## Summary

The app has **28 general UI icons**, **8 event category icons**, and **6 supply category icons**, all custom SVG inline paths. No raster images are used in the UI — everything is SVG or emoji. The brand palette is warm earth tones (forest green, terracotta, sand, parchment). The 3 PWA icon PNGs are referenced but missing and must be produced.
