
import { useState, useEffect, useMemo } from 'react';
import { useWorkLogRate } from './useWorkLogRate';
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';

export const useWorkLogPayDetails = (workLogId: string, hours: number, expenses: number = 0, initialWorkLog?: WorkLog) => {
  // Use provided workLog directly if available, avoiding unnecessary fetch
  const [workLog, setWorkLog] = useState<WorkLog | null>(initialWorkLog || null);
  const [isLoading, setIsLoading] = useState(true);
  const careTeamMemberId = workLog?.care_team_member_id || '';

  // Use the rate hook with initial values from workLog if available
  const { 
    currentRate,
    baseRate,
    rateMultiplier,
    lastSaveTime,
    isLoading: rateLoading 
  } = useWorkLogRate(
    workLogId, 
    careTeamMemberId, 
    workLog?.base_rate, 
    workLog?.rate_multiplier
  );
  
  // Calculate derived values
  const totalPayBeforeExpenses = useMemo(() => {
    return hours * (currentRate || 0);
  }, [hours, currentRate, lastSaveTime]);
  
  const totalPay = useMemo(() => {
    return totalPayBeforeExpenses + expenses;
  }, [totalPayBeforeExpenses, expenses, lastSaveTime]);

  useEffect(() => {
    // If we already have the workLog data, no need to load
    if (initialWorkLog) {
      setWorkLog(initialWorkLog);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
  }, [initialWorkLog, workLogId]);

  return {
    rate: currentRate,
    baseRate,
    rateMultiplier,
    totalPay,
    isLoading: isLoading || rateLoading,
    workLog,
    lastSaveTime
  };
};
