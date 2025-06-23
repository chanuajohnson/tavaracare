
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { fetchProfileData, fetchDocuments } from '@/hooks/professional/dataFetchers';
import { isProfileComplete, hasDocuments } from '@/hooks/professional/completionCheckers';
import { DashboardFamilyMatches } from './DashboardFamilyMatches';
import { ProfessionalReadinessModal } from './ProfessionalReadinessModal';
import { isModalDismissed, setModalDismissed, clearModalDismissal } from '@/utils/modalDismissalUtils';

export const ProfessionalReadinessChecker = () => {
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
      
      // Fetch profile and documents data in parallel
      const [profile, documents] = await Promise.all([
        fetchProfileData(user.id),
        fetchDocuments(user.id)
      ]);

      // Use completionCheckers.ts to determine readiness
      const profileComplete = isProfileComplete(profile);
      const documentsUploaded = hasDocuments(documents);
      
      const ready = profileComplete && documentsUploaded;
      
      console.log('Professional readiness check:', {
        userId: user.id,
        profileComplete,
        documentsUploaded,
        ready
      });
      
      setIsReady(ready);
      
      // If user becomes ready, clear dismissal state
      if (ready) {
        clearModalDismissal(user.id, 'professional');
        setShowModal(false);
      } else {
        // Only show modal automatically if not previously dismissed and not manually triggered
        const wasDismissed = isModalDismissed(user.id, 'professional');
        if (!wasDismissed && !manualTrigger) {
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking professional readiness:', error);
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
      setModalDismissed(user.id, 'professional');
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
        <span className="ml-2 text-sm text-gray-600">Checking your professional status...</span>
      </div>
    );
  }

  // If ready, show the full family matches component
  if (isReady) {
    return <DashboardFamilyMatches />;
  }

  // If not ready, show the readiness modal
  return (
    <div>
      <ProfessionalReadinessModal
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
          <p className="text-gray-600 mb-4">Complete your professional setup to access family matches</p>
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
