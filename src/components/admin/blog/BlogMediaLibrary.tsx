import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Images, Copy, Loader2, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BLOG_STYLE_ANCHORS, anchorPublicUrl } from "@/lib/blog/styleAnchors";
import { generateAndStoreAiVariant } from "@/lib/blog/generateAiVariant";

type MediaAsset = {
  id: string;
  public_url: string;
  source: string;
  prompt: string | null;
  anchor_id: string | null;
  post_id: string | null;
  tags: string[] | null;
  created_at: string;
};

type Props = {
  onPick: (url: string) => void;
};

type Filter = "all" | "anchor_ai" | "generated" | "uploaded" | "seeded";

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  anchor_ai: "Anchor AI",
  generated: "Generated",
  uploaded: "Uploaded",
  seeded: "Seeded",
};

/**
 * Reusable Media Library for blog covers. Lists every catalogued image so an
 * admin can apply a previous generation to another post or grab the URL for a
 * social repost without re-generating.
 */
export function BlogMediaLibrary({ onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_media_assets")
        .select("id, public_url, source, prompt, anchor_id, post_id, tags, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!cancelled) {
        if (error) toast.error(error.message);
        setAssets((data ?? []) as MediaAsset[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (filter !== "all" && a.source !== filter) return false;
      if (!q) return true;
      const hay = [a.prompt ?? "", a.anchor_id ?? "", (a.tags ?? []).join(" ")]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [assets, query, filter]);

  const copy = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.public_url);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId((id) => (id === asset.id ? null : id)), 1500);
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const pick = (asset: MediaAsset) => {
    onPick(asset.public_url);
    toast.success("Cover image set — remember to Save the post");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Images className="h-4 w-4 mr-1" />
          Pick from library
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>
            Every cover you generate or upload is saved here so you can reuse it
            on other posts or copy the URL for social reposts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompt, anchor, or tag..."
            className="max-w-sm"
          />
          <div className="flex gap-1">
            {(["all", "generated", "uploaded", "seeded"] as Filter[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {assets.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No images yet. Generate or upload a cover to populate the library.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="group rounded-md overflow-hidden border bg-card flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => pick(a)}
                  className="block aspect-[16/9] overflow-hidden bg-muted"
                  title="Use as cover for this post"
                >
                  <img
                    src={a.public_url}
                    alt={a.prompt ?? "Media asset"}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                  />
                </button>
                <div className="p-2 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium capitalize",
                        a.source === "generated" && "bg-primary/10 text-primary",
                        a.source === "uploaded" && "bg-secondary text-secondary-foreground",
                        a.source === "seeded" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {a.source}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(a)}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      title="Copy URL"
                    >
                      {copiedId === a.id ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> URL
                        </>
                      )}
                    </button>
                  </div>
                  {a.prompt && (
                    <p className="line-clamp-2 text-muted-foreground">{a.prompt}</p>
                  )}
                  {a.tags && a.tags.length > 0 && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {a.tags.slice(0, 4).join(" • ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
