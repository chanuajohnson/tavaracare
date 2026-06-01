// supabase/functions/blog-ai-draft/index.ts
// Generates a draft blog post via Lovable AI, grounded in existing posts + active guardrails.
// Returns a structured JSON draft. Does NOT insert into blog_posts — UI does that via useSavePost.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const STYLE_RULES = `
TAVARA WRITING STYLE (non-negotiable):
- Voice: Chanua Johnson, founder & care coordinator in Trinidad & Tobago. Warm, direct, plain-spoken. Talk like a trusted neighbour, not a brochure.
- Audience: families in T&T navigating elder/dementia/post-surgery/live-in care decisions.
- NO em-dashes (—) or en-dashes (–). Use commas, full stops, or restructure. This is a hard rule.
- NO AI-tell words: delve, leverage, holistic, journey, landscape, transformative, navigate, unlock, empower, seamless, robust, ecosystem, paradigm, foster, embark, realm, tapestry, testament, multifaceted, cutting-edge, game-changer.
- NO "It's not just X, it's Y" construction. NO "In today's fast-paced world".
- Use Caribbean cadence sparingly and naturally where it fits. Never caricature.
- Concrete > abstract. Use real T&T scenarios (a nurse cooking pelau, a daughter on shift in San Fernando, a son sending money from Florida).
- Markdown body: H2 (##) for sections, H3 (###) sparingly, **bold** for emphasis, bullet lists for short items. No H1 in the body (title is separate).
- Length: 900-1400 words for the body unless asked otherwise.
- Always end the body with a short closing paragraph that names the next concrete step a family can take.

POSITIONING (always-on):
- Tavara is a CARE COORDINATION AND MANAGEMENT PLATFORM. Never an agency, never a staffing service, never an employer.
- Families engage caregivers directly. Tavara coordinates the arrangement.
- Public copy mentions per-hour care rates (\$40 / \$45 / \$50+) only when relevant. Do NOT publish subscription dollar amounts, home preparation dollar amounts, or live-in upper bounds on public posts.
- Central WhatsApp: 1-868-786-5357. All links to tavara.care.
`;

function buildSystemPrompt(
  guardrails: Array<{ banned_term: string | null; preferred_term: string | null; rule_type: string }>,
  referenceExcerpts: string,
) {
  const wordRules = guardrails
    .filter((g) => g.rule_type === "word" && g.banned_term)
    .map((g) => `  - "${g.banned_term}" → "${g.preferred_term ?? "(rephrase)"}"`)
    .join("\n");

  return `${STYLE_RULES}

LANGUAGE GUARDRAILS (avoid the banned term; use the preferred phrasing instead):
${wordRules}

REFERENCE POSTS (match this voice, section rhythm, and depth — do NOT copy text):
${referenceExcerpts}

OUTPUT: Call the \`emit_blog_post\` tool with the structured fields. Do not output anything else.`;
}

function sanitizeDashes(s: string): string {
  return s.replace(/—/g, ", ").replace(/–/g, ", ");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ---- auth: admin only ----
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      topic,
      angle,
      category,
      audience,
      ctaLabel,
      ctaHref,
      referencePostIds,
      revisionNote,
    } = body as {
      topic?: string;
      angle?: string;
      category?: string;
      audience?: string;
      ctaLabel?: string;
      ctaHref?: string;
      referencePostIds?: string[];
      revisionNote?: string;
    };

    if (!topic || topic.trim().length < 3) {
      return new Response(JSON.stringify({ error: "topic_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- pull guardrails ----
    const { data: rules } = await admin
      .from("language_guardrails")
      .select("banned_term, preferred_term, rule_type, severity")
      .eq("is_active", true);

    // ---- pull reference posts ----
    let refExcerpts = "(no references selected)";
    if (referencePostIds && referencePostIds.length > 0) {
      const { data: refs } = await admin
        .from("blog_posts")
        .select("title, description, body")
        .in("id", referencePostIds)
        .limit(3);
      if (refs && refs.length > 0) {
        refExcerpts = refs
          .map(
            (r: any, i: number) =>
              `--- Reference ${i + 1}: ${r.title} ---\n${r.description}\n\n${(r.body ?? "").slice(0, 2000)}`,
          )
          .join("\n\n");
      }
    } else {
      // auto-pick 2 most recent posts in same category as voice anchors
      const { data: refs } = await admin
        .from("blog_posts")
        .select("title, description, body")
        .eq("status", "published")
        .eq("category", category ?? "Family Care Guides")
        .order("published_at", { ascending: false })
        .limit(2);
      if (refs && refs.length > 0) {
        refExcerpts = refs
          .map(
            (r: any, i: number) =>
              `--- Reference ${i + 1}: ${r.title} ---\n${r.description}\n\n${(r.body ?? "").slice(0, 2000)}`,
          )
          .join("\n\n");
      }
    }

    const systemPrompt = buildSystemPrompt(rules ?? [], refExcerpts);

    const userPrompt = `
Topic: ${topic}

Angle / key points the founder wants covered:
${angle || "(none provided — infer from topic and Tavara's positioning)"}

Target audience: ${audience || "family"}
Category: ${category || "Family Care Guides"}
CTA: ${ctaLabel || "Find Care Now"} → ${ctaHref || "/urgent-families"}
${revisionNote ? `\nRevision note (regeneration): ${revisionNote}` : ""}

Write the post now and call emit_blog_post.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_blog_post",
              description: "Emit the structured blog post draft.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Compelling, plain title under 80 chars." },
                  slug: { type: "string", description: "kebab-case slug, max 80 chars, no trailing dashes." },
                  description: { type: "string", description: "Meta description, 140-180 chars, plain." },
                  category: {
                    type: "string",
                    enum: [
                      "Family Care Guides",
                      "Pricing & Planning",
                      "Emotional Realities",
                      "Caregiver Burnout & Boundaries",
                      "Cultural & Community",
                    ],
                  },
                  readingTime: { type: "string", description: "e.g. '7 min read'." },
                  body: { type: "string", description: "Full markdown body, 900-1400 words. No H1. No em/en-dashes." },
                  faqs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        q: { type: "string" },
                        a: { type: "string" },
                      },
                      required: ["q", "a"],
                      additionalProperties: false,
                    },
                    description: "3 to 5 FAQs relevant to T&T families.",
                  },
                },
                required: ["title", "slug", "description", "category", "readingTime", "body", "faqs"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_blog_post" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, txt);
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a minute." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Lovable AI credits exhausted. Add funds at Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "ai_gateway_error", detail: txt.slice(0, 500) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    if (!argsStr) {
      console.error("no tool call in AI response:", JSON.stringify(aiJson).slice(0, 800));
      return new Response(JSON.stringify({ error: "ai_no_tool_call" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let draft: any;
    try {
      draft = JSON.parse(argsStr);
    } catch (e) {
      return new Response(JSON.stringify({ error: "ai_invalid_json", detail: String(e) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- post-process ----
    draft.title = sanitizeDashes(String(draft.title ?? "")).trim();
    draft.description = sanitizeDashes(String(draft.description ?? "")).trim();
    draft.body = sanitizeDashes(String(draft.body ?? ""));
    draft.faqs = Array.isArray(draft.faqs)
      ? draft.faqs.map((f: any) => ({
          q: sanitizeDashes(String(f.q ?? "")).trim(),
          a: sanitizeDashes(String(f.a ?? "")).trim(),
        }))
      : [];

    // slug: normalize + uniqueness check
    let slug = slugify(draft.slug || draft.title);
    if (!slug) slug = `post-${Date.now().toString(36)}`;
    const { data: existing } = await admin
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
    draft.slug = slug;

    // ---- guardrail scan of the generated body ----
    const haystack = `${draft.title}\n${draft.description}\n${draft.body}`;
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const violations: Array<{ banned_term: string; preferred_term: string | null; count: number; severity: string }> = [];
    for (const r of rules ?? []) {
      if (r.rule_type !== "word" || !r.banned_term) continue;
      const re = new RegExp(`\\b${escapeRegex(r.banned_term)}\\b`, "gi");
      const matches = haystack.match(re);
      if (matches && matches.length > 0) {
        violations.push({
          banned_term: r.banned_term,
          preferred_term: r.preferred_term ?? null,
          count: matches.length,
          severity: r.severity ?? "soft",
        });
      }
    }

    return new Response(
      JSON.stringify({ draft, violations, model: "google/gemini-2.5-pro" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("blog-ai-draft error:", e);
    return new Response(JSON.stringify({ error: "internal_error", detail: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
