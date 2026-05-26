import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikeCount, useHasLiked, useToggleLike } from "@/hooks/useBlogReactions";
import { useApprovedComments } from "@/hooks/useBlogComments";
import { cn } from "@/lib/utils";

interface Props {
  postSlug: string;
}

export function BlogCommentsPrompt({ postSlug }: Props) {
  const { data: likeCount = 0 } = useLikeCount(postSlug);
  const liked = useHasLiked(postSlug);
  const toggle = useToggleLike(postSlug);
  const { data: comments = [] } = useApprovedComments(postSlug);

  const scrollToComments = () => {
    const el = document.getElementById("comments");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = document.getElementById("comment-body");
        if (input instanceof HTMLTextAreaElement) input.focus();
      }, 400);
    }
  };

  return (
    <aside className="not-prose my-8 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Button
          type="button"
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={() => toggle.mutate()}
          disabled={toggle.isPending}
          className="gap-2"
          aria-pressed={liked}
          aria-label={liked ? "Unlike this post" : "Like this post"}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          <span className="tabular-nums">{likeCount}</span>
        </Button>

        <div className="text-sm text-muted-foreground flex-1 min-w-[160px]">
          {comments.length > 0
            ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"} so far. Join the conversation.`
            : "Be the first to share your thoughts."}
        </div>

        <Button type="button" variant="secondary" size="sm" onClick={scrollToComments}>
          Add a comment
        </Button>
      </div>
    </aside>
  );
}
