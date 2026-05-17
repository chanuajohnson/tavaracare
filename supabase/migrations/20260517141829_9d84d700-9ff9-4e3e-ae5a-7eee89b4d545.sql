
CREATE TABLE public.language_guardrails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL CHECK (rule_type IN ('word','financial_allow','financial_deny','tone')),
  banned_term text,
  preferred_term text,
  body text NOT NULL,
  scope text NOT NULL DEFAULT 'all' CHECK (scope IN ('family_facing','caregiver_facing','internal','all')),
  severity text NOT NULL DEFAULT 'hard' CHECK (severity IN ('hard','soft')),
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 100,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_language_guardrails_type_active ON public.language_guardrails(rule_type, is_active);

ALTER TABLE public.language_guardrails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active guardrails"
ON public.language_guardrails FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert guardrails"
ON public.language_guardrails FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update guardrails"
ON public.language_guardrails FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete guardrails"
ON public.language_guardrails FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_language_guardrails_updated_at
BEFORE UPDATE ON public.language_guardrails
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.language_guardrails_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardrail_id uuid,
  action text NOT NULL CHECK (action IN ('created','updated','archived','restored','deleted')),
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  before jsonb,
  after jsonb
);

CREATE INDEX idx_language_guardrails_audit_guardrail ON public.language_guardrails_audit(guardrail_id, changed_at DESC);

ALTER TABLE public.language_guardrails_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read guardrail audit"
ON public.language_guardrails_audit FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert guardrail audit"
ON public.language_guardrails_audit FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.language_guardrails_audit_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.language_guardrails_audit(guardrail_id, action, changed_by, after)
    VALUES (NEW.id, 'created', NEW.created_by, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.language_guardrails_audit(guardrail_id, action, changed_by, before, after)
    VALUES (
      NEW.id,
      CASE
        WHEN OLD.is_active = true AND NEW.is_active = false THEN 'archived'
        WHEN OLD.is_active = false AND NEW.is_active = true THEN 'restored'
        ELSE 'updated'
      END,
      NEW.updated_by, to_jsonb(OLD), to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.language_guardrails_audit(guardrail_id, action, changed_by, before)
    VALUES (OLD.id, 'deleted', OLD.updated_by, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_language_guardrails_audit
AFTER INSERT OR UPDATE OR DELETE ON public.language_guardrails
FOR EACH ROW EXECUTE FUNCTION public.language_guardrails_audit_fn();

-- Seed word rules (banned → preferred)
INSERT INTO public.language_guardrails (rule_type, banned_term, preferred_term, body, scope, severity, display_order) VALUES
('word','hire a caregiver','arrange care / build a care team','Tavara does not place workers. Families arrange and coordinate care.','family_facing','hard',10),
('word','patient','loved one / person receiving care','Clinical framing erodes the family-centred voice.','all','hard',20),
('word','staff','care team / caregiver','We are not an employer of staff.','all','hard',30),
('word','case','household / family / care arrangement','Families are not cases.','all','hard',40),
('word','placement','match / care arrangement','We coordinate matches, we do not place workers.','all','hard',50),
('word','clean-up','home preparation','Respect for the family''s environment and history.','family_facing','hard',60),
('word','hoarding','overwhelming environments / homes carrying years of accumulation','Avoid stigmatising language.','all','hard',70),
('word','payroll','caregiver payment coordination','Family-facing copy must reflect pass-through coordination, not employer payroll.','family_facing','hard',80),
('word','training oversight','care standards','We set standards, we do not supervise employees.','all','soft',90),
('word','agency','care coordination platform','Tavara is a platform, never an agency.','all','hard',100),
('word','client','family / household','Families are not clients or customers.','family_facing','hard',110),
('word','customer','family / household','Families are not clients or customers.','family_facing','hard',120),
('word','user','family / caregiver','Speak to people, not users.','family_facing','soft',130),
('word','worker','caregiver','Caregivers are professionals, not gig workers.','all','hard',140),
('word','employee','caregiver','Caregivers are engaged directly by families.','all','hard',150),
('word','wage','care rate','On public surfaces the per-hour figure is the care rate, never a wage.','family_facing','hard',160);

-- Seed financial privacy rules
INSERT INTO public.language_guardrails (rule_type, body, scope, severity, display_order) VALUES
('financial_allow','Per-hour care rates: $40 (Standard), $45 (Full Service), $50+ (Premium). Always call these the "care rate", never the "wage".','family_facing','hard',10),
('financial_allow','Subscription tier names: Basic, Active Care, Premium. Names only, never dollar amounts.','family_facing','hard',20),
('financial_allow','Matching & Placement one-time fee: $1,399.','family_facing','hard',30),
('financial_deny','Subscription dollar amounts (weekly or monthly). Shared privately during onboarding only.','family_facing','hard',40),
('financial_deny','Home Preparation dollar amounts. Shared privately during onboarding only.','family_facing','hard',50),
('financial_deny','Day 0 figures, household monthly totals, and lifecycle projections. Internal only.','family_facing','hard',60);

-- Seed tone rules
INSERT INTO public.language_guardrails (rule_type, body, scope, severity, display_order) VALUES
('tone','No em-dashes or en-dashes in editorial copy.','all','hard',10),
('tone','No AI buzzwords: delve, leverage, holistic, journey, landscape, seamless, transformative.','all','hard',20),
('tone','No "It''s not just X, it''s Y" constructions.','all','hard',30),
('tone','Tavara sells continuity and coordination, not caregiver hours. Never sound like Uber-for-caregivers, gig staffing, or corporate healthcare.','all','hard',40),
('tone','Voice is warm, founder-led, and concrete. Use small specifics over abstractions.','all','soft',50);
