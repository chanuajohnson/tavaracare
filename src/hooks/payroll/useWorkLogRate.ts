
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getRatesForWorkLog, updateWorkLogRateType } from '@/services/care-plans/payrollService';

export const useWorkLogRate = (workLogId: string, careTeamMemberId: string) => {
  const [rateType, setRateType] = useState<'regular' | 'overtime' | 'holiday'>('regular');
  const [regularRate, setRegularRate] = useState<number | null>(null);
  const [overtimeRate, setOvertimeRate] = useState<number | null>(null);
  const [holidayRate, setHolidayRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      setIsLoading(true);
      try {
        const { rateType: savedRateType, regularRate, overtimeRate, holidayRate } = 
          await getRatesForWorkLog(workLogId, careTeamMemberId);
        
        if (savedRateType) {
          setRateType(savedRateType as 'regular' | 'overtime' | 'holiday');
        }
        
        setRegularRate(regularRate);
        setOvertimeRate(overtimeRate);
        setHolidayRate(holidayRate);
      } catch (error) {
        console.error('Error loading rates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();
  }, [workLogId, careTeamMemberId]);

  const handleSetRateType = async (newRateType: string) => {
    try {
      // Update the rate type in the database
      await updateWorkLogRateType(workLogId, newRateType as 'regular' | 'overtime' | 'holiday');
      setRateType(newRateType as 'regular' | 'overtime' | 'holiday');
    } catch (error) {
      console.error('Error updating rate type:', error);
    }
  };

  // Get the currently selected rate based on rate type
  const getCurrentRate = (): number => {
    switch (rateType) {
      case 'overtime':
        return overtimeRate || 0;
      case 'holiday':
        return holidayRate || 0;
      case 'regular':
      default:
        return regularRate || 0;
    }
  };

  return {
    rateType,
    setRateType: handleSetRateType,
    regularRate,
    overtimeRate,
    holidayRate,
    currentRate: getCurrentRate(),
    isLoading
  };
};
