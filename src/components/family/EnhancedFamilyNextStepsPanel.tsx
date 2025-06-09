
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, ArrowRight, Eye, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScheduleVisitModal } from "./ScheduleVisitModal";
import { InternalSchedulingModal } from "./InternalSchedulingModal";
import { CancelVisitDialog } from "./CancelVisitDialog";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { CaregiverMatchingModal } from "./CaregiverMatchingModal";
import { JourneyPathVisualization } from "./JourneyPathVisualization";
import { JourneyStageCard } from "./JourneyStageCard";
import { useEnhancedJourneyProgress } from "@/hooks/useEnhancedJourneyProgress";
import { useIsMobile, useIsSmallMobile } from "@/hooks/use-mobile";

interface EnhancedFamilyNextStepsPanelProps {
  showAllSteps?: boolean;
}

export const EnhancedFamilyNextStepsPanel: React.FC<EnhancedFamilyNextStepsPanelProps> = ({ 
  showAllSteps = false 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  const { 
    steps, 
    paths,
    completionPercentage, 
    nextStep, 
    currentStage,
    loading, 
    showScheduleModal, 
    setShowScheduleModal,
    showInternalScheduleModal,
    setShowInternalScheduleModal,
    showCancelVisitModal,
    setShowCancelVisitModal,
    showCaregiverMatchingModal,
    setShowCaregiverMatchingModal,
    showLeadCaptureModal,
    setShowLeadCaptureModal,
    visitDetails,
    trackStepAction,
    isAnonymous,
    onVisitCancelled
  } = useEnhancedJourneyProgress();

  // Group steps by stage
  const groupStepsByStage = () => {
    const stages = {
      foundation: {
        name: "Foundation",
        key: "foundation",
        description: "Set up your profile and care needs",
        color: "blue",
        steps: steps.filter(step => step.category === 'foundation').map(step => ({
          ...step,
          cancelAction: step.step_number === 7 && step.completed ? () => setShowCancelVisitModal(true) : undefined
        })),
        subscriptionCTA: null
      },
      scheduling: {
        name: "Scheduling", 
        key: "scheduling",
        description: "Meet your care team and coordinate services",
        color: "green",
        steps: steps.filter(step => step.category === 'scheduling').map(step => ({
          ...step,
          cancelAction: step.step_number === 7 && step.completed ? () => setShowCancelVisitModal(true) : undefined
        })),
        subscriptionCTA: null
      },
      trial: {
        name: "Trial",
        key: "trial", 
        description: "Experience care with an optional trial day",
        color: "purple",
        steps: steps.filter(step => step.category === 'trial').map(step => ({
          ...step,
          cancelAction: step.step_number === 7 && step.completed ? () => setShowCancelVisitModal(true) : undefined
        })),
        subscriptionCTA: null
      },
      conversion: {
        name: "Decision",
        key: "conversion",
        description: "Choose your care model and begin services", 
        color: "orange",
        steps: steps.filter(step => step.category === 'conversion').map(step => ({
          ...step,
          cancelAction: step.step_number === 7 && step.completed ? () => setShowCancelVisitModal(true) : undefined
        })),
        subscriptionCTA: null
      }
    };

    // Add subscription CTAs based on stage completion and user status
    const foundationCompleted = stages.foundation.steps.every(step => step.completed);
    const schedulingCompleted = stages.scheduling.steps.every(step => step.completed);
    const trialCompleted = stages.trial.steps.every(step => step.completed);

    if (isAnonymous) {
      // For anonymous users, show conversion CTA on foundation
      stages.foundation.subscriptionCTA = {
        show: true,
        title: "Start Your Care Journey",
        description: "Get matched with qualified caregivers for $7.99 one-time.",
        buttonText: "Start Care Journey",
        action: "upgrade",
        featureType: "teaser_unlock",
        navigateTo: "/subscription/features"
      };
    } else {
      // Only show subscription CTA for foundation stage
      if (foundationCompleted && !schedulingCompleted) {
        stages.foundation.subscriptionCTA = {
          show: true,
          title: "Unlock Premium Match Features",
          description: "Get unlimited caregiver matches and advanced filtering for $7.99 one-time.",
          buttonText: "Unlock Matches",
          action: "upgrade",
          featureType: "teaser_unlock",
          navigateTo: "/subscription/features"
        };
      }

      if (trialCompleted) {
        stages.conversion.subscriptionCTA = {
          show: true,
          title: "Ready for Full Care Management?",
          description: "Get everything included: caregivers, tools, and 24/7 support.",
          buttonText: "View Full Service",
          action: "learn_more",
          featureType: "managed_care",
          planId: "family_premium", 
          navigateTo: "/subscription"
        };
      }
    }

    return stages;
  };

  const handleViewCompleteJourney = () => {
    if (isAnonymous) {
      setShowLeadCaptureModal(true);
    } else {
      navigate('/family/care-journey-progress');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6 lg:mb-8"
      >
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="mobile-padding-responsive">
            <CardTitle className="flex items-center gap-2 mobile-text-responsive font-semibold">
              <List className="mobile-icon-responsive text-primary flex-shrink-0" />
              Your Care Journey Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-padding-responsive">
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading progress...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const stageGroups = groupStepsByStage();

  // Filter stages based on showAllSteps prop
  const stagesToDisplay = showAllSteps 
    ? Object.values(stageGroups) 
    : [stageGroups.foundation]; // Only show foundation stage on dashboard

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6 lg:mb-8 mobile-card-spacing"
      >
        {/* Path Visualization - Only show on full page view and for logged-in users */}
        {showAllSteps && !isAnonymous && (
          <JourneyPathVisualization 
            paths={paths}
            steps={steps}
            currentStage={currentStage}
          />
        )}

        {/* Journey Overview Card with Demo Indicator for Anonymous Users */}
        <Card className={`border-l-4 border-l-primary ${isAnonymous ? 'bg-gradient-to-r from-blue-50/30 to-purple-50/30' : ''}`}>
          <CardHeader className="mobile-padding-responsive">
            <div className="journey-header-mobile">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-start gap-2 mobile-text-responsive font-semibold mb-2">
                  <List className="mobile-icon-responsive text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-2 min-w-0">
                    <span className={isSmallMobile ? 'text-base' : isMobile ? 'text-lg' : 'text-xl'}>
                      {showAllSteps ? "🌿 Complete Care Journey" : "Your Care Journey Progress"}
                    </span>
                    {isAnonymous && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          <Sparkles className="h-3 w-3" />
                          DEMO
                        </span>
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                          <Eye className="h-3 w-3" />
                          Preview
                        </span>
                      </div>
                    )}
                  </div>
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  {showAllSteps 
                    ? isAnonymous
                      ? "✨ Demo Experience - This shows how families complete their care journey with Tavara"
                      : "Complete these stages to get matched and begin personalized care with confidence"
                    : isAnonymous
                      ? "✨ Demo Experience - Here's how families build their care village with Tavara"
                      : "Follow these stages to get matched with the right caregiver"
                  }
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Current stage:</span>
                  <span className="text-xs font-medium capitalize bg-primary/10 text-primary px-2 py-1 rounded">
                    {currentStage}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Progress Circle Container with Better Mobile Positioning */}
              <div className="journey-progress-container">
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold text-primary ${isSmallMobile ? 'text-xl' : isMobile ? 'text-2xl' : showAllSteps ? 'text-3xl' : 'text-2xl'}`}>
                    {completionPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {showAllSteps 
                      ? `${steps.filter(s => s.completed).length} of ${steps.length} completed`
                      : "Complete"
                    }
                  </div>
                </div>
                <div className="progress-circle-container">
                  <div className={`relative ${isSmallMobile ? 'w-12 h-12' : isMobile ? 'w-14 h-14' : showAllSteps ? 'w-20 h-20' : 'w-16 h-16'}`}>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={`${completionPercentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stage-Based Progress Cards - Now filtered based on showAllSteps and pass visitDetails */}
        <div className="mobile-card-spacing">
          {stagesToDisplay.map((stage) => (
            stage.steps.length > 0 && (
              <JourneyStageCard
                key={stage.key}
                stageName={stage.name}
                stageKey={stage.key}
                stageDescription={stage.description}
                steps={showAllSteps ? stage.steps : stage.steps}
                stageColor={stage.color}
                subscriptionCTA={stage.subscriptionCTA}
                trackStepAction={trackStepAction}
                isAnonymous={isAnonymous}
                visitDetails={visitDetails}
              />
            )
          ))}
        </div>
            
        {!showAllSteps && (
          <div className="mt-4 sm:mt-6">
            {isAnonymous ? (
              <div className="mobile-card-spacing">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg mobile-padding-responsive">
                  <div className="text-center mobile-card-spacing">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      <h3 className="mobile-text-responsive font-semibold text-gray-800">Ready for Your Real Care Journey?</h3>
                    </div>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      This is a preview of your care journey. Choose a care plan to get matched with real caregivers in your area.
                    </p>
                    <div className="mobile-flex-responsive justify-center">
                      <Button
                        variant="default"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium mobile-button-responsive mobile-touch-target"
                        onClick={() => navigate('/subscription/features')}
                      >
                        <ArrowRight className="mobile-icon-responsive mr-2" />
                        Choose Care Plan
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between mobile-touch-target text-gray-600 mobile-button-responsive"
                  onClick={handleViewCompleteJourney}
                >
                  <span className="text-sm">View Complete Demo Journey</span>
                  <ArrowRight className="mobile-icon-responsive" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-between mobile-touch-target text-gray-600 mobile-button-responsive"
                onClick={handleViewCompleteJourney}
              >
                <span className="text-sm">View Complete Journey</span>
                <ArrowRight className="mobile-icon-responsive" />
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <ScheduleVisitModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        onVisitScheduled={() => {
          // This will be handled by the modal close callback
        }}
      />

      <InternalSchedulingModal
        open={showInternalScheduleModal}
        onOpenChange={setShowInternalScheduleModal}
        onVisitScheduled={() => {
          // This will be handled by the modal close callback
        }}
      />

      <CancelVisitDialog
        open={showCancelVisitModal}
        onOpenChange={setShowCancelVisitModal}
        visitDetails={visitDetails}
        onVisitCancelled={onVisitCancelled}
      />

      <CaregiverMatchingModal
        open={showCaregiverMatchingModal}
        onOpenChange={setShowCaregiverMatchingModal}
        referringPagePath={showAllSteps ? "/family/care-journey-progress" : "/dashboard/family"}
        referringPageLabel={showAllSteps ? "Care Journey Progress" : "Family Dashboard"}
      />

      {isAnonymous && (
        <LeadCaptureModal
          open={showLeadCaptureModal}
          onOpenChange={setShowLeadCaptureModal}
        />
      )}
    </>
  );
};
