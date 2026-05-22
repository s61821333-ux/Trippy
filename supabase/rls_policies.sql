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
-- ============================================================
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- ============================================================
-- STEP 3: Drop any old helper functions (they caused recursion)
-- ============================================================
DROP FUNCTION IF EXISTS public.is_trip_participant(uuid) CASCADE;
DROP FUNCTION IF EXISTS private.is_trip_participant(uuid) CASCADE;

-- ============================================================
-- trip_participants
-- Simple direct checks — no helper, no recursion possible.
-- ============================================================
DROP POLICY IF EXISTS "tp_select" ON trip_participants;
DROP POLICY IF EXISTS "tp_insert" ON trip_participants;
DROP POLICY IF EXISTS "tp_delete" ON trip_participants;

CREATE POLICY "tp_select" ON trip_participants
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "tp_insert" ON trip_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "tp_delete" ON trip_participants
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- trips
-- ============================================================
DROP POLICY IF EXISTS "trips_select"           ON trips;
DROP POLICY IF EXISTS "trips_select_by_code"   ON trips;
DROP POLICY IF EXISTS "trips_select_for_invite" ON trips;
DROP POLICY IF EXISTS "trips_insert"           ON trips;
DROP POLICY IF EXISTS "trips_update"           ON trips;
DROP POLICY IF EXISTS "trips_delete"           ON trips;

CREATE POLICY "trips_select" ON trips
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = trips.id AND user_id = auth.uid()));

CREATE POLICY "trips_insert" ON trips
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "trips_update" ON trips
  FOR UPDATE TO authenticated
  USING  (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = trips.id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = trips.id AND user_id = auth.uid()));

CREATE POLICY "trips_delete" ON trips
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = trips.id AND user_id = auth.uid()));

CREATE POLICY "trips_select_for_invite" ON trips
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_invitations
      WHERE trip_id = trips.id
        AND invited_email = (auth.jwt() ->> 'email')
        AND status = 'pending'
    )
  );

-- ============================================================
-- events
-- ============================================================
DROP POLICY IF EXISTS "events_all" ON events;

CREATE POLICY "events_all" ON events
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = events.trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = events.trip_id AND user_id = auth.uid()));

-- ============================================================
-- day_meta
-- ============================================================
DROP POLICY IF EXISTS "day_meta_all" ON day_meta;

CREATE POLICY "day_meta_all" ON day_meta
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = day_meta.trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = day_meta.trip_id AND user_id = auth.uid()));

-- ============================================================
-- expenses
-- ============================================================
DROP POLICY IF EXISTS "expenses_all" ON expenses;

CREATE POLICY "expenses_all" ON expenses
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = expenses.trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = expenses.trip_id AND user_id = auth.uid()));

-- ============================================================
-- supplies
-- ============================================================
DROP POLICY IF EXISTS "supplies_all" ON supplies;

CREATE POLICY "supplies_all" ON supplies
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = supplies.trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = supplies.trip_id AND user_id = auth.uid()));

-- ============================================================
-- emergency_contacts
-- ============================================================
DROP POLICY IF EXISTS "emergency_contacts_all" ON emergency_contacts;

CREATE POLICY "emergency_contacts_all" ON emergency_contacts
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = emergency_contacts.trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = emergency_contacts.trip_id AND user_id = auth.uid()));

-- ============================================================
-- trip_invitations
-- ============================================================
ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invites_insert"         ON trip_invitations;
DROP POLICY IF EXISTS "invites_select_invitee" ON trip_invitations;
DROP POLICY IF EXISTS "invites_select_member"  ON trip_invitations;
DROP POLICY IF EXISTS "invites_update_invitee" ON trip_invitations;

CREATE POLICY "invites_insert" ON trip_invitations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = trip_invitations.trip_id AND user_id = auth.uid()));

CREATE POLICY "invites_select_invitee" ON trip_invitations
  FOR SELECT TO authenticated
  USING (invited_email = (auth.jwt() ->> 'email'));

CREATE POLICY "invites_select_member" ON trip_invitations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM trip_participants WHERE trip_id = trip_invitations.trip_id AND user_id = auth.uid()));

CREATE POLICY "invites_update_invitee" ON trip_invitations
  FOR UPDATE TO authenticated
  USING  (invited_email = (auth.jwt() ->> 'email'))
  WITH CHECK (invited_email = (auth.jwt() ->> 'email'));

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
