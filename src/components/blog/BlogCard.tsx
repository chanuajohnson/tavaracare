import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import chanuaAvatar from "@/assets/chanua-johnson.jpg";
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
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6 border border-border">
            <AvatarImage src={chanuaAvatar} alt="Chanua Johnson" className="object-cover" />
            <AvatarFallback>CJ</AvatarFallback>
          </Avatar>
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · Chanua Johnson
          </span>
        </CardContent>
      </Card>
    </Link>
  );
};
