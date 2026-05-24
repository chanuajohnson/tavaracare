import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BlogAudio {
  id: string;
  post_id: string;
  voice_id: string;
  audio_url: string;
  duration_seconds: number;
  char_count: number;
  generated_at: string;
}

export const useBlogAudio = (postId: string | undefined) => {
  const [audio, setAudio] = useState<BlogAudio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("blog_audio" as any)
      .select("*")
      .eq("post_id", postId)
      .maybeSingle();
    setAudio((data as unknown as BlogAudio) ?? null);
    setIsLoading(false);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const prepare = useCallback(
    async (opts?: { force?: boolean }) => {
      if (!postId) return;
      setIsPreparing(true);
      setError(null);

      const invokeOnce = async () => {
        const { data: post } = await supabase
          .from("blog_posts" as any)
          .select("slug")
          .eq("id", postId)
          .maybeSingle();
        const slug = (post as any)?.slug;
        return supabase.functions.invoke("blog-tts-generate", {
          body: { post_id: postId, slug, force: opts?.force ?? false },
        });
      };

      try {
        let { data, error: invokeErr } = await invokeOnce();
        // Retry once on transient network/fetch failures
        if (invokeErr && /fetch|network|send a request/i.test(invokeErr.message ?? "")) {
          await new Promise((r) => setTimeout(r, 800));
          ({ data, error: invokeErr } = await invokeOnce());
        }
        if (invokeErr) throw invokeErr;
        if (data?.error) throw new Error(data.error);
        setAudio(data as BlogAudio);
        return data as BlogAudio;
      } catch (e: any) {
        const friendly = /fetch|network|send a request/i.test(e?.message ?? "")
          ? "Audio is taking longer than usual. Tap play to retry."
          : e?.message ?? "Could not prepare audio";
        setError(friendly);
        throw new Error(friendly);
      } finally {
        setIsPreparing(false);
      }
    },
    [postId],
  );

  return { audio, isLoading, isPreparing, error, prepare, refresh: load };
};
