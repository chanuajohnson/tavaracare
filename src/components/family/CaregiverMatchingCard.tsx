
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Users, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { useTracking } from "@/hooks/useTracking";
import { SubscriptionFeatureLink } from "../subscription/SubscriptionFeatureLink";

export const CaregiverMatchingCard = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { trackEngagement } = useTracking();

  // If user is logged in, don't show this marketing card
  if (user) {
    return null;
  }

  const handleFindCaregiversClick = async () => {
    setIsLoading(true);
    
    try {
      // Track the CTA click
      await trackEngagement('family_matching_cta_click', {
        source: 'family_dashboard',
        user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'logged_out'
      });
      
      // For family users, redirect to subscription page since caregiver matching is premium
      if (!user) {
        toast.info("Please sign in to find caregiver matches");
        navigate("/auth", { 
          state: { returnPath: "/subscription", action: "findCaregivers" }
        });
      } else if (!isProfileComplete) {
        toast.info("Let's complete your profile first");
        navigate("/registration/family", { 
          state: { returnPath: "/subscription", action: "findCaregivers" }
        });
      } else {
        // Redirect to subscription page for premium caregiver matching
        navigate("/subscription", {
          state: {
            returnPath: "/caregiver/matching",
            referringPagePath: "/dashboard/family",
            referringPageLabel: "Family Dashboard",
            featureType: "Premium Caregiver Matching"
          }
        });
      }
    } catch (error) {
      console.error("Error in handleFindCaregiversClick:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 mb-8">
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100/30 pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-semibold text-primary-900">Find Trusted Caregivers in Minutes</CardTitle>
        </div>
        <CardDescription className="text-lg font-medium text-muted-foreground">
          Personalized Matching Based on Your Care Needs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ul className="space-y-2">
              {[
                "Get matched instantly with qualified caregivers.",
                "Compare caregiver skills, experience, and availability.",
                "Message caregivers & coordinate services directly.",
                "Build your care team with verified professional profiles."
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-4 group"
              onClick={handleFindCaregiversClick}
              disabled={isLoading}
            >
              <span>Find Caregivers Now</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-primary-900 mb-2">Why Families Trust Us</h3>
            <p className="text-gray-600 mb-3">
              Our matching system connects you with caregivers that align with your care needs, schedule, and budget to ensure the best possible care for your loved ones.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">95%</span>
                <span className="text-gray-500">Family Satisfaction</span>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">24hrs</span>
                <span className="text-gray-500">Average Match Time</span>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">100%</span>
                <span className="text-gray-500">Verified Caregivers</span>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">24/7</span>
                <span className="text-gray-500">Support Available</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
