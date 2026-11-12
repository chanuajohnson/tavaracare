ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS professional_consent_social boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.get_reel_safe_caregiver(ref text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p profiles%ROWTYPE;
  tr record;
  same_town int;
  area text;
  services text[];
  qualifications text[] := '{}';
  availability_codes text[] := '{}';
  item text;
  title text;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;

  SELECT * INTO p
  FROM public.profiles
  WHERE reel_ref = ref
    AND role = 'professional'
    AND professional_consent_social = true
    AND available_for_matching = true;
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT * INTO tr FROM public.reel_town_region(
    concat_ws(' ', NULLIF(p.location,''), NULLIF(p.address,''))
  );
  IF tr.town IS NOT NULL THEN
    SELECT count(*) INTO same_town
    FROM public.profiles q
    CROSS JOIN LATERAL public.reel_town_region(concat_ws(' ', NULLIF(q.location,''), NULLIF(q.address,''))) x
    WHERE q.role = 'professional' AND x.town = tr.town;
  ELSE
    same_town := 0;
  END IF;
  area := CASE WHEN tr.town IS NOT NULL AND same_town >= 3 THEN tr.town || ' area' ELSE tr.region END;

  SELECT COALESCE(array_agg(DISTINCT label) FILTER (WHERE label IS NOT NULL), '{}')
  INTO services
  FROM (
    SELECT CASE lower(trim(value))
      WHEN 'in-home care' THEN 'In-home care'
      WHEN 'in_home' THEN 'In-home care'
      WHEN 'cognitive & memory care' THEN 'Memory care support'
      WHEN 'memory_care' THEN 'Memory care support'
      WHEN 'nutritional assistance' THEN 'Meal preparation'
      WHEN 'nutritional' THEN 'Meal preparation'
      WHEN 'household assistance' THEN 'Light housekeeping'
      WHEN 'household' THEN 'Light housekeeping'
      WHEN 'medication management' THEN 'Medication support'
      WHEN 'medication' THEN 'Medication support'
      WHEN 'mobility assistance' THEN 'Mobility assistance'
      WHEN 'mobility' THEN 'Mobility assistance'
      WHEN 'medical support' THEN 'Medical support'
      WHEN 'medical_support' THEN 'Medical support'
      WHEN 'therapeutic support' THEN 'Therapeutic support'
      WHEN 'special needs support' THEN 'Special needs support'
      WHEN 'special_needs' THEN 'Special needs support'
      ELSE NULL
    END AS label
    FROM unnest(COALESCE(p.care_services,'{}')) AS value
  ) mapped;

  title := CASE lower(trim(COALESCE(p.professional_type,'')))
    WHEN 'nurse' THEN 'Registered nurse'
    WHEN 'rn' THEN 'Registered nurse'
    WHEN 'registered nurse' THEN 'Registered nurse'
    WHEN 'cna' THEN 'Certified nursing assistant'
    WHEN 'certified nursing assistant' THEN 'Certified nursing assistant'
    WHEN 'hha' THEN 'Home health aide'
    WHEN 'home health aide' THEN 'Home health aide'
    WHEN 'gapp' THEN 'GAPP-trained caregiver'
    WHEN 'patient care assistant' THEN 'Care assistant'
    WHEN 'companion' THEN 'Companion caregiver'
    ELSE 'Professional caregiver'
  END;
  qualifications := array_append(qualifications, title);
  CASE lower(trim(COALESCE(p.years_of_experience,'')))
    WHEN '1-2 years' THEN qualifications := array_append(qualifications, '1-2 years'' experience');
    WHEN '3-5 years' THEN qualifications := array_append(qualifications, '3-5 years'' experience');
    WHEN '6-10 years' THEN qualifications := array_append(qualifications, '6-10 years'' experience');
    WHEN 'more than 10 years' THEN qualifications := array_append(qualifications, '10+ years'' experience');
    ELSE NULL;
  END CASE;

  FOREACH item IN ARRAY COALESCE(p.availability,'{}') LOOP
    CASE lower(trim(item))
      WHEN 'weekday_standard' THEN availability_codes := array_append(availability_codes, 'mon_fri_8am_4pm');
      WHEN 'monday - friday, 8 am - 4 pm' THEN availability_codes := array_append(availability_codes, 'mon_fri_8am_4pm');
      WHEN 'weekdays' THEN availability_codes := array_append(availability_codes, 'mon_fri_8am_4pm');
      WHEN 'daytime' THEN availability_codes := array_append(availability_codes, 'mon_fri_8am_4pm');
      WHEN 'weekday_extended' THEN availability_codes := array_append(availability_codes, 'mon_fri_8am_6pm');
      WHEN 'weekend_day' THEN availability_codes := array_append(availability_codes, 'sat_sun_8am_4pm');
      WHEN 'weekends' THEN availability_codes := array_append(availability_codes, 'sat_sun_8am_4pm');
      WHEN 'evening_4pm_6am' THEN availability_codes := array_append(availability_codes, 'weekday_evening_4pm_6am');
      WHEN 'evening_4pm_8am' THEN availability_codes := array_append(availability_codes, 'weekday_evening_4pm_8am');
      WHEN 'evening_6pm_6am' THEN availability_codes := array_append(availability_codes, 'weekday_evening_6pm_6am');
      WHEN 'weekday evening shift (6 pm - 6 am)' THEN availability_codes := array_append(availability_codes, 'weekday_evening_6pm_6am');
      WHEN 'weekday_night' THEN availability_codes := array_append(availability_codes, 'weekday_evening_6pm_6am');
      WHEN 'evening_6pm_8am' THEN availability_codes := array_append(availability_codes, 'weekday_evening_6pm_8am');
      WHEN 'flexible' THEN availability_codes := array_append(availability_codes, 'flexible');
      WHEN 'other_custom' THEN availability_codes := array_append(availability_codes, 'flexible');
      ELSE NULL;
    END CASE;
  END LOOP;

  RETURN jsonb_build_object(
    'requestRef', p.reel_ref,
    'area', area,
    'region', tr.region,
    'careTypes', '[]'::jsonb,
    'skills', to_jsonb(COALESCE(services,'{}')),
    'qualifications', to_jsonb(qualifications),
    'requirements', '[]'::jsonb,
    'schedule', array_to_string(availability_codes, ','),
    'urgency', 'standard'
  );
END $$;

CREATE OR REPLACE FUNCTION public.list_reel_caregiver_candidates()
RETURNS TABLE(request_ref text, area text, care_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  j jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  FOR r IN
    SELECT id FROM public.profiles
    WHERE role = 'professional'
      AND professional_consent_social = true
      AND available_for_matching = true
    ORDER BY updated_at DESC NULLS LAST
  LOOP
    j := public.get_reel_safe_caregiver(public.ensure_reel_ref(r.id));
    request_ref := j->>'requestRef';
    area := j->>'area';
    care_type := COALESCE(j->'qualifications'->>0, j->'skills'->>0, 'Caregiver');
    RETURN NEXT;
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.get_reel_safe_caregiver(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_reel_caregiver_candidates() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_reel_safe_caregiver(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_reel_caregiver_candidates() TO authenticated;