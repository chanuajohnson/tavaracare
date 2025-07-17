-- Remove the admin policy that's causing infinite recursion
-- The admin policy is querying profiles table which triggers the same policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Keep only the basic user policies that don't cause recursion
-- These policies already exist and work correctly:
-- 1. "Users can view their own profile" - uses id = auth.uid()
-- 2. "Users can update their own profile" - uses id = auth.uid()  
-- 3. "Users can create their own profile" - uses id = auth.uid()

-- For admin functionality, we'll handle it at the application level
-- instead of through RLS policies to avoid recursion