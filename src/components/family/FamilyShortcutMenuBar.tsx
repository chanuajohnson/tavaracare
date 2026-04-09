import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Clipboard, ArrowRight, ClipboardEdit, FileCheck, Calendar, Users, Star, Heart, FileText } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTracking } from "@/hooks/useTracking";
import { useEnhancedJourneyProgress } from "@/hooks/useEnhancedJourneyProgress";

interface FamilyShortcutMenuBarProps {
  onCaregiverMatchesClick?: () => void;
  onScheduleCareClick?: () => void;
}

export function FamilyShortcutMenuBar({ onCaregiverMatchesClick, onScheduleCareClick }: FamilyShortcutMenuBarProps) {
  const { isProfileComplete } = useAuth();
  const { trackEngagement } = useTracking();
  const { 
    steps, 
    visitDetails, 
    careRecipient,
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

  // Find key journey steps using correct family step IDs:
  // 1=Profile, 2=Assessment, 3=Legacy Story, 4=Matches, 7=Scheduling
  const registrationStep = steps.find(step => step.step_number === 1);
  const careAssessmentStep = steps.find(step => step.step_number === 2);
  const storyStep = steps.find(step => step.step_number === 3);
  const caregiverMatchesStep = steps.find(step => step.step_number === 4);

  // Determine which buttons to show based on journey progress
  const showMilestoneButton = caregiverMatchesStep?.accessible && !caregiverMatchesStep?.completed;
  // Show story button if step 3 is incomplete OR not accessible yet (safety fallback)
  const showStoryButton = !careRecipient?.id || !careRecipient?.full_name;
  console.log("[FamilyShortcutMenuBar] Story button check:", { careRecipient, showStoryButton, loading });
  const showRegistrationEdit = registrationStep?.completed;
  const showAssessmentEdit = careAssessmentStep?.completed;
  
  // Show schedule button when matches exist but visit not yet scheduled
  const showScheduleButton = caregiverMatchesStep?.completed && !isVisitScheduled;

  const handleCaregiverMatchesClick = () => {
    handleTrackButtonClick('milestone_achievement', 'view_caregiver_matches');
    if (onCaregiverMatchesClick) {
      onCaregiverMatchesClick();
    }
  };

  return (
    <div className="bg-muted py-2 border-y">
      <Container>
        <div className="flex items-center overflow-x-auto whitespace-nowrap py-1 gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Access:</span>
          
          {/* Schedule Care - prominent amber button when in scheduling stage */}
          {showScheduleButton && onScheduleCareClick && (
            <Button 
              onClick={() => {
                handleTrackButtonClick('schedule_care_click', 'schedule_care');
                onScheduleCareClick();
              }}
              className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white shadow-lg font-semibold"
              size="sm"
            >
              <Calendar className="h-4 w-4" />
              <span>📅 Schedule Care</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}

          {/* Milestone: View Caregiver Matches */}
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

          {/* Next Step: Share Loved One's Story - prominent when incomplete */}
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
          
          {/* Care Plans - always visible for authenticated families */}
          <Link 
            to="/family/care-management"
            onClick={() => handleTrackButtonClick('navigation_click', 'care_plans')}
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Care Plans</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>

          {/* Edit buttons for completed steps */}
          {showRegistrationEdit && (
            <Link 
              to="/registration/family?edit=true"
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
          
          {/* Care Management - only after visit is scheduled */}
          {isVisitScheduled && (
            <Link to="/family/care-management">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Clipboard className="h-4 w-4" />
                <span>Care Management</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}

          {/* Visit Scheduled confirmation */}
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
