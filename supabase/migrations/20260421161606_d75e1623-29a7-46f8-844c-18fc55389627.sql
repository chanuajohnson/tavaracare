INSERT INTO public.billable_service_items (
  label,
  description,
  category,
  billing_type,
  unit_price,
  default_quantity,
  sort_order,
  is_active,
  visible_in_quote,
  visible_in_invoice,
  visible_in_unit_economics
) VALUES (
  'NIS Employer Registration Support',
  'Administrative support to register the family as an employer for caregiver NIS compliance, including forms, document collection guidance, authorization handling, and submission coordination. Of course, this is something you can absolutely handle on your own. But we''re here to coordinate and support you through it — because it truly takes a village to care. And knowing that, we offer this as an option to make the process a bit lighter for you. NIS contributions themselves are not included and remain payable by the family as the registered employer.',
  'care_change',
  'one_time',
  349.00,
  1,
  8.4,
  true,
  true,
  true,
  true
);