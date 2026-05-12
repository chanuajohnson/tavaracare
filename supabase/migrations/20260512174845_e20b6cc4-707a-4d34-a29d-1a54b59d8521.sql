
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS account_status_reason text,
  ADD COLUMN IF NOT EXISTS account_status_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_status_changed_by uuid;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_status_check') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_status_check
      CHECK (account_status IN ('active','free_only','limited','banned','deleted'));
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.admin_user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN (
    'move_to_free','limit_access','ban_user','restore_active','delete_user','note'
  )),
  previous_status text,
  new_status text,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_user_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read admin_user_actions" ON public.admin_user_actions;
CREATE POLICY "Admins can read admin_user_actions"
  ON public.admin_user_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert admin_user_actions" ON public.admin_user_actions;
CREATE POLICY "Admins can insert admin_user_actions"
  ON public.admin_user_actions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_admin_user_actions_target
  ON public.admin_user_actions(target_user_id, created_at DESC);

UPDATE public.billable_service_items
  SET unit_price = 1399.00
  WHERE id = '13e84679-a950-4ef3-9658-71ac41a5a3ec';
