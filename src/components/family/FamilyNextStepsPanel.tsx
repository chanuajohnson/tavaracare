
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScheduleVisitModal } from "./ScheduleVisitModal";
import { useFamilyJourneyProgress } from "@/hooks/useFamilyJourneyProgress";

export const FamilyNextStepsPanel = () => {
  const navigate = useNavigate();
  const { 
    steps, 
    completionPercentage, 
    nextStep, 
    loading, 
    showScheduleModal, 
    setShowScheduleModal 
  } = useFamilyJourneyProgress();

  // Show only the first 7 steps in the dashboard panel for cleaner UI
  const dashboardSteps = steps.slice(0, 7);

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
                <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${step.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!step.completed && (
                          <div className="flex items-center text-xs text-gray-500 gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Pending</span>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-xs px-2 py-1 h-auto ${
                            step.completed 
                              ? 'text-blue-600 hover:text-blue-700' 
                              : 'text-primary hover:text-primary-600'
                          }`}
                          onClick={() => step.action && step.action()}
                        >
                          {step.buttonText}
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
    </>
  );
};
