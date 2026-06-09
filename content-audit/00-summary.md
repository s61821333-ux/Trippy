# Content Audit Summary + Homepage Fixes

Date: 2026-06-09
Auditor: Content audit agent per Lauguage.md instructions

---

## Scope

| File | Strings Reviewed | Issues Found | Rewritten |
|------|-----------------|--------------|-----------|
| lib/i18n.tsx (EN) | 530 | 5 | 5 |
| lib/i18n.tsx (HE) | 530 | 3 | 3 |
| app/page.tsx (EN) | ~80 | 2 | 2 |
| app/page.tsx (HE) | ~80 | 3 | 3 |
| **TOTAL** | **~1,220** | **13** | **13** |

Grammar errors fixed: 1 (Hebrew passive voice)
Generic AI phrases removed: 5 (adventure ×3, unforgettable ×1, tribe ×1)
Translation accuracy fixes: 2 (Hebrew about section)

---

## Top Issues Found

1. **"Adventure" / "הרפתקה" cliché** — 4 occurrences
   - `createBtn` EN, `adventurePrep` EN+HE, `about.p3` EN+HE, `createPlaceholderName` EN

2. **"Unforgettable" / "חוויה בלתי נשכחת"** — 2 occurrences (EN + HE demo string)
   - `'Traditional tea and local bread...'` in both locales

3. **Hebrew passive voice** — 1 occurrence
   - `pdfNoEvents` HE: "לא תוכננו פעילויות" → "עדיין אין פעילויות"

4. **Generic crew copy** — 1 occurrence
   - `gatherTheTribe` EN: "Gather the tribe" + `gatherSubtitle` EN: "remember together"

5. **Hebrew translation accuracy** — 2 occurrences
   - `about.p1` HE: "שתמיד מאחור" (always behind) → "שאף פעם לא מוגמרים" (never finished)
   - `about.p2` HE: "תקציב שמתעדכן לבד" (updates itself) → "תקציב שנשאר מעודכן" (stays updated)

---

## Rewrites Applied

### lib/i18n.tsx — English

| Key | Before | After |
|-----|--------|-------|
| `createBtn` | "Start the Adventure" | "Start Planning" |
| `adventurePrep` | "Adventure prep" | "Pack check" |
| `gatherTheTribe` | "Gather the tribe" | "Get everyone in" |
| `gatherSubtitle` | "...remember together." | "...travel together." |
| `'Traditional tea...'` | "...unforgettable." | "...worth the detour." |
| `createPlaceholderName` | "e.g. Europe Adventure 2026" | "e.g. Europe Summer 2026" |

### lib/i18n.tsx — Hebrew

| Key | Before | After |
|-----|--------|-------|
| `adventurePrep` | "הכנה להרפתקה" | "בדיקת ציוד" |
| `'Traditional tea...'` | "...חוויה בלתי נשכחת." | "...לא מפספסים את זה." |
| `pdfNoEvents` | "לא תוכננו פעילויות." | "עדיין אין פעילויות." |

### app/page.tsx — English

| Key | Before | After |
|-----|--------|-------|
| `about.p1` | "...Google Docs where nothing is ever final." | "...Google Docs that are never finished." |
| `about.p2` | "a budget that stays honest" | "a budget you can all see and trust" |
| `about.p3` | "Weekend escape or month-long adventure..." | "Weekend trip or month on the road..." |

### app/page.tsx — Hebrew

| Key | Before | After |
|-----|--------|-------|
| `about.p1` | "...ומסמכי גוגל שתמיד מאחור." | "...ומסמכי גוגל שאף פעם לא מוגמרים." |
| `about.p2` | "תקציב שמתעדכן לבד" | "תקציב שנשאר מעודכן" |
| `about.p3` | "בריחה של סוף שבוע או הרפתקה של חודש" | "חופשת סוף שבוע או חודש בדרכים" |

---

## What Was NOT Changed

Per the guidelines:
- Legal/privacy text was not shortened or rewritten (requires approval)
- Technical strings (API keys, variable names, component IDs) were not touched
- Strings marked with existing `// do-not-translate` annotations were left alone
- Demo data names (Makhtesh Ramon Hike, Masada via cable car, etc.) were left — they are proper place names, not generic copy
- Emoji usage was preserved where the existing design uses it

---

## Sections That Passed With No Changes

- All navigation labels — direct and correct ✅
- All error messages — clear, non-blaming, with next action ✅
- All toast confirmations — short and correct ✅
- All empty states (except pdfNoEvents HE above) — friendly and specific ✅
- Budget & expense strings — factual and direct ✅
- Emergency hub strings — appropriate for safety context ✅
- Settlement / World Clock / Route Connector strings — clean ✅
- Onboarding nudge copy — direct and honest ✅
- Landing page hero, features, FAQ — clean ✅
