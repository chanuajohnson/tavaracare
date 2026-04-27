-- Create function to calculate and update journey progress
CREATE OR REPLACE FUNCTION public.calculate_and_update_journey_progress(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record profiles%ROWTYPE;
  step_count integer := 0;
  total_steps integer := 12;
  completion_percent numeric := 0;
  current_step integer := 1;
  foundation_steps integer := 0;
  scheduling_steps integer := 0;
  trial_steps integer := 0;
  
  -- Step completion flags
  profile_complete boolean := false;
  assessment_complete boolean := false;
  story_complete boolean := false;
  matches_accessible boolean := false;
  medication_setup boolean := false;
  meal_setup boolean := false;
  visit_scheduled boolean := false;
  visit_confirmed boolean := false;
  trial_scheduled boolean := false;
  trial_paid boolean := false;
  trial_completed boolean := false;
  path_chosen boolean := false;
BEGIN
  -- Get user profile
  SELECT * INTO user_record FROM profiles WHERE id = target_user_id;
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_user_id;
  END IF;
  
  -- Step 1: Profile completion
  IF user_record.full_name IS NOT NULL 
     AND user_record.phone_number IS NOT NULL 
     AND user_record.address IS NOT NULL 
     AND user_record.care_recipient_name IS NOT NULL 
     AND user_record.relationship IS NOT NULL
     AND (user_record.care_types IS NOT NULL AND array_length(user_record.care_types, 1) > 0)
  THEN
    profile_complete := true;
    step_count := step_count + 1;
    foundation_steps := foundation_steps + 1;
  END IF;
  
  -- Step 2: Care assessment
  IF EXISTS (SELECT 1 FROM care_needs_family WHERE profile_id = target_user_id) THEN
    assessment_complete := true;
    step_count := step_count + 1;
    foundation_steps := foundation_steps + 1;
  END IF;
  
  -- Step 3: Legacy story (care recipient profile)
  IF EXISTS (
    SELECT 1 FROM care_recipient_profiles 
    WHERE user_id = target_user_id AND full_name IS NOT NULL
  ) THEN
    story_complete := true;
    step_count := step_count + 1;
    foundation_steps := foundation_steps + 1;
  END IF;
  
  -- Step 4: Caregiver matches (accessible if profile + assessment complete)
  matches_accessible := profile_complete AND assessment_complete;
  IF matches_accessible THEN
    step_count := step_count + 1;
    foundation_steps := foundation_steps + 1;
  END IF;
  
  -- Step 5: Medication management (if care plans exist)
  IF EXISTS (SELECT 1 FROM care_plans WHERE family_id = target_user_id) THEN
    medication_setup := true;
    step_count := step_count + 1;
    foundation_steps := foundation_steps + 1;
  END IF;
  
  -- Step 6: Meal management (if care plans exist)
  IF medication_setup THEN
    meal_setup := true;
    step_count := step_count + 1;
    foundation_steps := foundation_steps + 1;
  END IF;
  
  -- Step 7: Visit scheduled
  IF user_record.visit_scheduling_status = 'scheduled' 
     OR user_record.visit_scheduling_status = 'completed' THEN
    visit_scheduled := true;
    step_count := step_count + 1;
    scheduling_steps := scheduling_steps + 1;
  END IF;
  
  -- Step 8: Visit confirmed
  IF user_record.visit_scheduling_status = 'completed' THEN
    visit_confirmed := true;
    step_count := step_count + 1;
    scheduling_steps := scheduling_steps + 1;
  END IF;
  
  -- Step 9-11: Trial steps (if trial payments exist)
  IF EXISTS (
    SELECT 1 FROM payment_transactions 
    WHERE user_id = target_user_id 
    AND transaction_type = 'trial_day' 
    AND status = 'completed'
  ) THEN
    trial_scheduled := true;
    trial_paid := true;
    trial_completed := true;
    step_count := step_count + 3;
    trial_steps := trial_steps + 3;
  END IF;
  
  -- Step 12: Care model selection
  IF user_record.visit_notes IS NOT NULL THEN
    BEGIN
      IF (user_record.visit_notes::jsonb ? 'care_model') THEN
        path_chosen := true;
        step_count := step_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If visit_notes is not valid JSON, skip this check
      NULL;
    END;
  END IF;
  
  -- Calculate completion percentage
  completion_percent := ROUND((step_count::numeric / total_steps::numeric) * 100, 0);
  
  -- Determine current step (next incomplete step)
  current_step := LEAST(step_count + 1, total_steps);
  
  -- Insert or update journey progress
  INSERT INTO user_journey_progress (
    user_id,
    role,
    current_step,
    total_steps,
    completion_percentage,
    last_activity_at,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    user_record.role::text,
    current_step,
    total_steps,
    completion_percent,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    current_step = EXCLUDED.current_step,
    completion_percentage = EXCLUDED.completion_percentage,
    last_activity_at = NOW(),
    updated_at = NOW();
    
  RAISE LOG 'Updated journey progress for user %: %% complete (%/%)', 
    target_user_id, completion_percent, step_count, total_steps;
END;
$$;

-- Create trigger function to auto-update progress
CREATE OR REPLACE FUNCTION public.trigger_journey_progress_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Schedule progress recalculation for the affected user
  PERFORM calculate_and_update_journey_progress(
    COALESCE(NEW.id, NEW.profile_id, NEW.user_id, NEW.family_id, OLD.id, OLD.profile_id, OLD.user_id, OLD.family_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add triggers to relevant tables
DROP TRIGGER IF EXISTS profiles_journey_progress_trigger ON profiles;
CREATE TRIGGER profiles_journey_progress_trigger
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_journey_progress_update();

DROP TRIGGER IF EXISTS care_needs_journey_progress_trigger ON care_needs_family;
CREATE TRIGGER care_needs_journey_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON care_needs_family
  FOR EACH ROW
  EXECUTE FUNCTION trigger_journey_progress_update();

DROP TRIGGER IF EXISTS care_recipient_journey_progress_trigger ON care_recipient_profiles;
CREATE TRIGGER care_recipient_journey_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON care_recipient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_journey_progress_update();

DROP TRIGGER IF EXISTS care_plans_journey_progress_trigger ON care_plans;
CREATE TRIGGER care_plans_journey_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON care_plans
  FOR EACH ROW
  EXECUTE FUNCTION trigger_journey_progress_update();

DROP TRIGGER IF EXISTS payment_journey_progress_trigger ON payment_transactions;
CREATE TRIGGER payment_journey_progress_trigger
  AFTER INSERT OR UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_journey_progress_update();

-- Create function to recalculate all users' progress
CREATE OR REPLACE FUNCTION public.recalculate_all_journey_progress()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  processed_count integer := 0;
BEGIN
  -- Only allow admin users to call this function
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can recalculate all journey progress';
  END IF;
  
  -- Process all family users
  FOR user_record IN 
    SELECT id FROM profiles WHERE role = 'family'
  LOOP
    PERFORM calculate_and_update_journey_progress(user_record.id);
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN 'Recalculated journey progress for ' || processed_count || ' users';
END;
$$;

-- Recalculate progress for all existing users
SELECT recalculate_all_journey_progress();