import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, MessageCircle, Video, MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { useFamilyMatches } from '@/hooks/useFamilyMatches';

interface ProfessionalFamilyMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatWithFamily?: (family: any) => void;
}

export const ProfessionalFamilyMatchModal = ({ 
  open, 
  onOpenChange,
  onChatWithFamily 
}: ProfessionalFamilyMatchModalProps) => {
  const { families, isLoading: hookLoading } = useFamilyMatches(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      
      // Set minimum loading time of 2.5 seconds for magical loading experience
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);

      return () => clearTimeout(loadingTimer);
    }
  }, [open]);

  const bestMatch = families[0];

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return "🟢";
    if (score >= 60) return "🟡";
    return "🔴";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Your Perfect Family Match
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-12 space-y-4">
              {/* Magical loading with sparkles */}
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-blue-500 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-purple-500 animate-pulse delay-150" />
                <Sparkles className="absolute top-1/2 -left-4 h-3 w-3 text-pink-500 animate-pulse delay-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-blue-600">
                  Finding your perfect family match! ✨
                </p>
                <p className="text-sm text-gray-600">
                  Analyzing family needs and your expertise...
                </p>
              </div>
            </div>
          ) : bestMatch ? (
            <div className="space-y-6">
              {/* Family Match Card */}
              <Card className={`border-2 ${bestMatch.is_premium ? 'border-amber-300' : 'border-primary/20'} relative`}>
                {bestMatch.is_premium && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
                      Premium
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={bestMatch.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                        F
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Family Member</h3>
                      <div className="text-xs text-blue-600 mt-1">
                        * Name protected until connected
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        ID: {bestMatch.id?.substring(0, 8) || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{bestMatch.location}</span>
                        <span className="text-gray-300">•</span>
                        <span>{bestMatch.distance.toFixed(1)} km away</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary-50 rounded-lg px-3 py-2">
                        <span className="text-lg font-bold text-primary-700">{bestMatch.match_score}%</span>
                        <p className="text-xs text-primary-600">Match</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{bestMatch.care_schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>{bestMatch.budget_preferences || 'Budget not specified'}</span>
                    </div>
                  </div>

                  {/* Schedule Compatibility */}
                  {bestMatch.shift_compatibility_score !== undefined && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Schedule Compatibility</span>
                        <span className={`text-sm font-bold ${getCompatibilityColor(bestMatch.shift_compatibility_score)}`}>
                          {getCompatibilityIcon(bestMatch.shift_compatibility_score)} {bestMatch.shift_compatibility_score}%
                        </span>
                      </div>
                      {bestMatch.match_explanation && (
                        <p className="text-xs text-blue-700">{bestMatch.match_explanation}</p>
                      )}
                    </div>
                  )}

                  {/* Care Needs */}
                  <div>
                    <span className="font-medium block mb-2">Care Needs:</span>
                    <div className="flex flex-wrap gap-2">
                      {bestMatch.care_types?.map((type, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-50">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Special Needs */}
                  {bestMatch.special_needs && bestMatch.special_needs.length > 0 && (
                    <div>
                      <span className="font-medium block mb-2">Special Needs:</span>
                      <div className="flex flex-wrap gap-2">
                        {bestMatch.special_needs?.map((need, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {need}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-4 w-4 text-amber-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">Excellent family rating</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  variant="default" 
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    if (onChatWithFamily) {
                      onChatWithFamily(bestMatch);
                    }
                    onOpenChange(false);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Conversation
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Video className="h-4 w-4" />
                  Video Calls Enabled
                </Button>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💙 This family is looking for exactly your type of expertise. 
                  Video calls are enabled to help you stand out and connect more personally with families.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600">No Family Matches Found</h3>
              <p className="text-gray-500 mt-2">
                Complete your professional profile to get matched with families.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
