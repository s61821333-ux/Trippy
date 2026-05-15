# 🧳 Trippy App — Full QA Testing Report
**As 5 Friends Planning a Tokyo Trip · Tested by: Alex, Maya, Ron, Dana, Yossi**
**Date: May 14, 2026 | App Version: v1.0.0 | Stack: Next.js · Zustand · Liquid Glass**

---

## 🔴 CRITICAL ISSUES (Must Fix Before Launch)

### 1. 💀 DB Sync Failure — Events Are Lost on Refresh
**Severity: BLOCKER**

All events added to the itinerary fail to persist to the database. Two console errors confirm this:
```
[addEvent] DB sync failed: Object
[addEvent] DB sync failed: Object
```
After navigating away and returning, all itinerary events (activities) are gone — "0 stops" on every day. The data only lives in Zustand local memory during the session.

**Root cause**: Missing Supabase Row Level Security (RLS) policies. The app itself shows a visible warning in the UI: `"⚠️ DB permissions — run RLS policies in Supabase dashboard"`.

**Fix**: Configure RLS policies in the Supabase dashboard for the `events` table. Grant authenticated users `INSERT`, `SELECT`, `UPDATE`, `DELETE` on their own trips' events.

---

### 2. 🔐 Security Warning Exposed to End Users
**Severity: CRITICAL**

The message `"⚠️ DB permissions — run RLS policies in Supabase dashboard"` appears **directly in the Expenses section UI** when a user adds an expense. This is a raw internal developer error exposed to real users, which: (a) reveals infrastructure details, (b) is confusing, (c) is embarrassing for a production launch.

**Fix**: Catch this error silently, log it to a monitoring service (e.g. Sentry), and show a user-friendly toast instead: "Couldn't save. Please try again."

---

## 🟠 HIGH PRIORITY BUGS

### 3. 🚪 Share/Invite Modal Has No Dismiss Mechanism
**Severity: HIGH**

The Share Trip bottom sheet cannot be closed by:
- Pressing `Escape`
- Clicking/tapping outside the sheet
- Only dismissible by dragging the handle (which also caused a timeout in our test)

This traps users, especially on desktop.

**Fix**: Add `onOverlayClick` and `onKeyDown (Escape)` handlers to the bottom sheet. Add a visible ✕ close button.

---

### 4. ⏰ Time Display Shows Reversed Format in RTL
**Severity: HIGH**

In Hebrew (RTL) mode, event time shows as `"10:00 – 09:00"` instead of `"09:00 – 10:00"`. The end time appears before the start time because the dash is not direction-aware.

**Fix**: Use a logical separator or explicitly order times with `dir="ltr"` on the time range span, regardless of the document direction.

---

### 5. 🔢 Expense Split Defaults to "2 People" for a Group Trip
**Severity: HIGH**

The expense splitter always defaults to "2 people" even when a trip has 5 members. A user who misses this setting will split costs incorrectly.

**Fix**: Auto-populate the "split by" count from the trip's confirmed member count (or at minimum, don't default to a specific number — use the total trip participants).

---

### 6. 🗺️ Map Icon Opens Duplicate External Tabs
**Severity: HIGH**

Clicking the map icon (🗗) on the Explore/Itinerary page opens **a new OpenStreetMap tab every single click** — we accumulated 3 tabs within seconds. There is no in-app map view at all.

**Fix**: Either (a) open an in-app map overlay/modal instead, or (b) at minimum debounce/prevent duplicate tab openings by checking if a tab for that URL is already open, or simply using `window.open(..., '_blank', 'noopener')` with a consistent window name target.

---

## 🟡 MEDIUM PRIORITY ISSUES

### 7. 🌐 Inconsistent Language Mixing in Pack (ציוד) Section
**Severity: MEDIUM**

In Hebrew mode, the packing item form has:
- Hebrew label: "שם הפריט" (correct)
- English placeholder: `"Assignee (e.g. Mom, Mark) — optional"` (wrong)

All placeholder text and labels should match the active language.

**Fix**: Translate the Assignee placeholder to Hebrew: `"מוטל על (למשל: אמא, מרק) — אופציונלי"`.

---

### 8. 🚨 "CRITICAL ITEMS UNPACKED" Banner is English-Only
**Severity: MEDIUM**

Even when the interface is set to Hebrew, the critical packing warning reads `"CRITICAL ITEMS UNPACKED ⚠️"` in English. This breaks the immersive Hebrew UX.

**Fix**: Add i18n translation key for this string: `"פריטים קריטיים לא ארוזים"`.

---

### 9. 📊 Packing Counter Shows Wrong Format: "1 פריטים מתוך 0"
**Severity: MEDIUM**

The packing progress counter briefly showed "1 פריטים מתוך 0" (1 items out of 0), which is logically impossible and grammatically incorrect (should be "מתוך 1" for the total, "0 ארוזים").

**Fix**: Ensure the counter reads `[packed] מתוך [total] פריטים` and verify that the reactive state updates total before packed count.

---

### 10. 🤖 AI Suggestions Use Wrong Context (Desert → City Mismatch)
**Severity: MEDIUM**

The AI suggestions for our Tokyo city trip recommended "desert bike tours" and "desert garden walks" because the trip background was set to "מדבר" (Desert). The AI suggestions engine appears to use the **background theme** instead of (or in addition to) the actual **destination country/city**.

**Fix**: AI suggestions should primarily use destination (`יפן / Japan`) for activity recommendations, not the decorative background type. Separate the visual theme from the AI context.

---

### 11. 🔄 Profile Name Change Not Saved
**Severity: MEDIUM**

We changed the organizer name from "Trippy" to "Alex" in Settings → My Profile, clicked שמור (Save), but after a page refresh the name reverted to "Trippy."

**Fix**: Ensure the profile name update is saved to Supabase (or at minimum to localStorage as fallback), and that it's re-loaded on session restore.

---

## 🔵 LOW PRIORITY / UX IMPROVEMENTS

### 12. 📱 Homepage Layout is Very Sparse
**Observation**: The homepage shows a centered narrow column (~600px wide) on a wide screen, with most of the viewport wasted as empty beige space. There's no visual hierarchy beyond the trip list.

**Suggestion**: Add a welcome hero section, recent activity feed, or trip highlights to better utilize the space. On wider screens consider showing a mini trip preview card.

---

### 13. 🌆 Trip Background: The Initial Default Is "Desert" 🏜️
**Observation**: When opening "Create New Trip", the default selected background is **מדבר (Desert)** — a niche choice. Most trips are city or beach trips.

**Fix**: Default to "עיר (City)" or make no pre-selection (require user to choose).

---

### 14. 💰 Budget Card Disappears After Page Reload
**Observation**: The "Est. Budget" green card (showing $1200) was visible before the reload but disappeared after. It only reappears once an expense is active in session.

**Fix**: Persist budget data to DB with the same fix as events, and always show the Budget card if `totalBudget > 0`.

---

### 15. ➕ Duration Picker Has Limited Options (Max: 2h)
**Observation**: The activity duration buttons only offer: 30m, 1h, 1h 30m, 2h. For flights, museum visits, or overnight stays, this is too restrictive.

**Fix**: Add longer presets (3h, 4h, 6h, 8h, custom) or allow direct manual entry in the duration field.

---

### 16. 📅 Date Format Inconsistency
**Observation**: Dates appear in multiple formats across the app:
- Trip list: `2026-06-15` (ISO)
- Dashboard: `Mon, Jun 15`
- Event time header: `Mon, Jun 15` ✓

**Fix**: Standardize date formatting across all views using a consistent locale-aware formatter (e.g. Intl.DateTimeFormat).

---

### 17. 🏷️ Category Buttons in Activity Form Are LTR-Only
**Observation**: The category chips (Flight ✈️, Food 🍴, Hotel 🏨, etc.) are always rendered LTR even in Hebrew RTL mode — the emoji is to the right of the English text, which looks correct, but in Hebrew mode these labels remain in English.

**Fix**: Translate category labels to Hebrew in Hebrew mode, or ensure consistent bilingual labels.

---

### 18. 🔗 The "Quick Invite Link" Button Has No Visual Feedback
**Observation**: Clicking "העתק קישור הזמנה" (Copy Invite Link) provides no toast/confirmation that the link was copied.

**Fix**: Show a brief "נוסל לועתק!" (Copied!) toast after the clipboard action.

---

## ✅ WHAT WORKS WELL

| Feature | Status |
|---|---|
| Trip creation flow | ✅ Smooth, validated, fast |
| Language switching (Hebrew ↔ English) | ✅ Instant, full RTL/LTR swap |
| Group invite via email (4/4 limit) | ✅ Works, pending status shown |
| Packing list with categories & critical flags | ✅ Functional, progress bar updates |
| AI suggestions (sparkle button) | ✅ Responsive and contextual |
| Night Owl Mode & Accessibility settings | ✅ Thoughtful, well-explained |
| Carbon Budget widget | ✅ Smart estimate for flights |
| Travel Vault for booking codes | ✅ Saves and displays correctly |
| Trip Insights (free time, meals, CO₂) | ✅ Excellent UX, real-time |
| Export to JSON / Markdown | ✅ Present and functional |
| "Airport to event" travel time prompt | ✅ Delightful smart UX feature |
| Progress bar on dashboard | ✅ Green, visible, percentage correct |

---

## 🔧 Priority Action List

| # | Fix | Priority |
|---|---|---|
| 1 | Enable Supabase RLS policies for `events` table | 🔴 CRITICAL |
| 2 | Hide DB error from UI, use Sentry + user-friendly toast | 🔴 CRITICAL |
| 3 | Add Escape + backdrop dismiss to bottom sheets | 🟠 HIGH |
| 4 | Fix RTL time display order (start–end, not reversed) | 🟠 HIGH |
| 5 | Default expense split to group member count | 🟠 HIGH |
| 6 | Prevent duplicate external map tab openings | 🟠 HIGH |
| 7 | Translate "Assignee" placeholder to Hebrew | 🟡 MEDIUM |
| 8 | Translate "CRITICAL ITEMS UNPACKED" | 🟡 MEDIUM |
| 9 | Fix packing counter display logic | 🟡 MEDIUM |
| 10 | Feed destination (not background) to AI suggestion engine | 🟡 MEDIUM |
| 11 | Persist profile name to DB / localStorage | 🟡 MEDIUM |
| 12–18 | UX polish items above | 🔵 LOW |

---

The app has a **solid foundation** — beautiful design, great UX flows, smart features like carbon tracking and AI suggestions. The single biggest blocker before going live is the **Supabase RLS configuration**: without it, all activity data is ephemeral and the security warning should never be visible to users. Fix that and address the modal dismiss issue, and you'll have a very impressive v1.0. 🚀