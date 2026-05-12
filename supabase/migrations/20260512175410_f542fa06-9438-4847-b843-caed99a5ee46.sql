
DROP FUNCTION IF EXISTS public.admin_get_all_profiles_secure();

CREATE OR REPLACE FUNCTION public.admin_get_all_profiles_secure()
 RETURNS TABLE(
   id uuid,
   created_at timestamp with time zone,
   updated_at timestamp with time zone,
   role user_role,
   full_name text,
   avatar_url text,
   phone_number text,
   address text,
   location text,
   professional_type text,
   years_of_experience text,
   care_types text[],
   specialized_care text[],
   available_for_matching boolean,
   email text,
   care_urgency care_urgency,
   account_status text,
   account_status_reason text,
   account_status_changed_at timestamptz
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (auth.jwt() ->> 'user_metadata')::jsonb ? 'role' OR
     (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' != 'admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.created_at, p.updated_at, p.role, p.full_name, p.avatar_url,
    p.phone_number, p.address, p.location, p.professional_type,
    p.years_of_experience, p.care_types, p.specialized_care,
    p.available_for_matching, au.email::text, p.care_urgency,
    p.account_status, p.account_status_reason, p.account_status_changed_at
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  ORDER BY p.created_at DESC;
END;
$function$;
