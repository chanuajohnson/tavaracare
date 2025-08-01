-- CRITICAL SECURITY FIX: Enable RLS on tables with existing policies
-- These tables have RLS policies defined but RLS is not enabled (CRITICAL VULNERABILITY)

-- Enable RLS on medications table (has policies but RLS disabled)
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on visit_bookings table (has policies but RLS disabled)  
ALTER TABLE public.visit_bookings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on work_logs table (has policies but RLS disabled)
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;