
-- Create table for caregiver chat sessions and message tracking
CREATE TABLE public.caregiver_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_user_id UUID REFERENCES auth.users NOT NULL,
  caregiver_id TEXT NOT NULL, -- matches caregiver.id from matching system
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  max_daily_messages INTEGER NOT NULL DEFAULT 3,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate daily sessions
CREATE UNIQUE INDEX caregiver_chat_sessions_unique_daily 
ON public.caregiver_chat_sessions (family_user_id, caregiver_id, session_date);

-- Create table for storing chat messages
CREATE TABLE public.caregiver_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.caregiver_chat_sessions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  is_tav_moderated BOOLEAN NOT NULL DEFAULT TRUE,
  message_type TEXT NOT NULL DEFAULT 'chat', -- 'chat', 'system', 'warning', 'upsell'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.caregiver_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat sessions
CREATE POLICY "Users can view their own chat sessions" 
  ON public.caregiver_chat_sessions 
  FOR SELECT 
  USING (auth.uid() = family_user_id);

CREATE POLICY "Users can create their own chat sessions" 
  ON public.caregiver_chat_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = family_user_id);

CREATE POLICY "Users can update their own chat sessions" 
  ON public.caregiver_chat_sessions 
  FOR UPDATE 
  USING (auth.uid() = family_user_id);

-- RLS policies for chat messages
CREATE POLICY "Users can view messages from their sessions" 
  ON public.caregiver_chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.caregiver_chat_sessions 
      WHERE id = session_id AND family_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their sessions" 
  ON public.caregiver_chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.caregiver_chat_sessions 
      WHERE id = session_id AND family_user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_caregiver_chat_sessions_family_user_id ON public.caregiver_chat_sessions(family_user_id);
CREATE INDEX idx_caregiver_chat_sessions_date ON public.caregiver_chat_sessions(session_date);
CREATE INDEX idx_caregiver_chat_messages_session_id ON public.caregiver_chat_messages(session_id);
CREATE INDEX idx_caregiver_chat_messages_created_at ON public.caregiver_chat_messages(created_at);
