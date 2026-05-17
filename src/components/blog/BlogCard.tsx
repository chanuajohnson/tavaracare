import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/content/blog/posts";

export const BlogCard = ({ post }: { post: BlogPost }) => {
  return (
    <Link to={`/blog/${post.slug}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{post.category}</Badge>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          <CardDescription>{post.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          · {post.author}
        </CardContent>
      </Card>
    </Link>
  );
};
