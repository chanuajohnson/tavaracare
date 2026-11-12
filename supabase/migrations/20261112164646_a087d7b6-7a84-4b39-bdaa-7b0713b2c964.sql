CREATE OR REPLACE FUNCTION public.list_public_available_caregivers()
RETURNS TABLE(
  caregiver_id uuid, first_name text, avatar_url text, location text,
  care_services text[], years_of_experience text,
  is_featured boolean, spotlight_id uuid, headline text, description text,
  featured_image_url text, display_order integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id,
    COALESCE(NULLIF(p.first_name, ''), split_part(COALESCE(p.full_name, ''), ' ', 1), 'Caregiver'),
    p.avatar_url,
    p.location,
    p.care_services::text[],
    p.years_of_experience::text,
    s.id IS NOT NULL,
    s.id, s.headline, s.description, s.featured_image_url, s.display_order
  FROM public.profiles p
  LEFT JOIN LATERAL (
    SELECT cs.* FROM public.caregiver_spotlight cs
    WHERE cs.caregiver_id = p.id AND cs.is_active = true
      AND (cs.start_date IS NULL OR cs.start_date <= CURRENT_DATE)
      AND (cs.end_date IS NULL OR cs.end_date >= CURRENT_DATE)
    ORDER BY cs.display_order LIMIT 1
  ) s ON true
  WHERE p.role = 'professional' AND p.available_for_matching = true
  ORDER BY (s.id IS NULL), s.display_order NULLS LAST, p.updated_at DESC NULLS LAST;
$$;
REVOKE ALL ON FUNCTION public.list_public_available_caregivers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_available_caregivers() TO anon, authenticated;