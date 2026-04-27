import { Star, MapPin, Award, MessageCircle, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UrgentBadge } from "./UrgentBadge";
import { cn } from "@/lib/utils";

interface SpotlightCaregiverCardProps {
  id: string;
  name: string;
  firstName?: string;
  avatarUrl?: string;
  headline: string;
  description?: string;
  specialties?: string[];
  location?: string;
  yearsOfExperience?: string;
  averageRating?: number;
  testimonialCount?: number;
  urgencyLevel?: "high" | "medium" | "low";
  onViewDetails?: (id: string) => void;
  onWhatsAppChat?: (id: string) => void;
  className?: string;
}

export const SpotlightCaregiverCard = ({
  id,
  name,
  firstName,
  avatarUrl,
  headline,
  description,
  specialties = [],
  location,
  yearsOfExperience,
  averageRating,
  testimonialCount = 0,
  urgencyLevel = "high",
  onViewDetails,
  onWhatsAppChat,
  className,
}: SpotlightCaregiverCardProps) => {
  // Use firstName if available, otherwise extract from name
  const displayName = firstName || name.split(" ")[0] || "Caregiver";
  // Get both initials from full name (e.g., "Carlene Williams" → "CW")
  const nameParts = name.split(" ");
  const initials = nameParts.length >= 2 
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : name[0]?.toUpperCase() || "C";

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
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="p-6 pt-3 space-y-4">
          {/* Name as primary identifier */}
          <div>
            <h3 className="font-semibold text-lg text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground">{headline}</p>
          </div>

          {/* Location and Experience */}
          <div className="space-y-1.5">
            {location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </div>
            )}
            {yearsOfExperience && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                {yearsOfExperience} of caregiving experience
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
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

          {/* Status badges */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Available to be matched now
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Award className="h-3.5 w-3.5 text-primary" />
              Verified Professional
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails?.(id)}
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onWhatsAppChat?.(id)}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
