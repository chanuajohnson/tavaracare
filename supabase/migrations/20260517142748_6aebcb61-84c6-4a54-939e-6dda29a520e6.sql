
-- Part A: publish the Inside Tavara Onboarding article now
UPDATE public.blog_posts
SET published_at = now()
WHERE slug = 'inside-tavara-onboarding-step-by-step'
  AND status = 'published'
  AND published_at > now();

-- Part B1: seed new guardrail rules learned from review feedback
INSERT INTO public.language_guardrails
  (rule_type, banned_term, preferred_term, scope, severity, display_order, is_active, body)
VALUES
  ('word','placement fee','onboarding coordination','all','hard',200,true,'Avoid staffing-agency framing. Onboarding coordination reflects what the fee actually covers.'),
  ('word','matching and placement fee','care setup coordination','all','hard',201,true,'Replace transactional staffing language with coordination framing.'),
  ('word','placement','onboarding coordination','all','soft',202,true,'Reserve "placement" for legacy contexts. Prefer onboarding/coordination wording.'),
  ('word','dispatch','coordinate','all','soft',203,true,'Avoid gig-platform vocabulary. Tavara coordinates, never dispatches.'),
  ('word','match result','match outcome','all','soft',204,true,'"Result" sounds transactional. Use "outcome" for relational tone.'),
  ('word','paid directly to caregiver','coordinated through Tavara','all','hard',205,true,'Families pay Tavara; Tavara coordinates caregiver payment. Never imply direct payment.'),
  ('word','paid directly to the caregiver','coordinated through Tavara','all','hard',206,true,'Families pay Tavara; Tavara coordinates caregiver payment.'),
  ('word','family arranges directly','Tavara coordinates the arrangement','all','hard',207,true,'Tavara coordinates the arrangement between families and caregivers.'),
  ('word','family arranges care directly','Tavara coordinates the arrangement','all','hard',208,true,'Tavara coordinates the arrangement between families and caregivers.'),
  ('word','direct arrangement','care coordination arrangement','all','hard',209,true,'Tavara coordinates the arrangement; avoid "direct arrangement" framing.'),
  ('word','baseline agreement','care coordination agreement','all','soft',210,true,'"Baseline agreement" is vague. Use care coordination agreement for clarity.'),
  ('tone','drift back into chaos',null,'all','soft',211,true,'Strong phrase; reserve for cornerstone/onboarding philosophy pieces only. Alternatives: fragmented coordination, reactive care, household strain, operational overwhelm, unstable routines. Warn if used more than once in a single post.'),
  ('word','8 hour shift','eight-hour shift','all','soft',212,true,'Editorial style: spell out shift durations.'),
  ('word','8-hour shift','eight-hour shift','all','soft',213,true,'Editorial style: spell out shift durations.');

-- Part B3: breach log table for nightly rescans
CREATE TABLE IF NOT EXISTS public.guardrail_breach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.language_guardrails(id) ON DELETE SET NULL,
  rule_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  banned_term TEXT,
  preferred_term TEXT,
  excerpt TEXT NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_breach_log_post ON public.guardrail_breach_log(post_id, resolved);
CREATE INDEX IF NOT EXISTS idx_breach_log_scanned ON public.guardrail_breach_log(scanned_at DESC);

ALTER TABLE public.guardrail_breach_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read breach log"
  ON public.guardrail_breach_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can write breach log"
  ON public.guardrail_breach_log FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role inserts during cron scans bypass RLS automatically.

-- Proposal tracking table for "Learn from feedback" tab
CREATE TABLE IF NOT EXISTS public.guardrail_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_feedback TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  banned_term TEXT,
  preferred_term TEXT,
  body TEXT,
  scope TEXT NOT NULL DEFAULT 'all',
  severity TEXT NOT NULL DEFAULT 'soft',
  rationale TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_rule_id UUID REFERENCES public.language_guardrails(id) ON DELETE SET NULL,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guardrail_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage proposals"
  ON public.guardrail_proposals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
