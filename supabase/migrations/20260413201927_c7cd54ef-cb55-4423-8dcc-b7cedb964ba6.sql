
-- Trigger function: sync pending payroll entries when work log rates change
CREATE OR REPLACE FUNCTION public.sync_payroll_on_work_log_rate_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entry RECORD;
  new_rate NUMERIC;
  new_gross NUMERIC;
BEGIN
  -- Only proceed if rate-related columns actually changed
  IF (OLD.base_rate IS NOT DISTINCT FROM NEW.base_rate)
     AND (OLD.rate_multiplier IS NOT DISTINCT FROM NEW.rate_multiplier)
     AND (OLD.rate_type IS NOT DISTINCT FROM NEW.rate_type) THEN
    RETURN NEW;
  END IF;

  -- Calculate the new effective rate
  new_rate := COALESCE(NEW.base_rate, 25) * COALESCE(NEW.rate_multiplier, 1);

  -- Update all pending payroll entries linked to this work log
  FOR entry IN
    SELECT id, hours_worked, expense_amount
    FROM payroll_entries
    WHERE work_log_id = NEW.id
      AND payment_status = 'pending'
  LOOP
    new_gross := ROUND((COALESCE(entry.hours_worked, 0) * new_rate)::numeric, 2);

    UPDATE payroll_entries
    SET regular_rate = new_rate,
        gross_pay = new_gross,
        total_amount = new_gross + COALESCE(entry.expense_amount, 0),
        net_pay_after_nis = new_gross + COALESCE(entry.expense_amount, 0),
        updated_at = NOW()
    WHERE id = entry.id;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create the trigger on work_logs
DROP TRIGGER IF EXISTS trg_sync_payroll_on_rate_change ON public.work_logs;
CREATE TRIGGER trg_sync_payroll_on_rate_change
  AFTER UPDATE ON public.work_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_payroll_on_work_log_rate_change();
