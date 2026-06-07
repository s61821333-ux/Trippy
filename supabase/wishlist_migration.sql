-- Run this in your Supabase SQL editor to enable DB-backed wishlist persistence.
-- Wishlist items are stored in the events table with wishlist=true and day_index=999.

ALTER TABLE events ADD COLUMN IF NOT EXISTS wishlist boolean DEFAULT false;

-- Index so fetching wishlist items per trip is fast
CREATE INDEX IF NOT EXISTS idx_events_wishlist ON events (trip_id, wishlist) WHERE wishlist = true;

-- Update RLS to allow wishlist items (same participant access as regular events)
-- No additional RLS changes needed — wishlist items share the events table RLS.
