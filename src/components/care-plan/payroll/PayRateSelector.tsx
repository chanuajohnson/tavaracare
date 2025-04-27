
import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';

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
  
  // Check if the work log is editable based on status
  const isEditable = status === 'pending' || editMode;

  // Multiplier options - define outside to avoid recreation on each render
  const multiplierOptions = [
    { value: 1, label: '1x (Regular)' },
    { value: 1.5, label: '1.5x (Overtime)' },
    { value: 2, label: '2x (Double Time)' },
    { value: 3, label: '3x (Triple Time)' },
    { value: 'custom', label: 'Other (Custom)' }
  ];

  // Check if current multiplier is a custom value
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

  // Base rate options from $25 to $100 in $5 increments
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
      // Don't update the actual multiplier until a valid custom value is entered
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
            <Select 
              value={baseRate?.toString()} 
              onValueChange={(value) => setBaseRate(Number(value))}
              disabled={!isEditable}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Base Rate" />
              </SelectTrigger>
              <SelectContent>
                {baseRateOptions.map((rate) => (
                  <SelectItem key={rate} value={rate.toString()}>
                    ${rate}/hr
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={showCustomMultiplier ? 'custom' : rateMultiplier?.toString()} 
              onValueChange={handleMultiplierChange}
              disabled={!isEditable}
            >
              <SelectTrigger className="w-[150px]">
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
