
import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { useUnifiedMatches } from "@/hooks/useUnifiedMatches";
import { MatchBrowserModal } from "@/components/family/MatchBrowserModal";
import { MatchDetailModal } from "@/components/family/MatchDetailModal";
import { MatchLoadingState } from "@/components/ui/match-loading-state";
import { FamilyMatchGrid } from "@/components/family/FamilyMatchGrid";
import { openCaregiverWhatsApp } from "@/utils/whatsapp/openCaregiverWhatsApp";

const FamilyMatchingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const { matches } = useUnifiedMatches('family', false);

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Caregiver Matching", path: "/family/matching" },
  ];

  const getDisplayLabel = (cg: any) => {
    const typeMap: Record<string, string> = {
      gapp: "GAPP Certified",
      nurse: "Registered Nurse",
      cna: "Certified Nursing Assistant",
      aide: "Professional Care Aide",
      hha: "Home Health Aide",
      elderly: "Elderly Care Specialist",
      special_needs: "Special Needs Caregiver",
      companion: "Companion Caregiver",
      live_in: "Live-in Caregiver",
      other: "Professional Caregiver",
    };
    const type = cg?.professional_type?.toLowerCase();
    if (type && typeMap[type]) return typeMap[type];
    if (type) return type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    return "Professional Caregiver";
  };

  const handleChatWhatsApp = (caregiverId?: string) => {
    const caregiver = caregiverId
      ? matches.find(m => m.id === caregiverId) || matches[0]
      : matches[0];
    
    if (!caregiver) return;

    const label = getDisplayLabel(caregiver);
    const matchScore = caregiver.match_score ?? 90;
    openCaregiverWhatsApp(label, matchScore, caregiver.location);
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
            <h1 className="text-3xl font-bold">Your Caregiver Matches</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've found {matches.length} carefully screened caregiver{matches.length === 1 ? '' : 's'} based on your specific care needs and preferences.
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
                Chat with us on WhatsApp about your match! Get to know their 
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

          {/* Caregiver Matches Grid */}
          <FamilyMatchGrid
            matches={matches}
            onChatClick={handleChatWhatsApp}
            onViewDetails={handleViewDetails}
            onViewAll={() => setShowBrowserModal(true)}
          />

          {/* Why start with chat? */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Why start with chat?</h4>
                  <p className="text-sm text-amber-800">
                    Chat with us on WhatsApp to discuss your caregiver's 
                    experience and approach before upgrading to full contact information and unlimited matches.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Browse All Matches Modal */}
      <MatchBrowserModal
        open={showBrowserModal}
        onOpenChange={setShowBrowserModal}
        onSelectMatch={handleViewDetails}
        onStartChat={handleChatWhatsApp}
      />

      {/* Match Detail Modal */}
      <MatchDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        caregiver={selectedCaregiver}
        onStartChat={async () => {
          setShowDetailModal(false);
          if (selectedCaregiver) {
            handleChatWhatsApp(selectedCaregiver.id);
          }
        }}
      />
    </div>
  );
};

export default FamilyMatchingPage;
