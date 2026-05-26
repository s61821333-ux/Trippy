# TRIPPY V2 — SECURITY CREW

> **Owner:** Security & Auth  
> **Branch:** `v2/security`  
> **Reads:** `00_GLOBAL.md` first  
> **Priority:** Security fixes may merge directly to `main` — see `00_GLOBAL.md §1`

---

## 1. AUDIT SUMMARY

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 4 | Must fix before any v2 work ships |
| High | 7 | Fix in Phase 1 (weeks 1–2) |
| Medium | 8 | Fix in Phase 2 (weeks 3–6) |
| **Total** | **19** | |

---

## 2. CRITICAL VULNERABILITIES

### C-1: `getSession()` Instead of `getUser()` — All API Routes

**File:** `lib/db.ts:53` and every API route that reads auth  
**CVSS:** 9.1 (Critical)

```typescript
// ❌ CURRENT — reads from localStorage, never re-validates JWT
const { data: { session } } = await supabase.auth.getSession();

// ✅ FIX — cryptographically verified against Supabase auth server
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

**Why it's critical:** A user with a revoked/expired session still passes `getSession()` because it reads a cached JWT from `localStorage`. Any revoked account retains API access until the token naturally expires.

**Fix scope:** All 11 API routes: `/api/trips`, `/api/events`, `/api/expenses`, `/api/supplies`, `/api/weather`, `/api/places`, `/api/route-time`, `/api/invite`, `/api/pdf`, `/api/suggest`, `/api/invitations`.

---

### C-2: `/api/route-time` Has No Authentication

**File:** `app/api/route-time/route.ts`  
**CVSS:** 8.6 (Critical)

The route accepts arbitrary `origins[]` and `destinations[]` arrays and forwards them directly to Google Distance Matrix API. No session check, no rate limit, no ownership verification.

**Impact:** Anyone can call this endpoint to burn your Google Maps quota (up to $200 free tier, then billed). A single automated script making 1,000 calls/minute would exhaust the monthly budget in hours.

```typescript
// Add at the top of route.ts, BEFORE any Google API call:
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

---

### C-3: `/api/places` Has No Authentication

**File:** `app/api/places/route.ts`  
**CVSS:** 8.6 (Critical)

Same as C-2. The Places autocomplete API is called with no auth check. An anonymous caller can spam `?q=...` queries and burn the Places API quota.

**Fix:** Same pattern — add `getUser()` check at the top.

---

### C-4: `SUPABASE_SERVICE_ROLE_KEY` Used Client-Side Risk

**File:** `lib/db.ts` — verify the import chain  
**CVSS:** 9.8 if exposed (Critical)

If `lib/db.ts` is ever imported by a component without `'use server'` or inside a `'use client'` module, `SUPABASE_SERVICE_ROLE_KEY` can be leaked in the browser bundle. The service role key bypasses ALL Row Level Security.

**Audit steps:**
```bash
# Check if service role key appears in any client bundle:
grep -r "service_role" .next/static/ 2>/dev/null
grep -r "SUPABASE_SERVICE_ROLE_KEY" app/ lib/ --include="*.ts" --include="*.tsx"
```

**Fix:** All db.ts functions must only be called from API routes (never directly from client components). Add `'use server'` to `lib/db.ts` or move all DB calls behind API routes.

---

## 3. HIGH VULNERABILITIES

### H-1: No Trip Ownership Verification on Event Mutations

**Files:** `app/api/events/route.ts`, all mutation routes  
**Impact:** Any authenticated user can add/edit/delete events on any trip by guessing a `tripId`.

```typescript
// ❌ CURRENT — only checks auth, not trip membership
const { data: { user } } = await supabase.auth.getUser();
// immediately calls dbAddEvent(tripId, ...) with no membership check

// ✅ FIX — always verify trip membership
const { data: participant } = await supabase
  .from('trip_participants')
  .select('user_id')
  .eq('trip_id', tripId)
  .eq('user_id', user.id)
  .maybeSingle();
if (!participant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

**Applies to:** Every route that accepts a `tripId` parameter.

---

### H-2: Zod Validation Missing on Several Routes

**Files:** Varies by route  
**Impact:** Malformed payloads can cause unhandled exceptions, stack traces in responses, or unexpected DB behavior.

Required pattern for ALL routes:
```typescript
import { z } from 'zod';

const Body = z.object({
  tripId: z.string().uuid(),
  // ... other fields
});

const parsed = Body.safeParse(await request.json());
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
}
const { tripId } = parsed.data;
```

---

### H-3: `UpdateTripBody` Schema Mismatch

**Files:** `lib/schemas.ts:66` vs `lib/db.ts:386`  
**Impact:** `trip_notes` PATCH silently fails or corrupts data.

```typescript
// ❌ schemas.ts:66
trip_notes: z.string()  // single string

// ❌ db.ts:386 sends
{ tripNotes: string[] }  // array

// ✅ Fix — align to array
trip_notes: z.array(z.string()).optional()
```

---

### H-4: `window.__trippyStore` Debug Exposure

**File:** `lib/store.ts` (development mode)  
**Impact:** Auth tokens, trip data, and user PII exposed to browser console and any injected scripts (XSS lateral move).

```typescript
// Remove entirely — or gate strictly:
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // (window as any).__trippyStore = useAppStore; // REMOVE THIS LINE
}
```

---

### H-5: Invite Token Has No Expiry Enforcement

**File:** `lib/db.ts` — `dbGetOrCreateInviteToken`  
**Impact:** A leaked invite link is valid forever.

**Fix:** Add `expires_at` column to `trip_invitations` table, default 7 days. Reject expired tokens in `dbAcceptInvitation`:

```sql
ALTER TABLE trip_invitations ADD COLUMN expires_at timestamptz DEFAULT now() + interval '7 days';
```

```typescript
// In dbAcceptInvitation:
if (new Date(invitation.expires_at) < new Date()) {
  throw new Error('Invite link has expired');
}
```

---

### H-6: No Rate Limiting on AI Suggestion Route

**File:** `app/api/suggest/route.ts`  
**Impact:** Each call invokes Anthropic API (costs money). Unlimited calls possible per user per minute.

**Fix:** Implement a simple per-user rate limit using Supabase's `requests` table or a lightweight in-memory store with `vercel/edge-rate-limit`:

```typescript
// Simple approach: track last call time in DB
const { data: lastCall } = await supabase
  .from('ai_rate_limits')
  .select('last_called_at')
  .eq('user_id', user.id)
  .maybeSingle();

if (lastCall && Date.now() - new Date(lastCall.last_called_at).getTime() < 10_000) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
}
```

---

### H-7: PDF Export Route Leaks Trip Data Without Ownership Check

**File:** `app/api/pdf/route.ts`  
**Impact:** Any authenticated user can export any trip's full itinerary (names, events, notes, expenses) by passing any `tripId`.

**Fix:** Same membership check as H-1.

---

## 4. MEDIUM VULNERABILITIES

### M-1: `dbGetTripEmailInvitations` Missing `created_at`

**File:** `lib/db.ts:431`

```typescript
// ❌ Current — missing created_at
.select('id, email, status')

// ✅ Fix
.select('id, email, status, created_at')
```

---

### M-2: Realtime Subscription Has No Origin Verification

**File:** `lib/store.ts:763`  
**Impact:** Malformed Supabase Realtime events could trigger `loadTripById` for arbitrary trip IDs (unlikely in practice but worth hardening).

```typescript
// Add guard:
channel.on('postgres_changes', { ... }, (payload) => {
  const changedTripId = payload.new?.id ?? payload.old?.id;
  if (changedTripId !== get().tripDbId) return;  // ignore other trips
  loadTripById(get().tripDbId);
});
```

---

### M-3: No CSRF Protection on Mutation Routes

Next.js App Router API routes don't get CSRF protection by default. Add a `SameSite=Strict` check or use Next.js middleware:

```typescript
// middleware.ts
if (request.method !== 'GET') {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !origin.includes(host ?? '')) {
    return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  }
}
```

---

### M-4: `console.log` Leaking Auth Data in Production

**Files:** Scattered throughout store.ts, db.ts  
**Fix:** Add ESLint rule `no-console: ['error', { allow: ['warn', 'error'] }]` and run `npm run lint --fix`.

---

### M-5: Supabase RLS Policies — Verify Applied

**Status:** Policies were written but must be confirmed applied in Supabase dashboard.

**Audit query (run in Supabase SQL Editor):**
```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('trips', 'trip_participants', 'trip_invitations', 'trip_events')
ORDER BY tablename, cmd;
```

Expected policies per table:
- `trips`: SELECT/UPDATE/DELETE where user is in `trip_participants`
- `trip_participants`: SELECT where `user_id = auth.uid()`
- `trip_invitations`: SELECT/INSERT/UPDATE where `trip_id` in user's trips

---

### M-6: No Input Sanitization on Event `name` / `location`

**Impact:** If any field is rendered as `dangerouslySetInnerHTML` (check), stored XSS is possible.

**Fix:** Audit all JSX — if any field is rendered directly via `innerHTML`, sanitize with DOMPurify. If rendered as React text nodes, React auto-escapes so this is lower risk.

---

### M-7: Weather API Key Exposed to Client Bundle Risk

**File:** `app/api/weather/route.ts` — verify `OPENWEATHER_API_KEY` is `NEXT_PUBLIC_` vs private

If the key uses `NEXT_PUBLIC_` prefix, it's in the client bundle. Fix: ensure weather calls go through the API route only, never from the client directly.

---

### M-8: Trip Deletion Doesn't Cascade Supply/Expense Delete

**File:** `lib/db.ts` — `dbDeleteTrip`  
**Impact:** Orphaned rows remain in DB after trip deletion (data leak, quota growth).

**Fix:** Add `ON DELETE CASCADE` to foreign keys, or explicitly delete in the function:

```sql
ALTER TABLE trip_supplies ADD CONSTRAINT fk_trip CASCADE;
ALTER TABLE trip_expenses ADD CONSTRAINT fk_trip CASCADE;
```

---

## 5. ROW LEVEL SECURITY — FULL POLICY SET

Apply these in Supabase SQL Editor on staging, then production:

```sql
-- Enable RLS on all tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;

-- trips: readable/editable by participants only
CREATE POLICY "trip_select" ON trips FOR SELECT
  USING (id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()));

CREATE POLICY "trip_update" ON trips FOR UPDATE
  USING (id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()));

-- trip_participants: users can see their own memberships
CREATE POLICY "participant_select" ON trip_participants FOR SELECT
  USING (user_id = auth.uid());

-- trip_events: accessible to trip members
CREATE POLICY "event_select" ON trip_events FOR SELECT
  USING (trip_id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()));

CREATE POLICY "event_insert" ON trip_events FOR INSERT
  WITH CHECK (trip_id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()));

CREATE POLICY "event_update" ON trip_events FOR UPDATE
  USING (trip_id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()));

CREATE POLICY "event_delete" ON trip_events FOR DELETE
  USING (trip_id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()));
```

---

## 6. REMEDIATION PHASES

### Phase 1 — Ship to `main` Immediately (Week 1)

| # | Fix | File | Hours |
|---|-----|------|-------|
| C-1 | Replace all `getSession()` → `getUser()` | All API routes | 2h |
| C-2 | Add auth to `/api/route-time` | route-time/route.ts | 0.5h |
| C-3 | Add auth to `/api/places` | places/route.ts | 0.5h |
| C-4 | Audit service role key bundle exposure | lib/db.ts | 1h |
| H-1 | Add trip membership check to all mutation routes | 5 route files | 3h |
| H-4 | Remove `window.__trippyStore` | lib/store.ts | 0.25h |

### Phase 2 — Ship to `v2/security` (Week 2)

| # | Fix | File | Hours |
|---|-----|------|-------|
| H-2 | Add Zod validation to all routes | All routes | 4h |
| H-3 | Fix `UpdateTripBody` schema mismatch | schemas.ts, db.ts | 0.5h |
| H-5 | Add invite token expiry | db.ts + SQL migration | 1h |
| H-6 | Add rate limiting to AI route | suggest/route.ts | 2h |
| H-7 | Add ownership check to PDF route | pdf/route.ts | 0.5h |
| M-5 | Verify/apply all RLS policies | Supabase dashboard | 1h |

### Phase 3 — Ongoing (Weeks 3–6)

- M-1 through M-8 in order of impact
- Add `no-console` ESLint rule + fix violations
- Add CSRF middleware
- DB CASCADE deletes on trip removal

---

## 7. SECURITY HEADERS (Add to `next.config.ts`)

```typescript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://api.openweathermap.org",
    ].join('; '),
  },
];

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

---

## 8. ENVIRONMENT VARIABLE AUDIT

| Variable | Required | Location | Risk if Leaked |
|----------|----------|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Client OK | Low |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Client OK | Low (RLS protects) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server only | **Critical** — bypasses all RLS |
| `GOOGLE_MAPS_API_KEY` | ✅ | Server only | High — billing |
| `ANTHROPIC_API_KEY` | ✅ | Server only | High — billing |
| `OPENWEATHER_API_KEY` | ✅ | Server only | Medium — quota |

**Audit command:**
```bash
grep -r "NEXT_PUBLIC_" .env* 
# Ensure SUPABASE_SERVICE_ROLE_KEY, GOOGLE_MAPS_API_KEY, ANTHROPIC_API_KEY
# are NOT prefixed with NEXT_PUBLIC_
```
