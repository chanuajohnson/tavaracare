
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getWorkLogById } from '@/services/care-plans/workLogService';
import { toast } from 'sonner';

export const useWorkLogRate = (workLogId: string, careTeamMemberId: string) => {
  const [baseRate, setBaseRate] = useState<number | null>(null);
  const [rateMultiplier, setRateMultiplier] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      if (!workLogId || !careTeamMemberId) {
        setIsLoading(false);
        return;
      }

      try {
        const workLog = await getWorkLogById(workLogId);
        if (workLog) {
          setBaseRate(workLog.base_rate || 25);
          setRateMultiplier(workLog.rate_multiplier || 1);
        }
      } catch (error) {
        console.error('Error loading rates:', error);
        toast.error('Failed to load pay rates');
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();
  }, [workLogId, careTeamMemberId]);

  const handleSetBaseRate = async (newBaseRate: number) => {
    try {
      const { error } = await supabase
        .from('work_logs')
        .update({ base_rate: newBaseRate })
        .eq('id', workLogId);

      if (error) throw error;
      setBaseRate(newBaseRate);
      toast.success('Base rate updated successfully');
    } catch (error) {
      console.error('Error updating base rate:', error);
      toast.error('Failed to update base rate');
    }
  };

  const handleSetRateMultiplier = async (newMultiplier: number) => {
    try {
      if (newMultiplier < 0.5 || newMultiplier > 3.0) {
        toast.error('Rate multiplier must be between 0.5x and 3.0x');
        return;
      }

      const { error } = await supabase
        .from('work_logs')
        .update({ rate_multiplier: newMultiplier })
        .eq('id', workLogId);

      if (error) throw error;
      setRateMultiplier(newMultiplier);
      toast.success('Rate multiplier updated successfully');
    } catch (error) {
      console.error('Error updating rate multiplier:', error);
      toast.error('Failed to update rate multiplier');
    }
  };

  // Calculate the current effective rate
  const currentRate = (baseRate || 25) * (rateMultiplier || 1);

  return {
    baseRate,
    setBaseRate: handleSetBaseRate,
    rateMultiplier,
    setRateMultiplier: handleSetRateMultiplier,
    currentRate,
    isLoading
  };
};
