
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Clipboard, ArrowRight, ClipboardEdit, ClipboardCheck, Mail, UserCircle, Edit } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTracking } from "@/hooks/useTracking";
import { supabase } from "@/lib/supabase";

// Type for onboarding progress structure
interface OnboardingProgress {
  currentStep?: string;
  completedSteps?: {
    care_needs?: boolean;
    [key: string]: boolean | undefined;
  };
}

export function FamilyShortcutMenuBar() {
  const { isProfileComplete, user } = useAuth();
  const { trackEngagement } = useTracking();
  const [careNeedsComplete, setCareNeedsComplete] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const checkCareNeedsStatus = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('onboarding_progress')
            .eq('id', user.id)
            .single();
          
          // Safely check the structure of onboarding_progress
          const onboardingProgress = data?.onboarding_progress as OnboardingProgress | null;
          const isComplete = !!onboardingProgress?.completedSteps?.care_needs;
          setCareNeedsComplete(isComplete);
        } catch (error) {
          console.error("Error checking care needs status:", error);
        }
      };
      
      checkCareNeedsStatus();
    }
  }, [user]);

  const handleTrackButtonClick = (actionType: string, buttonName: string) => {
    trackEngagement(actionType, { button_name: buttonName });
  };

  const isEmailVerified = user?.email_confirmed_at || user?.confirmed_at;

  return (
    <div className="bg-muted py-2 border-y">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mb-2 sm:mb-0 sm:mr-2">Quick Access:</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-auto gap-2 sm:flex sm:flex-row sm:flex-wrap w-full">
            {/* Show email verification button if email is not verified */}
            {user && !isEmailVerified && (
              <Link 
                to="/auth"
                onClick={() => handleTrackButtonClick('navigation_click', 'verify_email')}
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="sm" className="flex items-center gap-1 w-full">
                  <Mail className="h-4 w-4" />
                  <span>Verify Email</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
            
            {/* Only show the Complete Registration button if registration is not complete */}
            {!isProfileComplete && (
              <Link 
                to="/registration/family"
                onClick={() => handleTrackButtonClick('navigation_click', 'complete_registration')}
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="sm" className="flex items-center gap-1 w-full">
                  <UserCircle className="h-4 w-4" />
                  <span>Complete Profile</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
            
            {/* Show "Care Needs" button based on completion status - 
                when complete, change to "Edit Care Needs" or hide completely */}
            {!careNeedsComplete ? (
              <Link 
                to="/careneeds/family"
                onClick={() => handleTrackButtonClick('navigation_click', 'care_needs')}
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="sm" className="flex items-center gap-1 w-full">
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Care Needs</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            ) : null}
            
            <Link 
              to="/family/care-management"
              className="w-full sm:w-auto"
              onClick={() => handleTrackButtonClick('navigation_click', 'care_management')}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-1 w-full">
                <Clipboard className="h-4 w-4" />
                <span>Care Management</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
