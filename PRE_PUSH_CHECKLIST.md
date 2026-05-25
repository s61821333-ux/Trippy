# Pre-Push Quality Checklist

A systematic checklist to run before pushing any change to `main`. Work through every section that could be affected by your change. A single broken layer can silently corrupt data, lock users out, or cause pages to crash with no error message.

---

## How to Use This Document

1. Identify which sections are **in scope** for your change (see the quick-reference table at the bottom).
2. Work through every item in each relevant section. Check the box when verified, note failures inline.
3. Do not push if **any red-level item** is unchecked or failing.
4. Items marked ⚠️ are especially common sources of silent bugs — read their explanations carefully.

---

## 1. Build & TypeScript

These checks must pass for every push, no exceptions. A TypeScript error in production becomes a blank screen or a `500` with no helpful message.

### 1.1 Clean Build

```bash
npm run build
```

**What to look for:**
- Zero TypeScript errors in the output. Errors like `Type 'X' is not assignable to type 'Y'` will compile away in dev mode but crash at runtime in production.
- Zero `Export default` or missing-page warnings that indicate a route is broken.
- Zero "Module not found" errors — these mean an import points to a file you deleted, moved, or renamed.
- The build output should show `✓ Compiled successfully`. If it says `⚠ Compiled with warnings`, read every warning — some are fatal in production even if dev mode swallowed them.

**Why this matters:** Next.js App Router pre-renders pages at build time. A crash during build means the entire deploy is rejected on Vercel and the previous version stays live — but your local dev ran fine, so you may not notice without checking.

---

### 1.2 Linting

```bash
npm run lint
```

**What to look for:**
- No errors (warnings are acceptable but should be understood).
- Pay special attention to `react-hooks/exhaustive-deps` warnings. Missing dependencies in `useEffect` are the #1 cause of stale data bugs in this app — the component renders with old trip data because the effect doesn't re-run when the trip ID changes.
- `no-unused-vars` findings pointing to dead code from your change are fine to clean up now rather than accumulate.

---

### 1.3 TypeScript Strict Check (manual)

If you touched `lib/types.ts`, `lib/schemas.ts`, or any API route response shape, manually verify:

- Every caller that destructures the changed type still compiles (search for the type name with `Grep`).
- The Zod schema in `lib/schemas.ts` still matches the TypeScript type in `lib/types.ts` for the same entity. These can drift apart — Zod validates at runtime but TypeScript validates at compile time; if they disagree, you will get runtime validation failures that TypeScript never warned about.

---

## 2. API Routes

Every API route in `app/api/` follows the same contract: receive a request, authenticate the caller, validate the input, do database work, return a typed response. A break in any of these steps produces a `500`, an empty response, or silently returns wrong data.

### 2.1 Authentication Guard

**Every API route must authenticate before touching data.**

Open any API route you modified and confirm:

```ts
// Must appear before ANY Supabase query
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

⚠️ **Common mistake:** Moving the auth check to after a "cheap" query like fetching a trip name "just to improve error messages." This creates an unauthenticated read path. Even read-only leaks are a security violation.

---

### 2.2 Trip Ownership / Participant Guard

**For every route that reads or writes trip-scoped data, the caller must be a participant of that trip.**

Pattern to look for:

```ts
const { data: participant } = await supabase
  .from('trip_participants')
  .select('id')
  .eq('trip_id', tripId)
  .eq('user_id', user.id)
  .single()

if (!participant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

Without this check, any authenticated user who guesses a `tripId` UUID can read or write another user's trip data — RLS alone is not sufficient if the service-role key is used server-side.

---

### 2.3 Input Validation (Zod)

**Verify that every POST / PATCH / PUT route parses its body through a Zod schema before using any field.**

```ts
const parsed = mySchema.safeParse(await req.json())
if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
const { fieldA, fieldB } = parsed.data
```

⚠️ If you added a new optional field to an existing schema, check that the schema uses `.optional()` or `.default()` — otherwise existing clients that don't send the new field will get a `400` and all their saves will silently fail.

---

### 2.4 Response Shape Consistency

Every route must return JSON with a consistent shape. The frontend `lib/db.ts` expects specific field names.

For each route you changed, find the matching function in `lib/db.ts` and confirm:
- The field names in the API response match what `db.ts` destructures.
- If you renamed a DB column, the API response alias has been updated.
- If you added a new field, the TypeScript type in `lib/types.ts` has been updated.

---

### 2.5 Error Propagation

Verify every `try/catch` in modified routes returns a proper error response — not a silent `return` with no body, and not a `200` with `{ error: "..." }` (that makes errors invisible to the frontend).

```ts
// Correct
catch (error) {
  console.error('[route-name]', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

---

### 2.6 API Route Checklist Per Route Type

Go through each route you modified and tick these:

**Trip routes (`/api/trips`, `/api/trips/[tripId]`):**
- [ ] `GET /api/trips` returns only trips where the user is a participant
- [ ] `POST /api/trips/create` inserts both the trip row AND a `trip_participants` row for the creator in the same operation (missing the participant row locks the creator out of their own trip)
- [ ] `DELETE /api/trips/[tripId]` only succeeds if the requester is the `created_by` user, not just any participant
- [ ] `PATCH /api/trips/[tripId]` (leave trip) removes the participant row but does not delete the trip

**Event routes (`/api/trips/[tripId]/events`):**
- [ ] `POST` validates that `day_index` is within the trip's `days` range (0 to days-1)
- [ ] `POST` validates that `time` matches `HH:MM` format
- [ ] `DELETE` verifies the event belongs to this trip, not just that it exists

**Expense routes (`/api/trips/[tripId]/expenses`):**
- [ ] `POST` validates `amount` is a positive number
- [ ] `paid_by` references a valid participant name/id in this trip

**Supply routes (`/api/trips/[tripId]/supplies`):**
- [ ] Toggle (checked/critical) returns the updated item so the UI can optimistically reconcile
- [ ] `assignee` field accepts `null` to un-assign

**Hotel routes (`/api/trips/[tripId]/hotels`):**
- [ ] `PUT` replaces the entire hotels array atomically — verify it's not appending
- [ ] `check_in_day` and `check_out_day` are within the trip's day range

**Invitation routes (`/api/invitations`):**
- [ ] Sending an invite checks that the email is not already a participant
- [ ] Accepting an invite creates the `trip_participants` row
- [ ] Rejecting an invite updates status to `rejected` (not deletes) so the sender can see it was declined

---

## 3. Database & SQL

This section covers Supabase tables, RLS policies, and schema migrations. A misconfigured policy silently returns empty data — not an error, just nothing — which is much harder to debug than a `500`.

### 3.1 Migration Files Applied

If you added or modified any `.sql` file in `supabase/`:

- [ ] The migration has been run in the **Supabase Dashboard > SQL Editor** for your project.
- [ ] The migration has been run in any **staging environment** if applicable.
- [ ] The migration is **idempotent** (safe to run twice) — use `IF NOT EXISTS` for table/column creation, `CREATE OR REPLACE` for functions.

⚠️ **Common mistake:** Writing the SQL file but forgetting to apply it. The app then crashes because it queries a column that doesn't exist in production, while dev works fine because you applied it manually.

---

### 3.2 RLS Policy Coverage

Every table must have RLS enabled with explicit policies. Open `supabase/rls_policies.sql` and verify:

- [ ] Any new table you added appears in the RLS policy file with SELECT, INSERT, UPDATE, DELETE policies.
- [ ] The policies reference `auth.uid()` not a hardcoded user ID.
- [ ] `trip_participants` is the join table used to scope access to trip data — policies like `trip_id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid())` are the correct pattern.
- [ ] After applying a new policy, test in Supabase Dashboard > Authentication > Policies that the policy shows "enabled."

**Test query to run in Supabase SQL Editor after policy changes:**
```sql
-- Run as a specific user to verify they only see their own trips
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claim.sub = '<your-test-user-uuid>';
SELECT id, name FROM trips LIMIT 10;
```

---

### 3.3 New Columns

If you added a new column to an existing table:

- [ ] The column has a sensible `DEFAULT` so existing rows are not broken (a non-nullable column with no default fails on every existing row's next write).
- [ ] The column is nullable OR has a default — never add `NOT NULL` without a default to a table with existing data.
- [ ] The column is reflected in `lib/types.ts` with the correct TypeScript type (nullable columns should be typed as `T | null`, not just `T`).
- [ ] The column is handled gracefully in the UI when its value is `null` — old rows will have `null` until they are edited.

---

### 3.4 Query Correctness

For any Supabase query you wrote or modified:

- [ ] `.single()` is used only when you expect exactly one row. If the query can return zero rows, `.single()` will throw — use `.maybeSingle()` and handle `null`.
- [ ] `.select('*')` fetches all columns including large ones — prefer selecting only the columns you need for list queries.
- [ ] Array columns (like `hotels`, `tags`) use the correct Supabase operator: `.contains()` for "includes", `.eq()` for exact array match.
- [ ] Ordering (`.order()`) is applied to all list queries so the user sees consistent ordering and not random row order from Postgres.

---

### 3.5 Atomic Operations

Operations that must stay in sync should be wrapped in a Postgres transaction or handled with Supabase's `rpc()` calls:

| Operation | Must be atomic |
|---|---|
| Create trip + add creator as participant | Yes |
| Accept invitation + add to trip_participants | Yes |
| Delete trip + delete all related rows | Yes (use CASCADE in schema) |
| Update day metadata + related events | No (independent rows) |

- [ ] Verify that `trip create` inserts both the trip and the participant row — if the participant insert fails, the trip row should not exist.

---

## 4. Data Layer (`lib/db.ts`)

`lib/db.ts` is the single source of truth for how the frontend talks to the API. A mismatch here causes silent data loss — the save appears to succeed but nothing persists.

### 4.1 Request Method Match

For each function you modified in `db.ts`:
- [ ] The HTTP method (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`) matches the method accepted by the corresponding API route handler.
- [ ] The URL path exactly matches the route file path in `app/api/`.

---

### 4.2 Request Body Shape

- [ ] Every field sent in the request body is listed in the API route's Zod schema. Extra fields are stripped by Zod — if you added a field to `db.ts` but not to the schema, it is silently dropped.
- [ ] Date fields are serialized correctly. JavaScript `Date` objects must be converted to ISO strings before sending — Supabase expects `timestamptz` values as ISO-8601 strings.

---

### 4.3 Response Parsing

- [ ] The function destructures only fields that exist in the API response shape.
- [ ] Array responses are handled as arrays — if the API can return `null` (e.g., a trip with no events), the calling code handles `null ?? []`.
- [ ] Error responses are caught and surfaced to the caller, not silently swallowed. Pattern:

```ts
const res = await fetch(url, { ... })
if (!res.ok) throw new Error(await res.text())
return res.json()
```

---

### 4.4 Cache / Stale Data

- [ ] After a write operation (create/update/delete), the Zustand store is updated immediately so the UI reflects the change without requiring a full refetch.
- [ ] If you changed the data shape of an entity, verify the store update sets all fields — partial updates can leave stale sub-fields.

---

## 5. State Management (Zustand Stores)

The stores (`lib/stores/`) are the in-memory representation of all data. Bugs here affect every component that reads from the store.

### 5.1 Store Shape Matches Types

- [ ] If you changed a type in `lib/types.ts`, find every `set(state => ...)` call that constructs that type and verify it sets all required fields.
- [ ] If you added a new optional field, the initial state object in the store includes it (usually as `undefined` or `[]`).

---

### 5.2 Optimistic Updates vs. Confirmed State

The app uses optimistic updates (UI shows the change before the server confirms). Verify:

- [ ] On success: the store holds the server-returned value, not the locally-constructed value (server may add `id`, `created_at`, etc.).
- [ ] On failure: the optimistic update is rolled back. If you added a new optimistic update, there must be a corresponding rollback in the `catch` block.

---

### 5.3 Trip Switch Safety

When the user switches between trips, all trip-scoped store state must be cleared and reloaded:

- [ ] If you added a new field to `tripStore`, ensure it is reset when `loadTrip` / `clearTrip` is called.
- [ ] Stale data from trip A must not appear while trip B is loading (causes wrong data to flash briefly, then disappear — confusing and potentially alarming to users).

---

### 5.4 Concurrent Writes

Multiple participants can edit the same trip simultaneously. Verify:

- [ ] Your change does not assume it is the only writer. If you use an array index to identify an item (e.g., `events[2]`), replace it with the item's `id` — indices shift when another user adds/removes items.
- [ ] Deletes are by `id`, not by position.

---

## 6. Core User Flows (Manual Smoke Test)

Run through these flows in a browser against a real Supabase instance (dev or staging). Automated type checks cannot catch UI/UX regressions.

### 6.1 Authentication

- [ ] **Login:** Open the app in an incognito window. The login screen shows. Click "Sign in with Google". OAuth redirect completes. You land on the Dashboard.
- [ ] **Session persistence:** After login, hard-refresh the page (`Ctrl+Shift+R`). You remain logged in — you do not get redirected to the login screen.
- [ ] **Logout:** Navigate to Settings, click log out. You are redirected to the login screen. Navigating back does not show protected content.

---

### 6.2 Trip Management

- [ ] **Create trip:** From the Dashboard, create a new trip with at least 3 days, a start date, and one country. The trip appears in the trip list. Click it — it opens the day view.
- [ ] **Edit trip:** Change the trip name from Settings. Return to the Dashboard — the new name appears in the list.
- [ ] **Invite:** Send an invitation to a second test email. The invitation appears in the second account's pending invitations.
- [ ] **Accept invite:** Accept the invitation. The trip appears in the second account's trip list with the correct participant count.
- [ ] **Leave trip:** From the second account, leave the trip. The trip disappears from their list. From the first account, the participant count decreases.
- [ ] **Delete trip:** From the owner account, delete the trip. It disappears from all accounts. No orphan rows remain in related tables (verify in Supabase dashboard).

---

### 6.3 Events (Itinerary)

- [ ] **Add event:** On Day 1, add an event with a time, name, category, and optional cost. It appears on the timeline.
- [ ] **Edit event:** Click the event. Change the name and time. Save. The timeline updates with the new values.
- [ ] **Delete event:** Delete the event. It disappears immediately. Refresh the page — it is still gone (not just removed from local state).
- [ ] **Reorder / time conflict:** Add two events at overlapping times. Verify the UI shows the conflict indicator and does not crash.
- [ ] **Vote on event:** Vote on an event. The vote count increments. Refresh — the count persists.
- [ ] **Tags:** Add a tag to an event. Save. Reload — the tag persists.

---

### 6.4 Expenses

- [ ] **Add expense:** Add an expense with amount, description, and payer. It appears in the expense list.
- [ ] **Edit expense:** Change the amount. Verify the split calculation updates.
- [ ] **Delete expense:** Delete it. Verify the totals recalculate.
- [ ] **Currency:** Change the trip currency in Settings. Verify all expense amounts re-render in the new currency symbol.

---

### 6.5 Supplies (Packing List)

- [ ] **Add item:** Add a supply item. It appears unchecked in its category.
- [ ] **Check item:** Check the item. The checked state persists after page reload.
- [ ] **Mark critical:** Mark an item as critical. The visual indicator appears.
- [ ] **Assign item:** Assign the item to a participant. The assignee name appears.
- [ ] **Delete item:** Delete the item. Verify the category header hides if it was the last item.

---

### 6.6 Hotels

- [ ] **Add hotel:** Add a hotel stay for days 1–3 with a name and location.
- [ ] **Overlap check:** The UI correctly shows the hotel on those days.
- [ ] **Edit hotel:** Change the checkout day. The updated range reflects.
- [ ] **Delete hotel:** Remove the hotel. No orphan data remains.

---

### 6.7 Emergency Contacts

- [ ] **Add contact:** Add a medical emergency contact. It saves and reloads correctly.
- [ ] **Edit contact:** Change the phone number. Persists.
- [ ] **Delete contact:** Remove it. It is gone after reload.

---

### 6.8 Day Metadata

- [ ] **Set region:** On a day, set the region/emoji. It persists after reload and appears in the day header.
- [ ] **Set location:** Pin a day to a location (lat/lng). The weather widget shows that location's forecast (if within range).

---

### 6.9 AI Suggestions

- [ ] **Request suggestions:** On a day with at least one event, open the suggestions sheet. Suggestions load within a reasonable time (<10 seconds).
- [ ] **Add suggestion:** Click "Add" on a suggestion. It creates an event on that day. The event appears in the timeline.
- [ ] **Error state:** If the AI call fails (e.g., turn off network), the UI shows an error message — not a blank panel and not a crash.

---

### 6.10 Multi-User Collaboration

- [ ] Open the trip in two browser tabs (or two accounts). Add an event in tab A. Switch to tab B — either the event appears automatically (if real-time sync is active) or appears after a manual refresh (this is the expected baseline).
- [ ] Delete an event in tab A. Verify tab B does not crash when it tries to render the now-deleted event.

---

## 7. External Integrations

### 7.1 Anthropic Claude API

- [ ] `ANTHROPIC_API_KEY` is set in both local `.env.local` and Vercel environment variables.
- [ ] The suggestions prompt does not expose sensitive user data (trip names are fine; personal info like full names or exact home addresses should not be sent).
- [ ] The API route has a timeout and graceful error handling — a slow/failed AI call should not hang the request indefinitely.
- [ ] Token usage is reasonable — verify the prompt in `app/api/ai/suggestions/route.ts` does not include full trip history for every call (can accumulate large token counts as trips grow).

---

### 7.2 Google Places API

- [ ] `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` is set and the API is enabled in Google Cloud Console.
- [ ] Autocomplete results appear when typing a location in `PlacesInput`.
- [ ] Place detail lookup (for lat/lng) returns coordinates and does not crash when the API returns no result.

---

### 7.3 Weather API

- [ ] Weather appears for days with a lat/lng set on `day_meta`.
- [ ] Days without a location show a graceful empty/default state (not `undefined is not iterable`).
- [ ] API errors (rate limit, network) are caught and the weather widget shows a fallback, not a crash.

---

### 7.4 Exchange Rates

- [ ] Rates load correctly when the currency is changed.
- [ ] If the exchange rate API is down, expense amounts fall back to the base currency without crashing.

---

## 8. Security Checks

### 8.1 Environment Variable Leakage

- [ ] No secret key (`ANTHROPIC_API_KEY`, Supabase service role key, etc.) is imported in any file under `app/components/` or any file without `'use server'` / API route marker. These are sent to the browser.
- [ ] Only `NEXT_PUBLIC_` prefixed variables are used in client components. Server-only secrets must never have the `NEXT_PUBLIC_` prefix.

---

### 8.2 User Input Safety

- [ ] No user-provided string is interpolated directly into a Supabase query string (SQL injection). Use parameterized queries via the Supabase JS client (`.eq('col', value)` — not template literals in raw SQL).
- [ ] No user-provided HTML is rendered via `dangerouslySetInnerHTML`. If this is needed, the value must be sanitized first.

---

### 8.3 Trip Code / Invite Token Validation

- [ ] Invite tokens are validated server-side before granting access. The token must exist in the `trip_invitations` table, be in `pending` status, and match the email of the authenticated user.
- [ ] Expired or already-used tokens return a clear error, not a generic `500`.

---

## 9. Performance & UX

### 9.1 Loading States

- [ ] Every async operation that takes >200ms has a loading indicator. Users must never stare at a blank panel with no feedback.
- [ ] The `CompassLoader` or equivalent is shown while the initial trip data loads.
- [ ] Skeleton states (or at minimum a spinner) appear while events/supplies/expenses are fetching.

---

### 9.2 Empty States

- [ ] A trip with no events on a day shows a helpful "No events yet" prompt — not a blank timeline.
- [ ] A trip with no supplies shows an "Add your first item" prompt.
- [ ] A new user with no trips sees the "Create your first trip" onboarding, not a blank list.

---

### 9.3 Error Boundaries

- [ ] Any new data-fetching component you added is wrapped in an error boundary or has a `try/catch` around its render logic that shows a fallback UI instead of crashing the whole screen.

---

## 10. Accessibility & i18n

- [ ] New UI text is wrapped in the i18n helper (`lib/i18n.tsx`) if the app supports multiple languages.
- [ ] New interactive elements (buttons, inputs) have accessible labels (`aria-label` or visible text).
- [ ] Color-only information (e.g., red = critical) also has a text or icon indicator for users in high-contrast mode.
- [ ] The app is navigable with a keyboard (Tab, Enter, Escape) through any new modals or sheets you added.

---

## Quick-Reference: Which Sections to Check

| Change type | Sections required |
|---|---|
| API route added/modified | 1, 2, 3, 4 |
| Database column or table added | 1, 3 |
| SQL migration added | 3 |
| New UI component | 1, 5, 6 (relevant sub-flow), 9, 10 |
| Zustand store modified | 1, 4, 5 |
| `lib/db.ts` modified | 1, 4 |
| `lib/types.ts` or `lib/schemas.ts` modified | 1, 2.3, 4.1 |
| Authentication / auth flow | 1, 2.1, 8, 6.1 |
| External integration modified | 1, 7 |
| Security-sensitive change | 2, 3.2, 8 |
| Invitation / sharing flow | 2.2, 2.6, 3.5, 6.2, 8.3 |
| Any push to `main` | 1 (always) |

---

## Final Gate

Before creating the pull request or pushing directly to `main`, answer these five questions:

1. **Can a user sign in, create a trip, add an event, and see it after a hard refresh?**
2. **Can two participants share a trip without seeing each other's other trips?**
3. **Does the build pass with zero TypeScript errors?**
4. **Is every new column or table covered by an RLS policy?**
5. **Does every external API call have a graceful error fallback?**

If the answer to any of these is "no" or "I'm not sure," do not push. Fix the issue first.
