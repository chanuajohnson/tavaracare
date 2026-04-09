UPDATE daily_care_logs 
SET care_plan_id = '4848aec5-edb0-4e4a-b8e8-5684c609e6d6',
    family_id = '7d850934-a44f-4348-944b-ae7182dca237'
WHERE professional_id = '56922ef7-6278-4f3f-b48c-fe309cd80ec9'
  AND care_plan_id IS NULL;