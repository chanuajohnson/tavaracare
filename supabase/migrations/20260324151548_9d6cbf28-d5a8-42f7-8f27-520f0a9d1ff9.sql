CREATE OR REPLACE FUNCTION public.get_public_family_profiles()
RETURNS TABLE(
  id uuid,
  full_name text,
  location text,
  care_types text[],
  care_urgency care_urgency,
  care_schedule text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.full_name, p.location, p.care_types, p.care_urgency, p.care_schedule
  FROM profiles p
  WHERE p.role = 'family'
    AND p.available_for_matching = true
  ORDER BY p.updated_at DESC;
$$;