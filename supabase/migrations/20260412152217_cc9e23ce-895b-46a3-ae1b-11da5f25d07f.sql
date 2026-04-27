
-- Add family_id column
ALTER TABLE professional_onboarding_checklists 
  ADD COLUMN family_id uuid REFERENCES profiles(id);

-- Migrate existing data from JSON checked_items
UPDATE professional_onboarding_checklists 
  SET family_id = (checked_items->>'assigned_family_id')::uuid
  WHERE checked_items->>'assigned_family_id' IS NOT NULL
    AND (checked_items->>'assigned_family_id') != '';

-- Drop old unique constraint
ALTER TABLE professional_onboarding_checklists 
  DROP CONSTRAINT IF EXISTS unique_professional_onboarding;

-- Add new composite unique constraint
ALTER TABLE professional_onboarding_checklists 
  ADD CONSTRAINT unique_professional_family_onboarding 
  UNIQUE (professional_id, family_id);
