import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const likedKey = (slug: string) => `blog_liked_${slug}`;

export function useLikeCount(postSlug: string | undefined) {
  return useQuery({
    queryKey: ["blog-likes", postSlug],
    queryFn: async (): Promise<number> => {
      if (!postSlug) return 0;
      const { data, error } = await supabase.rpc("get_blog_like_count", {
        _post_slug: postSlug,
      });
      if (error) throw error;
      return Number(data ?? 0);
    },
    enabled: !!postSlug,
    staleTime: 30_000,
  });
}

export function useHasLiked(postSlug: string | undefined): boolean {
  if (!postSlug) return false;
  try {
    return localStorage.getItem(likedKey(postSlug)) === "1";
  } catch {
    return false;
  }
}

export function useToggleLike(postSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("toggle-blog-reaction", {
        body: { postSlug },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { liked: boolean; like_count: number };
    },
    onSuccess: (data) => {
      try {
        if (data.liked) localStorage.setItem(likedKey(postSlug), "1");
        else localStorage.removeItem(likedKey(postSlug));
      } catch {
        /* ignore */
      }
      qc.setQueryData(["blog-likes", postSlug], data.like_count);
    },
    onError: () => toast.error("Could not register your like."),
  });
}
