
import { useState, useEffect } from "react";
import { WorkLogRateProvider, useWorkLogRateContext } from "@/hooks/payroll/WorkLogRateContext";

interface PayTotalDisplayProps {
  workLogId: string;
  hours: number;
  expenses: number;
  careTeamMemberId: string;
  baseRate?: number;
  rateMultiplier?: number;
}

const PayTotalContent = ({ hours, expenses }: { hours: number; expenses: number }) => {
  const [totalPay, setTotalPay] = useState<number>(0);
  const { rateState, isLoading } = useWorkLogRateContext();
  const { baseRate, rateMultiplier, currentRate, lastSaveTime } = rateState;
  
  // Recalculate total pay whenever rate data changes
  useEffect(() => {
    if (currentRate) {
      const payBeforeExpenses = hours * currentRate;
      setTotalPay(payBeforeExpenses + expenses);
    }
  }, [hours, expenses, currentRate, lastSaveTime]);
  
  if (isLoading) {
    return <div className="text-muted-foreground">Calculating...</div>;
  }
  
  return (
    <div>
      <div className="font-medium">${totalPay.toFixed(2)}</div>
      <div className="text-xs text-muted-foreground">
        {hours.toFixed(1)}h × ${baseRate?.toFixed(2)}/hr × {rateMultiplier}x
        {expenses > 0 ? ` + $${expenses.toFixed(2)} expenses` : ''}
      </div>
    </div>
  );
};

export const PayTotalDisplay = ({ 
  workLogId, 
  hours, 
  expenses,
  careTeamMemberId,
  baseRate: initialBaseRate,
  rateMultiplier: initialRateMultiplier 
}: PayTotalDisplayProps) => {
  return (
    <WorkLogRateProvider
      workLogId={workLogId}
      careTeamMemberId={careTeamMemberId}
      initialBaseRate={initialBaseRate}
      initialRateMultiplier={initialRateMultiplier}
    >
      <PayTotalContent hours={hours} expenses={expenses} />
    </WorkLogRateProvider>
  );
};
