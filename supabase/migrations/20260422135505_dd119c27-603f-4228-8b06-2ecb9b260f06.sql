-- Extend subscription_plans table with admin-editable columns
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'family',
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS price_weekly numeric NULL,
  ADD COLUMN IF NOT EXISTS price_monthly numeric NULL,
  ADD COLUMN IF NOT EXISTS period_weekly text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS period_monthly text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS button_text text NOT NULL DEFAULT 'Choose Plan',
  ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Constrain audience values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'subscription_plans_audience_check'
      AND table_name = 'subscription_plans'
  ) THEN
    ALTER TABLE public.subscription_plans
      ADD CONSTRAINT subscription_plans_audience_check
      CHECK (audience IN ('family','professional'));
  END IF;
END $$;

-- Unique slug per audience (allows same slug 'basic' across audiences)
CREATE UNIQUE INDEX IF NOT EXISTS subscription_plans_audience_slug_idx
  ON public.subscription_plans (audience, slug)
  WHERE slug IS NOT NULL;

-- Enable RLS (no-op if already on)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent recreate)
DROP POLICY IF EXISTS "Public can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can insert subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can update subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can delete subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can view all subscription plans" ON public.subscription_plans;

-- Anyone (anon + authed) can read active plans
CREATE POLICY "Public can view active subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Admins can view all (including inactive)
CREATE POLICY "Admins can view all subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert/update/delete
CREATE POLICY "Admins can insert subscription plans"
  ON public.subscription_plans
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update subscription plans"
  ON public.subscription_plans
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscription plans"
  ON public.subscription_plans
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed the 6 current plans (only if no rows for these audience+slug pairs already exist)
INSERT INTO public.subscription_plans
  (name, slug, audience, description, price, price_weekly, price_monthly,
   period_weekly, period_monthly, button_text, is_popular, sort_order,
   is_active, duration_days, features)
SELECT * FROM (VALUES
  -- Family Basic
  ('Family Basic', 'basic', 'family',
   'Get organized and start building your care team',
   0, NULL::numeric, NULL::numeric, '', '',
   'Get Started Free', false, 1, true, 30,
   '[
     {"name":"Family profile and care preferences setup","included":true,"is_addon":false},
     {"name":"Care needs assessment and planning tools","included":true,"is_addon":false},
     {"name":"Legacy Story — preserve your loved one''s journey","included":true,"is_addon":false},
     {"name":"Care team discovery and matching","included":false,"is_addon":false},
     {"name":"Medication tracking and scheduling","included":false,"is_addon":false},
     {"name":"Meal planning and grocery lists","included":false,"is_addon":false},
     {"name":"Unlimited messaging with your care team","included":false,"is_addon":false},
     {"name":"Community support and resources","included":false,"is_addon":false},
     {"name":"Dedicated care coordinator","included":false,"is_addon":false},
     {"name":"Care team scheduling and oversight","included":false,"is_addon":false},
     {"name":"Video consultations for care planning","included":false,"is_addon":false},
     {"name":"Care coordination and care payments support (incl. NIS payment submission for family)","included":false,"is_addon":false}
   ]'::jsonb),
  -- Active Care Management
  ('Active Care Management', 'care', 'family',
   'Structured weekly care coordination, oversight, billing support, and managed care',
   699, 699, 2499, 'week', 'month',
   'Start Care Coordination', false, 2, true, 30,
   '[
     {"name":"Everything in Family Basic","included":true,"is_addon":false},
     {"name":"Dedicated care coordinator assigned to your family","included":true,"is_addon":false},
     {"name":"Care team scheduling and oversight","included":true,"is_addon":false},
     {"name":"Video consultations for care planning","included":true,"is_addon":false},
     {"name":"Care coordination and care payments support (incl. NIS payment submission for family)","included":true,"is_addon":false},
     {"name":"Care team discovery and matching","included":true,"is_addon":false},
     {"name":"Medication tracking and scheduling","included":true,"is_addon":false},
     {"name":"Meal planning and grocery lists","included":true,"is_addon":false},
     {"name":"Unlimited messaging with your care team","included":true,"is_addon":false},
     {"name":"Community support and resources","included":true,"is_addon":false},
     {"name":"Priority matching and complex care management","included":false,"is_addon":false},
     {"name":"24/7 on-call coordinator support","included":false,"is_addon":false}
   ]'::jsonb),
  -- Premium Care Management
  ('Premium Care Management', 'premium', 'family',
   'High-touch concierge-level coordination for complex or high-touch care needs',
   899, 899, 3299, 'week', 'month',
   'Choose Premium', true, 3, true, 30,
   '[
     {"name":"Everything in Active Care Management","included":true,"is_addon":false},
     {"name":"Priority care team matching and placement","included":true,"is_addon":false},
     {"name":"Extended video consultations","included":true,"is_addon":false},
     {"name":"Comprehensive care plan management","included":true,"is_addon":false},
     {"name":"24/7 on-call coordinator support","included":true,"is_addon":false},
     {"name":"Multi-caregiver scheduling and rotation management","included":true,"is_addon":false},
     {"name":"Detailed care analytics and progress reports","included":true,"is_addon":false},
     {"name":"Emergency escalation and rapid response coordination","included":true,"is_addon":false},
     {"name":"Weekly care check-ins and status updates","included":true,"is_addon":false},
     {"name":"Payroll log generation for care team","included":true,"is_addon":true},
     {"name":"Caregiver daily reports","included":true,"is_addon":true},
     {"name":"Full Care Environment Reset","included":true,"is_addon":true}
   ]'::jsonb),
  -- Professional Basic
  ('Professional Basic', 'basic', 'professional',
   'Limited access for casual professionals',
   0, NULL::numeric, NULL::numeric, '', '',
   'Current Plan', false, 1, true, 30,
   '[
     {"name":"Apply for 3 jobs per week","included":true,"is_addon":false},
     {"name":"Basic profile listing","included":true,"is_addon":false},
     {"name":"Limited training resources","included":true,"is_addon":false},
     {"name":"Email support","included":true,"is_addon":false},
     {"name":"Featured profile placement","included":false,"is_addon":false},
     {"name":"Unlimited job applications","included":false,"is_addon":false},
     {"name":"Advanced training resources","included":false,"is_addon":false},
     {"name":"Priority job matching","included":false,"is_addon":false}
   ]'::jsonb),
  -- Professional Pro
  ('Professional Pro', 'pro', 'professional',
   'Enhanced features for active professionals',
   19.99, 19.99, 19.99, 'monthly', 'monthly',
   'Upgrade to Pro', true, 2, true, 30,
   '[
     {"name":"Apply for 3 jobs per week","included":true,"is_addon":false},
     {"name":"Basic profile listing","included":true,"is_addon":false},
     {"name":"Limited training resources","included":true,"is_addon":false},
     {"name":"Email support","included":true,"is_addon":false},
     {"name":"Featured profile placement","included":true,"is_addon":false},
     {"name":"Unlimited job applications","included":true,"is_addon":false},
     {"name":"Advanced training resources","included":false,"is_addon":false},
     {"name":"Priority job matching","included":false,"is_addon":false}
   ]'::jsonb),
  -- Professional Expert
  ('Professional Expert', 'expert', 'professional',
   'Complete access for dedicated care professionals',
   34.99, 34.99, 34.99, 'monthly', 'monthly',
   'Upgrade to Expert', false, 3, true, 30,
   '[
     {"name":"Apply for 3 jobs per week","included":true,"is_addon":false},
     {"name":"Basic profile listing","included":true,"is_addon":false},
     {"name":"Limited training resources","included":true,"is_addon":false},
     {"name":"Email support","included":true,"is_addon":false},
     {"name":"Featured profile placement","included":true,"is_addon":false},
     {"name":"Unlimited job applications","included":true,"is_addon":false},
     {"name":"Advanced training resources","included":true,"is_addon":false},
     {"name":"Priority job matching","included":true,"is_addon":false}
   ]'::jsonb)
) AS v(name, slug, audience, description, price, price_weekly, price_monthly,
       period_weekly, period_monthly, button_text, is_popular, sort_order,
       is_active, duration_days, features)
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscription_plans sp
  WHERE sp.audience = v.audience AND sp.slug = v.slug
);