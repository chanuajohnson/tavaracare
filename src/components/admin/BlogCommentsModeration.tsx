import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

type CommentStatus = "pending" | "approved" | "rejected" | "all";

interface AdminComment {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export function BlogCommentsModeration() {
  const [statusFilter, setStatusFilter] = useState<CommentStatus>("pending");
  const qc = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-blog-comments", statusFilter],
    queryFn: async (): Promise<AdminComment[]> => {
      let q = supabase
        .from("blog_comments")
        .select("id, post_slug, author_name, author_email, body, status, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AdminComment[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("blog_comments")
        .update({
          status,
          approved_at: status === "approved" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.status === "approved" ? "Comment approved" : "Comment rejected");
      qc.invalidateQueries({ queryKey: ["admin-blog-comments"] });
      qc.invalidateQueries({ queryKey: ["blog-comments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comment deleted");
      qc.invalidateQueries({ queryKey: ["admin-blog-comments"] });
      qc.invalidateQueries({ queryKey: ["blog-comments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusVariant = (s: AdminComment["status"]) =>
    s === "approved" ? "default" : s === "pending" ? "secondary" : "outline";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Comment moderation</h2>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CommentStatus)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && comments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No comments to review.
                </TableCell>
              </TableRow>
            )}
            {comments.map((c) => (
              <TableRow key={c.id} className="align-top">
                <TableCell className="text-sm">
                  <div className="font-medium">{c.author_name}</div>
                  <div className="text-xs text-muted-foreground break-all">{c.author_email}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                  /{c.post_slug}
                </TableCell>
                <TableCell className="text-sm max-w-md whitespace-pre-wrap">{c.body}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(c.created_at).toLocaleString("en-GB")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {c.status !== "approved" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Approve"
                        onClick={() => updateStatus.mutate({ id: c.id, status: "approved" })}
                      >
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    {c.status !== "rejected" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Reject"
                        onClick={() => updateStatus.mutate({ id: c.id, status: "rejected" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Delete"
                      onClick={() => {
                        if (confirm("Delete this comment permanently?")) del.mutate(c.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
