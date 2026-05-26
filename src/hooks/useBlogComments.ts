import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlogComment {
  id: string;
  post_slug: string;
  author_name: string;
  body: string;
  created_at: string;
}

export function useApprovedComments(postSlug: string | undefined) {
  return useQuery({
    queryKey: ["blog-comments", postSlug],
    queryFn: async (): Promise<BlogComment[]> => {
      if (!postSlug) return [];
      const { data, error } = await supabase.rpc("get_blog_comments", {
        _post_slug: postSlug,
      });
      if (error) throw error;
      return (data ?? []) as BlogComment[];
    },
    enabled: !!postSlug,
    staleTime: 30_000,
  });
}

export function useSubmitComment(postSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { authorName: string; authorEmail: string; body: string }) => {
      const { data, error } = await supabase.functions.invoke("submit-blog-comment", {
        body: { postSlug, ...input },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { ok: true; status: "pending" };
    },
    onSuccess: () => {
      toast.success("Thanks — your comment is awaiting review.");
      qc.invalidateQueries({ queryKey: ["blog-comments", postSlug] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not submit comment.");
    },
  });
}
