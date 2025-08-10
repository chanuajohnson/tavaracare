-- Fix reset_user_assignments function to use valid status values
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

  -- Update admin interventions to cancelled status instead of inactive
  UPDATE admin_match_interventions
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE family_user_id = target_family_user_id
    AND status = 'active';

  -- Deactivate automatic assignments
  UPDATE automatic_assignments
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE family_user_id = target_family_user_id
    AND is_active = TRUE;

  -- Deactivate unified caregiver assignments
  UPDATE caregiver_assignments
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
    'assignments_reset',
    'All assignments reset by administrator',
    NOW()
  );
END;
$$;