
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { fetchProfileData, fetchDocuments } from '@/hooks/professional/dataFetchers';
import { isProfileComplete, hasDocuments } from '@/hooks/professional/completionCheckers';
import { DashboardFamilyMatches } from './DashboardFamilyMatches';
import { ProfessionalReadinessModal } from './ProfessionalReadinessModal';

export const ProfessionalReadinessChecker = () => {
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
      setShowModal(!ready);
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
    <ProfessionalReadinessModal
      open={showModal}
      onOpenChange={setShowModal}
      onReadinessAchieved={() => {
        setIsReady(true);
        setShowModal(false);
      }}
    />
  );
};
