import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadBlogAsset } from "@/lib/blog/api";
import {
  BLOG_STYLE_ANCHORS,
  type BlogStyleAnchor,
  anchorPublicUrl,
  anchorThumbUrl,
  buildStyledImagePrompt,
  pickAnchorForPost,
} from "@/lib/blog/styleAnchors";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  description: string;
  category: string;
  onGenerated: (url: string) => void;
  /** Render variant for the trigger button. */
  triggerVariant?: "outline" | "secondary";
};

/**
 * Cover image generator dialog for the blog admin editor.
 *
 * Always borrows from one of the committed real-life Trinidad photo anchors
 * (`public/blog-style-refs/`) so generated covers stay on-brand. The hidden
 * style preamble + the anchor image enforce the Tavara photo rulebook every
 * call — even if the admin's free-text prompt is sparse.
 */
export function BlogCoverGenerator({
  slug,
  title,
  description,
  category,
  onGenerated,
  triggerVariant = "outline",
}: Props) {
  const autoAnchor = useMemo(
    () => pickAnchorForPost(slug, title, description, category),
    [slug, title, description, category],
  );
  const [open, setOpen] = useState(false);
  const [anchorId, setAnchorId] = useState<string>(autoAnchor.id);
  const [prompt, setPrompt] = useState<string>(
    () => `${title}. ${description}`.trim(),
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const anchor: BlogStyleAnchor =
    BLOG_STYLE_ANCHORS.find((a) => a.id === anchorId) ?? autoAnchor;

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Write a short prompt first");
      return;
    }
    setGenerating(true);
    setPreviewUrl(null);
    try {
      const styledPrompt = buildStyledImagePrompt(prompt, anchor);
      const referenceImageUrl = anchorPublicUrl(anchor.id, window.location.origin);
      const { data, error } = await supabase.functions.invoke(
        "generate-marketing-image",
        {
          body: {
            prompt: styledPrompt,
            referenceImageUrl,
            width: 1200,
            height: 630,
            outputFormat: "jpeg",
          },
        },
      );
      if (error) throw error;
      const url = (data as { imageUrl?: string })?.imageUrl;
      if (!url) throw new Error("No image returned");
      setPreviewUrl(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const useThisImage = async () => {
    if (!previewUrl) return;
    setSaving(true);
    try {
      // previewUrl is a data URL from the edge function; convert to File and
      // upload through the existing blog-assets bucket pipeline.
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const file = new File([blob], `cover-${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      const uploaded = await uploadBlogAsset(file, "covers");
      onGenerated(uploaded);
      toast.success("Cover image saved — remember to Save the post");
      setOpen(false);
      setPreviewUrl(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={triggerVariant}>
          <Sparkles className="h-4 w-4 mr-1" />
          Generate from prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate cover image</DialogTitle>
          <DialogDescription>
            Every cover borrows from a real Trinidad photo so the result stays
            documentary, not AI-glossy. Pick the closest anchor for your topic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Style anchor (auto-picked: {autoAnchor.label})
            </Label>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {BLOG_STYLE_ANCHORS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAnchorId(a.id)}
                  className={cn(
                    "relative rounded-md overflow-hidden border-2 transition-colors text-left",
                    anchorId === a.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-border",
                  )}
                  title={a.subject}
                >
                  <img
                    src={anchorThumbUrl(a.id)}
                    alt={a.label}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="px-1.5 py-1 text-[10px] leading-tight bg-background/90">
                    {a.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="cover-prompt">Prompt</Label>
            <Textarea
              id="cover-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should the cover show? (Tavara photo rulebook is applied automatically.)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The Tavara photo rulebook (real Trinidad architecture, soft daylight,
              no stock-photo gloss, no people in scrubs, no text) is injected
              behind the scenes — no need to repeat it here.
            </p>
          </div>

          {previewUrl && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Preview
              </Label>
              <img
                src={previewUrl}
                alt="Generated cover preview"
                className="mt-2 w-full rounded border aspect-[16/9] object-cover"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={generate} disabled={generating || saving} variant="secondary">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                {previewUrl ? "Regenerate" : "Generate"}
              </>
            )}
          </Button>
          <Button onClick={useThisImage} disabled={!previewUrl || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving…
              </>
            ) : (
              "Use this image"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
