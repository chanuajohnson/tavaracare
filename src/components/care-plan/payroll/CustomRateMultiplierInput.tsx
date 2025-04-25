
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomRateMultiplierInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const CustomRateMultiplierInput: React.FC<CustomRateMultiplierInputProps> = ({
  value,
  onChange
}) => {
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
        className="w-[150px]"
      />
      <p className="text-xs text-muted-foreground">Enter a value between 0.5x and 3.0x</p>
    </div>
  );
};
