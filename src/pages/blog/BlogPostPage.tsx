import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo/SEO";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "@/components/blog/BlogCard";
import chanuaAvatar from "@/assets/chanua-johnson.jpg";
import {
  PullQuote,
  TavaraLearned,
  Observation,
  SectionDivider,
} from "@/components/blog/editorial";
import { usePublishedPost, usePublishedPosts } from "@/lib/blog/api";
import { getBlogShareUrl } from "@/lib/blog/shareUrl";

const extractFirstText = (node: any): string => {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractFirstText).join("");
  if (node.props?.children) return extractFirstText(node.props.children);
  return "";
};

const stripDirective = (children: any, tag: string): any => {
  const visit = (n: any): any => {
    if (typeof n === "string") return n.replace(new RegExp(`^\\s*\\[!${tag}\\]\\s*`), "");
    if (Array.isArray(n)) {
      const out = [...n];
      for (let i = 0; i < out.length; i++) {
        const before = extractFirstText(out[i]);
        const after = visit(out[i]);
        if (extractFirstText(after) !== before) {
          out[i] = after;
          return out;
        }
      }
      return out;
    }
    if (n && typeof n === "object" && n.props?.children) {
      return { ...n, props: { ...n.props, children: visit(n.props.children) } };
    }
    return n;
  };
  return visit(children);
};

const markdownComponents: Components = {
  hr: () => <SectionDivider />,
  blockquote: ({ children }) => {
    const text = extractFirstText(children).trimStart();
    if (text.startsWith("[!LEARNED]")) {
      return <TavaraLearned>{stripDirective(children, "LEARNED")}</TavaraLearned>;
    }
    if (text.startsWith("[!OBSERVATION]")) {
      return <Observation>{stripDirective(children, "OBSERVATION")}</Observation>;
    }
    return <PullQuote>{children}</PullQuote>;
  },
};

const BASE_URL = "https://tavara.care";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePublishedPost(slug);
  const { data: allPosts = [] } = usePublishedPosts();
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleCopyArticle = async () => {
    if (!post) return;
    const faqText = post.faqs.length
      ? `\n\nFrequently asked questions\n\n${post.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}`
      : "";
    const text = `${post.title}\n\n${post.description}\n\n${post.body}${faqText}\n\nSource: https://tavara.care/blog/${post.slug}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Article copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  const handleCopyShareLink = async () => {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(getBlogShareUrl(post.slug));
      setShareCopied(true);
      toast.success("Share link copied — paste into WhatsApp for a rich preview");
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background py-16">
        <Container>
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </Container>
      </main>
    );
  }

  if (!post) return <Navigate to="/blog" replace />;

  const url = `${BASE_URL}/blog/${post.slug}`;
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const avatarSrc = post.author_avatar_url || chanuaAvatar;
  const initials = (post.author_name || "C")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author_name },
    publisher: {
      "@type": "Organization",
      name: "Tavara Care",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/og-image.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: post.category,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const faqSchema =
    post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const schemas = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <>
      <SEO
        title={`${post.title} | Tavara Care`}
        description={post.description}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
        schema={schemas}
      />
      <main className="min-h-screen bg-background py-12 md:py-16">
        <Container>
          <nav className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span className="mx-2">/</span>
            <span>{post.category}</span>
          </nav>

          <article className="max-w-3xl mx-auto">
            <header className="mb-10 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary">{post.category}</Badge>
                {post.reading_time && <span>{post.reading_time}</span>}
                {post.published_at && (
                  <>
                    <span>·</span>
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{post.title}</h1>
              <p className="text-lg text-muted-foreground">{post.description}</p>
              <div className="flex items-center gap-3 pt-2">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={avatarSrc} alt={post.author_name} className="object-cover" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="text-sm leading-tight">
                  <div className="font-medium text-foreground">{post.author_name}</div>
                  {post.author_role && (
                    <div className="text-muted-foreground">{post.author_role}</div>
                  )}
                </div>
              </div>
            </header>

            <div className="prose-editorial prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {post.body}
              </ReactMarkdown>
            </div>

            {post.cta_label && post.cta_href && (
              <aside className="mt-12 p-6 md:p-8 rounded-lg bg-primary-100/40 border border-primary-200">
                <h2 className="text-xl font-semibold mb-2">Ready when you are</h2>
                <p className="text-muted-foreground mb-4">
                  Tavara is a care coordination platform serving families across Trinidad & Tobago.
                  Start at the pace that's right for your home.
                </p>
                <Button asChild>
                  <Link to={post.cta_href}>{post.cta_label}</Link>
                </Button>
              </aside>
            )}

            {post.faqs.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
                <div className="space-y-6">
                  {post.faqs.map((f) => (
                    <div key={f.q}>
                      <h3 className="font-semibold mb-2">{f.q}</h3>
                      <p className="text-muted-foreground">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Want to share this with family? Copy the full article text.
              </p>
              <Button onClick={handleCopyArticle} variant="outline" size="sm">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copy article text
                  </>
                )}
              </Button>
            </div>
          </article>

          {related.length > 0 && (
            <section className="mt-20 max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Keep reading</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>
    </>
  );
};

export default BlogPostPage;
