
-- Add new status for user-initiated WhatsApp messages
ALTER TABLE whatsapp_message_log 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';

-- Update existing records to have a default status
UPDATE whatsapp_message_log 
SET status = 'sent' 
WHERE status IS NULL;

-- Add status column if delivery_status doesn't exist (fallback compatibility)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'whatsapp_message_log' 
                   AND column_name = 'delivery_status') THEN
        ALTER TABLE whatsapp_message_log ADD COLUMN delivery_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_log_status 
ON whatsapp_message_log(status);

-- Add comment to document the new flow
COMMENT ON COLUMN whatsapp_message_log.status IS 'Status of WhatsApp message: pending_user_send, sent, delivered, failed';
