
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
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);

  const baseRate = rateState.baseRate;
  const rateMultiplier = rateState.rateMultiplier;

  const currentRate = useMemo(() => {
    if (baseRate === null || rateMultiplier === null) return null;
    return baseRate * rateMultiplier;
  }, [baseRate, rateMultiplier]);

  // Initialize or update state when workLogId or initialValues change
  useEffect(() => {
    const loadRates = async () => {
      // Skip loading if we already have initial values
      if (initialBaseRate && initialRateMultiplier) {
        setRateState({
          baseRate: initialBaseRate,
          rateMultiplier: initialRateMultiplier,
          rateType: 'regular'
        });
        setIsLoading(false);
        return;
      }

      if (!workLogId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data: workLog, error } = await supabase
          .from('work_logs')
          .select('base_rate, rate_multiplier, rate_type')
          .eq('id', workLogId)
          .single();

        if (error) throw error;

        setRateState({
          baseRate: workLog.base_rate || 25,
          rateMultiplier: workLog.rate_multiplier || 1,
          rateType: workLog.rate_type || 'regular'
        });
      } catch (error) {
        console.error('Error loading rates:', error);
        toast.error('Failed to load pay rates');
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();
  }, [workLogId, careTeamMemberId, initialBaseRate, initialRateMultiplier]);

  // Setup real-time subscription to work_logs table changes
  useEffect(() => {
    if (!workLogId) return;
    
    const channel = supabase
      .channel('work_logs_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'work_logs',
          filter: `id=eq.${workLogId}`
        }, 
        (payload) => {
          const { new: newData } = payload;
          if (newData) {
            setRateState({
              baseRate: newData.base_rate || 25,
              rateMultiplier: newData.rate_multiplier || 1,
              rateType: newData.rate_type || 'regular'
            });
            // Trigger UI update
            setLastSaveTime(Date.now());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workLogId]);

  const handleSetBaseRate = useCallback((newBaseRate: number) => {
    setRateState(prev => ({
      ...prev,
      baseRate: newBaseRate
    }));
    // Update lastSaveTime to trigger UI updates immediately for optimistic rendering
    setLastSaveTime(Date.now());
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
    // Update lastSaveTime to trigger UI updates immediately for optimistic rendering
    setLastSaveTime(Date.now());
  }, []);

  const handleSetRateType = useCallback((rateType: RateType) => {
    setRateState(prev => ({
      ...prev,
      rateType,
      rateMultiplier: rateType === 'overtime' ? 1.5 : prev.rateMultiplier
    }));
    // Update lastSaveTime to trigger UI updates
    setLastSaveTime(Date.now());
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

      // Update timestamp to trigger UI updates
      const timestamp = Date.now();
      setLastSaveTime(timestamp);
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
