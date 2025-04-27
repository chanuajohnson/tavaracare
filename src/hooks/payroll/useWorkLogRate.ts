
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getWorkLogById } from '@/services/care-plans/workLogService';
import { toast } from 'sonner';
import { useMemo } from 'react';

interface RateState {
  baseRate: number | null;
  rateMultiplier: number | null;
}

export const useWorkLogRate = (workLogId: string, careTeamMemberId: string) => {
  const [rateState, setRateState] = useState<RateState>({
    baseRate: null,
    rateMultiplier: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  
  const baseRate = rateState.baseRate;
  const rateMultiplier = rateState.rateMultiplier;

  const currentRate = useMemo(() => {
    return (rateState.baseRate || 25) * (rateState.rateMultiplier || 1);
  }, [rateState.baseRate, rateState.rateMultiplier]);

  useEffect(() => {
    const loadRates = async () => {
      if (!workLogId || !careTeamMemberId) {
        setIsLoading(false);
        return;
      }

      try {
        const workLog = await getWorkLogById(workLogId);
        if (workLog) {
          setRateState({
            baseRate: workLog.base_rate || 25,
            rateMultiplier: workLog.rate_multiplier || 1
          });
        }
      } catch (error) {
        console.error('Error loading rates:', error);
        toast.error('Failed to load pay rates');
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();
  }, [workLogId, careTeamMemberId, lastSaveTime]);

  const handleSetBaseRate = (newBaseRate: number) => {
    setRateState(prev => ({
      ...prev,
      baseRate: newBaseRate
    }));
  };

  const handleSetRateMultiplier = (newMultiplier: number) => {
    if (newMultiplier < 0.5 || newMultiplier > 3.0) {
      toast.error('Rate multiplier must be between 0.5x and 3.0x');
      return;
    }

    setRateState(prev => ({
      ...prev,
      rateMultiplier: newMultiplier
    }));
  };

  const saveRates = useCallback(async () => {
    if (!workLogId || baseRate === null || rateMultiplier === null) {
      return false;
    }

    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('work_logs')
        .update({ 
          base_rate: baseRate, 
          rate_multiplier: rateMultiplier 
        })
        .eq('id', workLogId);

      if (error) throw error;

      setLastSaveTime(Date.now()); // Trigger a refresh
      return true;
    } catch (error) {
      console.error('Error updating rates:', error);
      toast.error('Failed to update pay rates');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [workLogId, baseRate, rateMultiplier]);

  return {
    baseRate,
    setBaseRate: handleSetBaseRate,
    rateMultiplier,
    setRateMultiplier: handleSetRateMultiplier,
    saveRates,
    currentRate,
    isLoading,
    isSaving,
    lastSaveTime
  };
};
