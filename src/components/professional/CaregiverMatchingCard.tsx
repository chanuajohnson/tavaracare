import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Users } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { useTracking } from "@/hooks/useTracking";

export const CaregiverMatchingCard = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { trackEngagement } = useTracking();

  // If user is logged in, don't show this marketing card
  if (user) {
    return null;
  }

  const handleFindFamiliesClick = async () => {
    setIsLoading(true);
    
    try {
      // Track the CTA click
      await trackEngagement('family_matching_cta_click', {
        source: 'professional_dashboard',
        user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'logged_out'
      });
      
      // Determine redirect based on user status
      if (!user) {
        // User is not logged in
        toast.info("Please sign in to find family matches");
        navigate("/auth", { 
          state: { returnPath: "/family-matching", action: "findFamilies" }
        });
      } else if (!isProfileComplete) {
        // User is logged in but profile is incomplete
        toast.info("Let's complete your profile to find family matches");
        navigate("/registration/professional", { 
          state: { returnPath: "/family-matching", action: "findFamilies" }
        });
      } else {
        // User is logged in and profile is complete
        toast.success("Finding your perfect family matches");
        navigate("/family-matching");
      }
    } catch (error) {
      console.error("Error in handleFindFamiliesClick:", error);
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
          <CardTitle className="text-2xl font-semibold text-primary-900">Find the Right Family to Care For in Minutes</CardTitle>
        </div>
        <CardDescription className="text-lg font-medium text-muted-foreground">
          Personalized Matching Based on Your Expertise
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ul className="space-y-2">
              {[
                "Get matched instantly with families seeking care.",
                "Compare family care needs, schedules, and locations.",
                "Message families & coordinate services directly.",
                "Build your client base with verified family profiles."
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
              onClick={handleFindFamiliesClick}
              disabled={isLoading}
            >
              <span>Find Families Now</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-primary-900 mb-2">Why Caregivers Trust Us</h3>
            <p className="text-gray-600 mb-3">
              Our matching system connects you with families that align with your skills, experience, and availability to ensure satisfying and sustainable care relationships.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">93%</span>
                <span className="text-gray-500">Match Satisfaction</span>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">48hrs</span>
                <span className="text-gray-500">Average Match Time</span>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">100%</span>
                <span className="text-gray-500">Verified Families</span>
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
