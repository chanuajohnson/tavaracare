import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, MessageCircle, Users, Heart, Clock, MapPin as LocationIcon, Shield, Award, DollarSign, Calendar, FileCheck, Languages } from "lucide-react";

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
  // Extended professional information
  professional_type?: string;
  certifications?: string[];
  specialized_care?: string[];
  hourly_rate?: number;
  work_type?: string;
  care_schedule?: string;
  custom_schedule?: string;
  bio?: string;
  languages?: string[];
  background_check?: boolean;
  insurance_coverage?: boolean;
  transportation_available?: boolean;
  commute_mode?: string;
  additional_notes?: string;
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
  
  // Format hourly rate display
  const formatRate = (rate?: number) => {
    if (!rate) return null;
    return `$${rate}/hr`;
  };
  
  // Get professional credentials display
  const getProfessionalDisplay = () => {
    if (caregiver.professional_type) {
      // Transform common professional types
      const type = caregiver.professional_type.toLowerCase();
      if (type === 'gapp') return 'GAPP Certified';
      if (type === 'cna') return 'Certified Nursing Assistant';
      if (type === 'rn') return 'Registered Nurse';
      if (type === 'lpn') return 'Licensed Practical Nurse';
      return caregiver.professional_type.toUpperCase();
    }
    return "Professional Caregiver";
  };
  
  // Parse care schedule into readable format
  const getAvailabilityDisplay = () => {
    if (!caregiver.care_schedule) return null;
    
    const schedule = caregiver.care_schedule.toLowerCase();
    const parts = schedule.split(',').map(s => s.trim());
    const readable = parts.map(part => {
      if (part === 'flexible') return 'Flexible';
      if (part.includes('mon_fri_6am_6pm')) return 'Weekdays 6AM-6PM';
      if (part.includes('mon_fri_8am_4pm')) return 'Weekdays 8AM-4PM';
      if (part.includes('sat_sun_6am_6pm')) return 'Weekends 6AM-6PM';
      if (part.includes('evening')) return 'Evening shifts';
      if (part.includes('24_7')) return '24/7 available';
      return part.replace(/_/g, ' ').replace(/am|pm/gi, match => match.toUpperCase());
    });
    
    return readable.slice(0, 2).join(', ') + (readable.length > 2 ? ` +${readable.length - 2} more` : '');
  };
  
  return (
    <Card className={`relative border-border ${className}`}>
      {/* Best Match Badge - Top Left */}
      {isBestMatch && (
        <div className="absolute -top-2 -left-2 z-20">
          <Badge className="bg-primary text-primary-foreground font-bold px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Best Match
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
              <div className="mt-2 text-center space-y-1">
                <div className={`rounded px-2 py-1 ${getScoreColor(displayScore)}`}>
                  <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>
                    {displayScore}% Match
                  </span>
                </div>
                
                {/* Hourly Rate */}
                {caregiver.hourly_rate && (
                  <div className="bg-green-50 text-green-700 rounded px-2 py-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatRate(caregiver.hourly_rate)}
                    </span>
                  </div>
                )}
                
                {/* Verification Badges */}
                <div className="flex justify-center gap-1">
                  {caregiver.background_check && (
                    <div className="bg-blue-50 text-blue-700 rounded p-1" title="Background Check Verified">
                      <Shield className="h-3 w-3" />
                    </div>
                  )}
                  {caregiver.certifications && caregiver.certifications.length > 0 && (
                    <div className="bg-purple-50 text-purple-700 rounded p-1" title="Certified Professional">
                      <Award className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold`}>
                  {getProfessionalDisplay()}
                </h3>
                <div className="text-xs text-blue-600">
                  * Name protected until subscription
                </div>
              </div>
              {isCompact && (
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getScoreColor(displayScore)}`}>
                    {displayScore}% Match
                  </span>
                  {caregiver.hourly_rate && (
                    <span className="text-xs font-medium text-green-600">
                      {formatRate(caregiver.hourly_rate)}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className={`flex items-center gap-1 ${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                <MapPin className="h-3 w-3" />
                <span>{caregiver.location}</span>
              </div>
              
              <div className={`${isCompact ? 'text-xs' : 'text-sm'}`}>
                <span className="font-medium">Experience:</span> {caregiver.years_of_experience}
              </div>
              
              {/* Professional Credentials */}
              {caregiver.certifications && caregiver.certifications.length > 0 && (
                <div className={`${isCompact ? 'text-xs' : 'text-sm'}`}>
                  <span className="font-medium">Certified:</span>{' '}
                  {caregiver.certifications.slice(0, 2).join(', ')}
                  {caregiver.certifications.length > 2 && ` +${caregiver.certifications.length - 2} more`}
                </div>
              )}
              
              {/* Work Type */}
              {caregiver.work_type && (
                <div className={`${isCompact ? 'text-xs' : 'text-sm'}`}>
                  <span className="font-medium">Type:</span> {caregiver.work_type}
                </div>
              )}
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
                      <Star className="h-3 w-3" />
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
            
            {/* Care Specialties and Services */}
            {!isCompact && !enhancedData?.match_explanation && (
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium block">Care Specialties:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
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
                
                {/* Medical Specializations */}
                {caregiver.specialized_care && caregiver.specialized_care.length > 0 && (
                  <div>
                    <span className="text-sm font-medium block">Medical Expertise:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {caregiver.specialized_care.slice(0, 2).map((spec, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {caregiver.specialized_care.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{caregiver.specialized_care.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Languages */}
                {caregiver.languages && caregiver.languages.length > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Languages className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {caregiver.languages.slice(0, 2).join(', ')}
                      {caregiver.languages.length > 2 && ` +${caregiver.languages.length - 2} more`}
                    </span>
                  </div>
                )}
                
                {/* Schedule Availability */}
                {getAvailabilityDisplay() && (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {getAvailabilityDisplay()}
                    </span>
                  </div>
                )}
                
                {/* Transportation */}
                {caregiver.commute_mode && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Transportation: {caregiver.commute_mode}
                    </span>
                  </div>
                )}
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
        
        {isCompact && (
          <div className="mt-3 pt-3 border-t space-y-2">
            {/* Care Types */}
            {caregiver.care_types && (
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
            )}
            
            {/* Compact verification and rate info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {caregiver.background_check && (
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span>Verified</span>
                  </div>
                )}
                {caregiver.certifications && caregiver.certifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-purple-600" />
                    <span>Certified</span>
                  </div>
                )}
              </div>
              
              {caregiver.hourly_rate && (
                <span className="font-medium text-green-600">
                  {formatRate(caregiver.hourly_rate)}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};