// supabase/functions/guardrails-extract-rules/index.ts
// Takes pasted reviewer feedback + current rule set, returns AI-extracted candidate rules.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // admin check
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { feedback } = await req.json();
    if (typeof feedback !== 'string' || feedback.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: 'Feedback text must be at least 20 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Load existing active rules so AI does not propose duplicates
    const { data: existing } = await admin
      .from('language_guardrails')
      .select('rule_type, banned_term, preferred_term')
      .eq('is_active', true);

    const existingList = (existing ?? [])
      .map((r) => `- [${r.rule_type}] ${r.banned_term ?? ''} → ${r.preferred_term ?? ''}`)
      .join('\n');

    const systemPrompt = `You are the Tavara editorial guardrails extractor.

Tavara is a Care Coordination and Management Platform. NEVER an agency, staffing company, or gig platform.
Reviewer feedback below contains editorial corrections. Extract every concrete language rule the reviewer is implying so it can be enforced automatically going forward.

Output STRICT JSON only:
{
  "rules": [
    {
      "rule_type": "word" | "tone" | "financial_deny" | "financial_allow",
      "banned_term": string | null,
      "preferred_term": string | null,
      "body": string,
      "scope": "all" | "family_facing" | "caregiver_facing" | "internal",
      "severity": "hard" | "soft",
      "rationale": string
    }
  ]
}

Rules:
- "word" rules MUST have both banned_term and preferred_term.
- "tone" rules have banned_term (phrase to detect) and may have null preferred_term; explain in body.
- "financial_deny" rules name a figure or phrase that must NOT appear publicly.
- severity "hard" = absolute block; "soft" = warn but allow.
- Do NOT propose rules that duplicate an existing rule (case-insensitive banned_term match).
- Keep banned_term short and matchable as a phrase, not a sentence.
- If no new rule can be extracted, return {"rules": []}.

Existing active rules (do not duplicate):
${existingList || '(none)'}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: feedback },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: 'AI rate limited. Try again shortly.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (aiRes.status === 402) {
      return new Response(
        JSON.stringify({ error: 'AI credits exhausted. Add credits in Lovable.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI error: ${txt.slice(0, 300)}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '{"rules":[]}';
    let parsed: { rules: any[] } = { rules: [] };
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { rules: [] };
    }

    const existingTerms = new Set(
      (existing ?? [])
        .map((r) => (r.banned_term ?? '').trim().toLowerCase())
        .filter(Boolean),
    );

    const candidates = (parsed.rules ?? [])
      .filter((r) => r && r.rule_type && r.body)
      .filter((r) => {
        const t = (r.banned_term ?? '').trim().toLowerCase();
        return !t || !existingTerms.has(t);
      })
      .slice(0, 20);

    // Persist as pending proposals
    const inserts = candidates.map((r) => ({
      source_feedback: feedback,
      rule_type: r.rule_type,
      banned_term: r.banned_term ?? null,
      preferred_term: r.preferred_term ?? null,
      body: r.body,
      scope: r.scope ?? 'all',
      severity: r.severity ?? 'soft',
      rationale: r.rationale ?? null,
      status: 'pending',
      created_by: user.id,
    }));

    let saved: any[] = [];
    if (inserts.length > 0) {
      const { data, error } = await admin
        .from('guardrail_proposals')
        .insert(inserts)
        .select();
      if (error) {
        return new Response(JSON.stringify({ error: `Failed to save proposals: ${error.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      saved = data ?? [];
    }

    return new Response(JSON.stringify({ proposals: saved, totalExtracted: candidates.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
