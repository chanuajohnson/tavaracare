
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
        // Step 1: Clean up related data that has foreign key constraints
        console.log('Cleaning up related data...');
        
        // Delete caregiver chat sessions (both as caregiver and family user)
        const { error: chatSessionsError } = await admin
          .from('caregiver_chat_sessions')
          .delete()
          .or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`);
        
        if (chatSessionsError) {
          console.error('Error deleting chat sessions:', chatSessionsError);
        } else {
          console.log('Successfully cleaned up chat sessions');
        }

        // Delete caregiver chat messages for sessions involving this user
        const { error: chatMessagesError } = await admin
          .from('caregiver_chat_messages')
          .delete()
          .in('session_id', 
            admin.from('caregiver_chat_sessions')
              .select('id')
              .or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`)
          );
        
        if (chatMessagesError) {
          console.error('Error deleting chat messages:', chatMessagesError);
        } else {
          console.log('Successfully cleaned up chat messages');
        }

        // Delete caregiver notifications
        const { error: notificationsError } = await admin
          .from('caregiver_notifications')
          .delete()
          .eq('caregiver_id', user_id);
        
        if (notificationsError) {
          console.error('Error deleting notifications:', notificationsError);
        } else {
          console.log('Successfully cleaned up notifications');
        }

        // Delete automatic assignments
        const { error: assignmentsError } = await admin
          .from('automatic_assignments')
          .delete()
          .or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`);
        
        if (assignmentsError) {
          console.error('Error deleting automatic assignments:', assignmentsError);
        } else {
          console.log('Successfully cleaned up automatic assignments');
        }

        // Delete care team memberships
        const { error: careTeamError } = await admin
          .from('care_team_members')
          .delete()
          .or(`family_id.eq.${user_id},caregiver_id.eq.${user_id}`);
        
        if (careTeamError) {
          console.error('Error deleting care team members:', careTeamError);
        } else {
          console.log('Successfully cleaned up care team memberships');
        }

        // Delete admin communications
        const { error: communicationsError } = await admin
          .from('admin_communications')
          .delete()
          .or(`admin_id.eq.${user_id},target_user_id.eq.${user_id}`);
        
        if (communicationsError) {
          console.error('Error deleting admin communications:', communicationsError);
        } else {
          console.log('Successfully cleaned up admin communications');
        }

        // Delete user profile (this should cascade to other related tables)
        const { error: profileError } = await admin
          .from('profiles')
          .delete()
          .eq('id', user_id);
        
        if (profileError) {
          console.error('Error deleting profile:', profileError);
        } else {
          console.log('Successfully deleted user profile');
        }

        console.log('All related data cleanup completed');

        // Step 2: Now delete the auth user (requires service role)
        const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
        if (delErr) {
          console.error('Delete user error:', delErr);
          throw delErr;
        }

        console.log(`Successfully deleted user ${user_id}`);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...cors, "content-type": "application/json" },
        });
      } catch (cleanupError) {
        console.error('Error during user deletion cleanup:', cleanupError);
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
