-- SEC-5: User approval gate — every new sign-in requires manager approval.
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS user_approvals (
  user_id      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  display_name TEXT        NOT NULL DEFAULT '',
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at   TIMESTAMPTZ,
  decided_by   UUID        REFERENCES auth.users(id)
);

ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;

-- Users can only read their own approval status (for /pending auto-poll).
-- No client writes — all mutations go through service-role API routes.
CREATE POLICY "ua_select_own" ON user_approvals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_ua_status       ON user_approvals (status);
CREATE INDEX IF NOT EXISTS idx_ua_requested_at ON user_approvals (requested_at DESC);
