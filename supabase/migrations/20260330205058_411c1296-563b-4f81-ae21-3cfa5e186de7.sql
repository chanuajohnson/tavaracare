
-- Create professional_references table
CREATE TABLE public.professional_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_name TEXT NOT NULL,
  reference_phone TEXT,
  reference_email TEXT,
  reference_relationship TEXT NOT NULL,
  years_known TEXT,
  reference_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create professional_screening table
CREATE TABLE public.professional_screening (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screening_type TEXT NOT NULL CHECK (screening_type IN ('head_nurse_interview', 'skills_assessment')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  interviewer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'passed', 'failed', 'needs_followup')),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  recommendation TEXT CHECK (recommendation IN ('approve', 'reject', 'conditional')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add onboarding_stage and screening_cleared to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_stage TEXT DEFAULT 'registration',
  ADD COLUMN IF NOT EXISTS screening_cleared BOOLEAN DEFAULT false;

-- RLS for professional_references
ALTER TABLE public.professional_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own references"
  ON public.professional_references FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert their own references"
  ON public.professional_references FOR INSERT
  TO authenticated
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update their own references"
  ON public.professional_references FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Admins can view all references"
  ON public.professional_references FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all references"
  ON public.professional_references FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS for professional_screening
ALTER TABLE public.professional_screening ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own screening"
  ON public.professional_screening FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Admins can manage all screenings"
  ON public.professional_screening FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update calculate_and_update_journey_progress to support 8 steps
CREATE OR REPLACE FUNCTION public.calculate_and_update_journey_progress(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_record profiles%ROWTYPE;
  step_count integer := 0;
  total_steps integer := 12;
  completion_percent numeric := 0;
  current_step integer := 1;
  foundation_steps integer := 0;
  scheduling_steps integer := 0;
  trial_steps integer := 0;
  
  professional_step_count integer := 0;
  professional_total_steps integer := 8;
  
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
  
  prof_account_created boolean := false;
  prof_profile_complete boolean := false;
  prof_availability_set boolean := false;
  prof_documents_uploaded boolean := false;
  prof_references_submitted boolean := false;
  prof_screening_passed boolean := false;
  prof_has_assignments boolean := false;
  prof_has_certifications boolean := false;
  
  required_docs_count integer := 0;
  assignments_count integer := 0;
  references_count integer := 0;
  screening_passed_count integer := 0;
BEGIN
  SELECT * INTO user_record FROM profiles WHERE id = target_user_id;
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_user_id;
  END IF;
  
  IF user_record.role = 'professional' THEN
    total_steps := professional_total_steps;
    
    -- Step 1: Account created
    prof_account_created := true;
    professional_step_count := professional_step_count + 1;
    
    -- Step 2: Professional profile complete
    IF user_record.professional_type IS NOT NULL 
       AND user_record.years_of_experience IS NOT NULL THEN
      prof_profile_complete := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 3: Availability set
    IF (user_record.care_schedule IS NOT NULL AND array_length(string_to_array(user_record.care_schedule, ','), 1) > 0)
       OR user_record.custom_schedule IS NOT NULL THEN
      prof_availability_set := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 4: Documents uploaded
    SELECT COUNT(*) INTO required_docs_count 
    FROM professional_documents 
    WHERE user_id = target_user_id 
    AND document_type IN ('identification', 'certificate', 'background_check');
    
    IF required_docs_count >= 3 THEN
      prof_documents_uploaded := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 5: References submitted (NEW - need 2+)
    SELECT COUNT(*) INTO references_count
    FROM professional_references
    WHERE professional_id = target_user_id;
    
    IF references_count >= 2 THEN
      prof_references_submitted := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 6: Screening passed (NEW - need a passed head_nurse_interview)
    SELECT COUNT(*) INTO screening_passed_count
    FROM professional_screening
    WHERE professional_id = target_user_id
    AND screening_type = 'head_nurse_interview'
    AND status = 'passed';
    
    IF screening_passed_count > 0 THEN
      prof_screening_passed := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    -- Step 7: Assignments (was step 5)
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
    
    -- Step 8: Certifications (was step 6)
    IF user_record.certifications IS NOT NULL 
       AND array_length(user_record.certifications, 1) > 0 THEN
      prof_has_certifications := true;
      professional_step_count := professional_step_count + 1;
    END IF;
    
    step_count := professional_step_count;
    completion_percent := ROUND((step_count::numeric / total_steps::numeric) * 100, 0);
    current_step := LEAST(step_count + 1, total_steps);
    
  ELSE
    -- Family user logic (unchanged)
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
    
    IF EXISTS (SELECT 1 FROM care_needs_family WHERE profile_id = target_user_id) THEN
      assessment_complete := true;
      step_count := step_count + 1;
      foundation_steps := foundation_steps + 1;
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM care_recipient_profiles 
      WHERE user_id = target_user_id AND full_name IS NOT NULL
    ) THEN
      story_complete := true;
      step_count := step_count + 1;
      foundation_steps := foundation_steps + 1;
    END IF;
    
    matches_accessible := profile_complete AND assessment_complete;
    IF matches_accessible THEN
      step_count := step_count + 1;
      foundation_steps := foundation_steps + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM care_plans WHERE family_id = target_user_id) THEN
      medication_setup := true;
      step_count := step_count + 1;
      foundation_steps := foundation_steps + 1;
    END IF;
    
    IF medication_setup THEN
      meal_setup := true;
      step_count := step_count + 1;
      foundation_steps := foundation_steps + 1;
    END IF;
    
    IF user_record.visit_scheduling_status = 'scheduled' 
       OR user_record.visit_scheduling_status = 'completed' THEN
      visit_scheduled := true;
      step_count := step_count + 1;
      scheduling_steps := scheduling_steps + 1;
    END IF;
    
    IF user_record.visit_scheduling_status = 'completed' THEN
      visit_confirmed := true;
      step_count := step_count + 1;
      scheduling_steps := scheduling_steps + 1;
    END IF;
    
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
    
    IF user_record.visit_notes IS NOT NULL THEN
      BEGIN
        IF (user_record.visit_notes::jsonb ? 'care_model') THEN
          path_chosen := true;
          step_count := step_count + 1;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
    
    completion_percent := ROUND((step_count::numeric / total_steps::numeric) * 100, 0);
    current_step := LEAST(step_count + 1, total_steps);
  END IF;
  
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
$function$;
