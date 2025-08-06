-- Fix profile data loading for edit mode by simplifying RLS and creating secure fetch function

-- 1. Create a security definer function to fetch profiles safely (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_profile_secure(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  phone_number text,
  address text,
  role user_role,
  professional_type text,
  years_of_experience text,
  care_services text[],
  certifications text[],
  care_schedule text,
  custom_schedule text,
  preferred_work_locations text,
  hourly_rate text,
  commute_mode text,
  languages text[],
  emergency_contact text,
  background_check boolean,
  additional_notes text,
  first_name text,
  last_name text,
  care_recipient_name text,
  relationship text,
  care_types text[],
  special_needs text[],
  budget_preferences text,
  caregiver_type text,
  caregiver_preferences text,
  preferred_contact_method text,
  location text,
  specialized_care text[],
  available_for_matching boolean,
  video_available boolean,
  visit_scheduling_status text,
  visit_payment_status text,
  visit_payment_reference text,
  visit_notes text,
  last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate that the requesting user can access this profile
  -- Either they are requesting their own profile or they are an admin
  IF target_user_id != auth.uid() THEN
    -- Check if requesting user is admin using JWT metadata (avoid RLS recursion)
    IF NOT (COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
      'family'
    ) = 'admin') THEN
      RAISE EXCEPTION 'Access denied: You can only access your own profile';
    END IF;
  END IF;

  -- Return the profile data directly from the table (bypassing RLS)
  RETURN QUERY
  SELECT 
    p.id,
    p.created_at,
    p.updated_at,
    p.full_name,
    p.avatar_url,
    p.phone_number,
    p.address,
    p.role,
    p.professional_type,
    p.years_of_experience,
    p.care_services,
    p.certifications,
    p.care_schedule,
    p.custom_schedule,
    p.preferred_work_locations,
    p.hourly_rate,
    p.commute_mode,
    p.languages,
    p.emergency_contact,
    p.background_check,
    p.additional_notes,
    p.first_name,
    p.last_name,
    p.care_recipient_name,
    p.relationship,
    p.care_types,
    p.special_needs,
    p.budget_preferences,
    p.caregiver_type,
    p.caregiver_preferences,
    p.preferred_contact_method,
    p.location,
    p.specialized_care,
    p.available_for_matching,
    p.video_available,
    p.visit_scheduling_status,
    p.visit_payment_status,
    p.visit_payment_reference,
    p.visit_notes,
    p.last_login_at
  FROM profiles p
  WHERE p.id = target_user_id;
END;
$$;

-- 2. Update user profile function to safely update profiles
CREATE OR REPLACE FUNCTION public.update_user_profile(profile_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    location = profile_data->>'location',
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
    preferred_contact_method = profile_data->>'preferred_contact_method',
    custom_care_schedule = profile_data->>'custom_care_schedule'
  WHERE id = user_id;
  
  -- Return the updated profile data
  SELECT row_to_json(profiles.*) INTO result
  FROM profiles 
  WHERE id = user_id;
  
  RETURN result;
END;
$$;