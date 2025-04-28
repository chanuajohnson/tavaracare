
import React, { KeyboardEvent, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface BaseRateInputProps {
  baseRate: number | null;
  isEditable: boolean;
  onBaseRateChange: (rate: number) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export const BaseRateInput: React.FC<BaseRateInputProps> = ({
  baseRate,
  isEditable,
  onBaseRateChange,
  onKeyDown
}) => {
  const [inputValue, setInputValue] = useState<string>(baseRate?.toString() || '25');

  // Update the input value when baseRate changes
  useEffect(() => {
    if (baseRate !== null) {
      setInputValue(baseRate.toString());
    }
  }, [baseRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue)) {
      onBaseRateChange(numericValue);
    }
  };

  return (
    <div className="flex items-center">
      <span className="mr-1">$</span>
      <Input
        type="number"
        min="25"
        max="100"
        step="0.01"
        className="w-[80px]"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        disabled={!isEditable}
      />
      <span className="ml-1">/hr</span>
    </div>
  );
};
