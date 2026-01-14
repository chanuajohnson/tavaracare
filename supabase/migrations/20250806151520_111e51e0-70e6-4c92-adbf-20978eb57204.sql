-- Add RLS policy allowing admins to update available_for_matching field
CREATE POLICY "Admins can update user availability for matching" 
ON public.profiles 
FOR UPDATE 
USING (COALESCE((((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text), 'family'::text) = 'admin'::text)
WITH CHECK (COALESCE((((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text), 'family'::text) = 'admin'::text);