import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { LeadCaptureModal } from '@/components/family/LeadCaptureModal';
import { useNavigate } from 'react-router-dom';

interface DemoRegistrationCompleteButtonProps {
  completionLevel: number;
  isReady: boolean;
  sessionId: string;
  onLeadCaptured: () => void;
  className?: string;
}

export const DemoRegistrationCompleteButton: React.FC<DemoRegistrationCompleteButtonProps> = ({
  completionLevel,
  isReady,
  sessionId,
  onLeadCaptured,
  className = ''
}) => {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const navigate = useNavigate();

  // Don't show button if not ready
  if (!isReady || completionLevel < 60) {
    return null;
  }

  const handleCompleteRegistration = () => {
    setShowLeadModal(true);
  };

  const handleLeadModalClose = () => {
    setShowLeadModal(false);
  };

  const handleSkipToForm = () => {
    setShowLeadModal(false);
    // Navigate directly to the registration form with prefilled data
    navigate(`/demo/registration/family?session=${sessionId}&prefilled=true&demo_complete=true`);
  };

  return (
    <>
      <div className={`bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {completionLevel}% Complete
              </Badge>
            </div>
            
            <div className="hidden sm:block text-sm text-gray-600">
              Your information is ready for registration
            </div>
          </div>

          <Button 
            onClick={handleCompleteRegistration}
            className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Complete Registration
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          ✨ See how Tavara intelligently pre-fills your registration form from our conversation
        </div>
      </div>

      <LeadCaptureModal
        open={showLeadModal}
        onOpenChange={handleLeadModalClose}
        source="demo_registration_complete"
        onSkipToCaregiverMatching={handleSkipToForm}
      />
    </>
  );
};