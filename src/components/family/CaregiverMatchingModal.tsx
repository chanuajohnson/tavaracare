import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, Sparkles, Users, X } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { useCaregiverMatches } from "@/hooks/useCaregiverMatches";
import { CaregiverMatchCard } from "./CaregiverMatchCard";
import { CaregiverProfileModal } from "./CaregiverProfileModal";

interface CaregiverMatchingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referringPagePath?: string;
  referringPageLabel?: string;
}

export const CaregiverMatchingModal = ({ 
  open, 
  onOpenChange,
  referringPagePath = "/dashboard/family",
  referringPageLabel = "Family Dashboard"
}: CaregiverMatchingModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMagicalMessage, setShowMagicalMessage] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { caregivers, isLoading: caregiverLoading, dataLoaded } = useCaregiverMatches(true);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setShowMagicalMessage(true);
      
      // Show the magical loading for 3 seconds, then show the caregiver
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      // Hide the magical message after 2 seconds but keep loading
      const messageTimer = setTimeout(() => {
        setShowMagicalMessage(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }
  }, [open]);

  const bestMatch = caregivers[0];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50">
          <MatchingTracker 
            matchingType="caregiver" 
            additionalData={{
              referrer: referringPagePath,
              access_type: 'modal_view',
              shown_matches: 1
            }}
          />
          
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold text-primary-900">
              Your Caregiver Match
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              We found your ideal caregiver match based on your care needs and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="text-center space-y-6 py-8">
                  <div className="flex flex-col items-center space-y-6">
                    {/* Magical loading circle with sparkles */}
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                      <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-blue-500 animate-pulse" />
                      <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-purple-500 animate-pulse delay-150" />
                      <Sparkles className="absolute top-1/2 -left-4 h-3 w-3 text-pink-500 animate-pulse delay-300" />
                    </div>
                    
                    {showMagicalMessage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center space-y-2"
                      >
                        <p className="text-xl font-semibold text-blue-600">
                          Hold on, we are finding your perfect match! ✨
                        </p>
                        <p className="text-gray-600">
                          Analyzing your care needs and preferences...
                        </p>
                      </motion.div>
                    )}
                    
                    {!showMagicalMessage && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center space-y-2"
                      >
                        <p className="text-lg text-gray-600">
                          Reviewing caregiver profiles and availability...
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Premium Feature Notice */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="h-6 w-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-900">Premium Matching Service</h3>
                    </div>
                    <p className="text-blue-800 mb-4">
                      You're viewing your best match. Unlock our full caregiver network with verified professionals, 
                      background checks, and personalized matching based on your exact requirements.
                    </p>
                    <SubscriptionFeatureLink
                      featureType="Full Caregiver Access"
                      returnPath="/family/matching"
                      referringPagePath={referringPagePath}
                      referringPageLabel={referringPageLabel}
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Unlock All Matches
                      </Button>
                    </SubscriptionFeatureLink>
                  </CardContent>
                </Card>

                {/* Caregiver Match */}
                {caregiverLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : bestMatch ? (
                  <Card className="overflow-hidden bg-white">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">Your Perfect Match</CardTitle>
                          <CardDescription className="text-base">Recommended based on your care needs</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <CaregiverMatchCard
                        caregiver={bestMatch}
                        returnPath="/family/matching"
                        referringPagePath={referringPagePath}
                        referringPageLabel={referringPageLabel}
                        showUnlockButton={false}
                      />
                      
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button 
                          variant="default" 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => setShowProfileModal(true)}
                        >
                          View Full Profile
                        </Button>
                        
                        <SubscriptionFeatureLink
                          featureType="Premium Match Features"
                          returnPath="/family/matching"
                          referringPagePath={referringPagePath}
                          referringPageLabel={referringPageLabel}
                          variant="outline"
                          className="w-full"
                        >
                          Browse All Matches
                        </SubscriptionFeatureLink>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No caregiver matches found</p>
                  </div>
                )}

                {/* Why Only One Match Notice */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900 mb-1">Why am I seeing only one match?</h4>
                        <p className="text-sm text-amber-800">
                          This is your perfect match based on compatibility. Premium members get access to our full network 
                          of verified caregivers, advanced filtering options, and unlimited matches based on your specific needs.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      {bestMatch && (
        <CaregiverProfileModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          caregiver={bestMatch}
        />
      )}
    </>
  );
};
