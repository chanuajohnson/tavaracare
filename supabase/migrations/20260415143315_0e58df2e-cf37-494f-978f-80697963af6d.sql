
-- Update Family Care Coordination Plan → Active Care Management at $699/week
UPDATE public.billable_service_items
SET label = 'Active Care Management',
    unit_price = 699.00,
    description = 'Weekly care coordination, oversight, billing support, family updates, and managed support'
WHERE id = '0f9bec68-a867-46c8-b6a1-9b819f57fa8d';

-- Update Family Premium Coordination Plan → Premium Care Management at $899/week
UPDATE public.billable_service_items
SET label = 'Premium Care Management',
    unit_price = 899.00,
    billing_type = 'weekly',
    description = 'High-touch concierge-level care coordination, escalations, priority support, and complex family care management'
WHERE id = '52f6c507-b27e-46f5-b112-35627aba2174';

-- Deactivate legacy Urgent Care Change / Escalation (replaced by tiered options)
UPDATE public.billable_service_items
SET is_active = false
WHERE id = '9838e880-498c-411d-ad0e-dc3f6bd3be94';

-- Insert new service items
INSERT INTO public.billable_service_items (label, description, billing_type, unit_price, category, sort_order, is_active)
VALUES
  ('Daily Care SOP + Monitoring', 'Daily SOP tracking, monitoring, accountability, documentation review, and care quality support', 'weekly', 149.00, 'weekly_addon', 5.5, true),
  ('Light Secondary Support', 'Light structured support for a secondary household member beyond the primary care recipient', 'weekly', 150.00, 'weekly_addon', 7.1, true),
  ('Standard Secondary Support', 'Standard structured support for a secondary household member beyond the primary care recipient', 'weekly', 250.00, 'weekly_addon', 7.2, true),
  ('High-Need Secondary Support', 'High-need structured support for a secondary household member beyond the primary care recipient', 'weekly', 400.00, 'weekly_addon', 7.3, true),
  ('Home Setup Support / Care Readiness', 'Home readiness support, setup guidance, and structured preparation for smooth care delivery', 'one_time', 199.00, 'setup', 2.5, true),
  ('Basic Escalation Support', 'Basic coordination triggered by falls, urgent support changes, or care need escalation', 'one_time', 100.00, 'care_change', 8.1, true),
  ('Urgent Escalation Support', 'Urgent coordination triggered by falls, urgent support changes, or abrupt care need escalation', 'one_time', 200.00, 'care_change', 8.2, true),
  ('Emergency Stabilization / Rapid Response', 'Emergency care response, rapid coordination, and stabilization support', 'one_time', 300.00, 'care_change', 8.3, true);
