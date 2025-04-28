
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getWorkLogById } from '@/services/care-plans/workLogService';
import { toast } from 'sonner';

interface RateState {
  baseRate: number | null;
  rateMultiplier: number | null;
  rateType: string;
}

export const useWorkLogRate = (workLogId: string, careTeamMemberId: string) => {
  const [rateState, setRateState] = useState<RateState>({
    baseRate: null,
    rateMultiplier: null,
    rateType: 'regular'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());

  const baseRate = rateState.baseRate;
  const rateMultiplier = rateState.rateMultiplier;

  // Calculate current rate based on rate type and multiplier
  const currentRate = useMemo(() => {
    const base = rateState.baseRate || 25;
    const multiplier = rateState.rateMultiplier || 1;
    
    // Apply rate multiplier based on rate type
    switch (rateState.rateType) {
      case 'overtime':
        return base * 1.5;
      case 'regular':
        return base * multiplier;
      case 'custom':
        return base * multiplier;
      default:
        return base * multiplier;
    }
  }, [rateState.baseRate, rateState.rateMultiplier, rateState.rateType]);

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
            rateMultiplier: workLog.rate_multiplier || 1,
            rateType: workLog.rate_type || 'regular'
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

  const handleSetRateType = (rateType: string) => {
    setRateState(prev => ({
      ...prev,
      rateType,
      // Set appropriate multiplier based on rate type
      rateMultiplier: rateType === 'overtime' ? 1.5 : prev.rateMultiplier
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
          rate_multiplier: rateMultiplier,
          rate_type: rateState.rateType
        })
        .eq('id', workLogId);

      if (error) throw error;

      setLastSaveTime(Date.now());
      toast.success('Pay rates updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating rates:', error);
      toast.error('Failed to update pay rates');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [workLogId, baseRate, rateMultiplier, rateState.rateType]);

  return {
    baseRate,
    setBaseRate: handleSetBaseRate,
    rateMultiplier,
    setRateMultiplier: handleSetRateMultiplier,
    rateType: rateState.rateType,
    setRateType: handleSetRateType,
    saveRates,
    currentRate,
    isLoading,
    isSaving,
    lastSaveTime
  };
};
