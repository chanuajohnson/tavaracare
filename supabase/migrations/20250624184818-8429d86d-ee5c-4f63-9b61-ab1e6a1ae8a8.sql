
-- Update all existing care_shifts that have a caregiver assigned but status is 'open' to 'confirmed'
UPDATE care_shifts 
SET status = 'confirmed', updated_at = NOW()
WHERE caregiver_id IS NOT NULL 
AND status = 'open';

-- Optional: Check the results of the update
SELECT status, COUNT(*) as count
FROM care_shifts 
WHERE caregiver_id IS NOT NULL
GROUP BY status
ORDER BY count DESC;
