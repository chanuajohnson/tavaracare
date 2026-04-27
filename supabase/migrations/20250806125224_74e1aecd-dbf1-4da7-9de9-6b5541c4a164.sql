-- Fix foreign key constraint for user_journey_progress to allow user deletion
-- Drop the existing constraint that has NO ACTION delete behavior
ALTER TABLE user_journey_progress 
DROP CONSTRAINT IF EXISTS user_journey_progress_user_id_fkey;

-- Recreate the constraint with CASCADE delete behavior
-- This ensures that when a profile is deleted, all associated journey progress records are automatically deleted
ALTER TABLE user_journey_progress 
ADD CONSTRAINT user_journey_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;