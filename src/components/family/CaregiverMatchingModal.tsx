
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, Sparkles, Users } from "lucide-react";
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

const MAGICAL_MESSAGES = [
  { text: "Hold on, we are finding your perfect match! ✨", subtext: "Analyzing your care needs and preferences..." },
  { text: "Reviewing caregiver profiles in your area 🔍", subtext: "Checking availability and experience..." },
  { text: "Almost there! Matching you with the best caregiver 🎯", subtext: "Ensuring the perfect fit for your family..." }
];

export const CaregiverMatchingModal = ({ 
  open, 
  onOpenChange,
  referringPagePath = "/dashboard/family",
  referringPageLabel = "Family Dashboard"
}: CaregiverMatchingModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { caregivers, isLoading: caregiverLoading, dataLoaded } = useCaregiverMatches(true);

  useEffect(() => {
    if (open) {
      console.log('CaregiverMatchingModal opened');
      setIsLoading(true);
      setCurrentMessageIndex(0);
      
      // Cycle through magical messages every 1.5 seconds
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % MAGICAL_MESSAGES.length);
      }, 1500);

      // Show the magical loading for 4.5 seconds total (3 messages) - SAME AS PAGE
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        console.log('CaregiverMatchingModal loading complete');
      }, 4500);

      return () => {
        clearInterval(messageInterval);
        clearTimeout(loadingTimer);
      };
    }
  }, [open]);

  const bestMatch = caregivers[0];
  const currentMessage = MAGICAL_MESSAGES[currentMessageIndex];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50">
          <MatchingTracker 
            matchingType="caregiver" 
            additionalData={{
              referrer: referringPagePath,
              access_type: 'modal_view',
              shown_matches: caregivers.length
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
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-6 py-12">
                    <div className="flex flex-col items-center space-y-6">
                      {/* Enhanced magical loading circle with more sparkles */}
                      <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
                        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-blue-500 animate-pulse" />
                        <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-purple-500 animate-pulse delay-150" />
                        <Sparkles className="absolute top-1/2 -left-4 h-4 w-4 text-pink-500 animate-pulse delay-300" />
                        <Sparkles className="absolute top-1/4 -right-3 h-3 w-3 text-green-500 animate-pulse delay-450" />
                        <Sparkles className="absolute bottom-1/4 -left-3 h-3 w-3 text-yellow-500 animate-pulse delay-600" />
                      </div>
                      
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentMessageIndex}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="text-center space-y-2"
                        >
                          <p className="text-2xl font-semibold text-blue-600">
                            {currentMessage.text}
                          </p>
                          <p className="text-lg text-gray-600">
                            {currentMessage.subtext}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
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

                  {/* Caregiver Match - Only show when we have data and magical loading is done */}
                  {bestMatch ? (
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
            </AnimatePresence>
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
