import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Eye, EyeOff, Trash2, Copy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BlogCommentsModeration } from "@/components/admin/BlogCommentsModeration";
import {
  useAllPosts,
  useDeletePost,
  useToggleHide,
  useSavePost,
  type BlogStatus,
  type BlogPost,
} from "@/lib/blog/api";

const statusVariant = (s: BlogStatus): "default" | "secondary" | "outline" | "destructive" => {
  if (s === "published") return "default";
  if (s === "scheduled") return "secondary";
  if (s === "hidden") return "outline";
  return "secondary";
};

export default function AdminBlogPage() {
  const { user, userRole, isLoading } = useAuth();
  const isAdmin = userRole === "admin";
  const navigate = useNavigate();
  const { data: posts = [], isLoading: postsLoading } = useAllPosts();
  const del = useDeletePost();
  const toggle = useToggleHide();
  const save = useSavePost();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category))).sort(),
    [posts],
  );

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [posts, search, statusFilter, categoryFilter]);

  if (isLoading) return <div className="container py-12">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleDuplicate = async (p: BlogPost) => {
    await save.mutateAsync({
      slug: `${p.slug}-copy-${Date.now().toString(36)}`,
      title: `${p.title} (Copy)`,
      description: p.description,
      body: p.body,
      category: p.category,
      reading_time: p.reading_time,
      author_name: p.author_name,
      author_role: p.author_role,
      author_avatar_url: p.author_avatar_url,
      cover_image_url: p.cover_image_url,
      cta_label: p.cta_label,
      cta_href: p.cta_href,
      faqs: p.faqs,
      status: "draft",
      published_at: null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Admin", path: "/dashboard/admin" },
          { label: "Blog", path: "/admin/blog" },
        ]}
      />
      <div className="container max-w-7xl py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">
              Write, edit, schedule, hide, and publish posts.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/blog/analytics")}>
              View leaderboard
            </Button>
            <Button onClick={() => navigate("/admin/blog/new")}>
              <Plus className="h-4 w-4 mr-2" /> New post
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postsLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!postsLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No posts match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium max-w-xs">
                    <Link to={`/admin/blog/${p.id}`} className="hover:underline">
                      {p.title}
                    </Link>
                    <div className="text-xs text-muted-foreground truncate">/{p.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{p.category}</TableCell>
                  <TableCell className="text-sm">{p.author_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString("en-GB")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Edit"
                        onClick={() => navigate(`/admin/blog/${p.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title={p.status === "hidden" ? "Make live" : "Hide"}
                        onClick={() => toggle.mutate({ id: p.id, status: p.status })}
                      >
                        {p.status === "hidden" ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Duplicate"
                        onClick={() => handleDuplicate(p)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Delete"
                        onClick={() => setConfirmDelete(p)}
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

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.title}" will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) del.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
