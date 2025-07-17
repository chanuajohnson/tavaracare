-- Fix infinite recursion by ensuring get_current_user_role() uses SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;