// Generates an emotionally intelligent, platform-tuned social caption + suggested
// campaign + content slug for a Tavara blog post. Admin-only (verified in code).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const PLATFORM_GUIDANCE: Record<string, string> = {
  facebook:
    "Longer, reflective, family/community-oriented storytelling. 3-5 short paragraphs. Emotionally relatable. End with a soft invitation to read.",
  instagram:
    "Short emotional resonance. 2-4 lines that work as a carousel hook or quote card. End with: Link in bio.",
  whatsapp:
    "Extremely human and conversational, like forwarding to a family member. 1-2 sentences max. Never corporate. No hashtags.",
  tiktok:
    "Strong emotional hook in the first line (a hard truth or POV). 2-3 lines. End with: Full article in bio.",
  linkedin:
    "Thoughtful, systems-aware framing. Discuss caregiving infrastructure, family coordination psychology, or the emotional complexity of arranging care. Professional but deeply human. 3-4 short paragraphs.",
};

const CAMPAIGNS = [
  "family-readiness",
  "caregiver-awareness",
  "care-coordination",
  "caregiver-burnout",
  "aging-in-place",
  "blog-launch",
];

const SYSTEM_PROMPT = `You are Tavara's emotionally intelligent content strategist.

Tavara is a Care Coordination and Management Platform in Trinidad & Tobago. Families arrange care for loved ones; Tavara coordinates the care team.

ABSOLUTE TONE RULES (non-negotiable):
- Never use em-dashes or en-dashes. Use commas, periods, or parentheses.
- Banned words: delve, leverage, holistic, journey, landscape, transformative, navigate, unlock, empower, seamless, robust, cutting-edge, game-changer, revolutionary.
- Banned phrasing: "It's not just X, it's Y" and any variant.
- NEVER use: hire a caregiver, patient, staff, case, placement, payroll, agency, client, customer, worker, employee.
- USE INSTEAD: arrange care, loved one, care team, household, match, family, caregiver, care coordination platform.
- Tavara is never an agency. Families engage caregivers directly through our coordination platform.
- Do not invent statistics, prices, or guarantees.

VOICE: emotionally intelligent, calm, thoughtful, human, psychologically aware, compassionate, trustworthy. Never salesy, never corporate, never clickbait.

Return ONLY valid JSON matching this exact shape:
{"caption": string, "suggestedCampaign": string, "suggestedContentSlug": string}

suggestedCampaign MUST be one of: ${CAMPAIGNS.join(", ")}.
suggestedContentSlug: lowercase, hyphen-separated, 3-6 words, derived from the post's emotional theme and platform (e.g. "when-help-feels-pressure-fb").`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is an admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { postId, platform } = await req.json();
    if (!postId || !PLATFORM_GUIDANCE[platform]) {
      return new Response(JSON.stringify({ error: "Invalid postId or platform" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: post, error: postErr } = await admin
      .from("blog_posts")
      .select("title, description, category, slug")
      .eq("id", postId)
      .maybeSingle();
    if (postErr || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const userPrompt = `Platform: ${platform}
Platform guidance: ${PLATFORM_GUIDANCE[platform]}

Blog post:
- Title: ${post.title}
- Description: ${post.description ?? ""}
- Category: ${post.category ?? ""}

Generate the JSON now. Do not wrap in markdown code fences.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": lovableKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 500;
      return new Response(
        JSON.stringify({ error: `AI gateway error: ${text}` }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: { caption: string; suggestedCampaign: string; suggestedContentSlug: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(JSON.stringify({ error: "AI returned malformed JSON", raw: content }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize campaign to allowed list
    if (!CAMPAIGNS.includes(parsed.suggestedCampaign)) {
      parsed.suggestedCampaign = "blog-launch";
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[generate-social-caption]", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
