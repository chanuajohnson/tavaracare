
-- Phase 1: Clean up conflicting RLS policies and fix infinite recursion

-- Drop all existing policies on profiles table that cause recursion
DROP POLICY IF EXISTS "Profiles are viewable by users who have access" ON profiles;
DROP POLICY IF EXISTS "Users can view accessible profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update matching availability" ON profiles;

-- Create simple, non-recursive policies for profiles table
CREATE POLICY "Users can view and update own profile" ON profiles
FOR ALL USING (auth.uid() = id);

-- Allow viewing of professional profiles for matching purposes
CREATE POLICY "Users can view professional profiles" ON profiles
FOR SELECT USING (role = 'professional' AND available_for_matching = true);

-- Create security definer function for admin access that bypasses RLS
CREATE OR REPLACE FUNCTION admin_get_all_profiles_secure()
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
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user is admin using auth metadata (no RLS recursion)
  IF NOT (auth.jwt() ->> 'user_metadata')::jsonb ? 'role' OR 
     (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' != 'admin' THEN
    -- Fallback: check if user exists in profiles with admin role
    IF NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
  END IF;
  
  -- Return all profiles with email data
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

-- Create security definer function for professional assignment access
CREATE OR REPLACE FUNCTION get_professional_accessible_family_profiles(professional_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  role user_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.full_name,
    p.role
  FROM profiles p
  WHERE p.role = 'family'
  AND (
    -- Manual assignments
    EXISTS (
      SELECT 1 FROM admin_match_interventions ami
      WHERE ami.family_user_id = p.id 
      AND ami.caregiver_id = professional_id
      AND ami.status = 'active'
    )
    OR
    -- Care team assignments  
    EXISTS (
      SELECT 1 FROM care_team_members ctm
      WHERE ctm.family_id = p.id
      AND ctm.caregiver_id = professional_id
      AND ctm.status = 'active'
    )
    OR
    -- Automatic assignments
    EXISTS (
      SELECT 1 FROM automatic_assignments aa
      WHERE aa.family_user_id = p.id
      AND aa.caregiver_id = professional_id
      AND aa.is_active = true
    )
  );
END;
$$;

-- Update get_current_user_role function to avoid recursion
DROP FUNCTION IF EXISTS get_current_user_role();
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  -- First try to get role from auth metadata
  BEGIN
    user_role := (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role';
    IF user_role IS NOT NULL THEN
      RETURN user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Continue to fallback
  END;
  
  -- Fallback: direct query without RLS
  SELECT role INTO user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$;
