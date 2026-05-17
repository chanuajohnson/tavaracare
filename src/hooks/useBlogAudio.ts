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
      try {
        const { data, error: invokeErr } = await supabase.functions.invoke("blog-tts-generate", {
          body: { post_id: postId, force: opts?.force ?? false },
        });
        if (invokeErr) throw invokeErr;
        if (data?.error) throw new Error(data.error);
        setAudio(data as BlogAudio);
        return data as BlogAudio;
      } catch (e: any) {
        setError(e?.message ?? "Could not prepare audio");
        throw e;
      } finally {
        setIsPreparing(false);
      }
    },
    [postId],
  );

  return { audio, isLoading, isPreparing, error, prepare, refresh: load };
};
