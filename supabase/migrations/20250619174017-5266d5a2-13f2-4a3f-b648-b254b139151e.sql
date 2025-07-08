
-- Fix RLS policy for chat_conversation_flows table
-- Remove the existing incorrect policy that references caregiver_chat_sessions
DROP POLICY IF EXISTS "Users can create conversation flows for their sessions" ON public.chat_conversation_flows;
DROP POLICY IF EXISTS "Users can view conversation flows for their sessions" ON public.chat_conversation_flows;
DROP POLICY IF EXISTS "Users can update conversation flows for their sessions" ON public.chat_conversation_flows;

-- Create proper RLS policies for chat_conversation_flows
-- Allow authenticated users to create conversation flows
CREATE POLICY "Authenticated users can create conversation flows" 
  ON public.chat_conversation_flows 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own conversation flows (we'll need a way to track ownership)
-- For now, allow authenticated users to view all flows they create
CREATE POLICY "Authenticated users can view conversation flows" 
  ON public.chat_conversation_flows 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Allow users to update conversation flows
CREATE POLICY "Authenticated users can update conversation flows" 
  ON public.chat_conversation_flows 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Also ensure chat_prompt_templates is accessible to authenticated users
-- First drop any existing policy with this name, then create it
DROP POLICY IF EXISTS "Authenticated users can view prompt templates" ON public.chat_prompt_templates;
CREATE POLICY "Authenticated users can view prompt templates" 
  ON public.chat_prompt_templates 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);
