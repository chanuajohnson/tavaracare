
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

      // delete auth user (requires service role)
      const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
      if (delErr) {
        console.error('Delete user error:', delErr);
        throw delErr;
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
