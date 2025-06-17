
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { useCaregiverMatches } from "@/hooks/useCaregiverMatches";
import { CaregiverMatchCard } from "./CaregiverMatchCard";
import { CaregiverProfileModal } from "./CaregiverProfileModal";
import { CaregiverMatchingModal } from "./CaregiverMatchingModal";

export const DashboardCaregiverMatches = () => {
  const { user } = useAuth();
  const { caregivers, isLoading, dataLoaded } = useCaregiverMatches(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);

  if (!user) {
    return null;
  }

  const bestMatch = caregivers[0];

  return (
    <>
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Your Caregiver Match</CardTitle>
            <p className="text-sm text-gray-500">
              {caregivers.length} caregiver{caregivers.length !== 1 ? 's' : ''} match{caregivers.length === 1 ? 'es' : ''} your care needs
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
                  Analyzing caregivers in your area...
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
                onUnlockProfile={() => setShowProfileModal(true)}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => setShowProfileModal(true)}
                >
                  Unlock Profile
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

      {/* Profile Modal */}
      {bestMatch && (
        <CaregiverProfileModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
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
