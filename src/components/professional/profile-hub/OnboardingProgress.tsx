
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronRight, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

interface OnboardingProgressProps {
  steps: Array<{
    id: number;
    title: string;
    description: string;
    completed: boolean;
    link: string;
    action: string;
  }>;
  completedSteps: number;
  progress: number;
  renderActionButton: (step: {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    link: string;
    action: string;
  }) => React.ReactNode;
}

export function OnboardingProgress({ 
  steps, 
  completedSteps, 
  progress, 
  renderActionButton 
}: OnboardingProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          Onboarding Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Progress</span>
            <span>{completedSteps}/{steps.length} steps</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-4 mt-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium">{step.title}</h4>
                  {renderActionButton(step)}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
