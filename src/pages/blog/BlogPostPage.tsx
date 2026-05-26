import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { BlogInlineCTA } from "@/components/blog/BlogInlineCTA";
import { BlogTopCTA } from "@/components/blog/BlogTopCTA";
import { CostHeroCTA } from "@/components/blog/hero-cta/CostHeroCTA";
import { BlogEndCTABlock } from "@/components/blog/BlogEndCTABlock";
import { BlogStickyMobileCTA } from "@/components/blog/BlogStickyMobileCTA";
import { BlogCommentsPrompt } from "@/components/blog/BlogCommentsPrompt";
import { BlogCommentsThread } from "@/components/blog/BlogCommentsThread";
import { captureInboundAttribution, trackBlogCtaClick } from "@/lib/blog/attribution";
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
import { BlogAudioPlayer } from "@/components/blog/BlogAudioPlayer";
import { BlogReadingProvider, useBlogReading } from "@/components/blog/BlogReadingContext";
import { useBlogAudio } from "@/hooks/useBlogAudio";
import { cn } from "@/lib/utils";
import chanuaAvatar from "@/assets/chanua-johnson.jpg";
import {
  PullQuote,
  TavaraLearned,
  Observation,
  SectionDivider,
} from "@/components/blog/editorial";
import { usePublishedPost, usePublishedPosts } from "@/lib/blog/api";
import { getBlogShareUrlWithUtm } from "@/lib/blog/shareUrl";

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

// Wraps each whitespace-separated word in a span and assigns it an index from
// the shared reading counter, so the audio player can highlight the active word.
const HighlightedText = ({ value }: { value: string }) => {
  const reading = useBlogReading();
  if (!reading?.enabled) return <>{value}</>;
  const parts = value.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "" || /^\s+$/.test(part)) {
          return <React.Fragment key={i}>{part}</React.Fragment>;
        }
        const idx = reading.counterRef.current++;
        const isActive = idx === reading.currentIndex;
        const isRead = reading.currentIndex >= 0 && idx < reading.currentIndex;
        return (
          <span
            key={i}
            data-word-idx={idx}
            className={cn(
              "transition-colors duration-150 rounded-sm",
              isActive && "bg-primary/20 text-primary font-semibold px-0.5",
              isRead && !isActive && "text-muted-foreground/80",
            )}
          >
            {part}
          </span>
        );
      })}
    </>
  );
};

// Recursively walks ReactNode children, wrapping every raw string in HighlightedText.
const wrapText = (children: ReactNode): ReactNode => {
  return React.Children.map(children, (child, i) => {
    if (typeof child === "string") {
      return <HighlightedText key={i} value={child} />;
    }
    if (typeof child === "number") {
      return <HighlightedText key={i} value={String(child)} />;
    }
    if (React.isValidElement(child)) {
      const el = child as React.ReactElement<{ children?: ReactNode }>;
      const inner = el.props?.children;
      if (inner !== undefined) {
        return React.cloneElement(el, { ...el.props, children: wrapText(inner) });
      }
    }
    return child;
  });
};

const markdownComponents: Components = {
  hr: () => <SectionDivider />,
  blockquote: ({ children }) => {
    const text = extractFirstText(children).trimStart();
    if (text.startsWith("[!LEARNED]")) {
      return <TavaraLearned>{wrapText(stripDirective(children, "LEARNED"))}</TavaraLearned>;
    }
    if (text.startsWith("[!OBSERVATION]")) {
      return <Observation>{wrapText(stripDirective(children, "OBSERVATION"))}</Observation>;
    }
    return <PullQuote>{wrapText(children)}</PullQuote>;
  },
  p: ({ children }) => <p>{wrapText(children)}</p>,
  li: ({ children }) => <li>{wrapText(children)}</li>,
  h1: ({ children }) => <h1>{wrapText(children)}</h1>,
  h2: ({ children }) => <h2>{wrapText(children)}</h2>,
  h3: ({ children }) => <h3>{wrapText(children)}</h3>,
  h4: ({ children }) => <h4>{wrapText(children)}</h4>,
  h5: ({ children }) => <h5>{wrapText(children)}</h5>,
  h6: ({ children }) => <h6>{wrapText(children)}</h6>,
  em: ({ children }) => <em>{wrapText(children)}</em>,
  strong: ({ children }) => <strong>{wrapText(children)}</strong>,
  td: ({ children }) => <td>{wrapText(children)}</td>,
  th: ({ children }) => <th>{wrapText(children)}</th>,
  a: ({ children, href }) => <a href={href}>{wrapText(children)}</a>,
};

const BASE_URL = "https://tavara.care";

// Renders nothing; resets the karaoke word counter before each markdown render
// so word indices stay aligned with the audio timings array.
const CounterReset = () => {
  const reading = useBlogReading();
  if (reading?.enabled) reading.counterRef.current = reading.bodyOffset;
  return null;
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePublishedPost(slug);
  const { data: allPosts = [] } = usePublishedPosts();
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Capture inbound social UTMs (utm_source=facebook|whatsapp|linkedin...) on landing
  // so downstream conversions can be attributed back to the originating share.
  useEffect(() => {
    if (post?.slug) {
      void captureInboundAttribution(post.slug);
    }
  }, [post?.slug]);

  // Split body into thirds on paragraph boundaries so we can inject CTAs and
  // comment prompts at the 1/3 and 2/3 points. Falls back to halves (then whole)
  // for shorter posts.
  const [bodyA, bodyB, bodyC] = useMemo(() => {
    if (!post?.body) return ["", "", ""];
    const paras = post.body.split(/\n\n+/);
    if (paras.length < 6) {
      if (paras.length < 4) return [post.body, "", ""];
      const mid = Math.floor(paras.length / 2);
      return [paras.slice(0, mid).join("\n\n"), paras.slice(mid).join("\n\n"), ""];
    }
    const a = Math.floor(paras.length / 3);
    const b = Math.floor((2 * paras.length) / 3);
    return [
      paras.slice(0, a).join("\n\n"),
      paras.slice(a, b).join("\n\n"),
      paras.slice(b).join("\n\n"),
    ];
  }, [post?.body]);

  // Karaoke highlight: load the cached audio row (if any) and compute where
  // the body text starts inside the full narration word-timings array.
  const { audio: blogAudio } = useBlogAudio(post?.id);
  const wordTimings = useMemo(
    () => (Array.isArray(blogAudio?.word_timings) ? blogAudio!.word_timings! : []),
    [blogAudio?.word_timings],
  );
  const bodyOffset = useMemo(() => {
    if (!post || wordTimings.length === 0) return 0;
    const intro = `${post.title}. ${post.description}. `;
    return intro.trim().split(/\s+/).filter(Boolean).length;
  }, [post?.title, post?.description, wordTimings.length]);
  const highlightEnabled = wordTimings.length > 0;

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
    const shareUrl = getBlogShareUrlWithUtm(post.slug);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      toast.success("Share link copied — paste into WhatsApp for a rich preview");
      void trackBlogCtaClick({
        postSlug: post.slug,
        placement: "public-copy-share",
        destination: shareUrl,
      });
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

  // Slug rename redirects: keep old URLs (already indexed by Google) routing to current canonical post.
  // Extend this map whenever a published post's slug changes.
  const BLOG_SLUG_REDIRECTS: Record<string, string> = {
    "hoarding-overwhelm-aging-hidden-caregiving-challenge":
      "when-a-home-starts-feeling-heavy-aging-accumulation-caregiving",
  };
  if (!post) {
    if (slug && BLOG_SLUG_REDIRECTS[slug]) {
      return <Navigate to={`/blog/${BLOG_SLUG_REDIRECTS[slug]}`} replace />;
    }
    return <Navigate to="/blog" replace />;
  }

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
        ogImage={post.cover_image_url ?? undefined}
        ogImageAlt={post.title}
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

            <BlogTopCTA postSlug={post.slug} />

            <BlogReadingProvider
              timings={wordTimings}
              bodyOffset={bodyOffset}
              enabled={highlightEnabled}
            >
              <BlogAudioPlayer postId={post.id} className="mb-10" />

              <div className="prose-editorial prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:text-sm">
                <CounterReset />
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {bodyA || post.body}
                </ReactMarkdown>

                {(bodyB || bodyC) && <BlogCommentsPrompt postSlug={post.slug} />}

                {bodyB && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {bodyB}
                  </ReactMarkdown>
                )}

                {bodyC && <BlogInlineCTA postSlug={post.slug} />}
                {bodyC && <BlogCommentsPrompt postSlug={post.slug} />}

                {bodyC && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {bodyC}
                  </ReactMarkdown>
                )}

                {!bodyC && bodyB && <BlogInlineCTA postSlug={post.slug} />}
              </div>
            </BlogReadingProvider>

            <BlogEndCTABlock postSlug={post.slug} />

            <BlogCommentsThread postSlug={post.slug} />


            {post.cta_label && post.cta_href && (
              <aside className="mt-8 p-5 rounded-lg bg-muted/40 border border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Editor's note from the author:
                </p>
                <Button asChild variant="outline" size="sm">
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
                Share this article with your family or care team.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleCopyShareLink}
                  variant="default"
                  size="sm"
                  title="Paste into WhatsApp, iMessage, LinkedIn or Slack for a rich preview. Auto-redirects to the article."
                >
                  {shareCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Share link copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy share link
                    </>
                  )}
                </Button>
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
      <BlogStickyMobileCTA postSlug={post.slug} category={post.category} />
    </>
  );
};

export default BlogPostPage;
