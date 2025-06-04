
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useTracking } from "@/hooks/useTracking";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";

export default function FamilyMatchingPage() {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { trackEngagement } = useTracking();
  
  const referringPath = location.state?.referringPagePath || "/dashboard/family";
  const referringLabel = location.state?.referringPageLabel || "Family Dashboard";
  
  console.log("FamilyMatchingPage - Navigation context:", {
    referringPath,
    referringLabel,
    locationState: location.state,
    userRole: user?.role
  });

  useEffect(() => {
    // Track page view
    trackEngagement('family_matching_page_view', {
      source: 'direct_access',
      referrer: referringPath
    });

    // Always redirect to subscription page for premium feature access
    if (user && isProfileComplete) {
      // Redirect to subscription page since this is a premium feature
      navigate("/subscription", {
        state: {
          returnPath: "/family/matching",
          referringPagePath: referringPath,
          referringPageLabel: referringLabel,
          featureType: "Premium Family Matching"
        },
        replace: true
      });
    } else if (user && !isProfileComplete) {
      // Redirect to complete profile first
      navigate("/registration/family", { 
        state: { 
          returnPath: "/subscription", 
          action: "accessMatching",
          nextFeature: "Family Matching"
        },
        replace: true
      });
    } else if (!user) {
      // Redirect to auth
      navigate("/auth", { 
        state: { 
          returnPath: "/subscription", 
          action: "accessMatching",
          nextFeature: "Family Matching"
        },
        replace: true
      });
    }
  }, [user, isProfileComplete, navigate, referringPath, referringLabel, trackEngagement]);

  const breadcrumbItems = [
    {
      label: referringLabel,
      path: referringPath,
    },
    {
      label: "Family Matching",
      path: "/family/matching",
    },
  ];

  return (
    <div className="container px-4 py-8">
      <MatchingTracker 
        matchingType="family" 
        additionalData={{
          referrer: referringPath,
          access_attempt: 'premium_feature'
        }}
      />
      
      <DashboardHeader breadcrumbItems={breadcrumbItems} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Family Matching</h1>
        <p className="text-gray-600">
          Premium feature - upgrade to access family matching
        </p>
      </div>
      
      <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-amber-600" />
            Premium Feature Access Required
          </CardTitle>
          <CardDescription>
            Family matching is available with our premium subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-amber-800 mb-4">
            Redirecting you to subscription options...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
