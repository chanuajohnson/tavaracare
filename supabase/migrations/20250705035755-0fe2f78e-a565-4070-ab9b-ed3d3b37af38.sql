
-- Create table for admin match interventions
CREATE TABLE admin_match_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  family_user_id UUID NOT NULL REFERENCES profiles(id),
  caregiver_id UUID NOT NULL REFERENCES profiles(id),
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('manual_match', 'override_algorithm', 'reassignment', 'bulk_match')),
  reason TEXT,
  notes TEXT,
  original_match_score DECIMAL,
  admin_match_score DECIMAL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for manual caregiver assignments
CREATE TABLE manual_caregiver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_user_id UUID NOT NULL REFERENCES profiles(id),
  caregiver_id UUID NOT NULL REFERENCES profiles(id),
  assigned_by_admin_id UUID NOT NULL REFERENCES profiles(id),
  assignment_reason TEXT,
  match_score DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  visit_scheduled BOOLEAN DEFAULT false,
  visit_booking_id UUID REFERENCES visit_bookings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_admin_match_interventions_family ON admin_match_interventions(family_user_id);
CREATE INDEX idx_admin_match_interventions_caregiver ON admin_match_interventions(caregiver_id);
CREATE INDEX idx_manual_assignments_family ON manual_caregiver_assignments(family_user_id);
CREATE INDEX idx_manual_assignments_caregiver ON manual_caregiver_assignments(caregiver_id);

-- Enable RLS
ALTER TABLE admin_match_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_caregiver_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin match interventions
CREATE POLICY "Admins can manage all match interventions"
ON admin_match_interventions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for manual caregiver assignments
CREATE POLICY "Admins can manage all manual assignments"
ON manual_caregiver_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Families can view their manual assignments"
ON manual_caregiver_assignments
FOR SELECT
USING (auth.uid() = family_user_id);

CREATE POLICY "Caregivers can view their manual assignments"
ON manual_caregiver_assignments
FOR SELECT
USING (auth.uid() = caregiver_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_manual_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_manual_assignments_updated_at
  BEFORE UPDATE ON manual_caregiver_assignments
  FOR EACH ROW EXECUTE FUNCTION update_manual_assignments_updated_at();

CREATE TRIGGER update_admin_interventions_updated_at
  BEFORE UPDATE ON admin_match_interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
