
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { fetchFamilyProfile, fetchCareAssessment, fetchCareRecipientProfile } from '@/hooks/family/dataFetchers';
import { getFamilyReadinessStatus } from '@/hooks/family/completionCheckers';
import { DashboardCaregiverMatches } from './DashboardCaregiverMatches';
import { FamilyReadinessModal } from './FamilyReadinessModal';

export const FamilyReadinessChecker = () => {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      setShowModal(!status.allReady);
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
    <FamilyReadinessModal
      open={showModal}
      onOpenChange={setShowModal}
      onReadinessAchieved={() => {
        setIsReady(true);
        setShowModal(false);
      }}
    />
  );
};
