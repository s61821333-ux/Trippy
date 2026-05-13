-- Add votes column to events table so partner reactions sync across devices.
-- Run this once in the Supabase SQL Editor (dashboard → SQL Editor).

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS votes jsonb DEFAULT '{}'::jsonb;
