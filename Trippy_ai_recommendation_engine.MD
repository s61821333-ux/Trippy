# Trippy — AI Recommendation Engine (Replacing the "Idea" Feature)
### Detailed Specification & Implementation Document

> Goal: turn the AI tool from a generic recommender into a **persona-aware, location-aware, source-restricted** engine, with an internal caching layer that saves credits and returns results within 8 seconds.

---

## 0. Core Principles (read before building)

1. **Cache-first, always.** Every request hits the internal DB first. The internet is a fallback only (when fewer than 3 matches are found).
2. **Separate sources by role:**
   - **Place discovery + editorial description** ← blogs / TripAdvisor / Travel+Leisure / Nat Geo / Lametayel.
   - **Structured data (rating, price, avg visit time, coordinates, hours)** ← **Google Places API** only. Never scrape Google ratings from a blog.
3. **Hard whitelist.** Internet search is restricted to `allowed_domains` only. Any other domain is blocked.
4. **Credit = expensive resource.** Minimize LLM calls, maximize reuse. See section 9.
5. **8-second ceiling.** Beyond that — return what's available + continue in the background (see section 11).
6. **Every result is shown to the user before storing**, but storage happens automatically right after display.

---

## 1. Mapping the Existing DB (Trip Data)

Purpose: confirm we hold all location and time fields needed for matching. Adapt to your real schema; the recommended structure is below.

### 1.1 Existing tables (assumed)

```
trips
  trip_id (PK)
  user_id (FK)
  country
  region             -- state/province (if relevant)
  start_date
  end_date

trip_cities
  city_id (PK)
  trip_id (FK)
  city_name          -- key city
  area               -- region/area within the country
  arrival_date
  departure_date
  lat, lng           -- REQUIRED for radius search

hotels
  hotel_id (PK)
  trip_id (FK)
  city_id (FK)
  name
  lat, lng           -- REQUIRED: default location for the suggestion
  check_in, check_out

attractions / places
  place_id (PK)
  trip_id (FK)
  city_id (FK)
  name
  category
  lat, lng
  visit_date
```

### 1.2 Fields that MUST exist (add if missing)

| Field | Why it's critical |
|---|---|
| `lat, lng` on every location | Radius search + Google Places calls |
| `arrival_date / departure_date` per city | Resolve "the city the user sleeps in today" |
| `area` (urban district/neighborhood) | Filter at the Manhattan/Brooklyn level |
| `country_type` (states / provinces / single) | Decides if onboarding asks about provinces |

### 1.3 Deliverable for step 1
A mapping doc confirming that for any day of the trip we can resolve: **(a)** city, **(b)** area, **(c)** hotel coordinates, **(d)** date range. Without all four — do not proceed.

---

## 2. Trip Onboarding Questionnaire

Shown once, at trip creation. Populates `trips` + `trip_cities`.

### 2.1 Fields
1. **Country** (autocomplete; sets `country_type`).
2. **Key cities in the trip** (multi-add; each city → geocoded to `lat,lng`).
3. **Provinces / internal states** — *shown only if* `country_type ∈ {states, provinces}` (e.g. USA, Germany, Canada).
4. (optional, recommended) **Trip dates** — enables computing season for seasonal matching.

### 2.2 Rules
- Each city runs **immediate geocoding** (Google Geocoding API) and is stored with coordinates. No coordinates → no radius search.
- Season is derived from dates (`season = f(month, hemisphere)`) and stored — critical for cache matching in section 5.

---

## 3. Internal Recommendations DB (Cache)

The heart of credit savings. Every suggestion ever generated is stored and reused.

### 3.1 Schema

```
rec_cache
  rec_id (PK)
  -- location
  country
  region
  city
  area                -- neighborhood (Manhattan / Soho ...)
  lat, lng            -- for radius search
  -- persona / request
  style               -- food | bars | quiet | relaxed | other
  style_detail        -- free text when style=other
  persona_tags        -- array (json)
  duration_bucket     -- short(<2h) | half_day | full_day
  budget_tier         -- low | mid | high | any
  season              -- spring | summer | autumn | winter
  -- suggestion content (source: blog / TripAdvisor)
  title
  short_description
  source_site
  source_url
  -- structured data (source: Google Places)
  google_place_id
  google_rating
  avg_duration_min
  price_level         -- 0–4 / text
  -- meta
  created_at
  last_served_at
  popularity_count    -- times served (for ranking)
  embedding           -- vector(1536) [optional, for semantic match]
```

### 3.2 Indexes
- Geo index on `(lat, lng)` (PostGIS / geohash) for fast radius search.
- Composite index `(city, style, season, budget_tier)`.
- (optional) Vector index (pgvector) on `embedding` for semantic "style=other" matching.

### 3.3 Cleanup rule
Soft TTL: a record not served for 12 months → mark `stale` and refresh on next request (Google ratings and prices go out of date).

---

## 4. "Suggest" Button Flow — Persona Prompt

Tapping "Suggest" opens a short modal (all questions on one screen, so we make **a single search call** — saves credits):

### 4.1 Questions
1. **Desired style:** `food | bars | quiet | relaxed | other + detail`.
2. **Location:**
   - Default = **the city the user sleeps in today** (derived from `hotels.check_in/out` vs current date).
   - If a different location is chosen → **radius search** around that point (default 5 km, configurable).
   - Follow-up: **specific area in the city** (e.g. Manhattan) — filters `area`.
3. **Desired duration:** `short (<2h) | half day | full day` → `duration_bucket`.
4. **Budget (optional):** if selected → `budget_tier`.

### 4.2 Deliverable for step 4
A unified request object (`QueryContext`) combining persona + location + season:

```json
{
  "country": "USA", "region": "NY", "city": "New York", "area": "Manhattan",
  "lat": 40.78, "lng": -73.96, "radius_km": 5,
  "style": "food", "style_detail": null,
  "persona_tags": ["foodie"], "duration_bucket": "short",
  "budget_tier": "mid", "season": "autumn"
}
```

---

## 5. Internal Cache Lookup — Always First

### 5.1 Match logic
Query `rec_cache` with filters (by strictness order):

1. **Location:** `area` matches **or** within `radius_km` of `(lat,lng)`.
2. **Style:** `style` equal. If `style=other` → semantic match on `style_detail` (cosine on embedding, threshold ≥ 0.82).
3. **Season:** `season` equal **or** adjacent season (±1 month) — matters because attractions are seasonal/weather-dependent.
4. **Duration/budget:** `duration_bucket` matches; `budget_tier` matches or `any`.

### 5.2 Result ranking
Sort by: `google_rating DESC, popularity_count DESC`.

### 5.3 Decision
- Found **≥ 3** → return the top 4, **skip the internet** (credit = 0). Update `last_served_at` and `popularity_count++`.
- Found **< 3** → proceed to section 6.

---

## 6. Internet Fallback (Whitelist Search) — fallback only

Triggered only when the cache returns fewer than 3.

### 6.1 Hard whitelist (`allowed_domains`)
```
lametayel.co.il          # Lametayel
tripadvisor.com
travelandleisure.com     # Travel + Leisure
nationalgeographic.com   # National Geographic
lonelyplanet.com         # travel blog/guide #1
atlasobscura.com         # travel blog/guide #2
maps.google.com          # Google Maps (discovery)
```
> Two recommended "blog engines": **Lonely Planet** (authoritative, broad coverage) and **Atlas Obscura** (unique places). Can be swapped for Time Out / Culture Trip depending on audience.

### 6.2 Process
1. **One search query** built from `QueryContext`:
   `"{style} {style_detail} in {area}, {city} {budget_tier}"` + `site:` restricted to the whitelist.
2. Extract candidate place names (take only names + a short editorial description from the sources).
3. **For each candidate → call Google Places API** (Place Details) to get the reliable structured data:
   - `google_rating`, `price_level`, `avg_duration_min` (typical visit), `lat/lng`, `place_id`.
4. Filter out places below 4.0 rating or with missing data.
5. Pick the **top 4** that meet the conditions.

### 6.3 Cost note
`web_search` + `Places Details` cost money, but only once per location/persona/season — then it's cached and serves every subsequent user. This is the main credit saving.

---

## 7. Result Processing & Styling

Each of the 4 suggestions is styled uniformly:

```
┌─────────────────────────────────────────┐
│ {title / place name}                      │
│ ⭐ {google_rating}  ·  ⏱ {avg_duration}  │
│ 💲 {price_level}                          │
│ {short description — 1–2 sentences,        │
│  in the user's language}                   │
│ 🔗 source: {source_site}                  │
└─────────────────────────────────────────┘
```

- **Title:** the place name.
- **Rating:** from Google Places (`4.6 ⭐`).
- **Avg time:** from Places typical visit (`~1.5 hrs`).
- **Price:** `price_level` translated (`$$ / mid`).
- **Short description:** one or two sentences in the user's language (LLM summarizes editorial text; max ~40 words — saves tokens).

---

## 8. Storing to the Internal DB

**Mandatory order:** show to the user → then store.

1. Display the 4 results in the UI.
2. Immediately after display, write each suggestion to `rec_cache` with the full `QueryContext` + structured data.
3. If `google_place_id` already exists for `(city, style, season)` → increment `popularity_count` instead of duplicating.

From the next request for the same location/persona/season — the result comes from cache at zero cost.

---

## 9. Credit Optimization (Checklist)

- [ ] **Cache-first** — DB always before internet (the main saving).
- [ ] **All persona questions on one screen** → a single search call.
- [ ] **One internet search** per location/persona/season; always stored afterward.
- [ ] **Cheap model for text processing** (summarizing descriptions), strong model only for candidate extraction.
- [ ] **Structured JSON output** from the LLM → fewer tokens, safe parsing.
- [ ] **Token cap** on descriptions (~40 words).
- [ ] **Google Places** for rating/price/time (cheap and accurate) instead of LLM-summarizing blogs.
- [ ] **De-dup** by `google_place_id`.
- [ ] **Soft TTL** (12 months) — refresh on read, not via blanket background jobs.

---

## 10. UI / Loading / Trippy Design

> All components must comply with Trippy's existing design tokens (colors, typography, spacing, button/card components). Do not invent colors — use the existing style guide.

### 10.1 Replacing the "Idea" feature
- The existing "Idea" entry point is replaced by "Suggest" → opens the Persona Prompt (section 4).
- The result card (section 7) is a standard Trippy Card component.

### 10.2 Loading screen (during search)
- **Text:** *"Finding your perfect spots…"* / in Hebrew: "מחפשים בשבילך את המקומות המדויקים!"
- **Animation:** a spinning **Trippy** icon (spinner).
- **Horizontal progress bar** filling up to 8 seconds (see section 11).
- On a cache hit → the loader flashes only briefly (near-instant result).

---

## 11. Performance — the 8-Second Ceiling

1. **Cache hit:** < 0.5 s. Most requests (after a warm-up period) land here.
2. **Cache miss (internet):**
   - Run candidate extraction + Google Places calls **in parallel**, not sequentially.
   - Progress bar timed to 8 seconds.
   - **Hard timeout at 8 s:** if ≥ 3 results are ready — show them and stop.
   - If < 3 ready in time — show what's available + a "found X, searching for more in the background" note, and finish into the cache in the background.
3. Never block the UI on a single long synchronous call.

---

## 12. Build Order

1. **DB mapping** — ensure `lat/lng` + dates on every location (section 1).
2. **Onboarding** — questionnaire + geocoding + season computation (section 2).
3. **`rec_cache`** — table + indexes (geo + composite), optional pgvector (section 3).
4. **Persona Prompt** — single-screen modal → `QueryContext` (section 4).
5. **Cache Lookup** — match logic + the ≥3 decision (section 5).
6. **Whitelist Search** — `allowed_domains` + Places enrichment (section 6).
7. **Result Card + Store** — Trippy styling + store-after-display (sections 7–8).
8. **Loading UI** — spinner + 8s progress bar (sections 10–11).
9. **Replace "Idea"** + credit/time testing (sections 9, 11).

---

### Appendix: Data sources at a glance
| Data | Source |
|---|---|
| Place names + editorial description | Lametayel, TripAdvisor, Travel+Leisure, Nat Geo, Lonely Planet, Atlas Obscura |
| Rating / price / visit time / coordinates | Google Places API |
| City locations in the trip | Google Geocoding API |