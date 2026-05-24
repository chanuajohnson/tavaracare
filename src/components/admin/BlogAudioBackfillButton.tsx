import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Headphones, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PostLite {
  id: string;
  slug: string;
  title: string;
}

interface Props {
  posts: PostLite[];
}

interface RunResult {
  total: number;
  cached: number;
  generated: number;
  failed: number;
  fallback: number;
  errors: { slug: string; reason: string }[];
}

export const BlogAudioBackfillButton = ({ posts }: Props) => {
  const [isRunning, setIsRunning] = useState(false);
  const [force, setForce] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  const run = async () => {
    if (!posts.length) {
      toast.error("No published posts to process.");
      return;
    }
    setIsRunning(true);
    setResult(null);
    setProgress({ done: 0, total: posts.length });

    const summary: RunResult = {
      total: posts.length,
      cached: 0,
      generated: 0,
      failed: 0,
      fallback: 0,
      errors: [],
    };

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      try {
        const { data, error } = await supabase.functions.invoke("blog-tts-generate", {
          body: { post_id: p.id, slug: p.slug, force },
        });
        if (error) throw error;
        if (data?.provider_unavailable) {
          summary.fallback++;
          summary.errors.push({ slug: p.slug, reason: data.reason ?? "provider_unavailable" });
        } else if (data?.cached) {
          summary.cached++;
        } else if (data?.audio_url) {
          summary.generated++;
        }
      } catch (e: any) {
        summary.failed++;
        summary.errors.push({ slug: p.slug, reason: e?.message ?? "unknown" });
      }
      setProgress({ done: i + 1, total: posts.length });
    }

    setResult(summary);
    setIsRunning(false);
    if (summary.failed === 0 && summary.fallback === 0) {
      toast.success(`Audio ready for all ${summary.total} posts.`);
    } else {
      toast.warning(
        `Done: ${summary.generated} new, ${summary.cached} cached, ${summary.fallback} fallback, ${summary.failed} failed.`,
      );
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">Pre-generate blog narration</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Runs ElevenLabs for every published post so listeners never hit the
            harsh browser fallback. {posts.length} published post
            {posts.length === 1 ? "" : "s"} in scope.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="force-regen"
          checked={force}
          onCheckedChange={(v) => setForce(!!v)}
          disabled={isRunning}
        />
        <Label htmlFor="force-regen" className="text-sm font-normal cursor-pointer">
          Force regenerate (overwrite existing audio)
        </Label>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={run} disabled={isRunning || !posts.length} size="sm">
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating {progress?.done ?? 0} / {progress?.total ?? 0}
            </>
          ) : (
            <>Run backfill</>
          )}
        </Button>
        {result && !isRunning && (
          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              {result.generated} new · {result.cached} cached
            </span>
            {(result.fallback > 0 || result.failed > 0) && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {result.fallback} fallback · {result.failed} failed
              </span>
            )}
          </div>
        )}
      </div>

      {result && result.errors.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            Show {result.errors.length} issue{result.errors.length === 1 ? "" : "s"}
          </summary>
          <ul className="mt-2 space-y-1 pl-4 list-disc">
            {result.errors.map((e, i) => (
              <li key={i}>
                <code className="text-[11px]">{e.slug}</code> — {e.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};
