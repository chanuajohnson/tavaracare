
import { useState, useEffect } from 'react';
import { useAuth } from "@/components/providers/AuthProvider";
import { useSharedFamilyProgress } from './useSharedFamilyProgress';

interface VisitDetails {
  date?: string;
  time?: string;
  type?: 'virtual' | 'in_person';
  status?: string;
}

export const useEnhancedJourneyProgress = () => {
  const { user } = useAuth();
  const sharedProgress = useSharedFamilyProgress();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCancelVisitModal, setShowCancelVisitModal] = useState(false);
  const [visitDetails, setVisitDetails] = useState<VisitDetails | null>(null);

  // Extract visit details from the shared progress data
  useEffect(() => {
    // Get visit details from the schedule visit step (step 7)
    const scheduleStep = sharedProgress.steps.find(step => step.id === 7);
    if (scheduleStep?.completed) {
      // Extract visit details from step data if available
      setVisitDetails({
        status: 'scheduled',
        type: 'virtual' // Default, could be extracted from actual data
      });
    }
  }, [sharedProgress.steps]);

  const onVisitScheduled = () => {
    setShowScheduleModal(false);
    // Refresh progress data by triggering a re-fetch
    // The shared progress hook will handle this automatically
  };

  const onVisitCancelled = () => {
    setShowCancelVisitModal(false);
    setVisitDetails(null);
    // Refresh progress data
  };

  return {
    ...sharedProgress,
    showScheduleModal,
    setShowScheduleModal,
    showCancelVisitModal,
    setShowCancelVisitModal,
    visitDetails,
    onVisitScheduled,
    onVisitCancelled
  };
};
