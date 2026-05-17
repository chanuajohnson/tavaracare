import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import chanuaAvatar from "@/assets/chanua-johnson.jpg";
import type { BlogPost } from "@/lib/blog/api";

export const BlogCard = ({ post }: { post: BlogPost }) => {
  const initials = (post.author_name || "C")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const avatarSrc = post.author_avatar_url || chanuaAvatar;

  return (
    <Link to={`/blog/${post.slug}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{post.category}</Badge>
            {post.reading_time && (
              <>
                <span>·</span>
                <span>{post.reading_time}</span>
              </>
            )}
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          <CardDescription>{post.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6 border border-border">
            <AvatarImage src={avatarSrc} alt={post.author_name} className="object-cover" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span>
            {post.published_at &&
              new Date(post.published_at).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
            · {post.author_name}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
};
