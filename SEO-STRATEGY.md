# Trippy — SEO Strategy
## Full Bilingual (EN + HE) | letsexploring.com

**Generated**: 2026-06-11 | **Business type**: SaaS-style freemium PWA | **Framework**: Next.js + Supabase

---

## 1. Business Context

| Field | Value |
|---|---|
| Product | Trippy — Free Group Trip Planner |
| Live URL | https://letsexploring.com |
| Type | Progressive Web App (PWA), no app store required |
| Price | 100% free, no credit card, no premium tier |
| Languages | English (en-US) + Hebrew (he-IL) with full RTL |
| Framework | Next.js, React 19, Supabase, Tailwind CSS |
| SEO Health (baseline) | 28 / 100 |

### Target Audiences

| Persona | Language | Primary Search Intent |
|---|---|---|
| Trip organizer (groups of friends) | EN | "group trip planner free" |
| Budget-conscious traveler | EN | "split travel expenses app" |
| Hebrew-speaking Israeli planner | HE | "מתכנן טיולים קבוצתי חינמי" |
| Corporate team-travel HR manager | EN | "team offsite planner" |
| Family vacation coordinator | EN/HE | "family trip planner app" |

---

## 2. Current SEO Health

### Scorecard

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| Technical SEO | 25/100 | 22% | 5.5 |
| Content Quality | 30/100 | 23% | 6.9 |
| On-Page SEO | 35/100 | 20% | 7.0 |
| Schema / Structured Data | 0/100 | 10% | 0.0 |
| Performance (CWV) | 65/100 | 10% | 6.5 |
| AI Search Readiness | 20/100 | 10% | 2.0 |
| Images | 10/100 | 5% | 0.5 |
| **TOTAL** | | | **28.4 / 100** |

### Critical Blockers (resolved in Phase 1)

| ID | Issue | Impact |
|---|---|---|
| C-01 | Domain split: canonical → `trippy.app`, live → `letsexploring.com` | Google sees two unrelated sites |
| C-02 | `og-image.png` missing from `public/` | No social preview on any share |
| C-03 | Landing page is a sign-in wall (~15 indexable words) | Cannot rank for any keyword |
| C-04 | Zero JSON-LD schema markup | No rich results eligibility |
| C-05 | Live title "Volunteer Trip Planner" (deployment mismatch) | Misleads Google on product category |

---

## 3. Keyword Strategy

### English — Primary (high intent, rankable within 6 months)

| Priority | Keyword | Est. Monthly Volume | Difficulty | Page Target |
|---|---|---|---|---|
| P1 | free group trip planner | 2,400 | Low | Landing `/` |
| P1 | group trip planner | 8,100 | Medium | Landing `/` |
| P1 | group vacation planner | 5,400 | Medium | Landing `/` |
| P2 | collaborative trip planning | 1,300 | Low | Feature page |
| P2 | shared itinerary app | 880 | Low | Feature page |
| P2 | group trip budget tracker | 720 | Low | Budget feature |
| P2 | trip planner with map | 2,900 | Medium | Map feature |
| P3 | how to plan a group trip | 5,400 | Medium | Blog post |
| P3 | how to split expenses on a group trip | 2,900 | Medium | Blog post |
| P3 | best free trip planner app 2026 | 2,400 | Medium | Comparison page |

### Hebrew — Primary

| Priority | Keyword | Est. Monthly Volume | Page Target |
|---|---|---|---|
| P1 | מתכנן טיולים קבוצתי | 1,300 | Landing HE |
| P1 | תכנון טיול קבוצתי | 1,600 | Landing HE |
| P1 | אפליקציה לתכנון טיולים | 2,900 | Landing HE |
| P2 | רשימת ציוד לטיול | 1,900 | Packing feature HE |
| P2 | חלוקת הוצאות בטיול | 480 | Budget feature HE |
| P2 | תכנון טיול לישראל | 2,400 | Israel destination |
| P3 | טיול לנגב מסלול | 1,600 | Negev destination |
| P3 | מסלול מצדה ים המלח | 1,300 | Destination blog |

### Competitor & Alternative Keywords (quick-win gap)

| Keyword | Notes |
|---|---|
| tripit alternative free | Strong unmet demand |
| wanderlog alternative | Budget-focused angle |
| splitwise for travel | Expense-focused users |
| google trips alternative | Legacy users |

---

## 4. Content Pillar Architecture

```
/ (Hub — "Free Group Trip Planner")
├── /features/itinerary     — Collaborative Itinerary Planner
├── /features/budget        — Group Budget & Expense Splitter
├── /features/packing       — Shared Group Packing List
├── /features/map           — Interactive Trip Map
├── /features/ai-suggestions — AI Activity Suggestions
├── /features/crew          — Group Crew Manager & Invites
├── /features/offline       — Offline Trip Planner
├── /features/emergency     — Travel Emergency Contacts
├── /destinations/israel    — Israel Group Trip Planner (HE ROI flagship)
├── /destinations/negev     — Negev Desert Trip Itinerary
├── /blog                   — Group Travel Planning Blog
│   ├── /blog/how-to-plan-group-trip
│   ├── /blog/split-travel-expenses
│   ├── /blog/group-packing-list
│   ├── /blog/7-day-israel-itinerary
│   └── /blog/negev-desert-guide
└── /pricing                — Pricing (100% Free — trust signal)
```

---

## 5. E-E-A-T Strategy

| Signal | Current | Target |
|---|---|---|
| Author/creator identity | None | Add founder bio to blog posts |
| Social proof | None | "X trips planned" counter above fold |
| User reviews | None | Collect + display on landing + schema |
| Trust badges | None | "PWA of the Week" / "100% free" badge |
| Organization schema | None (✅ now implemented) | Verify in GSC Rich Results |
| About page | None | Create `/about` with team + mission |

---

## 6. Technical SEO Requirements

### Implemented (Phase 1 complete)

- [x] `metadataBase` → `https://letsexploring.com`
- [x] OG url, og:image fixed to correct domain
- [x] `alternates.canonical` + `alternates.languages` (hreflang en-US / he-IL)
- [x] `og:locale` + `og:locale:alternate` per locale
- [x] `generateMetadata()` locale-aware in `app/page.tsx`
- [x] `robots.txt` sitemap URL fixed
- [x] Sitemap expanded to 11 URLs with hreflang alternates
- [x] `manifest.json` updated: categories, screenshots, expanded description
- [x] `llms.txt` updated: full product + correct domain
- [x] `SchemaMarkup.tsx`: SoftwareApplication + Organization + WebSite JSON-LD
- [x] Landing H1 → "Free Group Trip Planner" (keyword-rich)
- [x] Feature sections below fold (400+ indexable words, bilingual)
- [x] noindex on `/app`, `/join/[token]`, `/account/*`

### Still Required

| Task | Priority | Effort |
|---|---|---|
| Create `public/og-image.png` (1200×630px) | 🔴 Critical | 2 hrs |
| Create `public/og-image-he.png` (RTL Hebrew variant) | 🟠 High | 2 hrs |
| Add `<link rel="preload">` for Assistant Hebrew font | 🟠 High | 30 min |
| Verify Framer Motion tree-shaken from landing bundle | 🟠 High | 1 hr |
| Verify www → non-www 301 redirect | 🟡 Medium | 30 min |
| Add skip-navigation link for WCAG | 🟡 Medium | 30 min |
| Ensure 404 routes return HTTP 404 status | 🟡 Medium | 1 hr |
| Verify `/app` soft 404 handling | 🟡 Medium | 1 hr |
| Add X-Robots-Tag via middleware for depth defence | 🟢 Low | 1 hr |

---

## 7. AI Search (GEO) Strategy

| Platform | Current Score | Target (6 months) |
|---|---|---|
| Google AI Overviews | 2/10 | 6/10 |
| ChatGPT (GPTBot) | 2/10 | 5/10 |
| Perplexity | 2/10 | 5/10 |
| Claude (ClaudeBot) | 2/10 | 5/10 |
| Bing Copilot | 2/10 | 5/10 |

### GEO Actions

1. ✅ AI bots explicitly allowed in `robots.txt`
2. ✅ `llms.txt` updated with complete product description
3. Add "100% free" claim prominently above fold
4. Add social proof numbers ("1,000+ groups")
5. Create FAQ section (no FAQPage schema — commercial SaaS restriction post-Aug 2023)
6. Create Hebrew `llms-he.txt`
7. Start blog: topical authority = more AI citation probability
8. Add comparison language ("Better than spreadsheets for group trips")

---

## 8. Hebrew SEO Strategy

### Technical

| Task | Status |
|---|---|
| `<html lang="he">` server-side | ✅ Done |
| `<html dir="rtl">` server-side | ✅ Done |
| Hebrew metadata via `generateMetadata()` | ✅ Done |
| hreflang `he-IL` in head | ✅ Done (alternates) |
| Hebrew OG tags | ✅ Done |
| Hebrew sitemap entries | ✅ Done |
| Hebrew font (Assistant) loaded | ✅ Done |

### Content

| Task | Priority |
|---|---|
| Create Hebrew og-image-he.png (RTL card) | 🟠 High |
| Create `llms-he.txt` | 🟠 High |
| Write Hebrew destination pages (Israel, Negev) | 🟠 High |
| Register site in Google Search Console → target Israel | 🟡 Medium |
| Hebrew blog posts (3+ to start) | 🟡 Medium |
| Add Hebrew breadcrumb labels to BreadcrumbList schema | 🟡 Medium |

---

## 9. KPI Targets

| Metric | Baseline | 3 Months | 6 Months | 12 Months |
|---|---|---|---|---|
| Organic clicks (monthly) | ~0 | 200 | 1,000 | 5,000 |
| Organic impressions | ~50 | 5,000 | 25,000 | 100,000 |
| Average ranking position | >50 | 20–30 | 10–20 | 5–15 |
| Keywords ranking top 30 | 0 | 5 | 15 | 40 |
| Indexed pages | 1 | 8 | 15+ | 30+ |
| Schema rich results | 0 | 1 (SoftwareApp) | 3 | 5 |
| Hebrew organic clicks | ~0 | 100 | 500 | 2,000 |
| AI citation mentions | 0 | 5 | 20 | 50 |
| PageSpeed score (landing) | Unknown | >80 | >90 | >90 |
| Landing conversion rate | 0% | 3% | 6% | 8% |

---

*Strategy based on SEO_MASTER_PLAN.md audit — letsexploring.com | v1.0 | 2026-06-11*
