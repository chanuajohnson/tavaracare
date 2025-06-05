
import React from 'react';
import { FamilyNextStepsPanel } from './FamilyNextStepsPanel';
import { PostTrialConversionModal } from './PostTrialConversionModal';
import { useTrialConversion } from '@/hooks/useTrialConversion';

export const FamilyDashboard = () => {
  const { 
    showConversionModal, 
    setShowConversionModal, 
    trialAmount,
    loading 
  } = useTrialConversion();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FamilyNextStepsPanel />
      
      <PostTrialConversionModal
        open={showConversionModal}
        onOpenChange={setShowConversionModal}
        trialAmount={trialAmount}
      />
    </div>
  );
};
