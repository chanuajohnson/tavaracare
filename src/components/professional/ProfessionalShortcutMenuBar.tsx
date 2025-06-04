
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ClipboardEdit, ArrowRight, UserCircle, HandHeart } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { useTracking } from "@/hooks/useTracking";
import { supabase } from "@/lib/supabase";

export function ProfessionalShortcutMenuBar() {
  const { user, isLoading } = useAuth();
  const { trackEngagement } = useTracking();
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  const handleAuthRequired = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user && !isLoading) {
      e.preventDefault();
      toast.info("Authentication Required", {
        description: "Please log in to access your profile hub.",
        action: {
          label: "Login",
          onClick: () => window.location.href = "/auth"
        }
      });
    }
  };

  const handleTrackButtonClick = (actionType: string, buttonName: string) => {
    trackEngagement(actionType, { button_name: buttonName });
  };
  
  // Check if the user has completed their professional profile
  const checkProfileCompletion = async () => {
    if (!user) return;
    
    try {
      setCheckingProfile(true);
      
      // Use exact same logic as NextStepsPanel for consistency
      const { data: profile } = await supabase
        .from('profiles')
        .select('professional_type, years_of_experience')
        .eq('id', user.id)
        .maybeSingle();
      
      // Profile is complete if both professional_type and years_of_experience exist
      const isComplete = profile && profile.professional_type && profile.years_of_experience;
      setProfileComplete(!!isComplete);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      setProfileComplete(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkProfileCompletion();
    }
  }, [user]);
  
  return (
    <div className="bg-muted py-2 border-y">
      <Container>
        <div className="flex items-center overflow-x-auto whitespace-nowrap py-1 gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Access:</span>
          
          {/* Complete Profile button - prioritized when profile is not complete */}
          {!checkingProfile && !profileComplete && (
            <Link 
              to="/registration/professional"
              onClick={() => handleTrackButtonClick('navigation_click', 'complete_professional_profile')}
            >
              <Button variant="default" size="sm" className="flex items-center gap-1 bg-primary hover:bg-primary-600">
                <ClipboardEdit className="h-4 w-4" />
                <span>Complete your professional profile</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
          
          <Link 
            to="/professional/profile" 
            onClick={(e) => {
              handleAuthRequired(e);
              handleTrackButtonClick('navigation_click', 'profile_hub');
            }}
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              <span>Profile Hub</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          
          <Link 
            to="/caregiver/health"
            onClick={() => handleTrackButtonClick('navigation_click', 'caregiver_health')}
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100">
              <HandHeart className="h-4 w-4" />
              <span>Caregiver Health</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
