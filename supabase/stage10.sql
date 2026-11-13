-- Pathora: Stage 10 database setup (account deletion).
-- Paste into Supabase: SQL Editor > New query > Run. Safe to run more than once.
--
-- This lets a signed-in person delete THEIR OWN account. Because every table is linked to the
-- account with "on delete cascade", all of their data is removed with it.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- Only signed-in people may call it, and it can only ever delete the caller's own account.
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
