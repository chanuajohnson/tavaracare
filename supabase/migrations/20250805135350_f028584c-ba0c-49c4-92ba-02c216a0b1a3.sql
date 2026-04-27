-- Create the sync function to update JWT metadata
CREATE OR REPLACE FUNCTION public.sync_admin_role_to_jwt()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_users RECORD;
  updated_count INTEGER := 0;
BEGIN
  -- Loop through all admin users and update their JWT metadata
  FOR admin_users IN 
    SELECT id, full_name 
    FROM profiles 
    WHERE role = 'admin'
  LOOP
    -- Update the user's metadata to include role: admin
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
    WHERE id = admin_users.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN format('Updated JWT metadata for %s admin users', updated_count);
END;
$function$;