
-- Create family_chat_requests table for professional-initiated chat requests
CREATE TABLE public.family_chat_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ
);

-- Create family_chat_sessions table for professional-initiated chat sessions
CREATE TABLE public.family_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id TEXT NOT NULL,
  family_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  max_daily_messages INTEGER NOT NULL DEFAULT 3,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create family_chat_messages table for professional-initiated chat messages
CREATE TABLE public.family_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES family_chat_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat',
  is_tav_moderated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.family_chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for family_chat_requests
CREATE POLICY "Professionals can view their sent requests" ON public.family_chat_requests
  FOR SELECT USING (professional_id = auth.uid());

CREATE POLICY "Families can view requests sent to them" ON public.family_chat_requests
  FOR SELECT USING (family_user_id = auth.uid());

CREATE POLICY "Professionals can create requests" ON public.family_chat_requests
  FOR INSERT WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Only families can update their received requests" ON public.family_chat_requests
  FOR UPDATE USING (family_user_id = auth.uid());

-- RLS policies for family_chat_sessions
CREATE POLICY "Participants can view their sessions" ON public.family_chat_sessions
  FOR SELECT USING (family_user_id = auth.uid() OR professional_id = auth.uid()::text);

CREATE POLICY "Professionals can create sessions" ON public.family_chat_sessions
  FOR INSERT WITH CHECK (professional_id = auth.uid()::text);

-- RLS policies for family_chat_messages
CREATE POLICY "Session participants can view messages" ON public.family_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_chat_sessions 
      WHERE id = session_id 
      AND (family_user_id = auth.uid() OR professional_id = auth.uid()::text)
    )
  );

CREATE POLICY "Session participants can create messages" ON public.family_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_chat_sessions 
      WHERE id = session_id 
      AND (family_user_id = auth.uid() OR professional_id = auth.uid()::text)
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_family_chat_requests_professional_id ON public.family_chat_requests(professional_id);
CREATE INDEX idx_family_chat_requests_family_user_id ON public.family_chat_requests(family_user_id);
CREATE INDEX idx_family_chat_requests_status ON public.family_chat_requests(status);
CREATE INDEX idx_family_chat_sessions_professional_id ON public.family_chat_sessions(professional_id);
CREATE INDEX idx_family_chat_sessions_family_user_id ON public.family_chat_sessions(family_user_id);
CREATE INDEX idx_family_chat_messages_session_id ON public.family_chat_messages(session_id);
