# TRIPPY V2 — HEBREW & RTL CREW

> **Owner:** Hebrew Language, RTL Layout, Brand Voice  
> **Branch:** `v2/hebrew`  
> **Reads:** `00_GLOBAL.md` first

---

## 1. CURRENT RTL BUGS (8 Critical Issues)

| # | Bug | File | Impact |
|---|-----|------|--------|
| 1 | `dir` set on scroll div, not `<html>` | `AppShell.tsx` | Screen-reader announces wrong direction |
| 2 | `<html lang="en">` hardcoded | `app/layout.tsx:8` | Wrong language announced by VoiceOver/TalkBack |
| 3 | Framer Motion slide animations not direction-aware | `DashboardScreen.tsx`, `DayScreen.tsx` | Slides in wrong direction in Hebrew |
| 4 | `margin-left` / `padding-left` used throughout | Multiple components | Layout breaks in RTL |
| 5 | `text-align: left` hardcoded | Multiple components | Right-aligned text not honored |
| 6 | Absolute `left: 0` positions used | NavBar, Sheet | Elements appear on wrong side |
| 7 | Font not switched to Huninn for Hebrew | `globals.css` | Latin font renders Hebrew |
| 8 | `localStorage` locale key not read before first render | `i18n.tsx` + `layout.tsx` | Flash of English before locale loads |

---

## 2. FIX 1: `dir` and `lang` on `<html>`

**File:** `app/layout.tsx`

```typescript
// app/layout.tsx — Server Component, reads locale from cookie
import { cookies } from 'next/headers';

export default async function RootLayout({ children }) {
  const locale = (await cookies()).get('trippy-locale')?.value ?? 'en';
  const dir    = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```

**Client-side update (when user switches language):**
```typescript
// In the language toggle handler (AppShell or SettingsScreen):
function switchLocale(newLocale: 'en' | 'he') {
  setLocale(newLocale);
  document.documentElement.lang = newLocale;
  document.documentElement.dir  = newLocale === 'he' ? 'rtl' : 'ltr';
  // Persist to cookie so server-side layout.tsx picks it up on reload
  document.cookie = `trippy-locale=${newLocale}; path=/; max-age=31536000`;
}
```

**Remove from AppShell:** Any `dir="rtl"` on a scroll container or `<div>`. Direction belongs only on `<html>`.

---

## 3. FIX 2: Hebrew Font

**Font:** **Heebo** — clean, modern, excellent for UI. Pairs beautifully with Bricolage Grotesque (both are humanist grotesques, just for their respective scripts).

```typescript
// app/layout.tsx — add Heebo
import { Heebo } from 'next/font/google';

const heebo = Heebo({
  subsets: ['hebrew'],
  variable: '--font-hebrew',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
```

```css
/* globals.css — font switching by lang */
:root {
  --font-sans: var(--font-bricolage);
}

:lang(he) {
  --font-sans: var(--font-heebo);
  /* Heebo is slightly larger optically — adjust */
  --text-base: 0.975rem;
  --leading-normal: 1.6;
}
```

This means **every component automatically uses the correct font** for the current language — no manual font overrides needed.

---

## 4. FIX 3: CSS Logical Properties Audit

Replace all physical CSS properties with logical equivalents. This is required for RTL support.

| ❌ Physical (breaks RTL) | ✅ Logical (RTL-safe) |
|-------------------------|----------------------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |
| `left: 0` | `inset-inline-start: 0` |
| `right: 0` | `inset-inline-end: 0` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |

**Audit command:**
```bash
grep -rn "margin-left\|padding-left\|margin-right\|padding-right\|text-align: left\|text-align: right\|left: 0\|right: 0" app/ --include="*.css" --include="*.module.css"
```

**Exception:** The brand name "Trippy." is ALWAYS LTR regardless of page direction:
```tsx
<span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Trippy.</span>
```

---

## 5. FIX 4: Direction-Aware Framer Motion Animations

Import `slideVariants` from `lib/motion.ts` (already defined with RTL support):

```typescript
// In DashboardScreen, DayScreen, etc.
import { slideVariants, spring } from '@/lib/motion';
const { isRTL } = useLocale();

<AnimatePresence custom={direction} mode="wait">
  <m.div
    key={currentDay}
    custom={direction}
    variants={slideVariants(isRTL)}
    initial="enter"
    animate="center"
    exit="exit"
    transition={spring.gentle}
  >
    {/* screen content */}
  </m.div>
</AnimatePresence>
```

The `slideVariants(isRTL)` function flips the x-direction when `isRTL = true`, so swipe-forward in Hebrew moves left (visually correct).

---

## 6. FIX 5: Prevent Locale Flash on First Render

**Problem:** `localStorage` is read client-side, but the initial HTML is rendered server-side as `lang="en"`. Users see English text for ~100ms before it flips to Hebrew.

**Fix:** Read locale from cookie in `layout.tsx` (cookie is available server-side):

```typescript
// layout.tsx already handles this after Fix 1.
// Additionally, prevent hydration mismatch by suppressing the warning:
<html lang={locale} dir={dir} suppressHydrationWarning>
```

`suppressHydrationWarning` is safe here because the `lang` and `dir` attributes are the only things that may differ between server and client renders when the cookie updates mid-session.

---

## 7. BRAND VOICE — HEBREW

Trippy's Hebrew voice must feel native, not translated. Key principles:

### 7.1 Voice Personality

- **Informal and warm:** Use everyday spoken Hebrew, not formal written Hebrew
- **Second person singular:** Address the user as אתה/את (not the formal הנכם)
- **Verb-forward sentences:** Lead with the action ("צור טיול" not "ניתן ליצור טיול")
- **Avoid direct translations:** Some English UI patterns don't translate well — rephrase entirely

### 7.2 Brand Glossary

| Concept | ❌ Literal Translation | ✅ Trippy Hebrew | Notes |
|---------|----------------------|-----------------|-------|
| Trip | נסיעה | טיול | Warmer; implies leisure |
| Itinerary | לוח זמנים | תוכנית הטיול | More natural |
| Event | אירוע | פעילות | Event sounds formal |
| Crew / Team | צוות | החבר'ה | Colloquial, warm |
| Overview | סקירה כללית | הבית | "Home" screen metaphor |
| Supplies | ציוד | מה לארוז | Action-oriented |
| Settings | הגדרות | העדפות | Softer, more personal |
| Add event | הוסף אירוע | מה עוד? | Conversational invite |
| Let's go! | בואו נלך! | יאללה! | Authentic Israeli expression |
| Day | יום | יום | Same |
| Budget | תקציב | כמה מוציאים | Conversational |
| Done / Packed | הושלם | ✓ ארזתי | Personal, first-person |

### 7.3 Tone Examples

**Onboarding welcome:**
```
❌ Formal: "ברוכים הבאים לטריפי, אפליקציית תכנון הטיולים שלך"
✅ Brand:  "שלום! אנחנו טריפי. בואו נתכנן משהו מדהים."
```

**Empty state (no events on a day):**
```
❌ Literal: "אין אירועים ביום זה"  
✅ Brand:   "היום עוד פנוי — מה תרצה לעשות?"
```

**Trip creation success:**
```
❌ System: "הטיול נוצר בהצלחה"
✅ Brand:  "יאללה! הטיול שלך חי 🎉"
```

**Budget warning (80%):**
```
❌ Clinical: "השגת 80% מהתקציב שלך"
✅ Brand:    "כמעט הגעת לגבול — נשארו לכם {{amount}}"
```

**Supply item packed:**
```
❌ Passive: "הפריט סומן כארוז"
✅ Brand:   "✓ ארזתי!"
```

**Offline state:**
```
❌ Technical: "אין חיבור לאינטרנט"
✅ Brand:     "אין רשת? אל דאגה, הכל שמור אצלנו."
```

### 7.4 Numbers and Dates in Hebrew

```typescript
// lib/format.ts — locale-aware formatting
export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

Hebrew date format: `יום שלישי, 12 ביוני` (not `Tuesday, June 12`).

Hebrew currency: Amounts appear on the left even in RTL, per Hebrew typographic convention: `₪340` not `340 ₪`.

---

## 8. UPDATED `i18n.tsx` — NEW KEYS TO ADD

The following keys need to be added to both `en` and `he` dictionaries:

```typescript
// lib/i18n.tsx — additions

const en = {
  // ... existing keys ...
  
  // World Clock
  'worldClock.localTime': 'Local time',
  'worldClock.yourTime': 'Your time',
  'worldClock.ahead': '{{h}}h ahead',
  'worldClock.behind': '{{h}}h behind',
  'worldClock.sameZone': 'Same time zone',
  
  // Map
  'map.title': 'Trip Map',
  'map.noCoords': 'This event has no location',
  'map.dayLabel': 'Day {{n}}',
  
  // Crew
  'crew.title': 'Crew',
  'crew.invite': 'Invite someone',
  'crew.inviteEmail': 'Invite by email',
  'crew.inviteLink': 'Copy invite link',
  'crew.linkCopied': 'Link copied!',
  'crew.owner': 'Owner',
  'crew.member': 'Member',
  'crew.pending': 'Invited',
  
  // Settlement
  'settlement.title': 'Who owes who',
  'settlement.owes': '{{from}} owes {{to}}',
  'settlement.settled': 'All settled!',
  
  // Budget alerts
  'budget.eightyPct': '{{remaining}} left in budget',
  'budget.over': '{{amount}} over budget',
  
  // Vibe quiz
  'vibe.explorer': 'Explorer',
  'vibe.relaxed': 'Relaxed',
  'vibe.foodie': 'Foodie',
  'vibe.budget': 'Budget-smart',
  'vibe.balanced': 'Balanced',
};

const he = {
  // ... existing keys ...
  
  // World Clock
  'worldClock.localTime': 'שעה מקומית',
  'worldClock.yourTime': 'השעה אצלך',
  'worldClock.ahead': '{{h}} שעות קדימה',
  'worldClock.behind': '{{h}} שעות אחורה',
  'worldClock.sameZone': 'אותה אזור זמן',
  
  // Map
  'map.title': 'מפת הטיול',
  'map.noCoords': 'לפעילות זו אין מיקום',
  'map.dayLabel': 'יום {{n}}',
  
  // Crew
  'crew.title': 'החבר\'ה',
  'crew.invite': 'הזמינו מישהו',
  'crew.inviteEmail': 'הזמנה במייל',
  'crew.inviteLink': 'העתק קישור הזמנה',
  'crew.linkCopied': 'הקישור הועתק!',
  'crew.owner': 'מארגן',
  'crew.member': 'חבר',
  'crew.pending': 'הוזמן',
  
  // Settlement
  'settlement.title': 'מי חייב למי',
  'settlement.owes': '{{from}} חייב/ת ל-{{to}}',
  'settlement.settled': 'הכל מסודר!',
  
  // Budget alerts
  'budget.eightyPct': 'נשארו {{remaining}} מהתקציב',
  'budget.over': 'חרגתם ב-{{amount}} מהתקציב',
  
  // Vibe quiz
  'vibe.explorer': 'חוקרים',
  'vibe.relaxed': 'ריילקסד',
  'vibe.foodie': 'אוכל אוכל',
  'vibe.budget': 'חסכנים חכמים',
  'vibe.balanced': 'מאוזנים',
};
```

---

## 9. RTL CHECKLIST (Before Every PR That Touches UI)

- [ ] Tested by switching to Hebrew in Settings → Language
- [ ] Nav bar tabs appear right-to-left
- [ ] Sheets slide up from bottom (not affected by direction)
- [ ] Back button appears on correct side (inline-end in RTL = left)
- [ ] All text aligns to `start` (right in RTL)
- [ ] Numbers and currency display correctly (Intl.NumberFormat with `he-IL`)
- [ ] Dates formatted with Hebrew month names
- [ ] Brand "Trippy." in header is still LTR
- [ ] Animations slide in the correct direction (using `slideVariants(isRTL)`)
- [ ] New i18n keys added to both `en` and `he`
- [ ] Hebrew text reviewed against §7 brand voice guidelines

---

## 10. IMPLEMENTATION ORDER

```
Week 1:  Fix 1 (dir/lang on <html>) + Fix 2 (Heebo font via next/font)
Week 2:  Fix 5 (locale flash) + CSS logical properties audit (Fixes 3)
Week 3:  Fix 4 (RTL-aware animations) + Fix 8 (locale flash full fix)
Week 4:  Brand voice review — replace machine-translated strings with brand Hebrew
Week 5:  Add all new i18n keys (§8) for new features
Week 6:  Full RTL QA on all 6 screens
```
