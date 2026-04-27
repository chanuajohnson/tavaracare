
-- ============================================================
-- Billable Service Items Catalog
-- ============================================================
CREATE TABLE public.billable_service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  billing_type TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  default_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  visible_in_quote BOOLEAN DEFAULT true,
  visible_in_invoice BOOLEAN DEFAULT true,
  visible_in_unit_economics BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.billable_service_items ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read active items
CREATE POLICY "Authenticated users can view active service items"
ON public.billable_service_items
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage all items
CREATE POLICY "Admins can manage service items"
ON public.billable_service_items
FOR ALL
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- ============================================================
-- Care Plan Service Selections
-- ============================================================
CREATE TABLE public.care_plan_service_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id UUID REFERENCES public.care_plans(id) ON DELETE CASCADE NOT NULL,
  service_item_id UUID REFERENCES public.billable_service_items(id) NOT NULL,
  selected BOOLEAN DEFAULT false,
  approved_by_family BOOLEAN DEFAULT false,
  quantity INTEGER DEFAULT 1,
  override_price NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(care_plan_id, service_item_id)
);

ALTER TABLE public.care_plan_service_selections ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage service selections"
ON public.care_plan_service_selections
FOR ALL
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Families can view their own care plan selections
CREATE POLICY "Families can view own care plan service selections"
ON public.care_plan_service_selections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.care_plans cp
    WHERE cp.id = care_plan_id
    AND cp.family_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_care_plan_service_selections_updated_at
BEFORE UPDATE ON public.care_plan_service_selections
FOR EACH ROW
EXECUTE FUNCTION public.update_tav_updated_at();

-- ============================================================
-- Seed Data: Default Service Items
-- ============================================================
INSERT INTO public.billable_service_items (category, label, description, billing_type, unit_price, sort_order) VALUES
  ('setup', 'Care Assessment & Setup', 'Includes case review, care planning preparation, and onboarding coordination.', 'one_time', 499.00, 1),
  ('setup', 'Caregiver Matching & Placement', 'Caregiver matching, vetting, and introduction coordination.', 'one_time', 299.00, 2),
  ('weekly_addon', 'Family Care Coordination Plan', 'Dedicated care coordinator, scheduling oversight, billing support, and platform access.', 'weekly', 499.00, 3),
  ('premium_support', 'Family Premium Coordination Plan', 'Concierge-level coordination for complex care, 24/7 on-call support, and emergency escalation.', 'monthly', 2499.00, 4),
  ('weekly_addon', 'Medication Management Support', 'Structured medication coordination, logging, conflict detection, and reporting.', 'weekly', 99.00, 5),
  ('weekly_addon', 'Meal Support Upgrade', 'Advanced meal preparation support beyond basic daily dietary prep.', 'weekly', 75.00, 6),
  ('weekly_addon', 'Podiatric Care — Secondary Household Member', 'Approved podiatric care support for a secondary household member.', 'weekly', 349.00, 7),
  ('care_change', 'Care Plan Adjustment Fee', 'Applies when care scope, schedule, or complexity changes from the established baseline.', 'one_time', 149.00, 8),
  ('care_change', 'Urgent Care Change / Escalation', 'Expedited care adjustment for urgent changes in care needs or circumstances.', 'one_time', 199.00, 9),
  ('hourly_addon', 'Specialist Care Support', 'Advanced specialist-level care including wound care, catheter management, or behavioral support.', 'hourly', 45.00, 10),
  ('hourly_addon', 'Holiday / Overtime Premium', 'Time-and-a-half rate applied to recognized holidays and extended shifts beyond standard coverage.', 'hourly', 52.50, 11);
