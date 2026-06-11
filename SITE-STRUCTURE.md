# Trippy — Site Structure & URL Architecture
## letsexploring.com | Information Architecture for SEO

---

## URL Hierarchy

```
https://letsexploring.com/
│
├── /                           ← Landing (hub) — "Free Group Trip Planner"
│   Priority: 1.0 | Change: weekly
│
├── /features/                  ← Feature pillar
│   ├── /features/itinerary     — Collaborative Trip Itinerary Planner
│   ├── /features/budget        — Group Budget Tracker & Expense Splitter
│   ├── /features/packing       — Shared Group Packing List
│   ├── /features/map           — Interactive Trip Map
│   ├── /features/ai-suggestions — AI Activity Suggestions
│   ├── /features/crew          — Group Crew Manager & Invites
│   ├── /features/offline       — Offline Trip Planner
│   └── /features/emergency     — Travel Emergency Contacts
│   Priority: 0.8–0.9 | Change: monthly
│
├── /destinations/              ← Destination pillar (highest HE ROI)
│   ├── /destinations/israel    — Israel Group Trip Planner
│   ├── /destinations/negev     — Negev Desert Trip Itinerary
│   ├── /destinations/masada-dead-sea
│   └── /destinations/makhtesh-ramon
│   Priority: 0.6–0.7 | Change: monthly
│
├── /blog/                      ← Blog pillar
│   ├── /blog                   — Blog index
│   ├── /blog/how-to-plan-group-trip
│   ├── /blog/split-travel-expenses
│   ├── /blog/group-packing-list
│   ├── /blog/7-day-israel-itinerary
│   ├── /blog/negev-desert-guide
│   ├── /blog/masada-dead-sea-tour
│   ├── /blog/best-free-trip-planner-2026
│   ├── /blog/trip-planner-with-map
│   ├── /blog/coordinate-group-trip
│   └── /blog/what-to-pack-desert-trip
│   Priority: 0.6–0.7 | Change: weekly (index), monthly (posts)
│
├── /vs/                        ← Competitor comparison (future)
│   ├── /vs/wanderlog
│   └── /vs/tripit
│   Priority: 0.5 | Change: monthly
│
├── /pricing                    ← Trust signal (free product = still needs page)
│   Priority: 0.7 | Change: monthly
│
├── /about                      ← E-E-A-T signal
│   Priority: 0.5 | Change: monthly
│
│   ── Authenticated (noindex) ──
│
├── /app                        ← noindex, nofollow (auth required)
├── /join/[token]               ← noindex, nofollow (dynamic invite token)
├── /account/confirm-delete     ← noindex, nofollow
└── /account/cancel-delete      ← noindex, nofollow
```

---

## Sitemap Coverage

### Current `app/sitemap.ts` (implemented)

| URL | Priority | hreflang EN | hreflang HE |
|---|---|---|---|
| `https://letsexploring.com/` | 1.0 | ✅ | ✅ |
| `https://letsexploring.com/features/itinerary` | 0.9 | ✅ | ✅ |
| `https://letsexploring.com/features/budget` | 0.9 | ✅ | ✅ |
| `https://letsexploring.com/features/packing` | 0.9 | ✅ | ✅ |
| `https://letsexploring.com/features/map` | 0.9 | ✅ | ✅ |
| `https://letsexploring.com/features/ai-suggestions` | 0.8 | ✅ | ✅ |
| `https://letsexploring.com/features/crew` | 0.8 | ✅ | ✅ |
| `https://letsexploring.com/features/offline` | 0.8 | ✅ | ✅ |
| `https://letsexploring.com/destinations/israel` | 0.7 | ✅ | ✅ |
| `https://letsexploring.com/destinations/negev` | 0.6 | ✅ | ✅ |
| `https://letsexploring.com/blog` | 0.7 | ✅ | — |

*Blog post entries to be added dynamically as posts are published.*

---

## Internal Linking Architecture

```
/ (Hub — highest PageRank)
├──[anchor: "collaborative itinerary planner"] → /features/itinerary
├──[anchor: "group expense splitter"]          → /features/budget
├──[anchor: "shared packing list"]             → /features/packing
├──[anchor: "interactive trip map"]            → /features/map
├──[anchor: "AI activity suggestions"]         → /features/ai-suggestions
├──[anchor: "travel planning guides"]          → /blog
└──[anchor: "plan Israel trip"]                → /destinations/israel

/features/itinerary
├──[anchor: "track expenses"]                  → /features/budget
├──[anchor: "see on map"]                      → /features/map
└──[anchor: "planning guide"]                  → /blog/how-to-plan-group-trip

/features/budget
├──[anchor: "track what to pack"]              → /features/packing
└──[anchor: "group expense guide"]             → /blog/split-travel-expenses

/destinations/israel
├──[anchor: "Negev itinerary"]                 → /destinations/negev
├──[anchor: "plan your Israel trip"]           → /features/itinerary
└──[anchor: "7-day guide"]                     → /blog/7-day-israel-itinerary

/blog/how-to-plan-group-trip
├──[anchor: "itinerary planner"]               → /features/itinerary
├──[anchor: "budget tracker"]                  → /features/budget
├──[anchor: "packing list"]                    → /features/packing
└──[anchor: "start for free"]                  → / (CTA)
```

---

## Anchor Text Strategy

| Destination | Primary Anchor EN | Primary Anchor HE | Avoid |
|---|---|---|---|
| `/features/itinerary` | "collaborative trip itinerary" | "מסלול טיול שיתופי" | "click here", "itinerary page" |
| `/features/budget` | "group expense splitter" | "מחלק הוצאות קבוצתי" | "budget page" |
| `/features/packing` | "shared packing list" | "רשימת ציוד משותפת" | "packing page" |
| `/features/map` | "interactive trip map" | "מפת טיול אינטראקטיבית" | "map page" |
| `/destinations/israel` | "plan Israel group trip" | "תכנן טיול קבוצתי לישראל" | "Israel page" |
| `/blog` | "travel planning guides" | "מדריכי תכנון טיולים" | "blog" |

---

## Page Metadata Schema (per route type)

### Landing Page (`/`)
```typescript
{
  title: 'Trippy — Free Group Trip Planner | Plan Together',  // EN
  // OR
  title: 'Trippy — מתכנן טיולים קבוצתי חינמי | תכנן יחד',  // HE
  alternates: {
    canonical: 'https://letsexploring.com',
    languages: { 'en-US': '...', 'he-IL': '...?lang=he' },
  },
  openGraph: { locale: 'en_US', alternateLocale: ['he_IL'] },
  // JSON-LD: SoftwareApplication + Organization + WebSite
}
```

### Feature Pages (`/features/*`)
```typescript
{
  title: '[Feature Name] — Trippy',   // uses title.template from layout
  alternates: { canonical, languages },
  // JSON-LD: BreadcrumbList + (optional) SoftwareApplication
}
```

### Blog Posts (`/blog/*`)
```typescript
{
  title: '[Post Title] | Trippy Blog',
  // JSON-LD: Article + BreadcrumbList
  // author: { name, url } for E-E-A-T
}
```

### Destination Pages (`/destinations/*`)
```typescript
{
  title: '[Destination] Group Trip Planner — Trippy',
  // JSON-LD: BreadcrumbList + TouristDestination (future)
}
```

---

## Robots Directive Summary

| Route | Index | Follow | Method |
|---|---|---|---|
| `/` | ✅ | ✅ | default |
| `/features/*` | ✅ | ✅ | default |
| `/blog/*` | ✅ | ✅ | default |
| `/destinations/*` | ✅ | ✅ | default |
| `/app` | ❌ | ❌ | `metadata.robots` |
| `/join/[token]` | ❌ | ❌ | `layout.tsx` metadata |
| `/account/*` | ❌ | ❌ | `layout.tsx` metadata |
| `/api/*` | ❌ | ❌ | `robots.txt` Disallow |
| `/auth/*` | ❌ | ❌ | `robots.txt` Disallow |

---

## Hreflang Map

| Locale | URL Pattern | Implementation |
|---|---|---|
| `en-US` | `https://letsexploring.com[path]` | `alternates.languages['en-US']` |
| `he-IL` | `https://letsexploring.com[path]?lang=he` | `alternates.languages['he-IL']` |
| `x-default` | `https://letsexploring.com[path]` | Falls back to EN |

*Note: When URL-based locale routing (`/he/...`) is implemented in the future, update hreflang accordingly for stronger HE indexing signal.*

---

## Schema Markup by Page Type

| Page Type | Schema Types |
|---|---|
| Landing `/` | SoftwareApplication, Organization, WebSite |
| Feature pages | BreadcrumbList |
| Blog posts | Article, BreadcrumbList |
| Destination pages | BreadcrumbList |
| About page | Organization, Person |
| Pricing page | Offer (free) |

---

*Based on SEO_MASTER_PLAN.md sections 10, 21 — letsexploring.com | 2026-06-11*
