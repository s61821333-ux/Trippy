-- 005_expense_tags.sql
-- Allow tagging/categorizing individual spends on the budget page.
alter table public.expenses add column if not exists tags jsonb not null default '[]'::jsonb;
