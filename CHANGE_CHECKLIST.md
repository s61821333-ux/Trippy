# Post-Change Checklist

Run these checks after every code change before reporting it as done.

---

## 1. TypeScript — no type errors

```bash
npx tsc --noEmit
```

Fix every error before moving on. Type errors often surface runtime bugs.

---

## 2. Lint — no ESLint violations

```bash
npm run lint
```

Pay attention to Next.js-specific rules (missing `key` props, misused hooks, `<Image>` vs `<img>`, etc.).

---

## 3. Build — production build succeeds

```bash
npm run build
```

`next build` catches things `tsc` misses: missing `"use client"` / `"use server"` directives, bad imports across the server/client boundary, broken dynamic routes.

---

## 4. Server / Client boundary

For every file touched, confirm:

- Server Components do **not** import hooks (`useState`, `useEffect`, Zustand stores) or browser APIs.
- Client Components (`"use client"`) do **not** directly import Supabase server clients or call server-only code.
- API route handlers (`route.ts`) export only `GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS` — no default export.

---

## 5. Supabase — auth & RLS

After any change that touches auth, trip data, or invitations:

- Confirm the Supabase client used matches the context:
  - Server components / API routes → `createServerClient` (from `@supabase/ssr`)
  - Client components → `createBrowserClient`
- Check that RLS policies cover the affected table for both authenticated users and trip members (via token/invite flow).
- Verify the `user_id` or `trip_id` filter is always applied — never return all rows.

---

## 6. API routes — input validation & error handling

For every `route.ts` touched:

- Validate and parse the request body / query params before using them.
- Return proper HTTP status codes (`400` for bad input, `401` for unauthed, `403` for forbidden, `404` for not found, `500` for server errors).
- Never expose raw Supabase error messages or stack traces to the client.

---

## 7. Anthropic AI routes

For any change to `app/api/ai/**`:

- Confirm the stream/response is properly closed — no hanging promises.
- Check the prompt does not include unsanitized user input that could inject instructions.
- Verify API key is read from `process.env` and not hardcoded.

---

## 8. Environment variables

If a new `process.env.*` variable is referenced:

- Add it to `.env.local` (local) and document it so it's added to the deployment env too.
- Never commit `.env.local` or any file containing real secrets.

---

## 9. Zustand store — state consistency

After any store change:

- Confirm state updates are immutable (spread, not mutate).
- If a trip is updated locally, make sure the Supabase write either succeeds or the local state is rolled back.
- Confirm no stale state is shown after navigation (reset store slices when needed).

---

## 10. Dynamic routes — param handling

For `[tripId]`, `[token]`, etc.:

- Always validate the param exists and is the expected type before querying Supabase.
- Handle the "not found" case with a proper redirect or 404 response, not a crash.

---

## 11. Invitation / join flow

After any change to `app/join`, `app/api/invitations`, or `app/api/invite`:

- Test: generate a token → open the join link → confirm the user lands on the correct trip.
- Confirm tokens are single-use or expire as intended.
- Confirm an unauthenticated user is redirected to login and then back to the join URL.

---

## 12. UI smoke-test (golden paths)

Start the dev server (`npm run dev`) and manually test:

| Flow | What to verify |
|---|---|
| Login / sign-up | Auth completes, dashboard loads |
| Create trip | Trip appears in dashboard |
| Open trip | Days, notes, supplies tabs load |
| AI suggestions | Sheet opens, suggestions stream in |
| Invite link | Token generated, join page works |
| Settings | Changes save without errors |

Check the browser console and network tab — **zero unhandled errors, zero 4xx/5xx responses**.

---

## Quick reference — run order

```bash
npx tsc --noEmit   # types
npm run lint        # lint
npm run build       # build
# then manual smoke-test in browser
```
