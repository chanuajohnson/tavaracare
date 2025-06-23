
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { fetchFamilyProfile, fetchCareAssessment, fetchCareRecipientProfile } from '@/hooks/family/dataFetchers';
import { getFamilyReadinessStatus } from '@/hooks/family/completionCheckers';
import { DashboardCaregiverMatches } from './DashboardCaregiverMatches';
import { FamilyReadinessModal } from './FamilyReadinessModal';
import { isModalDismissed, setModalDismissed, clearModalDismissal } from '@/utils/modalDismissalUtils';

export const FamilyReadinessChecker = () => {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [manualTrigger, setManualTrigger] = useState(false);

  const checkReadiness = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch family data in parallel
      const [profile, assessment, story] = await Promise.all([
        fetchFamilyProfile(user.id),
        fetchCareAssessment(user.id),
        fetchCareRecipientProfile(user.id)
      ]);

      // Use completion checkers to determine readiness
      const status = getFamilyReadinessStatus(profile, assessment, story);
      
      console.log('Family readiness check:', {
        userId: user.id,
        registrationComplete: status.registrationComplete,
        careAssessmentComplete: status.careAssessmentComplete,
        storyComplete: status.storyComplete,
        allReady: status.allReady
      });
      
      setIsReady(status.allReady);
      
      // If user becomes ready, clear dismissal state
      if (status.allReady) {
        clearModalDismissal(user.id, 'family');
        setShowModal(false);
      } else {
        // Only show modal automatically if not previously dismissed and not manually triggered
        const wasDismissed = isModalDismissed(user.id, 'family');
        if (!wasDismissed && !manualTrigger) {
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking family readiness:', error);
      setIsReady(false);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkReadiness();
    }
  }, [user]);

  const handleModalClose = (open: boolean) => {
    if (!open && user?.id) {
      // Mark modal as dismissed when user closes it
      setModalDismissed(user.id, 'family');
    }
    setShowModal(open);
    setManualTrigger(false);
  };

  const handleManualOpen = () => {
    setManualTrigger(true);
    setShowModal(true);
  };

  // Show loading state while checking readiness
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-gray-600">Checking your family status...</span>
      </div>
    );
  }

  // If ready, show the full caregiver matches component
  if (isReady) {
    return <DashboardCaregiverMatches />;
  }

  // If not ready, show the readiness modal
  return (
    <div>
      <FamilyReadinessModal
        open={showModal}
        onOpenChange={handleModalClose}
        onReadinessAchieved={() => {
          setIsReady(true);
          setShowModal(false);
        }}
      />
      
      {/* Button to manually open modal if dismissed */}
      {!showModal && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Complete your family setup to access caregiver matches</p>
          <button
            onClick={handleManualOpen}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Check Requirements
          </button>
        </div>
      )}
    </div>
  );
};
