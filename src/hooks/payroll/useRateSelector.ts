
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { useWorkLogRate } from './useWorkLogRate';
import type { RateType } from '@/services/care-plans/types/workLogTypes';

export interface RateMultiplierOption {
  value: number | 'custom';
  label: string;
}

export const useRateSelector = (
  workLogId: string,
  careTeamMemberId: string,
  status: string = 'pending',
  initialBaseRate?: number,
  initialRateMultiplier?: number
) => {
  const { 
    baseRate, 
    setBaseRate, 
    rateMultiplier, 
    setRateMultiplier,
    rateType,
    setRateType,
    saveRates,
    isLoading,
    isSaving,
    lastSaveTime
  } = useWorkLogRate(workLogId, careTeamMemberId, initialBaseRate, initialRateMultiplier);

  const [showCustomMultiplier, setShowCustomMultiplier] = useState(false);
  const [customMultiplier, setCustomMultiplier] = useState(() => initialRateMultiplier || 1);
  const [editMode, setEditMode] = useState(false);

  // Set custom multiplier mode if initial rate multiplier isn't a standard value
  useEffect(() => {
    if (rateMultiplier) {
      const isStandardMultiplier = [1, 1.5, 2, 3].includes(rateMultiplier);
      setShowCustomMultiplier(!isStandardMultiplier);
      setCustomMultiplier(rateMultiplier);
    }
  }, [rateMultiplier]);

  // If the multiplier changes due to real-time updates, update our local state
  useEffect(() => {
    if (rateMultiplier) {
      setCustomMultiplier(rateMultiplier);
    }
  }, [rateMultiplier, lastSaveTime]);

  const isEditable = status === 'pending' || editMode;

  const multiplierOptions: RateMultiplierOption[] = [
    { value: 1, label: '1x (Regular)' },
    { value: 1.5, label: '1.5x (Overtime)' },
    { value: 2, label: '2x (Double Time)' },
    { value: 3, label: '3x (Triple Time)' },
    { value: 'custom', label: 'Other (Custom)' }
  ];

  const getMultiplierDisplayValue = useCallback(() => {
    if (!rateMultiplier) return '';
    
    const standardOption = multiplierOptions.find(opt => 
      typeof opt.value === 'number' && opt.value === rateMultiplier
    );
    
    if (standardOption) {
      return standardOption.label;
    }
    
    return `${rateMultiplier}x (Custom)`;
  }, [rateMultiplier, multiplierOptions]);

  const handleMultiplierChange = useCallback((value: string) => {
    if (value === 'custom') {
      setShowCustomMultiplier(true);
      setRateType('custom');
    } else {
      setShowCustomMultiplier(false);
      const numValue = Number(value);
      setRateMultiplier(numValue);
      
      // Set the appropriate rate type based on the multiplier value
      if (numValue === 1) {
        setRateType('regular');
      } else if (numValue === 1.5) {
        setRateType('overtime');
      } else {
        setRateType('custom');
      }
      
      // Auto-save when selecting a standard multiplier option
      if (status === 'pending' || editMode) {
        saveRates().then(success => {
          if (success) {
            toast.success(`Rate updated to ${numValue}x`);
          }
        });
      }
    }
  }, [setRateMultiplier, setRateType, status, editMode, saveRates]);

  const handleSaveRates = async (): Promise<boolean> => {
    const success = await saveRates();
    if (success) {
      if (status !== 'pending') {
        setEditMode(false);
      }
      toast.success('Pay rate updated successfully');
    }
    return success;
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleSetCustomMultiplier = useCallback((value: number) => {
    setCustomMultiplier(value);
    setRateMultiplier(value);
  }, [setRateMultiplier]);

  return {
    baseRate,
    setBaseRate,
    rateMultiplier,
    setRateMultiplier,
    showCustomMultiplier,
    customMultiplier,
    setCustomMultiplier: handleSetCustomMultiplier,
    editMode,
    isEditable,
    isLoading,
    isSaving,
    lastSaveTime,
    multiplierOptions,
    getMultiplierDisplayValue,
    handleMultiplierChange,
    handleSaveRates,
    toggleEditMode
  };
};
