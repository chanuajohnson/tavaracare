
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, x-client-env, x-app-version, apikey, content-type",
};

const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supa = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(url, service);

    let body: any = {};
    try { body = await req.json(); } catch { /* no body */ }

    const action = (body.action ?? new URL(req.url).searchParams.get("action")) ?? "";
    if (!action) throw new Error("Missing 'action'");

    const { data: userData, error: userErr } = await supa.auth.getUser();
    if (userErr || !userData?.user) throw new Error("Unauthenticated");

    let isAdmin = false;
    const metadata = userData.user.user_metadata || userData.user.app_metadata;
    if (metadata?.role === 'admin') {
      isAdmin = true;
    } else {
      const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      isAdmin = profile?.role === 'admin';
    }
    if (!isAdmin) throw new Error("Forbidden: admin only");

    if (action === "delete-user") {
      const user_id = body.user_id ?? new URL(req.url).searchParams.get("user_id");
      if (!user_id) throw new Error("Missing 'user_id'");

      console.log(`Admin ${userData.user.id} deleting user ${user_id}`);

      // Helper: delete and log errors without blocking
      const del = async (table: string, filter: () => any) => {
        try {
          const { error } = await filter();
          if (error) console.warn(`Warning deleting from ${table}:`, error.message);
          else console.log(`Deleted from ${table}`);
        } catch (e: any) {
          console.warn(`Exception deleting from ${table}:`, e.message);
        }
      };

      // 1. Chat messages (via session IDs)
      const { data: cgSessions } = await admin.from('caregiver_chat_sessions')
        .select('id')
        .or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`);
      const cgSessionIds = (cgSessions || []).map((s: any) => s.id);
      if (cgSessionIds.length > 0) {
        await del('caregiver_chat_messages', () =>
          admin.from('caregiver_chat_messages').delete().in('session_id', cgSessionIds));
      }

      // 2. Chat sessions
      await del('caregiver_chat_sessions', () =>
        admin.from('caregiver_chat_sessions').delete().or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`));

      // 3. Notifications
      await del('caregiver_notifications', () =>
        admin.from('caregiver_notifications').delete().eq('caregiver_id', user_id));

      // 4. Chat requests
      await del('caregiver_chat_requests', () =>
        admin.from('caregiver_chat_requests').delete().or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`));

      // 5. Assignments
      await del('automatic_assignments', () =>
        admin.from('automatic_assignments').delete().or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`));
      await del('admin_match_interventions', () =>
        admin.from('admin_match_interventions').delete().or(`admin_id.eq.${user_id},family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`));
      await del('caregiver_assignments', () =>
        admin.from('caregiver_assignments').delete().or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`));

      // 6. Care team
      await del('care_team_members', () =>
        admin.from('care_team_members').delete().or(`family_id.eq.${user_id},caregiver_id.eq.${user_id}`));

      // 7. Admin communications
      await del('admin_communications', () =>
        admin.from('admin_communications').delete().or(`admin_id.eq.${user_id},target_user_id.eq.${user_id}`));

      // 8. Care data
      await del('care_needs_family', () =>
        admin.from('care_needs_family').delete().eq('profile_id', user_id));
      await del('care_recipient_profiles', () =>
        admin.from('care_recipient_profiles').delete().eq('user_id', user_id));

      // 9. Bookings & journey
      await del('visit_bookings', () =>
        admin.from('visit_bookings').delete().eq('user_id', user_id));
      await del('user_journey_progress', () =>
        admin.from('user_journey_progress').delete().eq('user_id', user_id));

      // 10. Chatbot data
      const { data: convos } = await admin.from('chatbot_conversations')
        .select('id').eq('user_id', user_id);
      const convoIds = (convos || []).map((c: any) => c.id);
      if (convoIds.length > 0) {
        await del('chatbot_messages', () =>
          admin.from('chatbot_messages').delete().in('conversation_id', convoIds));
      }
      await del('chatbot_conversations', () =>
        admin.from('chatbot_conversations').delete().eq('user_id', user_id));
      await del('chatbot_progress', () =>
        admin.from('chatbot_progress').delete().eq('user_id', user_id));
      await del('chatbot_responses', () =>
        admin.from('chatbot_responses').delete().eq('user_id', user_id));

      // 11. Misc
      await del('assistant_nudges', () =>
        admin.from('assistant_nudges').delete().eq('user_id', user_id));
      await del('whatsapp_auth', () =>
        admin.from('whatsapp_auth').delete().eq('user_id', user_id));
      await del('professional_documents', () =>
        admin.from('professional_documents').delete().eq('user_id', user_id));
      await del('payment_transactions', () =>
        admin.from('payment_transactions').delete().eq('user_id', user_id));

      // 12. Profile
      await del('profiles', () =>
        admin.from('profiles').delete().eq('id', user_id));

      // 13. Auth user
      const { error: authDeleteError } = await admin.auth.admin.deleteUser(user_id);
      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError);
        throw authDeleteError;
      }

      console.log(`Successfully deleted user ${user_id}`);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    if (action === "list-users") {
      const { data: users, error } = await admin.auth.admin.listUsers();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, users }), {
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    if (action === "auth-history") {
      const user_id = body.user_id ?? new URL(req.url).searchParams.get("user_id");
      if (!user_id) throw new Error("Missing 'user_id'");

      const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(user_id);
      if (authUserError) throw authUserError;

      const { data: auditRows, error: auditError } = await admin
        .schema('auth')
        .from('audit_log_entries')
        .select('id, payload, created_at, ip_address')
        .ilike('payload', `%${user_id}%`)
        .order('created_at', { ascending: false })
        .limit(200);
      if (auditError) throw auditError;

      const events = (auditRows || [])
        .map((row: any) => {
          const payload = row.payload || {};
          const eventType = payload.action || 'auth_event';
          if (!['login', 'logout', 'token_refreshed', 'token_revoked', 'user_signedup'].includes(eventType)) {
            return null;
          }

          return {
            id: String(row.id),
            event_type: eventType,
            occurred_at: row.created_at,
            ip_address: row.ip_address || null,
            actor_email: payload.actor_username || payload.traits?.user_email || authUser.user?.email || null,
            provider: payload.traits?.provider || null,
            auth_last_sign_in_at: authUser.user?.last_sign_in_at || null,
            auth_created_at: authUser.user?.created_at || null,
          };
        })
        .filter(Boolean);

      if (authUser.user?.last_sign_in_at) {
        events.unshift({
          id: `auth-last-sign-in-${authUser.user.id}`,
          event_type: 'current_last_sign_in',
          occurred_at: authUser.user.last_sign_in_at,
          ip_address: null,
          actor_email: authUser.user.email || null,
          provider: null,
          auth_last_sign_in_at: authUser.user.last_sign_in_at,
          auth_created_at: authUser.user.created_at || null,
        });
      }

      events.sort((a: any, b: any) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

      return new Response(JSON.stringify({ ok: true, events }), {
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    throw new Error(`Unknown action '${action}'`);
  } catch (err) {
    console.error('Admin users function error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 400, headers: { ...cors, "content-type": "application/json" } },
    );
  }
});
