
import React, { KeyboardEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CustomRateMultiplierInputProps {
  value: number;
  onChange: (value: number) => void;
  onSave?: (value: number) => Promise<void>;
  disabled?: boolean;
}

export const CustomRateMultiplierInput: React.FC<CustomRateMultiplierInputProps> = ({
  value,
  onChange,
  onSave,
  disabled = false
}) => {
  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSave) {
      e.preventDefault();
      const currentValue = parseFloat((e.target as HTMLInputElement).value);
      if (currentValue >= 0.5 && currentValue <= 3.0) {
        try {
          await onSave(currentValue);
          toast.success('Rate multiplier updated');
        } catch (error) {
          toast.error('Failed to update rate multiplier');
        }
      } else {
        toast.error('Multiplier must be between 0.5x and 3.0x');
      }
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
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 1)}
        onKeyDown={handleKeyDown}
        className="w-[150px]"
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">Enter a value between 0.5x and 3.0x and press Enter to save</p>
    </div>
  );
};
