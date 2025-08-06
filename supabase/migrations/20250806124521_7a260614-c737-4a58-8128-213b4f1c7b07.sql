-- Add missing manual_match_assigned column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS manual_match_assigned boolean DEFAULT false;

-- Update the trigger_journey_progress_update function to skip DELETE operations
CREATE OR REPLACE FUNCTION public.trigger_journey_progress_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Skip journey progress calculation for DELETE operations
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  -- Determine the user ID based on the table being updated
  CASE TG_TABLE_NAME
    WHEN 'profiles' THEN
      target_user_id := COALESCE(NEW.id, OLD.id);
    WHEN 'care_needs_family' THEN
      target_user_id := COALESCE(NEW.profile_id, OLD.profile_id);
    WHEN 'care_recipient_profiles' THEN
      target_user_id := COALESCE(NEW.user_id, OLD.user_id);
    WHEN 'payment_transactions' THEN
      target_user_id := COALESCE(NEW.user_id, OLD.user_id);
    WHEN 'care_plans' THEN
      target_user_id := COALESCE(NEW.family_id, OLD.family_id);
    WHEN 'visit_bookings' THEN
      target_user_id := COALESCE(NEW.user_id, OLD.user_id);
    WHEN 'professional_documents' THEN
      target_user_id := COALESCE(NEW.user_id, OLD.user_id);
    ELSE
      -- Default fallback - try common field names
      target_user_id := COALESCE(
        NEW.user_id, OLD.user_id,
        NEW.profile_id, OLD.profile_id,
        NEW.family_id, OLD.family_id,
        NEW.id, OLD.id
      );
  END CASE;
  
  -- Only proceed if we found a valid user ID
  IF target_user_id IS NOT NULL THEN
    -- Schedule progress recalculation for the affected user
    PERFORM calculate_and_update_journey_progress(target_user_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;