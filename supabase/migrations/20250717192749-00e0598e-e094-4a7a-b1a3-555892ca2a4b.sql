-- Add RLS policy for professionals to view family profiles when they have active assignments
CREATE POLICY "Professionals can view family profiles for active assignments" 
ON profiles 
FOR SELECT 
USING (
  -- Allow professionals to view family profiles when they have active assignments
  EXISTS (
    SELECT 1 FROM admin_match_interventions 
    WHERE family_user_id = profiles.id 
    AND caregiver_id = auth.uid() 
    AND status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM care_team_members 
    WHERE family_id = profiles.id 
    AND caregiver_id = auth.uid() 
    AND status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM automatic_assignments 
    WHERE family_user_id = profiles.id 
    AND caregiver_id = auth.uid() 
    AND is_active = true
  )
);