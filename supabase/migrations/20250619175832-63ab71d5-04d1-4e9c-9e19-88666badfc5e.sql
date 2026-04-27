
-- Fix caregiver_id data type mismatch in caregiver_chat_requests table
-- This is causing silent failures when creating chat requests

-- First, check if there's any existing data and clean it up
DELETE FROM caregiver_chat_requests WHERE caregiver_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Change caregiver_id from text to uuid
ALTER TABLE caregiver_chat_requests 
ALTER COLUMN caregiver_id TYPE uuid USING caregiver_id::uuid;

-- Add foreign key constraint to ensure data integrity
ALTER TABLE caregiver_chat_requests 
ADD CONSTRAINT fk_caregiver_chat_requests_caregiver_id 
FOREIGN KEY (caregiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also ensure we have proper RLS policies for the chat requests tables
DROP POLICY IF EXISTS "Users can view their chat requests" ON public.caregiver_chat_requests;
DROP POLICY IF EXISTS "Users can create chat requests" ON public.caregiver_chat_requests;
DROP POLICY IF EXISTS "Caregivers can view their chat requests" ON public.caregiver_chat_requests;

-- Allow family users to create and view their own chat requests
CREATE POLICY "Family users can create chat requests" 
  ON public.caregiver_chat_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = family_user_id);

CREATE POLICY "Family users can view their chat requests" 
  ON public.caregiver_chat_requests 
  FOR SELECT 
  USING (auth.uid() = family_user_id);

-- Allow caregivers to view chat requests directed to them
CREATE POLICY "Caregivers can view their chat requests" 
  ON public.caregiver_chat_requests 
  FOR SELECT 
  USING (auth.uid() = caregiver_id);

-- Allow caregivers to update their chat requests (accept/decline)
CREATE POLICY "Caregivers can update their chat requests" 
  ON public.caregiver_chat_requests 
  FOR UPDATE 
  USING (auth.uid() = caregiver_id);

-- Enable RLS on the table
ALTER TABLE caregiver_chat_requests ENABLE ROW LEVEL SECURITY;

-- Also fix the caregiver_notifications table policies
DROP POLICY IF EXISTS "Caregivers can view their notifications" ON public.caregiver_notifications;
CREATE POLICY "Caregivers can view their notifications" 
  ON public.caregiver_notifications 
  FOR SELECT 
  USING (auth.uid()::text = caregiver_id);

ALTER TABLE caregiver_notifications ENABLE ROW LEVEL SECURITY;
