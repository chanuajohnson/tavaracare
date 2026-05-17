import { createClient } from "@supabase/supabase-js";
import { blogPosts } from "/dev-server/src/content/blog/posts.ts";

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

const rows = blogPosts.map(p => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  body: p.body,
  category: p.category,
  reading_time: p.readingTime,
  author_name: "Chanua Johnson",
  author_role: "Tavara Care Coordinator & Founder",
  faqs: p.faqs ?? [],
  cta_label: p.cta.label,
  cta_href: p.cta.href,
  status: "published",
  published_at: `${p.publishedAt}T09:00:00Z`,
}));

const { data, error } = await sb.from("blog_posts").upsert(rows, { onConflict: "slug" }).select("slug,published_at");
if (error) { console.error(error); process.exit(1); }
console.log("Seeded:", data?.length, data?.map(d=>d.slug).join(", "));
