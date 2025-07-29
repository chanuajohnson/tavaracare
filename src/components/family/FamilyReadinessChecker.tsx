
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

  const checkReadiness = async (forceRefresh = false) => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('🔍 [FamilyReadinessChecker] Starting readiness check', {
        userId: user.id,
        forceRefresh,
        timestamp: new Date().toISOString()
      });
      
      // Fetch family data in parallel
      const [profile, assessment, story] = await Promise.all([
        fetchFamilyProfile(user.id),
        fetchCareAssessment(user.id),
        fetchCareRecipientProfile(user.id)
      ]);

      console.log('📊 [FamilyReadinessChecker] Data fetched', {
        profile: profile ? 'exists' : 'null',
        assessment: assessment ? 'exists' : 'null', 
        story: story ? 'exists' : 'null'
      });

      // Use completion checkers to determine readiness
      const status = getFamilyReadinessStatus(profile, assessment, story);
      
      console.log('✅ [FamilyReadinessChecker] Readiness status determined:', {
        userId: user.id,
        registrationComplete: status.registrationComplete,
        careAssessmentComplete: status.careAssessmentComplete,
        storyComplete: status.storyComplete,
        allReady: status.allReady,
        shouldShowModal: !status.allReady
      });
      
      setIsReady(status.allReady);
      setShowModal(!status.allReady);
      
      // If user is ready but modal was showing, log successful transition
      if (status.allReady && showModal) {
        console.log('🎉 [FamilyReadinessChecker] User became ready! Hiding modal.');
      }
    } catch (error) {
      console.error('❌ [FamilyReadinessChecker] Error checking family readiness:', error);
      setIsReady(false);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Check readiness on mount and when user changes
  useEffect(() => {
    console.log('🔄 [FamilyReadinessChecker] useEffect triggered', {
      hasUser: !!user,
      userId: user?.id
    });
    
    if (user) {
      checkReadiness();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Add periodic refresh to catch data changes that may have happened elsewhere
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      console.log('⏰ [FamilyReadinessChecker] Periodic readiness check');
      checkReadiness(true);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [user?.id]);

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
