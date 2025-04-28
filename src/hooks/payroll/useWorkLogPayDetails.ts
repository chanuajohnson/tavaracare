
import { useState, useEffect, useMemo } from 'react';
import { useWorkLogRate } from './useWorkLogRate';
import { getWorkLogById } from '@/services/care-plans/workLogService';
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';

export const useWorkLogPayDetails = (workLogId: string, hours: number, expenses: number = 0) => {
  const [workLog, setWorkLog] = useState<WorkLog | null>(null);
  const [careTeamMemberId, setCareTeamMemberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Initial load of work log to get care_team_member_id
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
  }, [workLogId]);

  const { 
    currentRate,
    lastSaveTime,
    isLoading: rateLoading 
  } = useWorkLogRate(
    workLogId, 
    careTeamMemberId, 
    workLog?.base_rate, 
    workLog?.rate_multiplier
  );
  
  // Reload work log when rates change
  useEffect(() => {
    const refreshWorkLog = async () => {
      if (!workLogId) return;
      
      try {
        const updatedWorkLog = await getWorkLogById(workLogId);
        if (updatedWorkLog) {
          setWorkLog(updatedWorkLog);
        }
      } catch (error) {
        console.error('Error refreshing work log:', error);
      }
    };

    if (lastSaveTime > 0) {
      refreshWorkLog();
    }
  }, [workLogId, lastSaveTime]);

  const totalPayBeforeExpenses = useMemo(() => {
    return hours * currentRate;
  }, [hours, currentRate]);
  
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
