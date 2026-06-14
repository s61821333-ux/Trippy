-- 004_destination_guides.sql
-- Persistent cache for the "Quick guide" (destination intelligence) AI results.
-- Country travel facts barely change and are identical for every user, so they
-- are generated once by Claude and shared across all users / serverless
-- instances — eliminating repeat token spend on cold starts.

create table if not exists public.destination_guides (
  country    text not null,
  locale     text not null default 'en',
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (country, locale)
);

alter table public.destination_guides enable row level security;

-- Read access for any authenticated user (non-sensitive, shared public facts).
drop policy if exists "destination_guides_select_authenticated" on public.destination_guides;
create policy "destination_guides_select_authenticated"
  on public.destination_guides for select
  to authenticated using (true);

-- No insert/update/delete policies: writes happen only via the service-role key
-- in the API route (service_role bypasses RLS), so clients cannot poison the cache.
