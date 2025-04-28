
import { useState, useEffect, KeyboardEvent } from 'react';
import { toast } from "sonner";
import { useWorkLogRateContext } from './WorkLogRateContext';
import type { RateType } from '@/services/care-plans/types/workLogTypes';

export interface RateMultiplierOption {
  value: number | 'custom';
  label: string;
}

export const useRateSelector = (
  status: string = 'pending'
) => {
  const { 
    rateState,
    setBaseRate, 
    setRateMultiplier,
    setRateType,
    saveRates,
    isLoading,
  } = useWorkLogRateContext();

  const [showCustomMultiplier, setShowCustomMultiplier] = useState(false);
  const [customMultiplier, setCustomMultiplier] = useState(() => rateState.rateMultiplier || 1);
  const [editMode, setEditMode] = useState(false);

  // Update custom multiplier when rateMultiplier changes
  useEffect(() => {
    if (rateState.rateMultiplier) {
      const isStandardMultiplier = [1, 1.5, 2, 3].includes(rateState.rateMultiplier);
      setShowCustomMultiplier(!isStandardMultiplier);
      setCustomMultiplier(rateState.rateMultiplier);
    }
  }, [rateState.rateMultiplier]);

  const isEditable = status === 'pending' || editMode;

  const multiplierOptions: RateMultiplierOption[] = [
    { value: 1, label: '1x (Regular)' },
    { value: 1.5, label: '1.5x (Overtime)' },
    { value: 2, label: '2x (Double Time)' },
    { value: 3, label: '3x (Triple Time)' },
    { value: 'custom', label: 'Other (Custom)' }
  ];

  const getMultiplierDisplayValue = () => {
    if (!rateState.rateMultiplier) return '';
    
    const standardOption = multiplierOptions.find(opt => 
      typeof opt.value === 'number' && opt.value === rateState.rateMultiplier
    );
    
    if (standardOption) {
      return standardOption.label;
    }
    
    return `${rateState.rateMultiplier}x (Custom)`;
  };

  const handleMultiplierChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomMultiplier(true);
      setRateType('custom');
    } else {
      setShowCustomMultiplier(false);
      const numValue = Number(value);
      setRateMultiplier(numValue);
      setRateType(numValue === 1 ? 'regular' : numValue === 1.5 ? 'overtime' : 'custom');
    }
  };

  const handleSaveRates = async (): Promise<boolean> => {
    const success = await saveRates();
    if (success && status !== 'pending') {
      setEditMode(false);
    }
    return success;
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return {
    baseRate: rateState.baseRate,
    setBaseRate,
    rateMultiplier: rateState.rateMultiplier,
    setRateMultiplier,
    showCustomMultiplier,
    customMultiplier,
    setCustomMultiplier,
    editMode,
    isEditable,
    isLoading,
    isSaving: rateState.isSaving,
    multiplierOptions,
    getMultiplierDisplayValue,
    handleMultiplierChange,
    handleSaveRates,
    toggleEditMode,
    isDirty: rateState.isDirty
  };
};
