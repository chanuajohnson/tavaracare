-- Fix the update_user_profile function to properly handle care_services array
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
    -- Fix care_services array handling
    care_services = COALESCE(
      CASE 
        WHEN profile_data ? 'care_services' AND profile_data->>'care_services' != 'null'
        THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'care_services'))
        ELSE care_services 
      END, 
      care_services
    ),
    updated_at = now()
  WHERE id = auth.uid();
END;
$function$