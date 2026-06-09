# Content Audit — app/page.tsx (Landing Page)

Reviewed: 2026-06-09
Strings reviewed: ~80 (EN) + ~80 (HE) = ~160
Strings with issues: 4

---

## English Strings

---

FILE: app/page.tsx
KEY: about.p3 (en)

BEFORE: "Weekend escape or month-long adventure — Trippy keeps your whole crew on the same page. Free to start, no card needed."
ISSUES: "adventure" is a flagged generic travel cliché; "escape" is also borderline travel-brochure language
AFTER:  "Weekend trip or month on the road — Trippy keeps your whole crew on the same page. Free to start, no card needed."

---

## Hebrew Strings

---

FILE: app/page.tsx
KEY: about.p1 (he)

BEFORE: "טיולים קבוצתיים אמורים להיות כיף — לא מלחמה בין גיליונות אלקטרוניים, שרשורי וואטסאפ שאף אחד לא מעודכן בהם, ומסמכי גוגל שתמיד מאחור."
ISSUES: "שתמיד מאחור" is a loose translation of "where nothing is ever final" — "מאחור" (behind) misses the meaning; should convey "never finished/never final"
AFTER:  "טיולים קבוצתיים אמורים להיות כיף — לא מלחמה בין גיליונות אלקטרוניים, שרשורי וואטסאפ שאף אחד לא עוקב אחריהם, ומסמכי גוגל שאף פעם לא מוגמרים."

---

FILE: app/page.tsx
KEY: about.p2 (he)

BEFORE: "טריפי מביא הכל למקום אחד: לוח זמנים חי שכולם יכולים לערוך, תקציב שמתעדכן לבד, מפה אינטראקטיבית ורשימת אריזה שמסתנכרנת בזמן אמת."
ISSUES: "תקציב שמתעדכן לבד" — "updates itself" is misleading; the budget is tracked collaboratively. English: "a budget that stays honest"
AFTER:  "טריפי מביא הכל למקום אחד: לוח זמנים חי שכולם יכולים לערוך, תקציב שנשאר מעודכן, מפה אינטראקטיבית ורשימת אריזה שמסתנכרנת בזמן אמת."

---

FILE: app/page.tsx
KEY: about.p3 (he)

BEFORE: "בין אם זה בריחה של סוף שבוע או הרפתקה של חודש — טריפי שומר על כל הקבוצה באותו עמוד. בחינם, ללא צורך בכרטיס אשראי."
ISSUES: "הרפתקה" is explicitly flagged in the Hebrew generic phrases list
AFTER:  "בין אם זה חופשת סוף שבוע או חודש בדרכים — טריפי שומר על כל הקבוצה באותו עמוד. בחינם, ללא צורך בכרטיס אשראי."

---

## Validated — No Issues

The following sections passed review:
- Hero h1: "Plan trips. Together." — clean, direct ✅
- Hero body (EN): specific, no filler, active voice ✅
- Hero body (HE): accurate to EN, natural Hebrew ✅
- All feature titles and descriptions (EN + HE): specific, active, useful ✅
- All FAQ items (EN + HE): factual, direct ✅
- CTA: "Where are you headed?" — clean ✅
- CTA body (EN + HE): specific promise, no filler ✅
- All legal text: appropriate for legal context ✅
- Metadata descriptions: accurate, no clichés ✅
