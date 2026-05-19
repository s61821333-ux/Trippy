-- Add hotels column to trips table
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
ALTER TABLE trips ADD COLUMN IF NOT EXISTS hotels jsonb DEFAULT '[]'::jsonb;
