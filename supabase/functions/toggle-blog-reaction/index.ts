import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const postSlug = String(body?.postSlug ?? '').trim().toLowerCase();
    if (!postSlug || postSlug.length > 200) {
      return new Response(JSON.stringify({ error: 'Invalid post.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ip =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-real-ip') ??
      (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ??
      '';
    const ua = req.headers.get('user-agent') ?? '';
    const reactionHash = await sha256(`${ip}|${ua}|${postSlug}|tavara-react`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: existing } = await supabase
      .from('blog_post_reactions')
      .select('id')
      .eq('post_slug', postSlug)
      .eq('reaction_hash', reactionHash)
      .maybeSingle();

    let liked: boolean;
    if (existing) {
      await supabase.from('blog_post_reactions').delete().eq('id', existing.id);
      liked = false;
    } else {
      await supabase
        .from('blog_post_reactions')
        .insert({ post_slug: postSlug, reaction_hash: reactionHash });
      liked = true;
    }

    const { count } = await supabase
      .from('blog_post_reactions')
      .select('id', { count: 'exact', head: true })
      .eq('post_slug', postSlug);

    return new Response(JSON.stringify({ liked, like_count: count ?? 0 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('toggle-blog-reaction error', e);
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
