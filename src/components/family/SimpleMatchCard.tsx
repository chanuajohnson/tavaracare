import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, MessageCircle, Users, Heart, Clock, MapPin as LocationIcon, Award } from "lucide-react";

interface EnhancedMatchData {
  overall_score: number;
  care_types_score: number;
  schedule_score: number;
  experience_score: number;
  location_score: number;
  match_explanation: string;
  care_match_details: string;
  schedule_match_details: string;
  location_match_details: string;
  experience_match_details: string;
}

interface Caregiver {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  years_of_experience: string | null;
  match_score: number;
  is_premium: boolean;
  enhanced_match_data?: EnhancedMatchData;
}

// Utility function to extract initials from full name
const getInitials = (fullName: string): string => {
  if (!fullName) return 'CG';
  
  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  if (nameParts.length === 0) return 'CG';
  
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  return nameParts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 3);
};

// Utility function to get score color
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-amber-600 bg-amber-50';
  return 'text-gray-600 bg-gray-50';
};

// Utility function to get score badge variant
const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'outline' => {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'outline';
};

interface SimpleMatchCardProps {
  caregiver: Caregiver;
  variant?: 'dashboard' | 'modal' | 'admin';
  onChatClick?: () => void;
  onViewDetails?: () => void;
  showChatButton?: boolean;
  isBestMatch?: boolean;
  className?: string;
}

export const SimpleMatchCard = ({ 
  caregiver,
  variant = 'dashboard',
  onChatClick,
  onViewDetails,
  showChatButton = true,
  isBestMatch = false,
  className = ""
}: SimpleMatchCardProps) => {
  const isCompact = variant === 'dashboard';
  const initials = getInitials(caregiver.full_name);
  const enhancedData = caregiver.enhanced_match_data;
  const displayScore = enhancedData?.overall_score || caregiver.match_score;
  
  return (
    <Card className={`relative ${caregiver.is_premium ? 'border-amber-300' : 'border-border'} ${className}`}>
      {/* Best Match Badge - Top Left */}
      {isBestMatch && (
        <div className="absolute -top-2 -left-2 z-20">
          <Badge className="bg-primary text-primary-foreground font-bold px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Best Match
          </Badge>
        </div>
      )}
      
      {/* Premium Badge - Top Right, mobile-first positioning */}
      {caregiver.is_premium && (
        <div className="absolute -top-2 right-2 z-10">
          <Badge className="bg-amber-500 text-white font-bold px-2 py-1 flex items-center gap-1 text-xs">
            <Award className="h-3 w-3" />
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
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {!isCompact && (
              <div className="mt-2 text-center">
                <div className={`rounded px-2 py-1 ${getScoreColor(displayScore)}`}>
                  <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>
                    {displayScore}% Match
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold`}>
                {initials}
              </h3>
              {isCompact && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${getScoreColor(displayScore)}`}>
                  {displayScore}% Match
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
            
            {/* Enhanced Match Explanation */}
            {enhancedData?.match_explanation && !isCompact && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {enhancedData.match_explanation}
                </div>
                
                {/* Score Breakdown */}
                <div className="flex flex-wrap gap-1">
                  {enhancedData.care_types_score > 0 && (
                    <Badge 
                      variant={getScoreBadgeVariant(enhancedData.care_types_score)} 
                      className="text-xs flex items-center gap-1"
                    >
                      <Heart className="h-3 w-3" />
                      Care {enhancedData.care_types_score}%
                    </Badge>
                  )}
                  {enhancedData.schedule_score > 0 && (
                    <Badge 
                      variant={getScoreBadgeVariant(enhancedData.schedule_score)} 
                      className="text-xs flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      Schedule {enhancedData.schedule_score}%
                    </Badge>
                  )}
                  {enhancedData.experience_score > 0 && (
                    <Badge 
                      variant={getScoreBadgeVariant(enhancedData.experience_score)} 
                      className="text-xs flex items-center gap-1"
                    >
                      <Award className="h-3 w-3" />
                      Experience {enhancedData.experience_score}%
                    </Badge>
                  )}
                  {enhancedData.location_score > 0 && (
                    <Badge 
                      variant={getScoreBadgeVariant(enhancedData.location_score)} 
                      className="text-xs flex items-center gap-1"
                    >
                      <LocationIcon className="h-3 w-3" />
                      Location {enhancedData.location_score}%
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {!isCompact && !enhancedData?.match_explanation && (
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
            <div className={`flex ${isCompact ? 'flex-col gap-1' : 'flex-col justify-center gap-2'} ${isCompact ? 'w-20' : 'w-32'} relative z-30`}>
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