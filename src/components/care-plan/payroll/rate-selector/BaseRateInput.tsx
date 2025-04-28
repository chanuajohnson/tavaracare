
import React, { KeyboardEvent, useState, useEffect } from 'react';
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
  // Local state for immediate UI feedback
  const [localBaseRate, setLocalBaseRate] = useState<string>(baseRate ? baseRate.toString() : '');

  // Update local state when prop changes
  useEffect(() => {
    if (baseRate !== null) {
      setLocalBaseRate(baseRate.toString());
    }
  }, [baseRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalBaseRate(value);
    if (value && !isNaN(Number(value))) {
      onBaseRateChange(Number(value));
    }
  };

  return (
    <div className="w-[100px]">
      <Input
        type="number"
        min={25}
        max={100}
        step={5}
        value={localBaseRate}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        disabled={!isEditable}
        className="w-full"
        placeholder="Base Rate"
      />
    </div>
  );
};
