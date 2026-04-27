UPDATE public.nudge_templates
SET message_template = REPLACE(message_template, '{{name}}', '[Name]'),
    updated_at = NOW()
WHERE name = 'NIS Employer Registration Support'
  AND message_template LIKE '%{{name}}%';