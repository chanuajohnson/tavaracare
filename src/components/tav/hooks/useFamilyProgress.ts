
import { useSharedFamilyJourneyData } from '@/hooks/useSharedFamilyJourneyData';
import { useAuth } from '@/components/providers/AuthProvider';

// Export the shared family journey data as the family progress for TAV
export const useFamilyProgress = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  return useSharedFamilyJourneyData(userId);
};
