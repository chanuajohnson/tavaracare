import { useState } from "react";
import { Star, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  familyName: string;
  relationship?: string;
  content: string;
  rating?: number;
  carePeriodStart?: string;
  carePeriodEnd?: string;
  isVerified?: boolean;
  className?: string;
}

export const TestimonialCard = ({
  familyName,
  relationship,
  content,
  rating,
  carePeriodStart,
  carePeriodEnd,
  isVerified = false,
  className,
}: TestimonialCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > 150;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.slice(0, 150) + "..." 
    : content;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const carePeriod = carePeriodStart 
    ? `${formatDate(carePeriodStart)}${carePeriodEnd ? ` - ${formatDate(carePeriodEnd)}` : " - Present"}`
    : null;

  return (
    <Card className={cn("border-border/50 bg-card", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Header with name and verification */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground">{familyName}</p>
            {relationship && (
              <p className="text-sm text-muted-foreground">{relationship}</p>
            )}
          </div>
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Star Rating */}
        {rating && (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                )}
              />
            ))}
          </div>
        )}

        {/* Testimonial Content */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          "{displayContent}"
        </p>

        {/* Read More Button */}
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-primary hover:text-primary/80"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}

        {/* Care Period Badge */}
        {carePeriod && (
          <div className="pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Care period: {carePeriod}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
