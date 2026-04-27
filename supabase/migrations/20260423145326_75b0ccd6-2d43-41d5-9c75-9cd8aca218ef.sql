ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS client_stage smallint NULL CHECK (client_stage IS NULL OR (client_stage BETWEEN 1 AND 4)),
ADD COLUMN IF NOT EXISTS client_stage_assessed_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS client_stage_quiz_responses jsonb NULL;

COMMENT ON COLUMN public.profiles.client_stage IS 'Family readiness stage 1-4: 1=Entry/Overwhelm, 2=Settling/Trust Forming, 3=Readiness/Openness, 4=Dependence/Optimization. Drives stage-aware UI gating.';
COMMENT ON COLUMN public.profiles.client_stage_assessed_at IS 'Timestamp of most recent readiness quiz completion';
COMMENT ON COLUMN public.profiles.client_stage_quiz_responses IS 'Raw quiz answers as JSON e.g. {"q1":1,"q2":2,"q3":3,"q4":2,"q5":3,"q6":2}';