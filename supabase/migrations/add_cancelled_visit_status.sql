
-- Add 'cancelled' as a valid status for visit_scheduling_status
-- This allows users to cancel their scheduled visits and reschedule later

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_visit_scheduling_status_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_visit_scheduling_status_check 
CHECK (visit_scheduling_status IN ('not_started', 'ready_to_schedule', 'scheduled', 'completed', 'cancelled'));
