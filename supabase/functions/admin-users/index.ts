
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
    // 1) bind the caller's auth so we can check role
    const authHeader = req.headers.get("Authorization") ?? "";
    const supa = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });

    // 2) admin client (SERVICE ROLE) for privileged ops
    const admin = createClient(url, service);

    // 3) read body (we standardized on body for invoke)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      /* no body or invalid json */
    }

    const action = (body.action ?? new URL(req.url).searchParams.get("action")) ?? "";
    if (!action) throw new Error("Missing 'action'");

    // 4) verify caller is an admin
    const { data: userData, error: userErr } = await supa.auth.getUser();
    if (userErr || !userData?.user) throw new Error("Unauthenticated");
    
    // Check admin role from user metadata or profiles table
    let isAdmin = false;
    const metadata = userData.user.user_metadata || userData.user.app_metadata;
    if (metadata?.role === 'admin') {
      isAdmin = true;
    } else {
      // Fallback: check profiles table
      const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      isAdmin = profile?.role === 'admin';
    }
    
    if (!isAdmin) throw new Error("Forbidden: admin only");

    // 5) route actions
    if (action === "delete-user") {
      const user_id =
        body.user_id ?? new URL(req.url).searchParams.get("user_id");
      if (!user_id) throw new Error("Missing 'user_id'");

      console.log(`Admin ${userData.user.id} attempting to delete user ${user_id}`);

      try {
        // Execute comprehensive user deletion SQL
        console.log('Executing comprehensive user deletion SQL...');
        
        const deletionSQL = `
          DO $$
          DECLARE
            uid UUID := '${user_id}';
          BEGIN
            -- 🔍 Log records before deletion
            RAISE NOTICE 'Deleting user: %', uid;
            RAISE NOTICE 'Chat messages: %', (SELECT COUNT(*) FROM caregiver_chat_messages WHERE session_id IN (SELECT id FROM caregiver_chat_sessions WHERE family_user_id = uid OR caregiver_id::uuid = uid));
            RAISE NOTICE 'Chat sessions: %', (SELECT COUNT(*) FROM caregiver_chat_sessions WHERE family_user_id = uid OR caregiver_id::uuid = uid);
            RAISE NOTICE 'Notifications: %', (SELECT COUNT(*) FROM caregiver_notifications WHERE caregiver_id::uuid = uid);
            RAISE NOTICE 'Chat requests: %', (SELECT COUNT(*) FROM caregiver_chat_requests WHERE family_user_id = uid OR caregiver_id = uid);
            RAISE NOTICE 'Automatic assignments: %', (SELECT COUNT(*) FROM automatic_assignments WHERE family_user_id = uid OR caregiver_id = uid);
            RAISE NOTICE 'Care team members: %', (SELECT COUNT(*) FROM care_team_members WHERE family_id = uid OR caregiver_id = uid);
            RAISE NOTICE 'Admin communications: %', (SELECT COUNT(*) FROM admin_communications WHERE admin_id = uid OR target_user_id = uid);
            RAISE NOTICE 'Admin match interventions: %', (SELECT COUNT(*) FROM admin_match_interventions WHERE admin_id = uid OR family_user_id = uid OR caregiver_id = uid);
            RAISE NOTICE 'Caregiver assignments: %', (SELECT COUNT(*) FROM caregiver_assignments WHERE family_user_id = uid OR caregiver_id = uid);
            RAISE NOTICE 'Care needs family: %', (SELECT COUNT(*) FROM care_needs_family WHERE profile_id = uid);
            RAISE NOTICE 'Care recipient profiles: %', (SELECT COUNT(*) FROM care_recipient_profiles WHERE user_id = uid);
            RAISE NOTICE 'Visit bookings: %', (SELECT COUNT(*) FROM visit_bookings WHERE user_id = uid);
            RAISE NOTICE 'User journey progress: %', (SELECT COUNT(*) FROM user_journey_progress WHERE user_id = uid);
            RAISE NOTICE 'Chatbot conversations: %', (SELECT COUNT(*) FROM chatbot_conversations WHERE user_id = uid);
            RAISE NOTICE 'Chatbot progress: %', (SELECT COUNT(*) FROM chatbot_progress WHERE user_id = uid);
            RAISE NOTICE 'Chatbot responses: %', (SELECT COUNT(*) FROM chatbot_responses WHERE user_id = uid);
            RAISE NOTICE 'Assistant nudges: %', (SELECT COUNT(*) FROM assistant_nudges WHERE user_id = uid);
            RAISE NOTICE 'WhatsApp auth: %', (SELECT COUNT(*) FROM whatsapp_auth WHERE user_id = uid);
            RAISE NOTICE 'Professional documents: %', (SELECT COUNT(*) FROM professional_documents WHERE user_id = uid);
            RAISE NOTICE 'Payment transactions: %', (SELECT COUNT(*) FROM payment_transactions WHERE user_id = uid);
            RAISE NOTICE 'Profiles: %', (SELECT COUNT(*) FROM profiles WHERE id = uid);

            -- 🗑️ Delete in correct FK-safe order
            
            -- Delete chat messages first (depends on sessions)
            DELETE FROM caregiver_chat_messages WHERE session_id IN (
              SELECT id FROM caregiver_chat_sessions WHERE family_user_id = uid OR caregiver_id::uuid = uid
            );
            RAISE NOTICE 'Deleted chat messages';

            -- Delete chat sessions
            DELETE FROM caregiver_chat_sessions WHERE family_user_id = uid OR caregiver_id::uuid = uid;
            RAISE NOTICE 'Deleted chat sessions';

            -- Delete notifications
            DELETE FROM caregiver_notifications WHERE caregiver_id::uuid = uid;
            RAISE NOTICE 'Deleted notifications';

            -- Delete chat requests
            DELETE FROM caregiver_chat_requests WHERE family_user_id = uid OR caregiver_id = uid;
            RAISE NOTICE 'Deleted chat requests';

            -- Delete assignments and interventions
            DELETE FROM automatic_assignments WHERE family_user_id = uid OR caregiver_id = uid;
            DELETE FROM admin_match_interventions WHERE admin_id = uid OR family_user_id = uid OR caregiver_id = uid;
            DELETE FROM caregiver_assignments WHERE family_user_id = uid OR caregiver_id = uid;
            RAISE NOTICE 'Deleted assignments';

            -- Delete care team relationships
            DELETE FROM care_team_members WHERE family_id = uid OR caregiver_id = uid;
            RAISE NOTICE 'Deleted care team members';

            -- Delete admin communications
            DELETE FROM admin_communications WHERE admin_id = uid OR target_user_id = uid;
            RAISE NOTICE 'Deleted admin communications';

            -- Delete care-related data
            DELETE FROM care_needs_family WHERE profile_id = uid;
            DELETE FROM care_recipient_profiles WHERE user_id = uid;
            RAISE NOTICE 'Deleted care data';

            -- Delete booking and journey data
            DELETE FROM visit_bookings WHERE user_id = uid;
            DELETE FROM user_journey_progress WHERE user_id = uid;
            RAISE NOTICE 'Deleted booking and journey data';

            -- Delete chatbot data
            DELETE FROM chatbot_messages WHERE conversation_id IN (SELECT id FROM chatbot_conversations WHERE user_id = uid);
            DELETE FROM chatbot_conversations WHERE user_id = uid;
            DELETE FROM chatbot_progress WHERE user_id = uid;
            DELETE FROM chatbot_responses WHERE user_id = uid;
            RAISE NOTICE 'Deleted chatbot data';

            -- Delete misc user data
            DELETE FROM assistant_nudges WHERE user_id = uid;
            DELETE FROM whatsapp_auth WHERE user_id = uid;
            DELETE FROM professional_documents WHERE user_id = uid;
            DELETE FROM payment_transactions WHERE user_id = uid;
            RAISE NOTICE 'Deleted misc user data';

            -- Delete profile (main user data)
            DELETE FROM profiles WHERE id = uid;
            RAISE NOTICE 'Deleted profile';

            -- ✅ Finally delete user from Auth
            DELETE FROM auth.users WHERE id = uid;
            RAISE NOTICE 'Deleted from auth.users - User deletion complete';
          END $$;
        `;

        const { error: sqlError } = await admin.rpc('sql', { query: deletionSQL });
        
        if (sqlError) {
          console.error('SQL deletion error:', sqlError);
          throw sqlError;
        }

        console.log(`Successfully deleted user ${user_id} and all related data`);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...cors, "content-type": "application/json" },
        });
      } catch (cleanupError) {
        console.error('Error during user deletion:', cleanupError);
        throw cleanupError;
      }
    }

    if (action === "list-users") {
      const { data: users, error } = await admin.auth.admin.listUsers();
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true, users }), {
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    throw new Error(`Unknown action '${action}'`);
  } catch (err) {
    console.error('Admin users function error:', err);
    // always return JSON + CORS so the client surfaces a readable message
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 400, headers: { ...cors, "content-type": "application/json" } },
    );
  }
});
