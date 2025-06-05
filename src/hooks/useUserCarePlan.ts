
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { fetchCarePlans } from '@/services/care-plans';

export const useUserCarePlan = () => {
  const { user } = useAuth();
  const [carePlanId, setCarePlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCarePlan = async () => {
      if (!user?.id) {
        console.log('[useUserCarePlan] No user ID, skipping load');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('[useUserCarePlan] Loading care plans for user:', user.id);
        
        const carePlans = await fetchCarePlans(user.id);
        console.log('[useUserCarePlan] Fetched care plans:', carePlans);
        
        if (carePlans && carePlans.length > 0) {
          // Get the first active care plan, or the first plan if none are active
          const activePlan = carePlans.find(plan => plan.status === 'active') || carePlans[0];
          console.log('[useUserCarePlan] Selected care plan:', activePlan);
          setCarePlanId(activePlan.id);
          setError(null);
        } else {
          console.log('[useUserCarePlan] No care plans found for user:', user.id);
          setCarePlanId(null);
          setError('No care plans found');
        }
      } catch (err: any) {
        console.error('[useUserCarePlan] Error loading care plan:', err);
        
        if (err.message?.includes('Authentication') || err.message?.includes('auth.uid()')) {
          setError('Authentication issue - please try logging out and back in');
        } else {
          setError('Failed to load care plan');
        }
        setCarePlanId(null);
      } finally {
        setLoading(false);
      }
    };

    loadCarePlan();
  }, [user?.id]);

  return { carePlanId, loading, error };
};
