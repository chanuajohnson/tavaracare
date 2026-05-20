
-- 1) work_log_expenses: replace stale deny-only policies with full policy set
DROP POLICY IF EXISTS deny_writes_when_limited_ins ON public.work_log_expenses;
DROP POLICY IF EXISTS deny_writes_when_limited_upd ON public.work_log_expenses;
DROP POLICY IF EXISTS deny_writes_when_limited_del ON public.work_log_expenses;

ALTER TABLE public.work_log_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wle_select_authorized"
ON public.work_log_expenses
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.work_logs wl
    JOIN public.care_team_members ctm ON ctm.id = wl.care_team_member_id
    WHERE wl.id = work_log_expenses.work_log_id
      AND (ctm.caregiver_id = auth.uid() OR ctm.family_id = auth.uid())
  )
);

CREATE POLICY "wle_insert_caregiver_or_admin"
ON public.work_log_expenses
FOR INSERT
TO authenticated
WITH CHECK (
  NOT public.is_account_limited(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.work_logs wl
      JOIN public.care_team_members ctm ON ctm.id = wl.care_team_member_id
      WHERE wl.id = work_log_expenses.work_log_id
        AND ctm.caregiver_id = auth.uid()
    )
  )
);

CREATE POLICY "wle_update_caregiver_or_admin"
ON public.work_log_expenses
FOR UPDATE
TO authenticated
USING (
  NOT public.is_account_limited(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.work_logs wl
      JOIN public.care_team_members ctm ON ctm.id = wl.care_team_member_id
      WHERE wl.id = work_log_expenses.work_log_id
        AND ctm.caregiver_id = auth.uid()
    )
  )
)
WITH CHECK (
  NOT public.is_account_limited(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.work_logs wl
      JOIN public.care_team_members ctm ON ctm.id = wl.care_team_member_id
      WHERE wl.id = work_log_expenses.work_log_id
        AND ctm.caregiver_id = auth.uid()
    )
  )
);

CREATE POLICY "wle_delete_caregiver_or_admin"
ON public.work_log_expenses
FOR DELETE
TO authenticated
USING (
  NOT public.is_account_limited(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.work_logs wl
      JOIN public.care_team_members ctm ON ctm.id = wl.care_team_member_id
      WHERE wl.id = work_log_expenses.work_log_id
        AND ctm.caregiver_id = auth.uid()
    )
  )
);

-- 2) user_journey: write-mostly analytics
ALTER TABLE public.user_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uj_insert_any"
ON public.user_journey
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "uj_select_own_or_admin"
ON public.user_journey
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "uj_update_admin"
ON public.user_journey
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "uj_delete_admin"
ON public.user_journey
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3) holidays: reference data
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "holidays_select_authenticated"
ON public.holidays
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "holidays_insert_admin"
ON public.holidays
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "holidays_update_admin"
ON public.holidays
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "holidays_delete_admin"
ON public.holidays
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
