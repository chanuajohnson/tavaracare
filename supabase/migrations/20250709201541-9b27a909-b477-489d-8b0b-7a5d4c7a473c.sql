-- Create table to track automatic assignments from the matching algorithm
CREATE TABLE public.automatic_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_score NUMERIC NOT NULL,
  shift_compatibility_score NUMERIC,
  match_explanation TEXT,
  algorithm_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Prevent duplicate automatic assignments
  UNIQUE(family_user_id, caregiver_id)
);

-- Enable RLS
ALTER TABLE public.automatic_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for automatic assignments
CREATE POLICY "Users can view their own automatic assignments"
ON public.automatic_assignments
FOR SELECT
USING (auth.uid() = family_user_id);

CREATE POLICY "Admins can view all automatic assignments"
ON public.automatic_assignments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND role = 'admin'
));

-- Add indexes for performance
CREATE INDEX idx_automatic_assignments_family_user_id ON public.automatic_assignments(family_user_id);
CREATE INDEX idx_automatic_assignments_caregiver_id ON public.automatic_assignments(caregiver_id);
CREATE INDEX idx_automatic_assignments_active ON public.automatic_assignments(is_active);

-- Create comprehensive assignment reset function
CREATE OR REPLACE FUNCTION public.reset_user_assignments(target_family_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if executing user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can reset user assignments';
  END IF;

  -- Check if target user exists
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = target_family_user_id AND role = 'family'
  ) THEN
    RAISE EXCEPTION 'Target user not found or not a family user';
  END IF;

  -- Deactivate manual assignments
  UPDATE manual_caregiver_assignments
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE family_user_id = target_family_user_id
    AND is_active = TRUE;

  -- Deactivate admin interventions
  UPDATE admin_match_interventions
  SET status = 'inactive',
      updated_at = NOW()
  WHERE family_user_id = target_family_user_id
    AND status = 'active';

  -- Deactivate automatic assignments
  UPDATE automatic_assignments
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE family_user_id = target_family_user_id
    AND is_active = TRUE;

  -- Log the reset action
  INSERT INTO admin_communications (
    admin_id,
    target_user_id,
    message_type,
    custom_message,
    sent_at
  ) VALUES (
    auth.uid(),
    target_family_user_id,
    'assignment_reset',
    'All assignments have been reset by admin',
    NOW()
  );
END;
$$;

-- Create function to detect stale assignments
CREATE OR REPLACE FUNCTION public.detect_stale_assignments()
RETURNS TABLE (
  assignment_type TEXT,
  assignment_id UUID,
  family_user_id UUID,
  caregiver_id UUID,
  issue TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check for manual assignments with non-existent users
  RETURN QUERY
  SELECT 
    'manual'::TEXT,
    mca.id,
    mca.family_user_id,
    mca.caregiver_id,
    'Family user no longer exists'::TEXT
  FROM manual_caregiver_assignments mca
  WHERE mca.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = mca.family_user_id AND p.role = 'family'
    );

  RETURN QUERY
  SELECT 
    'manual'::TEXT,
    mca.id,
    mca.family_user_id,
    mca.caregiver_id,
    'Caregiver no longer exists'::TEXT
  FROM manual_caregiver_assignments mca
  WHERE mca.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = mca.caregiver_id AND p.role = 'professional'
    );

  -- Check for admin interventions with non-existent users
  RETURN QUERY
  SELECT 
    'intervention'::TEXT,
    ami.id,
    ami.family_user_id,
    ami.caregiver_id,
    'Family user no longer exists'::TEXT
  FROM admin_match_interventions ami
  WHERE ami.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = ami.family_user_id AND p.role = 'family'
    );

  RETURN QUERY
  SELECT 
    'intervention'::TEXT,
    ami.id,
    ami.family_user_id,
    ami.caregiver_id,
    'Caregiver no longer exists'::TEXT
  FROM admin_match_interventions ami
  WHERE ami.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = ami.caregiver_id AND p.role = 'professional'
    );

  -- Check for automatic assignments with non-existent users
  RETURN QUERY
  SELECT 
    'automatic'::TEXT,
    aa.id,
    aa.family_user_id,
    aa.caregiver_id,
    'Family user no longer exists'::TEXT
  FROM automatic_assignments aa
  WHERE aa.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = aa.family_user_id AND p.role = 'family'
    );

  RETURN QUERY
  SELECT 
    'automatic'::TEXT,
    aa.id,
    aa.family_user_id,
    aa.caregiver_id,
    'Caregiver no longer exists'::TEXT
  FROM automatic_assignments aa
  WHERE aa.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = aa.caregiver_id AND p.role = 'professional'
    );
END;
$$;

-- Create function to cleanup stale assignments (simplified without row counting)
CREATE OR REPLACE FUNCTION public.cleanup_stale_assignments()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if executing user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can cleanup stale assignments';
  END IF;

  -- Cleanup manual assignments
  UPDATE manual_caregiver_assignments
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE is_active = TRUE
    AND (
      NOT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = family_user_id AND p.role = 'family'
      )
      OR NOT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = caregiver_id AND p.role = 'professional'
      )
    );

  -- Cleanup admin interventions
  UPDATE admin_match_interventions
  SET status = 'inactive',
      updated_at = NOW()
  WHERE status = 'active'
    AND (
      NOT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = family_user_id AND p.role = 'family'
      )
      OR NOT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = caregiver_id AND p.role = 'professional'
      )
    );

  -- Cleanup automatic assignments
  UPDATE automatic_assignments
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE is_active = TRUE
    AND (
      NOT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = family_user_id AND p.role = 'family'
      )
      OR NOT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = caregiver_id AND p.role = 'professional'
      )
    );

  RETURN 'Stale assignments cleanup completed';
END;
$$;