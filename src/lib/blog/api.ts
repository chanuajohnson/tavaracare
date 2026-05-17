import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BlogStatus = "draft" | "scheduled" | "published" | "hidden";

export interface BlogFAQ {
  q: string;
  a: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  category: string;
  reading_time: string | null;
  author_name: string;
  author_role: string | null;
  author_avatar_url: string | null;
  cover_image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  faqs: BlogFAQ[];
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const BLOG_CATEGORIES = [
  "Family Care Guides",
  "Pricing & Planning",
  "Emotional Realities",
  "Caregiver Burnout & Boundaries",
  "Cultural & Community",
] as const;

const FALLBACK_AVATAR = "/chanua-johnson-fallback.jpg";

// ---------- Public reads (RLS scopes to published & live) ----------

export const usePublishedPosts = () =>
  useQuery({
    queryKey: ["blog", "public", "list"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BlogPost[];
    },
  });

export const usePublishedPost = (slug: string | undefined) =>
  useQuery({
    queryKey: ["blog", "public", "slug", slug],
    enabled: !!slug,
    queryFn: async (): Promise<BlogPost | null> => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as BlogPost) ?? null;
    },
  });

// ---------- Admin reads ----------

export const useAllPosts = () =>
  useQuery({
    queryKey: ["blog", "admin", "list"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as unknown as BlogPost[];
    },
  });

export const useAdminPost = (id: string | undefined) =>
  useQuery({
    queryKey: ["blog", "admin", "id", id],
    enabled: !!id && id !== "new",
    queryFn: async (): Promise<BlogPost | null> => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as BlogPost) ?? null;
    },
  });

// ---------- Admin mutations ----------

export type BlogPostUpsert = Partial<BlogPost> & {
  slug: string;
  title: string;
  description: string;
  body: string;
  category: string;
};

export const useSavePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: BlogPostUpsert & { id?: string }) => {
      const payload = {
        slug: post.slug,
        title: post.title,
        description: post.description,
        body: post.body,
        category: post.category,
        reading_time: post.reading_time ?? null,
        author_name: post.author_name ?? "Chanua Johnson",
        author_role: post.author_role ?? "Tavara Care Coordinator & Founder",
        author_avatar_url: post.author_avatar_url ?? null,
        cover_image_url: post.cover_image_url ?? null,
        cta_label: post.cta_label ?? null,
        cta_href: post.cta_href ?? null,
        faqs: post.faqs ?? [],
        status: post.status ?? "draft",
        published_at: post.published_at ?? null,
      };
      if (post.id) {
        const { data, error } = await supabase
          .from("blog_posts" as any)
          .update(payload)
          .eq("id", post.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog"] });
      toast.success("Post saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save"),
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog"] });
      toast.success("Post deleted");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to delete"),
  });
};

export const useToggleHide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BlogStatus }) => {
      const next: BlogStatus = status === "hidden" ? "published" : "hidden";
      const { error } = await supabase
        .from("blog_posts" as any)
        .update({ status: next })
        .eq("id", id);
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      qc.invalidateQueries({ queryKey: ["blog"] });
      toast.success(next === "hidden" ? "Post hidden" : "Post made live");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });
};

// ---------- Storage helpers ----------

export const uploadBlogAsset = async (file: File, folder = "avatars") => {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("blog-assets").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("blog-assets").getPublicUrl(path);
  return data.publicUrl;
};

// ---------- Helpers ----------

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const estimateReadingTime = (body: string) => {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 220));
  return `${mins} min read`;
};

// Lint for AI-tell patterns from docs/TAVARA_WRITING_STYLE.md
const BANNED_WORDS = [
  "delve",
  "leverage",
  "holistic",
  "transformative",
  "landscape",
  "tapestry",
  "navigate",
  "navigating",
  "embark",
  "unleash",
  "elevate",
  "seamless",
  "synergy",
  "robust",
  "in today's fast-paced",
  "in the realm of",
  "it is important to note",
];

export interface LintIssue {
  type: "em-dash" | "banned-word" | "not-just-pattern";
  message: string;
  excerpt: string;
}

export const lintBody = (body: string): LintIssue[] => {
  const issues: LintIssue[] = [];
  const lines = body.split("\n");
  lines.forEach((line, idx) => {
    if (/[—–]/.test(line)) {
      issues.push({
        type: "em-dash",
        message: `Line ${idx + 1}: em/en-dash detected`,
        excerpt: line.trim().slice(0, 140),
      });
    }
    BANNED_WORDS.forEach((w) => {
      const re = new RegExp(`\\b${w}\\b`, "i");
      if (re.test(line)) {
        issues.push({
          type: "banned-word",
          message: `Line ${idx + 1}: banned word "${w}"`,
          excerpt: line.trim().slice(0, 140),
        });
      }
    });
    if (/it'?s not just .+,? it'?s/i.test(line)) {
      issues.push({
        type: "not-just-pattern",
        message: `Line ${idx + 1}: "It's not just X, it's Y" pattern`,
        excerpt: line.trim().slice(0, 140),
      });
    }
  });
  return issues;
};

export const authorAvatarFallback = FALLBACK_AVATAR;
