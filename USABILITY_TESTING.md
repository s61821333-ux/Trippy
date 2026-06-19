# Trippy — Manual Usability Testing Guide

Hand this document to a real tester. Each section is one feature area.
For every test: follow the **Steps**, then check the **Expected result**.
Mark each line ✅ Pass or ❌ Fail. Note anything unexpected in the comments column.

---

## How to use this document

1. Open Trippy on a real device (or browser at full mobile size — 390 px wide).
2. Work through each section top to bottom.
3. You do **not** need a developer. Every test is a click / tap / type action.
4. If you see something unexpected that is not covered below, write it down anyway.

---

## Section 1 — App Boot

> Goal: the app loads fast and never shows a permanent spinner.

| # | Steps | Expected result |
|---|-------|-----------------|
| 1.1 | Open the app for the first time (no account). | A loading spinner appears briefly, then the landing / sign-in page loads. No white blank screen. |
| 1.2 | Sign in with your account. | The spinner disappears. You land on the home screen (your trips list) within 3 seconds. |
| 1.3 | Reload the page while signed in. | The app re-boots, shows the loading spinner briefly, then returns you to where you were. Never blank. |
| 1.4 | Leave the app in the background for a few minutes (mobile: switch apps). Then return. | The app is not stuck on a spinner. It resumes normally. |
| 1.5 | With the app open, turn off Wi-Fi completely, then reload the page. | The app still boots. You see your trips (from cache) even without a connection. No permanent spinner. |

---

## Section 2 — Home Screen (Trip List)

> Goal: the trips list is always usable; the user is never stranded.

| # | Steps | Expected result |
|---|-------|-----------------|
| 2.1 | Sign in and land on the home screen. | You see your name at the top ("Hi, [Name]") and a "Create new trip" button. |
| 2.2 | Look at the trips list. | Each trip shows its name, date range, and days count. No broken layout. |
| 2.3 | Sign in with an account that has no trips yet. | You see a compass icon and a message like "No trips yet" or "Start planning". The "Create" button is still visible. |
| 2.4 | Turn off Wi-Fi before opening the app. Sign in. | Your trips still appear (from cache). No endless spinner. |
| 2.5 | Force a network error (airplane mode after login, then pull-to-refresh or retry). | A "Try again" button appears. Tapping it re-fetches. No blank screen. |
| 2.6 | Tap "Try again" after a network error. When the network is restored. | Trips load and the error message goes away. |
| 2.7 | If you were inside a trip previously: open the app again. | A "Pick up where you left off" / "Resume trip" card appears at the top of the list, showing your last trip. |
| 2.8 | Tap the resume card or any trip row. | The app navigates into that trip's dashboard. The navbar appears at the bottom. |
| 2.9 | Look at the top-right corner of the home screen. | You see your initials (avatar circle) and a sign-out icon button. |

---

## Section 3 — Creating a Trip

> Goal: trip creation is smooth, validates correctly, and lands you in the new trip.

| # | Steps | Expected result |
|---|-------|-----------------|
| 3.1 | Tap "Create new trip". | A sheet slides up with the creation form. |
| 3.2 | Scroll the theme picker row. | You see 8 theme options (Desert, Nature, City, Beach, Mountain, Lake, Sunset, Space). Each has an icon. |
| 3.3 | Tap a theme that is not currently selected. | That theme gets a colored border and a checkmark. The previous selection is deselected. |
| 3.4 | Tap "Create" / the submit button without entering a trip name. | A message appears: "Enter a trip name" (or similar). The form does not submit. |
| 3.5 | Enter a trip name, set Start = today, End = earlier than today. | A message appears: "End date must be after start date". The form does not submit. |
| 3.6 | Set Start = June 1, End = June 7. | A label below the dates shows "7 days". |
| 3.7 | Add a country (e.g. Japan). | The currency selector auto-switches to JPY. The label says "Set from Japan – change anytime". |
| 3.8 | Manually change the currency to USD. | The auto-derive note disappears. The dropdown stays on USD even if you change the country again. |
| 3.9 | Fill all required fields and tap "Create". | A loading indicator appears on the button. The sheet closes and you land on the new trip's dashboard with your trip name visible. |
| 3.10 | Tap the ✕ / "Cancel" button in the create sheet without submitting. | The sheet closes. You are back on the home screen. No trip was created. |

---

## Section 4 — Navigation (NavBar)

> Goal: the navbar is always reachable and never overflows.

| # | Steps | Expected result |
|---|-------|-----------------|
| 4.1 | Open a trip. | A navbar appears at the bottom with icons for Dashboard, Day, Map, Packing, and a settings/more option. |
| 4.2 | Go back to the home (trip picker) screen. | The navbar disappears. It only shows inside a trip. |
| 4.3 | Inside a trip, tap each navbar icon one by one. | Each screen loads without crashing. The tapped icon stays highlighted (active state). |
| 4.4 | Hold the phone in portrait at 390 px width. | All navbar icons are visible. Nothing is cut off. No horizontal scrollbar. |
| 4.5 | Navigate to 3–4 different screens rapidly. | No crash, no blank screen, no stuck spinner. |
| 4.6 | After navigating to a new screen, check the browser tab title. | The title updates: e.g. "Day Planner – Trippy", "Settings – Trippy". |

---

## Section 5 — Dashboard

> Goal: the dashboard shows the right data and budget is interactive.

| # | Steps | Expected result |
|---|-------|-----------------|
| 5.1 | Open a trip and land on the dashboard. | You see the trip name, a budget gauge or stat block, and any logged expenses. |
| 5.2 | Look at the budget gauge / stat triplet. | It shows total budget, amount spent, and remaining. Numbers are readable. |
| 5.3 | Tap the budget number or gauge area. | A "Set budget" sheet opens with a number input. |
| 5.4 | Enter a new budget amount and tap "Save". | The sheet closes. The budget gauge updates to reflect the new amount. |
| 5.5 | If expenses exist: look at the expense list. | Each expense shows its label, amount, and category tag. |
| 5.6 | Spend more than the budget (add expenses totalling > budget). | A toast notification fires: "You've gone over budget by X". |
| 5.7 | Spend 80 % of the budget. | A toast fires: "80% of budget used, X remaining". |
| 5.8 | Open the dashboard in dark mode. | All text is readable. No invisible text (white on white / black on black). |
| 5.9 | Open the dashboard with a slow connection (throttle in dev tools). | A skeleton loader appears while data loads. It disappears once data arrives. |

---

## Section 6 — Day Detail

> Goal: events are visible, day switching works, adding events works.

| # | Steps | Expected result |
|---|-------|-----------------|
| 6.1 | Tap the "Day" tab in the navbar. | The day detail screen opens, showing Day 1 by default. |
| 6.2 | Look at the day header. | You see day number, date, and small pill buttons to switch days. |
| 6.3 | Tap a different day pill (e.g. Day 2). | The events list updates to show Day 2's events. |
| 6.4 | If a day has events: scroll down the list. | The list scrolls. Events do not overflow their cards. |
| 6.5 | Look for an "Add event" or "+" button. | It is visible on the day screen. |
| 6.6 | Tap "Add event". | A sheet or form opens to add a new event (title, time, type, etc.). |
| 6.7 | Fill in event details and save. | The new event appears in the day's list. |
| 6.8 | Tap an existing event. | It expands or opens a detail view where you can edit or delete it. |
| 6.9 | Delete an event. | The event disappears from the list. A save indicator may briefly appear. |

---

## Section 7 — Packing List

> Goal: items can be checked off, added, and the list stays usable on mobile.

| # | Steps | Expected result |
|---|-------|-----------------|
| 7.1 | Tap the "Packing" tab. | The packing list screen loads. |
| 7.2 | If items exist: look at the list. | Items are grouped by category. Checked items look visually different (strikethrough or dimmed). |
| 7.3 | Tap an unchecked item. | It becomes checked. The visual style changes immediately. |
| 7.4 | Tap a checked item. | It becomes unchecked again. |
| 7.5 | Tap "Add item" / "+". | An input field or sheet appears. |
| 7.6 | Type an item name and confirm. | The new item appears in the list. |
| 7.7 | Hold at 390 px width. | No text is cut off. No horizontal scrollbar. |
| 7.8 | Reload while on the packing screen. | After reload, the same checked/unchecked states are preserved. |

---

## Section 8 — Map

> Goal: the map loads and doesn't crash.

| # | Steps | Expected result |
|---|-------|-----------------|
| 8.1 | Tap the "Map" tab. | A map loads and fills the screen. |
| 8.2 | Pinch/zoom the map. | The map zooms smoothly. No crash. |
| 8.3 | If events have locations: look for pins on the map. | Location pins appear at the right places. |
| 8.4 | Tap a pin (if present). | A label or tooltip shows the event name. |
| 8.5 | Rotate the device or resize the window. | The map reflows and still fills the screen. No white strips or gaps. |

---

## Section 9 — Notes

> Goal: the notes screen is always reachable and saves correctly.

| # | Steps | Expected result |
|---|-------|-----------------|
| 9.1 | Navigate to the Notes screen (via More / settings icon in nav). | The notes screen loads. A text area or editor is visible. |
| 9.2 | Type some notes. | Text appears as you type. No keyboard covers the text. |
| 9.3 | Navigate away to another screen, then come back to Notes. | Your notes are still there. |
| 9.4 | Reload the app, then open Notes. | Your notes are preserved. |

---

## Section 10 — Settings

> Goal: all toggles work, sign-out works, nothing overflows.

| # | Steps | Expected result |
|---|-------|-----------------|
| 10.1 | Open Settings (gear icon or "More" in navbar). | Settings screen loads with a list of options. |
| 10.2 | Find the theme toggle. | Options are Light, Dark, System (or a similar toggle). |
| 10.3 | Tap "Dark". | The entire app switches to dark mode immediately. |
| 10.4 | Tap "Light". | The app switches back to light mode. |
| 10.5 | Tap "System". | The app matches the phone's OS dark/light setting. |
| 10.6 | Find the language toggle. | You see English and Hebrew options. |
| 10.7 | Switch to Hebrew. | The app switches to Hebrew text and right-to-left layout. |
| 10.8 | Switch back to English. | The app returns to English and left-to-right layout. |
| 10.9 | Look for "High contrast" or accessibility toggle. | It is present. Tapping it increases contrast (borders get bolder, colors become higher contrast). |
| 10.10 | Tap "Sign out". | You are immediately signed out and redirected to the landing page. |
| 10.11 | Hold at 390 px. | No horizontal scrollbar. Nothing is cut off. |

---

## Section 11 — Offline Mode

> Goal: the app never loses data when there is no connection.

| # | Steps | Expected result |
|---|-------|-----------------|
| 11.1 | While inside a trip, turn off Wi-Fi / enable airplane mode. | An orange/red banner appears at the top: "You're offline" or similar. |
| 11.2 | While offline, edit an event or add an expense. | The change appears in the app immediately. The banner may show "1 change pending". |
| 11.3 | Re-enable Wi-Fi. | The banner disappears. A toast fires: "Back online – 1 change synced ✓". |
| 11.4 | Make multiple changes while offline. | The banner shows the correct count (e.g. "3 changes pending"). |
| 11.5 | Go offline, make changes, then reload the page. | After reload, the offline changes are still visible (stored locally). |
| 11.6 | While online but something is saving: look at the bottom-right corner. | A small "Saving…" pill appears briefly while writes are in flight. It disappears when done. |

---

## Section 12 — Saving Indicator

> Goal: the user always knows when their data is being saved.

| # | Steps | Expected result |
|---|-------|-----------------|
| 12.1 | Add or edit any content (event, expense, note). | A small "Saving…" pill briefly appears. |
| 12.2 | Wait a moment. | The "Saving…" pill disappears, confirming the save completed. |
| 12.3 | Repeat several quick edits in a row. | The pill shows throughout, then disappears once all writes finish. |

---

## Section 13 — Joining a Trip via Invite Link

> Goal: a user can join a shared trip from an invite link.

| # | Steps | Expected result |
|---|-------|-----------------|
| 13.1 | Open a trip invite link (e.g. `https://trippy.app/join/ABCDE`). | You are redirected to the app. After sign-in, the trip loads automatically. |
| 13.2 | Open the invite link when already signed in. | You are taken directly into the trip without needing to sign in again. |
| 13.3 | Open a broken or expired invite link. | A friendly error message appears: "Could not load this trip – please try again." No crash. |

---

## Section 14 — Wishlist

> Goal: the wishlist sheet opens, shows items, and closes cleanly.

| # | Steps | Expected result |
|---|-------|-----------------|
| 14.1 | Inside a trip, find and tap the Wishlist button (star icon or similar in navbar). | A sheet slides up showing the wishlist. |
| 14.2 | Add a wishlist item. | It appears in the list. |
| 14.3 | Swipe down or tap the close button. | The sheet closes. You are back on the previous screen. |

---

## Section 15 — AI Assistant

> Goal: the AI menu opens, Haiko (chat) and Find (discovery) are accessible.

| # | Steps | Expected result |
|---|-------|-----------------|
| 15.1 | Inside a trip, find and tap the AI button (sparkle / robot icon in navbar). | An "AI menu" sheet appears with two options: Ask (Haiko) and Find. |
| 15.2 | Tap "Ask" / Haiko. | A chat interface opens. You can type a question. |
| 15.3 | Type a question and send it. | A response appears. No crash or blank chat. |
| 15.4 | Close the chat. | You return to the previous screen. |
| 15.5 | Tap "Find" from the AI menu. | A persona / discovery sheet opens, asking about travel mood or preferences. |
| 15.6 | Close the Find sheet. | You return to the previous screen. |

---

## Section 16 — RTL / Hebrew

> Goal: the Hebrew layout is correct and nothing overflows.

| # | Steps | Expected result |
|---|-------|-----------------|
| 16.1 | Switch language to Hebrew in Settings. | All text switches to Hebrew. The layout mirrors right-to-left (text starts on the right). |
| 16.2 | Check the trip list on the home screen in Hebrew. | Each trip row is readable. Nothing overflows or is cut off. |
| 16.3 | Open a trip and check the navbar in Hebrew. | All icons and labels are visible. No overlap or cutoff. |
| 16.4 | Open Settings in Hebrew. | All options are in Hebrew, right-aligned. No horizontal scrollbar. |
| 16.5 | Check the "Trippy." wordmark in Hebrew mode. | The wordmark is always left-to-right (brand name never reverses). |

---

## Section 17 — Accessibility

> Goal: the app is navigable by keyboard and screen reader.

| # | Steps | Expected result |
|---|-------|-----------------|
| 17.1 | On desktop, press Tab once when the app loads. | A "Skip to main content" link becomes visible at the top-left. |
| 17.2 | Press Enter on the skip link. | Focus jumps to the main content area. |
| 17.3 | Tab through the home screen. | Every interactive element receives focus in a logical order. Nothing is skipped. |
| 17.4 | Enable a screen reader (VoiceOver on iOS, TalkBack on Android). Navigate to a new screen. | The screen reader announces the new screen name (e.g. "Dashboard", "Settings"). |
| 17.5 | With the screen reader on: navigate the trip list. | Each trip row is announced with its name and date. |
| 17.6 | Check all images on the screen. | Every image has an alternative description (no image is announced as "unlabelled"). |
| 17.7 | Enable OS "Increase Contrast" in accessibility settings. | The app auto-enables high-contrast mode. Borders become more visible. |

---

## Section 18 — Security

> Goal: protected actions cannot be done without signing in.

| # | Steps | Expected result |
|---|-------|-----------------|
| 18.1 | While signed out, paste this URL in the browser: `[app-url]/api/trips/create` and press Enter. | You get a 401 or 403 error, not a success response. |
| 18.2 | Try to access `[app-url]?next=https://google.com`. | The browser stays on the Trippy domain. It does not redirect to Google. |
| 18.3 | Try to access `[app-url]/app?error=auth`. | The `error=auth` param is stripped from the URL. You are redirected to the landing page. |
| 18.4 | Sign out using the sign-out button. | You are immediately returned to the landing page. Pressing the browser back button does not take you back into the authenticated app. |

---

## Section 19 — Dark Mode

> Goal: the app looks correct in both light and dark mode.

| # | Steps | Expected result |
|---|-------|-----------------|
| 19.1 | Switch to dark mode in Settings. | The background is dark. All text is light and readable. No white boxes appear in the UI. |
| 19.2 | Switch back to light mode. | The background is light. All text is dark. No dark boxes linger. |
| 19.3 | Set theme to "System". Then change the OS to dark mode. | The app automatically switches to dark without needing a manual toggle. |
| 19.4 | In dark mode, open the Create Trip sheet. | The sheet is dark. Text fields and buttons are all visible. |
| 19.5 | In dark mode, open Settings. | All toggle states are visible. Nothing blends into the background. |

---

## Section 20 — Crash & Edge Cases

> Goal: the app gracefully handles unusual situations without crashing.

| # | Steps | Expected result |
|---|-------|-----------------|
| 20.1 | Navigate quickly between all tabs (tap Dashboard → Day → Map → Packing → Notes → Settings → Dashboard in under 3 seconds). | No crash. No blank screen. The final screen is visible and usable. |
| 20.2 | Open the app with very slow internet (throttle to Slow 3G in browser dev tools). | Each screen shows a skeleton loader or spinner. Content appears once loaded. No crash. |
| 20.3 | Try to create a trip with a very long name (200+ characters). | The app either accepts it or shows a limit message. It does not crash or distort the layout. |
| 20.4 | Add an expense with amount = 0. | The app either blocks it (with a message) or accepts it. It does not break the budget calculation. |
| 20.5 | Add an expense with a negative number. | The app either blocks it or accepts it. Budget display stays intact. |
| 20.6 | Sign out mid-way through editing something. | You are signed out cleanly. When you sign back in, the app resumes normally. |
| 20.7 | Clear the browser localStorage (Developer Tools → Application → Clear Storage). Reload. | The app boots fresh. You see the sign-in page or home with no corrupted state. |

---

## Tester notes

Use this space to write anything that felt wrong, confusing, or unexpected — even if no specific test covers it.

| # | Screen | What happened | Severity (Low / Medium / High) |
|---|--------|---------------|-------------------------------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

---

*Document version: 2026-06-19 — Covers Trippy v1 (all screens: Home, Dashboard, Day, Map, Packing, Notes, Settings)*
