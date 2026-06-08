-- rec_cache: internal recommendations cache for the AI recommendation engine.
-- Run this in the Supabase SQL editor.

create table if not exists rec_cache (
  rec_id           uuid primary key default gen_random_uuid(),
  -- location
  country          text,
  region           text,
  city             text not null,
  area             text,
  lat              double precision,
  lng              double precision,
  -- persona / request
  style            text not null,         -- food | bars | quiet | relaxed | other
  style_detail     text,
  duration_bucket  text not null,         -- short | half_day | full_day
  budget_tier      text not null default 'any',  -- low | mid | high | any
  season           text not null,         -- spring | summer | autumn | winter
  -- suggestion content (source: blog / TripAdvisor / etc.)
  title            text not null,
  short_description text,
  source_site      text,
  source_url       text,
  -- structured data (source: Google Places)
  google_place_id  text,
  google_rating    double precision,
  avg_duration_min int,
  price_level      int,                   -- 0–4
  -- meta
  created_at       timestamptz default now(),
  last_served_at   timestamptz,
  popularity_count int default 0
);

-- Composite index for fast cache hit queries
create index if not exists idx_rec_cache_lookup
  on rec_cache (city, style, season, budget_tier);

-- Geo proximity index (simple bounding-box; upgrade to PostGIS later)
create index if not exists idx_rec_cache_geo
  on rec_cache (lat, lng);

-- De-dup guard on google_place_id per city+style+season
create index if not exists idx_rec_cache_place
  on rec_cache (google_place_id) where google_place_id is not null;

-- RLS: authenticated users can read; writes go through service role only
alter table rec_cache enable row level security;

create policy "rec_cache_read"
  on rec_cache for select
  using (auth.role() = 'authenticated');
