
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { RateType } from '@/services/care-plans/types/workLogTypes';

interface RateState {
  baseRate: number;
  rateMultiplier: number;
  rateType: RateType;
  currentRate: number;
  isDirty: boolean;
  isSaving: boolean;
  lastSaveTime: number;
}

interface WorkLogRateContextType {
  rateState: RateState;
  setBaseRate: (rate: number) => void;
  setRateMultiplier: (multiplier: number) => void;
  setRateType: (type: RateType) => void;
  saveRates: () => Promise<boolean>;
  isLoading: boolean;
}

const initialRateState: RateState = {
  baseRate: 25,
  rateMultiplier: 1,
  rateType: 'regular',
  currentRate: 25,
  isDirty: false,
  isSaving: false,
  lastSaveTime: 0,
};

const WorkLogRateContext = createContext<WorkLogRateContextType | null>(null);

export const WorkLogRateProvider: React.FC<{
  children: React.ReactNode;
  workLogId: string;
  careTeamMemberId: string;
  initialBaseRate?: number;
  initialRateMultiplier?: number;
}> = ({
  children,
  workLogId,
  careTeamMemberId,
  initialBaseRate,
  initialRateMultiplier,
}) => {
  const [rateState, setRateState] = useState<RateState>({
    ...initialRateState,
    baseRate: initialBaseRate || 25,
    rateMultiplier: initialRateMultiplier || 1,
    currentRate: (initialBaseRate || 25) * (initialRateMultiplier || 1),
  });
  const [isLoading, setIsLoading] = useState(!initialBaseRate || !initialRateMultiplier);

  // Load rates from the database if not provided initially
  useEffect(() => {
    const loadRates = async () => {
      // Skip loading if we already have initial values or no workLogId
      if (!workLogId || (initialBaseRate && initialRateMultiplier)) {
        setRateState(prev => ({
          ...prev,
          baseRate: initialBaseRate || 25,
          rateMultiplier: initialRateMultiplier || 1,
          currentRate: (initialBaseRate || 25) * (initialRateMultiplier || 1),
          isDirty: false,
        }));
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

        const baseRate = workLog.base_rate || 25;
        const rateMultiplier = workLog.rate_multiplier || 1;
        
        setRateState({
          baseRate,
          rateMultiplier,
          rateType: workLog.rate_type || 'regular',
          currentRate: baseRate * rateMultiplier,
          isDirty: false,
          isSaving: false,
          lastSaveTime: Date.now(),
        });
      } catch (error) {
        console.error('Error loading rates:', error);
        toast.error('Failed to load pay rates');
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();

    // Set up real-time subscription for rate changes
    const rateSubscription = supabase
      .channel('work_log_rate_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'work_logs',
          filter: `id=eq.${workLogId}`
        },
        (payload) => {
          // Only update if the change came from another client
          const newData = payload.new;
          if (newData && !rateState.isSaving) {
            const baseRate = newData.base_rate || 25;
            const rateMultiplier = newData.rate_multiplier || 1;
            
            setRateState(prev => ({
              ...prev,
              baseRate, 
              rateMultiplier,
              rateType: newData.rate_type || 'regular',
              currentRate: baseRate * rateMultiplier,
              isDirty: false,
              lastSaveTime: Date.now(),
            }));
          }
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(rateSubscription);
    };
  }, [workLogId, careTeamMemberId, initialBaseRate, initialRateMultiplier]);

  // Immediately calculate the current rate whenever base rate or multiplier changes
  useEffect(() => {
    setRateState(prev => ({
      ...prev,
      currentRate: prev.baseRate * prev.rateMultiplier,
      isDirty: true,
    }));
  }, [rateState.baseRate, rateState.rateMultiplier]);

  const setBaseRate = useCallback((newBaseRate: number) => {
    setRateState(prev => ({
      ...prev,
      baseRate: newBaseRate,
      isDirty: true,
    }));
  }, []);

  const setRateMultiplier = useCallback((newMultiplier: number) => {
    if (newMultiplier < 0.5 || newMultiplier > 3.0) {
      toast.error('Rate multiplier must be between 0.5x and 3.0x');
      return;
    }

    setRateState(prev => ({
      ...prev,
      rateMultiplier: newMultiplier,
      isDirty: true,
    }));
  }, []);

  const setRateType = useCallback((rateType: RateType) => {
    // Handle automatic multiplier adjustment for specific rate types
    let multiplier = rateState.rateMultiplier;
    if (rateType === 'regular') multiplier = 1;
    else if (rateType === 'overtime') multiplier = 1.5;
    
    setRateState(prev => ({
      ...prev,
      rateType,
      rateMultiplier: multiplier,
      isDirty: true,
    }));
  }, [rateState.rateMultiplier]);

  const saveRates = useCallback(async (): Promise<boolean> => {
    if (!workLogId || !rateState.isDirty) {
      return true;
    }

    setRateState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const { error } = await supabase
        .from('work_logs')
        .update({ 
          base_rate: rateState.baseRate,
          rate_multiplier: rateState.rateMultiplier,
          rate_type: rateState.rateType
        })
        .eq('id', workLogId);

      if (error) throw error;

      setRateState(prev => ({
        ...prev,
        isSaving: false,
        isDirty: false,
        lastSaveTime: Date.now(),
      }));
      
      toast.success('Pay rates updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating rates:', error);
      toast.error('Failed to update pay rates');
      
      setRateState(prev => ({
        ...prev,
        isSaving: false,
      }));
      return false;
    }
  }, [workLogId, rateState.baseRate, rateState.rateMultiplier, rateState.rateType, rateState.isDirty]);

  return (
    <WorkLogRateContext.Provider 
      value={{ 
        rateState,
        setBaseRate, 
        setRateMultiplier, 
        setRateType,
        saveRates,
        isLoading,
      }}
    >
      {children}
    </WorkLogRateContext.Provider>
  );
};

export const useWorkLogRateContext = () => {
  const context = useContext(WorkLogRateContext);
  if (!context) {
    throw new Error('useWorkLogRateContext must be used within a WorkLogRateProvider');
  }
  return context;
};
