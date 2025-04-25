
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkLogRate } from '@/hooks/payroll/useWorkLogRate';

interface PayRateSelectorProps {
  workLogId: string;
  careTeamMemberId: string;
}

export const PayRateSelector: React.FC<PayRateSelectorProps> = ({ workLogId, careTeamMemberId }) => {
  const { 
    rateType, 
    setRateType, 
    regularRate, 
    overtimeRate, 
    holidayRate,
    isLoading
  } = useWorkLogRate(workLogId, careTeamMemberId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading rates...</div>;
  }

  const formattedRegularRate = regularRate?.toFixed(2) || '0.00';
  const formattedOvertimeRate = overtimeRate?.toFixed(2) || '0.00';
  const formattedHolidayRate = holidayRate?.toFixed(2) || '0.00';

  return (
    <Select value={rateType} onValueChange={setRateType}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Select rate" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="regular">${formattedRegularRate}/hr (Regular)</SelectItem>
        <SelectItem value="overtime">${formattedOvertimeRate}/hr (Overtime)</SelectItem>
        <SelectItem value="holiday">${formattedHolidayRate}/hr (Holiday)</SelectItem>
      </SelectContent>
    </Select>
  );
};
