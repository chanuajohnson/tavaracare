-- Phase 3: Fix Professional User Progress Calculation
-- Enhance calculate_and_update_journey_progress to handle professional users

CREATE OR REPLACE FUNCTION public.calculate_and_update_journey_progress(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record profiles%ROWTYPE;
  step_count integer := 0;
  total_steps integer := 12; -- Default for family
  completion_percent numeric := 0;
  current_step integer := 1;
  foundation_steps integer := 0;
  scheduling_steps integer := 0;
  trial_steps integer := 0;
  
  -- Professional-specific variables
  professional_step_count integer := 0;
  professional_total_steps integer := 6;
  
  -- Step completion flags (family)
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
  
  -- Professional step completion flags
  prof_account_created boolean := false;
  prof_profile_complete boolean := false;
  prof_availability_set boolean := false;
  prof_documents_uploaded boolean := false;
  prof_has_assignments boolean := false;
  prof_has_certifications boolean := false;
  
  -- Professional data variables
  required_docs_count integer := 0;
  assignments_count integer := 0;
BEGIN
  -- Get user profile
  SELECT * INTO user_record FROM profiles WHERE id = target_user_id;
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_user_id;
  END IF;
  
  -- Handle professional users
  IF user_record.role = 'professional' THEN
    total_steps := professional_total_steps;
    
    -- Step 1: Account created (user exists)
    prof_account_created := true;
    professional_step_count := professional_step_count + 1;
    
    -- Step 2: Professional profile complete (professional_type and years_of_experience)
    IF user_record.professional_type IS NOT NULL 
       AND user_record.years_of_experience IS NOT NULL THEN
      prof_profile_complete := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 3: Availability set (care_schedule)
    IF (user_record.care_schedule IS NOT NULL AND array_length(string_to_array(user_record.care_schedule, ','), 1) > 0)
       OR user_record.custom_schedule IS NOT NULL THEN
      prof_availability_set := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 4: Documents uploaded (check professional_documents table)
    SELECT COUNT(*) INTO required_docs_count 
    FROM professional_documents 
    WHERE user_id = target_user_id 
    AND document_type IN ('identification', 'certificate', 'background_check');
    
    IF required_docs_count >= 3 THEN
      prof_documents_uploaded := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 5: Assignments (check manual_caregiver_assignments or care_team_members)
    SELECT COUNT(*) INTO assignments_count
    FROM (
      SELECT 1 FROM manual_caregiver_assignments 
      WHERE caregiver_id = target_user_id AND is_active = true
      UNION
      SELECT 1 FROM care_team_members 
      WHERE caregiver_id = target_user_id AND status = 'active'
      UNION 
      SELECT 1 FROM automatic_assignments 
      WHERE caregiver_id = target_user_id AND is_active = true
    ) assignments;
    
    IF assignments_count > 0 THEN
      prof_has_assignments := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 6: Certifications
    IF user_record.certifications IS NOT NULL 
       AND array_length(user_record.certifications, 1) > 0 THEN
      prof_has_certifications := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Set final values for professional
    step_count := professional_step_count;
    completion_percent := ROUND((step_count::numeric / total_steps::numeric) * 100, 0);
    current_step := LEAST(step_count + 1, total_steps);
    
  ELSE
    -- Existing family user logic (unchanged)
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
  END IF;
  
  -- Insert or update journey progress (works for both family and professional)
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
    total_steps = EXCLUDED.total_steps,
    completion_percentage = EXCLUDED.completion_percentage,
    last_activity_at = NOW(),
    updated_at = NOW();
END;
$$;

-- Recalculate progress for all professional users to fix existing 0% values
DO $$
DECLARE
  prof_user_record RECORD;
  processed_count integer := 0;
BEGIN
  -- Process all professional users
  FOR prof_user_record IN 
    SELECT id FROM profiles WHERE role = 'professional'
  LOOP
    PERFORM calculate_and_update_journey_progress(prof_user_record.id);
    processed_count := processed_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Recalculated journey progress for % professional users', processed_count;
END $$;