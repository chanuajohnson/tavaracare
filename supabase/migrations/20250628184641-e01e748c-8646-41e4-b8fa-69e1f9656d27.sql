
-- Create table for WhatsApp authentication (new table)
CREATE TABLE whatsapp_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL DEFAULT '868',
  formatted_number TEXT NOT NULL,
  verification_code TEXT,
  code_expires_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_attempts INTEGER DEFAULT 0,
  last_verification_attempt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for WhatsApp sessions (new table)
CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add WhatsApp phone number to profiles table for linked accounts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_linked_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance on new tables
CREATE INDEX idx_whatsapp_auth_phone ON whatsapp_auth(phone_number);
CREATE INDEX idx_whatsapp_auth_formatted ON whatsapp_auth(formatted_number);
CREATE INDEX idx_whatsapp_sessions_phone ON whatsapp_sessions(phone_number);
CREATE INDEX idx_whatsapp_sessions_token ON whatsapp_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_phone ON profiles(whatsapp_phone);

-- Add index to existing whatsapp_message_log table if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_log_phone ON whatsapp_message_log(phone_number);

-- Enable RLS on new tables
ALTER TABLE whatsapp_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_auth
CREATE POLICY "Users can view their own whatsapp auth records" ON whatsapp_auth
  FOR SELECT USING (
    phone_number IN (
      SELECT whatsapp_phone FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert whatsapp auth for verification" ON whatsapp_auth
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own whatsapp auth records" ON whatsapp_auth
  FOR UPDATE USING (
    phone_number IN (
      SELECT whatsapp_phone FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for whatsapp_sessions
CREATE POLICY "Users can view their own whatsapp sessions" ON whatsapp_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can insert whatsapp sessions" ON whatsapp_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own whatsapp sessions" ON whatsapp_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- Create function to format phone numbers consistently
CREATE OR REPLACE FUNCTION format_whatsapp_number(phone_input TEXT, country_code_input TEXT DEFAULT '868')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  cleaned_number TEXT;
  formatted_number TEXT;
BEGIN
  -- Remove all non-digit characters
  cleaned_number := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Handle different input formats
  IF cleaned_number ~ '^1?868[0-9]{7}$' THEN
    -- Trinidad format: 868-xxx-xxxx or 1-868-xxx-xxxx
    formatted_number := '+1' || right(cleaned_number, 10);
  ELSIF cleaned_number ~ '^[0-9]{7}$' AND country_code_input = '868' THEN
    -- Local Trinidad format: xxx-xxxx
    formatted_number := '+1868' || cleaned_number;
  ELSIF cleaned_number ~ '^[0-9]{10,15}$' THEN
    -- International format
    IF left(cleaned_number, 1) != '0' THEN
      formatted_number := '+' || cleaned_number;
    ELSE
      -- Remove leading zero and add country code
      formatted_number := '+' || country_code_input || right(cleaned_number, -1);
    END IF;
  ELSE
    -- Invalid format
    RETURN NULL;
  END IF;
  
  RETURN formatted_number;
END;
$$;

-- Create function to validate WhatsApp numbers
CREATE OR REPLACE FUNCTION validate_whatsapp_number(phone_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  cleaned_number TEXT;
BEGIN
  -- Remove all non-digit characters
  cleaned_number := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Check if it's a valid international number (7-15 digits)
  RETURN cleaned_number ~ '^[0-9]{7,15}$';
END;
$$;

-- Create trigger to auto-format phone numbers on insert/update
CREATE OR REPLACE FUNCTION auto_format_whatsapp_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-format the phone number
  NEW.formatted_number := format_whatsapp_number(NEW.phone_number, NEW.country_code);
  
  -- Validate the number
  IF NEW.formatted_number IS NULL THEN
    RAISE EXCEPTION 'Invalid phone number format: %', NEW.phone_number;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_format_whatsapp_number
  BEFORE INSERT OR UPDATE ON whatsapp_auth
  FOR EACH ROW
  EXECUTE FUNCTION auto_format_whatsapp_number();

-- Create function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_whatsapp_codes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE whatsapp_auth 
  SET 
    verification_code = NULL,
    code_expires_at = NULL
  WHERE code_expires_at < NOW() AND verification_code IS NOT NULL;
END;
$$;
