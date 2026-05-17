// Generates and caches an MP3 narration for a blog post via ElevenLabs.
// Public-callable. `force: true` requires admin role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_VOICE = "EXAVITQu4vr4xnSDxMaL"; // Sarah
const MODEL = "eleven_turbo_v2_5";
const MAX_CHARS = 4500;
const CHARS_PER_SECOND = 14;

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\[!LEARNED\]/g, "")
    .replace(/\[!OBSERVATION\]/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/^\s*-{3,}\s*$/gm, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const { slug, post_id, force = false, voice_id = DEFAULT_VOICE } = body ?? {};

    if (!slug && !post_id) {
      return new Response(JSON.stringify({ error: "slug or post_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If forcing regeneration, require admin
    if (force) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Auth required for force" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (!userData.user) {
        return new Response(JSON.stringify({ error: "Invalid auth" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isAdmin } = await admin.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Load post
    const postQuery = admin.from("blog_posts").select("id,title,description,body,status,published_at");
    const { data: post, error: postErr } = post_id
      ? await postQuery.eq("id", post_id).maybeSingle()
      : await postQuery.eq("slug", slug).maybeSingle();

    if (postErr) throw postErr;
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache
    if (!force) {
      const { data: existing } = await admin
        .from("blog_audio")
        .select("*")
        .eq("post_id", post.id)
        .eq("voice_id", voice_id)
        .maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ ...existing, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Build narration text
    const intro = `${post.title}. ${post.description}. `;
    const plain = stripMarkdown(post.body || "");
    const fullText = (intro + plain).slice(0, MAX_CHARS);

    // Call ElevenLabs
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: fullText,
          model_id: MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
        }),
      },
    );

    if (!ttsRes.ok) {
      const errTxt = await ttsRes.text();
      throw new Error(`ElevenLabs ${ttsRes.status}: ${errTxt}`);
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    // Upload to storage
    const path = `${post.id}/${voice_id}.mp3`;
    const { error: upErr } = await admin.storage
      .from("blog-audio")
      .upload(path, audioBytes, { contentType: "audio/mpeg", upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = admin.storage.from("blog-audio").getPublicUrl(path);
    const audioUrl = `${pub.publicUrl}?v=${Date.now()}`;
    const durationEstimate = Math.round(fullText.length / CHARS_PER_SECOND);

    // Upsert row
    const { data: row, error: rowErr } = await admin
      .from("blog_audio")
      .upsert(
        {
          post_id: post.id,
          voice_id,
          audio_url: audioUrl,
          duration_seconds: durationEstimate,
          char_count: fullText.length,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "post_id,voice_id" },
      )
      .select()
      .single();
    if (rowErr) throw rowErr;

    return new Response(JSON.stringify({ ...row, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blog-tts-generate error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
