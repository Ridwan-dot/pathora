-- Pathora: Stage 7 database setup (CV Studio).
-- Paste into Supabase: SQL Editor > New query > Run. Safe to run more than once.

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  content jsonb not null check (octet_length(content::text) <= 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cv_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cv_id uuid not null references public.cvs (id) on delete cascade,
  version_number integer not null check (version_number > 0),
  note text check (char_length(note) <= 200),
  content jsonb not null check (octet_length(content::text) <= 200000),
  created_at timestamptz not null default now()
);

create index if not exists cvs_user on public.cvs (user_id);
create index if not exists cv_versions_cv on public.cv_versions (cv_id);

alter table public.cvs enable row level security;
alter table public.cv_versions enable row level security;

drop policy if exists "Own cvs" on public.cvs;
create policy "Own cvs" on public.cvs for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Own cv versions" on public.cv_versions;
create policy "Own cv versions" on public.cv_versions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
