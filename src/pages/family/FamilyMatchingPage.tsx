
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Eye } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { useUnifiedMatches } from "@/hooks/useUnifiedMatches";
import { SimpleMatchCard } from "@/components/family/SimpleMatchCard";
import { CaregiverChatModal } from "@/components/family/CaregiverChatModal";
import { MatchBrowserModal } from "@/components/family/MatchBrowserModal";
import { MatchDetailModal } from "@/components/family/MatchDetailModal";
import { MatchLoadingState } from "@/components/ui/match-loading-state";

const FamilyMatchingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const { matches } = useUnifiedMatches('family', true);

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Caregiver Matching", path: "/family/matching" },
  ];

  const bestMatch = matches[0];

  const handleStartChat = (caregiverId?: string) => {
    const caregiver = caregiverId 
      ? matches.find(m => m.id === caregiverId) || bestMatch
      : bestMatch;
    setSelectedCaregiver(caregiver);
    setShowChatModal(true);
  };

  const handleViewDetails = (caregiverId: string) => {
    const caregiver = matches.find(m => m.id === caregiverId);
    setSelectedCaregiver(caregiver);
    setShowDetailModal(true);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

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
            <MatchLoadingState 
              title="Finding Your Perfect Match"
              duration={2000}
              onComplete={handleLoadingComplete}
            />
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
                <SimpleMatchCard
                  caregiver={bestMatch}
                  variant="modal"
                  onChatClick={() => handleStartChat()}
                  onViewDetails={() => handleViewDetails(bestMatch.id)}
                />
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="default" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleStartChat()}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Conversation
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowBrowserModal(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Browse All Matches
                  </Button>
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
      {selectedCaregiver && (
        <CaregiverChatModal
          open={showChatModal}
          onOpenChange={setShowChatModal}
          caregiver={selectedCaregiver}
        />
      )}

      {/* Browse All Matches Modal */}
      <MatchBrowserModal
        open={showBrowserModal}
        onOpenChange={setShowBrowserModal}
        onSelectMatch={handleViewDetails}
        onStartChat={handleStartChat}
      />

      {/* Match Detail Modal */}
      <MatchDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        caregiver={selectedCaregiver}
        onStartChat={() => {
          setShowDetailModal(false);
          setShowChatModal(true);
        }}
      />
    </div>
  );
};

export default FamilyMatchingPage;
