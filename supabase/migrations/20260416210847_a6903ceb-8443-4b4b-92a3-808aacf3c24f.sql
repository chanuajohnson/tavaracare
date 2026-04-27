-- Create quarterly action items table
CREATE TABLE public.quarterly_action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  year INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','blocked')),
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quarterly_action_items ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view all quarterly action items"
ON public.quarterly_action_items FOR SELECT
USING (public.is_current_user_admin());

CREATE POLICY "Admins can insert quarterly action items"
ON public.quarterly_action_items FOR INSERT
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update quarterly action items"
ON public.quarterly_action_items FOR UPDATE
USING (public.is_current_user_admin());

CREATE POLICY "Admins can delete quarterly action items"
ON public.quarterly_action_items FOR DELETE
USING (public.is_current_user_admin());

-- Update timestamp trigger
CREATE TRIGGER trg_quarterly_action_items_updated_at
BEFORE UPDATE ON public.quarterly_action_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster quarter/year lookups
CREATE INDEX idx_quarterly_action_items_quarter_year ON public.quarterly_action_items(year, quarter, sort_order);

-- Seed initial roadmap for current year
INSERT INTO public.quarterly_action_items (quarter, year, category, title, description, target_date, sort_order) VALUES
-- Q1 — Foundation & Compliance
('Q1', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Register all recurring software subscriptions in expense ledger', 'Lovable, Supabase, OpenAI, WhatsApp Business, domain', (date_trunc('year', CURRENT_DATE) + INTERVAL '7 days')::date, 1),
('Q1', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Backfill last 90 days of direct client costs', 'Training stipends, devices, client-attributed expenses', (date_trunc('year', CURRENT_DATE) + INTERVAL '14 days')::date, 2),
('Q1', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'operations', 'Log founder time daily for 30 days', 'Establish baseline hourly cost for true accounting', (date_trunc('year', CURRENT_DATE) + INTERVAL '1 month')::date, 3),
('Q1', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'growth', 'Confirm 5 active paying clients with positive margin', 'Verify each client shows >0% margin in unit economics', (date_trunc('year', CURRENT_DATE) + INTERVAL '2 months')::date, 4),
('Q1', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'revenue', 'Hit TT$50k cumulative gross revenue', '~8% of VAT threshold (TT$600k)', (date_trunc('year', CURRENT_DATE) + INTERVAL '3 months')::date, 5),
('Q1', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Quarterly Business Levy + Green Fund Levy filing', '0.6% + 0.3% of gross revenue, due end of quarter', (date_trunc('year', CURRENT_DATE) + INTERVAL '3 months' - INTERVAL '1 day')::date, 6),

-- Q2 — Growth & Margin Discipline
('Q2', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'growth', 'Achieve 20%+ avg margin across all clients', 'Per-client economics dashboard target', (date_trunc('year', CURRENT_DATE) + INTERVAL '4 months')::date, 1),
('Q2', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'growth', 'Onboard 3 net-new paying clients', 'Net of any churned clients', (date_trunc('year', CURRENT_DATE) + INTERVAL '5 months')::date, 2),
('Q2', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'revenue', 'Hit TT$150k cumulative YTD', '25% of VAT threshold', (date_trunc('year', CURRENT_DATE) + INTERVAL '6 months')::date, 3),
('Q2', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'operations', 'Reduce overhead-to-revenue ratio below 40%', 'Sustainable margin discipline', (date_trunc('year', CURRENT_DATE) + INTERVAL '6 months')::date, 4),
('Q2', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Quarterly Business Levy + Green Fund Levy filing', '0.6% + 0.3% of gross revenue', (date_trunc('year', CURRENT_DATE) + INTERVAL '6 months' - INTERVAL '1 day')::date, 5),

-- Q3 — Scale Prep
('Q3', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'revenue', 'Hit TT$300k cumulative YTD', '50% of VAT threshold', (date_trunc('year', CURRENT_DATE) + INTERVAL '7 months')::date, 1),
('Q3', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Begin VAT registration paperwork', 'Proactive — file before crossing TT$600k', (date_trunc('year', CURRENT_DATE) + INTERVAL '8 months')::date, 2),
('Q3', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'operations', 'Document all SOPs for caregiver-side and family-side ops', 'Audit-ready documentation', (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months')::date, 3),
('Q3', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'growth', 'Average client lifetime ≥ 6 months', 'Churn check', (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months')::date, 4),
('Q3', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Quarterly Business Levy + Green Fund Levy filing', '0.6% + 0.3% of gross revenue', (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months' - INTERVAL '1 day')::date, 5),

-- Q4 — Profit & Compliance Close
('Q4', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Hit TT$600k YTD — VAT registration must be active', 'Mandatory threshold', (date_trunc('year', CURRENT_DATE) + INTERVAL '10 months')::date, 1),
('Q4', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'growth', 'Net profit ≥ 25% of revenue', 'Year-end target', (date_trunc('year', CURRENT_DATE) + INTERVAL '11 months')::date, 2),
('Q4', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Annual Corporation Tax estimate prepared for accountant', '30% of net profit', (date_trunc('year', CURRENT_DATE) + INTERVAL '12 months' - INTERVAL '15 days')::date, 3),
('Q4', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'compliance', 'Year-end audit-ready expense export', 'CSV grouped by BIR category', (date_trunc('year', CURRENT_DATE) + INTERVAL '12 months' - INTERVAL '7 days')::date, 4),
('Q4', EXTRACT(YEAR FROM CURRENT_DATE)::int, 'operations', 'Set next-year quarterly targets', 'Carry forward learnings', (date_trunc('year', CURRENT_DATE) + INTERVAL '12 months' - INTERVAL '1 day')::date, 5);