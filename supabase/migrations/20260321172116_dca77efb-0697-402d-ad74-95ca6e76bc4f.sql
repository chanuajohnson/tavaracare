
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_preferred_visit_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_preferred_visit_type_check 
  CHECK (preferred_visit_type = ANY (ARRAY['virtual', 'in_person', 'trial_day', 'direct_hire']));
