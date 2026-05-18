-- ============================================================
-- Trippy — Privacy Consents Table
-- Run this in the Supabase SQL Editor (dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS privacy_consents (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_at  timestamptz NOT NULL DEFAULT now(),
  content_hash text        NOT NULL,
  content      text        NOT NULL
);

ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- Users can read, insert, and update only their own consent record
CREATE POLICY "Users manage own consent" ON privacy_consents
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
