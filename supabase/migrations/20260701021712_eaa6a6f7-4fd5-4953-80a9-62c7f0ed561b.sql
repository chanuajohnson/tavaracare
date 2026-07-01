CREATE OR REPLACE FUNCTION public.admin_get_user_auth_history(target_user_id uuid)
RETURNS TABLE (
  id text,
  event_type text,
  occurred_at timestamptz,
  ip_address text,
  actor_email text,
  provider text,
  auth_last_sign_in_at timestamptz,
  auth_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  WITH selected_user AS (
    SELECT u.id, u.email, u.last_sign_in_at, u.created_at
    FROM auth.users u
    WHERE u.id = target_user_id
  ), audit_entries AS (
    SELECT
      e.id::text AS id,
      COALESCE(e.payload ->> 'action', 'auth_event') AS event_type,
      e.created_at AS occurred_at,
      NULLIF(e.ip_address::text, '') AS ip_address,
      COALESCE(e.payload ->> 'actor_username', selected_user.email) AS actor_email,
      e.payload #>> '{traits,provider}' AS provider,
      selected_user.last_sign_in_at AS auth_last_sign_in_at,
      selected_user.created_at AS auth_created_at
    FROM auth.audit_log_entries e
    CROSS JOIN selected_user
    WHERE e.payload::text ILIKE '%' || target_user_id::text || '%'
      AND COALESCE(e.payload ->> 'action', '') IN (
        'login',
        'logout',
        'token_refreshed',
        'token_revoked',
        'user_signedup'
      )
  ), current_last_sign_in AS (
    SELECT
      ('auth-last-sign-in-' || selected_user.id::text) AS id,
      'current_last_sign_in' AS event_type,
      selected_user.last_sign_in_at AS occurred_at,
      NULL::text AS ip_address,
      selected_user.email AS actor_email,
      NULL::text AS provider,
      selected_user.last_sign_in_at AS auth_last_sign_in_at,
      selected_user.created_at AS auth_created_at
    FROM selected_user
    WHERE selected_user.last_sign_in_at IS NOT NULL
  )
  SELECT * FROM audit_entries
  UNION ALL
  SELECT * FROM current_last_sign_in
  ORDER BY occurred_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_user_auth_history(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_user_auth_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_auth_history(uuid) TO service_role;