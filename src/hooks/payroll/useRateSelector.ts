
import { useState, useEffect } from 'react';
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
    isSaving
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

  const isEditable = status === 'pending' || editMode;

  const multiplierOptions: RateMultiplierOption[] = [
    { value: 1, label: '1x (Regular)' },
    { value: 1.5, label: '1.5x (Overtime)' },
    { value: 2, label: '2x (Double Time)' },
    { value: 3, label: '3x (Triple Time)' },
    { value: 'custom', label: 'Other (Custom)' }
  ];

  const getMultiplierDisplayValue = () => {
    if (!rateMultiplier) return '';
    
    const standardOption = multiplierOptions.find(opt => 
      typeof opt.value === 'number' && opt.value === rateMultiplier
    );
    
    if (standardOption) {
      return standardOption.label;
    }
    
    return `${rateMultiplier}x (Custom)`;
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
    baseRate,
    setBaseRate,
    rateMultiplier,
    setRateMultiplier,
    showCustomMultiplier,
    customMultiplier,
    setCustomMultiplier,
    editMode,
    isEditable,
    isLoading,
    isSaving,
    multiplierOptions,
    getMultiplierDisplayValue,
    handleMultiplierChange,
    handleSaveRates,
    toggleEditMode
  };
};
