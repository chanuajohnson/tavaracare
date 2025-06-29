
-- Add user_metadata column to whatsapp_auth table
ALTER TABLE whatsapp_auth ADD COLUMN user_metadata JSONB DEFAULT '{}';

-- Add comment to document the column purpose
COMMENT ON COLUMN whatsapp_auth.user_metadata IS 'Stores user information (first_name, last_name, role) during verification process';
