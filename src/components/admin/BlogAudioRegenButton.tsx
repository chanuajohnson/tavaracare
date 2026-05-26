import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Headphones, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  postId: string;
  slug: string;
}

interface AudioRow {
  audio_url: string | null;
  generated_at: string | null;
  word_timings: unknown | null;
  narration_text: string | null;
}

export const BlogAudioRegenButton = ({ postId, slug }: Props) => {
  const [isRunning, setIsRunning] = useState(false);
  const [audio, setAudio] = useState<AudioRow | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [lastResult, setLastResult] = useState<
    | { kind: "ok"; words: number }
    | { kind: "fallback"; reason: string }
    | { kind: "error"; reason: string }
    | null
  >(null);

  const loadStatus = async () => {
    setLoadingStatus(true);
    const { data, error } = await supabase
      .from("blog_audio")
      .select("audio_url, generated_at, word_timings, narration_text")
      .eq("post_id", postId)
      .maybeSingle();
    if (!error) setAudio((data as unknown as AudioRow) ?? null);
    setLoadingStatus(false);
  };

  useEffect(() => {
    if (postId) loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const wordCount = Array.isArray(audio?.word_timings)
    ? (audio!.word_timings as unknown[]).length
    : 0;

  const run = async () => {
    setIsRunning(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("blog-tts-generate", {
        body: { post_id: postId, slug, force: true },
      });
      if (error) throw error;
      if (data?.provider_unavailable) {
        const reason = data.reason ?? "provider_unavailable";
        setLastResult({ kind: "fallback", reason });
        toast.warning(`ElevenLabs unavailable: ${reason}`);
      } else if (data?.audio_url || data?.cached) {
        await loadStatus();
        const words = Array.isArray(data?.word_timings)
          ? data.word_timings.length
          : 0;
        setLastResult({ kind: "ok", words });
        toast.success(
          words > 0
            ? `Regenerated with ${words} word timings`
            : "Regenerated (no word timings returned)",
        );
      } else {
        setLastResult({ kind: "error", reason: "Unexpected response" });
        toast.error("Unexpected response from TTS function");
      }
    } catch (e: any) {
      const reason = e?.message ?? "unknown";
      setLastResult({ kind: "error", reason });
      toast.error(`Regeneration failed: ${reason}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">Narration audio</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Regenerate ElevenLabs narration with word-level timings for the
            karaoke highlight on the public page.
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        {loadingStatus ? (
          <span>Checking audio status…</span>
        ) : audio?.audio_url ? (
          <>
            <div className="flex items-center gap-1 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              Audio ready
              {audio.generated_at && (
                <span className="text-muted-foreground">
                  · generated {new Date(audio.generated_at).toLocaleString()}
                </span>
              )}
            </div>
            <div>
              Word timings:{" "}
              {wordCount > 0 ? (
                <span className="text-foreground">{wordCount} words</span>
              ) : (
                <span className="text-amber-600">none (regenerate to add)</span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="h-3.5 w-3.5" />
            No audio yet for this post
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={run} disabled={isRunning} size="sm">
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Regenerating…
            </>
          ) : (
            <>Regenerate audio</>
          )}
        </Button>
        <a
          href={`/blog/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Open public page
        </a>
      </div>

      {lastResult && !isRunning && (
        <div className="text-xs">
          {lastResult.kind === "ok" && (
            <span className="text-green-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done — {lastResult.words} words timed
            </span>
          )}
          {lastResult.kind === "fallback" && (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              ElevenLabs fallback: <code>{lastResult.reason}</code>
            </span>
          )}
          {lastResult.kind === "error" && (
            <span className="text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {lastResult.reason}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
