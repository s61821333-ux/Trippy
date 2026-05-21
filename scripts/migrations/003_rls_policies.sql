-- SEC-1: Row Level Security policies for all tables
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / OR REPLACE patterns).

-- ============================================================
-- trips
-- ============================================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trip_select_participant"  ON trips;
DROP POLICY IF EXISTS "trip_insert_authenticated" ON trips;
DROP POLICY IF EXISTS "trip_update_participant"  ON trips;
DROP POLICY IF EXISTS "trip_delete_owner"        ON trips;

CREATE POLICY "trip_select_participant" ON trips
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_participants
      WHERE trip_participants.trip_id = trips.id
        AND trip_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "trip_insert_authenticated" ON trips
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "trip_update_participant" ON trips
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_participants
      WHERE trip_participants.trip_id = trips.id
        AND trip_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "trip_delete_owner" ON trips
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ============================================================
-- trip_participants
-- ============================================================
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participant_select_member"  ON trip_participants;
DROP POLICY IF EXISTS "participant_insert_member"  ON trip_participants;
DROP POLICY IF EXISTS "participant_delete_self"    ON trip_participants;

CREATE POLICY "participant_select_member" ON trip_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_participants tp2
      WHERE tp2.trip_id = trip_participants.trip_id
        AND tp2.user_id = auth.uid()
    )
  );

CREATE POLICY "participant_insert_member" ON trip_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "participant_delete_self" ON trip_participants
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- trip_invitations
-- ============================================================
ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invitation_select_owner"   ON trip_invitations;
DROP POLICY IF EXISTS "invitation_insert_member"  ON trip_invitations;
DROP POLICY IF EXISTS "invitation_update_invitee" ON trip_invitations;
DROP POLICY IF EXISTS "invitation_delete_sender"  ON trip_invitations;

-- Invitee can read invitations sent to their email; sender can read their own
CREATE POLICY "invitation_select_owner" ON trip_invitations
  FOR SELECT TO authenticated
  USING (
    invited_by = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "invitation_insert_member" ON trip_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM trip_participants
      WHERE trip_participants.trip_id = trip_invitations.trip_id
        AND trip_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "invitation_update_invitee" ON trip_invitations
  FOR UPDATE TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_by = auth.uid()
  );

CREATE POLICY "invitation_delete_sender" ON trip_invitations
  FOR DELETE TO authenticated
  USING (invited_by = auth.uid());

-- ============================================================
-- privacy_consents
-- ============================================================
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_select_owner" ON privacy_consents;
DROP POLICY IF EXISTS "consent_insert_owner" ON privacy_consents;
DROP POLICY IF EXISTS "consent_update_owner" ON privacy_consents;
DROP POLICY IF EXISTS "consent_delete_owner" ON privacy_consents;

CREATE POLICY "consent_select_owner" ON privacy_consents
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "consent_insert_owner" ON privacy_consents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "consent_update_owner" ON privacy_consents
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "consent_delete_owner" ON privacy_consents
  FOR DELETE TO authenticated USING (user_id = auth.uid());
