
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { useCaregiverMatches } from "@/hooks/useCaregiverMatches";
import { CaregiverMatchCard } from "./CaregiverMatchCard";

export const DashboardCaregiverMatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { caregivers, isLoading } = useCaregiverMatches(true); // Show only best match

  if (!user) {
    return null;
  }

  return (
    <Card className="mb-8 border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Your Caregiver Matches</CardTitle>
          <p className="text-sm text-gray-500">
            Your best match based on care needs
          </p>
        </div>
        <SubscriptionFeatureLink
          featureType="Caregiver Matching"
          returnPath="/family-matching"
          referringPagePath="/dashboard/family"
          referringPageLabel="Family Dashboard"
          variant="default"
        >
          <span>View All</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </SubscriptionFeatureLink>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : caregivers.length > 0 ? (
          <div className="space-y-4">
            {caregivers.map(caregiver => (
              <CaregiverMatchCard
                key={caregiver.id}
                caregiver={caregiver}
                returnPath="/family-matching"
                referringPagePath="/dashboard/family"
                referringPageLabel="Family Dashboard"
              />
            ))}
            
            <SubscriptionFeatureLink
              featureType="Caregiver Matching"
              returnPath="/family-matching"
              referringPagePath="/dashboard/family"
              referringPageLabel="Family Dashboard"
              variant="outline"
              className="w-full mt-2"
            >
              View All Caregiver Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </SubscriptionFeatureLink>
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No Matches Found</h3>
            <p className="text-gray-500 mt-2 mb-4">
              Complete your care assessment to get personalized caregiver matches.
            </p>
            <Button variant="outline" onClick={() => navigate("/family/care-needs-assessment")}>
              Complete Assessment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
