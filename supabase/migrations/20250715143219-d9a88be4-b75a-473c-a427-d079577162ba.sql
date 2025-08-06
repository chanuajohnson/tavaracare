-- Update RLS policy for care_team_members to include admin access
DROP POLICY IF EXISTS "Care team members are viewable by involved users" ON care_team_members;

CREATE POLICY "Care team members are viewable by involved users and admins" 
ON care_team_members 
FOR SELECT 
USING (
  (family_id = auth.uid()) 
  OR (caregiver_id = auth.uid()) 
  OR (get_current_user_role() = 'admin')
);