-- Fix update_user_profile function to use correct custom_schedule field
CREATE OR REPLACE FUNCTION public.update_user_profile(user_id_param uuid, profile_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_profile profiles%ROWTYPE;
BEGIN
  -- Get existing profile
  SELECT * INTO existing_profile FROM profiles WHERE id = user_id_param;
  
  IF existing_profile.id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', user_id_param;
  END IF;
  
  -- Update profile with new data, only updating fields that exist
  UPDATE profiles SET
    full_name = COALESCE(profile_data->>'full_name', full_name),
    phone_number = COALESCE(profile_data->>'phone_number', phone_number),
    address = COALESCE(profile_data->>'address', address),
    location = COALESCE(profile_data->>'location', location),
    avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
    
    -- Family-specific fields
    care_recipient_name = COALESCE(profile_data->>'care_recipient_name', care_recipient_name),
    relationship = COALESCE(profile_data->>'relationship', relationship),
    care_types = COALESCE(
      CASE 
        WHEN profile_data ? 'care_types' AND profile_data->>'care_types' != 'null' 
        THEN (profile_data->>'care_types')::jsonb#>>'{}'::text[]
        ELSE care_types 
      END, 
      care_types
    ),
    special_needs = COALESCE(
      CASE 
        WHEN profile_data ? 'special_needs' AND profile_data->>'special_needs' != 'null' 
        THEN (profile_data->>'special_needs')::jsonb#>>'{}'::text[]
        ELSE special_needs 
      END, 
      special_needs
    ),
    care_schedule = COALESCE(profile_data->>'care_schedule', care_schedule),
    budget_preferences = COALESCE(profile_data->>'budget_preferences', budget_preferences),
    caregiver_type = COALESCE(profile_data->>'caregiver_type', caregiver_type),
    caregiver_preferences = COALESCE(profile_data->>'caregiver_preferences', caregiver_preferences),
    additional_notes = COALESCE(profile_data->>'additional_notes', additional_notes),
    preferred_contact_method = COALESCE(profile_data->>'preferred_contact_method', preferred_contact_method),
    
    -- Professional-specific fields
    professional_type = COALESCE(profile_data->>'professional_type', professional_type),
    years_of_experience = COALESCE(profile_data->>'years_of_experience', years_of_experience),
    certifications = COALESCE(
      CASE 
        WHEN profile_data ? 'certifications' AND profile_data->>'certifications' != 'null' 
        THEN (profile_data->>'certifications')::jsonb#>>'{}'::text[]
        ELSE certifications 
      END, 
      certifications
    ),
    specialized_care = COALESCE(
      CASE 
        WHEN profile_data ? 'specialized_care' AND profile_data->>'specialized_care' != 'null' 
        THEN (profile_data->>'specialized_care')::jsonb#>>'{}'::text[]
        ELSE specialized_care 
      END, 
      specialized_care
    ),
    background_check = COALESCE((profile_data->>'background_check')::boolean, background_check),
    background_check_proof_url = COALESCE(profile_data->>'background_check_proof_url', background_check_proof_url),
    legally_authorized = COALESCE((profile_data->>'legally_authorized')::boolean, legally_authorized),
    drivers_license = COALESCE((profile_data->>'drivers_license')::boolean, drivers_license),
    own_transportation = COALESCE((profile_data->>'own_transportation')::boolean, own_transportation),
    available_for_matching = COALESCE((profile_data->>'available_for_matching')::boolean, available_for_matching),
    hourly_rate = COALESCE((profile_data->>'hourly_rate')::numeric, hourly_rate),
    work_type = COALESCE(profile_data->>'work_type', work_type),
    availability = COALESCE(
      CASE 
        WHEN profile_data ? 'availability' AND profile_data->>'availability' != 'null' 
        THEN (profile_data->>'availability')::jsonb#>>'{}'::text[]
        ELSE availability 
      END, 
      availability
    ),
    
    -- Fixed: Use correct custom_schedule field name
    custom_schedule = COALESCE(profile_data->>'custom_schedule', custom_schedule),
    
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Sync relevant data to auth.users metadata
  UPDATE auth.users SET
    raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
      'role', existing_profile.role,
      'full_name', COALESCE(profile_data->>'full_name', existing_profile.full_name)
    )
  WHERE id = user_id_param;
END;
$function$;