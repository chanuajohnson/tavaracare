
-- Fix create_unified_assignment: use 'custom' message_type
CREATE OR REPLACE FUNCTION public.create_unified_assignment(target_family_user_id uuid, target_caregiver_id uuid, assignment_type_param text, admin_override_score_param numeric DEFAULT NULL::numeric, assignment_reason_param text DEFAULT NULL::text, assignment_notes_param text DEFAULT NULL::text, care_plan_id_param uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  assignment_id UUID;
  executing_admin_id UUID;
  match_scores jsonb;
  final_match_score numeric;
  shift_compatibility numeric;
BEGIN
  executing_admin_id := auth.uid();
  
  IF assignment_type_param NOT IN ('automatic', 'manual', 'care_team') THEN
    RAISE EXCEPTION 'Invalid assignment type. Must be automatic, manual, or care_team';
  END IF;
  
  IF target_family_user_id IS NULL OR target_caregiver_id IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters: family_user_id and caregiver_id';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_family_user_id AND role = 'family'
  ) THEN
    RAISE EXCEPTION 'Invalid family user ID';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_caregiver_id AND role = 'professional'
  ) THEN
    RAISE EXCEPTION 'Invalid caregiver ID';
  END IF;
  
  match_scores := calculate_unified_match_score(target_family_user_id, target_caregiver_id);
  final_match_score := COALESCE(admin_override_score_param, (match_scores->>'overall_score')::numeric);
  shift_compatibility := (match_scores->>'schedule_score')::numeric;
  
  UPDATE caregiver_assignments 
  SET is_active = FALSE, updated_at = NOW()
  WHERE family_user_id = target_family_user_id 
    AND caregiver_id = target_caregiver_id 
    AND assignment_type = assignment_type_param
    AND is_active = TRUE;
  
  INSERT INTO caregiver_assignments (
    family_user_id, caregiver_id, assignment_type, match_score,
    admin_override_score, shift_compatibility_score, match_explanation,
    assignment_reason, notes, status, care_plan_id, assigned_by_admin_id,
    is_active, created_at, updated_at
  ) VALUES (
    target_family_user_id, target_caregiver_id, assignment_type_param,
    final_match_score, admin_override_score_param, shift_compatibility,
    match_scores->>'match_explanation', assignment_reason_param,
    assignment_notes_param, 'active', care_plan_id_param, executing_admin_id,
    TRUE, NOW(), NOW()
  ) RETURNING id INTO assignment_id;
  
  INSERT INTO admin_communications (
    admin_id, target_user_id, message_type, custom_message, sent_at
  ) VALUES (
    executing_admin_id,
    target_family_user_id,
    'custom',
    format('%s assignment created between family %s and caregiver %s', 
           assignment_type_param, target_family_user_id, target_caregiver_id),
    NOW()
  );
  
  RETURN assignment_id;
END;
$function$;

-- Fix create_admin_assignment: use 'custom' message_type
CREATE OR REPLACE FUNCTION public.create_admin_assignment(target_family_user_id uuid, target_caregiver_id uuid, calculated_match_score numeric, admin_override_score numeric DEFAULT NULL::numeric, assignment_reason text DEFAULT NULL::text, assignment_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  assignment_id UUID;
  executing_admin_id UUID;
BEGIN
  executing_admin_id := auth.uid();
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = executing_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can create manual assignments';
  END IF;
  
  IF target_family_user_id IS NULL OR target_caregiver_id IS NULL OR calculated_match_score IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_family_user_id AND role = 'family'
  ) THEN
    RAISE EXCEPTION 'Invalid family user ID';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_caregiver_id AND role = 'professional'
  ) THEN
    RAISE EXCEPTION 'Invalid caregiver ID';
  END IF;
  
  UPDATE automatic_assignments 
  SET is_active = FALSE, updated_at = NOW()
  WHERE family_user_id = target_family_user_id AND is_active = TRUE;
  
  INSERT INTO admin_match_interventions (
    admin_id, family_user_id, caregiver_id, intervention_type,
    original_match_score, admin_match_score, reason, notes,
    status, created_at, updated_at
  ) VALUES (
    executing_admin_id, target_family_user_id, target_caregiver_id,
    'manual_assignment', calculated_match_score, admin_override_score,
    assignment_reason, assignment_notes, 'active', NOW(), NOW()
  ) RETURNING id INTO assignment_id;
  
  INSERT INTO admin_communications (
    admin_id, target_user_id, message_type, custom_message, sent_at
  ) VALUES (
    executing_admin_id, target_family_user_id, 'custom',
    'Manual caregiver assignment created by admin', NOW()
  );
  
  RETURN assignment_id;
END;
$function$;

-- Fix create_automatic_assignment: use 'custom' message_type
CREATE OR REPLACE FUNCTION public.create_automatic_assignment(target_family_user_id uuid, target_caregiver_id uuid, calculated_match_score numeric, calculated_shift_compatibility_score numeric DEFAULT NULL::numeric, assignment_explanation text DEFAULT NULL::text, algorithm_version_param text DEFAULT 'v2.0'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  assignment_id UUID;
BEGIN
  IF target_family_user_id IS NULL OR target_caregiver_id IS NULL OR calculated_match_score IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_family_user_id AND role = 'family'
  ) THEN
    RAISE EXCEPTION 'Invalid family user ID';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_caregiver_id AND role = 'professional'
  ) THEN
    RAISE EXCEPTION 'Invalid caregiver ID';
  END IF;
  
  UPDATE automatic_assignments 
  SET is_active = FALSE, updated_at = NOW()
  WHERE family_user_id = target_family_user_id AND is_active = TRUE;
  
  INSERT INTO automatic_assignments (
    family_user_id, caregiver_id, match_score, shift_compatibility_score,
    match_explanation, algorithm_version, is_active, created_at, updated_at
  ) VALUES (
    target_family_user_id, target_caregiver_id, calculated_match_score,
    calculated_shift_compatibility_score, assignment_explanation,
    algorithm_version_param, TRUE, NOW(), NOW()
  ) RETURNING id INTO assignment_id;
  
  INSERT INTO admin_communications (
    admin_id, target_user_id, message_type, custom_message, sent_at
  ) VALUES (
    NULL, target_family_user_id, 'custom',
    'Automatic caregiver assignment created by system', NOW()
  );
  
  RETURN assignment_id;
END;
$function$;

-- Fix trigger_automatic_assignment_process: use 'custom' message_type
CREATE OR REPLACE FUNCTION public.trigger_automatic_assignment_process(target_family_user_id uuid DEFAULT NULL::uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result_message TEXT;
  processed_count INTEGER := 0;
  family_user_record RECORD;
BEGIN
  IF target_family_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = target_family_user_id AND role = 'family'
    ) THEN
      RAISE EXCEPTION 'Invalid family user ID';
    END IF;
    
    INSERT INTO admin_communications (
      admin_id, target_user_id, message_type, custom_message, sent_at
    ) VALUES (
      NULL, target_family_user_id, 'custom',
      'Automatic assignment process triggered for user', NOW()
    );
    
    processed_count := 1;
    result_message := 'Assignment process triggered for 1 family user';
  ELSE
    FOR family_user_record IN 
      SELECT id FROM profiles 
      WHERE role = 'family' 
      AND (
        NOT EXISTS (
          SELECT 1 FROM automatic_assignments 
          WHERE family_user_id = profiles.id AND is_active = TRUE
        )
        OR EXISTS (
          SELECT 1 FROM automatic_assignments 
          WHERE family_user_id = profiles.id 
          AND is_active = TRUE 
          AND updated_at < NOW() - INTERVAL '7 days'
        )
      )
    LOOP
      INSERT INTO admin_communications (
        admin_id, target_user_id, message_type, custom_message, sent_at
      ) VALUES (
        NULL, family_user_record.id, 'custom',
        'Automatic assignment process triggered via batch processing', NOW()
      );
      
      processed_count := processed_count + 1;
    END LOOP;
    
    result_message := 'Assignment process triggered for ' || processed_count || ' family users';
  END IF;
  
  RETURN result_message;
END;
$function$;

-- Fix audit_assignment_changes: use 'custom' message_type
CREATE OR REPLACE FUNCTION public.audit_assignment_changes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
    INSERT INTO admin_communications (
      admin_id, target_user_id, message_type, custom_message, sent_at
    ) VALUES (
      auth.uid(), NEW.family_user_id, 'custom',
      'Assignment status changed from ' || OLD.is_active || ' to ' || NEW.is_active, NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
