-- Final fix for infinite recursion - remove ALL policies that use get_current_user_role()
-- This function queries profiles table and causes recursion

-- Find and drop all policies that use get_current_user_role()
DO $$
DECLARE
    policy_rec RECORD;
BEGIN
    -- Get all policies that use get_current_user_role()
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE (qual LIKE '%get_current_user_role%' OR with_check LIKE '%get_current_user_role%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
        RAISE NOTICE 'Dropped policy: % on table: %.%', 
                     policy_rec.policyname, 
                     policy_rec.schemaname, 
                     policy_rec.tablename;
    END LOOP;
END $$;

-- Also ensure RLS is enabled on all tables that have policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_needs_family ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_recipient_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate essential policies without using get_current_user_role()
-- Only keep the basic user policies that don't cause recursion
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can create their own profile" ON profiles
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Add a simple policy for professionals to be viewable by authenticated users
-- This allows the caregiver matching to work
CREATE POLICY "Professionals are viewable by authenticated users" ON profiles
FOR SELECT 
USING (role = 'professional' AND auth.uid() IS NOT NULL);

-- Add a policy for family users to view professional profiles
CREATE POLICY "Family users can view professional profiles" ON profiles
FOR SELECT 
USING (role = 'professional' AND EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'family'
));

-- Clean up any remaining recursive policies on other tables
DROP POLICY IF EXISTS "Admins can view all care plans" ON care_plans;
DROP POLICY IF EXISTS "Admins can view all care needs" ON care_needs_family;
DROP POLICY IF EXISTS "Admins can view all care recipients" ON care_recipient_profiles;