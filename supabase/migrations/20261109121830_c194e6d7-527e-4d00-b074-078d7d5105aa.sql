CREATE OR REPLACE FUNCTION public.update_user_profile_care_urgency_patch() RETURNS void LANGUAGE sql AS $$ SELECT 1 $$;
DROP FUNCTION public.update_user_profile_care_urgency_patch();

CREATE OR REPLACE FUNCTION public.save_family_care_urgency_trigger_noop() RETURNS void LANGUAGE sql AS $$ SELECT 1 $$;
DROP FUNCTION public.save_family_care_urgency_trigger_noop();

DO $do$
DECLARE def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO def FROM pg_proc p
  WHERE proname='update_user_profile' AND pg_get_function_identity_arguments(p.oid)='profile_data jsonb';
  def := replace(def,
    'emergency_contact = COALESCE(profile_data->>''emergency_contact'', emergency_contact),',
    'emergency_contact = COALESCE(profile_data->>''emergency_contact'', emergency_contact),
    care_urgency = COALESCE(NULLIF(profile_data->>''care_urgency'', '''')::care_urgency, care_urgency),');
  EXECUTE def;
END $do$;