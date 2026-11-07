-- Pathora: Stage 3 database setup.
-- Paste all of this into Supabase: SQL Editor > New query > Run.

-- 1. One profile row per person.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  stage text,
  target_role text,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Privacy: switch on Row Level Security, so people can only reach their own row.
alter table public.profiles enable row level security;

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- (No insert or delete policy for people: the row is created by the trigger below,
--  and removed automatically if the account is deleted.)

-- 3. Create the profile row automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
