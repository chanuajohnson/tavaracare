
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Clipboard, Calendar, ArrowRight, ClipboardEdit } from "lucide-react";
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
        <div className="flex items-center overflow-x-auto whitespace-nowrap py-1 gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Access:</span>
          
          {/* Only show the Complete Registration button if registration is not complete */}
          {!isProfileComplete && (
            <Link 
              to="/registration/family"
              onClick={() => handleTrackButtonClick('navigation_click', 'complete_registration')}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ClipboardEdit className="h-4 w-4" />
                <span>Complete Registration</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
          
          <Link to="/family/care-management">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Clipboard className="h-4 w-4" />
              <span>Care Management</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link to="/family/care-management/schedule">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Care Schedule</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
