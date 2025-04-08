
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationProvider } from '@/contexts/RegistrationContext';
import { RegistrationStep } from '@/types/registration';
import RegistrationStepper from './RegistrationStepper';
import RegistrationProgress from './RegistrationProgress';
import RegistrationStepContainer from './RegistrationStepContainer';

interface RegistrationWizardProps {
  steps: RegistrationStep[];
  registrationFlowType: 'family' | 'professional' | 'community';
  initialData?: Record<string, any>;
  onComplete?: (data: Record<string, any>) => void;
}

const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ 
  steps,
  registrationFlowType,
  initialData,
  onComplete
}) => {
  return (
    <RegistrationProvider 
      steps={steps} 
      registrationFlowType={registrationFlowType}
      initialData={initialData}
      onComplete={onComplete}
    >
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="border rounded-lg shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 border-b bg-muted/20">
              <RegistrationProgress />
            </div>
            
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/4 border-r bg-muted/10 p-4">
                <RegistrationStepper />
              </div>
              
              <div className="w-full md:w-3/4 p-6">
                <RegistrationStepContainer />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RegistrationProvider>
  );
};

export default RegistrationWizard;
