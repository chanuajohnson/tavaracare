
-- 1. Admin RLS policy for care_plans
CREATE POLICY "admins_manage_all_care_plans" ON care_plans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Admin RLS policies for medications
CREATE POLICY "admins_view_all_medications" ON medications
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_insert_medications" ON medications
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_update_medications" ON medications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_delete_medications" ON medications
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Admin RLS policy for meal_plans
CREATE POLICY "admins_manage_all_meal_plans" ON meal_plans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Admin RLS policy for medication_administrations
CREATE POLICY "admins_view_all_medication_administrations" ON medication_administrations
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Create care_plan_edit_log table
CREATE TABLE public.care_plan_edit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid REFERENCES care_plans(id) ON DELETE CASCADE NOT NULL,
  edited_by uuid NOT NULL,
  editor_role text NOT NULL,
  edit_type text NOT NULL,
  edit_summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.care_plan_edit_log ENABLE ROW LEVEL SECURITY;

-- Family can see edit logs for their own care plans
CREATE POLICY "family_view_own_edit_logs" ON care_plan_edit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_plans cp
      WHERE cp.id = care_plan_edit_log.care_plan_id
      AND cp.family_id = auth.uid()
    )
  );

-- Admins can see all edit logs
CREATE POLICY "admins_view_all_edit_logs" ON care_plan_edit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can insert edit logs for care plans they have access to
CREATE POLICY "users_insert_edit_logs" ON care_plan_edit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    edited_by = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM care_plans cp
        WHERE cp.id = care_plan_edit_log.care_plan_id
        AND cp.family_id = auth.uid()
      )
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- Create index for performance
CREATE INDEX idx_care_plan_edit_log_care_plan_id ON care_plan_edit_log(care_plan_id);
CREATE INDEX idx_care_plan_edit_log_created_at ON care_plan_edit_log(created_at DESC);
