
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RateType } from '@/services/care-plans/types/workLogTypes';

interface RateTypeSelectorProps {
  rateType: RateType;
  baseRate: number;
  customMultiplier: number;
  onRateTypeChange: (value: RateType) => void;
  onBaseRateChange: (value: number) => void;
  onMultiplierChange: (value: number) => void;
  isCustomRate: boolean;
}

export const RateTypeSelector = ({
  rateType,
  baseRate,
  customMultiplier,
  onRateTypeChange,
  onBaseRateChange,
  onMultiplierChange,
  isCustomRate
}: RateTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rate-type">Rate Type</Label>
        <Select value={rateType} onValueChange={onRateTypeChange}>
          <SelectTrigger id="rate-type">
            <SelectValue placeholder="Select rate type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular (1.0x)</SelectItem>
            <SelectItem value="overtime">Overtime (1.5x)</SelectItem>
            <SelectItem value="shadow">Shadow Day (0.5x)</SelectItem>
            <SelectItem value="custom">Custom Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="base-rate">Base Rate ($/hr)</Label>
        <Input
          id="base-rate"
          type="number"
          min="0"
          step="0.01"
          value={baseRate}
          onChange={(e) => onBaseRateChange(parseFloat(e.target.value) || 0)}
        />
      </div>

      {isCustomRate && (
        <div className="space-y-2">
          <Label htmlFor="rate-multiplier">Rate Multiplier</Label>
          <Input
            id="rate-multiplier"
            type="number"
            min="0.5"
            max="3.0"
            step="0.1"
            value={customMultiplier}
            onChange={(e) => onMultiplierChange(parseFloat(e.target.value) || 1)}
          />
        </div>
      )}
    </div>
  );
};
