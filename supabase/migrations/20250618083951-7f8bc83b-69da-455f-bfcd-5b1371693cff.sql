
-- Step 1: Temporarily shift all existing steps 2+ to very high numbers to avoid conflicts
UPDATE journey_steps 
SET 
  step_number = step_number + 100,
  order_index = order_index + 100,
  updated_at = NOW()
WHERE user_role = 'family' AND step_number >= 2;

-- Step 2: Update the existing Step 1 to be "Create your account" with correct link
UPDATE journey_steps 
SET 
  title = 'Create your account',
  description = 'Set up your Tavara account',
  link_path = '/profile/edit',
  updated_at = NOW()
WHERE user_role = 'family' AND step_number = 1;

-- Step 3: Insert the new Step 2: "Complete your registration"
INSERT INTO journey_steps (
  step_number,
  title,
  description,
  category,
  user_role,
  is_optional,
  tooltip_content,
  detailed_explanation,
  time_estimate_minutes,
  link_path,
  icon_name,
  order_index,
  is_active
) VALUES (
  2,
  'Complete your registration',
  'Tell us about your care needs',
  'foundation',
  'family',
  false,
  'Complete your family registration to get personalized care',
  'Your registration helps us understand your unique care situation',
  10,
  '/registration/family',
  'ClipboardCheck',
  2,
  true
);

-- Step 4: Now update the temporarily shifted steps to their correct new numbers (3-13)
UPDATE journey_steps 
SET 
  step_number = step_number - 97, -- This converts 102->5, 103->6, etc. to 3->13
  order_index = order_index - 97,
  updated_at = NOW()
WHERE user_role = 'family' AND step_number >= 102;

-- Step 5: Update the journey paths to reflect the new step numbering
-- Update the Trial Experience Path to include all steps 1-12
UPDATE journey_step_paths 
SET 
  step_ids = '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]'::jsonb,
  updated_at = NOW()
WHERE user_role = 'family' 
  AND path_name = 'Trial Experience Path';

-- Update the Quick Start Path to reflect the new step numbering (skipping trial steps)
UPDATE journey_step_paths 
SET 
  step_ids = '[1, 2, 3, 4, 7, 13]'::jsonb,
  updated_at = NOW()
WHERE user_role = 'family' 
  AND path_name = 'Quick Start Path';
