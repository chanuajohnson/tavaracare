import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const postSlug = String(body?.postSlug ?? '').trim().toLowerCase();
    const authorName = String(body?.authorName ?? '').trim();
    const authorEmail = String(body?.authorEmail ?? '').trim().toLowerCase();
    const commentBody = String(body?.body ?? '').trim();

    const errors: string[] = [];
    if (!postSlug || postSlug.length > 200) errors.push('Invalid post.');
    if (authorName.length < 2 || authorName.length > 60) errors.push('Name must be 2-60 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail) || authorEmail.length > 120) errors.push('Valid email required.');
    if (commentBody.length < 2 || commentBody.length > 2000) errors.push('Comment must be 2-2000 characters.');
    if (errors.length) {
      return new Response(JSON.stringify({ error: errors.join(' ') }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ip =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-real-ip') ??
      (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ??
      '';
    const daySalt = new Date().toISOString().slice(0, 10);
    const ipHash = await sha256(`${ip}|${daySalt}|tavara-blog`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Rate limit: >3 pending in 24h from same hash
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: pendingCount } = await supabase
      .from('blog_comments')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .eq('status', 'pending')
      .gte('created_at', since24h);
    if ((pendingCount ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: 'You have several comments awaiting review. Please wait a little.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Rate limit: 1 per 60s per slug per hash
    const since60s = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from('blog_comments')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .eq('post_slug', postSlug)
      .gte('created_at', since60s);
    if ((recentCount ?? 0) >= 1) {
      return new Response(
        JSON.stringify({ error: 'Please wait a moment before posting again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { error: insertError } = await supabase.from('blog_comments').insert({
      post_slug: postSlug,
      author_name: authorName,
      author_email: authorEmail,
      body: commentBody,
      status: 'pending',
      ip_hash: ipHash,
    });
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ ok: true, status: 'pending' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('submit-blog-comment error', e);
    return new Response(JSON.stringify({ error: 'Something went wrong.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
