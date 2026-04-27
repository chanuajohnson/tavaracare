-- 1. Add NIS fields to care_team_members
ALTER TABLE public.care_team_members
  ADD COLUMN IF NOT EXISTS nis_number text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS date_employed date,
  ADD COLUMN IF NOT EXISTS is_nis_registered boolean NOT NULL DEFAULT false;

-- 2. Create employer_settings table
CREATE TABLE IF NOT EXISTS public.employer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trade_name text,
  employer_registration_number text,
  service_centre_code text,
  address text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(family_id)
);

ALTER TABLE public.employer_settings ENABLE ROW LEVEL SECURITY;

-- Family users can manage their own employer settings
CREATE POLICY "Families can view own employer settings"
  ON public.employer_settings FOR SELECT
  USING (auth.uid() = family_id);

CREATE POLICY "Families can insert own employer settings"
  ON public.employer_settings FOR INSERT
  WITH CHECK (auth.uid() = family_id);

CREATE POLICY "Families can update own employer settings"
  ON public.employer_settings FOR UPDATE
  USING (auth.uid() = family_id);

-- Admins can manage all employer settings
CREATE POLICY "Admins can manage all employer settings"
  ON public.employer_settings FOR ALL
  USING (public.is_current_user_admin());

-- Auto-update updated_at trigger
CREATE TRIGGER update_employer_settings_updated_at
  BEFORE UPDATE ON public.employer_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tav_updated_at();

-- 3. Add bank transfer columns to payroll_entries
ALTER TABLE public.payroll_entries
  ADD COLUMN IF NOT EXISTS bank_transfer_ref text,
  ADD COLUMN IF NOT EXISTS bank_transfer_date timestamptz,
  ADD COLUMN IF NOT EXISTS bank_transfer_notes text;