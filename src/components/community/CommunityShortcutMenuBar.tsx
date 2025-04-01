
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ClipboardEdit, ArrowRight, UserCircle, Users, Calendar } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { useTracking } from "@/hooks/useTracking";

export function CommunityShortcutMenuBar() {
  const { user, isLoading, isProfileComplete } = useAuth();
  const { trackEngagement } = useTracking();
  
  const handleAuthRequired = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user && !isLoading) {
      e.preventDefault();
      toast.info("Authentication Required", {
        description: "Please log in to access your community profile.",
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
  
  // Check if the user has completed their profile
  const isRegistrationComplete = () => {
    return isProfileComplete;
  };
  
  return (
    <div className="bg-muted py-2 border-y">
      <Container>
        <div className="flex items-center overflow-x-auto whitespace-nowrap py-1 gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Access:</span>
          
          {/* Only show the Complete Registration button if registration is not complete */}
          {!isRegistrationComplete() && (
            <Link 
              to="/registration/community"
              onClick={() => handleTrackButtonClick('navigation_click', 'complete_registration')}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ClipboardEdit className="h-4 w-4" />
                <span>Complete Registration</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
          
          <Link 
            to="/community/features-overview" 
            onClick={(e) => {
              handleAuthRequired(e);
              handleTrackButtonClick('navigation_click', 'features_overview');
            }}
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              <span>Features</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          
          <Link 
            to="/community/features-overview"
            onClick={() => handleTrackButtonClick('navigation_click', 'community_events')}
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100">
              <Calendar className="h-4 w-4" />
              <span>Community Events</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          
          <Link 
            to="/community/features-overview"
            onClick={() => handleTrackButtonClick('navigation_click', 'care_circles')}
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Care Circles</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
