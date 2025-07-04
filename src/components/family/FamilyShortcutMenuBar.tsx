
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Clipboard, ArrowRight, ClipboardEdit, FileCheck, Calendar, Users, Star, Heart } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTracking } from "@/hooks/useTracking";
import { useEnhancedJourneyProgress } from "@/hooks/useEnhancedJourneyProgress";

export function FamilyShortcutMenuBar() {
  const { isProfileComplete } = useAuth();
  const { trackEngagement } = useTracking();
  const { 
    steps, 
    visitDetails, 
    setShowCaregiverMatchingModal,
    loading
  } = useEnhancedJourneyProgress();

  const handleTrackButtonClick = (actionType: string, buttonName: string) => {
    trackEngagement(actionType, { button_name: buttonName });
  };

  // Check if visit is scheduled and not cancelled
  const isVisitScheduled = visitDetails && visitDetails.status !== 'cancelled';

  if (loading) {
    return (
      <div className="bg-muted py-2 border-y">
        <Container>
          <div className="flex items-center py-1 gap-2">
            <span className="text-sm font-medium text-muted-foreground">Loading...</span>
          </div>
        </Container>
      </div>
    );
  }

  // Find key journey steps
  const registrationStep = steps.find(step => step.step_number === 2);
  const careAssessmentStep = steps.find(step => step.step_number === 5);
  const storyStep = steps.find(step => step.step_number === 6);
  const caregiverMatchesStep = steps.find(step => step.step_number === 7);

  // Determine which buttons to show based on journey progress
  const showMilestoneButton = caregiverMatchesStep?.accessible && !caregiverMatchesStep?.completed;
  const showStoryButton = storyStep?.accessible && !storyStep?.completed;
  const showRegistrationEdit = registrationStep?.completed;
  const showAssessmentEdit = careAssessmentStep?.completed;

  const handleCaregiverMatchesClick = () => {
    handleTrackButtonClick('milestone_achievement', 'view_caregiver_matches');
    setShowCaregiverMatchingModal(true);
  };

  return (
    <div className="bg-muted py-2 border-y">
      <Container>
        <div className="flex items-center overflow-x-auto whitespace-nowrap py-1 gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Access:</span>
          
          {/* Milestone: View Caregiver Matches - Primary Achievement Button */}
          {showMilestoneButton && (
            <Button 
              onClick={handleCaregiverMatchesClick}
              className="flex items-center gap-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg border-2 border-primary/20"
              size="sm"
            >
              <Star className="h-4 w-4 text-yellow-300" />
              <span className="font-semibold">🎉 VIEW CAREGIVER MATCHES</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}

          {/* Next Step: Share Loved One's Story */}
          {showStoryButton && (
            <Link 
              to="/family/story"
              onClick={() => handleTrackButtonClick('navigation_click', 'share_story')}
            >
              <Button variant="default" size="sm" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Heart className="h-4 w-4" />
                <span>Share Your Loved One's Story</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
          
          {/* Edit buttons for completed steps - Updated with prefill parameters */}
          {showRegistrationEdit && (
            <Link 
              to="/registration/family?mode=edit&prefill=true"
              onClick={() => handleTrackButtonClick('navigation_click', 'edit_profile')}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ClipboardEdit className="h-4 w-4" />
                <span>Edit Profile</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}

          {showAssessmentEdit && (
            <Link 
              to="/family/care-assessment?mode=edit"
              onClick={() => handleTrackButtonClick('navigation_click', 'edit_assessment')}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <FileCheck className="h-4 w-4" />
                <span>Edit Assessment</span>
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

          {/* Conditional Visit Scheduled button - distinctive styling */}
          {isVisitScheduled && (
            <Link 
              to="/family/care-journey-progress#scheduling"
              onClick={() => handleTrackButtonClick('navigation_click', 'visit_scheduled')}
            >
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                <Calendar className="h-4 w-4" />
                <span>Tavara.Care Visit Scheduled</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}
