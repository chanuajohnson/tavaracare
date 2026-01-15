-- Create function to handle caregiver availability changes
CREATE OR REPLACE FUNCTION handle_caregiver_availability_change()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
BEGIN
  -- Only process changes for professional users
  IF NEW.role = 'professional' AND OLD.available_for_matching IS DISTINCT FROM NEW.available_for_matching THEN
    -- Call edge function to recalculate matches
    -- Use pg_net extension to make HTTP request asynchronously
    SELECT net.http_post(
      url := 'https://cpdfmyemjrefnhddyrck.supabase.co/functions/v1/recalculate-matches-on-availability-change',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
      ),
      body := jsonb_build_object(
        'caregiver_id', NEW.id,
        'previous_status', OLD.available_for_matching,
        'new_status', NEW.available_for_matching,
        'caregiver_name', NEW.full_name
      )
    ) INTO function_url;
    
    -- Log the availability change
    INSERT INTO admin_communications (
      admin_id,
      target_user_id,
      message_type,
      custom_message,
      sent_at
    ) VALUES (
      NULL, -- System generated
      NEW.id,
      'availability_status_changed',
      format('Caregiver availability changed from %s to %s, recalculating matches', 
             OLD.available_for_matching, NEW.available_for_matching),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for caregiver availability changes
DROP TRIGGER IF EXISTS trigger_caregiver_availability_change ON profiles;
CREATE TRIGGER trigger_caregiver_availability_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_caregiver_availability_change();

-- Create rate limiting table for match recalculations
CREATE TABLE IF NOT EXISTS match_recalculation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id uuid NOT NULL,
  recalculation_type text NOT NULL, -- 'availability_change', 'manual', etc.
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  assignments_created integer DEFAULT 0,
  assignments_removed integer DEFAULT 0,
  error_message text
);

-- Enable RLS on the new table
ALTER TABLE match_recalculation_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admins to view recalculation logs
CREATE POLICY "Admins can view match recalculation logs"
ON match_recalculation_log
FOR SELECT
USING (COALESCE((((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text), 'family'::text) = 'admin'::text);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_match_recalculation_log_caregiver_created 
ON match_recalculation_log(caregiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_recalculation_log_status_created 
ON match_recalculation_log(status, created_at DESC);