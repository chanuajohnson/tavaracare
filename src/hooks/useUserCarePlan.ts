
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
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const carePlans = await fetchCarePlans(user.id);
        
        if (carePlans && carePlans.length > 0) {
          // Get the first active care plan, or the first plan if none are active
          const activePlan = carePlans.find(plan => plan.status === 'active') || carePlans[0];
          setCarePlanId(activePlan.id);
          setError(null);
        } else {
          setCarePlanId(null);
          setError('No care plans found');
        }
      } catch (err) {
        console.error('Error loading care plan:', err);
        setError('Failed to load care plan');
        setCarePlanId(null);
      } finally {
        setLoading(false);
      }
    };

    loadCarePlan();
  }, [user?.id]);

  return { carePlanId, loading, error };
};
