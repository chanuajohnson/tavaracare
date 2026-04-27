-- Enums
CREATE TYPE public.care_supply_cadence AS ENUM ('weekly', 'biweekly', 'monthly', 'one_time');
CREATE TYPE public.care_supply_subscription_status AS ENUM ('active', 'paused', 'cancelled');

-- Catalog items
CREATE TABLE public.care_supply_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit_label TEXT NOT NULL DEFAULT 'each',
  unit_price_ttd NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  needs_pricing_review BOOLEAN NOT NULL DEFAULT TRUE,
  supplier_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bundles
CREATE TABLE public.care_supply_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  emoji TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.care_supply_bundle_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.care_supply_bundles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.care_supply_items(id) ON DELETE CASCADE,
  default_quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bundle_id, item_id)
);

-- Subscriptions
CREATE TABLE public.care_supply_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_user_id UUID NOT NULL,
  cadence public.care_supply_cadence NOT NULL DEFAULT 'monthly',
  delivery_day TEXT NOT NULL DEFAULT 'monday',
  next_delivery_at DATE,
  status public.care_supply_subscription_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_by_admin UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.care_supply_subscription_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.care_supply_subscriptions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.care_supply_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_snapshot_ttd NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deliveries history
CREATE TABLE public.care_supply_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.care_supply_subscriptions(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_ttd NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  marked_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_care_supply_items_active ON public.care_supply_items(is_active, sort_order);
CREATE INDEX idx_care_supply_bundles_active ON public.care_supply_bundles(is_active, sort_order);
CREATE INDEX idx_care_supply_bundle_items_bundle ON public.care_supply_bundle_items(bundle_id);
CREATE INDEX idx_care_supply_subs_family ON public.care_supply_subscriptions(family_user_id);
CREATE INDEX idx_care_supply_subs_status ON public.care_supply_subscriptions(status);
CREATE INDEX idx_care_supply_sub_items_sub ON public.care_supply_subscription_items(subscription_id);
CREATE INDEX idx_care_supply_deliveries_sub ON public.care_supply_deliveries(subscription_id);

-- Enable RLS
ALTER TABLE public.care_supply_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_supply_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_supply_bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_supply_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_supply_subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_supply_deliveries ENABLE ROW LEVEL SECURITY;

-- Items: public can read active; admin all
CREATE POLICY "Public can view active items"
  ON public.care_supply_items FOR SELECT
  USING (is_active = TRUE OR public.is_current_user_admin());

CREATE POLICY "Admin can insert items"
  ON public.care_supply_items FOR INSERT
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admin can update items"
  ON public.care_supply_items FOR UPDATE
  USING (public.is_current_user_admin());

CREATE POLICY "Admin can delete items"
  ON public.care_supply_items FOR DELETE
  USING (public.is_current_user_admin());

-- Bundles: same
CREATE POLICY "Public can view active bundles"
  ON public.care_supply_bundles FOR SELECT
  USING (is_active = TRUE OR public.is_current_user_admin());

CREATE POLICY "Admin can insert bundles"
  ON public.care_supply_bundles FOR INSERT
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admin can update bundles"
  ON public.care_supply_bundles FOR UPDATE
  USING (public.is_current_user_admin());

CREATE POLICY "Admin can delete bundles"
  ON public.care_supply_bundles FOR DELETE
  USING (public.is_current_user_admin());

-- Bundle items
CREATE POLICY "Public can view bundle items"
  ON public.care_supply_bundle_items FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin can manage bundle items"
  ON public.care_supply_bundle_items FOR ALL
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- Subscriptions: family own + admin all
CREATE POLICY "Family can view own subscriptions"
  ON public.care_supply_subscriptions FOR SELECT
  USING (auth.uid() = family_user_id OR public.is_current_user_admin());

CREATE POLICY "Family can create own subscription"
  ON public.care_supply_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = family_user_id OR public.is_current_user_admin());

CREATE POLICY "Family can update own subscription"
  ON public.care_supply_subscriptions FOR UPDATE
  USING (auth.uid() = family_user_id OR public.is_current_user_admin());

CREATE POLICY "Admin can delete subscriptions"
  ON public.care_supply_subscriptions FOR DELETE
  USING (public.is_current_user_admin());

-- Subscription items
CREATE POLICY "Family can view own subscription items"
  ON public.care_supply_subscription_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.care_supply_subscriptions s
      WHERE s.id = subscription_id
      AND (s.family_user_id = auth.uid() OR public.is_current_user_admin())
    )
  );

CREATE POLICY "Family can manage own subscription items"
  ON public.care_supply_subscription_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.care_supply_subscriptions s
      WHERE s.id = subscription_id
      AND (s.family_user_id = auth.uid() OR public.is_current_user_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.care_supply_subscriptions s
      WHERE s.id = subscription_id
      AND (s.family_user_id = auth.uid() OR public.is_current_user_admin())
    )
  );

-- Deliveries: read family own + admin; write admin only
CREATE POLICY "Family can view own deliveries"
  ON public.care_supply_deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.care_supply_subscriptions s
      WHERE s.id = subscription_id
      AND (s.family_user_id = auth.uid() OR public.is_current_user_admin())
    )
  );

CREATE POLICY "Admin can manage deliveries"
  ON public.care_supply_deliveries FOR ALL
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- Updated_at triggers
CREATE TRIGGER update_care_supply_items_updated_at
  BEFORE UPDATE ON public.care_supply_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_supply_bundles_updated_at
  BEFORE UPDATE ON public.care_supply_bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_supply_subscriptions_updated_at
  BEFORE UPDATE ON public.care_supply_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- SEED CATALOG
-- =============================================================
INSERT INTO public.care_supply_items (name, category, description, unit_label, unit_price_ttd, sort_order, needs_pricing_review) VALUES
('Disposable Medical Gloves', 'caregiver', 'Box of 100 latex-free gloves for safe care delivery', 'box of 100', 95.00, 10, true),
('Hand Sanitizer (500ml)', 'caregiver', 'Alcohol-based hand sanitizer for caregivers', 'bottle', 45.00, 20, true),
('Disinfectant Spray', 'caregiver', 'Lysol or equivalent surface disinfectant', 'bottle', 60.00, 30, true),
('Cleaning Cloths / Rags', 'caregiver', 'Pack of reusable microfiber cloths', 'pack of 10', 40.00, 40, true),
('Paper Towels', 'caregiver', 'Multi-pack of absorbent paper towels', 'pack of 6', 75.00, 50, true),
('Garbage Bags (Heavy Duty)', 'caregiver', 'Roll of 30 large bin liners', 'roll of 30', 55.00, 60, true),
('Wet Wipes', 'hygiene', 'Pack of moist personal care wipes', 'pack of 80', 35.00, 70, true),
('Adult Diapers — Medium', 'hygiene', 'Pack of adult incontinence briefs (size M)', 'pack of 20', 180.00, 80, true),
('Adult Diapers — Large', 'hygiene', 'Pack of adult incontinence briefs (size L)', 'pack of 20', 195.00, 90, true),
('Adult Diapers — XL', 'hygiene', 'Pack of adult incontinence briefs (size XL)', 'pack of 20', 210.00, 100, true),
('Rubbing Alcohol', 'hygiene', '70% isopropyl alcohol for sanitization', 'bottle 500ml', 40.00, 110, true),
('Methylated Spirit', 'hygiene', 'Methylated spirit for cleaning and antiseptic use', 'bottle 500ml', 35.00, 120, true),
('Hydrogen Peroxide', 'hygiene', '3% hydrogen peroxide for wound cleaning', 'bottle 500ml', 30.00, 130, true),
('Big Bottle Vinegar', 'hygiene', 'Natural cleaning vinegar (large)', 'bottle 2L', 50.00, 140, true),
('Bath Soap', 'personal', 'Gentle bar or liquid soap for daily bathing', 'pack of 3', 45.00, 150, true),
('Toothpaste', 'personal', 'Standard fluoride toothpaste', 'tube', 25.00, 160, true),
('Toothbrushes', 'personal', 'Pack of soft-bristle toothbrushes', 'pack of 2', 30.00, 170, true),
('Personal Deodorant', 'personal', 'Roll-on or stick deodorant', 'each', 35.00, 180, true),
('Face Moisturizer', 'personal', 'Daily face moisturizing cream', 'jar', 75.00, 190, true),
('Deep Hair Conditioner (Steam)', 'personal', 'Deep conditioning treatment', 'tub', 85.00, 200, true),
('House Slippers', 'comfort', 'Soft non-slip indoor slippers', 'pair', 90.00, 210, true),
('Easy-Grip Toothbrush', 'comfort', 'Wide-handle toothbrush for limited dexterity', 'each', 45.00, 220, true),
('No-Rinse Body Wash', 'comfort', 'Bedside cleansing wash, no water needed', 'bottle', 80.00, 230, true),
('Barrier Cream', 'comfort', 'Skin protectant cream for incontinence care', 'tube', 70.00, 240, true),
('Coconut Oil', 'comfort', 'Pure coconut oil for skin and hair care', 'jar', 55.00, 250, true),
('Clothes Basket (for dirty clothes)', 'home_reset', 'Laundry hamper basket', 'each', 120.00, 260, true),
('Bathroom / Toilet Mat', 'home_reset', 'Non-slip bathroom mat', 'each', 95.00, 270, true),
('Room Deodorizer', 'home_reset', 'Air freshener for living spaces', 'each', 40.00, 280, true);

-- Seed bundles
INSERT INTO public.care_supply_bundles (name, description, category, emoji, sort_order) VALUES
('Caregiver Essentials', 'Everything a caregiver needs each shift — gloves, sanitizer, cleaning supplies', 'caregiver', '🧤', 10),
('Personal Care', 'Daily hygiene and grooming basics for your loved one', 'personal', '🧴', 20),
('Incontinence & Hygiene', 'Diapers, wipes, and sanitization for dignified care', 'hygiene', '💧', 30),
('Alzheimer''s / Parkinson''s Comfort Kit', 'Gentle, easy-to-use items for cognitive and motor support', 'comfort', '💙', 40),
('Home Reset Add-Ons', 'Practical home items that make caregiving easier', 'home_reset', '🏡', 50);

-- Link items into bundles
WITH b AS (SELECT id, name FROM public.care_supply_bundles),
     i AS (SELECT id, name FROM public.care_supply_items)
INSERT INTO public.care_supply_bundle_items (bundle_id, item_id, default_quantity)
SELECT b.id, i.id, q.qty FROM b, i,
LATERAL (VALUES
  ('Caregiver Essentials', 'Disposable Medical Gloves', 1),
  ('Caregiver Essentials', 'Hand Sanitizer (500ml)', 1),
  ('Caregiver Essentials', 'Disinfectant Spray', 1),
  ('Caregiver Essentials', 'Cleaning Cloths / Rags', 1),
  ('Caregiver Essentials', 'Paper Towels', 1),
  ('Caregiver Essentials', 'Garbage Bags (Heavy Duty)', 1),
  ('Personal Care', 'Bath Soap', 1),
  ('Personal Care', 'Toothpaste', 1),
  ('Personal Care', 'Toothbrushes', 1),
  ('Personal Care', 'Personal Deodorant', 1),
  ('Personal Care', 'Face Moisturizer', 1),
  ('Personal Care', 'Deep Hair Conditioner (Steam)', 1),
  ('Personal Care', 'House Slippers', 1),
  ('Incontinence & Hygiene', 'Adult Diapers — Medium', 1),
  ('Incontinence & Hygiene', 'Wet Wipes', 2),
  ('Incontinence & Hygiene', 'Rubbing Alcohol', 1),
  ('Incontinence & Hygiene', 'Hydrogen Peroxide', 1),
  ('Incontinence & Hygiene', 'Methylated Spirit', 1),
  ('Alzheimer''s / Parkinson''s Comfort Kit', 'House Slippers', 1),
  ('Alzheimer''s / Parkinson''s Comfort Kit', 'Easy-Grip Toothbrush', 1),
  ('Alzheimer''s / Parkinson''s Comfort Kit', 'No-Rinse Body Wash', 1),
  ('Alzheimer''s / Parkinson''s Comfort Kit', 'Barrier Cream', 1),
  ('Alzheimer''s / Parkinson''s Comfort Kit', 'Coconut Oil', 1),
  ('Alzheimer''s / Parkinson''s Comfort Kit', 'Big Bottle Vinegar', 1),
  ('Home Reset Add-Ons', 'Clothes Basket (for dirty clothes)', 1),
  ('Home Reset Add-Ons', 'Bathroom / Toilet Mat', 2),
  ('Home Reset Add-Ons', 'Room Deodorizer', 2)
) AS q(bundle_name, item_name, qty)
WHERE b.name = q.bundle_name AND i.name = q.item_name;