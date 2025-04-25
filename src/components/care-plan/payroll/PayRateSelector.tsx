
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useWorkLogRate } from '@/hooks/payroll/useWorkLogRate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface PayRateSelectorProps {
  workLogId: string;
  careTeamMemberId: string;
}

export const PayRateSelector: React.FC<PayRateSelectorProps> = ({ 
  workLogId, 
  careTeamMemberId 
}) => {
  const { 
    baseRate, 
    setBaseRate, 
    rateMultiplier, 
    setRateMultiplier,
    isLoading 
  } = useWorkLogRate(workLogId, careTeamMemberId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading rates...</div>;
  }

  // Base rate options from $25 to $100 in $5 increments
  const baseRateOptions = Array.from({length: 16}, (_, i) => 25 + i * 5);

  // Multiplier options - added 0.5x option and reordered from lowest to highest
  const multiplierOptions = [
    { value: 0.5, label: '0.5x (Shadow Day)' },
    { value: 1, label: '1x (Regular)' },
    { value: 1.5, label: '1.5x (Overtime)' },
    { value: 2, label: '2x (Double Time)' },
    { value: 3, label: '3x (Triple Time)' }
  ];

  return (
    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
      <Select 
        value={baseRate?.toString()} 
        onValueChange={(value) => setBaseRate(Number(value))}
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

      <div className="flex items-center space-x-2">
        <Select 
          value={rateMultiplier?.toString()} 
          onValueChange={(value) => setRateMultiplier(Number(value))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Multiplier" />
          </SelectTrigger>
          <SelectContent>
            {multiplierOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value.toString()}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={16} className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm">
                <strong>Shadow Day (0.5x):</strong> For training days where the caregiver is shadowing another caregiver.
                <br /><br />
                <strong>Holiday Pay:</strong> When a shadow day falls on a holiday, the rate is 0.75x the base rate.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
