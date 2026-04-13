-- Fix bad client_name values in daily_care_logs for Peltier care plan
UPDATE daily_care_logs
SET client_name = 'Chanua Johnson'
WHERE care_plan_id = '4848aec5-edb0-4e4a-b8e8-5684c609e6d6'
  AND client_name = 'User1 Family Family Family';
