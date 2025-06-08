
-- Create a trigger function to update booking counts
CREATE OR REPLACE FUNCTION update_availability_slot_bookings()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE admin_availability_slots 
    SET current_bookings = current_bookings + 1
    WHERE id = NEW.availability_slot_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE admin_availability_slots 
    SET current_bookings = current_bookings - 1
    WHERE id = OLD.availability_slot_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to automatically update booking counts
DROP TRIGGER IF EXISTS trigger_update_booking_count ON visit_bookings;
CREATE TRIGGER trigger_update_booking_count
  AFTER INSERT OR DELETE ON visit_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_slot_bookings();
