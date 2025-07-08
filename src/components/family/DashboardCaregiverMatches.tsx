
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles, Calendar, MessageCircle } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { useCaregiverMatches } from "@/hooks/useCaregiverMatches";
import { CaregiverMatchCard } from "./CaregiverMatchCard";
import { CaregiverChatModal } from "./CaregiverChatModal";
import { CaregiverMatchingModal } from "./CaregiverMatchingModal";

export const DashboardCaregiverMatches = () => {
  const { user } = useAuth();
  const { caregivers, isLoading: hookLoading } = useCaregiverMatches(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  
  // Single loading state that ensures consistent behavior
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      
      // Set minimum loading time of 2.5 seconds to prevent flashing
      // This ensures we don't show content until the timer completes
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);

      return () => clearTimeout(loadingTimer);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const bestMatch = caregivers[0];

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
    <>
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Your Caregiver Match
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </CardTitle>
            <p className="text-sm text-gray-500">
              1 caregiver matches your care needs and schedule
            </p>
          </div>
          <SubscriptionFeatureLink
            featureType="Premium Match Features"
            returnPath="/family/matching"
            referringPagePath="/dashboard/family"
            referringPageLabel="Family Dashboard"
            variant="default"
          >
            <span>View All Matches</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </SubscriptionFeatureLink>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-8 space-y-4">
              {/* Magical loading with sparkles */}
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-blue-500 animate-pulse" />
                <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-purple-500 animate-pulse delay-150" />
                <Sparkles className="absolute top-1/2 -left-3 h-2 w-2 text-pink-500 animate-pulse delay-300" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-blue-600">
                  Finding your perfect match! ✨
                </p>
                <p className="text-sm text-gray-600">
                  Analyzing caregivers and schedule compatibility...
                </p>
              </div>
            </div>
          ) : bestMatch ? (
            <div className="space-y-4">
              <CaregiverMatchCard
                caregiver={bestMatch}
                returnPath="/family/matching"
                referringPagePath="/dashboard/family"
                referringPageLabel="Family Dashboard"
                showUnlockButton={false}
                onStartChat={() => setShowChatModal(true)}
              />
              
              {/* Enhanced compatibility display */}
              {bestMatch.shift_compatibility_score !== undefined && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Schedule Compatibility
                    </span>
                    <span className={`text-sm font-bold ${getCompatibilityColor(bestMatch.shift_compatibility_score)}`}>
                      {getCompatibilityIcon(bestMatch.shift_compatibility_score)} {bestMatch.shift_compatibility_score}%
                    </span>
                  </div>
                  {bestMatch.match_explanation && (
                    <p className="text-xs text-blue-700">{bestMatch.match_explanation}</p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => setShowChatModal(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Match
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowMatchingModal(true)}
                >
                  View Full Match
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600">No Matches Found</h3>
              <p className="text-gray-500 mt-2 mb-4">
                Complete your care assessment to get personalized caregiver matches.
              </p>
              <Button variant="outline" onClick={() => setShowMatchingModal(true)}>
                Find Matches
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Modal */}
      {bestMatch && (
        <CaregiverChatModal
          open={showChatModal}
          onOpenChange={setShowChatModal}
          caregiver={bestMatch}
        />
      )}

      {/* Matching Modal */}
      <CaregiverMatchingModal
        open={showMatchingModal}
        onOpenChange={setShowMatchingModal}
        referringPagePath="/dashboard/family"
        referringPageLabel="Family Dashboard"
      />
    </>
  );
};
