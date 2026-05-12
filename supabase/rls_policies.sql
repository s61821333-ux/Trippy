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
-- trips
-- ============================================================
-- Read: only participants can read their trip
-- Insert: any authenticated user can create a trip
-- Update/Delete: only participants of that trip
DROP POLICY IF EXISTS "trips_select"            ON trips;
DROP POLICY IF EXISTS "trips_select_by_code"    ON trips;
DROP POLICY IF EXISTS "trips_insert"            ON trips;
DROP POLICY IF EXISTS "trips_update"            ON trips;
DROP POLICY IF EXISTS "trips_delete"            ON trips;

CREATE POLICY "trips_select" ON trips
  FOR SELECT TO authenticated
  USING (is_trip_participant(id));

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
-- trip_invitations  (NEW — email-based invite system)
-- ============================================================
-- Run once to create the table:
-- CREATE TABLE trip_invitations (
--   id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   trip_id       uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
--   invited_email text NOT NULL,
--   invited_by    uuid REFERENCES auth.users(id) NOT NULL,
--   status        text DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
--   created_at    timestamptz DEFAULT now(),
--   UNIQUE(trip_id, invited_email)
-- );

ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invites_insert"         ON trip_invitations;
DROP POLICY IF EXISTS "invites_select_invitee" ON trip_invitations;
DROP POLICY IF EXISTS "invites_select_member"  ON trip_invitations;
DROP POLICY IF EXISTS "invites_update_invitee" ON trip_invitations;

-- Trip participants can send invitations
CREATE POLICY "invites_insert" ON trip_invitations
  FOR INSERT TO authenticated
  WITH CHECK (is_trip_participant(trip_id));

-- Invited person can see their own invitations
CREATE POLICY "invites_select_invitee" ON trip_invitations
  FOR SELECT TO authenticated
  USING (invited_email = (auth.jwt() ->> 'email'));

-- Trip members can see outgoing invitations for their trip
CREATE POLICY "invites_select_member" ON trip_invitations
  FOR SELECT TO authenticated
  USING (is_trip_participant(trip_id));

-- Only the invitee can update status (accept / reject)
CREATE POLICY "invites_update_invitee" ON trip_invitations
  FOR UPDATE TO authenticated
  USING  (invited_email = (auth.jwt() ->> 'email'))
  WITH CHECK (invited_email = (auth.jwt() ->> 'email'));

-- Also allow SELECT on trips for the invited user (not yet a participant)
-- so the invitation query can join to trips.name / trips.theme
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
-- STEP 3: Indexes for performance at scale
-- ============================================================
-- These prevent full-table scans in the is_trip_participant helper
-- and in all the per-trip queries.

CREATE INDEX IF NOT EXISTS idx_tp_user_id      ON trip_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_tp_trip_id      ON trip_participants (trip_id);
CREATE INDEX IF NOT EXISTS idx_events_trip     ON events            (trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip   ON expenses          (trip_id);
CREATE INDEX IF NOT EXISTS idx_supplies_trip   ON supplies          (trip_id);
CREATE INDEX IF NOT EXISTS idx_ec_trip         ON emergency_contacts(trip_id);
CREATE INDEX IF NOT EXISTS idx_dm_trip         ON day_meta          (trip_id);
CREATE INDEX IF NOT EXISTS idx_invites_email   ON trip_invitations  (invited_email);
CREATE INDEX IF NOT EXISTS idx_invites_trip    ON trip_invitations  (trip_id);

