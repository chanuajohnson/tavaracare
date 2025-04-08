
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useRegistration } from '@/contexts/RegistrationContext';
import { formatTimeEstimate } from '@/utils/sessionHelper';

const RegistrationProgress: React.FC = () => {
  const { progress, currentStep, totalSteps, estimatedTimeRemaining, currentStepIndex } = useRegistration();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {currentStep?.title || 'Complete Your Registration'}
        </h2>
        <span className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {progress < 100 ? (
            <>
              <span className="font-medium">{formatTimeEstimate(estimatedTimeRemaining)}</span> left
            </>
          ) : (
            'Review and submit'
          )}
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  );
};

export default RegistrationProgress;
