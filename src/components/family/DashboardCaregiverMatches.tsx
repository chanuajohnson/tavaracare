
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MessageCircle, Eye } from "lucide-react";
import { useUnifiedMatches } from "@/hooks/useUnifiedMatches";
import { SimpleMatchCard } from "./SimpleMatchCard";
import { CaregiverChatModal } from "./CaregiverChatModal";
import { MatchBrowserModal } from "./MatchBrowserModal";
import { MatchDetailModal } from "./MatchDetailModal";
import { MatchLoadingState } from "@/components/ui/match-loading-state";

export const DashboardCaregiverMatches = () => {
  const { user } = useAuth();
  const { matches, isLoading } = useUnifiedMatches('family', false); // Show all matches
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  if (!user) {
    return null;
  }

  const displayMatches = matches.slice(0, 6); // Show top 6 matches on dashboard
  const bestMatch = matches[0];

  const handleStartChat = () => {
    setSelectedCaregiver(bestMatch);
    setShowChatModal(true);
  };

  const handleViewDetails = () => {
    setSelectedCaregiver(bestMatch);
    setShowDetailModal(true);
  };

  return (
    <>
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Your Caregiver Matches
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </CardTitle>
            <p className="text-sm text-gray-500">
              {matches.length} caregiver{matches.length === 1 ? '' : 's'} match your care needs and schedule
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowBrowserModal(true)}>
            <span>View All Matches</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {(isLoading || !isLoadingComplete) ? (
            <MatchLoadingState 
              duration={2000}
              onComplete={() => setIsLoadingComplete(true)}
            />
          ) : displayMatches.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                {displayMatches.map((match, index) => (
                  <SimpleMatchCard
                    key={match.id}
                    caregiver={match}
                    variant="dashboard"
                    isBestMatch={index === 0}
                    onChatClick={() => {
                      setSelectedCaregiver(match);
                      setShowChatModal(true);
                    }}
                    onViewDetails={() => {
                      setSelectedCaregiver(match);
                      setShowDetailModal(true);
                    }}
                  />
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={handleStartChat}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Best Match
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowBrowserModal(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All {matches.length} Matches
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
              <Button variant="outline" onClick={() => setShowBrowserModal(true)}>
                Find Matches
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCaregiver && (
        <CaregiverChatModal
          open={showChatModal}
          onOpenChange={setShowChatModal}
          caregiver={selectedCaregiver}
        />
      )}

      <MatchBrowserModal
        open={showBrowserModal}
        onOpenChange={setShowBrowserModal}
        onSelectMatch={(id) => {
          const caregiver = matches.find(m => m.id === id);
          setSelectedCaregiver(caregiver);
          setShowDetailModal(true);
        }}
        onStartChat={(id) => {
          const caregiver = matches.find(m => m.id === id) || bestMatch;
          setSelectedCaregiver(caregiver);
          setShowChatModal(true);
        }}
      />

      <MatchDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        caregiver={selectedCaregiver}
        onStartChat={() => {
          setShowDetailModal(false);
          setShowChatModal(true);
        }}
      />
    </>
  );
};
