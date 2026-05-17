// supabase/functions/guardrails-scan-published/index.ts
// Scheduled scan of all published + scheduled posts against active guardrails.
// Writes new breach rows to guardrail_breach_log. Resolves rows where the term no longer appears.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: rules } = await admin
      .from('language_guardrails')
      .select('id, rule_type, banned_term, preferred_term, severity')
      .eq('is_active', true);

    const { data: posts } = await admin
      .from('blog_posts')
      .select('id, title, description, body, status')
      .in('status', ['published', 'scheduled']);

    const breachesByPost = new Map<string, any[]>();
    let inserted = 0;

    for (const post of posts ?? []) {
      const haystack = `${post.title}\n${post.description}\n${post.body}`;
      const found: any[] = [];

      for (const rule of rules ?? []) {
        if (!rule.banned_term) continue;
        if (!['word', 'tone', 'financial_deny'].includes(rule.rule_type)) continue;
        const re = new RegExp(`\\b${escapeRegex(rule.banned_term)}\\b`, 'gi');
        const matches = haystack.match(re);
        if (!matches || matches.length === 0) continue;
        if (rule.rule_type === 'tone' && matches.length <= 1) continue;

        const idx = haystack.search(re);
        const start = Math.max(0, idx - 60);
        const excerpt = haystack.slice(start, idx + (rule.banned_term?.length ?? 0) + 60).replace(/\s+/g, ' ').trim();

        found.push({
          post_id: post.id,
          rule_id: rule.id,
          rule_type: rule.rule_type,
          severity: rule.severity,
          banned_term: rule.banned_term,
          preferred_term: rule.preferred_term,
          excerpt,
        });
      }

      if (found.length > 0) breachesByPost.set(post.id, found);
    }

    // Mark existing open breaches for these posts as resolved if not re-detected
    const allPostIds = (posts ?? []).map((p) => p.id);
    if (allPostIds.length > 0) {
      const { data: openBreaches } = await admin
        .from('guardrail_breach_log')
        .select('id, post_id, rule_id')
        .in('post_id', allPostIds)
        .eq('resolved', false);

      const stillBreached = new Set<string>();
      for (const [postId, list] of breachesByPost.entries()) {
        for (const b of list) stillBreached.add(`${postId}:${b.rule_id}`);
      }

      const toResolve = (openBreaches ?? [])
        .filter((b) => !stillBreached.has(`${b.post_id}:${b.rule_id}`))
        .map((b) => b.id);

      if (toResolve.length > 0) {
        await admin
          .from('guardrail_breach_log')
          .update({ resolved: true, resolved_at: new Date().toISOString() })
          .in('id', toResolve);
      }
    }

    // Insert newly detected breaches (skip if same (post, rule) is already open)
    for (const [postId, list] of breachesByPost.entries()) {
      const { data: existing } = await admin
        .from('guardrail_breach_log')
        .select('rule_id')
        .eq('post_id', postId)
        .eq('resolved', false);
      const have = new Set((existing ?? []).map((r) => r.rule_id));

      const toInsert = list.filter((b) => !have.has(b.rule_id));
      if (toInsert.length > 0) {
        const { error } = await admin.from('guardrail_breach_log').insert(toInsert);
        if (!error) inserted += toInsert.length;
      }
    }

    return new Response(
      JSON.stringify({
        scannedPosts: posts?.length ?? 0,
        activeRules: rules?.length ?? 0,
        postsWithBreaches: breachesByPost.size,
        newBreachesInserted: inserted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
