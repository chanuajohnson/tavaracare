
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
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
  const dashboardCompletedSteps = dashboardSteps.filter(step => step.completed).length;

  // Check if first three steps are completed for step 4 access
  const canAccessMatching = steps[0]?.completed && steps[1]?.completed && steps[2]?.completed;

  const handleStepClick = (step: any) => {
    if (step.id === 4 && !canAccessMatching) {
      return;
    }
    if (step.action) {
      step.action();
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <List className="h-5 w-5 text-primary" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <List className="h-5 w-5 text-primary" />
              Your Care Journey Progress
            </CardTitle>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Complete these steps to get matched with the right caregiver</p>
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium">{completionPercentage}%</p>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {dashboardSteps.map((step) => (
                <li key={step.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className={`font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {step.title}
                      </p>
                      {!step.completed && (
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Pending</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  {(step.id === 4 || step.id === 6 || step.id === 5 || step.id === 7) ? (
                    <Button 
                      variant={step.completed ? "outline" : "ghost"} 
                      size="sm" 
                      className={`p-0 h-6 ${
                        step.id === 4 && !canAccessMatching 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : step.completed 
                            ? 'text-blue-600 hover:text-blue-700' 
                            : 'text-primary hover:text-primary-600'
                    }`}
                    disabled={step.id === 4 && !canAccessMatching}
                    onClick={() => handleStepClick(step)}
                  >
                    {step.buttonText}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                ) : (
                  <Link to={step.link || '#'}>
                    <Button 
                      variant={step.completed ? "outline" : "ghost"} 
                      size="sm" 
                      className={`p-0 h-6 ${step.completed ? 'text-blue-600 hover:text-blue-700' : 'text-primary hover:text-primary-600'}`}
                    >
                      {step.buttonText}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                )}
                </li>
              ))}
            </ul>
            
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/family/care-journey-progress')}
              >
                <span className="flex justify-between items-center w-full">
                  <span>View all tasks</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
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
