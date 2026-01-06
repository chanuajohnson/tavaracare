import { Star, MapPin, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UrgentBadge } from "./UrgentBadge";
import { cn } from "@/lib/utils";

interface SpotlightCaregiverCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  headline: string;
  description?: string;
  specialties?: string[];
  location?: string;
  averageRating?: number;
  testimonialCount?: number;
  urgencyLevel?: "high" | "medium" | "low";
  onViewProfile?: (id: string) => void;
  onRequest?: (id: string) => void;
  className?: string;
}

export const SpotlightCaregiverCard = ({
  id,
  name,
  avatarUrl,
  headline,
  description,
  specialties = [],
  location,
  averageRating,
  testimonialCount = 0,
  urgencyLevel = "high",
  onViewProfile,
  onRequest,
  className,
}: SpotlightCaregiverCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card hover:shadow-lg transition-shadow", className)}>
      <CardContent className="p-0">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 pb-12">
          <div className="flex justify-between items-start">
            <UrgentBadge urgencyLevel={urgencyLevel} />
            {averageRating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{averageRating.toFixed(1)}</span>
                {testimonialCount > 0 && (
                  <span className="text-muted-foreground">({testimonialCount})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Avatar overlapping header and content */}
        <div className="relative px-6 -mt-8">
          <Avatar className="h-16 w-16 border-4 border-background shadow-md">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="p-6 pt-3 space-y-4">
          {/* Name and headline */}
          <div>
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-primary font-medium">{headline}</p>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </div>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {specialties.slice(0, 4).map((specialty) => (
                <Badge
                  key={specialty}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {specialty}
                </Badge>
              ))}
              {specialties.length > 4 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{specialties.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Verified badge */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-primary" />
            Verified Professional
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewProfile?.(id)}
            >
              View Profile
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onRequest?.(id)}
            >
              Request
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
