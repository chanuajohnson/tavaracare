
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScheduleVisitModal } from "./ScheduleVisitModal";
import { CaregiverMatchingModal } from "./CaregiverMatchingModal";
import { useFamilyJourneyProgress } from "@/hooks/useFamilyJourneyProgress";

export const FamilyNextStepsPanel = () => {
  const navigate = useNavigate();
  const { 
    steps, 
    completionPercentage, 
    nextStep, 
    loading, 
    showScheduleModal, 
    setShowScheduleModal,
    showCaregiverMatchingModal,
    setShowCaregiverMatchingModal
  } = useFamilyJourneyProgress();

  // Show only the first 7 steps in the dashboard panel for cleaner UI
  const dashboardSteps = steps.slice(0, 7);

  // Helper function to get button text based on step number and completion status
  const getButtonText = (step: any) => {
    if (step.completed) {
      switch (step.step_number) {
        case 1: return "Edit";
        case 2: return "Edit";
        case 3: return "Edit";
        case 4: return "Edit";
        case 5: return "View";
        case 6: return "Edit";
        case 7: return "Edit";
        case 8: return "View";
        default: return "View";
      }
    } else {
      switch (step.step_number) {
        case 1: return "Complete";
        case 2: return "Complete";
        case 3: return "Complete";
        case 4: return "Complete";
        case 5: return "View";
        case 6: return "Start Setup";
        case 7: return "Start Planning";
        case 8: return "Schedule";
        default: return "Complete";
      }
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <List className="h-5 w-5 text-primary" />
              Your Care Journey Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
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
        className="mb-8"
      >
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-xl mb-2">
                  <List className="h-5 w-5 text-primary" />
                  Your Care Journey Progress
                </CardTitle>
                <p className="text-sm text-gray-600">Complete these steps to get matched with the right caregiver</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
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
          <CardContent>
            <div className="space-y-4">
              {dashboardSteps.map((step) => (
                <div key={step.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  step.accessible ? 'hover:bg-gray-50' : 'bg-gray-50'
                }`}>
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className={`h-5 w-5 ${step.accessible ? 'text-gray-300' : 'text-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${
                          step.completed 
                            ? 'text-gray-500 line-through' 
                            : step.accessible 
                              ? 'text-gray-800' 
                              : 'text-gray-400'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          step.accessible ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!step.completed && (
                          <div className="flex items-center text-xs text-gray-500 gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{step.accessible ? 'Pending' : 'Locked'}</span>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-xs px-2 py-1 h-auto ${
                            !step.accessible
                              ? 'text-gray-400 cursor-not-allowed opacity-50'
                              : step.completed 
                                ? 'text-blue-600 hover:text-blue-700' 
                                : 'text-primary hover:text-primary-600'
                          }`}
                          disabled={!step.accessible}
                          onClick={() => step.action && step.action()}
                        >
                          {getButtonText(step)}
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate('/family/care-journey-progress')}
              >
                <span>View Complete Journey ({steps.length} total steps)</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal 
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
      />

      {/* Caregiver Matching Modal */}
      <CaregiverMatchingModal
        open={showCaregiverMatchingModal}
        onOpenChange={setShowCaregiverMatchingModal}
        referringPagePath="/dashboard/family"
        referringPageLabel="Family Dashboard"
      />
    </>
  );
};
