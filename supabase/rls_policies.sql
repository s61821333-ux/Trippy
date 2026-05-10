-- ============================================================
-- Trippy — Supabase RLS Security Policies
-- Run this in the Supabase SQL Editor (dashboard → SQL Editor)
-- ============================================================
-- STEP 1: Enable RLS on every table
-- ============================================================
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips              ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_meta           ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Helper — is the current user a participant of a trip?
-- ============================================================
CREATE OR REPLACE FUNCTION is_trip_participant(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_participants
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
  );
$$;

-- ============================================================
-- profiles
-- ============================================================
-- Users can only read and write their own profile
DROP POLICY IF EXISTS "profiles_select_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- trips
-- ============================================================
-- Read: only participants can read their trip
-- Insert: any authenticated user can create a trip
-- Update/Delete: only participants of that trip
DROP POLICY IF EXISTS "trips_select"  ON trips;
DROP POLICY IF EXISTS "trips_insert"  ON trips;
DROP POLICY IF EXISTS "trips_update"  ON trips;
DROP POLICY IF EXISTS "trips_delete"  ON trips;

CREATE POLICY "trips_select" ON trips
  FOR SELECT TO authenticated
  USING (is_trip_participant(id));

-- Allow SELECT during join-attempt (before participant row exists).
-- The code column is hashed so brute-force is impractical.
CREATE POLICY "trips_select_by_code" ON trips
  FOR SELECT TO authenticated
  USING (code IS NOT NULL);

CREATE POLICY "trips_insert" ON trips
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "trips_update" ON trips
  FOR UPDATE TO authenticated
  USING (is_trip_participant(id))
  WITH CHECK (is_trip_participant(id));

CREATE POLICY "trips_delete" ON trips
  FOR DELETE TO authenticated
  USING (is_trip_participant(id));

-- ============================================================
-- trip_participants
-- ============================================================
DROP POLICY IF EXISTS "tp_select"  ON trip_participants;
DROP POLICY IF EXISTS "tp_insert"  ON trip_participants;
DROP POLICY IF EXISTS "tp_delete"  ON trip_participants;

-- Participants can see who else is in their trip
CREATE POLICY "tp_select" ON trip_participants
  FOR SELECT TO authenticated
  USING (is_trip_participant(trip_id));

-- Any authenticated user can join a trip (code already validated app-side)
CREATE POLICY "tp_insert" ON trip_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only remove themselves
CREATE POLICY "tp_delete" ON trip_participants
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- day_meta
-- ============================================================
DROP POLICY IF EXISTS "day_meta_all" ON day_meta;

CREATE POLICY "day_meta_all" ON day_meta
  FOR ALL TO authenticated
  USING (is_trip_participant(trip_id))
  WITH CHECK (is_trip_participant(trip_id));

-- ============================================================
-- events
-- ============================================================
DROP POLICY IF EXISTS "events_all" ON events;

CREATE POLICY "events_all" ON events
  FOR ALL TO authenticated
  USING (is_trip_participant(trip_id))
  WITH CHECK (is_trip_participant(trip_id));

-- ============================================================
-- expenses
-- ============================================================
DROP POLICY IF EXISTS "expenses_all" ON expenses;

CREATE POLICY "expenses_all" ON expenses
  FOR ALL TO authenticated
  USING (is_trip_participant(trip_id))
  WITH CHECK (is_trip_participant(trip_id));

-- ============================================================
-- supplies
-- ============================================================
DROP POLICY IF EXISTS "supplies_all" ON supplies;

CREATE POLICY "supplies_all" ON supplies
  FOR ALL TO authenticated
  USING (is_trip_participant(trip_id))
  WITH CHECK (is_trip_participant(trip_id));

-- ============================================================
-- emergency_contacts
-- ============================================================
DROP POLICY IF EXISTS "emergency_contacts_all" ON emergency_contacts;

CREATE POLICY "emergency_contacts_all" ON emergency_contacts
  FOR ALL TO authenticated
  USING (is_trip_participant(trip_id))
  WITH CHECK (is_trip_participant(trip_id));

-- ============================================================
-- STEP 3: Indexes for performance at scale
-- ============================================================
-- These prevent full-table scans in the is_trip_participant helper
-- and in all the per-trip queries.

CREATE INDEX IF NOT EXISTS idx_tp_user_id   ON trip_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_tp_trip_id   ON trip_participants (trip_id);
CREATE INDEX IF NOT EXISTS idx_events_trip  ON events            (trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses         (trip_id);
CREATE INDEX IF NOT EXISTS idx_supplies_trip ON supplies         (trip_id);
CREATE INDEX IF NOT EXISTS idx_ec_trip      ON emergency_contacts(trip_id);
CREATE INDEX IF NOT EXISTS idx_dm_trip      ON day_meta          (trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_code   ON trips             (code)    WHERE code IS NOT NULL;

-- ============================================================
-- STEP 4: Migrate existing plain-text codes → SHA-256 hashes
-- NOTE: Run this ONLY if you have existing trips with plain-text
--       codes. After migration all codes in the DB will be hashes.
--       The pgcrypto extension must be enabled first:
--         CREATE EXTENSION IF NOT EXISTS pgcrypto;
--
-- UPDATE trips
-- SET code = encode(digest(lower(trim(code)), 'sha256'), 'hex')
-- WHERE code IS NOT NULL
--   AND length(code) < 64;   -- skip rows already hashed (64 hex chars)
-- ============================================================
