# Trippy — Implementation Roadmap
## letsexploring.com | Phased SEO Action Plan

---

## Status Legend

✅ Done · 🔄 In progress · ⏳ Not started · ❌ Blocked

---

## Phase 1 — Fix Critical Blockers ✅ (Week 1 — Complete)

All critical technical issues that were blocking Google from correctly understanding, crawling, and indexing the site.

| # | Task | File | Effort | Status |
|---|---|---|---|---|
| 1.1 | Fix `metadataBase` to `https://letsexploring.com` | `app/layout.tsx` | 30 min | ✅ |
| 1.2 | Fix `og:url` and `og:image` from `trippy.app` | `app/layout.tsx` | 15 min | ✅ |
| 1.3 | Add `title.template` for feature pages | `app/layout.tsx` | 10 min | ✅ |
| 1.4 | Fix sitemap domain + expand to 11 URLs + hreflang | `app/sitemap.ts` | 30 min | ✅ |
| 1.5 | Fix `robots.txt` sitemap URL | `public/robots.txt` | 5 min | ✅ |
| 1.6 | Add `noindex` to `/app` | `app/app/page.tsx` | 10 min | ✅ |
| 1.7 | Add `noindex` to `/join/[token]` | `app/join/[token]/layout.tsx` | 10 min | ✅ |
| 1.8 | Add `noindex` to `/account/confirm-delete` | `app/account/confirm-delete/layout.tsx` | 10 min | ✅ |
| 1.9 | Add `noindex` to `/account/cancel-delete` | `app/account/cancel-delete/layout.tsx` | 10 min | ✅ |
| 1.10 | Rewrite landing H1 to "Free Group Trip Planner" | `app/page.tsx` | 20 min | ✅ |
| 1.11 | Add feature sections below fold (400+ words, bilingual) | `app/page.tsx` | 3 hrs | ✅ |
| 1.12 | Add locale-aware `generateMetadata()` with canonical + hreflang | `app/page.tsx` | 1 hr | ✅ |
| 1.13 | Create `SchemaMarkup.tsx` (SoftwareApp + Org + WebSite JSON-LD) | `app/components/SchemaMarkup.tsx` | 1 hr | ✅ |
| 1.14 | Update `manifest.json` (categories, screenshots, description) | `public/manifest.json` | 30 min | ✅ |
| 1.15 | Rewrite `llms.txt` with correct domain + full product description | `public/llms.txt` | 30 min | ✅ |
| 1.16 | **Audit live "Volunteer Trip Planner" title bug** | Deployment config | 1 hr | ⏳ URGENT |

---

## Phase 2 — Schema, Metadata & OG Images (Week 2)

| # | Task | File | Effort | Status |
|---|---|---|---|---|
| 2.1 | Create `public/og-image.png` (1200×630px) | Design tool | 2 hrs | ⏳ |
| 2.2 | Create `public/og-image-he.png` (RTL Hebrew card) | Design tool | 2 hrs | ⏳ |
| 2.3 | Verify schema in Google Rich Results Test | External tool | 30 min | ⏳ |
| 2.4 | Add `<link rel="preload">` for Assistant Hebrew font | `app/layout.tsx` | 30 min | ⏳ |
| 2.5 | Verify Framer Motion tree-shaken from landing page bundle | `next.config` | 1 hr | ⏳ |
| 2.6 | Confirm www → non-www 301 redirect | Vercel/DNS config | 30 min | ⏳ |
| 2.7 | Create `public/llms-he.txt` (Hebrew llms.txt) | `public/llms-he.txt` | 30 min | ⏳ |
| 2.8 | Add `og:locale` + `og:locale:alternate` to layout fallback | `app/layout.tsx` | 30 min | ⏳ |
| 2.9 | Ensure 404 pages return HTTP 404 status code | `app/not-found.tsx` | 1 hr | ⏳ |
| 2.10 | Add skip-navigation link (WCAG + SEO) | `app/layout.tsx` | 30 min | ⏳ |

---

## Phase 3 — Landing Page Polish & Feature Pages (Weeks 3–6)

### Feature Pages (build in order of keyword volume)

| # | Page URL | EN H1 | HE H1 | Target Keyword | Volume |
|---|---|---|---|---|---|
| 3.1 | `/features/itinerary` | Collaborative Trip Itinerary Planner | מתכנן מסלול טיול שיתופי | shared itinerary app | 880 |
| 3.2 | `/features/budget` | Group Trip Budget Tracker & Expense Splitter | מעקב תקציב ומחלק הוצאות | group trip expense splitter | 320 |
| 3.3 | `/features/packing` | Shared Group Packing List | רשימת ציוד קבוצתית | shared packing list travel | 390 |
| 3.4 | `/features/map` | Interactive Trip Map Planner | מפת טיול אינטראקטיבית | trip planner with map | 2,900 |
| 3.5 | `/features/ai-suggestions` | AI-Powered Activity Suggestions | הצעות פעילויות AI | AI trip planner | ~500 |
| 3.6 | `/features/crew` | Group Trip Crew Manager | ניהול צוות טיול | group travel coordinator | 480 |
| 3.7 | `/features/offline` | Offline Trip Planner | מתכנן טיול אופליין | offline trip planner | ~300 |
| 3.8 | `/features/emergency` | Emergency Contacts for Travel | אנשי קשר חירום בנסיעה | emergency contacts travel | ~200 |

### Each feature page must include

- [ ] Locale-aware `generateMetadata()` with canonical + hreflang
- [ ] BreadcrumbList JSON-LD
- [ ] EN + HE content (700–900 words each)
- [ ] Screenshot or feature visual
- [ ] 3-question FAQ section
- [ ] Internal links to 2–3 related feature pages
- [ ] Added to `app/sitemap.ts`

### Social Proof (add to landing)

- [ ] Add "X,000+ trips planned" counter (even if a placeholder initially)
- [ ] Add "100% Free — No credit card" badge/callout above fold
- [ ] Add 2–3 testimonial quotes

---

## Phase 4 — Blog & Destination Content (Weeks 7–12)

### Blog infrastructure

| Task | File | Status |
|---|---|---|
| Create `/blog` index page | `app/blog/page.tsx` | ⏳ |
| Create blog post template component | `app/blog/[slug]/page.tsx` | ⏳ |
| Add blog to sitemap (dynamic entries) | `app/sitemap.ts` | ⏳ |
| Add blog RSS feed | `app/feed.xml/route.ts` | ⏳ |

### Priority blog posts (Month 1–3)

| # | Title EN | Title HE | Keyword | Volume |
|---|---|---|---|---|
| B-01 | How to Plan a Group Trip (Step-by-Step) | איך לתכנן טיול קבוצתי | how to plan a group trip | 5,400 |
| B-02 | How to Split Travel Expenses in a Group | איך לחלק הוצאות בטיול קבוצתי | how to split group travel expenses | 2,900 |
| B-03 | Best Free Trip Planner Apps in 2026 | אפליקציות מתכנן טיולים חינמיות 2026 | free trip planner app 2026 | 2,400 |
| B-04 | 7-Day Israel Itinerary for Groups | מסלול ישראל 7 ימים לקבוצות | Israel itinerary 7 days | 1,600 |
| B-05 | The Ultimate Group Travel Packing List | רשימת הציוד האולטימטיבית | group packing list | 1,600 |
| B-06 | Negev Desert Trip Guide — 3 Days | מדריך טיול נגב — 3 ימים | negev trip guide | 1,300 |
| B-07 | Masada & Dead Sea Group Tour Plan | תכנון טיול קבוצתי מצדה וים המלח | masada dead sea trip | 1,300 |
| B-08 | Trip Planner with Map: Why You Need One | מתכנן טיול עם מפה | trip planner with map | 2,900 |
| B-09 | How to Coordinate a Group Trip | איך לתאם טיול קבוצתי | coordinate group trip | 1,000 |
| B-10 | What to Pack for a Desert Trip | מה לארוז לטיול במדבר | what to pack desert trip | 880 |

### Destination pages

| # | URL | EN H1 | HE H1 | Keyword | Volume |
|---|---|---|---|---|---|
| D-01 | `/destinations/israel` | Plan Your Israel Group Trip | תכנן טיול קבוצתי לישראל | israel group trip planner | 720 |
| D-02 | `/destinations/negev` | Negev Desert Trip Itinerary | מסלול טיול בנגב | negev desert tour itinerary | 480 |

---

## Phase 5 — Authority & Measurement (Months 7–12)

| Task | Priority | Notes |
|---|---|---|
| Set up Google Search Console for `letsexploring.com` | 🔴 | Submit sitemap after domain fix |
| Set up Google Search Console for `trippy.app` | 🟠 | Monitor for redirect authority pass-through |
| Add GA4 (deeper keyword + conversion data) | 🟠 | Vercel Analytics already present |
| Set up Bing Webmaster Tools | 🟠 | Bing = 10–15% of search volume |
| Set ISR target geography → Israel (GSC) | 🟡 | International Targeting setting |
| Collect real user reviews for schema `aggregateRating` | 🟡 | After 100+ users provide feedback |
| Build comparison pages (`/vs/wanderlog`, `/vs/tripit`) | 🟡 | Quick-win competitor keywords |
| Build `/pricing` page (trust signal even for free product) | 🟡 | E-E-A-T + commercial intent |
| Build `/about` page (E-E-A-T founder signal) | 🟡 | Increases AI citation confidence |
| Run PageSpeed Insights baseline | 🟠 | Before + after feature page launch |
| Brand monitoring (Google Alerts for "Trippy group planner") | 🟢 | Passive signal tracking |

---

## Dependencies

```
og-image.png created
    ↓
Rich Results Test passes
    ↓
Submit sitemap to GSC
    ↓
Monitor impressions & index coverage
    ↓
Feature pages published
    ↓
Internal links wired up
    ↓
Blog launched
    ↓
Link building + PR outreach
```

---

## Resource Estimate

| Phase | Developer Time | Design Time | Content Time |
|---|---|---|---|
| Phase 1 (done) | ~8 hrs | — | ~3 hrs |
| Phase 2 | ~4 hrs | 4 hrs (OG images) | ~1 hr |
| Phase 3 | ~12 hrs | 4 hrs (screenshots) | ~20 hrs |
| Phase 4 | ~8 hrs | — | ~40 hrs |
| Phase 5 | ~4 hrs | — | ~20 hrs |
| **Total** | **~36 hrs dev** | **~8 hrs design** | **~84 hrs content** |

---

*Based on SEO_MASTER_PLAN.md section 17 — letsexploring.com | 2026-06-11*
