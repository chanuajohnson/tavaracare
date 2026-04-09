
-- Delete the older duplicate log
DELETE FROM public.daily_care_logs WHERE id = '217b03cc-8e96-4514-9e77-952b5c8c654d';

-- Add unique constraint to prevent duplicate logs per professional per care plan per day
ALTER TABLE public.daily_care_logs
ADD CONSTRAINT unique_professional_care_plan_shift_date
UNIQUE (professional_id, care_plan_id, shift_date);

-- Add DELETE RLS policy so professionals can delete their own logs
CREATE POLICY "Professionals can delete their own logs"
ON public.daily_care_logs
FOR DELETE
USING (auth.uid() = professional_id);
