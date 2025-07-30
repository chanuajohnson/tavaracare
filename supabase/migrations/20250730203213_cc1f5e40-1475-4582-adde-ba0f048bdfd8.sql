-- Fix infinite recursion in RLS policies by updating get_current_user_role function
-- to only use auth.jwt() metadata and never query profiles table

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Only use auth.jwt() metadata to avoid infinite recursion
  -- Never query the profiles table from this function
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'  -- Default role if no metadata found
  );
END;
$$;