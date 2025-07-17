-- Create a safe profile update function that bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.update_user_profile(
  profile_data jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_id uuid;
  result jsonb;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- Validate that user is authenticated
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Validate that the profile_data contains the correct user ID
  IF (profile_data->>'id')::uuid != user_id THEN
    RAISE EXCEPTION 'Users can only update their own profiles';
  END IF;
  
  -- Perform the update directly without triggering RLS
  UPDATE profiles 
  SET 
    full_name = profile_data->>'full_name',
    avatar_url = profile_data->>'avatar_url',
    phone_number = profile_data->>'phone_number',
    address = profile_data->>'address',
    role = (profile_data->>'role')::user_role,
    updated_at = NOW(),
    professional_type = profile_data->>'professional_type',
    years_of_experience = profile_data->>'years_of_experience',
    care_services = CASE 
      WHEN profile_data ? 'care_services' THEN 
        ARRAY(SELECT jsonb_array_elements_text(profile_data->'care_services'))
      ELSE care_services 
    END,
    certifications = CASE 
      WHEN profile_data ? 'certifications' THEN 
        ARRAY(SELECT jsonb_array_elements_text(profile_data->'certifications'))
      ELSE certifications 
    END,
    care_schedule = profile_data->>'care_schedule',
    custom_schedule = profile_data->>'custom_schedule',
    preferred_work_locations = profile_data->>'preferred_work_locations',
    hourly_rate = profile_data->>'hourly_rate',
    commute_mode = profile_data->>'commute_mode',
    languages = CASE 
      WHEN profile_data ? 'languages' THEN 
        ARRAY(SELECT jsonb_array_elements_text(profile_data->'languages'))
      ELSE languages 
    END,
    emergency_contact = profile_data->>'emergency_contact',
    background_check = (profile_data->>'background_check')::boolean,
    additional_notes = profile_data->>'additional_notes',
    first_name = profile_data->>'first_name',
    last_name = profile_data->>'last_name',
    -- Family-specific fields (will be null for professionals)
    care_recipient_name = profile_data->>'care_recipient_name',
    relationship = profile_data->>'relationship',
    care_types = CASE 
      WHEN profile_data ? 'care_types' THEN 
        ARRAY(SELECT jsonb_array_elements_text(profile_data->'care_types'))
      ELSE care_types 
    END,
    special_needs = CASE 
      WHEN profile_data ? 'special_needs' THEN 
        ARRAY(SELECT jsonb_array_elements_text(profile_data->'special_needs'))
      ELSE special_needs 
    END,
    budget_preferences = profile_data->>'budget_preferences',
    caregiver_type = profile_data->>'caregiver_type',
    caregiver_preferences = profile_data->>'caregiver_preferences',
    preferred_contact_method = profile_data->>'preferred_contact_method'
  WHERE id = user_id;
  
  -- Return the updated profile data
  SELECT row_to_json(profiles.*) INTO result
  FROM profiles 
  WHERE id = user_id;
  
  RETURN result;
END;
$$;