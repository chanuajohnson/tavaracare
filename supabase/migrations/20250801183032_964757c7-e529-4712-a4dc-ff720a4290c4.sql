-- Phase 1: Create unified caregiver_assignments table
CREATE TABLE public.caregiver_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_user_id uuid NOT NULL,
  caregiver_id uuid NOT NULL,
  assignment_type text NOT NULL CHECK (assignment_type IN ('automatic', 'manual', 'care_team')),
  match_score numeric NOT NULL DEFAULT 0,
  admin_override_score numeric,
  shift_compatibility_score numeric,
  match_explanation text,
  assignment_reason text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'completed')),
  priority_level integer DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 10),
  algorithm_version text DEFAULT 'v2.0',
  care_plan_id uuid,
  assigned_by_admin_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Ensure no duplicate active assignments for same family-caregiver pair
  UNIQUE(family_user_id, caregiver_id, assignment_type) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS on the new table
ALTER TABLE public.caregiver_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all assignments" ON public.caregiver_assignments
FOR ALL USING (
  COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin'
);

CREATE POLICY "Family users can view their assignments" ON public.caregiver_assignments
FOR SELECT USING (
  family_user_id = auth.uid()
);

CREATE POLICY "Professionals can view their assignments" ON public.caregiver_assignments
FOR SELECT USING (
  caregiver_id = auth.uid()
);

-- Create indexes for performance
CREATE INDEX idx_caregiver_assignments_family_user ON caregiver_assignments(family_user_id);
CREATE INDEX idx_caregiver_assignments_caregiver ON caregiver_assignments(caregiver_id);
CREATE INDEX idx_caregiver_assignments_type_status ON caregiver_assignments(assignment_type, status);
CREATE INDEX idx_caregiver_assignments_active ON caregiver_assignments(is_active) WHERE is_active = true;

-- Create updated_at trigger
CREATE TRIGGER update_caregiver_assignments_updated_at
  BEFORE UPDATE ON public.caregiver_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create unified match scoring function
CREATE OR REPLACE FUNCTION public.calculate_unified_match_score(
  target_family_user_id uuid,
  target_caregiver_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  family_profile RECORD;
  caregiver_profile RECORD;
  family_schedule text[];
  caregiver_schedule text[];
  care_types_match_score numeric := 0;
  schedule_match_score numeric := 0;
  experience_score numeric := 0;
  location_score numeric := 0;
  overall_score numeric := 0;
  match_explanation text := '';
BEGIN
  -- Get family profile and care needs
  SELECT p.*, c.care_schedule, c.care_types, c.special_needs
  INTO family_profile
  FROM profiles p
  LEFT JOIN care_needs_family c ON c.profile_id = p.id
  WHERE p.id = target_family_user_id AND p.role = 'family';
  
  -- Get caregiver profile
  SELECT * INTO caregiver_profile
  FROM profiles
  WHERE id = target_caregiver_id AND role = 'professional';
  
  IF family_profile IS NULL OR caregiver_profile IS NULL THEN
    RETURN jsonb_build_object(
      'overall_score', 0,
      'care_types_score', 0,
      'schedule_score', 0,
      'experience_score', 0,
      'location_score', 0,
      'match_explanation', 'Invalid family or caregiver profile'
    );
  END IF;
  
  -- Parse schedules
  family_schedule := CASE 
    WHEN family_profile.care_schedule IS NOT NULL THEN 
      string_to_array(replace(replace(family_profile.care_schedule, '[', ''), ']', ''), ',')
    ELSE ARRAY[]::text[]
  END;
  
  caregiver_schedule := CASE 
    WHEN caregiver_profile.care_schedule IS NOT NULL THEN 
      string_to_array(replace(replace(caregiver_profile.care_schedule, '[', ''), ']', ''), ',')
    ELSE ARRAY[]::text[]
  END;
  
  -- Calculate care types compatibility (30% weight)
  IF family_profile.care_types IS NOT NULL AND caregiver_profile.care_types IS NOT NULL THEN
    WITH family_care AS (SELECT unnest(family_profile.care_types) as care_type),
         caregiver_care AS (SELECT unnest(caregiver_profile.care_types) as care_type),
         matches AS (SELECT COUNT(*) as match_count FROM family_care f JOIN caregiver_care c ON f.care_type = c.care_type)
    SELECT LEAST(100, (match_count::numeric / GREATEST(array_length(family_profile.care_types, 1), 1)) * 100)
    INTO care_types_match_score
    FROM matches;
  ELSE
    care_types_match_score := 70; -- Default neutral score
  END IF;
  
  -- Calculate schedule compatibility (35% weight)
  IF array_length(family_schedule, 1) > 0 AND array_length(caregiver_schedule, 1) > 0 THEN
    WITH schedule_matches AS (
      SELECT COUNT(*) as match_count 
      FROM unnest(family_schedule) f(schedule) 
      JOIN unnest(caregiver_schedule) c(schedule) ON f.schedule = c.schedule
    )
    SELECT LEAST(100, (match_count::numeric / array_length(family_schedule, 1)) * 100)
    INTO schedule_match_score
    FROM schedule_matches;
    
    -- Bonus for flexible caregivers
    IF 'flexible' = ANY(caregiver_schedule) OR '24_7_care' = ANY(caregiver_schedule) THEN
      schedule_match_score := LEAST(100, schedule_match_score + 20);
    END IF;
  ELSE
    schedule_match_score := 75; -- Default good score when schedules are missing
  END IF;
  
  -- Calculate experience score (20% weight)
  experience_score := CASE 
    WHEN caregiver_profile.years_of_experience ILIKE '%5+%' OR caregiver_profile.years_of_experience ILIKE '%6+%' THEN 95
    WHEN caregiver_profile.years_of_experience ILIKE '%3+%' OR caregiver_profile.years_of_experience ILIKE '%4+%' THEN 85
    WHEN caregiver_profile.years_of_experience ILIKE '%2+%' THEN 75
    WHEN caregiver_profile.years_of_experience ILIKE '%1+%' THEN 65
    ELSE 60
  END;
  
  -- Calculate location score (15% weight) - simplified for now
  location_score := CASE
    WHEN family_profile.address IS NOT NULL AND caregiver_profile.location IS NOT NULL THEN 80
    ELSE 70
  END;
  
  -- Calculate overall weighted score
  overall_score := ROUND(
    (care_types_match_score * 0.30) +
    (schedule_match_score * 0.35) +
    (experience_score * 0.20) +
    (location_score * 0.15)
  );
  
  -- Generate explanation
  match_explanation := format(
    'Care types compatibility: %s%%, Schedule match: %s%%, Experience level: %s%%, Location: %s%%',
    ROUND(care_types_match_score),
    ROUND(schedule_match_score),
    ROUND(experience_score),
    ROUND(location_score)
  );
  
  RETURN jsonb_build_object(
    'overall_score', overall_score,
    'care_types_score', ROUND(care_types_match_score),
    'schedule_score', ROUND(schedule_match_score),
    'experience_score', ROUND(experience_score),
    'location_score', ROUND(location_score),
    'match_explanation', match_explanation
  );
END;
$$;

-- Create function to create unified assignments
CREATE OR REPLACE FUNCTION public.create_unified_assignment(
  target_family_user_id uuid,
  target_caregiver_id uuid,
  assignment_type_param text,
  admin_override_score_param numeric DEFAULT NULL,
  assignment_reason_param text DEFAULT NULL,
  assignment_notes_param text DEFAULT NULL,
  care_plan_id_param uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  assignment_id UUID;
  executing_admin_id UUID;
  match_scores jsonb;
  final_match_score numeric;
  shift_compatibility numeric;
BEGIN
  -- Get executing admin ID (can be NULL for automatic assignments)
  executing_admin_id := auth.uid();
  
  -- Validate assignment type
  IF assignment_type_param NOT IN ('automatic', 'manual', 'care_team') THEN
    RAISE EXCEPTION 'Invalid assignment type. Must be automatic, manual, or care_team';
  END IF;
  
  -- Validate required parameters
  IF target_family_user_id IS NULL OR target_caregiver_id IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters: family_user_id and caregiver_id';
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
  
  -- Calculate match scores
  match_scores := calculate_unified_match_score(target_family_user_id, target_caregiver_id);
  final_match_score := COALESCE(admin_override_score_param, (match_scores->>'overall_score')::numeric);
  shift_compatibility := (match_scores->>'schedule_score')::numeric;
  
  -- Deactivate any existing assignments for this family-caregiver-type combination
  UPDATE caregiver_assignments 
  SET is_active = FALSE, updated_at = NOW()
  WHERE family_user_id = target_family_user_id 
    AND caregiver_id = target_caregiver_id 
    AND assignment_type = assignment_type_param
    AND is_active = TRUE;
  
  -- Create new assignment
  INSERT INTO caregiver_assignments (
    family_user_id,
    caregiver_id,
    assignment_type,
    match_score,
    admin_override_score,
    shift_compatibility_score,
    match_explanation,
    assignment_reason,
    notes,
    status,
    care_plan_id,
    assigned_by_admin_id,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    target_family_user_id,
    target_caregiver_id,
    assignment_type_param,
    final_match_score,
    admin_override_score_param,
    shift_compatibility,
    match_scores->>'match_explanation',
    assignment_reason_param,
    assignment_notes_param,
    'active',
    care_plan_id_param,
    executing_admin_id,
    TRUE,
    NOW(),
    NOW()
  ) RETURNING id INTO assignment_id;
  
  -- Log the assignment creation in admin communications
  INSERT INTO admin_communications (
    admin_id,
    target_user_id,
    message_type,
    custom_message,
    sent_at
  ) VALUES (
    executing_admin_id,
    target_family_user_id,
    assignment_type_param || '_assignment_created',
    format('%s assignment created between family %s and caregiver %s', 
           assignment_type_param, target_family_user_id, target_caregiver_id),
    NOW()
  );
  
  RETURN assignment_id;
END;
$$;