# Content Audit — lib/i18n.tsx

Reviewed: 2026-06-09
Strings reviewed: 530 (EN) + 530 (HE) = 1,060
Strings with issues: 9
Languages: English · Hebrew

---

## English Strings

---

FILE: lib/i18n.tsx
KEY: createBtn

BEFORE: "Start the Adventure"
ISSUES: "Adventure" is a flagged generic travel cliché — vague and overused
AFTER:  "Start Planning"

---

FILE: lib/i18n.tsx
KEY: adventurePrep

BEFORE: "Adventure prep"
ISSUES: "Adventure" is a flagged generic travel cliché; also not descriptive of the actual action
AFTER:  "Pack check"

---

FILE: lib/i18n.tsx
KEY: gatherTheTribe

BEFORE: "Gather the tribe"
ISSUES: "tribe" is overused startup/travel copy shorthand; sounds performatively casual
AFTER:  "Get everyone in"

---

FILE: lib/i18n.tsx
KEY: gatherSubtitle

BEFORE: "Invite your people — plan together, remember together."
ISSUES: "remember together" is vague sentimental filler; doesn't describe a real feature
AFTER:  "Invite your people — plan together, travel together."

---

FILE: lib/i18n.tsx
KEY: 'Traditional tea and local bread with a Bedouin family — unforgettable.'

BEFORE: "Traditional tea and local bread with a Bedouin family — unforgettable."
ISSUES: "unforgettable" is explicitly flagged as a generic AI phrase; adds no information
AFTER:  "Traditional tea and fresh bread with a Bedouin family — worth the detour."

---

FILE: lib/i18n.tsx
KEY: createPlaceholderName

BEFORE: "e.g. Europe Adventure 2026"
ISSUES: "Adventure" cliché even in placeholder text; sets wrong brand tone
AFTER:  "e.g. Europe Summer 2026"

---

## Hebrew Strings

---

FILE: lib/i18n.tsx
KEY: adventurePrep (he)

BEFORE: "הכנה להרפתקה"
ISSUES: "הרפתקה" is explicitly listed in the flagged Hebrew phrases list
AFTER:  "בדיקת ציוד"

---

FILE: lib/i18n.tsx
KEY: 'Traditional tea and local bread with a Bedouin family — unforgettable.' (he)

BEFORE: "תה מסורתי ולחם טרי עם משפחה בדואית — חוויה בלתי נשכחת."
ISSUES: "חוויה בלתי נשכחת" is the first explicitly flagged Hebrew phrase — must remove
AFTER:  "תה מסורתי ולחם טרי עם משפחה בדואית — לא מפספסים את זה."

---

FILE: lib/i18n.tsx
KEY: pdfNoEvents (he)

BEFORE: "לא תוכננו פעילויות."
ISSUES: Passive voice ("לא תוכננו" = were not planned) — Hebrew UI guideline says avoid passive
AFTER:  "עדיין אין פעילויות."

---

## Validated — No Issues

The following string categories passed review:
- All navigation labels (navCamp, navExplore, navPack, navSetup, navNotes, navMap, navCrew)
- All error messages (tripNotFound, loginFailed, passwordsMismatch, etc.)
- All toast/confirmation messages (eventAdded, tripUpdated, budgetSet, etc.)
- All empty states (noUpcomingEvents, noNotes, mapNoEvents, crewNoMembers, etc.)
- All button labels (cancel, saveChanges, addBtn, skipBtn, etc.)
- Budget & expense strings
- Emergency hub strings
- World Clock & Route Connector strings
- Settlement strings
- Accessibility strings (highContrastSub, reduceMotionSub)
