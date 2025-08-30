-- Create a secure function to get family profiles for professional users with active chat sessions
CREATE OR REPLACE FUNCTION public.get_family_profiles_for_professional_chat(professional_user_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.full_name,
    p.avatar_url
  FROM profiles p
  INNER JOIN caregiver_chat_sessions ccs ON ccs.family_user_id = p.id
  WHERE ccs.caregiver_id = professional_user_id::text
  AND p.role = 'family';
END;
$function$;