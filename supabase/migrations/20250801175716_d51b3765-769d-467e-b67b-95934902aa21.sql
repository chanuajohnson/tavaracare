-- CRITICAL SECURITY FIX: Remove Security Definer Views completely
-- These views are owned by postgres superuser and pose a privilege escalation risk
-- Since they're not being used in the application, we'll drop them entirely

-- Drop the problematic views owned by postgres superuser
DROP VIEW IF EXISTS public.daily_pmf_metrics CASCADE;
DROP VIEW IF EXISTS public.feature_lookup CASCADE; 
DROP VIEW IF EXISTS public.feature_statistics CASCADE;