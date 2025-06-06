
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScheduleVisitModal } from "./ScheduleVisitModal";
import { JourneyStepTooltip } from "./JourneyStepTooltip";
import { JourneyPathVisualization } from "./JourneyPathVisualization";
import { useEnhancedJourneyProgress } from "@/hooks/useEnhancedJourneyProgress";
import { useIsMobile } from "@/hooks/use-mobile";
import * as LucideIcons from "lucide-react";

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
    trackStepAction
  } = useEnhancedJourneyProgress();

  // Show only the first 7 steps in the dashboard panel, all steps on the dedicated page
  const displaySteps = showAllSteps ? steps : steps.slice(0, 7);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" /> : <List className="h-4 w-4 sm:h-5 sm:w-5" />;
  };

  const getButtonText = (step: any) => {
    if (!step.accessible) {
      if (step.step_number === 4) return "Complete Above Steps";
      if (step.step_number === 8) return "Schedule Visit First";
      return "Not Available";
    }
    
    if (step.step_number === 4) {
      return step.completed ? "View Matches" : "View Matches";
    }
    
    if (step.step_number === 5) {
      return step.completed ? "Edit Medications" : "Start Setup";
    }
    
    if (step.step_number === 6) {
      return step.completed ? "Edit Meal Plans" : "Start Planning";
    }
    
    if (step.step_number === 7) {
      return step.completed ? "Modify Visit" : "Schedule Visit";
    }
    
    return step.completed ? "Edit" : "Complete";
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8 space-y-4 sm:space-y-6"
      >
        {/* Path Visualization - Only show on full page view */}
        {showAllSteps && (
          <JourneyPathVisualization 
            paths={paths}
            steps={steps}
            currentStage={currentStage}
          />
        )}

        {/* Main Progress Card */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <div className={`${isMobile ? 'flex-col space-y-3' : 'flex items-center justify-between'}`}>
              <div className="flex-1">
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
                  <List className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary flex-shrink-0`} />
                  <span className={isMobile ? 'text-base' : 'text-xl'}>
                    {showAllSteps ? "🌿 Tavara Care Journey Progress" : "Your Care Journey Progress"}
                  </span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  {showAllSteps 
                    ? "Complete these steps to get matched and begin personalized care with confidence"
                    : "Complete these steps to get matched with the right caregiver"
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
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {displaySteps.map((step) => (
                <JourneyStepTooltip
                  key={step.id}
                  title={step.title}
                  description={step.description}
                  tooltipContent={step.tooltip_content}
                  detailedExplanation={step.detailed_explanation}
                  timeEstimateMinutes={step.time_estimate_minutes}
                  isOptional={step.is_optional}
                  category={step.category}
                  onTooltipView={() => trackStepAction(step.id, 'tooltip_viewed')}
                >
                  <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    step.accessible ? 'hover:bg-gray-50' : 'bg-gray-50'
                  }`}>
                    <div className="mt-0.5 flex-shrink-0">
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      ) : (
                        <Circle className={`h-4 w-4 sm:h-5 sm:w-5 ${step.accessible ? 'text-gray-300' : 'text-gray-200'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`${isMobile ? 'flex-col space-y-2' : 'flex items-start justify-between gap-4'}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`${step.accessible ? 'text-primary' : 'text-gray-300'} flex-shrink-0`}>
                              {getIcon(step.icon_name)}
                            </div>
                            <p className={`font-medium text-sm ${
                              step.completed 
                                ? 'text-gray-500 line-through' 
                                : step.accessible 
                                  ? 'text-gray-800' 
                                  : 'text-gray-400'
                            }`}>
                              {step.title}
                            </p>
                            {step.is_optional && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Optional</span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            step.accessible ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                        <div className={`flex items-center ${isMobile ? 'justify-between' : 'gap-2'} flex-shrink-0`}>
                          {!step.completed && (
                            <div className="flex items-center text-xs text-gray-500 gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{step.accessible ? 'Pending' : 'Locked'}</span>
                            </div>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`text-xs px-2 py-1 h-auto min-h-[44px] ${isMobile ? 'min-w-[44px]' : ''} ${
                              !step.accessible
                                ? 'text-gray-400 cursor-not-allowed opacity-50'
                                : step.completed 
                                  ? 'text-blue-600 hover:text-blue-700' 
                                  : 'text-primary hover:text-primary-600'
                            }`}
                            disabled={!step.accessible}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (step.action) {
                                step.action();
                              }
                            }}
                          >
                            <span className={isMobile ? 'text-xs' : ''}>{getButtonText(step)}</span>
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </JourneyStepTooltip>
              ))}
            </div>
            
            {!showAllSteps && (
              <div className="mt-4 sm:mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-between min-h-[44px]"
                  onClick={() => navigate('/family/care-journey-progress')}
                >
                  <span className="text-sm">View Complete Journey ({steps.length} total steps)</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {showAllSteps && (
              <div className="mt-6 sm:mt-8 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/family')}
                  className="gap-2 min-h-[44px]"
                >
                  ← Back to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal 
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
      />
    </>
  );
};
