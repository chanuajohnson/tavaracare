CREATE OR REPLACE FUNCTION public.get_unmatched_family_count()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT count(*)::integer
  FROM profiles p
  WHERE p.role = 'family'
    AND p.available_for_matching = true
    AND NOT EXISTS (
      SELECT 1 FROM caregiver_assignments ca
      WHERE ca.family_user_id = p.id AND ca.is_active = true
    );
$$;