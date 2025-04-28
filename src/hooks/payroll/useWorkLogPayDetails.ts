
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

// This is a wrapper component to provide the context
export const WorkLogPayDetailsProvider: React.FC<{
  children: (result: UseWorkLogPayDetailsResult) => React.ReactNode;
  workLogId: string;
  hours: number;
  expenses?: number;
  careTeamMemberId: string;
  initialBaseRate?: number;
  initialRateMultiplier?: number;
}> = ({
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
      <WorkLogPayDetailsConsumer hours={hours} expenses={expenses}>
        {children}
      </WorkLogPayDetailsConsumer>
    </WorkLogRateProvider>
  );
};

// Internal consumer component
const WorkLogPayDetailsConsumer: React.FC<{
  children: (result: UseWorkLogPayDetailsResult) => React.ReactNode;
  hours: number;
  expenses: number;
}> = ({ children, hours, expenses }) => {
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
