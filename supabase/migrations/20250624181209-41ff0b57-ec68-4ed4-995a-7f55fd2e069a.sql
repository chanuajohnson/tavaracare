
-- First check what status values are currently in use
SELECT status, COUNT(*) as count
FROM care_shifts 
WHERE caregiver_id IS NOT NULL
GROUP BY status
ORDER BY count DESC;

-- Then update the shifts with a more targeted approach
-- We'll only update shifts that currently have 'open' status and a caregiver assigned
UPDATE care_shifts 
SET status = 'open', updated_at = NOW()
WHERE caregiver_id IS NOT NULL 
AND status = 'open';
