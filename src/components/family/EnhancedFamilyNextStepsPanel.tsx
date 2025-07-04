
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

  const groupStepsByStage = () => {
    const stages = {
      foundation: {
        name: "Foundation",
        key: "foundation",
        description: "Essential setup and care planning",
        color: "blue",
        steps: steps.filter(step => step.category === 'foundation').map(step => ({
          ...step,
          cancelAction: step.step_number === 7 && step.completed ? () => setShowCancelVisitModal(true) : undefined
        })),
        subscriptionCTA: null
      },
      scheduling: {
        name: "Care Coordination", 
        key: "scheduling",
        description: "Connect with caregivers and schedule services",
        color: "green",
        steps: steps.filter(step => step.category === 'scheduling').map(step => ({
          ...step,
          cancelAction: step.step_number === 7 && step.completed ? () => setShowCancelVisitModal(true) : undefined
        })),
        subscriptionCTA: null
      },
      trial: {
        name: "Trial Experience",
        key: "trial", 
        description: "Experience care with optional trial services",
        color: "purple",
        steps: steps.filter(step => step.category === 'trial').map(step => ({
          ...step,
          cancelAction: step.step_number === 7 && step.completed ? () => setShowCancelVisitModal(true) : undefined
        })),
        subscriptionCTA: null
      },
      conversion: {
        name: "Care Services",
        key: "conversion",
        description: "Choose your ongoing care model", 
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

  const handleCaregiverModalTrigger = () => {
    setShowCaregiverMatchingModal(true);
  };

  const handleAnonymousSubscriptionCTA = () => {
    setShowCaregiverMatchingModal(true);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card className="border-l-4 border-l-primary bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <List className="h-6 w-6 text-primary flex-shrink-0" />
              Your Care Journey Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground ml-3">Loading your progress...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const stageGroups = groupStepsByStage();
  const stagesToDisplay = showAllSteps 
    ? Object.values(stageGroups) 
    : [stageGroups.foundation];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Enhanced Path Visualization */}
        {showAllSteps && !isAnonymous && (
          <div className="mb-8">
            <JourneyPathVisualization 
              paths={paths}
              steps={steps}
              currentStage={currentStage}
            />
          </div>
        )}

        {/* Professional Journey Overview Header */}
        <Card className={`border-l-4 border-l-primary bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ${isAnonymous ? 'bg-gradient-to-r from-blue-50/40 to-purple-50/40' : ''}`}>
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-start gap-3 mb-3">
                  <List className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex flex-col gap-2 min-w-0">
                    <span className="text-xl lg:text-2xl font-semibold text-gray-900 leading-tight">
                      {showAllSteps ? "🌿 Complete Care Journey" : "Your Care Journey Progress"}
                    </span>
                    {isAnonymous && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                          <Sparkles className="h-3 w-3" />
                          DEMO EXPERIENCE
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full">
                          <Eye className="h-3 w-3" />
                          Preview Mode
                        </span>
                      </div>
                    )}
                  </div>
                </CardTitle>
                
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {showAllSteps 
                    ? isAnonymous
                      ? "✨ Experience how families complete their personalized care journey with Tavara's comprehensive support system"
                      : "Complete these thoughtfully designed stages to connect with qualified caregivers and begin your personalized care experience"
                    : isAnonymous
                      ? "✨ Discover how families build their care village through our guided journey experience"
                      : "Progress through essential stages to find and connect with the perfect caregiver for your family"
                  }
                </p>
                
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Current stage:</span>
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium capitalize">
                      {currentStage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>•</span>
                    <span>{steps.filter(s => s.completed).length} of {steps.length} steps completed</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Progress Display */}
              <div className="flex-shrink-0 text-right">
                <div className="relative mb-2">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {completionPercentage}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {showAllSteps ? "Journey Complete" : "Foundation Progress"}
                  </div>
                </div>
                
                {/* Circular Progress Indicator */}
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary transition-all duration-1000 ease-out"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={`${completionPercentage}, 100`}
                      strokeLinecap="round"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xs font-semibold text-primary">
                      {Math.round(completionPercentage)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Stage Cards */}
        <div className="space-y-6">
          {stagesToDisplay.map((stage) => (
            stage.steps.length > 0 && (
              <div key={stage.key} id={stage.key}>
                <JourneyStageCard
                  stageName={stage.name}
                  stageKey={stage.key}
                  stageDescription={stage.description}
                  steps={showAllSteps ? stage.steps : stage.steps}
                  stageColor={stage.color}
                  subscriptionCTA={stage.subscriptionCTA}
                  trackStepAction={trackStepAction}
                  isAnonymous={isAnonymous}
                  visitDetails={visitDetails}
                  onCaregiverModalTrigger={handleCaregiverModalTrigger}
                  onAnonymousSubscriptionCTA={handleAnonymousSubscriptionCTA}
                />
              </div>
            )
          ))}
        </div>
            
        {/* Enhanced Action Section */}
        {!showAllSteps && (
          <div className="mt-8">
            {isAnonymous ? (
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Ready for Your Real Care Journey?</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto leading-relaxed">
                      This preview shows how your personalized care journey works. Choose a care plan to connect with qualified caregivers in your area.
                    </p>
                    <Button
                      variant="default"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-2.5 h-auto shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={handleAnonymousSubscriptionCTA}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Choose Care Plan
                    </Button>
                  </CardContent>
                </Card>
                
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 text-muted-foreground hover:text-primary hover:bg-gray-50 border-gray-200 shadow-sm transition-all duration-200"
                  onClick={handleViewCompleteJourney}
                >
                  <span className="font-medium">View Complete Demo Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-between h-12 text-muted-foreground hover:text-primary hover:bg-gray-50 border-gray-200 shadow-sm transition-all duration-200"
                onClick={handleViewCompleteJourney}
              >
                <span className="font-medium">View Complete Journey</span>
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
