import { supabase } from "@/integrations/supabase/client";
import { uploadBlogAsset } from "@/lib/blog/api";
import {
  buildStyledImagePrompt,
  type BlogStyleAnchor,
} from "@/lib/blog/styleAnchors";

/**
 * Shared helper used by both the upload-variant pipeline and the anchor
 * baseline backfill. Calls the `generate-marketing-image` edge function with
 * a reference image, uploads the result to the `blog-assets` bucket, and
 * inserts a catalogue row into `blog_media_assets`.
 *
 * Returns the public URL of the newly stored AI image, or `null` on failure.
 */
export type AiVariantSource = "anchor_ai" | "generated";

export async function generateAndStoreAiVariant(opts: {
  referenceImageUrl: string;
  prompt: string;
  anchor: BlogStyleAnchor;
  folder: string; // e.g. "covers/anchor-ai" or "covers/auto-ai"
  source: AiVariantSource;
  tags: string[];
  postId?: string | null;
}): Promise<string | null> {
  let styledPrompt = buildStyledImagePrompt(opts.prompt, opts.anchor);

  // Pull recent rejections for this anchor so the model learns what to avoid.
  try {
    const { data: rejections } = await supabase
      .from("blog_media_rejections")
      .select("reason, reason_category")
      .eq("anchor_id", opts.anchor.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (rejections && rejections.length > 0) {
      const avoidList = rejections
        .map((r) => {
          const cat = r.reason_category ? `${r.reason_category}: ` : "";
          return `"${cat}${(r.reason ?? "").slice(0, 140)}"`;
        })
        .join("; ");
      styledPrompt += `\n\nAvoid these previously rejected patterns for this anchor: ${avoidList}.`;
    }
  } catch (e) {
    console.warn("[generateAndStoreAiVariant] rejections fetch failed:", e);
  }

  const { data, error } = await supabase.functions.invoke(
    "generate-marketing-image",
    {
      body: {
        prompt: styledPrompt,
        referenceImageUrl: opts.referenceImageUrl,
        width: 1200,
        height: 630,
        outputFormat: "jpeg",
      },
    },
  );
  if (error) {
    console.warn("[generateAndStoreAiVariant] edge error:", error);
    return null;
  }
  const dataUrl = (data as { imageUrl?: string })?.imageUrl;
  if (!dataUrl) return null;

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File(
    [blob],
    `ai-${opts.anchor.id}-${Date.now()}.jpg`,
    { type: blob.type || "image/jpeg" },
  );
  const publicUrl = await uploadBlogAsset(file, opts.folder);

  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("blog_media_assets").insert({
      public_url: publicUrl,
      source: opts.source,
      prompt: opts.prompt,
      anchor_id: opts.anchor.id,
      post_id: opts.postId ?? null,
      mime_type: file.type,
      width: 1200,
      height: 630,
      tags: opts.tags.filter(Boolean) as string[],
      created_by: userData.user?.id ?? null,
    });
  } catch (e) {
    console.warn("[generateAndStoreAiVariant] catalogue insert failed:", e);
  }

  return publicUrl;
}
