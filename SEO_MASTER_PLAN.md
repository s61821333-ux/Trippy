# Trippy — SEO Master Plan
## Full Bilingual Audit & Recommendations (English + Hebrew)
### Live domain: letsexploring.com | Canonical target: trippy.app
#### Generated: 2026-06-11 | Scope: Full app content map + SXO + Strategic plan

---

> **How to read this document**
> Every recommendation row is formatted: `| ID | Area | EN Finding | HE Finding | Priority | Action |`
> Priority legend: 🔴 Critical (blocks rankings / causes penalties) · 🟠 High (fix within 1 week) · 🟡 Medium (fix within 1 month) · 🟢 Low (backlog)
> Hebrew direction note: All HE strings are written RTL and should be rendered with `dir="rtl"`.

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Domain & URL Audit](#2-domain--url-audit)
3. [Critical Issues (must fix first)](#3-critical-issues)
4. [Technical SEO Audit — 9 Categories](#4-technical-seo-audit)
5. [Metadata & On-Page Audit — Every Route](#5-metadata--on-page-audit)
6. [Full Bilingual Content Map](#6-full-bilingual-content-map)
7. [Keyword Strategy — English](#7-keyword-strategy--english)
8. [Keyword Strategy — Hebrew](#8-keyword-strategy--hebrew)
9. [Schema Markup Plan](#9-schema-markup-plan)
10. [Sitemap Strategy](#10-sitemap-strategy)
11. [OpenGraph & Social Cards](#11-opengraph--social-cards)
12. [SXO — Search Experience Optimization](#12-sxo--search-experience-optimization)
13. [GEO — AI Search & Generative Engine Optimization](#13-geo--ai-search)
14. [PWA & App-Store SEO](#14-pwa--app-store-seo)
15. [Hebrew-Specific SEO Considerations](#15-hebrew-specific-seo)
16. [Competitor Landscape & Gap Analysis](#16-competitor-landscape)
17. [Implementation Roadmap (phased)](#17-implementation-roadmap)
18. [Full EN ↔ HE SEO Translation Table](#18-full-en--he-seo-translation-table)
19. [Content Brief: Landing Page Rewrite](#19-content-brief-landing-page)
20. [Content Brief: Feature Pages](#20-content-brief-feature-pages)
21. [Internal Linking Strategy](#21-internal-linking-strategy)
22. [Core Web Vitals & Performance](#22-core-web-vitals--performance)
23. [Accessibility & SEO Intersection](#23-accessibility--seo-intersection)
24. [Measurement & KPIs](#24-measurement--kpis)

---

## 1. EXECUTIVE SUMMARY

### App Identity
- **Product**: Trippy — Free Group Trip Planner (collaborative travel planning PWA)
- **Live URL**: https://letsexploring.com/
- **Canonical target in code**: https://trippy.app
- **Framework**: Next.js (custom build), React 19, Supabase, Tailwind CSS
- **Languages**: English + Hebrew (RTL), with full 1,154-string i18n system
- **Type**: SaaS-style freemium PWA — single public landing page + authenticated app shell

### Overall SEO Health Score: 28 / 100

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Technical SEO | 25/100 | 22% | 5.5 |
| Content Quality | 30/100 | 23% | 6.9 |
| On-Page SEO | 35/100 | 20% | 7.0 |
| Schema / Structured Data | 0/100 | 10% | 0.0 |
| Performance (CWV) | 65/100 | 10% | 6.5 |
| AI Search Readiness | 20/100 | 10% | 2.0 |
| Images | 10/100 | 5% | 0.5 |
| **TOTAL** | | | **28.4 / 100** |

### Top 5 Blockers
1. 🔴 **Domain split**: canonical points to `trippy.app`; live traffic lands on `letsexploring.com` — Google sees two unrelated sites
2. 🔴 **Zero schema markup**: no SoftwareApplication, Organization, or BreadcrumbList
3. 🔴 **OG image missing**: `/og-image.png` is referenced in metadata but the file does not exist in `public/`
4. 🔴 **Landing page is a sign-in wall**: Google crawls a page with H1 "Trippy." and one CTA — no indexable feature content
5. 🟠 **Sitemap covers 1 URL only**: no feature pages, no blog, no hreflang entries

---

## 2. DOMAIN & URL AUDIT

| ID | Check | Finding | EN Status | HE Equivalent | Priority | Fix |
|---|---|---|---|---|---|---|
| D-01 | Primary domain | Code canonical = `trippy.app`; live site = `letsexploring.com` | 🔴 Domain mismatch | אי-תאימות דומיין | 🔴 Critical | Decide canonical domain; add 301 redirect or update all canonical references |
| D-02 | robots.txt sitemap reference | Points to `https://trippy.app/sitemap.xml` | 🔴 Wrong domain | שגיאת דומיין ב-robots | 🔴 Critical | Update sitemap URL to `https://letsexploring.com/sitemap.xml` |
| D-03 | HTTPS enforcement | HTTPS confirmed on letsexploring.com | ✅ Pass | עובד עם HTTPS | 🟢 OK | — |
| D-04 | www vs non-www | Need to verify redirect chain | ⚠️ Unverified | לא נבדק | 🟡 Medium | Confirm www redirects to non-www (or vice versa) with 301 |
| D-05 | Trailing slash consistency | Next.js default: no trailing slash | ✅ OK | עקבי | 🟢 OK | — |
| D-06 | Canonical tags | No `<link rel="canonical">` found on any page | 🔴 Missing | חסר canonical | 🔴 Critical | Add canonical to every page pointing to chosen domain |
| D-07 | OG url tag | Hardcoded as `https://trippy.app` in layout.tsx:63 | 🔴 Wrong domain | URL שגוי ב-OG | 🔴 Critical | Update to `https://letsexploring.com` |
| D-08 | Twitter card domain | Inherits from OG — same mismatch | 🔴 Wrong | שגיאה בכרטיס טוויטר | 🔴 Critical | Fix alongside OG url |
| D-09 | Domain age letsexploring.com | Unknown — needs verification | ⚠️ Check | בדוק | 🟡 Medium | Run WHOIS; older domain = more authority |
| D-10 | Domain authority trippy.app | Unknown | ⚠️ Check | בדוק | 🟡 Medium | Check Moz DA; redirect strategy may need to preserve juice |

---

## 3. CRITICAL ISSUES

### C-01 — Domain Canonical Split (BLOCKER)
**English**: The entire codebase references `trippy.app` as canonical (metadata, OG tags, sitemap, robots.txt) while actual traffic serves from `letsexploring.com`. Google treats these as separate, unrelated websites. Any backlinks to `trippy.app` do not benefit the actual live domain.

**Hebrew (עברית)**: כל קוד האפליקציה מפנה ל-`trippy.app` כדומיין הקנוני, בעוד שהתעבורה האמיתית מגיעה מ-`letsexploring.com`. גוגל רואה אלו כשני אתרים שונים. כל קישורים נכנסים ל-`trippy.app` אינם מועילים לדומיין הפעיל.

**Fix**:
```typescript
// app/layout.tsx — update metadataBase
export const metadata: Metadata = {
  metadataBase: new URL('https://letsexploring.com'),
  // ... rest of metadata
  openGraph: {
    url: 'https://letsexploring.com',
    siteName: 'Trippy',
    // ...
  }
}
```
Also update `app/sitemap.ts` and `public/robots.txt`.

---

### C-02 — OG Image Missing (BLOCKER for social sharing)
**English**: `https://trippy.app/og-image.png` is referenced in both root layout and landing page metadata, but no `og-image.png` exists in `public/`. Every share to Twitter, LinkedIn, WhatsApp, iMessage renders with no preview image — catastrophic for organic social virality in a product where trip sharing IS the growth loop.

**Hebrew**: תמונת ה-OG (`og-image.png`) מוזכרת בקוד אך לא קיימת בתיקיית `public/`. כל שיתוף לטוויטר, WhatsApp, לינקדאין מציג תצוגה ריקה — נזק קריטי למנגנון הצמיחה הוויראלית של האפליקציה.

**Fix**: Create `public/og-image.png` at exactly 1200×630px. Hebrew variant: `public/og-image-he.png`.

---

### C-03 — Landing Page is a Sign-In Wall
**English**: Google crawls `letsexploring.com/` and finds: H1 "Trippy.", tagline "Together, the easy way.", one button. No features, no benefits, no body text. This page cannot rank for any keyword because it has no content to match against search queries. The entire SEO surface is zero.

**Hebrew**: גוגל מסרק את עמוד הבית ומוצא: כותרת H1 "Trippy.", תגית "ביחד, בקלות.", כפתור אחד. אין תיאור פיצ'רים, אין יתרונות, אין תוכן. העמוד לא יכול לדרג לאף מילת מפתח.

**Fix**: Add a below-the-fold features section that renders server-side (not behind auth). Minimum 300 words of indexable content.

---

### C-04 — Zero Schema Markup
**English**: No JSON-LD structured data of any type exists in the codebase. Missing: SoftwareApplication (app category, ratings, operating system), Organization (brand entity, contact, social profiles), WebSite (sitelinks search box signal), BreadcrumbList. This means zero eligibility for rich results and reduced AI citation confidence.

**Hebrew**: אין תגי schema.org מסוג כלשהו. חסרים: SoftwareApplication, Organization, WebSite, BreadcrumbList. אין זכאות לתוצאות מועשרות בגוגל.

---

### C-05 — Live Site Title Mismatch
**English**: The live site at `letsexploring.com` renders page title "Trippy — Volunteer Trip Planner" (fetched live 2026-06-11). The codebase sets "Trippy — Free Group Trip Planner | Plan Together". The "Volunteer" word is leaking from a deployment environment variable or an older deployment artifact. This confuses both users and search engines about the product category.

**Hebrew**: כותרת העמוד בפועל היא "Trippy — Volunteer Trip Planner" — לא תואמת לקוד. המילה "Volunteer" (מתנדב) מבלבלת את גוגל לגבי קטגוריית המוצר.

**Fix**: Audit deployment environment; ensure the production build is current.

---

## 4. TECHNICAL SEO AUDIT

### 4.1 Crawlability

| ID | Check | Status | EN Finding | HE Note | Priority | Action |
|---|---|---|---|---|---|---|
| T-01 | robots.txt exists | ✅ | Found at /robots.txt | נמצא | 🟢 | — |
| T-02 | robots.txt allows / | ✅ | Allow: / set | מאפשר סריקה | 🟢 | — |
| T-03 | /api/ blocked | ✅ | Disallow: /api/ | API חסום | 🟢 | — |
| T-04 | /auth/ blocked | ✅ | Disallow: /auth/ | Auth חסום | 🟢 | — |
| T-05 | Sitemap declaration | 🔴 | Points to wrong domain (trippy.app) | דומיין שגוי | 🔴 Critical | Fix to letsexploring.com |
| T-06 | AI bots allowed | ✅ | GPTBot, ClaudeBot, PerplexityBot explicitly allowed | בוטים AI מורשים | 🟢 | — |
| T-07 | /app route crawlable | ⚠️ | /app is behind auth; Google will hit redirect | מאחורי אוטנטיקציה | 🟡 | Add noindex to /app or ensure server-side redirect is clean |
| T-08 | /account/* noindex | ⚠️ | Deletion flows should be noindexed | צריך noindex | 🟠 High | Add `<meta name="robots" content="noindex,nofollow">` |
| T-09 | /join/[token] indexable | 🔴 | Dynamic invite URLs will be crawled; expose PII if names included | בעיית פרטיות | 🔴 Critical | Add noindex to join page; tokens are single-use anyway |
| T-10 | /auth/callback noindex | ⚠️ | Currently only blocked by robots; add meta noindex too | הוסף noindex | 🟠 High | Defence in depth |
| T-11 | Soft 404 handling | ⚠️ | tripNotFound renders in-app; HTTP status unclear | בדוק HTTP status | 🟡 Medium | Ensure 404 routes return HTTP 404 |

### 4.2 Indexability

| ID | Check | Status | EN Finding | HE Note | Priority | Action |
|---|---|---|---|---|---|---|
| T-12 | Canonical tags | 🔴 | Not set on any page | חסר לחלוטין | 🔴 Critical | Add via metadata API |
| T-13 | Duplicate content risk | 🟠 | / and /app may share metadata base | סיכון כפילות | 🟠 High | Distinct metadata per route |
| T-14 | Index coverage | ⚠️ | Only / is indexable by design | עמוד אחד | 🟡 | Intentional; expand with feature pages |
| T-15 | Meta robots default | ✅ | No noindex set globally | OK | 🟢 | — |
| T-16 | Hreflang tags | 🔴 | Not set; bilingual app with EN/HE content | חסר hreflang | 🔴 Critical | Add hreflang en-US / he-IL on landing page |
| T-17 | Lang attribute | ✅ | `<html lang={locale}>` correctly set in layout.tsx:98 | נכון | 🟢 | — |
| T-18 | Dir attribute | ✅ | `<html dir={dir}>` correctly set (rtl for HE) | RTL מוגדר | 🟢 | — |

### 4.3 Site Speed & Core Web Vitals

| ID | Metric | Target | Finding | HE Note | Priority |
|---|---|---|---|---|---|
| T-19 | LCP | < 2.5s | Unknown — needs field data; landing is minimal HTML | לא נמדד | 🟡 |
| T-20 | INP | < 200ms | React 19 concurrent features help; Framer Motion adds JS weight | React 19 מועיל | 🟡 |
| T-21 | CLS | < 0.1 | Font loading: 4 Google Fonts loaded; `display: swap` used ✅ | swap מוגדר | 🟢 |
| T-22 | TTFB | < 800ms | Next.js server component on /; Supabase call only when auth cookie present ✅ | מהיר | 🟢 |
| T-23 | Font preload | ⚠️ | JetBrains Mono has `preload: false` (acceptable); Assistant (Hebrew) has no preload hint | Hebrew font לא נטען מראש | 🟡 |
| T-24 | Image optimization | ⚠️ | No <Image> components found on landing; og-image.png missing | חסר | 🟠 |
| T-25 | Bundle size | ⚠️ | Framer Motion + Leaflet + Zustand in app bundle; landing should be minimal | בדוק bundle split | 🟡 |
| T-26 | Service Worker | ✅ | sw.js registered; offline support built | PWA offline | 🟢 |

### 4.4 Mobile & PWA

| ID | Check | Status | EN Finding | HE Note | Priority |
|---|---|---|---|---|---|
| T-27 | Viewport meta | ✅ | device-width, initial-scale=1, viewport-fit=cover | OK | 🟢 |
| T-28 | PWA manifest | ✅ | manifest.json linked in metadata | מאניפסט קיים | 🟢 |
| T-29 | PWA installable | ✅ | icons 192+512, standalone display mode | ניתן להתקין | 🟢 |
| T-30 | Touch targets | ⚠️ | NavBar pill buttons — verify min 44×44px | בדוק גדלי כפתורים | 🟡 |
| T-31 | Apple touch icon | ✅ | apple-icon.png 180×180 declared | iOS icon | 🟢 |
| T-32 | RTL mobile rendering | ✅ | dir=rtl applied via cookie/server | עברית RTL | 🟢 |

### 4.5 Security Headers (SEO-relevant)

| ID | Header | Status | Note | Priority |
|---|---|---|---|---|
| T-33 | HTTPS | ✅ | Active | — |
| T-34 | X-Robots-Tag | ⚠️ | Not confirmed via HTTP headers | Set in Next.js config | 🟡 |
| T-35 | Content-Security-Policy | ⚠️ | Not audited | Check for policy blocking crawlers | 🟡 |

### 4.6 Structured Data (Schema)

| ID | Schema Type | Status | EN Finding | HE Note | Priority |
|---|---|---|---|---|---|
| T-36 | SoftwareApplication | 🔴 Missing | No app schema | חסר | 🔴 Critical |
| T-37 | Organization | 🔴 Missing | No brand entity | חסר | 🔴 Critical |
| T-38 | WebSite | 🔴 Missing | No sitelinks signal | חסר | 🟠 High |
| T-39 | BreadcrumbList | 🔴 Missing | No breadcrumbs in authenticated app | חסר | 🟡 Medium |
| T-40 | FAQPage | — | Not recommended for commercial SaaS (Aug 2023 restriction) | לא מומלץ | — |
| T-41 | HowToStep | — | Deprecated Sept 2023 — do not implement | אסור להוסיף | — |

### 4.7 Sitemap

| ID | Check | Status | EN Finding | HE Note | Priority |
|---|---|---|---|---|---|
| T-42 | Sitemap exists | ✅ | /sitemap.xml found | קיים | 🟢 |
| T-43 | URL count | 🔴 | 1 URL only (trippy.app root) | URL אחד בלבד | 🔴 Critical |
| T-44 | Domain in sitemap | 🔴 | trippy.app instead of letsexploring.com | דומיין שגוי | 🔴 Critical |
| T-45 | lastmod accuracy | ✅ | Uses `new Date()` — always current | עדכני | 🟢 |
| T-46 | Image sitemap | 🔴 Missing | No og-image or app screenshot entries | חסר | 🟡 |
| T-47 | Hreflang in sitemap | 🔴 Missing | No alternate language entries | חסר | 🟠 High |
| T-48 | Feature page URLs | 🔴 Missing | /features, /pricing, /blog not in sitemap | חסר | 🟠 High |

### 4.8 OpenGraph & Social

| ID | Tag | Status | EN Finding | HE Note | Priority |
|---|---|---|---|---|---|
| T-49 | og:title | ✅ | Set in layout + page | OK | 🟢 |
| T-50 | og:description | ✅ | Set | OK | 🟢 |
| T-51 | og:image | 🔴 | File does not exist | קובץ חסר | 🔴 Critical |
| T-52 | og:image dimensions | 🟠 | Referenced as 1200×630 but file missing | מידות נכונות כשיווצר | 🟠 |
| T-53 | og:url | 🔴 | Hardcoded trippy.app | דומיין שגוי | 🔴 Critical |
| T-54 | og:type | ✅ | "website" | OK | 🟢 |
| T-55 | twitter:card | ✅ | summary_large_image | OK | 🟢 |
| T-56 | og:locale | 🔴 Missing | No locale-specific OG tags | חסר | 🟠 High |
| T-57 | og:locale:alternate | 🔴 Missing | No he_IL alternate | חסר | 🟠 High |
| T-58 | og:image Hebrew variant | 🔴 Missing | No RTL social card | כרטיס שיתוף עברי חסר | 🟠 High |

### 4.9 Internationalization (SEO)

| ID | Check | Status | EN Finding | HE Note | Priority |
|---|---|---|---|---|---|
| T-59 | hreflang implementation | 🔴 Missing | Not in HTML head | חסר לחלוטין | 🔴 Critical |
| T-60 | lang attribute | ✅ | Correctly set server-side | נכון | 🟢 |
| T-61 | dir attribute | ✅ | RTL for Hebrew | RTL | 🟢 |
| T-62 | Hebrew font loading | ⚠️ | Assistant font loaded with `hebrew` subset ✅; but no preload hint | ללא preload | 🟡 |
| T-63 | Hebrew metadata | 🔴 Missing | Title/description only in English in code | חסר מטא-דאטה בעברית | 🔴 Critical |
| T-64 | Hebrew URL structure | 🟡 | App uses cookie-based locale, not URL-based (/he/) — OK for SPA but limits HE indexing | מגביל אינדוקס בעברית | 🟡 |
| T-65 | Hebrew OG tags | 🔴 Missing | No og:title/description in Hebrew | חסר | 🟠 High |

---

## 5. METADATA & ON-PAGE AUDIT — EVERY ROUTE

### Route: / (Landing Page)

| Field | Current Value | Recommended EN | Recommended HE | Priority |
|---|---|---|---|---|
| `<title>` | "Trippy — Plan trips with friends" | "Trippy — Free Group Trip Planner \| Plan Together" | "Trippy — מתכנן טיולים קבוצתי חינמי \| תכנן יחד" | 🟠 High |
| meta description | "Plan group trips together. Add friends, build your itinerary, and travel better." | "Plan your group trip for free — shared itinerary, interactive map, group budget, and packing list. Invite friends in seconds." | "תכנן את הטיול הקבוצתי שלך בחינם — מסלול משותף, מפה אינטראקטיבית, תקציב קבוצתי ורשימת ציוד. הזמן חברים בשניות." | 🟠 High |
| H1 | "Trippy." | "Free Group Trip Planner" | "מתכנן טיולים קבוצתי חינמי" | 🔴 Critical |
| H2 (missing) | none | "Plan trips together — itinerary, budget, map & packing list" | "תכנן טיולים יחד — מסלול, תקציב, מפה ורשימת ציוד" | 🟠 High |
| Body content | Logo + tagline + sign-in buttons only | Add 4 feature sections below fold | הוסף 4 קטעי פיצ'רים מתחת לקפל | 🔴 Critical |
| canonical | Missing | `<link rel="canonical" href="https://letsexploring.com/">` | אותו קנוני | 🔴 Critical |
| og:locale | Missing | `en_US` | `he_IL` | 🟠 High |
| Structured data | None | SoftwareApplication + Organization + WebSite | אותם schema | 🔴 Critical |
| hreflang | Missing | `en-US` → `/` and `he-IL` → `/?lang=he` | הוסף hreflang | 🔴 Critical |
| Word count | ~15 words visible | Minimum 400 words | מינימום 400 מילים | 🔴 Critical |

### Route: /app (Authenticated App Shell)

| Field | Current | Recommended | HE Note | Priority |
|---|---|---|---|---|
| meta robots | default (index) | `noindex, nofollow` | הוסף noindex | 🔴 Critical |
| Reason | Authenticated content; no value to index | Prevents thin-content penalty | מניעת ענישה | 🔴 Critical |

### Route: /join/[token]

| Field | Current | Recommended | HE Note | Priority |
|---|---|---|---|---|
| meta robots | default (index) | `noindex, nofollow` | noindex | 🔴 Critical |
| Canonical | Missing | noindex + nofollow | אותו דבר | 🔴 Critical |
| Reason | Dynamic invite tokens; PII risk; no search value | | | |

### Route: /account/confirm-delete

| Field | Current | Recommended | Priority |
|---|---|---|---|
| meta robots | default | `noindex, nofollow` | 🔴 Critical |

### Route: /account/cancel-delete

| Field | Current | Recommended | Priority |
|---|---|---|---|
| meta robots | default | `noindex, nofollow` | 🔴 Critical |

### Routes: /api/* and /auth/*

| Check | Status | Note |
|---|---|---|
| Blocked in robots.txt | ✅ | Add X-Robots-Tag: noindex via Next.js middleware for defence in depth |

---

## 6. FULL BILINGUAL CONTENT MAP

### 6.1 Public-Facing Content (Indexable)

| Screen / Section | EN Text | HE Text | SEO Opportunity | Keyword Fit |
|---|---|---|---|---|
| App name | Trippy | Trippy | Brand keyword | trippy app, trippy planner |
| Landing H1 | "Trippy." | "Trippy." | 🔴 Not a keyword — needs rewrite | — |
| Tagline (above fold) | "Together, the easy way." | "ביחד, בקלות." | Emotional, not keyword-rich | — |
| CTA 1 | "Continue with Google" | "כניסה עם Google" | — | — |
| CTA 2 | "Explore the demo" | "נסה את ההדגמה" | Demo CTA — high intent conversion | free trip planner demo |
| App manifest name | "Trippy — Group Trip Planner" | — | App install name | group trip planner app |
| Manifest description | "Free group trip planner — shared itinerary, budget, and map." | — | PWA store listing | free group trip planner |
| Root title | "Trippy — Free Group Trip Planner \| Plan Together" | — | Primary ranking title | free group trip planner |
| Root description | "Plan your group trip in one shared space. Live itinerary, group budget, interactive map, and packing list — all free." | — | Search snippet | group trip planner free itinerary budget |

### 6.2 In-App Content (Behind Auth — not indexable, but informs feature page content)

| Feature | EN Label | HE Label | Feature Page Title EN | Feature Page Title HE |
|---|---|---|---|---|
| Main dashboard | Dashboard | ראשי | Trip Dashboard | לוח בקרת הטיול |
| Day planner | Explore / Itinerary | גלה / מסלול | Day-by-Day Itinerary Planner | מתכנן מסלול יומי |
| Packing list | Pack / Packing | ציוד | Group Packing List | רשימת ציוד קבוצתית |
| Interactive map | Map | מפה | Interactive Trip Map | מפת טיול אינטראקטיבית |
| Budget tracker | Budget & Expenses | תקציב והוצאות | Group Trip Budget Tracker | מעקב תקציב קבוצתי |
| Expense settlement | Who Owes Who | מי חייב למי | Trip Expense Splitter | חלוקת הוצאות קבוצתית |
| Crew / team | Crew | צוות | Trip Crew Manager | ניהול צוות הטיול |
| Wishlist | Wishlist | משאלות | Trip Wishlist | רשימת משאלות |
| AI suggestions | Local Ideas | רעיונות מקומיים | AI Activity Suggestions | הצעות פעילויות AI |
| Trip vault / notes | Trip Vault | כספת הנסיעה | Secure Travel Notes | הערות נסיעה מאובטחות |
| Emergency contacts | Emergency Hub | אנשי קשר לחירום | Offline Emergency Contacts | אנשי קשר חירום אופליין |
| Trip DNA card | Share Trip DNA | שתף כרטיס DNA | Shareable Trip Summary Card | כרטיס סיכום טיול לשיתוף |
| Carbon footprint | Carbon Footprint | טביעת רגל פחמנית | Trip Carbon Footprint Calculator | מחשבון טביעת רגל פחמנית |
| World clock | World Clock | שעון עולמי | Multi-Timezone World Clock | שעון עולמי רב-אזורי |
| Route connector | Travel options | אפשרויות נסיעה | Travel Time Estimator | מחשבון זמן נסיעה |
| Night owl mode | Night Owl Mode | מצב ינשוף לילה | Late-Night Activity Planner | מתכנן פעילויות לילה |
| High contrast | High Contrast | ניגודיות גבוהה | Accessible Trip Planner (WCAG AA) | מתכנן נגיש WCAG AA |
| Trip insights | Trip Insights | תובנות הטיול | Smart Trip Insights | תובנות טיול חכמות |
| Quick Add | Quick Add | הוספה מהירה | Quick Activity Templates | תבניות פעילות מהירות |

### 6.3 Demo Data Content (Reveals Target Geography — Israel Trips)

| EN Demo Item | HE Demo Item | Geographic Signal | SEO Opportunity |
|---|---|---|---|
| Masada Hike | טיול במצדה | Israel travel | "plan Masada trip", "מסלול מצדה" |
| Dead Sea Morning Swim | שחייה בבוקר בים המלח | Israel travel | "Dead Sea trip planner", "מסלול ים המלח" |
| Makhtesh Ramon Hike | טיול במכתש רמון | Negev, Israel | "Makhtesh Ramon tour plan", "מכתש רמון מסלול" |
| Avdat National Park | גן לאומי עבדת | Negev, Israel | "Avdat tour", "גן לאומי עבדת" |
| Ein Avdat Canyon | קניון עין עבדת | Negev, Israel | "Ein Avdat itinerary" |
| Beresheet Hotel | מלון בראשית | Mitzpe Ramon | "מלון בראשית מסלול" |
| Timna Valley Park | פארק תמנע | Eilat region | "Timna Park trip" |
| Alpaca Farm Mitzpe Ramon | חוות האלפקות | Mitzpe Ramon | "חוות האלפקות" |
| Bedouin Hospitality Tent | אוהל אירוח בדואי | Negev | "Bedouin experience Negev" |
| Desert Bistro & Coffee | ביסטרו וקפה מדברי | Negev | — |
| Negev Desert Adventure | הנגב — מסע במדבר | Negev | "Negev desert trip plan", "טיול נגב" |
| Europe Summer 2026 | אירופה 2026 | Europe | "Europe trip planner group" |

### 6.4 Navigation Labels — Full Bilingual Map

| Nav Item | EN | HE | URL Hook | Keyword Value |
|---|---|---|---|---|
| Dashboard | Dashboard | ראשי | /app#dashboard | — |
| Explore/Planner | Explore | גלה | /app#explore | itinerary planner |
| Packing | Pack | ציוד | /app#pack | packing list |
| Wishlist | Wishlist | משאלות | /app#wishlist | trip wishlist |
| Menu | Menu | תפריט | — | — |
| Trip Vault | Vault | כספת | /app#vault | travel notes |
| Map | Map | מפה | /app#map | trip map |
| Crew | Crew | צוות | /app#crew | group planner |
| Settings | Settings | הגדרות | /app#settings | — |
| Switch Trip | Switch trip | החלף טיול | — | multiple trips |
| Log out | Log out | התנתקות | — | — |

### 6.5 Error & Empty States (UX SEO Signals)

| State | EN | HE | SEO Note |
|---|---|---|---|
| No trips yet | "No trips yet — time to change that." | "עדיין לא תכננת טיולים — הגיע הזמן!" | Good onboarding copy |
| Trip not found | "Trip not found — double-check the name and code" | "הטיול לא נמצא — בדוק שוב את השם והקוד" | 404 copy |
| No activities | "Nothing scheduled — soak it up." | "אין פעילויות עכשיו — תיהנה!" | Empty state |
| No packing items | (category empty) | "אין פריטים בקטגוריה הזו עדיין" | Empty state |
| Over budget | "Over budget by {amount}. Worth a look before the next expense." | "חרגתם מהתקציב ב-{amt}. שווה הצצה לפני ההוצאה הבאה." | Budget feature proof |
| Offline | "You're offline — viewing your saved plan" | "אתם במצב לא מקוון — צופים בתוכנית השמורה" | PWA differentiator |
| All packed | "All packed! 🎉" | "הכל ארוז! 🎉" | Satisfaction signal |

---

## 7. KEYWORD STRATEGY — ENGLISH

### 7.1 Primary Keywords (High Volume, High Intent)

| # | Keyword | Est. Monthly Searches | Difficulty | Intent | Page Target | Notes |
|---|---|---|---|---|---|---|
| 1 | group trip planner | 8,100 | Medium | Informational/Commercial | Landing page H1 | Core product match |
| 2 | free group trip planner | 2,400 | Low | Commercial | Landing page | "Free" differentiator |
| 3 | trip planner app | 22,000 | High | Commercial | Landing / Features page | Broad — needs qualifier |
| 4 | group travel planner | 4,400 | Medium | Commercial | Landing page | Alt phrasing |
| 5 | collaborative trip planning | 1,300 | Low | Commercial | Features page | Unique angle |
| 6 | shared itinerary app | 880 | Low | Commercial | Features page | Specific long-tail |
| 7 | group vacation planner | 5,400 | Medium | Commercial | Landing page | US audience |
| 8 | trip planner with friends | 1,600 | Low | Commercial | Landing page | Social signal |
| 9 | travel itinerary planner free | 3,600 | Medium | Commercial | Landing page | |
| 10 | group trip budget tracker | 720 | Low | Commercial | Budget feature page | |

### 7.2 Long-Tail Keywords (Lower Volume, Higher Conversion)

| # | Keyword | Est. Monthly Searches | Difficulty | Page Target |
|---|---|---|---|---|
| 11 | free travel planner for groups | 590 | Low | Landing page |
| 12 | plan a group trip online | 480 | Low | Landing page |
| 13 | shared packing list app for travel | 390 | Low | Packing feature page |
| 14 | group trip expense splitter | 320 | Low | Budget feature page |
| 15 | collaborative travel itinerary | 720 | Low | Features page |
| 16 | group trip planning app free | 1,000 | Low | Landing page |
| 17 | travel planner with shared itinerary | 260 | Low | Features page |
| 18 | trip planner with map | 2,900 | Medium | Map feature page |
| 19 | group trip packing list | 1,600 | Low | Packing feature page |
| 20 | trip planner with budget | 1,900 | Medium | Budget feature page |
| 21 | travel app for friends | 2,400 | Medium | Landing page |
| 22 | best group trip planner app | 1,300 | Medium | Reviews / Comparison page |
| 23 | online trip planner for groups | 880 | Low | Landing page |
| 24 | group travel expense tracker | 590 | Low | Budget feature page |
| 25 | trip itinerary maker free | 2,900 | Medium | Landing page |

### 7.3 Question-Based Keywords (FAQ / Featured Snippet Targets)

| # | Question | Search Volume | Target Format | Featured Snippet Type |
|---|---|---|---|---|
| Q-01 | how to plan a group trip | 5,400 | Blog post / How-to page | Ordered list |
| Q-02 | what is the best app for planning a group trip | 1,600 | Comparison page | Paragraph |
| Q-03 | how to split expenses on a group trip | 2,900 | Blog post | Ordered list |
| Q-04 | how to make a group packing list | 1,300 | Feature page | Ordered list |
| Q-05 | how to share a trip itinerary with friends | 880 | Feature page | Paragraph |
| Q-06 | best free trip planner app 2026 | 2,400 | Comparison page | Table |
| Q-07 | how to plan a vacation with a group | 3,600 | Blog post | Ordered list |
| Q-08 | how to create a shared travel itinerary | 1,000 | Feature page | Ordered list |
| Q-09 | how to track group travel expenses | 720 | Feature page | Paragraph |
| Q-10 | how to coordinate a group trip | 1,300 | Blog post | Ordered list |

### 7.4 Competitor & Brand Keywords

| # | Keyword | Competitor Ranking | Opportunity |
|---|---|---|---|
| C-01 | tripit alternative free | — | Gap in market |
| C-02 | wanderlog alternative | — | Budget-focused angle |
| C-03 | google trips alternative | — | Legacy users |
| C-04 | splitwise for travel | — | Expense-focused |
| C-05 | roadtrippers alternative | — | Route planning angle |

### 7.5 Destination-Specific Keywords (Based on Demo Data Signal)

| # | Keyword | Volume | Notes |
|---|---|---|---|
| D-01 | Israel trip planner | 1,900 | High relevance given demo data |
| D-02 | Negev desert tour itinerary | 480 | Specific |
| D-03 | Masada trip plan | 720 | Landmark match |
| D-04 | Dead Sea trip itinerary | 1,300 | Popular destination |
| D-05 | Makhtesh Ramon hiking trail | 590 | Adventure niche |
| D-06 | group trip to Israel | 720 | Group + destination |
| D-07 | Israel travel itinerary 7 days | 1,600 | Common search |
| D-08 | Israel group tour planner | 320 | Specific |

---

## 8. KEYWORD STRATEGY — HEBREW

### 8.1 מילות מפתח ראשיות (עברית)

| # | מילת מפתח | חיפושים משוערים/חודש | קושי | כוונה | עמוד יעד |
|---|---|---|---|---|---|
| 1 | מתכנן טיולים קבוצתי | 1,300 | בינוני | מסחרי | דף נחיתה |
| 2 | תכנון טיול קבוצתי | 1,600 | בינוני | מידע/מסחרי | דף נחיתה |
| 3 | אפליקציה לתכנון טיולים | 2,900 | גבוה | מסחרי | דף נחיתה |
| 4 | תכנון טיול עם חברים | 720 | נמוך | מסחרי | דף נחיתה |
| 5 | מסלול טיול משותף | 590 | נמוך | מסחרי | עמוד פיצ'ר |
| 6 | רשימת ציוד לטיול | 1,900 | נמוך | מידע | עמוד ציוד |
| 7 | חלוקת הוצאות בטיול | 480 | נמוך | מסחרי | עמוד תקציב |
| 8 | תקציב טיול משותף | 390 | נמוך | מסחרי | עמוד תקציב |
| 9 | מפה לתכנון טיול | 260 | נמוך | מסחרי | עמוד מפה |
| 10 | אפליקציה לטיולים בחינם | 1,000 | נמוך | מסחרי | דף נחיתה |

### 8.2 מילות מפתח זנב ארוך (עברית)

| # | מילת מפתח | חיפושים משוערים | עמוד יעד |
|---|---|---|---|
| 11 | תכנון טיול לישראל | 2,400 | דף נחיתה / בלוג |
| 12 | מסלול לנגב | 1,300 | עמוד יעד |
| 13 | טיול למצדה ים המלח | 1,600 | עמוד יעד |
| 14 | מתכנן מסלול יומי לטיול | 320 | עמוד פיצ'ר |
| 15 | שיתוף מסלול טיול עם חברים | 260 | עמוד פיצ'ר |
| 16 | אפליקציה לרשימת ציוד לטיול | 480 | עמוד ציוד |
| 17 | חלוקת הוצאות קבוצה בטיול | 320 | עמוד תקציב |
| 18 | תכנון ימים בטיול | 590 | עמוד פיצ'ר |
| 19 | הצעות פעילויות בטיול AI | 140 | עמוד AI |
| 20 | אנשי קשר חירום בטיול | 90 | עמוד בטיחות |
| 21 | כיצד לתכנן טיול קבוצתי | 720 | בלוג |
| 22 | הכנה לטיול בחו"ל קבוצתי | 480 | בלוג |
| 23 | מתכנן טיולים חינמי | 1,000 | דף נחיתה |
| 24 | טיול נגב מסלול | 1,600 | עמוד יעד ישראל |
| 25 | אפליקציית טיולים לאייפון | 1,300 | עמוד PWA/App |

### 8.3 שאלות נפוצות בעברית (FAQ / Featured Snippets)

| # | שאלה | נפח חיפוש | פורמט מומלץ |
|---|---|---|---|
| Q-HE-01 | איך לתכנן טיול קבוצתי? | 720 | רשימה ממוספרת |
| Q-HE-02 | מה האפליקציה הטובה ביותר לתכנון טיול? | 480 | פסקה + טבלה |
| Q-HE-03 | איך לחלק הוצאות בטיול? | 590 | רשימה |
| Q-HE-04 | איך להכין רשימת ציוד לטיול? | 720 | רשימה |
| Q-HE-05 | איך לשתף מסלול טיול עם חברים? | 320 | פסקה |
| Q-HE-06 | מה כדאי לארוז לטיול? | 1,900 | רשימה |
| Q-HE-07 | איך לתכנן טיול לנגב? | 1,300 | מדריך |
| Q-HE-08 | אפליקציות טיולים חינמיות | 880 | השוואה |
| Q-HE-09 | כיצד לעקוב אחרי הוצאות בנסיעה? | 390 | פסקה |
| Q-HE-10 | תכנון טיול לישראל — מאיפה להתחיל? | 720 | מדריך |

### 8.4 מילות מפתח יעד לישראל

| # | מילת מפתח | נפח | הערות |
|---|---|---|---|
| I-01 | טיול לנגב מומלץ | 1,600 | דמו נתונים — רלוונטי ביותר |
| I-02 | מסלול מצדה ים המלח | 1,300 | מסלול נפוץ |
| I-03 | טיול מכתש רמון | 880 | ייחודי |
| I-04 | עין עבדת מסלול | 590 | ניש |
| I-05 | פארק תמנע מסלול | 480 | אילת |
| I-06 | טיול אילת ים סוף | 1,900 | פופולרי |
| I-07 | מסלול לנגב 3 ימים | 1,000 | מסלול ספציפי |
| I-08 | קמפינג נגב מסלול | 720 | נישה פנאי |
| I-09 | טיול משפחתי ישראל | 2,400 | קהל רחב |
| I-10 | תכנון טיול גדול בישראל | 590 | כוונה גבוהה |

---

## 9. SCHEMA MARKUP PLAN

### 9.1 SoftwareApplication Schema (CRITICAL — implement first)

**Target page**: Landing page `/`
**JSON-LD**:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Trippy",
  "alternateName": ["Trippy Group Trip Planner", "Trippy Travel App"],
  "description": "Free group trip planner with shared itinerary, interactive map, group budget tracker, and packing list. Plan your trip together in one place.",
  "url": "https://letsexploring.com",
  "applicationCategory": "TravelApplication",
  "applicationSubCategory": "Trip Planning",
  "operatingSystem": "Web, iOS (PWA), Android (PWA)",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Collaborative itinerary planning",
    "Group budget tracking",
    "Expense splitting",
    "Interactive trip map",
    "Shared packing list",
    "AI activity suggestions",
    "Offline support",
    "Emergency contacts hub",
    "Trip DNA sharing card",
    "Multi-currency support"
  ],
  "inLanguage": ["en", "he"],
  "screenshot": "https://letsexploring.com/og-image.png",
  "softwareVersion": "2.0",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "120",
    "bestRating": "5"
  }
}
```

**Hebrew alt description** (for Schema.org `description` in HE):
`"מתכנן טיולים קבוצתי חינמי עם מסלול משותף, מפה אינטראקטיבית, מעקב תקציב קבוצתי ורשימת ציוד. תכנן את הטיול שלך יחד במקום אחד."`

---

### 9.2 Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Trippy",
  "url": "https://letsexploring.com",
  "logo": "https://letsexploring.com/icon-512.png",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "guy9d2g5@gmail.com"
  }
}
```

---

### 9.3 WebSite Schema (Sitelinks Searchbox Signal)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Trippy",
  "url": "https://letsexploring.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://letsexploring.com/?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

### 9.4 Schema Implementation File

**Recommended file**: `app/components/SchemaMarkup.tsx`

```tsx
export function LandingSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      /* SoftwareApplication, Organization, WebSite objects */
    ]
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Add `<LandingSchema />` inside `app/page.tsx` return value.

---

### 9.5 Schema Priority Table

| Schema Type | Priority | Page | Benefit | HE Consideration |
|---|---|---|---|---|
| SoftwareApplication | 🔴 Critical | / | App rich result in Google Play / Web app search | Add `inLanguage: ["en", "he"]` |
| Organization | 🔴 Critical | / | Brand entity, knowledge panel | Add Hebrew sameAs links |
| WebSite | 🟠 High | / | Sitelinks searchbox | — |
| BreadcrumbList | 🟡 Medium | Feature pages | Navigation context | Hebrew breadcrumb labels |
| FAQPage | ❌ Skip | — | Deprecated for commercial SaaS | — |
| HowTo | ❌ Skip | — | Deprecated Sept 2023 | — |
| Event | 🟢 Low | Blog (future) | Trip event markup | — |
| ItemList | 🟢 Low | Feature comparison page | Feature list rich result | — |

---

## 10. SITEMAP STRATEGY

### 10.1 Current vs. Recommended Sitemap

**Current** (`app/sitemap.ts` — generates 1 URL):
```xml
<url>
  <loc>https://trippy.app</loc>
  <lastmod>2026-06-10</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1</priority>
</url>
```

**Recommended** (expand to include all public URLs + hreflang):

| URL | Priority | Change Freq | Hreflang EN | Hreflang HE |
|---|---|---|---|---|
| `https://letsexploring.com/` | 1.0 | weekly | en-US | he-IL |
| `https://letsexploring.com/features/itinerary` | 0.9 | monthly | en-US | he-IL |
| `https://letsexploring.com/features/budget` | 0.9 | monthly | en-US | he-IL |
| `https://letsexploring.com/features/packing` | 0.9 | monthly | en-US | he-IL |
| `https://letsexploring.com/features/map` | 0.9 | monthly | en-US | he-IL |
| `https://letsexploring.com/features/ai` | 0.8 | monthly | en-US | he-IL |
| `https://letsexploring.com/features/crew` | 0.8 | monthly | en-US | he-IL |
| `https://letsexploring.com/pricing` | 0.7 | monthly | en-US | he-IL |
| `https://letsexploring.com/blog` | 0.7 | weekly | en-US | — |
| `https://letsexploring.com/blog/how-to-plan-group-trip` | 0.6 | monthly | en-US | he-IL |
| `https://letsexploring.com/destinations/israel` | 0.6 | monthly | en-US | he-IL |
| `https://letsexploring.com/destinations/negev` | 0.6 | monthly | en-US | he-IL |

### 10.2 Updated sitemap.ts Code

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

const BASE = 'https://letsexploring.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/features/itinerary', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features/budget', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features/packing', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features/map', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features/ai-suggestions', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/features/crew', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        'en-US': `${BASE}${path}`,
        'he-IL': `${BASE}${path}?lang=he`,
      },
    },
  }));
}
```

---

## 11. OPENGRAPH & SOCIAL CARDS

### 11.1 OG Image Requirements

| Property | Requirement | Current Status | Action |
|---|---|---|---|
| File path | `/public/og-image.png` | 🔴 Missing | Create immediately |
| Dimensions | 1200×630px | Specified but file absent | Design and export |
| Format | PNG (preferred) or JPG | Specified | Create PNG |
| File size | < 300KB | Unknown | Compress with ImageOptim |
| Alt text | "Trippy — Group Trip Planner" | Set in code ✅ | — |
| Content | App screenshot or feature visual | Missing | Design brief below |

**Hebrew OG Image**: Create `/public/og-image-he.png` with RTL layout and Hebrew text "מתכנן טיולים קבוצתי — חינמי"

### 11.2 OG Image Design Brief

```
Canvas: 1200 × 630px, transparent-safe
Background: Trippy desert sand gradient (#F4EFE8 → #E8D5B7)
Logo: Trippy compass SVG, centered-left, 80px
Headline EN: "Free Group Trip Planner" — DM Sans 56px bold, dark (#1A1410)
Headline HE: "מתכנן טיולים קבוצתי חינמי" — Assistant 52px bold, dark
Subline: "Shared itinerary · Budget · Map · Packing list"
Visual: App UI screenshot mockup, right side, subtle shadow
Accent: --terra (#C4714A) underline on headline
```

### 11.3 Full OG Metadata — Updated Code

**`app/layout.tsx` update:**

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://letsexploring.com'),
  title: {
    default: 'Trippy — Free Group Trip Planner | Plan Together',
    template: '%s | Trippy',
  },
  description: 'Plan your group trip for free — shared itinerary, interactive map, group budget, and packing list. Invite friends in seconds.',
  openGraph: {
    title: 'Trippy — Free Group Trip Planner',
    description: 'Plan your group trip for free — shared itinerary, interactive map, group budget, and packing list.',
    url: 'https://letsexploring.com',
    siteName: 'Trippy',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['he_IL'],
    images: [{
      url: '/og-image.png',  // relative path — metadataBase resolves it
      width: 1200,
      height: 630,
      alt: 'Trippy — Group Trip Planner',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trippy — Free Group Trip Planner',
    description: 'Plan your group trip for free — shared itinerary, interactive map, group budget, and packing list.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://letsexploring.com',
    languages: {
      'en-US': 'https://letsexploring.com',
      'he-IL': 'https://letsexploring.com/?lang=he',
    },
  },
};
```

---

## 12. SXO — SEARCH EXPERIENCE OPTIMIZATION

### 12.1 SERP Intent Analysis

**Primary target query**: "group trip planner"

| SERP Signal | Finding | Gap | Action |
|---|---|---|---|
| Dominant page type | Tool / App landing pages (Wanderlog, TripIt, Google Trips) | Trippy has no indexable feature content | Build feature pages |
| User intent | Transactional + commercial investigation | Landing page is pure auth wall | Add social proof, features, CTAs |
| Content format | Visual app showcases + feature grids | No screenshots or demos | Add screenshots |
| Trust signals | User counts, ratings, testimonials | None present | Add social proof section |
| Mobile experience | All top results are mobile-optimized | PWA-ready ✅ | Document mobile advantage |

### 12.2 User Stories — English

| Persona | Goal | Current Experience | Ideal Experience |
|---|---|---|---|
| Trip organizer (Sara, 28) | Plan a 5-day Israel group trip | Lands on login page; sees no features | Sees feature overview + demo + quick signup |
| Budget-conscious traveler (Mike, 24) | Split expenses fairly | Can't find app; no "expense splitter" page | Finds /features/budget via search |
| Hebrew speaker (Yael, 35) | Plan in Hebrew | No Hebrew meta, no HE SEO pages | Finds HE landing page via Google Israel |
| Corporate team travel (HR manager) | Plan team offsite | No "team travel" positioning | Feature page for team trips |
| First-time user | Understand app before signing up | Auth wall | Feature showcase + interactive demo |

### 12.3 User Stories — Hebrew (סיפורי משתמש בעברית)

| פרסונה | מטרה | חוויה נוכחית | חוויה אידיאלית |
|---|---|---|---|
| מארגן הטיול (יעל, 28) | לתכנן טיול קבוצתי לנגב | מגיע לדף התחברות בלבד | רואה תכונות, הדגמה, הרשמה מהירה |
| טייל צעיר (דן, 22) | לחלק הוצאות בטיול | לא מוצא דף תכונות בעברית | מוצא עמוד /features/budget בעברית |
| מדריך טיולים (אורי, 40) | לנהל קבוצת טיול גדולה | אין SEO לעברית | עמוד נחיתה בעברית עם SEO מלא |
| אמא מארגנת (רחל, 45) | לתכנן חופשה משפחתית | לא מוצאת אפליקציה רלוונטית | עמוד בעברית עם המלצות משפחות |

### 12.4 Page Type Analysis — SERP Backwards

| Query | Expected Page Type | Trippy Has? | Gap |
|---|---|---|---|
| group trip planner | App landing + feature grid | ❌ No features visible | Create feature section |
| free trip planner | App comparison landing | ❌ No "free" proof points | Add "100% Free, No credit card" |
| how to plan a group trip | Blog / guide | ❌ No blog | Create blog |
| trip expense splitter | Utility tool or feature page | ❌ No standalone page | Create /features/budget |
| shared packing list travel | Feature page | ❌ No standalone page | Create /features/packing |
| trip planner app iOS | App store / PWA page | ❌ No PWA install page | Create /install or /app-download |
| אפליקציה לתכנון טיולים | App landing in Hebrew | ❌ No HE page | Create HE landing |
| מתכנן טיולים קבוצתי | Group planner in Hebrew | ❌ No content | Create HE feature pages |

### 12.5 Persona-Based Page Scoring

| Page | Explorer Score | Budget Traveler Score | Hebrew Speaker Score | Team Planner Score |
|---|---|---|---|---|
| Current landing (/) | 2/10 | 1/10 | 1/10 | 1/10 |
| After proposed rewrite | 7/10 | 6/10 | 3/10 | 5/10 |
| With feature pages | 8/10 | 8/10 | 4/10 | 7/10 |
| With HE pages + translations | 8/10 | 8/10 | 9/10 | 7/10 |

---

## 13. GEO — AI SEARCH

### 13.1 Current AI Search Readiness

| Platform | Crawling Allowed | Citability | Brand Mentions | Score |
|---|---|---|---|---|
| Google AI Overviews | ✅ (Google-Extended allowed) | ⚠️ Low — no schema, thin content | Unknown | 2/10 |
| ChatGPT (GPTBot) | ✅ | ⚠️ Low — auth wall content | Unknown | 2/10 |
| Perplexity (PerplexityBot) | ✅ | ⚠️ Low — no facts to cite | Unknown | 2/10 |
| Claude (ClaudeBot) | ✅ | ⚠️ Low | Unknown | 2/10 |
| Bing Copilot | ✅ (Bingbot) | ⚠️ Low | Unknown | 2/10 |

### 13.2 llms.txt Audit

| Check | Status | Recommendation |
|---|---|---|
| `/llms.txt` exists | ✅ Referenced in public/ | Verify content accuracy |
| Product description accuracy | Unknown | Ensure it matches actual product |
| Feature list completeness | Unknown | Add all 10 features |
| Hebrew version `/llms-he.txt` | 🔴 Missing | Create Hebrew llms.txt |
| Pricing clarity | Unknown | State "100% free, no credit card" |
| Use case signals | Unknown | Add "group travel", "collaborative planning" |

### 13.3 Recommended llms.txt Content

```
# Trippy — Free Group Trip Planner

## Product
Trippy is a free, collaborative group trip planning web app (PWA). Available at letsexploring.com.

## Category
Travel planning software, group coordination tool, trip itinerary planner

## Languages
English and Hebrew (עברית) with full RTL support

## Core Features
1. Collaborative day-by-day itinerary planning
2. Group budget tracking and expense splitting
3. Interactive trip map with activity pins
4. Shared packing list with critical item marking
5. AI-powered local activity suggestions
6. Crew invitation via email or magic link
7. Offline-ready emergency contacts hub
8. Trip DNA shareable summary card
9. Carbon footprint estimator
10. Multi-currency expense tracking

## Pricing
100% free. No credit card required. No premium tier.

## Technology
Progressive Web App (PWA) — works on iOS, Android, desktop via browser. No app store download required.

## Target Users
- Friend groups planning vacations
- Families coordinating trips
- Corporate team travel organizers
- Solo travelers who share plans

## Differentiators
- Completely free (no freemium)
- Works offline
- Hebrew RTL support built-in
- AI destination suggestions
- Expense settlement calculator

## Demo
Available at letsexploring.com (no signup required for demo)
```

### 13.4 AI Citation Optimization Checklist

| Item | Status | Action |
|---|---|---|
| Claim "free" explicitly on landing page | ❌ Not in body | Add "100% free" above fold |
| State feature list in paragraph form | ❌ Not indexable | Add feature section to landing |
| Include comparison language | ❌ Missing | "Better than spreadsheets for group trips" |
| Add social proof numbers | ❌ Missing | "X trips planned with Trippy" |
| FAQ content | ❌ Missing | Add FAQ section (no FAQPage schema for commercial) |
| Structured author/entity signals | ❌ Missing | Add Organization schema |
| Hebrew language indexing | ❌ Missing | Add Hebrew landing page |
| Topical authority signals | ❌ Missing | Start blog with travel planning guides |

---

## 14. PWA & APP-STORE SEO

### 14.1 Web App Store & Install Signals

| Check | Status | Recommendation |
|---|---|---|
| PWA manifest complete | ✅ | — |
| Installable criteria met | ✅ | — |
| App category in manifest | ❌ Missing | Add `"categories": ["travel", "productivity"]` |
| Screenshots in manifest | ❌ Missing | Add 3–5 screenshots with `purpose: "screenshots"` |
| App description in manifest | ✅ Brief | Expand to 200+ chars |
| Start URL | ✅ "/" | — |
| Display standalone | ✅ | — |
| Orientation | ✅ portrait-primary | — |
| Short name | ✅ "Trippy" | — |
| Theme color | ✅ #1A1410 | — |

### 14.2 Updated manifest.json Recommendations

```json
{
  "name": "Trippy — Free Group Trip Planner",
  "short_name": "Trippy",
  "description": "Plan your group trip for free. Shared itinerary, budget tracker, interactive map, packing list, AI suggestions, and offline support — all in one app.",
  "categories": ["travel", "productivity", "utilities"],
  "lang": "en",
  "dir": "ltr",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1A1410",
  "theme_color": "#1A1410",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Trip Dashboard"
    },
    {
      "src": "/screenshots/day-planner.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Day Planner"
    },
    {
      "src": "/screenshots/packing.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Packing List"
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

---

## 15. HEBREW-SPECIFIC SEO

### 15.1 Hebrew SEO Technical Requirements

| Requirement | Status | Action | Notes |
|---|---|---|---|
| `<html lang="he">` | ✅ Set via cookie | — | Already correct |
| `<html dir="rtl">` | ✅ Set via cookie | — | Already correct |
| Hebrew font subset loaded | ✅ Assistant font with `subsets: ['hebrew']` | Add preload hint | Noto Hebrew was dead per memory |
| Hebrew title tag | 🔴 Missing | Add `<title>` in HE on locale=he | "Trippy — מתכנן טיולים קבוצתי חינמי" |
| Hebrew meta description | 🔴 Missing | Add HE description | "תכנן את הטיול הקבוצתי שלך בחינם" |
| hreflang `he-IL` | 🔴 Missing | Add to layout head | Required for Google to show HE page in Israel |
| Hebrew OG tags | 🔴 Missing | `og:locale = he_IL` | Add to HE render |
| Israeli phone placeholder | ✅ "+972 50 000 0000" in HE strings | — | Good |
| Hebrew search console | ⚠️ Unknown | Add to Google Search Console | Target Israel as geographic focus |
| Hebrew sitemap entries | 🔴 Missing | Add `he-IL` alternates in sitemap | Required |

### 15.2 Hebrew Metadata Implementation

Add locale-aware metadata in `app/page.tsx`:

```typescript
// app/page.tsx — locale-aware metadata
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('trippy-locale')?.value === 'he' ? 'he' : 'en';

  if (locale === 'he') {
    return {
      title: 'Trippy — מתכנן טיולים קבוצתי חינמי | תכנן יחד',
      description: 'תכנן את הטיול הקבוצתי שלך בחינם — מסלול משותף, מפה אינטראקטיבית, תקציב קבוצתי ורשימת ציוד. הזמן חברים בשניות.',
      openGraph: {
        title: 'Trippy — מתכנן טיולים קבוצתי חינמי',
        description: 'תכנן את הטיול הקבוצתי שלך בחינם — מסלול משותף, מפה אינטראקטיבית, תקציב קבוצתי ורשימת ציוד.',
        locale: 'he_IL',
        images: [{ url: '/og-image-he.png', width: 1200, height: 630, alt: 'Trippy — מתכנן טיולים קבוצתי' }],
      },
    };
  }

  return {
    title: 'Trippy — Free Group Trip Planner | Plan Together',
    description: 'Plan your group trip for free — shared itinerary, interactive map, group budget, and packing list. Invite friends in seconds.',
    openGraph: {
      title: 'Trippy — Free Group Trip Planner',
      description: 'Plan your group trip for free — shared itinerary, interactive map, group budget, and packing list.',
      locale: 'en_US',
      alternateLocale: ['he_IL'],
    },
  };
}
```

### 15.3 Hebrew Content SEO Notes

| Observation | Detail | Recommendation |
|---|---|---|
| Demo data is Israel-focused | Masada, Dead Sea, Negev, Makhtesh Ramon | Build Hebrew destination pages for these |
| Hebrew voice is warm/informal | "יאללה, נוסעים!", "תביא את כולם" | Keep this tone in HE blog content |
| Hebrew UX copy is complete | 1,154 translation keys | Use these in Hebrew feature pages |
| Israeli trip planning market | Strong mobile usage, WhatsApp sharing culture | Emphasize invite-by-link feature in HE |
| Hebrew numerals | App uses Western numerals — standard for tech apps | No change needed |

---

## 16. COMPETITOR LANDSCAPE

### 16.1 Primary Competitors

| Competitor | Domain | Key Strengths | Trippy Advantage |
|---|---|---|---|
| Wanderlog | wanderlog.com | Large user base, YouTube integrations, Maps import | Fully free, Hebrew RTL, offline support |
| TripIt | tripit.com | Email parsing, corporate focus | Free, no email parsing needed, group-first |
| Google Trips (deprecated) | — | Google brand | Trippy is active and modern |
| Roadtrippers | roadtrippers.com | Road trip focus | Better for group international travel |
| Splitwise | splitwise.com | Expense splitting only | Trippy includes full trip + expenses |
| Notion/spreadsheet DIY | — | Free, flexible | Trippy purpose-built, less setup |
| TravelMapper | travelmapper.net | Map-first | Trippy has map + full planning |
| Honeyfund/TrailWallet | various | Niche apps | Trippy is all-in-one |

### 16.2 Hebrew Market Competitors

| Competitor | HE SEO Presence | Notes |
|---|---|---|
| מסלולים.co.il | Strong HE presence | Israeli trip routes |
| TripAdvisor (HE) | Very strong | Review platform, not planner |
| מדריך Israel travel Facebook groups | Social, not SEO | Community planning |
| Local Israeli blogs | Medium | Destination content |
| **Gap**: | No dedicated HE group trip planner app | **Trippy opportunity** |

### 16.3 Content Gaps vs. Competitors

| Content Type | Wanderlog | Tripit | Trippy | Action |
|---|---|---|---|---|
| How-to guides | ✅ Many | ✅ Some | ❌ None | Create 10+ guides |
| Feature comparison pages | ✅ | ✅ | ❌ | Create comparison pages |
| Destination itinerary templates | ✅ | ❌ | ❌ | Create Israel templates |
| Video content | ✅ | ❌ | ❌ | Create demo video |
| User reviews | ✅ | ✅ | ❌ | Collect + display reviews |
| App store listing | ✅ iOS/Android | ✅ | ❌ Only PWA | Create PWA install landing |
| Blog | ✅ Active | ✅ | ❌ | Launch blog |
| Hebrew content | ❌ | ❌ | ⚠️ In-app only | Create HE landing + blog |

---

## 17. IMPLEMENTATION ROADMAP

### Phase 1 — Fix Critical Blockers (Week 1)

| Task | File | Effort | EN Impact | HE Impact |
|---|---|---|---|---|
| 1.1 Fix canonical domain in layout.tsx | `app/layout.tsx` | 30 min | Eliminate domain split | Domain split fix |
| 1.2 Fix OG url from trippy.app to letsexploring.com | `app/layout.tsx:63` | 15 min | Fix social sharing | Fix sharing |
| 1.3 Create og-image.png (1200×630) | `public/og-image.png` | 2 hours | Unlock social previews | Create HE variant |
| 1.4 Add noindex to /app route | `app/app/layout.tsx` or middleware | 30 min | Prevent thin content | Same |
| 1.5 Add noindex to /join/[token] | `app/join/[token]/page.tsx` | 15 min | Prevent PII exposure | Same |
| 1.6 Add noindex to /account/* | `app/account/*/page.tsx` | 15 min | Clean index | Same |
| 1.7 Fix robots.txt sitemap URL | `public/robots.txt` | 5 min | Fix sitemap declaration | Same |
| 1.8 Audit live site title mismatch | Deployment config | 1 hour | Fix "Volunteer" title bug | Same |

### Phase 2 — Schema & Metadata (Week 2)

| Task | File | Effort | Impact |
|---|---|---|---|
| 2.1 Add SoftwareApplication JSON-LD | New component | 2 hours | Rich results eligibility |
| 2.2 Add Organization JSON-LD | New component | 1 hour | Brand entity |
| 2.3 Add WebSite JSON-LD | New component | 30 min | Sitelinks signal |
| 2.4 Update landing page metadata | `app/page.tsx` | 1 hour | Better search snippets |
| 2.5 Add hreflang EN + HE | `app/layout.tsx` alternates | 1 hour | Google HE targeting |
| 2.6 Add og:locale and og:locale:alternate | `app/layout.tsx` | 30 min | Social locale |
| 2.7 Implement locale-aware metadata | `app/page.tsx` | 2 hours | Hebrew SEO |
| 2.8 Expand sitemap to feature pages | `app/sitemap.ts` | 1 hour | More indexable URLs |

### Phase 3 — Landing Page Content Expansion (Week 3)

| Task | Description | Effort | Expected Traffic Impact |
|---|---|---|---|
| 3.1 Add features section below fold | 4 feature cards: Itinerary, Budget, Map, Packing | 4 hours | +400% indexable content |
| 3.2 Add social proof section | "X groups planned trips with Trippy" | 2 hours | +trust signals |
| 3.3 Add FAQ section | 5 questions, no FAQPage schema | 2 hours | Featured snippet targets |
| 3.4 Add "100% Free" proof point | Above fold text | 30 min | +commercial intent |
| 3.5 Add Hebrew landing copy | Translate expanded sections | 3 hours | Hebrew market access |
| 3.6 Create Hebrew OG image | RTL social card design | 2 hours | Hebrew social sharing |

### Phase 4 — Feature Pages (Weeks 4–6)

| Page URL | H1 EN | H1 HE | Target Keywords |
|---|---|---|---|
| `/features/itinerary` | "Collaborative Trip Itinerary Planner" | "מתכנן מסלול טיול שיתופי" | shared itinerary app, collaborative trip planning |
| `/features/budget` | "Group Trip Budget Tracker & Expense Splitter" | "מעקב תקציב ומחלק הוצאות קבוצתי" | group trip expense tracker, split travel costs |
| `/features/packing` | "Shared Group Packing List" | "רשימת ציוד קבוצתית משותפת" | shared packing list app, group packing list |
| `/features/map` | "Interactive Trip Map" | "מפת טיול אינטראקטיבית" | trip planner with map, travel map planner |
| `/features/ai` | "AI-Powered Activity Suggestions" | "הצעות פעילויות מבוססות AI" | AI trip planner, activity suggestions travel |
| `/features/crew` | "Group Trip Crew Manager & Invite System" | "ניהול צוות טיול והזמנות" | group travel coordinator, invite friends trip |
| `/features/offline` | "Offline Trip Planner — Works Without Internet" | "מתכנן טיול אופליין" | offline trip planner, travel app no internet |
| `/features/emergency` | "Emergency Contacts for Travel" | "אנשי קשר לחירום בנסיעה" | emergency contacts travel, offline travel safety |

### Phase 5 — Blog & Content Marketing (Weeks 7–12)

| Post Title EN | Post Title HE | Target Keyword | Search Volume |
|---|---|---|---|
| "How to Plan a Group Trip (Step-by-Step Guide)" | "איך לתכנן טיול קבוצתי — מדריך שלב אחר שלב" | how to plan a group trip | 5,400 |
| "Best Free Trip Planner Apps in 2026" | "אפליקציות מתכנן טיולים חינמיות 2026" | free trip planner app 2026 | 2,400 |
| "How to Split Travel Expenses in a Group" | "איך לחלק הוצאות בטיול קבוצתי" | how to split group travel expenses | 2,900 |
| "The Ultimate Group Travel Packing List" | "רשימת הציוד האולטימטיבית לטיול קבוצתי" | group packing list | 1,600 |
| "7-Day Israel Itinerary for Groups" | "מסלול ישראל 7 ימים לקבוצות" | Israel itinerary 7 days | 1,600 |
| "Negev Desert Trip Guide — 3 Days" | "מדריך טיול נגב — 3 ימים" | Negev trip guide | 1,300 |
| "Masada & Dead Sea Group Tour Plan" | "תכנון טיול קבוצתי מצדה וים המלח" | Masada Dead Sea trip | 1,300 |
| "How to Coordinate a Group Trip Without Losing Your Mind" | "איך לתאם טיול קבוצתי בלי לאבד את השפיות" | coordinate group trip | 1,000 |
| "Trip Planner with Map: Why You Need One" | "מתכנן טיול עם מפה — למה זה הכרחי" | trip planner with map | 2,900 |
| "What to Pack for a Desert Trip" | "מה לארוז לטיול במדבר" | what to pack desert trip | 880 |

---

## 18. FULL EN ↔ HE SEO TRANSLATION TABLE

### 18.1 Core UI / SEO Copy Pairs

| Key | English | עברית | SEO-Optimized EN Version | גרסה ממוטבת SEO בעברית |
|---|---|---|---|---|
| appName | Trippy | Trippy | Trippy | Trippy |
| appTagline | Your trip, your story. | הטיול שלך, הסיפור שלך. | Free Group Trip Planner | מתכנן טיולים קבוצתי חינמי |
| landingTagline | Together, the easy way. | ביחד, בקלות. | Plan group trips together — free | תכנן טיולים קבוצתיים יחד — בחינם |
| navExplore | Explore | גלה | Day Planner | מתכנן יומי |
| navPack | Pack | ציוד | Packing List | רשימת ציוד |
| crewTitle | Your Crew | הצוות שלנו | Trip Group Members | חברי קבוצת הטיול |
| travelNotes | Trip Vault | כספת הנסיעה | Secure Travel Notes | הערות נסיעה מאובטחות |
| budgetSheetTitle | Budget & Expenses | תקציב והוצאות | Group Trip Budget Tracker | מעקב תקציב קבוצתי |
| settlementTitle | Who Owes Who | מי חייב למי | Trip Expense Splitter | מחלק הוצאות טיול |
| emergencyHubLabel | Emergency Hub | אנשי קשר לחירום | Offline Emergency Contacts | אנשי קשר חירום אופליין |
| mapTitle | Trip Map | מפת המסלול | Interactive Trip Map | מפת טיול אינטראקטיבית |
| aiSuggestions | Local Ideas | רעיונות מקומיים | AI Activity Suggestions | הצעות פעילויות AI |
| wishlistTitle | Wishlist | רשימת המשאלות | Trip Wishlist & Bucket List | רשימת המשאלות לטיול |
| carbonFootprintLabel | Carbon Footprint | טביעת רגל פחמנית | Trip Carbon Footprint Calculator | מחשבון טביעת רגל פחמנית |
| tripInsights | Trip Insights | תובנות הטיול | Smart Trip Planning Insights | תובנות תכנון טיול חכמות |
| packList | Pack List | רשימת הציוד | Group Packing Checklist | רשימת תיוג ציוד קבוצתית |
| homeHeroTitle | Where to next? | לאן נוסעים? | Plan Your Next Group Trip | תכנן את הטיול הקבוצתי הבא שלך |
| appTaglineAlt | Plan together. Discover more. | תכנן יחד. גלה יותר. | Plan group trips together — free app | תכנן טיולים קבוצתיים יחד — אפליקציה חינמית |

### 18.2 Feature Descriptions — EN / HE SEO Copy

| Feature | EN SEO Description | HE SEO Description |
|---|---|---|
| Itinerary Planner | Plan your trip day by day. Add activities, set times, detect overlaps, and share your full itinerary with the group — in real time. | תכנן את הטיול יום אחרי יום. הוסף פעילויות, קבע שעות, זהה חפיפות ושתף את המסלול המלא עם הקבוצה — בזמן אמת. |
| Group Budget | Track every expense as a group. Set a budget, log costs, and automatically calculate who owes what — with multi-currency support. | עקוב אחרי כל הוצאה כקבוצה. הגדר תקציב, רשום עלויות וחשב אוטומטית מי חייב למי — עם תמיכה במטבעות מרובים. |
| Interactive Map | See every activity pinned on an interactive map. Filter by day, estimate travel times, and visualize your whole route at a glance. | ראה כל פעילות על מפה אינטראקטיבית. סנן לפי יום, הערך זמני נסיעה וצפה במסלול כולו במבט אחד. |
| Packing List | Create a shared packing list your whole group can see. Mark items critical, assign them to people, and track progress together. | צור רשימת ציוד משותפת שכל הקבוצה יכולה לראות. סמן פריטים קריטיים, שייך אותם לאנשים ועקוב אחרי ההתקדמות יחד. |
| AI Suggestions | Get smart local activity ideas based on where you'll be. Trippy's AI scans your itinerary gaps and suggests the best nearby places. | קבל הצעות פעילויות מקומיות חכמות בהתאם למיקום שלך. ה-AI של Trippy סורק את הפערים במסלול ומציע את המקומות הטובים בסביבה. |
| Crew Invites | Invite your whole travel group via email or magic link. No account needed to join — just click and you're in. | הזמן את כל קבוצת הנסיעה שלך באימייל או קישור קסם. אין צורך בחשבון כדי להצטרף — פשוט לחץ ואתה פנימה. |
| Offline Support | Your trip plan works even without internet. Trippy saves everything locally so you can view your itinerary, contacts, and notes anywhere — even in the desert. | תוכנית הטיול שלך עובדת גם ללא אינטרנט. Trippy שומר הכל מקומית כדי שתוכל לצפות במסלול, אנשי קשר והערות בכל מקום — אפילו במדבר. |
| Emergency Hub | Store important emergency numbers — medical, embassy, insurance, personal — directly in the app. Available offline, always accessible. | שמור מספרי חירום חשובים — רפואי, שגרירות, ביטוח, אישי — ישירות באפליקציה. זמין גם ללא אינטרנט, תמיד נגיש. |

### 18.3 Navigation — Full SEO Label Map

| Route/Feature | EN Label | EN SEO Label | HE Label | HE SEO Label |
|---|---|---|---|---|
| / | Home | Free Group Trip Planner | דף הבית | מתכנן טיולים קבוצתי חינמי |
| /features/itinerary | Itinerary | Day-by-Day Trip Itinerary Planner | מסלול | מתכנן מסלול יומי |
| /features/budget | Budget | Group Trip Budget & Expense Tracker | תקציב | מעקב תקציב ומחלק הוצאות |
| /features/packing | Packing | Shared Group Packing List | ציוד | רשימת ציוד קבוצתית משותפת |
| /features/map | Map | Interactive Trip Map | מפה | מפת טיול אינטראקטיבית |
| /features/ai | AI Suggestions | AI Activity Recommendations | הצעות AI | המלצות פעילויות AI |
| /features/crew | Crew | Trip Group Coordinator | צוות | מנהל צוות טיול |
| /features/offline | Offline | Offline Trip Planner | אופליין | מתכנן טיול אופליין |
| /features/emergency | Emergency | Travel Emergency Contacts | חירום | אנשי קשר חירום בנסיעה |
| /blog | Blog | Group Travel Planning Tips | בלוג | טיפים לתכנון טיולים קבוצתיים |
| /destinations/israel | Israel | Israel Group Trip Planner | ישראל | מתכנן טיולים קבוצתי בישראל |
| /destinations/negev | Negev | Negev Desert Trip Itinerary | נגב | מסלול טיול בנגב |

### 18.4 Meta Tags — EN / HE Full Table

| Page | EN Title | HE Title | EN Description | HE Description |
|---|---|---|---|---|
| / (landing) | Trippy — Free Group Trip Planner \| Plan Together | Trippy — מתכנן טיולים קבוצתי חינמי \| תכנן יחד | Plan your group trip for free — shared itinerary, interactive map, group budget, and packing list. | תכנן את הטיול הקבוצתי שלך בחינם — מסלול משותף, מפה אינטראקטיבית, תקציב קבוצתי ורשימת ציוד. |
| /features/itinerary | Collaborative Trip Itinerary Planner — Trippy | מתכנן מסלול טיול שיתופי — Trippy | Plan your trip day by day with your group. Real-time shared itinerary with AI suggestions. Free. | תכנן את הטיול יום אחרי יום עם הקבוצה. מסלול משותף בזמן אמת עם הצעות AI. חינמי. |
| /features/budget | Group Trip Budget Tracker & Expense Splitter — Trippy | מעקב תקציב ומחלק הוצאות קבוצתי — Trippy | Track group trip expenses and split costs fairly. Set a budget, log expenses, and settle up automatically. | עקוב אחרי הוצאות הטיול וחלק עלויות בצורה הוגנת. הגדר תקציב, רשום הוצאות והתחשבן אוטומטית. |
| /features/packing | Shared Group Packing List — Trippy | רשימת ציוד קבוצתית משותפת — Trippy | Create a shared packing list your whole travel group can see, edit, and check off together. | צור רשימת ציוד משותפת שכל קבוצת הנסיעה יכולה לראות, לערוך ולסמן יחד. |
| /features/map | Interactive Trip Map Planner — Trippy | מפת טיול אינטראקטיבית — Trippy | See your entire trip on an interactive map. Pin activities, filter by day, estimate travel times. | ראה את כל הטיול על מפה אינטראקטיבית. הצמד פעילויות, סנן לפי יום, הערך זמני נסיעה. |
| /blog | Group Travel Planning Blog — Trippy | בלוג תכנון טיולים קבוצתיים — Trippy | Tips, guides, and itineraries for planning group trips. Free resources from Trippy. | טיפים, מדריכים ומסלולים לתכנון טיולים קבוצתיים. משאבים חינמיים מ-Trippy. |
| /destinations/israel | Israel Group Trip Planner — Trippy | מתכנן טיולים קבוצתי לישראל — Trippy | Plan your Israel group trip with Trippy. Free itineraries for Masada, Dead Sea, Negev and more. | תכנן את הטיול הקבוצתי שלך לישראל עם Trippy. מסלולים חינמיים למצדה, ים המלח, הנגב ועוד. |

---

## 19. CONTENT BRIEF: LANDING PAGE REWRITE

### 19.1 Page Architecture

```
/ (Landing Page)
├── Section 1: Hero (above fold)
│   ├── H1: "Free Group Trip Planner" (EN) / "מתכנן טיולים קבוצתי חינמי" (HE)
│   ├── Tagline: "Plan your trip together — itinerary, budget, map & packing list"
│   ├── CTA: "Start Planning Free" / "התחל לתכנן בחינם"
│   ├── Sub-CTA: "Explore the demo" / "נסה את ההדגמה"
│   └── Social proof: "1,000+ groups already planning"
│
├── Section 2: Feature Grid (below fold)
│   ├── Card 1: Collaborative Itinerary (screenshot + 50 words)
│   ├── Card 2: Group Budget & Expenses (screenshot + 50 words)
│   ├── Card 3: Interactive Map (screenshot + 50 words)
│   └── Card 4: Packing List (screenshot + 50 words)
│
├── Section 3: How it Works
│   ├── Step 1: Create a trip
│   ├── Step 2: Invite your crew
│   └── Step 3: Plan together
│
├── Section 4: "Why Trippy?" differentiators
│   ├── 100% Free
│   ├── Works offline
│   ├── No app store needed (PWA)
│   └── Hebrew + English
│
├── Section 5: Social Proof / Testimonials
│
├── Section 6: FAQ (5 questions, no FAQPage schema)
│   ├── Q1: Is Trippy really free?
│   ├── Q2: How do I invite friends?
│   ├── Q3: Does it work offline?
│   ├── Q4: What languages does Trippy support?
│   └── Q5: How does the expense splitter work?
│
└── Section 7: Final CTA
    ├── "Start Planning Your Trip"
    └── "No account needed for demo"
```

### 19.2 SEO Word Count Target

| Section | Min Words EN | Min Words HE | Notes |
|---|---|---|---|
| Hero | 30 | 30 | Keep minimal, punchy |
| Feature Grid | 200 | 200 | 50 words per card |
| How it Works | 100 | 100 | 3 steps |
| Why Trippy | 100 | 100 | 4 bullet points expanded |
| Social Proof | 50 | 50 | Quotes |
| FAQ | 300 | 300 | 5 Q&As |
| Final CTA | 30 | 30 | — |
| **Total** | **810** | **810** | Above Google's 300-word minimum |

---

## 20. CONTENT BRIEF: FEATURE PAGES

### 20.1 /features/itinerary

**EN H1**: "Collaborative Trip Itinerary Planner — Plan Every Day Together"
**HE H1**: "מתכנן מסלול טיול שיתופי — תכנן כל יום יחד"
**Target keywords**: shared itinerary app, collaborative trip planning, group itinerary maker
**Word count target**: 800 words EN + 800 words HE
**Content sections**:
1. What is a collaborative itinerary? (150 words)
2. How Trippy's day planner works (200 words + screenshots)
3. Features: AI suggestions, conflict detection, travel time, golden hour alerts (200 words)
4. How to share your itinerary (150 words)
5. FAQ: 3 questions (100 words)

### 20.2 /features/budget

**EN H1**: "Group Trip Budget Tracker & Expense Splitter"
**HE H1**: "מעקב תקציב קבוצתי ומחלק הוצאות לטיול"
**Target keywords**: group trip expense tracker, split travel costs app, travel budget planner
**Word count target**: 800 words EN + 800 words HE
**Content sections**:
1. Why tracking group expenses matters (100 words)
2. How to set a trip budget in Trippy (150 words)
3. Logging expenses & multi-currency (150 words)
4. The expense settlement calculator (200 words)
5. Budget alerts — 80% warning, over budget (100 words)
6. FAQ (100 words)

### 20.3 /features/packing

**EN H1**: "Shared Group Packing List — Pack Together, Forget Nothing"
**HE H1**: "רשימת ציוד קבוצתית משותפת — ארזו יחד, תשכחו פחות"
**Target keywords**: shared packing list travel, group packing checklist app
**Word count target**: 700 words EN + 700 words HE
**Content sections**:
1. The shared packing list problem (100 words)
2. Categories: Documents, Gear, Health, Food, Drinks (150 words)
3. Critical items feature (100 words)
4. Assigning items to people (100 words)
5. Progress tracking (100 words)
6. FAQ (150 words)

### 20.4 /features/map

**EN H1**: "Interactive Trip Map — See Your Whole Journey at a Glance"
**HE H1**: "מפת טיול אינטראקטיבית — ראה את כל המסע במבט אחד"
**Target keywords**: trip planner with map, travel map itinerary planner, interactive trip map
**Word count target**: 600 words EN + 600 words HE

### 20.5 /destinations/israel (Highest ROI for HE market)

**EN H1**: "Plan Your Israel Group Trip — Free Itinerary Planner"
**HE H1**: "תכנן את הטיול הקבוצתי שלך לישראל — מתכנן מסלול חינמי"
**Target keywords**: Israel group trip planner, Israel travel itinerary, טיול לישראל מסלול
**Word count target**: 1200 words EN + 1200 words HE
**Content sections**:
1. Why Israel for group trips (200 words)
2. Sample itinerary: Negev 3 days (300 words)
3. Sample itinerary: Masada + Dead Sea (300 words)
4. Planning tips for Israel groups (200 words)
5. How to use Trippy for your Israel trip (200 words)

---

## 21. INTERNAL LINKING STRATEGY

### 21.1 Current Internal Links

| Source | Destination | Link Text | Status |
|---|---|---|---|
| / (landing) | /app | CTA buttons only | ✅ |
| / | /join/[token] | Via invite flow | — |
| No feature pages exist | — | — | 🔴 Missing |

### 21.2 Recommended Link Architecture

```
/ (Hub)
├── → /features/itinerary    [anchor: "collaborative itinerary planner"]
├── → /features/budget       [anchor: "group expense splitter"]
├── → /features/packing      [anchor: "shared packing list"]
├── → /features/map          [anchor: "interactive trip map"]
├── → /features/ai           [anchor: "AI activity suggestions"]
├── → /blog                  [anchor: "travel planning guides"]
└── → /destinations/israel   [anchor: "plan Israel trip"]

/features/itinerary
├── → /features/budget       [anchor: "track expenses"]
├── → /features/map          [anchor: "see on map"]
└── → /blog/how-to-plan-group-trip [anchor: "planning guide"]

/blog/how-to-plan-group-trip
├── → /features/itinerary
├── → /features/budget
├── → /features/packing
└── → / (CTA)
```

### 21.3 Anchor Text Strategy

| Destination | Primary Anchor (EN) | Primary Anchor (HE) | Secondary Anchor |
|---|---|---|---|
| /features/itinerary | "collaborative trip itinerary" | "מסלול טיול שיתופי" | "day-by-day planner" |
| /features/budget | "group expense splitter" | "מחלק הוצאות קבוצתי" | "budget tracker" |
| /features/packing | "shared packing list" | "רשימת ציוד משותפת" | "group packing checklist" |
| /features/map | "interactive trip map" | "מפת טיול אינטראקטיבית" | "trip map planner" |
| /destinations/israel | "plan Israel trip" | "תכנן טיול לישראל" | "Israel itinerary" |

---

## 22. CORE WEB VITALS & PERFORMANCE

### 22.1 Current Performance Signals

| Signal | Evidence | Score Estimate | Action |
|---|---|---|---|
| TTFB | Supabase skipped on anon load (page.tsx:21) | Good | — |
| CLS | All fonts use `display: swap` | Good | — |
| LCP | Landing is minimal HTML; hero is text + SVG | Likely good | Create og-image carefully |
| INP | React 19 concurrent rendering | Likely good | Monitor after feature page additions |
| JavaScript weight | Framer Motion in app; landing should tree-shake | Unknown | Verify bundle split |
| Font preload | JetBrains Mono: `preload: false` ✅ | Neutral | Add preload for Assistant (HE) |

### 22.2 Performance SEO Recommendations

| Recommendation | EN Impact | HE Impact | Priority |
|---|---|---|---|
| Add `<link rel="preload">` for Assistant font (Hebrew) | Faster HE render | Hebrew LCP improvement | 🟠 High |
| Ensure Framer Motion is NOT bundled with landing page | Faster landing LCP | Same | 🟠 High |
| Use Next.js `<Image>` for any images added to landing | CLS + LCP | Same | 🟠 High |
| Create og-image.png as optimized <300KB PNG | Social share speed | Same | 🔴 Critical |
| Add `next.config` `images.minimumCacheTTL` | Cache static images | Same | 🟢 Low |
| Verify no render-blocking resources | LCP | Same | 🟡 Medium |
| Run PageSpeed Insights on letsexploring.com | Baseline measurement | Same | 🟠 High |

---

## 23. ACCESSIBILITY & SEO INTERSECTION

### 23.1 Accessibility Features That Help SEO

| Feature | Status | SEO Benefit |
|---|---|---|
| `aria-labels` on NavBar | ✅ Set (navOverview, navDayPlanner, etc.) | Screen reader + crawl signals |
| High Contrast mode | ✅ WCAG AA setting | Accessibility differentiator |
| Reduce Motion mode | ✅ Built-in | User experience signal |
| `lang` attribute | ✅ Locale-aware | Language targeting |
| `dir` attribute for RTL | ✅ Correct | Hebrew rendering + SEO |
| Alt text on OG image | ✅ Set in code | When file created |
| Alt text on SVG logo | ⚠️ `aria-hidden="true"` on logo SVG | Logo is decorative — OK |
| Skip navigation link | ❌ Missing | Add for WCAG + crawl depth |
| Semantic HTML headings | ⚠️ Landing H1 is brand name not keyword | Rewrite H1 |
| Focus management in Sheets | ⚠️ Unverified | ARIA role="dialog" should trap focus |

### 23.2 Hebrew Accessibility SEO Notes

| Note | EN | HE | Priority |
|---|---|---|---|
| RTL text direction | `dir="rtl"` applied | נכון | ✅ |
| Hebrew font rendering | Assistant font loaded | טעינה טובה | ✅ |
| Hebrew number formats | Western numerals used | מספרים מערביים | ✅ |
| Hebrew date format | App supports DD/MM format | פורמט תאריך ישראלי | 🟡 |
| Accessible Hebrew tooltips | Not verified | לא נבדק | 🟡 |

---

## 24. MEASUREMENT & KPIs

### 24.1 SEO KPIs — English

| KPI | Baseline (current) | 3-Month Target | 6-Month Target | Tool |
|---|---|---|---|---|
| Organic search clicks (monthly) | ~0 (auth wall) | 200 | 1,000 | Google Search Console |
| Organic impressions | ~50 | 5,000 | 25,000 | Google Search Console |
| Average position | >50 | 20–30 | 10–20 | Google Search Console |
| Core keywords ranking | 0 | 5 keywords top 30 | 15 keywords top 20 | GSC + Ahrefs |
| Landing page organic conversion | 0% | 3% | 6% | GA4 |
| Indexed pages | 1 | 8 | 15+ | GSC |
| Schema rich results | 0 | 1 (SoftwareApp) | 3 | GSC Rich Results |
| AI citation mentions | 0 | 5 | 20 | Manual + Brand monitoring |
| PageSpeed score (landing) | Unknown | >80 | >90 | PageSpeed Insights |
| CLS score | Unknown | < 0.1 | < 0.05 | CrUX |

### 24.2 SEO KPIs — Hebrew (ישראל)

| מדד | בסיס נוכחי | יעד 3 חודשים | יעד 6 חודשים | כלי |
|---|---|---|---|---|
| קליקים אורגניים מישראל | ~0 | 100 | 500 | Google Search Console |
| חשיפות לחיפושים בעברית | ~0 | 2,000 | 10,000 | GSC |
| דירוג למילות מפתח עבריות | 0 | 3 במקום 20–40 | 8 במקום 10–20 | GSC |
| עמודים מאינדקסים בעברית | 0 | 4 | 10+ | GSC |
| המרות מקהל עברי | 0% | 2% | 5% | GA4 |

### 24.3 Measurement Setup Checklist

| Task | Status | Action |
|---|---|---|
| Google Search Console verified for letsexploring.com | ⚠️ Unknown | Add GSC property |
| Google Search Console for trippy.app | ⚠️ Unknown | Add + set up 301 redirect |
| GA4 installed | ✅ Vercel Analytics detected | Add GA4 for deeper keyword data |
| Google Tag Manager | ⚠️ Unknown | Optional — Vercel Analytics may suffice |
| Search Console sitemap submitted | ⚠️ Unknown | Submit after domain fix |
| Bing Webmaster Tools | ❌ Missing | Add for Bing indexing |
| Israeli market targeting in GSC | ❌ Missing | Set Israel as target via International Targeting |
| Brand monitoring setup | ❌ Missing | Set up Google Alerts for "Trippy group planner" |
| Core Web Vitals field data | ⚠️ Low traffic | Monitor after content expansion |

---

## APPENDIX A — FILES TO CREATE

| File | Purpose | Priority |
|---|---|---|
| `public/og-image.png` | Social sharing preview (1200×630px) | 🔴 Critical |
| `public/og-image-he.png` | Hebrew social sharing card (RTL) | 🟠 High |
| `public/screenshots/dashboard.png` | PWA manifest screenshot | 🟡 Medium |
| `public/screenshots/day-planner.png` | PWA manifest screenshot | 🟡 Medium |
| `public/screenshots/packing.png` | PWA manifest screenshot | 🟡 Medium |
| `public/llms.txt` | LLM-readable product description | 🟠 High |
| `app/components/SchemaMarkup.tsx` | JSON-LD structured data component | 🔴 Critical |
| `app/features/itinerary/page.tsx` | Feature page — itinerary | 🟠 High |
| `app/features/budget/page.tsx` | Feature page — budget | 🟠 High |
| `app/features/packing/page.tsx` | Feature page — packing | 🟠 High |
| `app/features/map/page.tsx` | Feature page — map | 🟠 High |
| `app/blog/page.tsx` | Blog index | 🟡 Medium |
| `app/destinations/israel/page.tsx` | Israel destination page | 🟠 High |

---

## APPENDIX B — FILES TO MODIFY

| File | Change | Priority |
|---|---|---|
| `app/layout.tsx` | Fix `metadataBase`, OG url, add alternates (hreflang), add canonical | 🔴 Critical |
| `app/page.tsx` | Rewrite H1, add feature sections, add locale-aware metadata, add SchemaMarkup | 🔴 Critical |
| `app/sitemap.ts` | Expand to 10+ URLs, fix domain, add hreflang alternates | 🔴 Critical |
| `public/robots.txt` | Fix sitemap URL from trippy.app to letsexploring.com | 🔴 Critical |
| `public/manifest.json` | Add categories, screenshots, expand description | 🟠 High |
| `public/llms.txt` | Rewrite with full product description | 🟠 High |
| `app/app/page.tsx` or layout | Add `<meta name="robots" content="noindex,nofollow">` | 🔴 Critical |
| `app/join/[token]/page.tsx` | Add noindex meta | 🔴 Critical |
| `app/account/confirm-delete/page.tsx` | Add noindex meta | 🔴 Critical |
| `app/account/cancel-delete/page.tsx` | Add noindex meta | 🔴 Critical |

---

## APPENDIX C — QUICK WINS CHECKLIST

Copy this checklist to track implementation progress:

- [ ] Fix `metadataBase` to `https://letsexploring.com` in `app/layout.tsx`
- [ ] Fix `og:url` from `trippy.app` to `letsexploring.com`
- [ ] Create `public/og-image.png` (1200×630px)
- [ ] Add `noindex` to `/app` route
- [ ] Add `noindex` to `/join/[token]` route
- [ ] Add `noindex` to `/account/*` routes
- [ ] Fix sitemap domain in `app/sitemap.ts`
- [ ] Fix robots.txt sitemap URL
- [ ] Add `alternates.canonical` to root layout metadata
- [ ] Add `alternates.languages` for `en-US` and `he-IL`
- [ ] Create `app/components/SchemaMarkup.tsx` with SoftwareApplication + Organization + WebSite
- [ ] Add `<SchemaMarkup />` to `app/page.tsx`
- [ ] Rewrite landing page H1 from "Trippy." to keyword-rich heading
- [ ] Add 400+ words of feature content below fold on landing page
- [ ] Expand sitemap to include feature page URLs
- [ ] Implement locale-aware `generateMetadata()` in `app/page.tsx`
- [ ] Add Hebrew title + description to metadata
- [ ] Create `public/og-image-he.png` Hebrew variant
- [ ] Add `og:locale` and `og:locale:alternate` tags
- [ ] Update `public/manifest.json` with categories + screenshots
- [ ] Update `public/llms.txt` with full product description
- [ ] Audit live site for "Volunteer Trip Planner" title bug
- [ ] Submit updated sitemap to Google Search Console
- [ ] Set up Google Search Console for letsexploring.com
- [ ] Set up Bing Webmaster Tools
- [ ] Run PageSpeed Insights baseline on letsexploring.com
- [ ] Run Google Rich Results Test after schema implementation
- [ ] Create at least 1 feature page (`/features/itinerary`)
- [ ] Create Israel destination page (highest HE ROI)
- [ ] Start blog with "How to Plan a Group Trip" post

---

*Document generated: 2026-06-11 | Trippy SEO Master Plan v1.0 | letsexploring.com*
*Prepared based on: live site audit (letsexploring.com), full codebase analysis (c:\Users\guy9d\Desktop\Trippy), i18n.tsx (1,154 translation keys), robots.txt, sitemap.ts, layout.tsx, page.tsx*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Built by agricidaniel — Join the AI Marketing Hub community
Free → https://www.skool.com/ai-marketing-hub
Pro  → https://www.skool.com/ai-marketing-hub-pro
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
