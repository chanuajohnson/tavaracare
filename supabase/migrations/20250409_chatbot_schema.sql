
-- Create chatbot_conversations table
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  handoff_requested BOOLEAN DEFAULT false,
  converted_to_registration BOOLEAN DEFAULT false,
  conversation_data JSONB NOT NULL DEFAULT '[]',
  contact_info JSONB NULL,
  care_needs JSONB NULL,
  lead_score INTEGER NULL,
  qualification_status TEXT NULL,
  user_role TEXT NULL
);

-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chatbot_conversations(id) NULL,
  sender_type TEXT NOT NULL, -- 'user', 'bot', 'human_agent'
  message TEXT NOT NULL,
  message_type TEXT NULL, -- 'text', 'option', 'handoff', 'form'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  context_data JSONB NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON public.chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON public.chatbot_messages(conversation_id);

-- Add Row Level Security policies
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Policy for chatbot conversations
CREATE POLICY "Anyone can access chatbot conversations" 
ON public.chatbot_conversations FOR SELECT 
TO public
USING (true);

CREATE POLICY "Anyone can insert chatbot conversations"
ON public.chatbot_conversations FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update their own chatbot conversations"
ON public.chatbot_conversations FOR UPDATE
TO public
USING (true);

-- Policy for chatbot messages
CREATE POLICY "Anyone can access chatbot messages" 
ON public.chatbot_messages FOR SELECT 
TO public
USING (true);

CREATE POLICY "Anyone can insert chatbot messages"
ON public.chatbot_messages FOR INSERT
TO public
WITH CHECK (true);
