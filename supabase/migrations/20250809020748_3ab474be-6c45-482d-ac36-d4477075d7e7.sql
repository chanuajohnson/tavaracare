-- 1) Add sender column to caregiver_chat_messages with constraint and default
ALTER TABLE public.caregiver_chat_messages
ADD COLUMN IF NOT EXISTS sender text NOT NULL DEFAULT 'tav';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'caregiver_chat_messages_sender_check'
  ) THEN
    ALTER TABLE public.caregiver_chat_messages
    ADD CONSTRAINT caregiver_chat_messages_sender_check
    CHECK (sender IN ('family','caregiver','tav'));
  END IF;
END $$;

-- 2) Backfill sender values based on existing columns
UPDATE public.caregiver_chat_messages
SET sender = 'family'
WHERE is_user = true;

UPDATE public.caregiver_chat_messages
SET sender = 'tav'
WHERE is_user = false AND is_tav_moderated = true;

-- Any remaining rows will keep default 'tav'

-- 3) RLS policies to allow caregivers to access their sessions (in addition to families)
-- Caregiver SELECT on sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'caregiver_chat_sessions' 
      AND policyname = 'Caregivers can view their own chat sessions'
  ) THEN
    CREATE POLICY "Caregivers can view their own chat sessions"
    ON public.caregiver_chat_sessions
    FOR SELECT
    USING (caregiver_id = auth.uid()::text);
  END IF;
END $$;

-- Caregiver UPDATE on sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'caregiver_chat_sessions' 
      AND policyname = 'Caregivers can update their own chat sessions'
  ) THEN
    CREATE POLICY "Caregivers can update their own chat sessions"
    ON public.caregiver_chat_sessions
    FOR UPDATE
    USING (caregiver_id = auth.uid()::text);
  END IF;
END $$;

-- 4) RLS policies to allow caregivers to read/insert messages for their sessions
-- Caregiver SELECT on messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'caregiver_chat_messages' 
      AND policyname = 'Caregivers can view messages from their sessions'
  ) THEN
    CREATE POLICY "Caregivers can view messages from their sessions"
    ON public.caregiver_chat_messages
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.caregiver_chat_sessions s
        WHERE s.id = caregiver_chat_messages.session_id
          AND s.caregiver_id = auth.uid()::text
      )
    );
  END IF;
END $$;

-- Caregiver INSERT on messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'caregiver_chat_messages' 
      AND policyname = 'Caregivers can create messages in their sessions'
  ) THEN
    CREATE POLICY "Caregivers can create messages in their sessions"
    ON public.caregiver_chat_messages
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.caregiver_chat_sessions s
        WHERE s.id = caregiver_chat_messages.session_id
          AND s.caregiver_id = auth.uid()::text
      )
    );
  END IF;
END $$;