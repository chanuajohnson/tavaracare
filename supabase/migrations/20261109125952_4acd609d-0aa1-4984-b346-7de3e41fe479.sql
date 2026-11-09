ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS family_consent_social boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_social_at timestamptz,
  ADD COLUMN IF NOT EXISTS reel_ref text UNIQUE;

CREATE TABLE public.reel_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_ref text NOT NULL,
  preset text NOT NULL,
  spec jsonb NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reel_exports TO authenticated;
GRANT ALL ON public.reel_exports TO service_role;
ALTER TABLE public.reel_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read reel exports" ON public.reel_exports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins log reel exports" ON public.reel_exports FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND created_by = auth.uid());

CREATE TABLE public.reel_photo_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id text NOT NULL,
  url text NOT NULL,
  focus_y real NOT NULL DEFAULT 0.5,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.reel_photo_library TO authenticated;
GRANT ALL ON public.reel_photo_library TO service_role;
ALTER TABLE public.reel_photo_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage reel photos" ON public.reel_photo_library FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Town -> region lookup (public, non-PII)
CREATE OR REPLACE FUNCTION public.reel_town_region(_address text)
RETURNS TABLE(town text, region text) LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  WITH towns(t, r) AS (VALUES
    ('Port of Spain','North West Trinidad'),('Diego Martin','North West Trinidad'),('Petit Valley','North West Trinidad'),('Maraval','North West Trinidad'),('Westmoorings','North West Trinidad'),('Carenage','North West Trinidad'),('St. James','North West Trinidad'),('Belmont','North West Trinidad'),('Laventille','North West Trinidad'),('Morvant','North West Trinidad'),('San Juan','North West Trinidad'),('Barataria','North West Trinidad'),('Santa Cruz','North West Trinidad'),
    ('St. Augustine','East Trinidad'),('Curepe','East Trinidad'),('Tunapuna','East Trinidad'),('Tacarigua','East Trinidad'),('Arouca','East Trinidad'),('Maloney','East Trinidad'),('D''Abadie','East Trinidad'),('Arima','East Trinidad'),('Trincity','East Trinidad'),('Piarco','East Trinidad'),('Valencia','East Trinidad'),('Sangre Grande','East Trinidad'),('El Dorado','East Trinidad'),('Macoya','East Trinidad'),
    ('Chaguanas','Central Trinidad'),('Cunupia','Central Trinidad'),('Freeport','Central Trinidad'),('Couva','Central Trinidad'),('Carapichaima','Central Trinidad'),('Claxton Bay','Central Trinidad'),('Longdenville','Central Trinidad'),('Enterprise','Central Trinidad'),('Felicity','Central Trinidad'),('Tabaquite','Central Trinidad'),
    ('San Fernando','South Trinidad'),('Marabella','South Trinidad'),('Palmiste','South Trinidad'),('Gasparillo','South Trinidad'),('Princes Town','South Trinidad'),('Penal','South Trinidad'),('Siparia','South Trinidad'),('Fyzabad','South Trinidad'),('Point Fortin','South Trinidad'),('La Romaine','South Trinidad'),('Debe','South Trinidad'),('Rio Claro','South Trinidad'),('Pointe-a-Pierre','South Trinidad'),('Gulf View','South Trinidad'),
    ('Scarborough','Tobago'),('Tobago','Tobago'),('Crown Point','Tobago'),('Roxborough','Tobago')
  )
  SELECT t, r FROM towns WHERE _address ILIKE '%' || replace(t,'.','') || '%' OR _address ILIKE '%' || t || '%'
  UNION ALL SELECT NULL, 'Trinidad & Tobago'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.reel_need_categories(_needs text[])
RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT COALESCE(array_agg(DISTINCT c) FILTER (WHERE c IS NOT NULL), '{}') FROM (
    SELECT CASE n
      WHEN 'dementia' THEN 'Memory care'
      WHEN 'parkinsons' THEN 'Movement support'
      WHEN 'diabetes' THEN 'Diabetes support'
      WHEN 'stroke_recovery' THEN 'Recovery support'
      WHEN 'cancer_care' THEN 'Comfort care'
      WHEN 'heart_disease' THEN 'Cardiac support'
      WHEN 'respiratory_issues' THEN 'Breathing support'
      WHEN 'mobility_limitations' THEN 'Mobility support'
      WHEN 'wound_care' THEN 'Wound care'
      WHEN 'incontinence' THEN 'Continence care'
      ELSE NULL END AS c
    FROM unnest(COALESCE(_needs,'{}')) n
  ) s;
$$;

CREATE OR REPLACE FUNCTION public.ensure_reel_ref(_profile_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text;
BEGIN
  SELECT reel_ref INTO r FROM profiles WHERE id = _profile_id;
  IF r IS NULL THEN
    LOOP
      r := 'TV-' || to_char(now(),'YYMM') || '-' || upper(substr(md5(gen_random_uuid()::text),1,3));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE reel_ref = r);
    END LOOP;
    UPDATE profiles SET reel_ref = r WHERE id = _profile_id;
  END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.list_reel_candidates()
RETURNS TABLE(request_ref text, area text, care_type text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  PERFORM public.ensure_reel_ref(p.id) FROM profiles p WHERE p.role='family' AND p.family_consent_social AND p.reel_ref IS NULL;
  RETURN QUERY
    SELECT n.request_ref, n.area, COALESCE(n.care_types->>0, 'Home care')
    FROM profiles p, LATERAL (SELECT * FROM public.get_reel_safe_need(p.reel_ref)) n0(j), LATERAL (SELECT j->>'requestRef' AS request_ref, j->>'area' AS area, j->'careTypes' AS care_types) n
    WHERE p.role='family' AND p.family_consent_social;
END $$;

CREATE OR REPLACE FUNCTION public.get_reel_safe_need(ref text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p profiles%ROWTYPE; tr record; same_town int; area text; caretypes text[];
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
    'schedule', COALESCE(p.care_schedule,''),
    'urgency', CASE p.care_urgency::text WHEN 'immediate' THEN 'urgent' WHEN 'within_week' THEN 'soon' ELSE 'standard' END
  );
END $$;

-- list_reel_candidates references get_reel_safe_need; recreate it now that it exists
CREATE OR REPLACE FUNCTION public.list_reel_candidates()
RETURNS TABLE(request_ref text, area text, care_type text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; j jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  FOR r IN SELECT id FROM profiles WHERE role='family' AND family_consent_social LOOP
    j := public.get_reel_safe_need(public.ensure_reel_ref(r.id));
    request_ref := j->>'requestRef'; area := j->>'area';
    care_type := COALESCE(j->'skills'->>0, j->'careTypes'->>0, 'Home care');
    RETURN NEXT;
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.ensure_reel_ref(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_reel_safe_need(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_reel_candidates() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_reel_safe_need(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_reel_candidates() TO authenticated;

-- Storage policies for reel-photos bucket (bucket created separately)
CREATE POLICY "Public read reel photos" ON storage.objects FOR SELECT USING (bucket_id = 'reel-photos');
CREATE POLICY "Admins upload reel photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reel-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete reel photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reel-photos' AND public.has_role(auth.uid(),'admin'));