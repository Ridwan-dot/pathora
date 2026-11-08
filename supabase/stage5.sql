-- Pathora: Stage 5 database setup (Evidence Builder).
-- Paste into Supabase: SQL Editor > New query > Run. Safe to run more than once.

alter table public.experiences
  add column if not exists situation text check (char_length(situation) <= 2000);
