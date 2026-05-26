import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApprovedComments, useSubmitComment } from "@/hooks/useBlogComments";
import { useLikeCount, useHasLiked, useToggleLike } from "@/hooks/useBlogReactions";
import { cn } from "@/lib/utils";

interface Props {
  postSlug: string;
}

export function BlogCommentsThread({ postSlug }: Props) {
  const { data: comments = [], isLoading } = useApprovedComments(postSlug);
  const submit = useSubmitComment(postSlug);
  const { data: likeCount = 0 } = useLikeCount(postSlug);
  const liked = useHasLiked(postSlug);
  const toggle = useToggleLike(postSlug);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submit.isPending) return;
    try {
      await submit.mutateAsync({ authorName: name, authorEmail: email, body });
      setName("");
      setEmail("");
      setBody("");
      setJustSubmitted(true);
    } catch {
      /* toast already shown */
    }
  };

  return (
    <section id="comments" className="not-prose mt-12 pt-10 border-t border-border scroll-mt-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Comments</h2>
        <Button
          type="button"
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={() => toggle.mutate()}
          disabled={toggle.isPending}
          className="gap-2"
          aria-pressed={liked}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          <span className="tabular-nums">{likeCount}</span>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-8">
          No comments yet. Share the first one below.
        </p>
      ) : (
        <ul className="space-y-5 mb-10">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="font-medium text-foreground">{c.author_name}</span>
                <time
                  dateTime={c.created_at}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(c.created_at).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-muted/20 p-5">
        <h3 className="font-semibold">Leave a comment</h3>
        {justSubmitted && (
          <p className="text-sm text-primary">
            Thanks — your comment is awaiting review and will appear here once approved.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="comment-name">Name</Label>
            <Input
              id="comment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={60}
              minLength={2}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="comment-email">
              Email <span className="text-muted-foreground font-normal">(not published)</span>
            </Label>
            <Input
              id="comment-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={120}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="comment-body">Comment</Label>
          <Textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={2}
            maxLength={2000}
            rows={4}
            placeholder="Share your thoughts…"
          />
          <p className="text-xs text-muted-foreground text-right">{body.length}/2000</p>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={submit.isPending}>
            {submit.isPending ? "Submitting…" : "Post comment"}
          </Button>
        </div>
      </form>
    </section>
  );
}
