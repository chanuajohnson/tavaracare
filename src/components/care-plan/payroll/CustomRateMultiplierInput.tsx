
import React, { KeyboardEvent, useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CustomRateMultiplierInputProps {
  value: number;
  onChange: (value: number) => void;
  onSave?: (value: number) => Promise<boolean>;
  disabled?: boolean;
}

export const CustomRateMultiplierInput: React.FC<CustomRateMultiplierInputProps> = ({
  value,
  onChange,
  onSave,
  disabled = false
}) => {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value.toString());
  const [isSaving, setIsSaving] = useState(false);
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSave) {
      e.preventDefault();
      const currentValue = parseFloat(localValue);
      if (currentValue >= 0.5 && currentValue <= 3.0) {
        try {
          setIsSaving(true);
          const success = await onSave(currentValue);
          if (success) {
            toast.success('Rate multiplier updated');
          }
        } catch (error) {
          toast.error('Failed to update rate multiplier');
        } finally {
          setIsSaving(false);
        }
      } else {
        toast.error('Multiplier must be between 0.5x and 3.0x');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <Label htmlFor="custom-multiplier">Custom Rate Multiplier</Label>
      <Input
        id="custom-multiplier"
        type="number"
        min="0.5"
        max="3.0"
        step="0.1"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-[150px]"
        disabled={disabled || isSaving}
      />
      <p className="text-xs text-muted-foreground">
        {isSaving ? 'Saving...' : 'Enter a value between 0.5x and 3.0x and press Enter to save'}
      </p>
    </div>
  );
};
