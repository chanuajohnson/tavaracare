
-- Reinstate payroll entries for Angela's work logs that were incorrectly deleted.
-- These are generated from the actual work_logs data.
-- Each work log is 8 hours at $35/hr = $280 gross pay.

INSERT INTO payroll_entries (
  work_log_id, care_team_member_id, care_plan_id,
  regular_hours, overtime_hours, regular_rate, overtime_rate,
  holiday_hours, holiday_rate, expense_total,
  gross_pay, total_amount, net_pay_after_nis,
  pay_period_start, pay_period_end,
  payment_status, nis_applicable,
  employee_contribution, employer_contribution
)
SELECT
  wl.id AS work_log_id,
  wl.care_team_member_id,
  wl.care_plan_id,
  8.00 AS regular_hours,
  0 AS overtime_hours,
  wl.base_rate AS regular_rate,
  ROUND(wl.base_rate * 1.5, 2) AS overtime_rate,
  0 AS holiday_hours,
  ROUND(wl.base_rate * 2, 2) AS holiday_rate,
  0 AS expense_total,
  ROUND(8.00 * wl.base_rate, 2) AS gross_pay,
  ROUND(8.00 * wl.base_rate, 2) AS total_amount,
  ROUND(8.00 * wl.base_rate, 2) AS net_pay_after_nis,
  wl.start_time AS pay_period_start,
  wl.end_time AS pay_period_end,
  'pending' AS payment_status,
  false AS nis_applicable,
  0 AS employee_contribution,
  0 AS employer_contribution
FROM work_logs wl
WHERE wl.care_plan_id = '4848aec5-edb0-4e4a-b8e8-5684c609e6d6'
  AND wl.care_team_member_id = '2302e12c-00e7-47e5-9ed1-12520716e4eb'
  AND NOT EXISTS (
    SELECT 1 FROM payroll_entries pe WHERE pe.work_log_id = wl.id
  );
