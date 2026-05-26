import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-upload-token, x-script-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const expected = Deno.env.get("VIDEO_RENDER_UPLOAD_TOKEN");
    const provided = req.headers.get("x-upload-token");
    if (!expected || !provided || provided !== expected) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scriptId = req.headers.get("x-script-id");
    if (!scriptId) {
      return new Response(JSON.stringify({ error: "missing x-script-id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = new Uint8Array(await req.arrayBuffer());
    if (bytes.length === 0) {
      return new Response(JSON.stringify({ error: "empty body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, serviceKey);

    const path = `village/${scriptId}.mp4`;
    const { error: upErr } = await supabase.storage
      .from("video-renders")
      .upload(path, bytes, {
        contentType: "video/mp4",
        upsert: true,
      });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage
      .from("video-renders")
      .getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { error: dbErr } = await supabase
      .from("video_scripts")
      .update({ render_status: "ready", rendered_url: publicUrl })
      .eq("id", scriptId);
    if (dbErr) throw dbErr;

    return new Response(
      JSON.stringify({ ok: true, url: publicUrl, path }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String((e as Error).message ?? e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
