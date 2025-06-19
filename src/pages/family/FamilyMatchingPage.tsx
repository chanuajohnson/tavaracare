
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, MessageCircle } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { useCaregiverMatches } from "@/hooks/useCaregiverMatches";
import { CaregiverMatchCard } from "@/components/family/CaregiverMatchCard";
import { CaregiverChatModal } from "@/components/family/CaregiverChatModal";

const MAGICAL_MESSAGES = [
  { text: "Hold on, we are finding your perfect match! ✨", subtext: "Analyzing your care needs and preferences..." },
  { text: "Reviewing caregiver profiles in your area 🔍", subtext: "Checking availability and experience..." },
  { text: "Almost there! Matching you with the best caregiver 🎯", subtext: "Ensuring the perfect fit for your family..." }
];

const FamilyMatchingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const { caregivers, dataLoaded } = useCaregiverMatches(true); // Show only best match

  useEffect(() => {
    console.log('FamilyMatchingPage loaded');
    setIsLoading(true);
    setCurrentMessageIndex(0);
    
    // Cycle through magical messages every 1.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % MAGICAL_MESSAGES.length);
    }, 1500);

    // Show the magical loading for 4.5 seconds total (3 messages)
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      console.log('FamilyMatchingPage loading complete');
    }, 4500);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(loadingTimer);
    };
  }, []);

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Caregiver Matching", path: "/family/matching" },
  ];

  const bestMatch = caregivers[0]; // Get the single best match
  const currentMessage = MAGICAL_MESSAGES[currentMessageIndex];

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
            <div className="text-center space-y-6 py-12">
              <h1 className="text-3xl font-bold">Finding Your Perfect Match</h1>
              
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
            <h1 className="text-3xl font-bold">Your Perfect Caregiver Match</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've found a carefully screened caregiver based on your specific care needs and preferences.
            </p>
          </div>

          {/* Premium Feature Notice */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Premium Matching Service 💬</h3>
              </div>
              <p className="text-blue-800 mb-4">
                Start a TAV-moderated conversation with your match! Get 3 messages per day to learn about their 
                experience and approach. Upgrade for unlimited messaging and direct contact information.
              </p>
              <SubscriptionFeatureLink
                featureType="Full Caregiver Access"
                returnPath="/family/matching"
                referringPagePath="/family/matching"
                referringPageLabel="Caregiver Matching"
              >
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Unlock Unlimited Messaging
                </Button>
              </SubscriptionFeatureLink>
            </CardContent>
          </Card>

          {/* Caregiver Match - Only show when magical loading is done */}
          {bestMatch ? (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Your Perfect Match</CardTitle>
                    <CardDescription className="text-base">Start chatting to learn more about their experience</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <CaregiverMatchCard
                  caregiver={bestMatch}
                  returnPath="/family/matching"
                  referringPagePath="/family/matching"
                  referringPageLabel="Caregiver Matching"
                  showUnlockButton={false}
                  onStartChat={() => setShowChatModal(true)}
                />
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="default" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setShowChatModal(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Conversation
                  </Button>
                  
                  <SubscriptionFeatureLink
                    featureType="Premium Match Features"
                    returnPath="/family/matching"
                    referringPagePath="/family/matching"
                    referringPageLabel="Caregiver Matching"
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
                <MessageCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Why start with chat?</h4>
                  <p className="text-sm text-amber-800">
                    TAV moderates your conversation to keep it professional and safe. Get to know your caregiver's 
                    experience and approach before upgrading to full contact information and unlimited matches.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chat Modal */}
      {bestMatch && (
        <CaregiverChatModal
          open={showChatModal}
          onOpenChange={setShowChatModal}
          caregiver={bestMatch}
        />
      )}
    </div>
  );
};

export default FamilyMatchingPage;
