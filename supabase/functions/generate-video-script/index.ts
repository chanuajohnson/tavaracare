import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const BANNED_PHRASES: Array<[RegExp, string]> = [
  [/\bhire (a )?caregivers?\b/gi, "arrange care"],
  [/\bhiring\b/gi, "arranging care"],
  [/\bpatients?\b/gi, "loved one"],
  [/\bstaff\b/gi, "care team"],
  [/\bworkers?\b/gi, "caregivers"],
  [/\bemployees?\b/gi, "caregivers"],
  [/\bclients?\b/gi, "families"],
  [/\bcustomers?\b/gi, "families"],
  [/\bagency\b/gi, "care coordination platform"],
  [/\bplacement\b/gi, "match"],
  [/\bcase\b/gi, "household"],
  [/\bpayroll\b/gi, "caregiver payment coordination"],
  [/\bclean[- ]?up\b/gi, "home preparation"],
  // editorial style
  [/—/g, "."],
  [/–/g, "."],
  [/\bdelve\b/gi, "look at"],
  [/\bleverage\b/gi, "use"],
  [/\bholistic\b/gi, "complete"],
  [/\bjourney\b/gi, "path"],
  [/\blandscape\b/gi, "world"],
  [/\btransformative\b/gi, "real"],
  [/\bIt's not just .*?, it's\b/gi, "It is"],
];

function applyGuardrails(text: string): string {
  let out = text;
  for (const [pattern, replacement] of BANNED_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out.trim();
}

function applyGuardrailsToScenes(scenes: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(scenes)) {
    if (typeof v === "string") {
      cleaned[k] = applyGuardrails(v);
    } else if (Array.isArray(v)) {
      cleaned[k] = v.map((item) => (typeof item === "string" ? applyGuardrails(item) : item));
    } else if (v && typeof v === "object") {
      cleaned[k] = applyGuardrailsToScenes(v as Record<string, unknown>);
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const topic: string = (body.topic ?? "").toString().slice(0, 500);
    const templateSlug: string = (body.templateSlug ?? "village-8s").toString();
    if (!topic) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull template + brand snippets for grounding
    const { data: template } = await supabase
      .from("video_templates")
      .select("slug, name, duration_seconds, scene_schema")
      .eq("slug", templateSlug)
      .maybeSingle();

    const { data: snippets } = await supabase
      .from("video_brand_snippets")
      .select("category, text")
      .eq("is_active", true);

    const snippetBlock = (snippets ?? [])
      .map((s) => `- [${s.category}] ${s.text}`)
      .join("\n");

    const sceneSchema = template?.scene_schema ?? {};

    const systemPrompt = `You write short TikTok scripts for Tavara, a Trinidadian care coordination platform.

BRAND POSITIONING (non-negotiable):
- Tavara is a care coordination platform. Never call it an agency, gig staffing, staffing firm, or service.
- Families arrange care; they do NOT "hire" caregivers.
- Use: "loved one", "care team", "caregiver", "family", "household", "match", "home preparation".
- NEVER use: "hire", "patient", "staff", "agency", "client", "customer", "worker", "employee", "case", "placement", "payroll".
- No em-dashes. No en-dashes. Use periods.
- No buzzwords: delve, leverage, holistic, journey, landscape, transformative.
- Never use the construction "It's not just X, it's Y".
- Free-tier accurate: do NOT mention daily logs, phone hotlines, 24/7 numbers, specific dollar amounts.
- Tone: warm, calm, plainspoken, founder-voice. Sentences are short.

OUTPUT FORMAT:
Return ONLY valid JSON, no prose, no markdown fences. Shape:
{
  "title": "string, max 6 words",
  "scenes": {
    "scene1": "string, max 8 words, two short lines split by \\n",
    "scene2": "string, max 8 words, two short lines split by \\n",
    "scene3": { "eyebrow": "max 3 words", "word": "1-2 words" },
    "scene4": ["max 4 lines", "each max 6 words"],
    "scene5": { "tagline": "max 6 words", "footer": "max 10 words" }
  }
}

ON-BRAND SNIPPETS YOU MAY DRAW FROM:
${snippetBlock}

TEMPLATE STRUCTURE:
${JSON.stringify(sceneSchema, null, 2)}`;

    const userPrompt = `Topic / angle: ${topic}

Write a fresh 5-scene script. Keep every line under the word limits. Output JSON only.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 500;
      return new Response(
        JSON.stringify({ error: "AI generation failed", details: errText }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const content: string = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(JSON.stringify({ error: "AI returned invalid JSON", raw: content }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Apply guardrail filter on every string in the response
    const safe = applyGuardrailsToScenes(parsed);
    if (typeof safe.title === "string") safe.title = applyGuardrails(safe.title);

    return new Response(JSON.stringify({ result: safe }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-video-script error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
