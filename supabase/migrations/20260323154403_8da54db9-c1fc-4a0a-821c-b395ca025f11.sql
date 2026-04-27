CREATE OR REPLACE FUNCTION public.update_user_profile(profile_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE profiles 
  SET 
    full_name = COALESCE(profile_data->>'full_name', full_name),
    avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
    phone_number = COALESCE(profile_data->>'phone_number', phone_number),
    address = COALESCE(profile_data->>'address', address),
    role = COALESCE((profile_data->>'role')::user_role, role),
    care_recipient_name = COALESCE(profile_data->>'care_recipient_name', care_recipient_name),
    relationship = COALESCE(profile_data->>'relationship', relationship),
    care_types = COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'care_types')),
      care_types
    ),
    special_needs = COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'special_needs')),
      special_needs
    ),
    care_schedule = COALESCE(profile_data->>'care_schedule', care_schedule),
    custom_schedule = COALESCE(profile_data->>'custom_schedule', custom_schedule),
    budget_preferences = COALESCE(profile_data->>'budget_preferences', budget_preferences),
    caregiver_type = COALESCE(profile_data->>'caregiver_type', caregiver_type),
    caregiver_preferences = COALESCE(profile_data->>'caregiver_preferences', caregiver_preferences),
    additional_notes = COALESCE(profile_data->>'additional_notes', additional_notes),
    preferred_contact_method = COALESCE(profile_data->>'preferred_contact_method', preferred_contact_method),
    matching_requirements = COALESCE(profile_data->>'matching_requirements', matching_requirements),
    care_services = COALESCE(
      CASE 
        WHEN profile_data ? 'care_services' AND profile_data->>'care_services' != 'null'
        THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'care_services'))
        ELSE care_services 
      END, 
      care_services
    ),
    professional_type = COALESCE(profile_data->>'professional_type', professional_type),
    years_of_experience = COALESCE(profile_data->>'years_of_experience', years_of_experience),
    certifications = COALESCE(
      CASE 
        WHEN profile_data ? 'certifications' AND profile_data->>'certifications' != 'null'
        THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'certifications'))
        ELSE certifications 
      END, 
      certifications
    ),
    specialized_care = COALESCE(
      CASE 
        WHEN profile_data ? 'specialized_care' AND profile_data->>'specialized_care' != 'null'
        THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'specialized_care'))
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
        THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'availability'))
        ELSE availability 
      END, 
      availability
    ),
    preferred_work_locations = COALESCE(profile_data->>'preferred_work_locations', preferred_work_locations),
    commute_mode = COALESCE(profile_data->>'commute_mode', commute_mode),
    languages = COALESCE(
      CASE 
        WHEN profile_data ? 'languages' AND profile_data->>'languages' != 'null'
        THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'languages'))
        ELSE languages 
      END, 
      languages
    ),
    emergency_contact = COALESCE(profile_data->>'emergency_contact', emergency_contact),
    updated_at = now()
  WHERE id = auth.uid();
END;
$function$;