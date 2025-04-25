
import { useState, useEffect } from 'react';
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

  const { currentRate, rateType, regularRate, overtimeRate, holidayRate } = useWorkLogRate(
    workLogId,
    careTeamMemberId
  );

  // Calculate total pay based on hours and rate
  const totalPayBeforeExpenses = hours * currentRate;
  const totalPay = totalPayBeforeExpenses + expenses;

  return {
    rateType,
    rate: currentRate,
    regularRate,
    overtimeRate,
    holidayRate,
    totalPay,
    isLoading: isLoading || !currentRate
  };
};
