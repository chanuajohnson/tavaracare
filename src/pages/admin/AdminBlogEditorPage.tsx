import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Plus, Eye, Save, Upload, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useAdminPost,
  useSavePost,
  uploadBlogAsset,
  slugify,
  estimateReadingTime,
  lintBody,
  BLOG_CATEGORIES,
  type BlogStatus,
  type BlogFAQ,
} from "@/lib/blog/api";
import chanuaAvatar from "@/assets/chanua-johnson.jpg";
import { toast } from "sonner";

export default function AdminBlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const isAdmin = userRole === "admin";
  const isNew = id === "new";

  const { data: existing, isLoading } = useAdminPost(id);
  const save = useSavePost();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>(BLOG_CATEGORIES[0]);
  const [readingTime, setReadingTime] = useState("");
  const [authorName, setAuthorName] = useState("Chanua Johnson");
  const [authorRole, setAuthorRole] = useState("Tavara Care Coordinator & Founder");
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [faqs, setFaqs] = useState<BlogFAQ[]>([]);
  const [status, setStatus] = useState<BlogStatus>("draft");
  const [publishedAt, setPublishedAt] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Hydrate when loaded
  useEffect(() => {
    if (existing) {
      setSlug(existing.slug);
      setTitle(existing.title);
      setDescription(existing.description);
      setBody(existing.body);
      setCategory(existing.category);
      setReadingTime(existing.reading_time ?? "");
      setAuthorName(existing.author_name);
      setAuthorRole(existing.author_role ?? "");
      setAuthorAvatarUrl(existing.author_avatar_url);
      setCoverImageUrl(existing.cover_image_url);
      setCtaLabel(existing.cta_label ?? "");
      setCtaHref(existing.cta_href ?? "");
      setFaqs(existing.faqs ?? []);
      setStatus(existing.status);
      setPublishedAt(existing.published_at ? existing.published_at.slice(0, 16) : "");
    }
  }, [existing]);

  // Auto-slug from title when creating new
  useEffect(() => {
    if (isNew && title && !slug) setSlug(slugify(title));
  }, [title, isNew, slug]);

  // Auto reading time
  useEffect(() => {
    if (body && !readingTime) setReadingTime(estimateReadingTime(body));
  }, [body, readingTime]);

  const lintIssues = useMemo(() => lintBody(body), [body]);

  if (authLoading) return <div className="container py-12">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const persist = async (overrideStatus?: BlogStatus, overrideDate?: string | null) => {
    if (!slug || !title || !description || !body) {
      toast.error("Slug, title, description, and body are required");
      return;
    }
    const finalStatus = overrideStatus ?? status;
    const finalDate =
      overrideDate !== undefined
        ? overrideDate
        : publishedAt
          ? new Date(publishedAt).toISOString()
          : null;
    const saved = await save.mutateAsync({
      id: existing?.id,
      slug,
      title,
      description,
      body,
      category,
      reading_time: readingTime || estimateReadingTime(body),
      author_name: authorName,
      author_role: authorRole || null,
      author_avatar_url: authorAvatarUrl,
      cover_image_url: coverImageUrl,
      cta_label: ctaLabel || null,
      cta_href: ctaHref || null,
      faqs,
      status: finalStatus,
      published_at: finalDate,
    });
    if (isNew && (saved as any)?.id) {
      navigate(`/admin/blog/${(saved as any).id}`, { replace: true });
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const url = await uploadBlogAsset(file, "avatars");
      setAuthorAvatarUrl(url);
      toast.success("Avatar uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      const url = await uploadBlogAsset(file, "covers");
      setCoverImageUrl(url);
      toast.success("Cover uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    }
  };

  if (isLoading && !isNew) return <div className="container py-12">Loading…</div>;

  const initials = authorName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Admin", path: "/dashboard/admin" },
          { label: "Blog", path: "/admin/blog" },
          { label: isNew ? "New post" : "Edit post", path: "#" },
        ]}
      />

      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{isNew ? "New post" : "Edit post"}</h1>
            {existing && (
              <p className="text-sm text-muted-foreground">
                <Link to={`/blog/${existing.slug}`} target="_blank" className="hover:underline">
                  View public URL ↗
                </Link>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => persist("draft")} disabled={save.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save draft
            </Button>
            <Button
              variant="outline"
              onClick={() => persist("scheduled")}
              disabled={save.isPending || !publishedAt}
              title={!publishedAt ? "Set a publish date first" : ""}
            >
              Schedule
            </Button>
            <Button
              onClick={() => {
                const firstPublish = !existing?.published_at;
                persist("published", firstPublish ? new Date().toISOString() : undefined);
              }}
              disabled={save.isPending}
              title={
                existing?.published_at
                  ? "Keeps the original publish date. Edit the date field to bump it."
                  : "Publishes now"
              }
            >
              {existing?.status === "published" ? "Re-publish" : "Publish now"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    /blog/{slug || "your-slug"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="desc">
                    Description{" "}
                    <span className="text-xs text-muted-foreground">
                      ({description.length}/160 for SEO)
                    </span>
                  </Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <BlogGuardrailsPanel />
                  <Label>Body (markdown)</Label>
                  <Tabs defaultValue="write" className="w-full">
                    <TabsList>
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="h-4 w-4 mr-1" /> Preview
                      </TabsTrigger>
                      <TabsTrigger value="cheatsheet">Cheatsheet</TabsTrigger>
                    </TabsList>
                    <TabsContent value="write">
                      <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={24}
                        className="font-mono text-sm"
                        placeholder="Write in markdown. Use > [!LEARNED] for Tavara learned blocks, > [!OBSERVATION] for observations, > for pull quotes, and --- for section dividers."
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="prose prose-lg max-w-none p-4 border rounded bg-card">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {body || "*Nothing to preview yet.*"}
                        </ReactMarkdown>
                      </div>
                    </TabsContent>
                    <TabsContent value="cheatsheet">
                      <div className="text-sm space-y-2 p-4 border rounded bg-muted/50">
                        <p><code>## Heading</code> — section heading</p>
                        <p><code>**bold**</code> · <code>*italic*</code> · <code>[link](/path)</code></p>
                        <p><code>&gt; pull quote</code> — italicized pull quote</p>
                        <p><code>&gt; [!LEARNED] text</code> — Tavara Learned block</p>
                        <p><code>&gt; [!OBSERVATION] text</code> — Observation block</p>
                        <p><code>---</code> — section divider</p>
                        <p>Tables, lists, and code blocks all work normally.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently asked questions</CardTitle>
                <CardDescription>Used for SEO FAQ schema and rendered at post bottom.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {faqs.map((f, i) => (
                  <div key={i} className="border rounded p-3 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <Label className="text-xs">Question {i + 1}</Label>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={f.q}
                      placeholder="Question"
                      onChange={(e) =>
                        setFaqs(faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))
                      }
                    />
                    <Textarea
                      value={f.a}
                      placeholder="Answer"
                      rows={2}
                      onChange={(e) =>
                        setFaqs(faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))
                      }
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFaqs([...faqs, { q: "", a: "" }])}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add FAQ
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as BlogStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pubAt">Published / scheduled at</Label>
                  <Input
                    id="pubAt"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Posts only appear publicly once this time has passed. Editing a
                    published post keeps this date — change it here if you want to bump
                    the post to the top of the blog.
                  </p>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reading time</Label>
                  <Input
                    value={readingTime}
                    placeholder={estimateReadingTime(body)}
                    onChange={(e) => setReadingTime(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Author</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border">
                    <AvatarImage src={authorAvatarUrl || chanuaAvatar} alt={authorName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleAvatarUpload(f);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      disabled={uploadingAvatar}
                    >
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-1" />
                        {uploadingAvatar ? "Uploading…" : "Change photo"}
                      </label>
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                </div>
                <div>
                  <Label>Role / title</Label>
                  <Input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cover image (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {coverImageUrl && (
                  <img
                    src={coverImageUrl}
                    alt="cover"
                    className="w-full h-32 object-cover rounded border"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  id="cover-upload"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCoverUpload(f);
                  }}
                />
                <Button size="sm" variant="outline" asChild>
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-1" /> {coverImageUrl ? "Replace" : "Upload"}
                  </label>
                </Button>
                {coverImageUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCoverImageUrl(null)}
                  >
                    Remove
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Call to action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label>Label</Label>
                  <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
                </div>
                <div>
                  <Label>Link</Label>
                  <Input
                    value={ctaHref}
                    placeholder="/urgent-families"
                    onChange={(e) => setCtaHref(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4" />
                  Style guardrails
                  {lintIssues.length > 0 && (
                    <Badge variant="destructive">{lintIssues.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Non-blocking warnings for AI-tell patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lintIssues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Body looks clean.</p>
                ) : (
                  <ul className="space-y-2 text-xs max-h-64 overflow-y-auto">
                    {lintIssues.map((i, idx) => (
                      <li key={idx} className="border-l-2 border-amber-500 pl-2">
                        <div className="font-medium">{i.message}</div>
                        <div className="text-muted-foreground truncate">{i.excerpt}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
