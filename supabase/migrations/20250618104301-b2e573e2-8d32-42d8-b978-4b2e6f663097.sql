
-- Add missing columns to care_needs_family table
ALTER TABLE care_needs_family 
ADD COLUMN IF NOT EXISTS care_location text,
ADD COLUMN IF NOT EXISTS care_recipient_name text,
ADD COLUMN IF NOT EXISTS primary_contact_name text,
ADD COLUMN IF NOT EXISTS primary_contact_phone text,
ADD COLUMN IF NOT EXISTS triggers_soothing_techniques text,
ADD COLUMN IF NOT EXISTS chronic_illness_type text,
ADD COLUMN IF NOT EXISTS known_allergies text,
ADD COLUMN IF NOT EXISTS emergency_plan text,
ADD COLUMN IF NOT EXISTS checkin_preference text DEFAULT 'written',
ADD COLUMN IF NOT EXISTS cultural_preferences text;
