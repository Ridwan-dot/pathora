-- Pathora: Stage 9 database setup (Application Tracker).
-- Paste into Supabase: SQL Editor > New query > Run. Safe to run more than once.
-- Statuses are set by the person. Nothing here talks to employers.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null check (char_length(company) between 1 and 150),
  role text not null check (char_length(role) between 1 and 150),
  source text check (char_length(source) <= 300),
  status text not null default 'Saved' check (status in ('Saved', 'Applied', 'Interview', 'Offer', 'Not selected', 'Withdrawn')),
  applied_on date,
  deadline date,
  next_action text check (char_length(next_action) <= 200),
  next_action_due date,
  next_action_detail text check (char_length(next_action_detail) <= 1000),
  notes text check (char_length(notes) <= 4000),
  cv_id uuid references public.cvs (id) on delete set null,
  job_analysis_id uuid references public.job_analyses (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  kind text not null check (kind in ('created', 'status', 'next_action', 'edited')),
  text text not null check (char_length(text) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists applications_user on public.applications (user_id);
create index if not exists application_events_app on public.application_events (application_id);

alter table public.applications enable row level security;
alter table public.application_events enable row level security;

drop policy if exists "Own applications" on public.applications;
create policy "Own applications" on public.applications for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Own application events" on public.application_events;
create policy "Own application events" on public.application_events for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
