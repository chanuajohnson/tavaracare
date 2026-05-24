import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePublishedPosts, type BlogPost } from '@/lib/blog/api';

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    // Mulberry32-ish step
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const rand = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(rand * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface Props {
  seedSlug: string;
  areaServed?: string;
}

export const RecommendedReadingStrip: React.FC<Props> = ({ seedSlug, areaServed }) => {
  const { data: posts } = usePublishedPosts();

  if (!posts || posts.length < 2) return null;

  const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60));
  const seed = hashString(`${seedSlug}:${hourBucket}`);
  const picks: BlogPost[] = seededShuffle(posts, seed).slice(0, 4);

  return (
    <section className="border-b">
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-semibold">From the Tavara blog</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Short reads families and caregivers in {areaServed || 'Trinidad & Tobago'} find useful.
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center text-sm text-primary hover:underline"
          >
            All posts <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {picks.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            >
              <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
                {post.cover_image_url ? (
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={post.cover_image_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5" />
                )}
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide">
                    {post.category}
                  </p>
                  <h3 className="mt-2 text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 inline-flex items-center text-xs text-muted-foreground">
                    Read <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedReadingStrip;
