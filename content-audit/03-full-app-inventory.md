# Full App Content Inventory

Mapped: 2026-06-09
Coverage: All screens, components, and content files

---

## Content Architecture

All in-app text lives in one file: **lib/i18n.tsx**
- 530 English keys + 530 Hebrew keys = 1,060 strings total
- Served via `useI18n()` hook → `t('key')` in all components
- Falls back to English if Hebrew key is missing
- RTL layout controlled by `isRTL` from same context

Landing page content lives in **app/page.tsx** (inline T/FEATURES/FAQ/LEGAL objects, bilingual).

---

## Screen-by-Screen Inventory

### 1. Landing Page (app/page.tsx)
**Sections:** Header · Hero · Features · About · FAQ · Legal · CTA · Footer
**Languages:** Fully bilingual (inline, not i18n system)
**Content objects:** T, FEATURES (6 cards), FAQ (5 Q&As), LEGAL (4 items)

Key strings by section:
| Section | EN key text | HE key text |
|---------|-------------|-------------|
| Eyebrow | "Free group trip planning" | "תכנון טיולים קבוצתי — בחינם" |
| H1 | "Plan trips. Together." | "תכננו טיולים. ביחד." |
| Hero body | "One shared plan your whole crew..." | "תוכנית משותפת אחת שכל הקבוצה..." |
| Trust pills | "Completely free / No app to download / Works on any device" | "חינמי לחלוטין / ללא הורדת אפליקציה / עובד בכל מכשיר" |
| CTA | "Where are you headed?" | "לאן הפעם?" |

---

### 2. Home / Trip List (Home_V2.tsx)
**Purpose:** Shows the user's trips, create/join flow
**i18n keys used:** myTrips, createNewTrip, joinTrip, joinBtn, createBtn, emptyTrips, resumeTrip, daysRemaining, backgroundLabel, startDateLabel, countriesLabel, numDays, chooseCodeOptional, createPlaceholderName, createPlaceholderNick, joinPlaceholderName, joinPlaceholderCode, joinPlaceholderNick, reduceDaysWarning, signInPrompt, signInWithGoogle, webViewWarning, registerNudgeTitle, registerNudgeSub, tryDemo

**Hardcoded strings NOT in i18n:**
- Theme labels: 'Desert', 'Nature', 'City', 'Beach', 'Mountain', 'Lake', 'Sunset' (+ Hebrew equivalents inline)
- Error fallbacks: "End date must be after start date" / "תאריך הסיום חייב להיות אחרי תאריך ההתחלה"
- "Not signed in — please sign out and sign in again"
- App version footer: "Trippy · v2.0 · Liquid Glass"

---

### 3. Dashboard (Dashboard_V2.tsx)
**Purpose:** Trip overview — hero, today, insights, budget, calendar
**i18n keys used:** activeTrip, navCamp, tripInsights, noActivitiesYet, startPlanningCta, planDay1, todayLabel, nextEvent, comingUp, noUpcomingEvents, seeAll, viewSuggestions, aiAnalysisLabel, dayBudget, tripBudget, tapToSetLimit, budgetSheetTitle, totalSpent, addExpenseLabel, descriptionLabel, amountLabel, paidByLabel, youLabel, expenseHistoryLabel, deleteExpenseLabel, expenseRemovedToast, budgetSavedToast, validExpenseError, inviteLinkCopied, couldNotCreateInvite, oneDayConflict, manyDaysConflict, conflictDesc, oneDayPacked, manyDaysPacked, packedDesc, gapTitle, gapDesc, relaxTitle, relaxDesc, foodTitle, foodDesc, ecoTitle, ecoDesc, packedTitle, packedDesc2, oneDayEmpty, manyDaysEmpty, oneDayEmptyDesc, manyDaysEmptyDesc, trackTitle, trackDesc

**Hardcoded strings NOT in i18n:**
- Destination intel category labels: Currency, Tipping, Customs, Safety, Power, Emergency / מטבע, טיפים, נימוסים, בטיחות, חשמל, חירום
- Status chip: "DAY {n}" 
- Budget category names: food, cafe, transport, flight, attraction, hotel, shopping, beach, nightlife, museum, hiking, other (inline arrays, bilingual)
- Month abbreviations from toLocaleDateString()

---

### 4. Day Detail (DayDetail_V2.tsx)
**Purpose:** Single day view — timeline, events, map, hotels
**i18n keys used:** backToDashboard, day, tapToAdd, addEvent, editEvent, eventName, startTime, duration, category, locationOpt, notesOpt, costLabel, costPlaceholder, cancel, saveChanges, eventAdded, eventUpdated, eventRemoved, suggestBtn, aiSuggestions, aiSugSub, scanningNearby, noSuggestions, noMoreSuggestions, tryAddingEvents, dismiss, addToDay, tagsLabel, tagsOptional, tagsPlaceholder, editDaySubtitle, editDayCityLabel, editDayCityPlaceholder, emojiLabel, dayUpdated, driveToAirportTitle, driveToAirportSub, drivingTimeLabel, customMinutesPlaceholder, skipBtn, addDriveBtn, driveAddedToast, estimatingTravel, estimatedTravelTime, moveToTime, confirmMove, conflictWarning, goldenHourSunset, goldenHourSunrise, undoLabel, removedSuffix, movedToSuffix, quickDriveLabel, quickMealLabel, quickCoffeeLabel, quickRestLabel, quickGasLabel, routeConnector.*, timezoneBadge.*, worldClock.*

**Hardcoded strings NOT in i18n:**
- Category names in event form (flight, food, cafe, transport, attraction, museum, hotel, rest, beach, sport, concert, theme_park, other + ~20 extended) — inline bilingual arrays
- Duration presets: '30m', '1h', '1h 30m', '2h', '3h', '4h', '6h', 'Custom' / 'מותאם'
- "Open in Google Maps" button text
- "Open in Maps" FAB text

---

### 5. Packing (Packing_V2.tsx)
**Purpose:** Shared packing list with categories and progress
**i18n keys used:** adventurePrep→"Pack check" (updated), suppliesLabel, packList, addItem, itemNamePlaceholder, packed, allPacked, almostThere, packedShared, packCatAll, packCatDocuments, packCatGear, packCatHealth, packCatFood, packCatDrinks, packCatOther, criticalItemsUnpacked, criticalBadge, markCritical, unmarkCritical, criticalBlocksBar, estCost, assigneePlaceholder, itemAdded, itemRemoved, of, items, noItemsCategory

**Hardcoded strings NOT in i18n:**
- "Your packing list is empty"
- "Add items you'll need for this trip"
- "+ Add your first item"
- AI sheet: "Building your packing list…" / "בונה את רשימת הציוד שלכם…"
- "Select all" / "Deselect all" in AI suggestions sheet
- "PACKED · {count}" section divider
- Category keywords for auto-detection (not displayed, internal logic)

---

### 6. Map (Map_V2.tsx)
**Purpose:** Interactive Leaflet map of all trip stops
**i18n keys used:** mapTitle, mapNoEvents, mapNoEventsHint, mapEventCount, mapEventCountPlural, mapAllDays, mapDay, map.noCoords, close

**Hardcoded strings NOT in i18n:**
- Search bar placeholder: "Search events…" / "חפש פעילויות…"
- Count badge: "{visible}/{total}"
- Day filter: "ALL" / "הכל"
- "Open in Maps" FAB
- "Opened in Google Maps ✓" toast
- "Go to Day" / "עבור ליום" on event card overlay
- "Maps" button in selected event card

---

### 7. Crew (Crew_V2.tsx)
**Purpose:** Group management — invite, view members, manage invitations
**i18n keys used:** gatherTheTribe→"Get everyone in" (updated), gatherSubtitle→"travel together" (updated), crewTitle, crewMembers, crewOwnerLabel, crewMemberLabel, crewInviteTitle, crewInviteByEmail, crewCopyLink, crewPending, crewNoMembers, crewKickMember, invitations, invitedToJoin, acceptBtn, rejectBtn, inviteByEmail, inviteEmailPlaceholder, sendInvite, inviteSent, inviteFailed, quickLinkLabel, copyLink, linkCopied, noLink, inviteLimitReached, pendingLabel, cancelInvite, crew.linkCopied, currentCrew, generatingLink, inviteByEmailLabel, sendInvitesBtn, orMagicLink

**Hardcoded strings NOT in i18n:**
- "(you)" badge next to own name
- Trip invite link preview: "trippy.app/j/…" (generated)
- "OR" divider between email and link sections

---

### 8. Settings (Settings_V2.tsx)
**Purpose:** Trip config, language, appearance, data management
**i18n keys used:** setupTitle, setupSub, tripInfo, nameLabel, daysLabel, startLabel, eventsLabel, participantsLabel, myProfile, languageLabel, english, hebrew, exportTrip, exportJSON, exportJSONSub, exportMD, exportMDSub, exportPDF, exportPDFSub, aboutLabel, leaveTrip, saveBtn, shareTrip, shareSub, tripUpdated, darkMode, lightMode, appearanceLabel, accessibilityLabel, highContrast, highContrastSub, reduceMotion, reduceMotionSub, displayLabel, hideTravelVault, hideTravelVaultSub, hideBudget, hideBudgetSub, carbonBudget, carbonBudgetSub, nightOwlLabel, nightOwlSub, nightOwlStandard, nightOwlLate, nightOwlExtreme, dayBoundaryUpdated, emergencyHubLabel, emergencyHubSub, emergencyNamePlaceholder, emergencyPhonePlaceholder, emergencySaved, contactRemoved, noEmergencyContacts, medical, embassy, personal, insurance, enterNamePhone, aboutApp, aboutVersion, aboutStack, currencyLabel, currencyChanged, deleteAccount, deleteAccountConfirm, deleteAccountSuccess, deleteAccountFailed, appVersion, appStack

**Hardcoded strings NOT in i18n:**
- "Enter a trip name"
- "Trip updated ✓"
- "Dashboard" / "לוח בקרה" (for settings back-nav)
- Appearance option labels: 'Light', 'Dark', 'System' / 'בהיר', 'כהה', 'מערכת'
- "Account Security" / "אבטחת חשבון"
- "MFA, passkeys & more" / "MFA, Passkeys ואפשרויות נוספות"
- Delete confirmation dialog text (not in i18n — uses deleteAccountConfirm key but warning text is inline)

---

### 9. Trip Vault / Notes (NotesScreen.tsx)
**i18n keys used:** travelNotes, travelNotesSub, addNote, notePlaceholder, noNotes, navNotes

---

### 10. Wish List (WishlistSheet.tsx)
**i18n keys used:** wishlistTitle, wishlistEmpty, wishlistAdd, wishlistSchedule, wishlistScheduleHint, wishlistScheduled

**Hardcoded strings NOT in i18n:**
- "Places you want to visit" / "מקומות שאתה רוצה לבקר" (subtitle)
- "Place or activity name" placeholder
- "e.g. Louvre Museum, street food…" placeholder
- Category labels: Attraction, Food, Museum, Beach, Hiking, Shopping, Nightlife, Cafe, Art, Nature, Spa, Other (inline arrays)
- "Duration: {X}h {Y}m" in schedule sheet
- "has events" flag tooltip
- "Add to wish list" / "הוסף" (button)
- Hotel context hint in schedule sheet

---

### 11. AI Plan Sheet (PlanWithAISheet.tsx)
**Hardcoded strings NOT in i18n (all bilingual inline):**
- "Plan my trip with AI" / "תכנן את הטיול שלי עם AI"
- "What's your vibe?" / "מה הסגנון שלכם?"
- Vibe options: Explorer, Relaxed, Foodie, Budget-smart, Balanced (also in i18n as vibe.*)
- "What are you most excited about?" / "מה הכי מרגש אתכם?"
- Interest tags: food, nature, culture, adventure, nightlife, shopping, art, sports
- "Generate my plan" / "צרו לי תוכנית"
- "Generating your itinerary…" / "בונה את המסלול שלכם…"
- "Add all to Day {n}" / "הוסף הכל ליום {n}"

---

### 12. NavBar (NavBar_V2.tsx)
**i18n keys used:** navCamp, navExplore, navPack, navSetup, navNotes, navMap, navCrew, notes, logout, switchTrip, settings, wishlist

**Hardcoded strings NOT in i18n:**
- "More" / "עוד" — overflow menu label

---

### 13. Security & MFA (SecuritySettings.tsx, MFAChallenge.tsx)
**Mostly hardcoded bilingual strings:**
- "Two-Factor Authentication" / "אימות דו-שלבי"
- "Authenticator app" / "אפליקציית אימות"
- "Scan this QR code" / "סרוק את קוד ה-QR"
- "Verify code" / "אמת קוד"
- "Setup complete" / "ההגדרה הושלמה"
- "Enter the 6-digit code" / "הכנס את הקוד בן 6 הספרות"

---

## Hardcoded Strings That Should Move to i18n

Priority items for future i18n integration:

| Priority | Screen | String |
|----------|--------|--------|
| High | Packing | "Your packing list is empty" + sub-text |
| High | AI Plan Sheet | All strings (completely unlocalized) |
| High | Wishlist | Subtitle, category labels, "Duration:" prefix |
| Medium | DayDetail | Event category names, duration presets |
| Medium | Dashboard | Destination intel category labels |
| Medium | Map | Search placeholder, "Go to Day", "Open in Maps" |
| Low | Settings | "Account Security", appearance option labels |
| Low | NavBar | "More" overflow label |
| Low | Security | All MFA strings |

---

## Demo Data Strings (lib/mockData.ts)

All demo trip content (event names, locations, AI suggestions) is stored as raw strings in mockData.ts and translated via i18n key lookup. The i18n.tsx file contains matching keys for each demo string in both EN and HE.

Demo trip: "Negev Desert Adventure" (3 days, 3 participants: Yoav, Dana, Miri)
Demo locations: Mitzpe Ramon, Ramon Crater, Avdat Valley, Dead Sea, Timna, Eilat
Demo AI suggestions: Alpaca Farm, Desert Bistro & Coffee, Camel Crossing Viewpoint, Bedouin Hospitality Tent

---

## Manifest & Meta (public/manifest.json)

```json
{
  "name": "Trippy",
  "short_name": "Trippy",
  "description": "AI-powered collaborative trip planner"
}
```

**Issues:**
- "AI-powered" in description — adds no useful information, generic
- "Friendly" is vague
- Suggested: `"description": "Free group trip planner — shared itinerary, budget, and map."`

---

## Summary Stats

| Source | EN strings | HE strings | Issues found |
|--------|-----------|-----------|--------------|
| lib/i18n.tsx | 530 | 530 | 9 (fixed) |
| app/page.tsx | ~80 | ~80 | 4 (fixed) |
| Hardcoded in components | ~120 | ~80 | 0 critical, 15 i18n-worthy |
| Demo data | 28 | 28 | 1 fixed (unforgettable) |
| Manifest | 3 | — | 1 recommendation |
| **TOTAL** | **~760** | **~720** | **13 fixed** |
