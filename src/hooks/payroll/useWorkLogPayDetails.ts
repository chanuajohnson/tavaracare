
import { useState, useEffect } from 'react';
import { useWorkLogRate } from './useWorkLogRate';
import { getWorkLogById } from '@/services/care-plans/workLogService';
import { differenceInHours, isWeekend } from 'date-fns';
import { HOLIDAYS } from '@/services/care-plans/holidaysService';

export const useWorkLogPayDetails = (workLogId: string, hours: number, expenses: number = 0) => {
  const [careTeamMemberId, setCareTeamMemberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [workLogDate, setWorkLogDate] = useState<Date | null>(null);
  const [effectiveMultiplier, setEffectiveMultiplier] = useState<number>(1);

  useEffect(() => {
    const loadWorkLog = async () => {
      try {
        const workLog = await getWorkLogById(workLogId);
        if (workLog) {
          setCareTeamMemberId(workLog.care_team_member_id);
          
          // Calculate effective multiplier including holiday adjustments
          const startTime = new Date(workLog.start_time);
          setWorkLogDate(startTime);
          
          // Check if it's a holiday
          const workDate = new Date(startTime);
          const isHoliday = HOLIDAYS.find(h => 
            new Date(h.date).toDateString() === workDate.toDateString()
          );
          
          // Get multiplier from work log, defaulting to 1.0 if not set
          const rateMultiplier = workLog.rate_multiplier || 1.0;
          const isShadowDay = rateMultiplier === 0.5;
          
          // Calculate holiday rate, considering shadow day special case
          if (isHoliday) {
            if (isShadowDay) {
              // When it's both a shadow day and a holiday, use 0.75x multiplier (0.5 × 1.5)
              setEffectiveMultiplier(0.75);
            } else {
              setEffectiveMultiplier(isHoliday.pay_multiplier);
            }
          } else if (isWeekend(workDate) && !isShadowDay) {
            setEffectiveMultiplier(1.5); // Weekend overtime
          } else {
            setEffectiveMultiplier(rateMultiplier);
          }
        }
      } catch (error) {
        console.error('Error loading work log:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkLog();
  }, [workLogId]);

  const { baseRate, rateMultiplier, currentRate, isLoading: rateLoading } = useWorkLogRate(
    workLogId,
    careTeamMemberId
  );

  // Calculate total pay based on hours and rate
  const totalPayBeforeExpenses = hours * currentRate;
  const totalPay = totalPayBeforeExpenses + expenses;

  return {
    rate: currentRate,
    baseRate,
    rateMultiplier,
    effectiveMultiplier,
    totalPay,
    isLoading: isLoading || rateLoading
  };
};
