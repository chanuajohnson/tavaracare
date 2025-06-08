
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ArrowRight, Lock } from "lucide-react";
import { useSharedFamilyProgress } from "@/hooks/useSharedFamilyProgress";

interface EnhancedFamilyNextStepsPanelProps {
  showAllSteps?: boolean;
}

export const EnhancedFamilyNextStepsPanel: React.FC<EnhancedFamilyNextStepsPanelProps> = ({ 
  showAllSteps = true 
}) => {
  const { 
    loading, 
    completionPercentage, 
    nextStep, 
    getFoundationStepsOnly,
    getStepsByCategory,
    steps: allSteps
  } = useSharedFamilyProgress();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For family dashboard, only show foundation steps (1-6)
  const stepsToDisplay = showAllSteps ? allSteps : getFoundationStepsOnly();
  const foundationSteps = getStepsByCategory('foundation');
  const foundationCompletion = foundationSteps.length > 0 
    ? Math.round((foundationSteps.filter(s => s.completed).length / foundationSteps.length) * 100)
    : 0;

  // Use foundation completion for dashboard view, overall completion for full view
  const displayedCompletion = showAllSteps ? completionPercentage : foundationCompletion;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {showAllSteps ? "Your Care Journey Progress" : "Family Journey Progress"}
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {displayedCompletion}% Complete
          </Badge>
        </div>
        <Progress value={displayedCompletion} className="w-full h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {stepsToDisplay.map((step) => {
          const isCurrent = nextStep?.id === step.id;
          const isAccessible = step.accessible !== false;
          
          return (
            <div 
              key={step.id}
              className={`border rounded-lg p-4 transition-all ${
                step.completed 
                  ? 'bg-green-50 border-green-200' 
                  : isCurrent 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : isCurrent ? (
                    <Clock className="h-5 w-5 text-blue-600" />
                  ) : !isAccessible ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        step.completed ? 'text-green-700' : 
                        isCurrent ? 'text-blue-700' : 
                        'text-gray-700'
                      }`}>
                        Step {step.id}: {step.title}
                        {step.optional && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Optional
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>
                    </div>
                    
                    {step.action && isAccessible && !step.completed && (
                      <Button
                        onClick={() => step.action?.()}
                        size="sm"
                        variant={isCurrent ? "default" : "outline"}
                        className="ml-4 shrink-0"
                      >
                        {step.buttonText || "Start"}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                    
                    {!isAccessible && (
                      <Badge variant="secondary" className="ml-4 shrink-0">
                        Locked
                      </Badge>
                    )}
                    
                    {step.completed && (
                      <Badge variant="outline" className="ml-4 shrink-0 border-green-200 text-green-700">
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {!showAllSteps && foundationCompletion === 100 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-700">Foundation Complete!</h4>
                <p className="text-sm text-blue-600">
                  You've completed all foundation steps. Ready to schedule your Tavara.Care visit.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
