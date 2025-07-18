
-- Emergency Fix: Complete RLS Reset for profiles table
-- This will stop all infinite recursion errors immediately

-- Step 1: Temporarily disable RLS to stop recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop the problematic function that causes recursion
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Step 3: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Professionals are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Family users can view professional profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete non-admin profiles" ON public.profiles;

-- Step 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create clean, simple policies that don't cause recursion

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view professional profiles (for matching)
CREATE POLICY "View professional profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND role = 'professional'
  );

-- Allow authenticated users to view family profiles (for professional matching)
CREATE POLICY "View family profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND role = 'family'
  );

-- Simple admin access (without recursion)
-- Note: Admin components should use admin_get_all_profiles() function instead
CREATE POLICY "Admin profile access" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
