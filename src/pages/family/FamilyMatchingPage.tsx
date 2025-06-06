import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { useCaregiverMatches } from "@/hooks/useCaregiverMatches";
import { CaregiverMatchCard } from "@/components/family/CaregiverMatchCard";

const FamilyMatchingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMagicalMessage, setShowMagicalMessage] = useState(true);
  const { caregivers, isLoading: caregiverLoading, dataLoaded } = useCaregiverMatches(true); // Show only best match

  useEffect(() => {
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
  }, []);

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Caregiver Matching", path: "/family/matching" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 mt-8"
          >
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold">Finding Your Perfect Match</h1>
              
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
                    <p className="text-muted-foreground">
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
                    <p className="text-lg text-muted-foreground">
                      Reviewing caregiver profiles and availability...
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MatchingTracker matchingType="family" />
      
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mt-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Your Caregiver Matches</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've found carefully screened caregivers based on your specific care needs and preferences.
            </p>
          </div>

          {/* Premium Feature Notice */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Premium Matching Service</h3>
              </div>
              <p className="text-blue-800 mb-4">
                You're viewing a sample match. Unlock our full caregiver network with verified professionals, 
                background checks, and personalized matching based on your exact requirements.
              </p>
              <SubscriptionFeatureLink
                featureType="Full Caregiver Access"
                returnPath="/family/matching"
                referringPagePath="/family/matching"
                referringPageLabel="Caregiver Matching"
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
          ) : caregivers.length > 0 ? (
            <Card className="overflow-hidden">
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
                  caregiver={caregivers[0]}
                  returnPath="/family/matching"
                  referringPagePath="/family/matching"
                  referringPageLabel="Caregiver Matching"
                />
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
                    This is a preview of our matching capabilities. Premium members get access to our full network 
                    of verified caregivers, advanced filtering options, and unlimited matches based on your specific needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyMatchingPage;
