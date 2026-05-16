-- ============================================================
-- Trippy — Supabase RLS Security Policies
-- Run this in the Supabase SQL Editor (dashboard → SQL Editor)
-- ============================================================
-- STEP 1: Enable RLS on every table
-- ============================================================
ALTER TABLE trips              ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_meta           ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Add created_by to trips (idempotent)
-- Needed so trips_insert can check (created_by = auth.uid())
-- instead of WITH CHECK (true).
-- ============================================================
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- ============================================================
-- STEP 3: Helper — is the current user a participant of a trip?
-- Lives in the `private` schema so PostgREST never exposes it
-- via /rest/v1/rpc/, eliminating the SECURITY DEFINER lint
-- warnings while keeping SECURITY DEFINER (required to avoid
-- circular-recursion when the policy calls back into
-- trip_participants).
-- ============================================================
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_trip_participant(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_participants
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
  );
$$;

-- Authenticated users need EXECUTE so RLS policies work.
-- Anon users do not.
GRANT  EXECUTE ON FUNCTION private.is_trip_participant(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION private.is_trip_participant(uuid) FROM anon;

-- Drop the old public helper (CASCADE removes all dependent policies so
-- the CREATE POLICY statements below can recreate them cleanly).
DROP FUNCTION IF EXISTS public.is_trip_participant(uuid) CASCADE;

-- ============================================================
-- trips
-- ============================================================
DROP POLICY IF EXISTS "trips_select"           ON trips;
DROP POLICY IF EXISTS "trips_select_by_code"   ON trips;
DROP POLICY IF EXISTS "trips_insert"           ON trips;
DROP POLICY IF EXISTS "trips_update"           ON trips;
DROP POLICY IF EXISTS "trips_delete"           ON trips;

CREATE POLICY "trips_select" ON trips
  FOR SELECT TO authenticated
  USING (private.is_trip_participant(id));

-- created_by is set to auth.uid() by DEFAULT, so this check
-- is always satisfiable and not trivially true.
CREATE POLICY "trips_insert" ON trips
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "trips_update" ON trips
  FOR UPDATE TO authenticated
  USING (private.is_trip_participant(id))
  WITH CHECK (private.is_trip_participant(id));

CREATE POLICY "trips_delete" ON trips
  FOR DELETE TO authenticated
  USING (private.is_trip_participant(id));

-- ============================================================
-- trip_participants
-- ============================================================
DROP POLICY IF EXISTS "tp_select"  ON trip_participants;
DROP POLICY IF EXISTS "tp_insert"  ON trip_participants;
DROP POLICY IF EXISTS "tp_delete"  ON trip_participants;

-- Participants can see who else is in their trip
CREATE POLICY "tp_select" ON trip_participants
  FOR SELECT TO authenticated
  USING (private.is_trip_participant(trip_id));

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
  USING (private.is_trip_participant(trip_id))
  WITH CHECK (private.is_trip_participant(trip_id));

-- ============================================================
-- events
-- ============================================================
DROP POLICY IF EXISTS "events_all" ON events;

CREATE POLICY "events_all" ON events
  FOR ALL TO authenticated
  USING (private.is_trip_participant(trip_id))
  WITH CHECK (private.is_trip_participant(trip_id));

-- ============================================================
-- expenses
-- ============================================================
DROP POLICY IF EXISTS "expenses_all" ON expenses;

CREATE POLICY "expenses_all" ON expenses
  FOR ALL TO authenticated
  USING (private.is_trip_participant(trip_id))
  WITH CHECK (private.is_trip_participant(trip_id));

-- ============================================================
-- supplies
-- ============================================================
DROP POLICY IF EXISTS "supplies_all" ON supplies;

CREATE POLICY "supplies_all" ON supplies
  FOR ALL TO authenticated
  USING (private.is_trip_participant(trip_id))
  WITH CHECK (private.is_trip_participant(trip_id));

-- ============================================================
-- emergency_contacts
-- ============================================================
DROP POLICY IF EXISTS "emergency_contacts_all" ON emergency_contacts;

CREATE POLICY "emergency_contacts_all" ON emergency_contacts
  FOR ALL TO authenticated
  USING (private.is_trip_participant(trip_id))
  WITH CHECK (private.is_trip_participant(trip_id));

-- ============================================================
-- trip_invitations  (email-based invite system)
-- ============================================================
ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invites_insert"         ON trip_invitations;
DROP POLICY IF EXISTS "invites_select_invitee" ON trip_invitations;
DROP POLICY IF EXISTS "invites_select_member"  ON trip_invitations;
DROP POLICY IF EXISTS "invites_update_invitee" ON trip_invitations;

CREATE POLICY "invites_insert" ON trip_invitations
  FOR INSERT TO authenticated
  WITH CHECK (private.is_trip_participant(trip_id));

CREATE POLICY "invites_select_invitee" ON trip_invitations
  FOR SELECT TO authenticated
  USING (invited_email = (auth.jwt() ->> 'email'));

CREATE POLICY "invites_select_member" ON trip_invitations
  FOR SELECT TO authenticated
  USING (private.is_trip_participant(trip_id));

CREATE POLICY "invites_update_invitee" ON trip_invitations
  FOR UPDATE TO authenticated
  USING  (invited_email = (auth.jwt() ->> 'email'))
  WITH CHECK (invited_email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "trips_select_for_invite" ON trips;
CREATE POLICY "trips_select_for_invite" ON trips
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_invitations
      WHERE trip_id = id
        AND invited_email = (auth.jwt() ->> 'email')
        AND status = 'pending'
    )
  );

-- ============================================================
-- STEP 4: Indexes for performance at scale
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tp_user_id      ON trip_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_tp_trip_id      ON trip_participants (trip_id);
CREATE INDEX IF NOT EXISTS idx_events_trip     ON events            (trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip   ON expenses          (trip_id);
CREATE INDEX IF NOT EXISTS idx_supplies_trip   ON supplies          (trip_id);
CREATE INDEX IF NOT EXISTS idx_ec_trip         ON emergency_contacts(trip_id);
CREATE INDEX IF NOT EXISTS idx_dm_trip         ON day_meta          (trip_id);
CREATE INDEX IF NOT EXISTS idx_invites_email   ON trip_invitations  (invited_email);
CREATE INDEX IF NOT EXISTS idx_invites_trip    ON trip_invitations  (trip_id);
