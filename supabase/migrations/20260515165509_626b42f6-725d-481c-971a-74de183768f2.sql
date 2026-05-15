
CREATE TABLE public.pricing_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  price_min NUMERIC(10,2),
  price_max NUMERIC(10,2),
  unit TEXT NOT NULL DEFAULT 'one_time',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing"
  ON public.pricing_catalog FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pricing"
  ON public.pricing_catalog FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pricing"
  ON public.pricing_catalog FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pricing"
  ON public.pricing_catalog FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_pricing_catalog_updated_at
  BEFORE UPDATE ON public.pricing_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.pricing_catalog (code, category, display_name, description, price_min, price_max, unit, sort_order) VALUES
  ('setup_assessment', 'setup', 'Care Assessment & Setup', 'Case review, care planning preparation, and onboarding coordination.', 499, NULL, 'one_time', 10),
  ('setup_matching', 'setup', 'Caregiver Matching & Placement', 'Caregiver matching, vetting, and introduction coordination.', 1399, NULL, 'one_time', 20),
  ('setup_readiness', 'setup', 'Care Readiness Assessment', 'Structured home walkthrough, caregiver workflow mapping, hygiene and safety assessment, decluttering recommendations, and space optimization.', 199, NULL, 'one_time', 30),
  ('setup_nis_registration', 'setup', 'NIS Employer Registration', 'Employer registration with the National Insurance System.', 349, NULL, 'one_time', 40),
  ('rate_standard_hr', 'rate_tier', 'Standard Rate Tier', 'GAPP-certified personal care, medication admin & logging, vitals monitoring, basic daily dietary meal prep, daily care documentation, specialized care (dementia, palliative, post-surgical).', 40, NULL, 'per_hour', 10),
  ('rate_full_service_hr', 'rate_tier', 'Full Service Rate Tier', 'Standard + advanced specialist-directed meal prep, complex medical needs (wound care, catheter, oxygen), overnight/live-in shifts, advanced certifications (RN, LPN), behavioral health support.', 45, NULL, 'per_hour', 20),
  ('rate_premium_hr', 'rate_tier', 'Premium Rate Tier', 'Full Service + advanced care-plan management, disease progression support, multi-specialist coordination, 24/7 on-call, advanced palliative, family transition planning.', 50, NULL, 'per_hour', 30),
  ('sub_basic', 'subscription', 'Family Basic', 'Free tier with profile, care preferences, instant matching, medication management, meal planning, unlimited caregiver chat, community support.', 0, NULL, 'per_month', 10),
  ('sub_active_weekly', 'subscription', 'Active Care Management (Weekly)', 'Dedicated care coordinator, structured weekly care coordination, oversight, billing support, and managed care.', 699, NULL, 'per_week', 20),
  ('sub_active_monthly', 'subscription', 'Active Care Management (Monthly)', 'Monthly billing for Active Care Management.', 2499, NULL, 'per_month', 21),
  ('sub_premium_weekly', 'subscription', 'Premium Care Management (Weekly)', 'All Active Care features plus concierge-level coordination, 24/7 on-call, priority matching, and complex family care management.', 899, NULL, 'per_week', 30),
  ('sub_premium_monthly', 'subscription', 'Premium Care Management (Monthly)', 'Monthly billing for Premium Care Management.', 3299, NULL, 'per_month', 31),
  ('addon_medication', 'add_on', 'Medication Management Add-on', 'Structured medication administration and logging support.', 99, NULL, 'per_week', 10),
  ('addon_sop', 'add_on', 'SOP / Care Documentation Add-on', 'Standard operating procedures and structured daily documentation.', 149, NULL, 'per_week', 20),
  ('addon_meal_support', 'add_on', 'Meal Support Add-on', 'Specialist-directed meal planning and preparation support.', 75, NULL, 'per_week', 30),
  ('addon_light_secondary', 'add_on', 'Light Secondary Support', 'Supplementary light caregiving coverage.', 350, NULL, 'per_week', 40),
  ('addon_podiatric', 'add_on', 'Podiatric Care Add-on', 'Specialist podiatric care visits.', 349, NULL, 'per_week', 50),
  ('env_daily_sop', 'environment', 'Daily SOP Setup (One-Time)', 'One-time setup of daily SOP routines for the home.', 199, NULL, 'one_time', 10),
  ('env_guided_reset', 'environment', 'Guided Home Reset', 'Guided home environment reset with caregiver workflow mapping.', 499, NULL, 'one_time', 20),
  ('env_full_reset', 'environment', 'Full Care Environment Reset', 'Comprehensive home reset with custom monthly retainer.', NULL, NULL, 'custom_quote', 30),
  ('escalation_care_plan_adjustment', 'escalation', 'Care Plan Adjustment', 'Documented care plan change order.', 149, NULL, 'one_time', 10),
  ('escalation_basic', 'escalation', 'Basic Escalation', 'Basic out-of-band escalation handling.', 100, NULL, 'one_time', 20),
  ('escalation_urgent', 'escalation', 'Urgent Escalation', 'Urgent escalation handling with priority routing.', 200, NULL, 'one_time', 30),
  ('escalation_emergency_stabilization', 'escalation', 'Emergency Stabilization / Rapid Response', 'Rapid response and on-the-ground stabilization. Range varies by complexity and duration.', 300, 2000, 'one_time', 40),
  ('secondary_standard_high_need', 'secondary_support', 'Standard / High-Need Secondary Support', 'Secondary caregiver coverage for standard or high-need cases. Pricing scoped per case.', NULL, NULL, 'custom_quote', 10);
