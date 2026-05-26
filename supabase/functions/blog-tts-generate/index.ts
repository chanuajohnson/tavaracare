// Generates and caches an MP3 narration for a blog post via ElevenLabs.
// Now uses the `with-timestamps` endpoint so we can persist per-word timings
// for in-page karaoke-style highlight in the blog reader.
// Public-callable. `force: true` requires admin role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-version, x-client-env, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

// Convert ElevenLabs character-level alignment into word-level timings.
// alignment: { characters: string[], character_start_times_seconds: number[], character_end_times_seconds: number[] }
function deriveWordTimings(alignment: any): Array<{ word: string; start: number; end: number }> {
  if (!alignment?.characters?.length) return [];
  const chars: string[] = alignment.characters;
  const starts: number[] = alignment.character_start_times_seconds;
  const ends: number[] = alignment.character_end_times_seconds;

  const words: Array<{ word: string; start: number; end: number }> = [];
  let buf = "";
  let wordStart = 0;
  let wordEnd = 0;

  const flush = () => {
    if (buf.length > 0) {
      words.push({ word: buf, start: wordStart, end: wordEnd });
      buf = "";
    }
  };

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (/\s/.test(c)) {
      flush();
      continue;
    }
    if (buf.length === 0) wordStart = starts[i] ?? wordEnd;
    buf += c;
    wordEnd = ends[i] ?? wordEnd;
  }
  flush();
  return words;
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

    const intro = `${post.title}. ${post.description}. `;
    const plain = stripMarkdown(post.body || "");
    const fullText = (intro + plain).slice(0, MAX_CHARS);

    // Use with-timestamps endpoint to get per-character alignment for karaoke highlight.
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/with-timestamps?output_format=mp3_44100_128`,
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
      console.error(`[blog-tts] ElevenLabs ${ttsRes.status} for post ${post.id}: ${errTxt}`);
      const isBlocked =
        ttsRes.status === 401 ||
        ttsRes.status === 403 ||
        ttsRes.status === 429 ||
        /unusual_activity|quota|free tier|detected_unusual/i.test(errTxt);
      if (isBlocked) {
        try {
          const probe = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
            headers: { "xi-api-key": apiKey },
          });
          const probeJson = await probe.json().catch(() => ({}));
          console.error(`[blog-tts] EL subscription probe:`, JSON.stringify(probeJson));
        } catch (_) { /* ignore */ }

        const reason = /unusual_activity|detected_unusual/i.test(errTxt)
          ? "unusual_activity_lock"
          : /quota|free tier/i.test(errTxt) || ttsRes.status === 429
            ? "quota_exceeded"
            : "tts_provider_blocked";

        return new Response(
          JSON.stringify({
            provider_unavailable: true,
            reason,
            provider_status: ttsRes.status,
            fallback_text: fullText,
            post_id: post.id,
            voice_id,
            duration_seconds: Math.round(fullText.length / CHARS_PER_SECOND),
            char_count: fullText.length,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
        );
      }
      throw new Error(`ElevenLabs ${ttsRes.status}: ${errTxt}`);
    }

    // with-timestamps returns JSON: { audio_base64, alignment, normalized_alignment }
    const payload = await ttsRes.json();
    const audioB64: string = payload.audio_base64;
    if (!audioB64) throw new Error("ElevenLabs response missing audio_base64");
    const audioBytes = base64Decode(audioB64);

    const wordTimings = deriveWordTimings(payload.normalized_alignment ?? payload.alignment);
    const lastWordEnd = wordTimings.length > 0 ? wordTimings[wordTimings.length - 1].end : 0;

    const path = `${post.id}/${voice_id}.mp3`;
    const { error: upErr } = await admin.storage
      .from("blog-audio")
      .upload(path, audioBytes, { contentType: "audio/mpeg", upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = admin.storage.from("blog-audio").getPublicUrl(path);
    const audioUrl = `${pub.publicUrl}?v=${Date.now()}`;
    const durationEstimate = lastWordEnd > 0
      ? Math.ceil(lastWordEnd)
      : Math.round(fullText.length / CHARS_PER_SECOND);

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
          word_timings: wordTimings,
          narration_text: fullText,
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
