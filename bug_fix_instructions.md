# letsexploring.com — Full App Analysis Report

**App**: letsexploring.com (PWA — Travel Itinerary Planner)  
**Platform**: iOS, Brave Browser  
**Language**: Hebrew (RTL)  
**Version**: Trippy v2.0 · Liquid Glass  
**Analysis Date**: June 4, 2026  

---

## 🚨 CRITICAL BUGS (Confirmed from Video)

---

### BUG #1 — Changes Are NOT Saved (Lost on Refresh)
**Severity**: 🔴 CRITICAL  
**Frames**: 3–7 → 8 → 10  

The user edited an activity ("נסיעה לוושינגטון"), tapped "שמור שינויים" (Save Changes), and received the "אירוע עודכן" (Event updated) toast. After a page refresh, the app returned to the home screen and **all edits were gone** — the activity showed its original data.

**Root cause**: Changes are only saved to in-memory state. There is no server sync or persistent localStorage write on save.

**Impact**: Every change a user makes is lost the moment the page is refreshed or the browser tab is closed. The app is essentially non-functional for planning.

---

### BUG #2 — Trip Deletion is LOCAL ONLY (Server Not Updated)
**Severity**: 🔴 CRITICAL  
**Frames**: 17 → 18 → 20 → 23 → 26  

The flow:
1. User taps "מחק טיול" (Delete trip)
2. Confirmation dialog appears — but **buttons are hidden behind the nav bar** (see Bug #3)
3. Toast shows: "הטיול נמחק מקומית" **(Trip deleted LOCALLY)**
4. Settings screen still shows the "מחק טיול" button — UI not updated
5. User returns to home screen — **trip still appears in the list**
6. After next reload — **trip is fully restored**, as if nothing happened

**Root cause**: The word "מקומית" (locally) in the toast says it all — deletion only clears localStorage. The server is never called. On any reload, the trip is re-fetched from the backend.

**Impact**: Users cannot delete trips. Any attempt to clean up their account is silently ignored.

---

### BUG #3 — Delete Confirmation Dialog Buttons Are Hidden
**Severity**: 🔴 CRITICAL  
**Frame**: 18  

The bottom sheet dialog "מחיקה היא בלתי הפיכה. להמשיך?" (Deletion is irreversible. Continue?) renders its action buttons **directly behind the bottom navigation bar**. The user cannot see or tap "אישור" (Confirm) or "ביטול" (Cancel).

**Root cause**: The modal does not account for the safe area inset or the bottom navigation bar height. `padding-bottom` is missing or incorrect.

**Impact**: Users cannot confirm or cancel the deletion. The modal is effectively broken.

---

### BUG #4 — Navigation State Lost on Refresh
**Severity**: 🔴 CRITICAL  
**Frames**: 8 → 9  

When the user refreshes the page (intentionally or accidentally), the app drops back to the **home/trip list screen** instead of restoring the last visited page (e.g., Day 6 of USA 2026).

**Root cause**: No URL routing or session state restoration. The app renders the default home view on every fresh load.

**Impact**: Deep navigation (e.g., trip → day → activity) is not persisted. Accidental refresh destroys context.

---

### BUG #5 — Content Hidden Behind Bottom Navigation Bar
**Severity**: 🔴 CRITICAL  
**Frames**: 2, 10, 11, 15  

The last item in scrollable lists (activity cards, budget section, trip details) is **partially or fully hidden behind the fixed bottom navigation bar**. Users cannot read or tap on it.

Examples:
- "...arriott Washington, DC Dupont Circle" card clipped at the bottom
- Budget "לחץ לקריאת מגבלת תקציב" text rendered under the nav bar — unreadable
- In the expanded activity row (frame 11), the next activity card overlaps with the nav bar

**Root cause**: The scroll container does not have the correct `padding-bottom` to account for the navigation bar height (~80px). `safe-area-inset-bottom` is not applied.

**Fix**:
```css
.scroll-container {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
```

---

## ⚠️ Additional Issues Found

| # | Issue | Severity |
|---|---|---|
| 6 | Duplicate trip in list ("London 2026" × 2) | 🟠 High |
| 7 | Blank white screen on transitions (no loading state) | 🟠 High |
| 8 | High contrast / WCAG AA off by default | 🟠 High |
| 9 | Green "success" card for 0-activity trip (misleading) | 🟠 Medium |
| 10 | "מחק טיול" button pink, not red (unclear danger action) | 🟡 Medium |
| 11 | "APPEARANCE", "System/Dark/Light" labels not localized | 🟡 Medium |
| 12 | Activity category tags in English (Café, Drive, Museum…) | 🟡 Medium |
| 13 | Keyboard opens without adjusting scroll area | 🟡 Medium |
| 14 | Date strip direction counterintuitive (newest on left) | 🟡 Low |
| 15 | App runs in browser, not installed PWA (wasted space) | 🟡 Low |
| 16 | "Liquid Glass" theme name shown to users unexplained | 🟡 Low |
| 17 | No undo on delete toast | 🟡 Low |

---

## ✅ What Works Well

- Clear day-by-day trip structure
- AI trip status summary card ("מצב הטיול")
- Dark/Light/System theme switching
- PDF export option
- Group travel avatar badges (GA)
- AI "Build Smart Route" CTA placement

---

## Priority Fix List

| Priority | Bug | Action |
|---|---|---|
| 🔴 P0 | Changes not saved on refresh | Implement server sync / proper state persistence |
| 🔴 P0 | Deletion local-only | Call DELETE API endpoint; remove from server |
| 🔴 P0 | Delete dialog buttons hidden | Add `padding-bottom` + safe area to modal |
| 🔴 P0 | Content hidden behind nav bar | Add `padding-bottom` to all scroll containers |
| 🔴 P0 | Navigation state lost on refresh | Implement URL routing (e.g., `/trip/:id/day/:n`) |
| 🟠 P1 | Duplicate trips | Fix sync deduplication logic |
| 🟠 P1 | Blank loading screen | Add skeleton/spinner |
| 🟠 P1 | WCAG AA off by default | Follow system accessibility settings |
| 🟡 P2 | Localize all English strings | i18n pass |
| 🟡 P2 | Install PWA prompt | Add `beforeinstallprompt` handler |