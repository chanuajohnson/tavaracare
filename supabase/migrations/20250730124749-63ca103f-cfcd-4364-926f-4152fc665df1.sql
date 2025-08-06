-- Fix RLS infinite recursion and enable proper policies

-- First, drop any problematic policies on profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Professionals can view all care recipient profiles" ON public.care_recipient_profiles;

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create safe, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create admin policy using security definer function to avoid recursion
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'
  ) = 'admin'
);

-- Update care recipient profiles policy to use security definer function
CREATE POLICY "Professionals can view care recipient profiles via assignments" ON public.care_recipient_profiles
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.get_professional_accessible_family_profiles(auth.uid()) p
    WHERE p.id = care_recipient_profiles.user_id
  )
);

-- Update the journey progress calculation function to handle 12 steps correctly
CREATE OR REPLACE FUNCTION public.calculate_and_update_journey_progress_fixed(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record profiles%ROWTYPE;
  step_count integer := 0;
  total_steps integer := 12; -- Always 12 for family users
  completion_percent numeric := 0;
  current_step integer := 1;
  
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
  
  -- Only process family users with this function
  IF user_record.role != 'family' THEN
    RETURN;
  END IF;

  -- Step 1: Enhanced Profile completion (matches useSharedFamilyJourneyData logic)
  IF user_record.full_name IS NOT NULL 
     AND user_record.phone_number IS NOT NULL 
     AND user_record.address IS NOT NULL 
     AND user_record.care_recipient_name IS NOT NULL 
     AND user_record.relationship IS NOT NULL
     AND (
       (user_record.care_types IS NOT NULL AND array_length(user_record.care_types, 1) > 0)
       OR user_record.care_schedule IS NOT NULL
       OR user_record.budget_preferences IS NOT NULL
       OR user_record.caregiver_type IS NOT NULL
     )
  THEN
    profile_complete := true;
    step_count := step_count + 1;
  END IF;
  
  -- Step 2: Care assessment
  IF EXISTS (SELECT 1 FROM care_needs_family WHERE profile_id = target_user_id) THEN
    assessment_complete := true;
    step_count := step_count + 1;
  END IF;
  
  -- Step 3: Legacy story (care recipient profile)
  IF EXISTS (
    SELECT 1 FROM care_recipient_profiles 
    WHERE user_id = target_user_id AND full_name IS NOT NULL
  ) THEN
    story_complete := true;
    step_count := step_count + 1;
  END IF;
  
  -- Step 4: Caregiver matches (accessible if profile + assessment complete)
  matches_accessible := profile_complete AND assessment_complete;
  IF story_complete THEN -- Matches become available when story is complete
    step_count := step_count + 1;
  END IF;
  
  -- Step 5: Medication management (if care plans exist)
  IF EXISTS (
    SELECT 1 FROM care_plans cp
    INNER JOIN medications m ON m.care_plan_id = cp.id
    WHERE cp.family_id = target_user_id
  ) THEN
    medication_setup := true;
    step_count := step_count + 1;
  END IF;
  
  -- Step 6: Meal management (if care plans exist)
  IF EXISTS (
    SELECT 1 FROM care_plans cp
    INNER JOIN meal_plans mp ON mp.care_plan_id = cp.id
    WHERE cp.family_id = target_user_id
  ) THEN
    meal_setup := true;
    step_count := step_count + 1;
  END IF;
  
  -- Step 7: Visit scheduled
  IF user_record.visit_scheduling_status = 'scheduled' 
     OR user_record.visit_scheduling_status = 'completed' THEN
    visit_scheduled := true;
    step_count := step_count + 1;
  END IF;
  
  -- Step 8: Visit confirmed
  IF user_record.visit_scheduling_status = 'completed' THEN
    visit_confirmed := true;
    step_count := step_count + 1;
  END IF;
  
  -- Steps 9-11: Trial steps (if trial payments exist)
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
    total_steps = EXCLUDED.total_steps,
    completion_percentage = EXCLUDED.completion_percentage,
    last_activity_at = NOW(),
    updated_at = NOW();
END;
$function$;

-- Recalculate journey progress for all family users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM profiles WHERE role = 'family'
  LOOP
    PERFORM calculate_and_update_journey_progress_fixed(user_record.id);
  END LOOP;
END;
$$;