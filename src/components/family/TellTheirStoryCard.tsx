
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { useTracking } from "@/hooks/useTracking";

export const TellTheirStoryCard = () => {
  const { user, isProfileComplete, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { trackEngagement } = useTracking();
  
  const handleShareStoryClick = async () => {
    setIsLoading(true);
    
    try {
      // Track the CTA click
      await trackEngagement('tell_their_story_cta_click', {
        source: 'family_dashboard',
        user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'logged_out'
      });
      
      // Check if user is authenticated, and if not, use the requireAuth function
      if (!user) {
        requireAuth('tell their story', '/family/story');
        setIsLoading(false);
        return;
      }
      
      // Determine redirect based on user status
      if (!isProfileComplete) {
        // User is logged in but profile is incomplete
        toast.info("Let's complete your profile first");
        navigate("/registration/family", { 
          state: { returnPath: "/family/story", action: "tellStory" }
        });
      } else {
        // User is logged in and profile is complete
        toast.success("Let's tell their story");
        navigate("/family/story");
      }
    } catch (error) {
      console.error("Error in handleShareStoryClick:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 mb-8">
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-semibold text-primary-900">Tell Their Story – Honoring Their Life & Needs</CardTitle>
        </div>
        <CardDescription className="text-lg font-medium text-muted-foreground">
          Share the story that makes your loved one unique
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-gray-700">
              Help us understand who your loved one is beyond their care needs. These insights help match caregivers more effectively and enhance the quality of care they receive.
            </p>
            <p className="text-gray-600 italic">
              This step is optional but highly recommended for better caregiver matching.
            </p>
            <ul className="space-y-2">
              {[
                "Capture the essence of who they are, not just their care needs.",
                "Help caregivers build meaningful connections.",
                "Ensure better caregiver-family matching with AI insights."
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold group"
                onClick={handleShareStoryClick}
                disabled={isLoading}
              >
                <span>Share Their Story</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full text-primary border-primary/30 hover:bg-primary/5"
                asChild
              >
                <Link to="/legacy-stories" className="flex items-center justify-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>View Legacy Stories</span>
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-primary-900 mb-2">Why Sharing Their Story Matters</h3>
            <p className="text-gray-600 mb-3">
              When caregivers understand the person behind the care needs, they can provide more personalized, empathetic support that honors their unique life journey.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="bg-blue-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">78%</span>
                <span className="text-gray-500">Better Care Match</span>
              </div>
              <div className="bg-purple-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">92%</span>
                <span className="text-gray-500">Family Satisfaction</span>
              </div>
              <div className="bg-blue-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">3x</span>
                <span className="text-gray-500">Deeper Connection</span>
              </div>
              <div className="bg-purple-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">65%</span>
                <span className="text-gray-500">Less Transition Issues</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
