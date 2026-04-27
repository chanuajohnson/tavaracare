-- Repair Denise's care_team_members row for the Aimey care plan:
-- family_id was incorrectly set to Chanua (admin) instead of Ana Maria Aimey (family).
UPDATE public.care_team_members
SET family_id = '9874b53e-ea23-4ccb-abed-ddbb0367edf5',
    updated_at = now()
WHERE id = '2acc673b-e572-4f55-8677-b25530d2cd73'
  AND caregiver_id = '24fe4121-89e6-4a3a-ba9c-c56e768afc05'
  AND care_plan_id  = '3d634783-c041-476d-8360-2980846a39e4';

-- Re-attach Chanua (admin) to the Aimey care plan as a backup coordinator.
-- Role must be one of ('caregiver','primary','backup'); using 'backup' to avoid
-- displacing the primary caregiver (Denise) on the plan.
INSERT INTO public.care_team_members (
  care_plan_id,
  family_id,
  caregiver_id,
  role,
  status,
  display_name,
  notes
)
SELECT
  '3d634783-c041-476d-8360-2980846a39e4',
  '9874b53e-ea23-4ccb-abed-ddbb0367edf5',
  '6d089663-8794-444e-99fa-ae480d3f3c35',
  'backup',
  'active',
  'Chanua Johnson — Care Coordinator (Admin)',
  'Tavara admin coordinator attached for oversight; not a billable caregiver.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.care_team_members
  WHERE care_plan_id = '3d634783-c041-476d-8360-2980846a39e4'
    AND caregiver_id = '6d089663-8794-444e-99fa-ae480d3f3c35'
    AND status = 'active'
);