-- Pathora: Stage 4 database setup (Career Profile).
-- Paste all of this into Supabase: SQL Editor > New query > Run.
-- It is safe to run more than once.

-- 1. More details on the profile
alter table public.profiles
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists link text,
  add column if not exists summary text;

alter table public.profiles drop constraint if exists profiles_limits;
alter table public.profiles add constraint profiles_limits check (
  char_length(coalesce(full_name, '')) <= 100 and
  char_length(coalesce(phone, '')) <= 30 and
  char_length(coalesce(location, '')) <= 100 and
  char_length(coalesce(link, '')) <= 300 and
  char_length(coalesce(summary, '')) <= 600 and
  char_length(coalesce(target_role, '')) <= 100
);

-- 2. Education
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  institution text not null check (char_length(institution) between 1 and 150),
  qualification text check (char_length(qualification) <= 100),
  course text check (char_length(course) <= 150),
  start_date text check (char_length(start_date) <= 30),
  end_date text check (char_length(end_date) <= 30),
  still_studying boolean not null default false,
  grade text check (char_length(grade) <= 60),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

-- 3. Skills
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  category text not null default 'Technical' check (category in ('Technical', 'Professional', 'Tools and software')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists skills_user_name on public.skills (user_id, lower(name));

-- 4. Projects and experience
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('project', 'employment', 'siwes_internship', 'volunteering', 'leadership')),
  title text not null check (char_length(title) between 1 and 150),
  organisation text check (char_length(organisation) <= 150),
  role text check (char_length(role) <= 150),
  start_date text check (char_length(start_date) <= 30),
  end_date text check (char_length(end_date) <= 30),
  is_current boolean not null default false,
  responsibilities text check (char_length(responsibilities) <= 2000),
  achievements text check (char_length(achievements) <= 2000),
  skills_used text[] not null default '{}',
  evidence_link text check (char_length(evidence_link) <= 300),
  evidence_statement text check (char_length(evidence_statement) <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists education_user on public.education (user_id);
create index if not exists skills_user on public.skills (user_id);
create index if not exists experiences_user on public.experiences (user_id);

-- 5. Privacy: people can only reach their own rows.
alter table public.education enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;

drop policy if exists "Own education" on public.education;
create policy "Own education" on public.education for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Own skills" on public.skills;
create policy "Own skills" on public.skills for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Own experiences" on public.experiences;
create policy "Own experiences" on public.experiences for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
