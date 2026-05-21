-- SEC-4: Account deletion grace period (24-hour confirm + cancel window)
-- Run in Supabase SQL editor under your project.

CREATE TABLE IF NOT EXISTS account_deletions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id),
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for       TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
  confirmed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  confirmation_token  TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex')
);

ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own deletion request
CREATE POLICY "account_deletion_select_owner" ON account_deletions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own deletion request
CREATE POLICY "account_deletion_insert_owner" ON account_deletions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
