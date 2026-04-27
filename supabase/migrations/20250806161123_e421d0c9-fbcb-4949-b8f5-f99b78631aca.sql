-- Create the missing trigger for caregiver availability changes
CREATE OR REPLACE FUNCTION trigger_caregiver_availability_change()
RETURNS TRIGGER AS $$
DECLARE
    caregiver_name TEXT;
BEGIN
    -- Only proceed if this is a professional user
    IF NEW.role != 'professional' THEN
        RETURN NEW;
    END IF;
    
    -- Only proceed if available_for_matching has changed
    IF OLD.available_for_matching IS NOT DISTINCT FROM NEW.available_for_matching THEN
        RETURN NEW;
    END IF;
    
    -- Get the caregiver's name for logging
    caregiver_name := COALESCE(NEW.full_name, 'Unknown');
    
    -- Call the edge function asynchronously via HTTP request
    -- Note: This will be handled by the edge function we created
    PERFORM pg_notify('caregiver_availability_changed', 
        json_build_object(
            'caregiver_id', NEW.id,
            'caregiver_name', caregiver_name,
            'previous_status', COALESCE(OLD.available_for_matching, false),
            'new_status', COALESCE(NEW.available_for_matching, false)
        )::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on profiles table
DROP TRIGGER IF EXISTS caregiver_availability_change_trigger ON profiles;
CREATE TRIGGER caregiver_availability_change_trigger
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_caregiver_availability_change();