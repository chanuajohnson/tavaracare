-- Helper: detect accounts that should be denied write access
CREATE OR REPLACE FUNCTION public.is_account_limited(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _uid
      AND account_status IN ('limited','banned','deleted')
  )
$$;

-- Apply RESTRICTIVE deny-writes policies to every table a family can mutate.
-- RESTRICTIVE policies AND with existing PERMISSIVE policies, so reads keep working
-- and admin writes (admins always have account_status='active') are unaffected.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles',
    'care_plans',
    'care_plan_edit_log',
    'care_shifts',
    'shift_coverage_requests',
    'shift_coverage_claims',
    'shift_notifications',
    'care_team_members',
    'employer_settings',
    'medications',
    'medication_administrations',
    'meal_plans',
    'meal_plan_items',
    'grocery_lists',
    'grocery_items',
    'recipes',
    'family_chat_messages',
    'family_chat_requests',
    'family_chat_sessions',
    'work_logs',
    'work_log_expenses',
    'payroll_entries'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      EXECUTE format('DROP POLICY IF EXISTS deny_writes_when_limited_ins ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS deny_writes_when_limited_upd ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS deny_writes_when_limited_del ON public.%I', t);

      EXECUTE format($f$
        CREATE POLICY deny_writes_when_limited_ins ON public.%I
        AS RESTRICTIVE FOR INSERT TO authenticated
        WITH CHECK (NOT public.is_account_limited(auth.uid()))
      $f$, t);

      EXECUTE format($f$
        CREATE POLICY deny_writes_when_limited_upd ON public.%I
        AS RESTRICTIVE FOR UPDATE TO authenticated
        USING (NOT public.is_account_limited(auth.uid()))
        WITH CHECK (NOT public.is_account_limited(auth.uid()))
      $f$, t);

      EXECUTE format($f$
        CREATE POLICY deny_writes_when_limited_del ON public.%I
        AS RESTRICTIVE FOR DELETE TO authenticated
        USING (NOT public.is_account_limited(auth.uid()))
      $f$, t);
    END IF;
  END LOOP;
END$$;