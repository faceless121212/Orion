-- Run this only after creating and confirming your first user in
-- Supabase Dashboard > Authentication > Users.
-- Replace the example email with that user's exact email address.

do $$
declare
  first_user_email constant text := 'YOUR_EMAIL@example.com';
begin
  if first_user_email = 'YOUR_EMAIL@example.com' then
    raise exception 'Replace YOUR_EMAIL@example.com before running this script';
  end if;

  update public.profiles
  set
    role = 'admin',
    updated_at = now()
  where lower(email) = lower(first_user_email);

  if not found then
    raise exception 'No profile found for %; create the Auth user first', first_user_email;
  end if;
end;
$$;

select id, email, full_name, role, created_at
from public.profiles
order by created_at;
