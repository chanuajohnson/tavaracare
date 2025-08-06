-- Surgical RLS Policy Cleanup for profiles table
-- Remove duplicate SELECT policies that cause infinite recursion
-- Keep only the comprehensive "Users can view and update own profile" policy

-- Drop the duplicate policies (keeping the comprehensive one)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles; 
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Verify the remaining comprehensive policy exists (this should already exist)
-- Users can view and update own profile - covers both SELECT and UPDATE
-- This policy should remain and handle all profile access needs