CREATE OR REPLACE FUNCTION public.get_reel_safe_need(ref text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  p profiles%ROWTYPE;
  tr record;
  same_town int;
  area text;
  caretypes text[];
  req text;
  requirements text[] := '{}';
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  SELECT * INTO p FROM profiles WHERE reel_ref = ref AND role='family' AND family_consent_social = true;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT * INTO tr FROM public.reel_town_region(COALESCE(p.address,''));
  IF tr.town IS NOT NULL THEN
    SELECT count(*) INTO same_town FROM profiles q CROSS JOIN LATERAL public.reel_town_region(COALESCE(q.address,'')) x
      WHERE q.role='family' AND x.town = tr.town;
  ELSE same_town := 0; END IF;
  area := CASE WHEN tr.town IS NOT NULL AND same_town >= 3 THEN tr.town || ' area' ELSE tr.region END;
  SELECT COALESCE(array_agg(CASE c
      WHEN 'personal_care' THEN 'Personal care' WHEN 'medication_management' THEN 'Medication support'
      WHEN 'mobility_assistance' THEN 'Mobility assistance' WHEN 'meal_preparation' THEN 'Meal preparation'
      WHEN 'housekeeping' THEN 'Light housekeeping' WHEN 'transportation' THEN 'Transportation'
      WHEN 'companionship' THEN 'Companionship' WHEN 'specialized_care' THEN 'Specialised care' ELSE NULL END)
      FILTER (WHERE c IN ('personal_care','medication_management','mobility_assistance','meal_preparation','housekeeping','transportation','companionship','specialized_care')),'{}')
    INTO caretypes FROM unnest(COALESCE(p.care_types,'{}')) c;

  -- Convert free text into a fixed allow-list. Raw matching notes never leave this function.
  req := lower(COALESCE(p.matching_requirements,''));
  IF req ~ '(own transportation|own car|has a car|have a car|own vehicle)' THEN requirements := array_append(requirements, 'Own car required'); END IF;
  IF req ~ '(female caregiver|woman caregiver|prefer a woman)' THEN requirements := array_append(requirements, 'Female caregiver preferred'); END IF;
  IF req ~ '(first aid|first-aid)' THEN requirements := array_append(requirements, 'First aid certification required');
  ELSIF req ~ '(specific certifications|certification required|recognised certification|recognized certification)' THEN requirements := array_append(requirements, 'Certification required'); END IF;
  IF req ~ 'reference' THEN requirements := array_append(requirements, 'References required'); END IF;
  IF req ~ '(relevant care experience|care experience|caregiving experience)' THEN requirements := array_append(requirements, 'Relevant care experience'); END IF;
  IF req ~ '(background|safeguarding|police certificate|police check)' THEN requirements := array_append(requirements, 'Background checks accepted'); END IF;
  IF req ~ '(reliability|reliable|punctuality|punctual)' THEN requirements := array_append(requirements, 'Reliable and punctual'); END IF;
  IF req ~ '(respectful|respect)' THEN requirements := array_append(requirements, 'Respectful care essential'); END IF;

  RETURN jsonb_build_object(
    'requestRef', p.reel_ref,
    'area', area,
    'region', tr.region,
    'careTypes', to_jsonb(public.reel_need_categories(p.special_needs)),
    'skills', to_jsonb(caretypes),
    'qualifications', CASE p.caregiver_type
        WHEN 'nurse' THEN '["RN or RNA"]'::jsonb
        WHEN 'professional' THEN '["Trained caregiver"]'::jsonb
        WHEN 'specialized' THEN '["Specialised care training"]'::jsonb
        WHEN 'companion' THEN '["Companion caregiver"]'::jsonb
        ELSE '["Caregiver"]'::jsonb END,
    'requirements', to_jsonb(requirements),
    'schedule', COALESCE(p.care_schedule,''),
    'urgency', CASE p.care_urgency::text WHEN 'immediate' THEN 'urgent' WHEN 'within_week' THEN 'soon' ELSE 'standard' END
  );
END
$function$;