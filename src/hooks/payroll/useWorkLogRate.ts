
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  getRatesForWorkLog, 
  updateWorkLogBaseRateAndMultiplier 
} from '@/services/care-plans/payrollService';

export const useWorkLogRate = (workLogId: string, careTeamMemberId: string) => {
  const [baseRate, setBaseRate] = useState<number | null>(null);
  const [rateMultiplier, setRateMultiplier] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      setIsLoading(true);
      try {
        const { baseRate: savedBaseRate, rateMultiplier: savedMultiplier } = 
          await getRatesForWorkLog(workLogId, careTeamMemberId);
        
        setBaseRate(savedBaseRate);
        setRateMultiplier(savedMultiplier);
      } catch (error) {
        console.error('Error loading rates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();
  }, [workLogId, careTeamMemberId]);

  const handleSetBaseRate = async (newBaseRate: number) => {
    try {
      await updateWorkLogBaseRateAndMultiplier(workLogId, newBaseRate, rateMultiplier || 1);
      setBaseRate(newBaseRate);
    } catch (error) {
      console.error('Error updating base rate:', error);
    }
  };

  const handleSetRateMultiplier = async (newMultiplier: number) => {
    try {
      await updateWorkLogBaseRateAndMultiplier(workLogId, baseRate || 25, newMultiplier);
      setRateMultiplier(newMultiplier);
    } catch (error) {
      console.error('Error updating rate multiplier:', error);
    }
  };

  // Get the currently calculated rate
  const getCurrentRate = (): number => {
    return (baseRate || 25) * (rateMultiplier || 1);
  };

  return {
    baseRate,
    setBaseRate: handleSetBaseRate,
    rateMultiplier,
    setRateMultiplier: handleSetRateMultiplier,
    currentRate: getCurrentRate(),
    isLoading
  };
};
