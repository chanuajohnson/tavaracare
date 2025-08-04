
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


  const checkReadiness = async (forceRefresh = false) => {
    if (!user?.id) {
      console.log('🔍 [ProfessionalReadinessChecker] No user ID, setting loading to false');

      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      console.log('🔍 [ProfessionalReadinessChecker] Starting readiness check', {
        userId: user.id,
        forceRefresh,
        timestamp: new Date().toISOString()
      });

      
      // Fetch profile and documents data in parallel
      const [profile, documents] = await Promise.all([
        fetchProfileData(user.id),
        fetchDocuments(user.id)
      ]);

      console.log('📊 [ProfessionalReadinessChecker] Data fetched:', {
        profile: profile ? 'exists' : 'null',
        documentsCount: documents ? documents.length : 0,
        documentTypes: documents?.map(d => d.document_type) || []

      });

      // Use completionCheckers.ts to determine readiness
      const profileComplete = isProfileComplete(profile);
      const documentsUploaded = hasDocuments(documents);
      
      const ready = profileComplete && documentsUploaded;
      

      console.log('✅ [ProfessionalReadinessChecker] Readiness status determined:', {
        userId: user.id,
        profileComplete,
        documentsUploaded,
        ready,
        shouldShowModal: !ready

      });
      
      setIsReady(ready);
      
      // Show modal if NOT ready - immediate display without delay
      if (!ready) {

        console.log('❌ [ProfessionalReadinessChecker] User not ready, showing modal immediately');
        setShowModal(true);
      } else {
        console.log('🎉 [ProfessionalReadinessChecker] User is ready, hiding modal');
        setShowModal(false);
        
        // If user just became ready, log successful transition
        if (showModal) {
          console.log('🎉 [ProfessionalReadinessChecker] User became ready! Modal will hide.');
        }
      }
    } catch (error) {
      console.error('❌ [ProfessionalReadinessChecker] Error checking professional readiness:', error);

      setIsReady(false);
      setShowModal(true); // Show modal on error to be safe
    } finally {
      setIsLoading(false);
    }
  };


  // Check readiness on mount and when user changes
  useEffect(() => {
    console.log('🔄 [ProfessionalReadinessChecker] useEffect triggered', {
      hasUser: !!user,
      userId: user?.id
    });
    
    if (user) {
      checkReadiness();
    } else {
      console.log('🔍 [ProfessionalReadinessChecker] No user, setting loading to false');

      setIsLoading(false);
    }
  }, [user]);


  // Add periodic refresh to catch data changes that may have happened elsewhere
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      console.log('⏰ [ProfessionalReadinessChecker] Periodic readiness check');
      checkReadiness(true);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [user?.id]);


  console.log('[ProfessionalReadinessChecker] Render state:', {
    isLoading,
    isReady,
    showModal,
    hasUser: !!user
  });

  // Always render a container with the modal
  return (
    <div className="professional-readiness-container">
      {/* Show loading state while checking readiness */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-gray-600">Checking your professional status...</span>
        </div>
      )}

      {/* If ready and not loading, show the full family matches component */}
      {!isLoading && isReady && (
        <DashboardFamilyMatches />
      )}

      {/* If not ready and not loading, show a placeholder while modal handles the interaction */}
      {!isLoading && !isReady && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-gray-600">Complete your professional setup to access family matches</p>
          </div>
        </div>
      )}

      {/* Always render the modal - it controls its own visibility */}
      <ProfessionalReadinessModal
        open={showModal}
        onOpenChange={(open) => {
          console.log('[ProfessionalReadinessChecker] Modal open state changed to:', open);
          setShowModal(open);
        }}
        onReadinessAchieved={() => {
          console.log('[ProfessionalReadinessChecker] Readiness achieved, refreshing...');
          setIsReady(true);
          setShowModal(false);
          // Optionally refresh the data
          checkReadiness();
        }}
      />
    </div>
  );
};
