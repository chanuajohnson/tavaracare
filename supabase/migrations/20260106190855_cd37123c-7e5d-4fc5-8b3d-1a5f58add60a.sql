-- Allow public to view profiles of caregivers who are in the active spotlight
CREATE POLICY "Public can view spotlight caregiver profiles"
ON profiles
FOR SELECT
USING (
  id IN (
    SELECT caregiver_id 
    FROM caregiver_spotlight 
    WHERE is_active = true
    AND (start_date IS NULL OR start_date <= CURRENT_DATE)
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  )
);