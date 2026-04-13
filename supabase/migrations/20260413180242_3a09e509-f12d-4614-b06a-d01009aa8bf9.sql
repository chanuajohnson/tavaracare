
-- 1. RPC for professional teammate visibility
CREATE OR REPLACE FUNCTION public.get_professional_care_plan_team_members(plan_id uuid)
RETURNS TABLE(
  id uuid,
  care_plan_id uuid,
  caregiver_id uuid,
  role text,
  status text,
  full_name text,
  professional_type text,
  avatar_url text,
  phone_number text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify calling user is an active member of this care plan
  IF NOT EXISTS (
    SELECT 1 FROM care_team_members ctm
    WHERE ctm.care_plan_id = plan_id
      AND ctm.caregiver_id = auth.uid()
      AND ctm.status = 'active'
  ) THEN
    -- Also allow admins
    IF NOT public.is_current_user_admin() THEN
      RETURN; -- empty result
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    ctm.id,
    ctm.care_plan_id,
    ctm.caregiver_id,
    ctm.role,
    ctm.status,
    p.full_name,
    p.professional_type,
    p.avatar_url,
    p.phone_number
  FROM care_team_members ctm
  LEFT JOIN profiles p ON p.id = ctm.caregiver_id
  WHERE ctm.care_plan_id = plan_id;
END;
$$;

-- 2. Add NIS columns to payroll_entries
ALTER TABLE public.payroll_entries
  ADD COLUMN IF NOT EXISTS nis_applicable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS nis_class text,
  ADD COLUMN IF NOT EXISTS employee_contribution numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employer_contribution numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_pay numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_pay_after_nis numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nis_response jsonb;
