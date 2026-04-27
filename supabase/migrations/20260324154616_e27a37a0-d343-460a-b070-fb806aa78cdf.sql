CREATE OR REPLACE FUNCTION public.get_public_family_profiles()
RETURNS TABLE(
  id uuid,
  full_name text,
  location text,
  care_types text[],
  care_urgency care_urgency,
  care_schedule text,
  diagnosed_conditions text,
  chronic_illness_type text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.full_name,
    COALESCE(
      p.location,
      (SELECT string_agg(trimmed, ', ' ORDER BY rn)
       FROM (
         SELECT trim(part) AS trimmed, row_number() OVER () AS rn
         FROM unnest(
           (string_to_array(cn.care_location, ','))[
             GREATEST(array_length(string_to_array(cn.care_location, ','), 1) - 1, 1) :
           ]
         ) AS part
       ) sub
      ),
      'Trinidad & Tobago'
    ) as location,
    p.care_types,
    p.care_urgency,
    p.care_schedule,
    cn.diagnosed_conditions,
    cn.chronic_illness_type
  FROM profiles p
  LEFT JOIN care_needs_family cn ON cn.profile_id = p.id
  WHERE p.role = 'family'
    AND p.available_for_matching = true
  ORDER BY p.updated_at DESC;
$$;