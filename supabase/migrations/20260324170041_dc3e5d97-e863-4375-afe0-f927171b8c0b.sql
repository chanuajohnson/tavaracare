CREATE OR REPLACE FUNCTION public.get_unmatched_family_count()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM profiles p
  WHERE p.role = 'family'
    AND p.available_for_matching = true;
$$;