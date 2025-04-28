
import { useState, useEffect, useMemo } from 'react';
import { useWorkLogRate } from './useWorkLogRate';
import { getWorkLogById } from '@/services/care-plans/workLogService';
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';

export const useWorkLogPayDetails = (workLogId: string, hours: number, expenses: number = 0) => {
  const [workLog, setWorkLog] = useState<WorkLog | null>(null);
  const [careTeamMemberId, setCareTeamMemberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const { 
    currentRate,
    baseRate, 
    rateMultiplier,
    lastSaveTime,
    isLoading: rateLoading 
  } = useWorkLogRate(workLogId, careTeamMemberId);

  useEffect(() => {
    const loadWorkLog = async () => {
      try {
        setIsLoading(true);
        const workLog = await getWorkLogById(workLogId);
        if (workLog) {
          setWorkLog(workLog);
          setCareTeamMemberId(workLog.care_team_member_id);
        }
      } catch (error) {
        console.error('Error loading work log:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkLog();
  }, [workLogId, lastSaveTime]);

  const totalPayBeforeExpenses = useMemo(() => {
    return hours * currentRate;
  }, [hours, currentRate, lastSaveTime]);
  
  const totalPay = useMemo(() => {
    return totalPayBeforeExpenses + expenses;
  }, [totalPayBeforeExpenses, expenses]);

  return {
    rate: currentRate,
    totalPay,
    isLoading: isLoading || rateLoading,
    workLog,
    lastSaveTime
  };
};
