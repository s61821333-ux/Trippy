-- SEC-2: Invite token expiry + single-use enforcement
-- Run in Supabase SQL editor under your project.

-- New table replaces the bare invite_token column on trips.
CREATE TABLE IF NOT EXISTS trip_invite_links (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      UUID        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  token        TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_by   UUID        NOT NULL REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  max_uses     INTEGER     NOT NULL DEFAULT 1,
  use_count    INTEGER     NOT NULL DEFAULT 0
);

-- RLS
ALTER TABLE trip_invite_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read a link by token (needed for the public join page lookup)
CREATE POLICY "invite_link_select_public" ON trip_invite_links
  FOR SELECT
  USING (true);

-- Only trip participants can create invite links
CREATE POLICY "invite_link_insert_participant" ON trip_invite_links
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_participants
      WHERE trip_participants.trip_id = trip_invite_links.trip_id
        AND trip_participants.user_id = auth.uid()
    )
  );

-- Only the service role can increment use_count (done server-side via service key)
-- Participants can delete their own links
CREATE POLICY "invite_link_delete_creator" ON trip_invite_links
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Also add expires_at to trip_invitations (email invites)
ALTER TABLE trip_invitations
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days';
