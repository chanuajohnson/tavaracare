import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, MessageCircle, Users } from "lucide-react";

interface Caregiver {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  years_of_experience: string | null;
  match_score: number;
  is_premium: boolean;
}

interface SimpleMatchCardProps {
  caregiver: Caregiver;
  variant?: 'dashboard' | 'modal' | 'admin';
  onChatClick?: () => void;
  onViewDetails?: () => void;
  showChatButton?: boolean;
  className?: string;
}

export const SimpleMatchCard = ({ 
  caregiver,
  variant = 'dashboard',
  onChatClick,
  onViewDetails,
  showChatButton = true,
  className = ""
}: SimpleMatchCardProps) => {
  const isCompact = variant === 'dashboard';
  
  return (
    <Card className={`relative ${caregiver.is_premium ? 'border-amber-300' : 'border-border'} ${className}`}>
      {caregiver.is_premium && (
        <div className="absolute top-0 right-0">
          <Badge className="bg-amber-500 text-white font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
            Premium
          </Badge>
        </div>
      )}
      
      <CardContent className={`${isCompact ? 'p-4' : 'p-6'}`}>
        <div className={`flex ${isCompact ? 'gap-3' : 'gap-4'} ${isCompact ? 'flex-row' : 'flex-col sm:flex-row'}`}>
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <Avatar className={`${isCompact ? 'h-12 w-12' : 'h-16 w-16'} border-2 border-primary/20`}>
              <AvatarImage src={caregiver.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Users className={`${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`} />
              </AvatarFallback>
            </Avatar>
            
            {!isCompact && (
              <div className="mt-2 text-center">
                <div className="bg-primary/10 rounded px-2 py-1">
                  <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-primary`}>
                    {caregiver.match_score}% Match
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold`}>
                Professional Caregiver
              </h3>
              {isCompact && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                  {caregiver.match_score}% Match
                </span>
              )}
            </div>
            
            <div className={`flex items-center gap-1 ${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              <MapPin className="h-3 w-3" />
              <span>{caregiver.location}</span>
            </div>
            
            <div className={`${isCompact ? 'text-xs' : 'text-sm'}`}>
              <span className="font-medium">Experience:</span> {caregiver.years_of_experience}
            </div>
            
            {!isCompact && (
              <div className="space-y-1">
                <span className="text-sm font-medium block">Specialties:</span>
                <div className="flex flex-wrap gap-1">
                  {caregiver.care_types?.slice(0, 3).map((type, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-muted">
                      {type}
                    </Badge>
                  ))}
                  {caregiver.care_types && caregiver.care_types.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-muted">
                      +{caregiver.care_types.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {!isCompact && (
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="h-3 w-3 text-amber-400 fill-current" />
                ))}
              </div>
            )}
          </div>
          
          {/* Actions Section */}
          {(showChatButton || onViewDetails) && (
            <div className={`flex ${isCompact ? 'flex-col gap-1' : 'flex-col justify-center gap-2'} ${isCompact ? 'w-20' : 'w-32'}`}>
              {showChatButton && onChatClick && (
                <Button
                  size={isCompact ? "sm" : "default"}
                  onClick={onChatClick}
                  className="w-full"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {isCompact ? "Chat" : "Chat"}
                </Button>
              )}
              
              {onViewDetails && (
                <Button
                  size={isCompact ? "sm" : "default"}
                  variant="outline"
                  onClick={onViewDetails}
                  className="w-full"
                >
                  {isCompact ? "View" : "Details"}
                </Button>
              )}
            </div>
          )}
        </div>
        
        {isCompact && caregiver.care_types && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1">
              {caregiver.care_types.slice(0, 2).map((type, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-muted">
                  {type}
                </Badge>
              ))}
              {caregiver.care_types.length > 2 && (
                <Badge variant="outline" className="text-xs bg-muted">
                  +{caregiver.care_types.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};