
-- First, let's see what the current check constraint allows for status
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'care_shifts'::regclass 
AND contype = 'c' 
AND conname LIKE '%status%';

-- Let's also check what status values currently exist in the table
SELECT DISTINCT status, COUNT(*) 
FROM care_shifts 
GROUP BY status;
