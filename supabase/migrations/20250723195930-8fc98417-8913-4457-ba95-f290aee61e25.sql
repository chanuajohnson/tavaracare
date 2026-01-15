-- Complete fix for RLS infinite recursion on profiles table
-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles; 
DROP POLICY IF EXISTS "Professionals can view family profiles they're assigned to" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new policies without function calls to avoid recursion
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies using direct auth metadata check
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
      'family'
    ) = 'admin'
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 
      'family'
    ) = 'admin'
  );

-- Professionals can view family profiles they're assigned to
CREATE POLICY "Professionals can view assigned family profiles" ON profiles
  FOR SELECT USING (
    role = 'family' AND (
      -- Check manual assignments
      EXISTS (
        SELECT 1 FROM admin_match_interventions ami
        WHERE ami.family_user_id = profiles.id 
        AND ami.caregiver_id = auth.uid()
        AND ami.status = 'active'
      )
      OR
      -- Check care team assignments  
      EXISTS (
        SELECT 1 FROM care_team_members ctm
        WHERE ctm.family_id = profiles.id
        AND ctm.caregiver_id = auth.uid()
        AND ctm.status = 'active'
      )
      OR
      -- Check automatic assignments
      EXISTS (
        SELECT 1 FROM automatic_assignments aa
        WHERE aa.family_user_id = profiles.id
        AND aa.caregiver_id = auth.uid()
        AND aa.is_active = true
      )
    )
  );

-- Update the get_current_user_role function to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  -- First try to get role from auth metadata
  BEGIN
    user_role := COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
      'family'
    );
    IF user_role IS NOT NULL AND user_role != '' THEN
      RETURN user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Continue to fallback
  END;
  
  -- Fallback: return 'family' as default
  RETURN 'family';
END;
$$;