import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo/SEO";
import { BlogCard } from "@/components/blog/BlogCard";
import { usePublishedPosts, BLOG_CATEGORIES } from "@/lib/blog/api";
import { Skeleton } from "@/components/ui/skeleton";

const BlogIndexPage = () => {
  const [filter, setFilter] = useState<string>("All");
  const { data: posts = [], isLoading } = usePublishedPosts();

  const activeCategories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(
    () => (filter === "All" ? posts : posts.filter((p) => p.category === filter)),
    [filter, posts],
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Tavara Care Blog",
    url: "https://tavara.care/blog",
    description:
      "Guides and reflections on care coordination, caregiver hiring, and the emotional realities of in-home care in Trinidad & Tobago.",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: `https://tavara.care/blog/${p.slug}`,
      datePublished: p.published_at,
      author: { "@type": "Person", name: p.author_name },
    })),
  };

  const filters = ["All", ...activeCategories.length ? activeCategories : BLOG_CATEGORIES];

  return (
    <>
      <SEO
        title="Tavara Care Blog — Caregiving Guides for Trinidad & Tobago"
        description="Practical guides and honest reflections on hiring caregivers, senior care costs, and the emotional realities of bringing care into the home in T&T."
        canonicalPath="/blog"
        schema={schema}
      />
      <main className="min-h-screen bg-background py-16">
        <Container>
          <header className="max-w-3xl mb-12">
            <p className="text-sm font-medium text-primary mb-3">Tavara Care Blog</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Guides for families, caregivers, and the village around them
            </h1>
            <p className="text-lg text-muted-foreground">
              Practical guides on hiring and costs. Honest writing on the emotional reality of
              bringing care into a Caribbean home. Built from what we see every day.
            </p>
          </header>

          <div className="flex flex-wrap gap-2 mb-10">
            {filters.map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-muted-foreground text-center py-12">
              No posts in this category yet — more on the way.
            </p>
          )}
        </Container>
      </main>
    </>
  );
};

export default BlogIndexPage;
