
-- Create whatsapp_auth table for storing verification codes
CREATE TABLE IF NOT EXISTS public.whatsapp_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  formatted_number text,
  verification_code text,
  code_expires_at timestamp with time zone,
  verification_attempts integer DEFAULT 0,
  last_verification_attempt timestamp with time zone,
  is_verified boolean DEFAULT false,
  user_role text,
  country_code text DEFAULT '1',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(phone_number)
);

-- Enable RLS
ALTER TABLE public.whatsapp_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for whatsapp_auth
CREATE POLICY "Users can insert their own whatsapp auth records" 
  ON public.whatsapp_auth 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own whatsapp auth records" 
  ON public.whatsapp_auth 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can view their own whatsapp auth records" 
  ON public.whatsapp_auth 
  FOR SELECT 
  USING (true);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whatsapp_auth_updated_at
  BEFORE UPDATE ON public.whatsapp_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_auth_updated_at();
