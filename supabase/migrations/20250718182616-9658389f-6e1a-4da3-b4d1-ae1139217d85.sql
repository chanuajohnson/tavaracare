
-- Iron-clad fix for infinite recursion in RLS policies
-- Step 1: Remove all problematic policies that cause recursion

-- Drop the problematic admin policies that query profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update matching availability" ON profiles;

-- Clean up any duplicate basic policies (these will be recreated to ensure consistency)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Recreate only the basic user policies that don't cause recursion
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can create their own profile" ON profiles
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Step 2: Create a security definer function for admin access
-- This bypasses RLS completely and allows admin components to access all profiles
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE(
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
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
  email text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    p.available_for_matching,
    au.email
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Create a function to get user journey progress without RLS conflicts
CREATE OR REPLACE FUNCTION public.admin_get_user_journey_progress(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  role text,
  current_step integer,
  total_steps integer,
  completion_percentage numeric,
  last_activity_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admin users to call this function
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Return journey progress for the specified user
  RETURN QUERY
  SELECT 
    ujp.user_id,
    ujp.role,
    ujp.current_step,
    ujp.total_steps,
    ujp.completion_percentage,
    ujp.last_activity_at
  FROM user_journey_progress ujp
  WHERE ujp.user_id = target_user_id;
END;
$$;
