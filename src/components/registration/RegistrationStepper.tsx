
import React from 'react';
import { useRegistration } from '@/contexts/RegistrationContext';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';

const RegistrationStepper: React.FC = () => {
  const { steps, currentStepIndex, goToStep, isStepValid } = useRegistration();

  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex && isStepValid(index);
        const isCurrent = index === currentStepIndex;
        
        return (
          <button
            key={step.id}
            className={cn(
              "flex items-center text-left w-full px-3 py-2 rounded-md text-sm transition-colors",
              isCompleted && "text-primary hover:bg-primary/10",
              isCurrent && "bg-primary/10 font-medium text-primary",
              !isCompleted && !isCurrent && "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={() => goToStep(index)}
            disabled={!isCompleted && index !== currentStepIndex}
          >
            <span className="flex-shrink-0 mr-2">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <Circle className={cn("h-5 w-5", isCurrent ? "text-primary" : "text-muted-foreground")} />
              )}
            </span>
            <span className="truncate">{step.title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RegistrationStepper;
