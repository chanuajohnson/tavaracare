
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Clipboard, ArrowRight, ClipboardEdit, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTracking } from "@/hooks/useTracking";

export function FamilyShortcutMenuBar() {
  const { isProfileComplete } = useAuth();
  const { trackEngagement } = useTracking();

  const handleTrackButtonClick = (actionType: string, buttonName: string) => {
    trackEngagement(actionType, { button_name: buttonName });
  };

  return (
    <div className="bg-muted py-2 border-y">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-center overflow-x-visible sm:overflow-x-auto whitespace-normal sm:whitespace-nowrap py-1">
          <span className="text-sm font-medium text-muted-foreground mb-2 sm:mb-0 sm:mr-2">Quick Access:</span>
          
          <div className="flex flex-wrap gap-2">
            {/* Only show the Complete Registration button if registration is not complete */}
            {!isProfileComplete && (
              <Link 
                to="/registration/family"
                onClick={() => handleTrackButtonClick('navigation_click', 'complete_registration')}
              >
                <Button variant="outline" size="sm" className="flex items-center gap-1 w-full sm:w-auto">
                  <ClipboardEdit className="h-4 w-4" />
                  <span>Complete Registration</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
            
            <Link 
              to="/careneeds/family"
              onClick={() => handleTrackButtonClick('navigation_click', 'care_needs')}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-1 w-full sm:w-auto">
                <ClipboardCheck className="h-4 w-4" />
                <span>Care Needs</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
            
            <Link to="/family/care-management">
              <Button variant="outline" size="sm" className="flex items-center gap-1 w-full sm:w-auto">
                <Clipboard className="h-4 w-4" />
                <span>Care Management</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
