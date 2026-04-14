
-- Fix NIS on reinstated payroll entries that were inserted with nis_applicable=false
UPDATE payroll_entries
SET
  nis_applicable = true,
  employer_contribution = 30.12,
  employee_contribution = 15.06,
  net_pay_after_nis = gross_pay - 15.06,
  updated_at = NOW()
WHERE care_plan_id = '4848aec5-edb0-4e4a-b8e8-5684c609e6d6'
  AND care_team_member_id = '2302e12c-00e7-47e5-9ed1-12520716e4eb'
  AND nis_applicable = false
  AND employer_contribution = 0
  AND employee_contribution = 0
  AND pay_period_start >= '2026-03-01'
  AND pay_period_start < '2026-04-01';
