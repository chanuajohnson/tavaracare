
import { useState, useEffect } from "react";
import { useWorkLogRate } from "@/hooks/payroll/useWorkLogRate";

interface PayTotalDisplayProps {
  workLogId: string;
  hours: number;
  expenses: number;
  careTeamMemberId: string;
  baseRate?: number;
  rateMultiplier?: number;
}

export const PayTotalDisplay = ({ 
  workLogId, 
  hours, 
  expenses,
  careTeamMemberId,
  baseRate: initialBaseRate,
  rateMultiplier: initialRateMultiplier 
}: PayTotalDisplayProps) => {
  const [totalPay, setTotalPay] = useState<number>(0);
  
  const { 
    baseRate,
    rateMultiplier,
    currentRate,
    isLoading,
    lastSaveTime
  } = useWorkLogRate(
    workLogId, 
    careTeamMemberId, 
    initialBaseRate,
    initialRateMultiplier
  );

  // Recalculate total pay whenever any dependent values change
  useEffect(() => {
    if (currentRate !== null) {
      const payBeforeExpenses = hours * currentRate;
      setTotalPay(payBeforeExpenses + expenses);
    }
  }, [hours, currentRate, expenses, lastSaveTime]);
  
  if (isLoading) {
    return <div className="text-muted-foreground">Calculating...</div>;
  }
  
  return (
    <div>
      <div className="font-medium">${totalPay.toFixed(2)}</div>
      <div className="text-xs text-muted-foreground">
        {hours.toFixed(1)}h × ${baseRate?.toFixed(2) || '0.00'}/hr × {rateMultiplier?.toFixed(1) || '1.0'}x
        {expenses > 0 ? ` + $${expenses.toFixed(2)} expenses` : ''}
      </div>
    </div>
  );
};
