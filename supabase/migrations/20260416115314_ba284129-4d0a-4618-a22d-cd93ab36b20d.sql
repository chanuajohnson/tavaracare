-- Update existing Home Setup item to Care Readiness Assessment
UPDATE billable_service_items
SET 
  label = 'Care Readiness Assessment',
  category = 'care_environment_support',
  description = 'Structured home walkthrough, caregiver workflow mapping, hygiene and safety assessment, decluttering recommendations, and space optimization plan to prepare the home as a dignified care environment'
WHERE id = 'a01245d4-f5a2-4b1e-a7b2-002c3c5dfcb3';

-- Insert Guided Home Reset — $499
INSERT INTO billable_service_items (
  label, description, category, billing_type, unit_price, default_quantity, sort_order,
  is_active, visible_in_quote, visible_in_invoice, visible_in_unit_economics
) VALUES (
  'Guided Home Reset',
  'Decluttering guidance with family, caregiver workspace setup, light organization, sanitation planning, and basic hazard removal to create a safer, more manageable care environment',
  'care_environment_support',
  'one_time',
  499.00,
  1,
  3,
  true, true, true, true
);

-- Insert Full Care Environment Reset — Custom pricing
INSERT INTO billable_service_items (
  label, description, category, billing_type, unit_price, default_quantity, sort_order,
  is_active, visible_in_quote, visible_in_invoice, visible_in_unit_economics
) VALUES (
  'Full Care Environment Reset',
  'Comprehensive care-space restructuring including deep cleaning coordination, pest control coordination, removal of unsafe items, and full environment preparation — coordinated and managed by Tavara',
  'care_environment_support',
  'one_time',
  0.00,
  1,
  3,
  true, true, true, true
);