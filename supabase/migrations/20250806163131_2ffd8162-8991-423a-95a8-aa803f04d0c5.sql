-- Create the missing trigger function that calls the edge function when caregiver availability changes
CREATE OR REPLACE FUNCTION public.notify_caregiver_availability_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  response jsonb;
BEGIN
  -- Only trigger for professional users when available_for_matching changes
  IF NEW.role = 'professional' AND 
     (OLD.available_for_matching IS DISTINCT FROM NEW.available_for_matching) THEN
    
    -- Call the edge function asynchronously
    -- Note: In a real implementation, this would need to be handled via a job queue
    -- For now, we'll log the change and let manual backfill handle existing caregivers
    INSERT INTO match_recalculation_log (
      caregiver_id,
      caregiver_name,
      previous_status,
      new_status,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.full_name,
      COALESCE(OLD.available_for_matching, false),
      COALESCE(NEW.available_for_matching, false),
      'triggered',
      NOW(),
      NOW()
    );
    
    -- TODO: In production, this should call the edge function via a job queue
    -- For now, admins can use the manual backfill button
    
  END IF;
  
  RETURN NEW;
END;
$function$;