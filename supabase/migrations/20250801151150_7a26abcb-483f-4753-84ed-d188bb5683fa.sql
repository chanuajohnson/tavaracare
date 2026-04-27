-- EMERGENCY FIX: Simplify care_plans policy to eliminate infinite recursion
-- Remove all complex JOINs and EXISTS clauses that cause circular references

-- Step 1: Drop the problematic care_plans policy with EXISTS clause
DROP POLICY IF EXISTS "care_plans_access" ON public.care_plans;

-- Step 2: Create ultra-simple care_plans policy using ONLY family_id
CREATE POLICY "family_owns_care_plans" ON public.care_plans
FOR ALL USING (family_id = auth.uid());

-- Step 3: Ensure RLS is enabled on care_plans
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify no circular references remain in any policies
-- This policy should now allow "Peltier's Care Plan 2025" to load without recursion