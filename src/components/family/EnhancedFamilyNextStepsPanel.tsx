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
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedFamilyNextStepsPanelProps {
  showAllSteps?: boolean;
}

export const EnhancedFamilyNextStepsPanel: React.FC<EnhancedFamilyNextStepsPanelProps> = ({ 
  showAllSteps = false 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
        className="mb-6 sm:mb-8"
      >
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <List className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Your Care Journey Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
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
        className="mb-6 sm:mb-8 space-y-4 sm:space-y-6"
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
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <div className={`${isMobile ? 'flex-col space-y-3' : 'flex items-center justify-between'}`}>
              <div className="flex-1">
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
                  <List className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary flex-shrink-0`} />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={isMobile ? 'text-base' : 'text-xl'}>
                      {showAllSteps ? "🌿 Complete Care Journey" : "Your Care Journey Progress"}
                    </span>
                    {isAnonymous && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
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
                <p className="text-xs sm:text-sm text-gray-600">
                  {showAllSteps 
                    ? isAnonymous
                      ? "✨ Demo Experience - This shows how families complete their care journey with Tavara"
                      : "Complete these stages to get matched and begin personalized care with confidence"
                    : isAnonymous
                      ? "✨ Demo Experience - Here's how families build their care village with Tavara"
                      : "Follow these stages to get matched with the right caregiver"
                  }
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">Current stage:</span>
                  <span className="text-xs font-medium capitalize bg-primary/10 text-primary px-2 py-1 rounded">
                    {currentStage}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-3 ${isMobile ? 'justify-center' : 'ml-4'}`}>
                <div className="text-right">
                  <div className={`${isMobile ? 'text-2xl' : showAllSteps ? 'text-3xl' : 'text-2xl'} font-bold text-primary`}>
                    {completionPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {showAllSteps 
                      ? `${steps.filter(s => s.completed).length} of ${steps.length} completed`
                      : "Complete"
                    }
                  </div>
                </div>
                <div className={`${isMobile ? 'w-16 h-16' : showAllSteps ? 'w-20 h-20' : 'w-16 h-16'} relative`}>
                  <svg className={`${isMobile ? 'w-16 h-16' : showAllSteps ? 'w-20 h-20' : 'w-16 h-16'} transform -rotate-90`} viewBox="0 0 36 36">
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
          </CardHeader>
        </Card>

        {/* Stage-Based Progress Cards - Now filtered based on showAllSteps and pass visitDetails */}
        <div className="space-y-4">
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
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Ready for Your Real Care Journey?</h3>
                    </div>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      This is a preview of your care journey. Choose a care plan to get matched with real caregivers in your area.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button
                        variant="default"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
                        onClick={() => navigate('/subscription/features')}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Choose Care Plan
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between min-h-[44px] text-gray-600"
                  onClick={handleViewCompleteJourney}
                >
                  <span className="text-sm">View Complete Demo Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-between min-h-[44px] text-gray-600"
                onClick={handleViewCompleteJourney}
              >
                <span className="text-sm">View Complete Journey</span>
                <ArrowRight className="h-4 w-4" />
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
