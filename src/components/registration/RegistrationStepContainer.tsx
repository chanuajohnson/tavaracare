
import React from 'react';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const RegistrationStepContainer: React.FC = () => {
  const {
    currentStep,
    registrationData,
    updateData,
    goToNextStep,
    goToPreviousStep,
    currentStepIndex,
    steps,
    isSubmitting,
    isStepValid,
    progress
  } = useRegistration();

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const StepComponent = currentStep.component;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const isCurrentStepValid = isStepValid();

  return (
    <div className="space-y-6">
      <div className="min-h-[300px]">
        <StepComponent
          data={registrationData}
          onUpdate={updateData}
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          isSubmitting={isSubmitting}
          progress={progress}
          isCurrentStepValid={isCurrentStepValid}
        />
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={isFirstStep || isSubmitting}
        >
          Previous
        </Button>

        <Button
          onClick={goToNextStep}
          disabled={!isCurrentStepValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLastStep ? 'Submitting...' : 'Saving...'}
            </>
          ) : (
            isLastStep ? 'Submit Registration' : 'Continue'
          )}
        </Button>
      </div>
    </div>
  );
};

export default RegistrationStepContainer;
