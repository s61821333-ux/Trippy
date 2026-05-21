-- Add tags column to events table
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags text[] DEFAULT NULL;
