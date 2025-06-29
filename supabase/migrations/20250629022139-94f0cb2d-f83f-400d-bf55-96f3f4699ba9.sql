
-- Create a function to increment verification attempts
CREATE OR REPLACE FUNCTION increment_verification_attempts(phone_input text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE whatsapp_auth 
  SET 
    verification_attempts = verification_attempts + 1,
    last_verification_attempt = NOW()
  WHERE phone_number = phone_input;
END;
$$;
