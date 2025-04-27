import React, { useState, KeyboardEvent, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useWorkLogRate } from '@/hooks/payroll/useWorkLogRate';
import { CustomRateMultiplierInput } from './CustomRateMultiplierInput';
import { Button } from "@/components/ui/button";
import { Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface PayRateSelectorProps {
  workLogId: string;
  careTeamMemberId: string;
  status?: string;
}

export const PayRateSelector: React.FC<PayRateSelectorProps> = ({ 
  workLogId, 
  careTeamMemberId,
  status = 'pending'
}) => {
  const { 
    baseRate, 
    setBaseRate, 
    rateMultiplier, 
    setRateMultiplier,
    saveRates,
    isLoading,
    isSaving
  } = useWorkLogRate(workLogId, careTeamMemberId);

  const [showCustomMultiplier, setShowCustomMultiplier] = useState(false);
  const [customMultiplier, setCustomMultiplier] = useState(1);
  const [editMode, setEditMode] = useState(false);
  
  const isEditable = status === 'pending' || editMode;

  const multiplierOptions = [
    { value: 1, label: '1x (Regular)' },
    { value: 1.5, label: '1.5x (Overtime)' },
    { value: 2, label: '2x (Double Time)' },
    { value: 3, label: '3x (Triple Time)' },
    { value: 'custom', label: 'Other (Custom)' }
  ];

  useEffect(() => {
    if (rateMultiplier) {
      const isCustom = !multiplierOptions.some(opt => 
        typeof opt.value === 'number' && opt.value === rateMultiplier
      );
      if (isCustom) {
        setShowCustomMultiplier(true);
        setCustomMultiplier(rateMultiplier);
      }
    }
  }, [rateMultiplier]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading rates...</div>;
  }

  const baseRateOptions = Array.from({length: 16}, (_, i) => 25 + i * 5);

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
    } else {
      setShowCustomMultiplier(false);
      setRateMultiplier(Number(value));
    }
  };

  const handleCustomMultiplierChange = (value: number) => {
    setCustomMultiplier(value);
    if (value >= 0.5 && value <= 3.0) {
      setRateMultiplier(value);
    } else {
      toast.error("Multiplier must be between 0.5x and 3.0x");
    }
  };

  const handleSaveRates = async () => {
    const success = await saveRates();
    if (success && status !== 'pending') {
      setEditMode(false);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleRateKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isEditable) {
      e.preventDefault();
      const newRate = Number((e.target as HTMLInputElement).value);
      if (newRate >= 25 && newRate <= 100) {
        setBaseRate(newRate);
        const success = await saveRates();
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
      const success = await saveRates();
      if (success) {
        toast.success('Rate multiplier updated');
      }
    }
  };

  const handleMultiplierSave = async (newMultiplier: number) => {
    if (isEditable) {
      setRateMultiplier(newMultiplier);
      const success = await saveRates();
      if (!success) {
        toast.error('Failed to save rate multiplier');
      }
    }
  };

  return (
    <div className="space-y-2">
      {status !== 'pending' && !editMode ? (
        <div className="flex items-center space-x-2">
          <div className="text-sm">
            <span className="font-medium">${baseRate}/hr</span>
            <span className="text-muted-foreground"> × {rateMultiplier}x</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={toggleEditMode} 
            title="Edit rates"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="w-[100px]">
              <Input
                type="number"
                min={25}
                max={100}
                step={5}
                value={baseRate || ''}
                onChange={(e) => setBaseRate(Number(e.target.value))}
                onKeyDown={handleRateKeyDown}
                disabled={!isEditable}
                className="w-full"
                placeholder="Base Rate"
              />
            </div>

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
              onChange={handleCustomMultiplierChange}
              onSave={handleMultiplierSave}
              disabled={!isEditable}
            />
          )}

          {(status !== 'pending' || isSaving) && (
            <div className="flex justify-end">
              {editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleEditMode}
                  className="mr-2"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSaveRates}
                disabled={isSaving}
                className="flex items-center gap-1"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-1"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
