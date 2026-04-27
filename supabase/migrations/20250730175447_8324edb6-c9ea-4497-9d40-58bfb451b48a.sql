-- Fix infinite recursion in RLS policies by creating security definer functions

-- 1. Create security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Return the role from the current user's metadata or profile
  -- First try user metadata, then profile table
  DECLARE
    user_role TEXT;
  BEGIN
    -- Try to get role from auth.users metadata first
    SELECT (auth.jwt() ->> 'user_metadata')::json ->> 'role' INTO user_role;
    
    -- If not found in metadata, check profiles table but avoid infinite recursion
    -- by using a direct query that doesn't trigger RLS
    IF user_role IS NULL OR user_role = '' THEN
      -- Use a security definer context to bypass RLS temporarily
      SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
    END IF;
    
    -- Default to 'family' if no role found
    RETURN COALESCE(user_role, 'family');
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_current_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Create security definer function to check professional access
CREATE OR REPLACE FUNCTION public.can_access_professional_data()
RETURNS BOOLEAN AS $$
BEGIN
  DECLARE
    user_role TEXT;
  BEGIN
    user_role := public.get_current_user_role();
    RETURN user_role IN ('admin', 'professional');
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Drop and recreate problematic policies to fix infinite recursion

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Profiles are viewable by users based on role" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Professionals can view family profiles" ON public.profiles;

-- Create new policies using security definer functions
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Professionals can view family profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.can_access_professional_data() 
  AND role = 'family'
);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;