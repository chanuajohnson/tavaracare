import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-render-token, x-script-id, x-slug",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = req.headers.get("x-render-token");
    const expected = Deno.env.get("RENDER_UPLOAD_TOKEN");
    if (!expected || token !== expected) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scriptId = req.headers.get("x-script-id");
    const slug = (req.headers.get("x-slug") || "tavara-video")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "tavara-video";
    if (!scriptId) {
      return new Response(JSON.stringify({ error: "missing x-script-id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = new Uint8Array(await req.arrayBuffer());
    if (!bytes.byteLength) {
      return new Response(JSON.stringify({ error: "empty body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const objectPath = `${scriptId}/${slug}.mp4`;
    const { error: upErr } = await supabase.storage
      .from("video-renders")
      .upload(objectPath, bytes, {
        contentType: "video/mp4",
        upsert: true,
        cacheControl: "3600",
      });
    if (upErr) {
      return new Response(JSON.stringify({ error: `upload: ${upErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = supabase.storage
      .from("video-renders")
      .getPublicUrl(objectPath);
    const publicUrl = pub.publicUrl;

    const { error: updErr } = await supabase
      .from("video_scripts")
      .update({ rendered_url: publicUrl, render_status: "ready" })
      .eq("id", scriptId);
    if (updErr) {
      return new Response(JSON.stringify({ error: `db: ${updErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, rendered_url: publicUrl }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("upload-video-render error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
