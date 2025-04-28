
import React, { KeyboardEvent } from 'react';
import { Input } from "@/components/ui/input";

interface BaseRateInputProps {
  baseRate: number | null;
  isEditable: boolean;
  onBaseRateChange: (value: number) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export const BaseRateInput: React.FC<BaseRateInputProps> = ({
  baseRate,
  isEditable,
  onBaseRateChange,
  onKeyDown
}) => {
  return (
    <div className="w-[100px]">
      <Input
        type="number"
        min={25}
        max={100}
        step={5}
        value={baseRate || ''}
        onChange={(e) => onBaseRateChange(Number(e.target.value))}
        onKeyDown={onKeyDown}
        disabled={!isEditable}
        className="w-full"
        placeholder="Base Rate"
      />
    </div>
  );
};
