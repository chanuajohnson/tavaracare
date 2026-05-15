
CREATE TABLE public.family_payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_user_id uuid NOT NULL,
  care_plan_id uuid REFERENCES public.care_plans(id) ON DELETE SET NULL,
  paid_date date NOT NULL,
  period_start date,
  period_end date,
  total_amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'TTD',
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  is_milestone boolean NOT NULL DEFAULT true,
  receipt_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_family_payment_records_family ON public.family_payment_records(family_user_id);
CREATE INDEX idx_family_payment_records_plan ON public.family_payment_records(care_plan_id);
CREATE INDEX idx_family_payment_records_paid_date ON public.family_payment_records(paid_date);

ALTER TABLE public.family_payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all family payment records"
ON public.family_payment_records
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Families view their own payment records"
ON public.family_payment_records
FOR SELECT
TO authenticated
USING (auth.uid() = family_user_id);

CREATE TRIGGER trg_family_payment_records_updated_at
BEFORE UPDATE ON public.family_payment_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Ana Maria Aimey's three historical payments (care plan with Denise Narcis)
INSERT INTO public.family_payment_records
  (family_user_id, care_plan_id, paid_date, period_start, period_end, total_amount, currency, line_items, notes)
VALUES
  ('9874b53e-ea23-4ccb-abed-ddbb0367edf5', '3d634783-c041-476d-8360-2980846a39e4',
   '2026-04-16', '2026-04-13', '2026-04-19', 1899.00, 'TTD',
   '[{"label":"Caregiver care payment","amount":1400,"category":"caregiver_care"},{"label":"Care subscription (weekly)","amount":499,"category":"subscription"}]'::jsonb,
   'Week 1 — care started Apr 13, 2026 with Denise Narcis'),
  ('9874b53e-ea23-4ccb-abed-ddbb0367edf5', '3d634783-c041-476d-8360-2980846a39e4',
   '2026-05-01', '2026-04-27', '2026-05-03', 2248.00, 'TTD',
   '[{"label":"Caregiver care payment","amount":1400,"category":"caregiver_care"},{"label":"Care subscription (weekly)","amount":499,"category":"subscription"},{"label":"NIS registration & coordination (one-time)","amount":349,"category":"nis_registration"}]'::jsonb,
   'Week 2 — includes one-time NIS registration & coordination fee'),
  ('9874b53e-ea23-4ccb-abed-ddbb0367edf5', '3d634783-c041-476d-8360-2980846a39e4',
   '2026-05-07', '2026-05-04', '2026-05-08', 1899.00, 'TTD',
   '[{"label":"Caregiver care payment","amount":1400,"category":"caregiver_care"},{"label":"Care subscription (weekly)","amount":499,"category":"subscription"}]'::jsonb,
   'Week 3 — care plan closed Friday May 8, 2026');
