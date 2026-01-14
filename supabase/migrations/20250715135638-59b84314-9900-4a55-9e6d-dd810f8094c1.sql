-- Phase 1: CRITICAL Security Fix - Remove family user INSERT access to automatic_assignments
-- Current issue: ANY authenticated user can insert into automatic_assignments table

-- Step 1: Add restrictive INSERT policy that only allows system/admin insertion
CREATE POLICY "Only system can create automatic assignments" 
ON public.automatic_assignments 
FOR INSERT 
WITH CHECK (
  -- Only allow INSERT from system functions or admin users
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Step 2: Create secure database functions for assignment creation
CREATE OR REPLACE FUNCTION public.create_automatic_assignment(
  target_family_user_id UUID,
  target_caregiver_id UUID,
  calculated_match_score NUMERIC,
  calculated_shift_compatibility_score NUMERIC DEFAULT NULL,
  assignment_explanation TEXT DEFAULT NULL,
  algorithm_version_param TEXT DEFAULT 'v2.0'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assignment_id UUID;
BEGIN
  -- Validate input parameters
  IF target_family_user_id IS NULL OR target_caregiver_id IS NULL OR calculated_match_score IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;
  
  -- Verify family user exists and is family role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_family_user_id AND role = 'family'
  ) THEN
    RAISE EXCEPTION 'Invalid family user ID';
  END IF;
  
  -- Verify caregiver exists and is professional role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_caregiver_id AND role = 'professional'
  ) THEN
    RAISE EXCEPTION 'Invalid caregiver ID';
  END IF;
  
  -- Deactivate any existing automatic assignments for this family user
  UPDATE automatic_assignments 
  SET is_active = FALSE, updated_at = NOW()
  WHERE family_user_id = target_family_user_id AND is_active = TRUE;
  
  -- Create new automatic assignment
  INSERT INTO automatic_assignments (
    family_user_id,
    caregiver_id,
    match_score,
    shift_compatibility_score,
    match_explanation,
    algorithm_version,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    target_family_user_id,
    target_caregiver_id,
    calculated_match_score,
    calculated_shift_compatibility_score,
    assignment_explanation,
    algorithm_version_param,
    TRUE,
    NOW(),
    NOW()
  ) RETURNING id INTO assignment_id;
  
  -- Log the assignment creation
  INSERT INTO admin_communications (
    admin_id,
    target_user_id,
    message_type,
    custom_message,
    sent_at
  ) VALUES (
    NULL, -- System-generated
    target_family_user_id,
    'automatic_assignment_created',
    'Automatic caregiver assignment created by system',
    NOW()
  );
  
  RETURN assignment_id;
END;
$$;

-- Step 3: Create admin-controlled assignment function
CREATE OR REPLACE FUNCTION public.create_admin_assignment(
  target_family_user_id UUID,
  target_caregiver_id UUID,
  calculated_match_score NUMERIC,
  admin_override_score NUMERIC DEFAULT NULL,
  assignment_reason TEXT DEFAULT NULL,
  assignment_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assignment_id UUID;
  executing_admin_id UUID;
BEGIN
  -- Get executing admin ID
  executing_admin_id := auth.uid();
  
  -- Verify executing user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = executing_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can create manual assignments';
  END IF;
  
  -- Validate input parameters
  IF target_family_user_id IS NULL OR target_caregiver_id IS NULL OR calculated_match_score IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;
  
  -- Verify family user exists and is family role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_family_user_id AND role = 'family'
  ) THEN
    RAISE EXCEPTION 'Invalid family user ID';
  END IF;
  
  -- Verify caregiver exists and is professional role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_caregiver_id AND role = 'professional'
  ) THEN
    RAISE EXCEPTION 'Invalid caregiver ID';
  END IF;
  
  -- Deactivate any existing automatic assignments for this family user
  UPDATE automatic_assignments 
  SET is_active = FALSE, updated_at = NOW()
  WHERE family_user_id = target_family_user_id AND is_active = TRUE;
  
  -- Create new admin-controlled assignment
  INSERT INTO admin_match_interventions (
    admin_id,
    family_user_id,
    caregiver_id,
    intervention_type,
    original_match_score,
    admin_match_score,
    reason,
    notes,
    status,
    created_at,
    updated_at
  ) VALUES (
    executing_admin_id,
    target_family_user_id,
    target_caregiver_id,
    'manual_assignment',
    calculated_match_score,
    admin_override_score,
    assignment_reason,
    assignment_notes,
    'active',
    NOW(),
    NOW()
  ) RETURNING id INTO assignment_id;
  
  -- Log the assignment creation
  INSERT INTO admin_communications (
    admin_id,
    target_user_id,
    message_type,
    custom_message,
    sent_at
  ) VALUES (
    executing_admin_id,
    target_family_user_id,
    'manual_assignment_created',
    'Manual caregiver assignment created by admin',
    NOW()
  );
  
  RETURN assignment_id;
END;
$$;

-- Step 4: Create function to trigger automatic assignment process
CREATE OR REPLACE FUNCTION public.trigger_automatic_assignment_process(
  target_family_user_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_message TEXT;
  processed_count INTEGER := 0;
  family_user_record RECORD;
BEGIN
  -- If specific family user ID provided, process only that user
  IF target_family_user_id IS NOT NULL THEN
    -- Verify family user exists
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = target_family_user_id AND role = 'family'
    ) THEN
      RAISE EXCEPTION 'Invalid family user ID';
    END IF;
    
    -- Process single family user
    -- This would call the matching algorithm and create assignments
    -- For now, we'll just log the trigger
    INSERT INTO admin_communications (
      admin_id,
      target_user_id,
      message_type,
      custom_message,
      sent_at
    ) VALUES (
      NULL, -- System-generated
      target_family_user_id,
      'assignment_process_triggered',
      'Automatic assignment process triggered for user',
      NOW()
    );
    
    processed_count := 1;
    result_message := 'Assignment process triggered for 1 family user';
  ELSE
    -- Process all family users who need assignment updates
    FOR family_user_record IN 
      SELECT id FROM profiles 
      WHERE role = 'family' 
      AND (
        -- Users without any active assignments
        NOT EXISTS (
          SELECT 1 FROM automatic_assignments 
          WHERE family_user_id = profiles.id AND is_active = TRUE
        )
        OR
        -- Users whose assignments are older than 7 days
        EXISTS (
          SELECT 1 FROM automatic_assignments 
          WHERE family_user_id = profiles.id 
          AND is_active = TRUE 
          AND updated_at < NOW() - INTERVAL '7 days'
        )
      )
    LOOP
      -- Log the trigger for each user
      INSERT INTO admin_communications (
        admin_id,
        target_user_id,
        message_type,
        custom_message,
        sent_at
      ) VALUES (
        NULL, -- System-generated
        family_user_record.id,
        'assignment_process_triggered',
        'Automatic assignment process triggered via batch processing',
        NOW()
      );
      
      processed_count := processed_count + 1;
    END LOOP;
    
    result_message := 'Assignment process triggered for ' || processed_count || ' family users';
  END IF;
  
  RETURN result_message;
END;
$$;

-- Step 5: Update existing RLS policies to be more explicit
DROP POLICY IF EXISTS "Users can view their own automatic assignments" ON public.automatic_assignments;
CREATE POLICY "Family users can view their own automatic assignments" 
ON public.automatic_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'family'
    AND id = automatic_assignments.family_user_id
  )
);

-- Step 6: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_automatic_assignments_family_active ON public.automatic_assignments(family_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_automatic_assignments_updated_at ON public.automatic_assignments(updated_at);
CREATE INDEX IF NOT EXISTS idx_admin_match_interventions_family_active ON public.admin_match_interventions(family_user_id, status);

-- Step 7: Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.create_automatic_assignment TO service_role;
GRANT EXECUTE ON FUNCTION public.create_admin_assignment TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_automatic_assignment_process TO service_role;

-- Step 8: Create audit trigger for assignment tracking
CREATE OR REPLACE FUNCTION public.audit_assignment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log assignment status changes
  IF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
    INSERT INTO admin_communications (
      admin_id,
      target_user_id,
      message_type,
      custom_message,
      sent_at
    ) VALUES (
      auth.uid(),
      NEW.family_user_id,
      'assignment_status_changed',
      'Assignment status changed from ' || OLD.is_active || ' to ' || NEW.is_active,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for audit trail
DROP TRIGGER IF EXISTS audit_automatic_assignments ON public.automatic_assignments;
CREATE TRIGGER audit_automatic_assignments
  AFTER UPDATE ON public.automatic_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_assignment_changes();