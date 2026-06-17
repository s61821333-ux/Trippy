# Trippy

Free group trip planner. Shared itinerary, interactive map, group budget, packing list. Invite friends in seconds.

**Live:** [letsexploring.com](https://letsexploring.com)

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Auth + DB | Supabase (Postgres, RLS, passkeys) |
| AI | Anthropic Claude — plan generation, suggestions, budget coach, receipt scan |
| Maps | Leaflet + React Leaflet |
| State | Zustand |
| Tests | Playwright |
| Deploy | Vercel |

## Features

- **Trip planner** — day-by-day timeline with drag-reorder, category icons, per-event cost
- **AI assist** — generate full itinerary, get gap-filler suggestions, packing list, destination intel
- **Group budget** — expense tracking, currency conversion, settlement calculator
- **Interactive map** — all events plotted with route-time estimates
- **Invite system** — join via link or code, no account required to view
- **Hotels** — accommodation per day with cost rolled into budget
- **Supplies / packing** — shared checklist with per-item assignment
- **Emergency contacts** — stored per trip
- **Wishlist** — save ideas without committing to the itinerary
- **World clock** — per-event timezone awareness
- **PWA** — installable, service worker, offline shell
- **RTL / Hebrew** — full bidirectional layout support

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Anthropic keys
npm run dev
```

### Required env vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_GOOGLE_PLACES_KEY   # Places autocomplete
CLOUDFLARE_TURNSTILE_SECRET     # Captcha for passkey sign-in
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
```

## Tests

```bash
npm run test:fast        # smoke suite, iPhone 17 Chrome
npm run test:deep        # full flow
npm run test:extended    # edge cases, iPhone 17 Chrome
npm run test:appearance  # visual regression
npm run test:persona     # persona flows, iPhone 17 Chrome
npm run test:wide        # wide coverage, iPhone 17 Chrome
npm run test:all         # fast + deep + extended + persona + appearance
npm run test:report      # open last Playwright report
```

Add `--headed` suffix to any suite to watch the browser (e.g. `test:fast:headed`).

## Project structure

```
app/
  api/          API routes (trips, AI, invites, account)
  app/          Main app shell + dashboard
  components/
    screens/    Full-screen feature panels
    ui/         Primitive components
  account/      Account deletion flow
  join/         Invite token handler
  auth/         Supabase auth callback
lib/
  stores/       Zustand slices (trip, user, session, ui)
  types.ts      Shared TypeScript types
  db.ts         Supabase query helpers
  schemas.ts    Zod validation schemas
```
