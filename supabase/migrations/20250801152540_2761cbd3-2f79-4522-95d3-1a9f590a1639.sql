-- EMERGENCY FIX: Fix profiles table RLS policies causing infinite recursion
-- The logs show "infinite recursion detected in policy for relation 'profiles'"

-- Step 1: Drop ALL existing policies on profiles table that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Professionals can view accessible family profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profile access policy" ON public.profiles;
DROP POLICY IF EXISTS "family_owns_care_plans" ON public.profiles;

-- Step 2: Create simple, non-recursive policies using ONLY auth.uid()
-- Users can view their own profile
CREATE POLICY "users_own_profile_select" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Users can update their own profile  
CREATE POLICY "users_own_profile_update" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "users_own_profile_insert" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Admins can view all profiles (using JWT metadata to avoid recursion)
CREATE POLICY "admins_view_all_profiles" ON public.profiles
FOR SELECT USING (
  COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'
  ) = 'admin'
);

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Test that get_current_user_role function works properly
-- This function should use JWT metadata instead of querying profiles table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Only use auth.jwt() metadata to avoid infinite recursion
  -- Never query the profiles table from this function
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'  -- Default role if no metadata found
  );
END;
$$;