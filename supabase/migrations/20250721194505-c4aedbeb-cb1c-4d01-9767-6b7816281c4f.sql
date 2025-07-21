
-- Update the admin_get_all_profiles function to return all required fields
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE(
  id uuid, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  role user_role, 
  full_name text, 
  avatar_url text, 
  phone_number text, 
  address text, 
  location text, 
  professional_type text, 
  years_of_experience text, 
  care_types text[], 
  specialized_care text[], 
  available_for_matching boolean, 
  email text,
  last_login_at timestamp with time zone,
  ready_for_admin_scheduling boolean,
  visit_scheduling_status text,
  visit_payment_status text,
  onboarding_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admin users to call this function
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Return all profiles with enhanced data
  RETURN QUERY
  SELECT 
    p.id,
    p.created_at,
    p.updated_at,
    p.role,
    p.full_name,
    p.avatar_url,
    p.phone_number,
    p.address,
    p.location,
    p.professional_type,
    p.years_of_experience,
    p.care_types,
    p.specialized_care,
    COALESCE(p.available_for_matching, false) as available_for_matching,
    au.email,
    p.last_login_at,
    COALESCE(p.ready_for_admin_scheduling, false) as ready_for_admin_scheduling,
    COALESCE(p.visit_scheduling_status, 'not_ready') as visit_scheduling_status,
    COALESCE(p.visit_payment_status, 'pending') as visit_payment_status,
    COALESCE(p.onboarding_completed, false) as onboarding_completed
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  ORDER BY p.created_at DESC;
END;
$function$

-- Also create a simple function to get current user's complete profile data
CREATE OR REPLACE FUNCTION public.get_current_user_complete_profile()
RETURNS TABLE(
  id uuid, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  role user_role, 
  full_name text, 
  avatar_url text, 
  phone_number text, 
  address text, 
  location text, 
  professional_type text, 
  years_of_experience text, 
  care_types text[], 
  specialized_care text[], 
  available_for_matching boolean, 
  last_login_at timestamp with time zone,
  ready_for_admin_scheduling boolean,
  visit_scheduling_status text,
  visit_payment_status text,
  onboarding_completed boolean,
  care_recipient_name text,
  relationship text,
  budget_preferences text,
  caregiver_type text,
  additional_notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Return current user's complete profile
  RETURN QUERY
  SELECT 
    p.id,
    p.created_at,
    p.updated_at,
    p.role,
    p.full_name,
    p.avatar_url,
    p.phone_number,
    p.address,
    p.location,
    p.professional_type,
    p.years_of_experience,
    p.care_types,
    p.specialized_care,
    COALESCE(p.available_for_matching, false) as available_for_matching,
    p.last_login_at,
    COALESCE(p.ready_for_admin_scheduling, false) as ready_for_admin_scheduling,
    COALESCE(p.visit_scheduling_status, 'not_ready') as visit_scheduling_status,
    COALESCE(p.visit_payment_status, 'pending') as visit_payment_status,
    COALESCE(p.onboarding_completed, false) as onboarding_completed,
    p.care_recipient_name,
    p.relationship,
    p.budget_preferences,
    p.caregiver_type,
    p.additional_notes
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$function$

-- Clean up RLS policies on profiles table to prevent infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "View professional profiles" ON public.profiles;
DROP POLICY IF EXISTS "View family profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin profile access" ON public.profiles;

-- Create simple, non-recursive RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view other profiles for matching purposes
CREATE POLICY "Authenticated users can view other profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() != id
  );

-- Simple admin access without recursion
CREATE POLICY "Admin can access all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
