
UPDATE public.subscription_plans
SET features = '[
  {"name": "Family profile and care preferences setup", "included": true, "is_addon": false},
  {"name": "Care needs assessment and planning tools", "included": true, "is_addon": false},
  {"name": "Legacy Story — preserve your loved one''s journey", "included": true, "is_addon": false},
  {"name": "Caregiver matching (auto-matching included)", "included": true, "is_addon": false},
  {"name": "Care team discovery and matching", "included": true, "is_addon": false},
  {"name": "Medication tracking and scheduling", "included": true, "is_addon": false},
  {"name": "Meal planning and grocery lists", "included": true, "is_addon": false},
  {"name": "Unlimited messaging with your care team", "included": true, "is_addon": false},
  {"name": "Community support and resources", "included": true, "is_addon": false},
  {"name": "Care team scheduling and oversight", "included": false, "is_addon": false},
  {"name": "Dedicated care coordinator assigned to your family", "included": false, "is_addon": false},
  {"name": "Video consultations for care planning", "included": false, "is_addon": false},
  {"name": "Care coordination and care payments support (incl. NIS payment submission for family)", "included": false, "is_addon": false}
]'::jsonb
WHERE slug = 'basic' AND audience = 'family';

UPDATE public.subscription_plans
SET features = '[
  {"name": "Everything in Family Basic", "included": true, "is_addon": false},
  {"name": "Dedicated care coordinator assigned to your family — actively manages your matches and builds your care team around your family profile, care preferences, and assessment", "included": true, "is_addon": false},
  {"name": "Care team scheduling and oversight", "included": true, "is_addon": false},
  {"name": "Video consultations for care planning", "included": true, "is_addon": false},
  {"name": "Care coordination and care payments support (incl. NIS payment submission for family)", "included": true, "is_addon": false},
  {"name": "Priority matching and complex care management", "included": false, "is_addon": false},
  {"name": "24/7 on-call coordinator support", "included": false, "is_addon": false}
]'::jsonb
WHERE slug = 'care' AND audience = 'family';
