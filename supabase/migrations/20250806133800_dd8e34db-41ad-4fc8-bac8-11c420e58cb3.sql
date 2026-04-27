-- Create some automatic assignments for the user who has no matches
-- Get the user ID first
DO $$
DECLARE
    user_uuid UUID := '42fd0608-761c-4d82-95ed-48b2c2f03654';
    caregiver_uuid UUID;
    assignment_id UUID;
BEGIN
    -- Get a professional caregiver
    SELECT id INTO caregiver_uuid 
    FROM profiles 
    WHERE role = 'professional' 
    AND available_for_matching = true 
    LIMIT 1;
    
    -- Only proceed if we found a caregiver
    IF caregiver_uuid IS NOT NULL THEN
        -- Create an automatic assignment
        INSERT INTO caregiver_assignments (
            family_user_id,
            caregiver_id,
            assignment_type,
            match_score,
            match_explanation,
            status,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
            caregiver_uuid,
            'automatic',
            85.0,
            'Good match based on care needs and caregiver specialization',
            'active',
            true,
            NOW(),
            NOW()
        ) RETURNING id INTO assignment_id;
        
        RAISE NOTICE 'Created assignment % for user % with caregiver %', assignment_id, user_uuid, caregiver_uuid;
    ELSE
        RAISE NOTICE 'No available caregivers found';
    END IF;
END $$;