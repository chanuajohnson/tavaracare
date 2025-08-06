-- Create secure profile fetching function to bypass RLS recursion
-- This function uses SECURITY DEFINER to avoid infinite recursion in RLS policies

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
SET search_path = public
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