# Trippy — Visual Assets & Icon Design Specification

> **Purpose:** Complete inventory of existing visual elements + full specification for new icons, tags, and pictograms to be created. This document is the single source of truth for the design team.

---

## Part 1 — Current Asset Inventory

### 1.1 Static Files in `/public/`

| File | Current Use | Notes |
|------|-------------|-------|
| `icon.svg` | App icon / PWA | Needs branded replacement |
| `file.svg` | Next.js scaffold default | Unused — can delete |
| `globe.svg` | Next.js scaffold default | Unused — can delete |
| `next.svg` | Next.js scaffold default | Unused — can delete |
| `vercel.svg` | Next.js scaffold default | Unused — can delete |
| `window.svg` | Next.js scaffold default | Unused — can delete |
| `manifest.json` | PWA manifest | Points to `icon.svg` |

**Verdict:** Only `icon.svg` and `manifest.json` are meaningful. All other files are Next.js template leftovers.

---

### 1.2 Custom SVG Icon Component (`app/components/ui/Icon.tsx`)

The app has a hand-drawn SVG icon system with **31 icons**. No external library is used.

| Icon Key | Visual Concept | Where Used |
|----------|----------------|------------|
| `home` | House silhouette | Bottom nav |
| `calendar` | Calendar grid | Bottom nav |
| `checklist` | Lined list with check | Bottom nav |
| `settings` | Gear / cog | Bottom nav |
| `plus` | Cross / add | FAB buttons |
| `chevR` | Chevron right arrow | List items, navigation |
| `chevL` | Chevron left arrow | Back navigation |
| `share` | Upload/share arrow | Trip sharing |
| `map` | Folded map shape | Map views |
| `sparkle` | Star-burst / AI indicator | AI suggestions |
| `trash` | Delete bin | Delete actions |
| `edit` | Pencil | Edit actions |
| `x` | Close cross | Dismissals |
| `check` | Tick / checkmark | Confirmations |
| `sun` | Sun rays | Weather |
| `wind` | Wind lines | Weather |
| `lock` | Padlock | Trip code / privacy |
| `pin` | Location pin | Map markers |
| `download` | Download arrow | Export |
| `compass` | Compass rose | Explore / navigation |
| `tent` | Tent outline | Camp events |
| `water` | Wave / water drop | Water events |
| `calExport` | Calendar with arrow | iCal export |
| `user` | Person silhouette | Profile |
| `search` | Magnifying glass | Search |
| `filter` | Funnel | Filters |
| `ai` | Lightning / brain | AI features |
| `clock` | Clock face | Time display |
| `arrow` | Directional arrow | Navigation hints |
| `menu` | Hamburger lines | Menu toggle |
| `grid` | Grid squares | View toggle |

---

### 1.3 Event Categories (8 types — `lib/types.ts` + `lib/utils.ts`)

| Key | Emoji | Label | Color Token |
|-----|-------|-------|-------------|
| `food` | 🍽️ | Food | Warm amber |
| `cafe` | ☕ | Café | Brown |
| `attraction` | 📍 | Sight | Teal |
| `hotel` | 🏨 | Hotel | Purple |
| `rest` | ⛺ | Rest | Green |
| `transport` | 🚗 | Drive | Blue |
| `flight` | ✈️ | Flight | Navy |
| `other` | ✦ | Other | Terracotta |

---

### 1.4 Trip Themes (9 types — `lib/types.ts`)

| Key | Emoji | Theme |
|-----|-------|-------|
| `desert` | 🏜️ | Desert |
| `nature` | 🌲 | Nature |
| `city` | 🌆 | City |
| `beach` | 🏖️ | Beach |
| `mountain` | ⛰️ | Mountain |
| `lake` | 🏞️ | Lake |
| `snow` | ❄️ | Snow |
| `space` | 🚀 | Space / Night sky |
| `sunset` | 🌅 | Sunset |

---

### 1.5 Smart Day Icon Keywords (`lib/utils.ts` — 28 keyword groups)

The system reads event names and auto-assigns an emoji. Current groups:

| Emoji | Trigger Keywords |
|-------|-----------------|
| 🎵 | music, concert, festival, show, theater, opera, gig, band |
| 🏛️ | museum, gallery, exhibit, art, culture |
| 🥾 | hike, hiking, trail, trek, climb, peak, summit, canyon |
| 🏄 | beach, swim, snorkel, surf |
| 🍽️ | restaurant, dinner, lunch, breakfast, brunch, bistro |
| ☕ | cafe, coffee, bakery, pastry, espresso |
| ✈️ | flight, airport, landing, takeoff, boarding, terminal, plane |
| 🚗 | jeep, train, ferry |
| ⛺ | camp, tent, bonfire, stargazing |
| 🌲 | park, garden, forest, wildlife, zoo, safari, reserve |
| 🛍️ | market, souk, bazaar, shopping, mall |
| 🧘 | spa, massage, wellness, yoga, meditation |
| 🏰 | ruin, castle, temple, fort, ancient, nabatean, history |
| 🚣 | kayak, canoe, sail, rafting |
| ⛷️ | ski, snowboard |
| 🌅 | sunset, sunrise, viewpoint, vista, lookout, panorama |
| ⚽ | stadium, football, soccer, basketball, tennis |
| 🍷 | winery, brewery, cocktail bar |
| 🪂 | balloon, skydive, paraglide, zip-line |
| 📸 | photo session, photo shoot |
| 🌋 | volcano, crater, lava |
| 🚴 | cycling, bicycle |
| 🧺 | picnic |
| 🙏 | meditation, prayer, church, mosque, synagogue |
| 🏞️ | river, waterfall, lake |
| 🏙️ | city, downtown, old town, street |
| ❄️ | snow, ice |
| 🌾 | farm, ranch, vineyard |

---

### 1.6 Supply Categories (6 types — `SuppliesScreen.tsx`)

| Emoji | Category |
|-------|----------|
| 💧 | Water |
| 🥜 | Food |
| 🎒 | Gear |
| 🩺 | Medical |
| 📄 | Documents |
| 📦 | Other |

---

### 1.7 Quick Event Presets (5 presets — `DayScreen.tsx`)

| Emoji | Label | Category | Default Duration |
|-------|-------|----------|-----------------|
| 🚗 | Drive | transport | 30 min |
| 🍽️ | Meal | food | 60 min |
| ☕ | Coffee | cafe | 30 min |
| ⛺ | Rest | rest | 20 min |
| ⛽ | Gas stop | transport | 15 min |

---

### 1.8 Day Emoji Palette (18 choices — `DayScreen.tsx`)

Used for manually tagging a day or region with a mood/vibe:

🏙️ 🗼 🌊 🏖️ 🏔️ 🌲 ✈️ 🚂 🛳️ 🏛️ 🗺️ 🎡 🌅 ❄️ 🍷 🎭 🎨 ⛷️

---

### 1.9 Emergency Contact Types (4 types)

`medical` · `embassy` · `personal` · `insurance`

---

## Part 2 — Gaps & Design Problems

### 2.1 App Logo / Brand Icon

**Current state:** `icon.svg` is a generic placeholder — no distinct brand identity.

**Problem:** The app has no recognizable logo. The name "Trippy" is playful and adventure-oriented — the icon should reflect motion, journey, and community.

### 2.2 Event Category Fatigue

Only 8 categories cover extremely diverse trip types. A multi-day desert jeep trip, a Tokyo city-break, and a ski week all share the same palette. Categories need to expand significantly.

### 2.3 Supply Category Gaps

Medical, Documents, Water, Food, Gear, Other is a reasonable base — but a proper packing list for different trip types needs far more granularity (electronics, clothing, safety, navigation, etc.).

### 2.4 Trip Type / Vibe

There is a TripTheme but no **Trip Type** (e.g., road trip, backpacking, luxury, family, group adventure). Theme describes visual look; type describes the *experience mode*.

### 2.5 Day Emoji Palette Is Too Small

18 emojis to describe a day is limiting. The palette should expand to 60+ with a category grouping system.

---

## Part 3 — New Icons & Logos To Create

---

### 3.1 App Brand Logo

#### Concept A — "The Dot Trail"
A minimalist path of three dots forming a gentle arc — the last dot lands on a destination pin. Wordmark "Trippy" in a rounded geometric sans-serif beneath. The pin doubles as the tittle of the letter "i".

- **Primary palette:** Deep sand (#C8813A) + Sky blue (#3A9BC8) + Off-white (#F5F0E8)
- **Dark mode:** Night navy (#1A2035) background, same accent colors
- **Formats needed:** `icon.svg` (square, no wordmark), `logo-full.svg` (horizontal), `logo-stacked.svg` (vertical)

#### Concept B — "The Compass Rose Burst"
A thin-line compass rose where the north arrow morphs into a flight path. Clean, geometric, one-color works as monochrome.

- **Palette:** Single-color works on any background
- **Formats needed:** Same as above

#### Concept C — "Trippy T"
Lettermark where the T is formed by a trail/road shape. The crossbar becomes a horizon line.

- **Palette:** Gradient from amber to coral
- **Formats needed:** Same as above

**PWA Icon Sizes Required:**
- 16×16, 32×32, 48×48 (favicon variants)
- 192×192 (Android PWA)
- 512×512 (Android PWA splash)
- 180×180 (Apple touch icon)
- 1024×1024 (App Store / Play Store source)

---

### 3.2 Extended Event Category Icons

**Design language:** Rounded line icons, 24×24 grid, 1.5px stroke, consistent corner radius. Each icon gets:
- SVG path for the Icon component
- Emoji fallback (existing or new)
- Hex color + background tint

#### Group A — Food & Drink (expand from 2 → 12)

| New Key | Icon Concept | Emoji | Color |
|---------|-------------|-------|-------|
| `food` | Fork + knife (existing) | 🍽️ | Amber |
| `cafe` | Coffee cup steam (existing) | ☕ | Brown |
| `breakfast` | Fried egg in pan | 🍳 | Warm yellow |
| `street_food` | Skewer / satay stick | 🍢 | Orange |
| `fine_dining` | Cloche dome cover | 🥂 | Gold |
| `bar` | Cocktail glass | 🍸 | Magenta |
| `winery` | Wine glass + bunch of grapes | 🍷 | Deep red |
| `brewery` | Beer mug foam | 🍺 | Amber-gold |
| `bakery` | Croissant outline | 🥐 | Warm tan |
| `dessert` | Ice cream scoop | 🍦 | Pink |
| `picnic` | Wicker basket | 🧺 | Green |
| `market_food` | Food stall canopy | 🌮 | Terracotta |

#### Group B — Accommodation (expand from 1 → 8)

| New Key | Icon Concept | Emoji | Color |
|---------|-------------|-------|-------|
| `hotel` | Building with H (existing) | 🏨 | Purple |
| `hostel` | Bunk bed outline | 🛏️ | Violet |
| `camp` | Tent with moon | ⛺ | Forest green |
| `glamping` | Dome tent with fairy lights | 🏕️ | Sage green |
| `airbnb` | House with heart | 🏠 | Coral red |
| `resort` | Palm tree + pool | 🏖️ | Cyan |
| `cabin` | Log cabin silhouette | 🪵 | Warm brown |
| `boat` | Boat hull + waves | ⛵ | Navy |

#### Group C — Transport (expand from 2 → 12)

| New Key | Icon Concept | Emoji | Color |
|---------|-------------|-------|-------|
| `flight` | Plane (existing) | ✈️ | Navy |
| `drive` | Car side view (existing) | 🚗 | Blue |
| `train` | Train front face | 🚂 | Steel blue |
| `bus` | Bus side | 🚌 | Yellow |
| `ferry` | Ferry boat profile | ⛴️ | Teal |
| `taxi` | Taxi top light | 🚕 | Yellow |
| `metro` | Underground M symbol | 🚇 | Red |
| `bike` | Bicycle side | 🚲 | Green |
| `motorbike` | Motorbike side | 🏍️ | Dark gray |
| `boat_transfer` | Speed boat wake | 🚤 | Cyan |
| `cable_car` | Gondola on wire | 🚡 | Orange |
| `gas` | Fuel pump | ⛽ | Gray |
| `parking` | P letter in circle | 🅿️ | Blue-gray |

#### Group D — Sightseeing & Culture (expand from 1 → 15)

| New Key | Icon Concept | Emoji | Color |
|---------|-------------|-------|-------|
| `attraction` | Location pin (existing) | 📍 | Teal |
| `museum` | Columns / portico | 🏛️ | Sand |
| `art_gallery` | Frame with abstract shape | 🖼️ | Mauve |
| `landmark` | Tower silhouette | 🗼 | Gray |
| `ruins` | Broken column | 🏛️ | Stone |
| `religious_site` | Dome or arch | 🕌 | Cream |
| `viewpoint` | Binoculars on platform | 🔭 | Slate |
| `castle` | Turret with flag | 🏰 | Charcoal |
| `neighborhood` | Row of buildings | 🏘️ | Warm gray |
| `street_art` | Spray can with star | 🎨 | Vivid purple |
| `market` | Stall awning with goods | 🛍️ | Orange |
| `show` | Theater curtain | 🎭 | Crimson |
| `concert` | Music note + speaker | 🎵 | Electric blue |
| `sports_event` | Trophy cup | 🏆 | Gold |
| `festival` | Confetti burst | 🎉 | Multicolor |

#### Group E — Outdoor & Adventure (expand from 1 → 14)

| New Key | Icon Concept | Emoji | Color |
|---------|-------------|-------|-------|
| `hike` | Boot print on trail | 🥾 | Earth brown |
| `beach` | Wave + umbrella | 🏖️ | Sky blue |
| `swim` | Swimmer silhouette | 🏊 | Aqua |
| `snorkel` | Mask + snorkel tube | 🤿 | Turquoise |
| `surf` | Surfboard vertical | 🏄 | Ocean blue |
| `kayak` | Paddle crossing | 🚣 | River green |
| `sail` | Sailboat full sail | ⛵ | White + blue |
| `ski` | Crossed skis | ⛷️ | Ice blue |
| `climb` | Hand on rock hold | 🧗 | Rocky gray |
| `cycling` | Bicycle wheel + trail | 🚴 | Lime |
| `paraglide` | Wing + person silhouette | 🪂 | Sky |
| `safari` | Jeep + binoculars | 🦁 | Savanna |
| `diving` | Scuba tank + bubbles | 🤿 | Deep blue |
| `horseback` | Horse silhouette | 🐴 | Chestnut |

#### Group F — Wellness & Rest (expand from 1 → 6)

| New Key | Icon Concept | Emoji | Color |
|---------|-------------|-------|-------|
| `rest` | Tent (existing) | ⛺ | Green |
| `spa` | Lotus flower | 🌸 | Blush |
| `yoga` | Lotus pose silhouette | 🧘 | Lavender |
| `meditation` | Om symbol thin | 🙏 | Violet |
| `sleep` | Moon + zzz | 😴 | Indigo |
| `hot_spring` | Wavy steam lines | ♨️ | Hot pink |

#### Group G — Photography & Creative

| New Key | Icon Concept | Emoji | Color |
|---------|-------------|-------|-------|
| `photo` | Camera body thin line | 📸 | Charcoal |
| `video` | Video camera outline | 🎬 | Dark red |
| `sketching` | Pencil + paper corner | ✏️ | Cream |
| `journaling` | Open book + pen | 📓 | Tan |

#### Group H — Practical / Logistics

| New Key | Icon Concept | Emoji | Color |
|---------|-------------|-------|-------|
| `check_in` | Arrow into door | 🏠 | Teal |
| `check_out` | Arrow out of door | 🚪 | Muted red |
| `border_crossing` | Gate + flag | 🛂 | Navy |
| `visa` | Passport stamp shape | 🛂 | Forest |
| `currency_exchange` | Two arrows + coin | 💱 | Gold |
| `sim_card` | SIM chip outline | 📱 | Gray |
| `insurance` | Shield + check | 🛡️ | Blue |
| `packing` | Open suitcase | 🧳 | Warm brown |

---

### 3.3 Extended Trip Types (Brand New Concept)

Trip Type is different from Trip Theme — it describes the *style* of the trip, not the scenery.

#### Design: Illustrated badge icons, 48×48, filled style (bolder than event icons)

| Key | Icon Concept | Emoji | Description |
|-----|-------------|-------|-------------|
| `road_trip` | Steering wheel + open road | 🚗 | Self-drive journey |
| `backpacking` | Backpack with patches | 🎒 | Budget multi-stop |
| `luxury` | Champagne glass + star | 🥂 | High-end travel |
| `family` | Two adults + child silhouettes | 👨‍👩‍👧 | Family with kids |
| `couple` | Two linked rings | 💑 | Romantic trip |
| `solo` | Single person + globe | 🧳 | Solo adventure |
| `group_friends` | Three overlapping people | 👥 | Friends crew |
| `business` | Briefcase + calendar | 💼 | Work + leisure |
| `digital_nomad` | Laptop + palm tree | 💻 | Work remotely |
| `pilgrimage` | Walking stick + path | 🙏 | Spiritual journey |
| `expedition` | Compass + flag | 🧭 | Deep wilderness |
| `cruise` | Cruise ship waves | 🛳️ | Sea cruise |
| `cycling_tour` | Bicycle loaded with bags | 🚴 | Multi-day cycle |
| `ski_trip` | Mountain + ski lift | ⛷️ | Snow/ski |
| `surf_trip` | Wave barrel + board | 🏄 | Surf-focused |
| `festival_trip` | Stage + crowd silhouette | 🎪 | Event-centered |
| `volunteer` | Hand + heart | 🤝 | Service travel |
| `photography_tour` | Camera + landscape | 📷 | Photo-focused |
| `foodie_tour` | Fork + map pin | 🍽️ | Gastronomic |
| `budget` | Coins + checkmark | 💰 | Budget travel |

---

### 3.4 Extended Supply Categories (expand from 6 → 20)

#### Design: Consistent with event icons — 24px line icons, 1.5px stroke

| Key | Icon Concept | Emoji |
|-----|-------------|-------|
| `water` | Water drop (existing) | 💧 |
| `food_supplies` | Sandwich / provisions | 🥜 |
| `gear` | Backpack (existing) | 🎒 |
| `medical` | First aid cross (existing) | 🩺 |
| `documents` | Folded document (existing) | 📄 |
| `clothing` | T-shirt outline | 👕 |
| `footwear` | Boot side view | 👟 |
| `electronics` | Plug + lightning bolt | 🔋 |
| `navigation` | Compass + map | 🧭 |
| `shelter` | Tent side + rain | 🏕️ |
| `fire_making` | Match + flame | 🔥 |
| `tools` | Multi-tool outline | 🔧 |
| `hygiene` | Toothbrush + drop | 🪥 |
| `sun_protection` | Sun + shield | 🧴 |
| `insect_protection` | Bug with cross | 🦟 |
| `camera_gear` | Camera body + lens | 📷 |
| `snacks` | Energy bar / trail mix | 🍫 |
| `safety` | Helmet side view | ⛑️ |
| `communication` | Satellite phone | 📡 |
| `entertainment` | Headphones | 🎧 |

---

### 3.5 Extended Day Emoji Palette (from 18 → 72)

Organized into 8 groups for the day/region emoji picker:

#### Group 1 — Urban & Architecture
🏙️ 🗼 🏛️ 🏰 🕌 ⛪ 🕍 🗽 🗺️ 🏘️ 🏗️ 🌉

#### Group 2 — Nature & Landscape
🌊 🏔️ 🌲 🌋 🏜️ 🏞️ 🌾 🌿 🍂 🌸 🌺 🌴

#### Group 3 — Water & Sea
🏖️ ⛵ 🚢 🛳️ 🤿 🏄 🚣 🌊 🐠 🐋 🦭 ⚓

#### Group 4 — Travel & Transport
✈️ 🚂 🚗 🏍️ 🚲 🚡 🛸 🚁 🛺 🚤 🚌 🛻

#### Group 5 — Activities & Adventure
⛷️ 🧗 🥾 🪂 🎿 🏊 🎣 🏇 🎯 🪁 🏋️ 🤸

#### Group 6 — Food & Nightlife
🍷 🍺 🎭 🎨 🎪 🎡 🎠 🎶 🎤 🍾 🕺 🌮

#### Group 7 — Sky & Atmosphere
🌅 ❄️ ⛈️ 🌙 ⭐ 🌌 🌈 ☀️ 🌤️ 🌧️ 🌫️ 🔥

#### Group 8 — Cultural & Spiritual
🙏 🎎 🎑 🏮 🎐 🪬 📿 🔮 🌍 🧿 🪔 🎋

---

### 3.6 New Trip Tag System (Brand New Feature Concept)

Tags are free-form but drawn from a preset library. They appear as small pills on the trip card.

#### Design: Pill-shaped chips, 20px height, icon + label. Two styles: outline (unselected) / filled (selected).

##### Vibe Tags
| Tag | Emoji | Color |
|-----|-------|-------|
| Chill | 😌 | Soft blue |
| Wild | 🔥 | Fiery orange |
| Cultural | 🏛️ | Sand |
| Romantic | 💕 | Rose |
| Party | 🎉 | Purple |
| Spiritual | 🙏 | Violet |
| Adventurous | ⚡ | Electric yellow |
| Off-grid | 🌲 | Forest |
| Luxe | ✨ | Gold |
| Budget | 💰 | Green |
| Family-friendly | 🧸 | Sky blue |
| Pet-friendly | 🐾 | Warm orange |

##### Terrain Tags
| Tag | Emoji |
|-----|-------|
| Desert | 🏜️ |
| Mountains | ⛰️ |
| Forest | 🌲 |
| Coastline | 🌊 |
| Urban | 🏙️ |
| Jungle | 🌿 |
| Arctic | ❄️ |
| Island | 🏝️ |
| Lake | 🏞️ |
| Savanna | 🦁 |
| Wetlands | 🦢 |

##### Season Tags
| Tag | Emoji |
|-----|-------|
| Spring | 🌸 |
| Summer | ☀️ |
| Autumn | 🍂 |
| Winter | ❄️ |
| Monsoon | 🌧️ |
| Dry season | 🌵 |

##### Pace Tags
| Tag | Emoji |
|-----|-------|
| Slow travel | 🐢 |
| Fast-paced | ⚡ |
| One destination | 📍 |
| Multi-city | 🗺️ |
| Day trip | 🕐 |
| Weekend | 🏡 |
| Week+ | 🌍 |

---

### 3.7 Event Sticker / Highlight Icons (New Feature Concept)

Large decorative icons (64×64) used on memorable moments, photo captions, or AI-generated trip highlights.

#### Design: Illustrated, slightly whimsical, 3-color max per icon. These are expressive, not functional.

| Sticker | Use Case |
|---------|----------|
| 🌅 Sunrise moment | First light experience |
| 🏆 Highlight of the trip | User-marked best moment |
| 😱 Surprise! | Unexpected discovery |
| 😂 Funny story | Travel blooper |
| 🍽️ Best meal | Food memory |
| 😴 Worst sleep | Travel fail |
| 🌧️ Weather ruined it | Rain or heat |
| 💸 Most expensive | Budget buster |
| 🤝 Local connection | Meeting a local |
| 🎯 Bucket list done | Achievement unlocked |
| 📸 Best photo spot | Instagram-worthy |
| 🚨 Emergency | Incident marker |
| 🔁 Would repeat | Revisit flag |
| ❌ Skip next time | Not worth it |

---

## Part 4 — Implementation Priorities

### Phase 1 — Logo (Immediate)
- [ ] App logo (all 3 concepts for review)
- [ ] PWA icons all sizes
- [ ] Favicon set

### Phase 2 — Expand Event Categories
- [ ] Add 40+ new category keys to `lib/types.ts`
- [ ] Create SVG paths for each in `Icon.tsx`
- [ ] Assign colors and background tints in `utils.ts`
- [ ] Add emoji fallbacks

### Phase 3 — Trip Type System
- [ ] Add `TripType` type to `lib/types.ts`
- [ ] Trip type picker in CreateTrip flow
- [ ] Badge icons (48px illustrated set)
- [ ] Filter by trip type on home screen

### Phase 4 — Trip Tags
- [ ] Tag data model (array of strings on Trip)
- [ ] Tag picker UI (pill selector, search)
- [ ] Tag filter on home screen
- [ ] Preset tag library with emoji + color

### Phase 5 — Extended Supplies & Packing
- [ ] 20-category supply system
- [ ] Smart packing list templates by trip type
- [ ] Supply icon set (24px line)

### Phase 6 — Day Emoji Palette Expansion
- [ ] Expand from 18 → 72 emoji
- [ ] Group by category with section headers
- [ ] Search within picker

### Phase 7 — Event Stickers
- [ ] Illustrated sticker set (14 icons, 64px)
- [ ] Attach to events as a highlight marker
- [ ] Show in trip summary / share card

---

## Part 5 — Icon Design Constraints

All custom SVG icons must conform to these rules to match the existing `Icon.tsx` system:

```
Viewport:       0 0 24 24
Stroke width:   1.5 (UI icons) / 1.8 (nav icons) / 2.0 (emphasis)
Stroke linecap: round
Stroke linejoin: round
Fill:           none (line icons) or currentColor (solid)
Corner radius:  2px minimum on rectangles
Clearance:      1px from viewport edge minimum
Color:          inherit from parent via `currentColor`
```

All icons must render correctly at:
- 16×16 (tiny inline)
- 20×20 (compact UI)
- 24×24 (standard)
- 32×32 (large)

No icon should require more than 3 SVG path elements. Prefer single `<path>` with combined `d` attribute.

---

## Part 6 — Color System for Category Icons

All new icons inherit the existing palette system. New categories should use these tokens:

| Color Name | Oklch | Hex approx | Use |
|------------|-------|-----------|-----|
| Amber | `oklch(58% 0.16 55)` | #C8813A | Food |
| Brown | `oklch(52% 0.14 65)` | #A0641E | Cafe |
| Teal | `oklch(52% 0.16 195)` | #1E91AF | Sights |
| Purple | `oklch(52% 0.14 310)` | #A03CB4 | Hotel |
| Green | `oklch(52% 0.15 148)` | #28A05A | Rest/Nature |
| Blue | `oklch(50% 0.13 255)` | #3C64C8 | Transport |
| Navy | `oklch(46% 0.15 230)` | #1446B4 | Flight |
| Terracotta | `oklch(52% 0.10 30)` | #B45A32 | Other |
| Gold | `oklch(62% 0.18 80)` | #D4A017 | Luxury/Fine dining |
| Rose | `oklch(62% 0.18 350)` | #D4175A | Romance/Spa |
| Forest | `oklch(46% 0.14 155)` | #1A7840 | Outdoor/Deep nature |
| Slate | `oklch(46% 0.06 240)` | #4A6080 | Practical/Logistics |
| Coral | `oklch(64% 0.20 30)` | #E05A3A | Adventure/Alert |
| Lavender | `oklch(64% 0.12 290)` | #8A6ABE | Wellness |
| Cyan | `oklch(70% 0.14 210)` | #30B4D2 | Water/Beach/Resort |

Background tints: all at `rgba(r,g,b, 0.11)` — same pattern as existing `CAT_META`.

---

*Document version 1.0 — Generated 2026-05-17*
*Update this file whenever a new icon, category, or tag type is added to the codebase.*
