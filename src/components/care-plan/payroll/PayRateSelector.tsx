
import React, { KeyboardEvent } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CustomRateMultiplierInput } from './CustomRateMultiplierInput';
import { useRateSelector } from '@/hooks/payroll/useRateSelector';
import { BaseRateInput } from './rate-selector/BaseRateInput';
import { RateDisplay } from './rate-selector/RateDisplay';
import { SaveRatesButtons } from './rate-selector/SaveRatesButtons';
import { toast } from "sonner";

interface PayRateSelectorProps {
  workLogId: string;
  careTeamMemberId: string;
  status?: string;
  baseRate?: number;
  rateMultiplier?: number;
}

export const PayRateSelector: React.FC<PayRateSelectorProps> = ({ 
  workLogId, 
  careTeamMemberId,
  status = 'pending',
  baseRate: initialBaseRate,
  rateMultiplier: initialRateMultiplier
}) => {
  const {
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
  } = useRateSelector(workLogId, careTeamMemberId, status, initialBaseRate, initialRateMultiplier);

  const handleRateKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isEditable) {
      e.preventDefault();
      const newRate = Number((e.target as HTMLInputElement).value);
      if (newRate >= 25 && newRate <= 100) {
        setBaseRate(newRate);
        const success = await handleSaveRates();
        if (success) {
          toast.success('Base rate updated');
        }
      } else {
        toast.error('Base rate must be between $25 and $100');
      }
    }
  };

  const handleMultiplierKeyDown = async (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' && isEditable && !showCustomMultiplier) {
      e.preventDefault();
      e.stopPropagation();
      const success = await handleSaveRates();
      if (success) {
        toast.success('Rate multiplier updated');
      }
    }
  };

  const handleMultiplierSave = async (newMultiplier: number): Promise<boolean> => {
    if (isEditable) {
      setRateMultiplier(newMultiplier);
      const success = await handleSaveRates();
      if (!success) {
        toast.error('Failed to save rate multiplier');
      }
      return success;
    }
    return false;
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading rates...</div>;
  }

  if (status !== 'pending' && !editMode) {
    return (
      <RateDisplay
        baseRate={baseRate}
        rateMultiplier={rateMultiplier}
        onEdit={toggleEditMode}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <BaseRateInput
          baseRate={baseRate}
          isEditable={isEditable}
          onBaseRateChange={setBaseRate}
          onKeyDown={handleRateKeyDown}
        />

        <Select 
          value={showCustomMultiplier ? 'custom' : rateMultiplier?.toString()} 
          onValueChange={handleMultiplierChange}
          disabled={!isEditable}
        >
          <SelectTrigger 
            className="w-[150px]"
            onKeyDown={handleMultiplierKeyDown}
          >
            <SelectValue>
              {getMultiplierDisplayValue()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {multiplierOptions.map((option) => (
              <SelectItem 
                key={option.value.toString()} 
                value={option.value.toString()}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showCustomMultiplier && (
        <CustomRateMultiplierInput
          value={customMultiplier}
          onChange={setCustomMultiplier}
          onSave={handleMultiplierSave}
          disabled={!isEditable}
        />
      )}

      {(status !== 'pending' || isSaving) && (
        <SaveRatesButtons
          isSaving={isSaving}
          onSave={handleSaveRates}
          onCancel={toggleEditMode}
          showCancel={editMode}
        />
      )}
    </div>
  );
};
