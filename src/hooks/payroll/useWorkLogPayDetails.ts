
import { useState, useEffect, useMemo } from 'react';
import { useWorkLogRateContext, WorkLogRateProvider } from './WorkLogRateContext';
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';

interface UseWorkLogPayDetailsResult {
  rate: number | null;
  totalPay: number;
  isLoading: boolean;
  lastSaveTime: number;
}

export const useWorkLogPayDetails = (
  workLogId: string, 
  hours: number, 
  expenses: number = 0, 
  careTeamMemberId: string,
  initialBaseRate?: number,
  initialRateMultiplier?: number
): UseWorkLogPayDetailsResult => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the WorkLogRateContext to get rate data
  const { rateState, isLoading: rateLoading } = useWorkLogRateContext();
  const { currentRate, lastSaveTime } = rateState;
  
  // Calculate derived values
  const totalPayBeforeExpenses = useMemo(() => {
    return hours * (currentRate || 0);
  }, [hours, currentRate]);
  
  const totalPay = useMemo(() => {
    return totalPayBeforeExpenses + expenses;
  }, [totalPayBeforeExpenses, expenses]);

  useEffect(() => {
    setIsLoading(false);
  }, [currentRate]);

  return {
    rate: currentRate,
    totalPay,
    isLoading: isLoading || rateLoading,
    lastSaveTime
  };
};

interface WorkLogPayDetailsConsumerProps {
  children: (result: UseWorkLogPayDetailsResult) => React.ReactNode;
  hours: number;
  expenses: number;
  workLogId: string;
  careTeamMemberId: string;
}

const WorkLogPayDetailsConsumer: React.FC<WorkLogPayDetailsConsumerProps> = ({
  children,
  hours,
  expenses,
  workLogId,
  careTeamMemberId
}) => {
  const { rateState, isLoading: rateLoading } = useWorkLogRateContext();
  const { currentRate, lastSaveTime } = rateState;
  
  // Calculate derived values
  const totalPayBeforeExpenses = useMemo(() => {
    return hours * (currentRate || 0);
  }, [hours, currentRate]);
  
  const totalPay = useMemo(() => {
    return totalPayBeforeExpenses + expenses;
  }, [totalPayBeforeExpenses, expenses]);

  const result: UseWorkLogPayDetailsResult = {
    rate: currentRate,
    totalPay,
    isLoading: rateLoading,
    lastSaveTime
  };

  return <>{children(result)}</>;
};

interface WorkLogPayDetailsProviderProps {
  children: (result: UseWorkLogPayDetailsResult) => React.ReactNode;
  workLogId: string;
  hours: number;
  expenses?: number;
  careTeamMemberId: string;
  initialBaseRate?: number;
  initialRateMultiplier?: number;
}

export const WorkLogPayDetailsProvider: React.FC<WorkLogPayDetailsProviderProps> = ({
  children,
  workLogId,
  hours,
  expenses = 0,
  careTeamMemberId,
  initialBaseRate,
  initialRateMultiplier
}) => {
  return (
    <WorkLogRateProvider
      workLogId={workLogId}
      careTeamMemberId={careTeamMemberId}
      initialBaseRate={initialBaseRate}
      initialRateMultiplier={initialRateMultiplier}
    >
      <WorkLogPayDetailsConsumer 
        hours={hours} 
        expenses={expenses} 
        workLogId={workLogId} 
        careTeamMemberId={careTeamMemberId}
      >
        {children}
      </WorkLogPayDetailsConsumer>
    </WorkLogRateProvider>
  );
};
