-- Create quiz_leads table for anonymous quiz completers
CREATE TABLE public.quiz_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_method text NOT NULL CHECK (contact_method IN ('whatsapp', 'email')),
  whatsapp_number text,
  email text,
  client_stage smallint NOT NULL CHECK (client_stage BETWEEN 1 AND 4),
  quiz_responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  reflection text,
  source_path text DEFAULT '/family/readiness-quiz',
  converted_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_leads_contact_present CHECK (
    (contact_method = 'whatsapp' AND whatsapp_number IS NOT NULL)
    OR (contact_method = 'email' AND email IS NOT NULL)
  )
);

-- Indexes for admin queries + conversion linkage
CREATE INDEX idx_quiz_leads_email ON public.quiz_leads(email) WHERE email IS NOT NULL;
CREATE INDEX idx_quiz_leads_whatsapp ON public.quiz_leads(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
CREATE INDEX idx_quiz_leads_created_at ON public.quiz_leads(created_at DESC);
CREATE INDEX idx_quiz_leads_converted_user ON public.quiz_leads(converted_user_id) WHERE converted_user_id IS NOT NULL;
CREATE INDEX idx_quiz_leads_stage ON public.quiz_leads(client_stage);

-- Enable RLS
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- Anonymous + authenticated users can INSERT a lead (required for logged-out quiz completion)
CREATE POLICY "Anyone can submit a quiz lead"
ON public.quiz_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can SELECT
CREATE POLICY "Admins can view all quiz leads"
ON public.quiz_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can UPDATE
CREATE POLICY "Admins can update quiz leads"
ON public.quiz_leads
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can DELETE
CREATE POLICY "Admins can delete quiz leads"
ON public.quiz_leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_quiz_leads_updated_at
BEFORE UPDATE ON public.quiz_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function: when a new profile is created, link any matching quiz_leads
CREATE OR REPLACE FUNCTION public.link_quiz_leads_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_phone text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  user_phone := NEW.phone_number;

  -- Link any unconverted leads matching this user's email or phone
  UPDATE public.quiz_leads
  SET converted_user_id = NEW.id,
      updated_at = now()
  WHERE converted_user_id IS NULL
    AND (
      (user_email IS NOT NULL AND lower(email) = lower(user_email))
      OR (user_phone IS NOT NULL AND regexp_replace(whatsapp_number, '[^0-9]', '', 'g') = regexp_replace(user_phone, '[^0-9]', '', 'g'))
    );

  RETURN NEW;
END;
$$;

-- Fire on profile insert + on profile update (in case phone added later)
CREATE TRIGGER link_quiz_leads_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.link_quiz_leads_to_profile();

CREATE TRIGGER link_quiz_leads_on_profile_phone_update
AFTER UPDATE OF phone_number ON public.profiles
FOR EACH ROW
WHEN (OLD.phone_number IS DISTINCT FROM NEW.phone_number)
EXECUTE FUNCTION public.link_quiz_leads_to_profile();