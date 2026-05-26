# TRIPPY V2 — FEATURES CREW

> **Owner:** New Features & Integrations  
> **Branch:** `v2/features` (one sub-branch per feature)  
> **Reads:** `00_GLOBAL.md` first

> **EXCLUDED (by design):** Real-time flight tracking, personal document storage (passports/IDs), and SOS/emergency contacts. Liability is too high if any external service fails.

---

## 1. FEATURE ROADMAP OVERVIEW

| Wave | Feature | Impact | Effort | API Required |
|------|---------|--------|--------|--------------|
| 1 | Trip Map View | ★★★★★ | Medium | Mapbox GL JS |
| 1 | World Clock Widget | ★★★★☆ | Low | Browser Intl API |
| 1 | Trip DNA Card | ★★★★☆ | Medium | Canvas API |
| 1 | Smart Budget Alerts | ★★★★☆ | Low | None (internal) |
| 1 | Expense Settlement | ★★★★☆ | Low | None (internal) |
| 2 | Collaborative Voting Board | ★★★★☆ | Medium | Supabase Realtime |
| 2 | Trip Soundtrack | ★★★☆☆ | High | Spotify Web API |
| 2 | Language Cards | ★★★★☆ | Medium | Web Speech API |
| 2 | Cultural Briefing | ★★★☆☆ | Low | Claude AI |
| 2 | Packing Intelligence | ★★★★☆ | Low | OpenWeather + Claude |
| 3 | Trip Recap Story | ★★★★★ | High | Claude + Canvas |
| 3 | Carbon-Aware Planning | ★★★☆☆ | Low | Internal calc |
| 3 | Memory Lane | ★★★☆☆ | Medium | Browser File API |

---

## 2. WAVE 1 — SHIP WITH V2 LAUNCH

### Feature 1: Trip Map View

**What it is:** A full-screen map showing all trip events as pins, with day-by-day route lines connecting them.

**User story:** "I want to see my 10-day Italy trip plotted on a map, with color-coded days and a route showing how we're moving city to city."

**Implementation:**

```typescript
// app/components/screens/MapScreen/index.tsx
'use client';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { useTripStore } from '@/lib/stores/tripStore';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MapScreen() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { trip } = useTripStore();

  useEffect(() => {
    if (!mapRef.current || !trip) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [trip.dayMeta?.[0]?.lng ?? 12.5, trip.dayMeta?.[0]?.lat ?? 41.9],
      zoom: 6,
    });

    // Add event pins per day (color-coded by day number)
    Object.entries(trip.events).forEach(([dayNum, events]) => {
      events.forEach(ev => {
        if (!ev.lat || !ev.lng) return;
        const el = document.createElement('div');
        el.className = 'map-pin';
        el.style.background = DAY_COLORS[Number(dayNum) % DAY_COLORS.length];
        new mapboxgl.Marker(el)
          .setLngLat([ev.lng, ev.lat])
          .setPopup(new mapboxgl.Popup().setText(ev.name))
          .addTo(map);
      });
    });

    return () => map.remove();
  }, [trip]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
```

**NavBar tab:** Add `map` to the TABS array in `NavBar.tsx`.

**Map style:** Use `mapbox://styles/mapbox/light-v11` in light mode, `mapbox://styles/mapbox/dark-v11` in dark mode.

**APIs:** Mapbox GL JS (`mapbox-gl` npm package). Free tier: 50,000 map loads/month.

---

### Feature 2: World Clock Widget

See dedicated file `08_WORLD_CLOCK_TRAVEL.md` for full implementation.

**Summary:** Shows current time at destination alongside home time. Updates every second. Shown as a compact 2-line widget in the DashboardScreen hero card.

---

### Feature 3: Trip DNA Card

**What it is:** A shareable image card showing your trip's "DNA" — destinations, vibes, activity breakdown, traveler count, and a unique visual fingerprint generated from trip data.

**User story:** "I want to share a beautiful summary card of my trip on Instagram before we go."

**Implementation:**

```typescript
// lib/tripDNA.ts — Canvas-based card generator
export async function generateTripDNA(trip: Trip): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;  // Portrait, Instagram-friendly
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1920);
  grad.addColorStop(0, '#C4714A');   // terra
  grad.addColorStop(0.5, '#8B5E3C');
  grad.addColorStop(1, '#2C1A0E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Trip title
  ctx.font = 'bold 72px Bricolage Grotesque';
  ctx.fillStyle = '#F4EFE8';
  ctx.fillText(trip.name, 80, 200);

  // Destination badges
  const countries = trip.countries ?? [];
  countries.forEach((c, i) => {
    ctx.fillStyle = 'rgba(244, 239, 232, 0.15)';
    roundRect(ctx, 80 + i * 180, 280, 160, 52, 26);
    ctx.fillStyle = '#F4EFE8';
    ctx.font = '28px Bricolage Grotesque';
    ctx.fillText(c, 110 + i * 180, 312);
  });

  // Activity breakdown — radial segments
  const categories = countCategories(trip.events);
  drawPieChart(ctx, 540, 900, 260, categories);

  // DNA fingerprint — unique bar pattern from event times
  drawDNABars(ctx, trip.events, 80, 1200, 920, 200);

  // Footer
  ctx.font = '36px Bricolage Grotesque';
  ctx.fillStyle = 'rgba(244, 239, 232, 0.6)';
  ctx.fillText('Planned with Trippy.', 80, 1840);

  return new Promise(res => canvas.toBlob(b => res(b!), 'image/png'));
}
```

**Sharing:**
```typescript
// Share via Web Share API
const blob = await generateTripDNA(trip);
const file = new File([blob], 'trippy-dna.png', { type: 'image/png' });
await navigator.share({ files: [file], title: trip.name });
```

---

### Feature 4: Smart Budget Alerts

**What it is:** Real-time budget awareness as you add expenses. Warns at 80% and 100% of budget with contextual advice.

**Implementation:**
```typescript
// In addExpense action — after optimistic update:
const totalSpent = (trip.expenses ?? []).reduce((sum, e) => sum + e.amount, 0);
const budget = trip.budget ?? 0;

if (budget > 0) {
  const pct = totalSpent / budget;
  if (pct >= 1.0 && prevPct < 1.0) {
    toast.warning(t('budget.over', { amount: formatCurrency(totalSpent - budget) }));
    haptic('warning');
  } else if (pct >= 0.8 && prevPct < 0.8) {
    toast.info(t('budget.eightyPct', { remaining: formatCurrency(budget - totalSpent) }));
  }
}
```

**No new APIs needed** — uses existing expense data.

---

### Feature 5: Expense Settlement ("Who Owes Who")

**What it is:** After the trip, shows a minimal set of payments to settle all debts.

**User story:** "Guy paid €120 for dinner, Sarah paid €80 for museum tickets, Mike paid nothing. Show me who owes who."

**Algorithm:**
```typescript
// lib/settlement.ts
export interface Settlement {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export function calculateSettlements(expenses: Expense[]): Settlement[] {
  // 1. Calculate net balance per person
  const balances: Record<string, number> = {};
  for (const exp of expenses) {
    const share = exp.amount / exp.splitAmong.length;
    balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) + exp.amount;
    for (const person of exp.splitAmong) {
      balances[person] = (balances[person] ?? 0) - share;
    }
  }

  // 2. Greedy settlement
  const creditors = Object.entries(balances).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const debtors   = Object.entries(balances).filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]);
  const result: Settlement[] = [];

  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const [creditor, credit] = creditors[ci];
    const [debtor, debt]     = debtors[di];
    const amount = Math.min(credit, -debt);

    result.push({ from: debtor, to: creditor, amount: Math.round(amount * 100) / 100, currency: expenses[0]?.currency ?? 'USD' });

    creditors[ci][1] -= amount;
    debtors[di][1] += amount;

    if (Math.abs(creditors[ci][1]) < 0.01) ci++;
    if (Math.abs(debtors[di][1]) < 0.01) di++;
  }

  return result;
}
```

---

## 3. WAVE 2 — 6-8 WEEKS POST-LAUNCH

### Feature 6: Collaborative Voting Board

**What it is:** A Kanban-style "Maybe" board where crew members propose and vote on optional activities before they get added to the itinerary.

**Boards:** `Proposed → Voting → Accepted → Scheduled`

**Supabase schema:**
```sql
CREATE TABLE trip_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  proposed_by text,
  votes jsonb DEFAULT '{}',
  status text DEFAULT 'proposed',
  created_at timestamptz DEFAULT now()
);
```

**Realtime:** Subscribe to `trip_proposals` changes — vote updates appear instantly for all crew.

---

### Feature 7: Trip Soundtrack (Spotify)

**What it is:** A curated Spotify playlist auto-generated based on the trip's destinations. Each country/city adds 2-3 tracks from local artists.

**OAuth flow:** Spotify PKCE (no server-side secret needed).

```typescript
// lib/spotify.ts
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = `${window.location.origin}/auth/spotify`;

export function initiateSpotifyAuth() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem('spotify_cv', codeVerifier);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'playlist-modify-public',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}
```

**Playlist generation:** For each country in the trip, search Spotify for `market=${countryCode} genre:local` and add top 3 tracks.

**Fallback if no Spotify:** Show a YouTube Music search link instead.

---

### Feature 8: Language Cards

**What it is:** For each destination, show a card with 5 essential phrases in the local language with pronunciation guide and audio playback.

**Phrases always included:**
- Hello / Thank you / Please / Excuse me / Do you speak English?

**Implementation:**

```typescript
// Data: built-in phrase dictionary (no API needed for basic phrases)
// lib/languagePhrases.ts
export const PHRASES: Record<string, PhrasePack> = {
  it: {
    language: 'Italian',
    flag: '🇮🇹',
    phrases: [
      { en: 'Hello', local: 'Ciao', pronunciation: 'CHOW', voiceLang: 'it-IT' },
      { en: 'Thank you', local: 'Grazie', pronunciation: 'GRAT-zee-eh', voiceLang: 'it-IT' },
      // ...
    ],
  },
  // ... 40+ languages
};

// Pronunciation playback via Web Speech API
export function pronounce(text: string, lang: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}
```

**No external API required for basic phrases** — dictionary is bundled. Advanced phrases can call Claude with a prompt like `"Give me 5 advanced travel phrases in Italian for a tourist"`

---

### Feature 9: Cultural Briefing

**What it is:** A one-screen "Before You Go" briefing for each destination — customs, tipping norms, dress codes, safety notes, local etiquette.

**Implementation:** Claude AI generates this from a structured prompt:

```typescript
// app/api/cultural-brief/route.ts
const prompt = `
Generate a brief cultural guide for a tourist visiting ${country}.
Cover: tipping norms, dress code (religious sites), key customs to know,
common scams to avoid, and 2 local phrases that will earn you respect.
Format as JSON with keys: tipping, dressCode, customs[], scams[], phrases[].
Keep each entry under 40 words.
`;

const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 600,
  messages: [{ role: 'user', content: prompt }],
});
```

**Cache:** Store the response in Supabase or `localStorage` keyed by country code — never re-fetch the same country twice per session.

---

### Feature 10: Packing Intelligence

**What it is:** Smart packing suggestions based on trip weather, activities, and duration. Warns if you're missing critical items for a category (e.g., hiking gear for a hiking event).

**Algorithm:**
```typescript
// lib/packingIntelligence.ts
export function generatePackingWarnings(
  supplies: SupplyItem[],
  events: TripEvent[],
  weather: WeatherData,
): PackingWarning[] {
  const warnings: PackingWarning[] = [];
  const categories = new Set(events.map(e => e.category));
  const packedNames = new Set(supplies.map(s => s.name.toLowerCase()));

  // Rain check
  const hasRain = weather.daily.some(d => d.precipitation > 2);
  if (hasRain && !packedNames.has('umbrella') && !packedNames.has('rain jacket')) {
    warnings.push({ severity: 'high', message: t('packing.rain'), icon: '🌧️' });
  }

  // Hiking check
  if (categories.has('outdoor') && !packedNames.has('hiking shoes') && !packedNames.has('boots')) {
    warnings.push({ severity: 'medium', message: t('packing.hiking'), icon: '🥾' });
  }

  return warnings;
}
```

---

## 4. WAVE 3 — 3 MONTHS POST-LAUNCH

### Feature 11: Trip Recap Story

After returning from the trip, Trippy generates a beautiful visual story:
- Cover page: trip name, dates, countries, crew
- Day-by-day highlights with event descriptions
- Expense summary with charts
- Memorable moments (notes and photos)
- Export as PDF or share as link

**Generator:** Claude Haiku writes prose summaries for each day. Canvas API renders the visual pages. jsPDF exports.

---

### Feature 12: Carbon-Aware Planning

**What it is:** Shows the carbon footprint of the trip's transport legs. Already partially implemented in `utils.ts` — just needs a UI.

**Existing logic:** `calculateCarbonFootprint(transport, distanceKm)` exists. Surface it in the dashboard.

**Data source:** ICAO emission factors (bundled constants — no API needed).

**UI:** A small chip in the dashboard: `🌱 2.4t CO₂` with a breakdown sheet.

---

### Feature 13: Memory Lane (Photo Timeline)

**What it is:** Users can attach photos to events. After the trip, all photos arrange chronologically into a visual timeline.

**Storage:** Browser File API + Supabase Storage. Photos stored in user-scoped bucket.

**No cloud processing:** Thumbnails generated client-side with Canvas API to avoid upload size issues.

```typescript
// Compress before upload
async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const maxSize = 1200;
  const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise(res => canvas.toBlob(b => res(b!), 'image/webp', 0.8));
}
```

---

## 5. INNOVATION FEATURES (Differentiated)

These are the features that put Trippy in a class of its own:

### IN-1: "Vibe Match" Trip Personality Quiz

Before creating a trip, a 5-question quiz detects the crew's travel vibe:
- **Explorer** (max activities, tight schedule)
- **Relaxed** (slower pace, longer gaps)
- **Foodie** (meal-centric, restaurant blocks)
- **Budget** (cost-optimized suggestions)
- **Luxury** (upscale options from AI)

The vibe influences AI suggestions, packing recommendations, and dashboard personality.

### IN-2: Smart Gap Detection

When events have a 2+ hour gap, Trippy proactively suggests:
- Nearby restaurants (Google Places: `type=restaurant`)
- Time to visit a nearby attraction
- "This gap is perfect for a coffee break — here are 3 options nearby"

Implemented as a push notification or ambient toast, not a blocking UI.

### IN-3: "Did We Go There?" Post-Trip Check-In

After each event's scheduled time passes, Trippy asks: "Did you visit the Colosseum?" (yes/skip). Marked events get a ✓ checkmark. After the trip: "You completed 14/17 planned activities (82%)."

### IN-4: Multi-Trip Dashboard

A home screen showing all trips:
- **Upcoming:** countdown chips
- **Active (today):** highlighted, live next-event
- **Past:** grayed out, tap for recap

Requires the `TripPickerScreen` from `06_V2_SPEC.md`.

### IN-5: Trip Template Library

Save and reuse itinerary patterns:
- "3 Days in Rome" template (pre-populated events)
- "Beach Week Essentials" supplies list
- Community templates (future)

Templates are JSON exported from any existing trip and importable into a new one.

---

## 6. APIS SUMMARY

| Feature | API / Service | Cost Model | Notes |
|---------|--------------|------------|-------|
| Trip Map | Mapbox GL JS | $0.50/1K loads after 50K free | Add `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Language Cards | Web Speech API | Free (browser built-in) | No key needed |
| Cultural Briefing | Anthropic Claude Haiku | ~$0.001/brief | Cache aggressively |
| Packing Intelligence | OpenWeather (already have) | Free tier sufficient | Reuse existing |
| Trip Soundtrack | Spotify Web API | Free (PKCE, user's own account) | `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` |
| Trip DNA Card | Canvas API | Free (browser built-in) | No key needed |
| Expense Settlement | None | Free | Pure algorithm |
| Smart Budget Alerts | None | Free | Internal calc |
| Carbon Footprint | None | Free | Bundled constants |
| Memory Lane Photos | Supabase Storage | $0.021/GB after 1GB free | User-scoped bucket |
