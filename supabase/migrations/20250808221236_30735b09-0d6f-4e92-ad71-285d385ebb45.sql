
-- PUBLIC, read-only RPC to expose safe professional fields under RLS
create or replace function public.get_public_professional_profiles(ids uuid[])
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  location text,
  professional_type text,
  years_of_experience text,
  hourly_rate text,
  expected_rate text,
  care_schedule text,
  care_types text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.avatar_url,
    p.location,
    p.professional_type,
    p.years_of_experience,
    -- Cast numeric-to-text defensively to keep return type stable
    (p.hourly_rate)::text as hourly_rate,
    (p.expected_rate)::text as expected_rate,
    p.care_schedule,
    p.care_types
  from profiles p
  where p.role = 'professional'
    and p.id = any(ids)
$$;

grant execute on function public.get_public_professional_profiles(uuid[]) to authenticated;
