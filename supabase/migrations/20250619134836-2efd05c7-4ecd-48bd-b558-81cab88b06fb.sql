
-- Create table for caregiver chat requests (gateway/acceptance flow)
CREATE TABLE caregiver_chat_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_user_id UUID NOT NULL,
  caregiver_id TEXT NOT NULL,
  initial_message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for chat conversation flows
CREATE TABLE chat_conversation_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'introduction' CHECK (current_stage IN ('introduction', 'interest_expression', 'waiting_acceptance', 'guided_qa')),
  stage_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for chat prompt templates
CREATE TABLE chat_prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL,
  category TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  context_requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for caregiver notifications
CREATE TABLE caregiver_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'chat_request',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE caregiver_chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for caregiver_chat_requests
CREATE POLICY "Users can view their own chat requests" ON caregiver_chat_requests
  FOR SELECT USING (family_user_id = auth.uid());

CREATE POLICY "Users can create their own chat requests" ON caregiver_chat_requests
  FOR INSERT WITH CHECK (family_user_id = auth.uid());

-- Policies for chat_conversation_flows
CREATE POLICY "Users can manage their own conversation flows" ON chat_conversation_flows
  FOR ALL USING (session_id IN (
    SELECT id FROM caregiver_chat_sessions WHERE family_user_id = auth.uid()
  ));

-- Policies for chat_prompt_templates (read-only for users)
CREATE POLICY "Users can view active prompt templates" ON chat_prompt_templates
  FOR SELECT USING (is_active = true);

-- Policies for caregiver_notifications (caregivers can view their own)
CREATE POLICY "Caregivers can view their own notifications" ON caregiver_notifications
  FOR SELECT USING (true); -- Will need proper caregiver auth later

-- Insert initial prompt templates
INSERT INTO chat_prompt_templates (stage, category, prompt_text, order_index) VALUES
-- Introduction stage
('introduction', 'experience', 'I''d like to learn about your caregiving experience', 1),
('introduction', 'approach', 'Tell me about your care approach and philosophy', 2),
('introduction', 'availability', 'What''s your typical schedule and availability?', 3),
('introduction', 'specialty', 'Do you have experience with my specific care needs?', 4),

-- Interest expression (gateway messages)
('interest_expression', 'connection', 'I''m interested in learning more about working together', 1),
('interest_expression', 'questions', 'I have some questions about your caregiving style', 2),
('interest_expression', 'compatibility', 'I''d like to see if we''re a good match', 3),

-- Guided Q&A follow-ups
('guided_qa', 'experience_followup', 'What type of care situations do you enjoy most?', 1),
('guided_qa', 'approach_followup', 'How do you handle challenging behaviors or situations?', 2),
('guided_qa', 'availability_followup', 'Are you available for the times we need care?', 3),
('guided_qa', 'compatibility_followup', 'How do you adapt your care style to different personalities?', 4);
