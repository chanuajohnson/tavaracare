
import { useState, useEffect, useMemo } from 'react';
import { useWorkLogRate } from './useWorkLogRate';
import { getWorkLogById } from '@/services/care-plans/workLogService';

export const useWorkLogPayDetails = (workLogId: string, hours: number, expenses: number = 0) => {
  const [careTeamMemberId, setCareTeamMemberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkLog = async () => {
      try {
        const workLog = await getWorkLogById(workLogId);
        if (workLog) {
          setCareTeamMemberId(workLog.care_team_member_id);
        }
      } catch (error) {
        console.error('Error loading work log:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkLog();
  }, [workLogId]);

  const { currentRate, lastSaveTime, isLoading: rateLoading } = useWorkLogRate(
    workLogId,
    careTeamMemberId
  );

  // Calculate total pay based on hours and rate using memoization
  const totalPayBeforeExpenses = useMemo(() => {
    return hours * currentRate;
  }, [hours, currentRate, lastSaveTime]);
  
  const totalPay = useMemo(() => {
    return totalPayBeforeExpenses + expenses;
  }, [totalPayBeforeExpenses, expenses]);

  return {
    rate: currentRate,
    totalPay,
    isLoading: isLoading || rateLoading
  };
};
