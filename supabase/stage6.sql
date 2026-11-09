-- Pathora: Stage 6 database setup (Job Analyser).
-- Paste into Supabase: SQL Editor > New query > Run. Safe to run more than once.

create table if not exists public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  job_text text not null check (char_length(job_text) between 1 and 20000),
  created_at timestamptz not null default now()
);

create index if not exists job_analyses_user on public.job_analyses (user_id);

alter table public.job_analyses enable row level security;

drop policy if exists "Own job analyses" on public.job_analyses;
create policy "Own job analyses" on public.job_analyses for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
