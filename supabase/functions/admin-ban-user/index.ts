// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...cors, "content-type": "application/json" },
      });
    }
    const supa = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(url, service);

    const { data: userData, error: userErr } = await supa.auth.getUser();
    if (userErr || !userData?.user) throw new Error("Unauthenticated");

    // Verify caller is admin
    const callerMeta = userData.user.user_metadata || userData.user.app_metadata;
    let isAdmin = callerMeta?.role === 'admin';
    if (!isAdmin) {
      const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single();
      isAdmin = profile?.role === 'admin';
    }
    if (!isAdmin) throw new Error("Forbidden: admin only");

    const body = await req.json().catch(() => ({}));
    const target_user_id: string = body.target_user_id;
    const action: 'ban' | 'unban' = body.action;
    if (!target_user_id || !action) throw new Error("Missing target_user_id or action");

    // ban_duration: 'none' to clear, or a long duration string to ban
    const ban_duration = action === 'ban' ? '876000h' : 'none';

    const { error: updateErr } = await admin.auth.admin.updateUserById(target_user_id, {
      ban_duration,
    } as any);
    if (updateErr) throw updateErr;

    // Force log out of any active sessions when banning
    if (action === 'ban') {
      try {
        await admin.auth.admin.signOut(target_user_id, 'global' as any);
      } catch (e) {
        console.warn('signOut not critical:', e);
      }
    }

    return new Response(JSON.stringify({ ok: true, action, target_user_id }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (err) {
    console.error('admin-ban-user error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 400, headers: { ...cors, "content-type": "application/json" },
    });
  }
});
