-- FINAL FIX: Remove the problematic "admins_view_all_profiles" policy 
-- that references user_metadata (which is insecure per linter warnings)

-- Step 1: Drop the problematic admin policy that references user metadata
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;

-- Step 2: Create admin policy using the existing security definer function
CREATE POLICY "admins_view_all_profiles_secure" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Step 3: Add a policy specifically for care team member visibility
-- This allows professionals to see family profiles they're assigned to
CREATE POLICY "professionals_view_assigned_families" ON public.profiles
FOR SELECT USING (
  public.get_current_user_role() = 'professional' 
  AND EXISTS (
    SELECT 1 FROM get_professional_accessible_family_profiles(auth.uid()) p
    WHERE p.id = profiles.id
  )
);

-- Step 4: Verify the get_current_user_role function is properly set
-- This function should already exist and use JWT metadata only