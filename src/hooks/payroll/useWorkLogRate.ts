
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { RateType } from '@/services/care-plans/types/workLogTypes';

interface RateState {
  baseRate: number | null;
  rateMultiplier: number | null;
  rateType: RateType;
}

export const useWorkLogRate = (
  workLogId: string, 
  careTeamMemberId: string,
  initialBaseRate?: number,
  initialRateMultiplier?: number
) => {
  const [rateState, setRateState] = useState<RateState>({
    baseRate: initialBaseRate || null,
    rateMultiplier: initialRateMultiplier || null,
    rateType: 'regular'
  });
  const [isLoading, setIsLoading] = useState(!initialBaseRate || !initialRateMultiplier);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());

  const baseRate = rateState.baseRate;
  const rateMultiplier = rateState.rateMultiplier;

  const currentRate = useMemo(() => {
    const base = rateState.baseRate || 25;
    const multiplier = rateState.rateMultiplier || 1;
    return base * multiplier;
  }, [rateState.baseRate, rateState.rateMultiplier]);

  useEffect(() => {
    const loadRates = async () => {
      if (!workLogId || (initialBaseRate && initialRateMultiplier)) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: workLog, error } = await supabase
          .from('work_logs')
          .select('base_rate, rate_multiplier, rate_type')
          .eq('id', workLogId)
          .single();

        if (error) throw error;

        setRateState(prev => ({
          baseRate: workLog.base_rate || prev.baseRate || 25,
          rateMultiplier: workLog.rate_multiplier || prev.rateMultiplier || 1,
          rateType: workLog.rate_type || 'regular'
        }));
      } catch (error) {
        console.error('Error loading rates:', error);
        toast.error('Failed to load pay rates');
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();

    return () => {
      // Cleanup function to prevent state updates on unmounted component
      setRateState({
        baseRate: null,
        rateMultiplier: null,
        rateType: 'regular'
      });
    };
  }, [workLogId, careTeamMemberId, initialBaseRate, initialRateMultiplier]);

  const handleSetBaseRate = useCallback((newBaseRate: number) => {
    setRateState(prev => ({
      ...prev,
      baseRate: newBaseRate
    }));
  }, []);

  const handleSetRateMultiplier = useCallback((newMultiplier: number) => {
    if (newMultiplier < 0.5 || newMultiplier > 3.0) {
      toast.error('Rate multiplier must be between 0.5x and 3.0x');
      return;
    }

    setRateState(prev => ({
      ...prev,
      rateMultiplier: newMultiplier
    }));
  }, []);

  const handleSetRateType = useCallback((rateType: RateType) => {
    setRateState(prev => ({
      ...prev,
      rateType,
      rateMultiplier: rateType === 'overtime' ? 1.5 : prev.rateMultiplier
    }));
  }, []);

  const saveRates = useCallback(async (): Promise<boolean> => {
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
