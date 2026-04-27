-- Complete RLS Recursion Fix for Profiles Table
-- Phase 1: Drop all existing problematic policies

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Professionals can view accessible family profiles" ON profiles;

-- Phase 2: Create clean, non-recursive policies

-- Basic user profile access (simple, no EXISTS clauses)
CREATE POLICY "Basic user profile access" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Basic user profile creation" ON profiles  
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Basic user profile updates" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Admin access using JWT metadata (no table lookups)
CREATE POLICY "Admin access via JWT" ON profiles
FOR ALL USING (
  COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'
  ) = 'admin'
);

-- Professional access to assigned families (simplified)
CREATE POLICY "Professional assigned family access" ON profiles
FOR SELECT USING (
  role = 'family' AND EXISTS (
    SELECT 1 FROM care_team_members ctm
    WHERE ctm.family_id = profiles.id 
    AND ctm.caregiver_id = auth.uid()
    AND ctm.status = 'active'
  )
);