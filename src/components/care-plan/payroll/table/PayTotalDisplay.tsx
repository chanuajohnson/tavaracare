
import { useWorkLogPayDetails } from "@/hooks/payroll/useWorkLogPayDetails";

interface PayTotalDisplayProps {
  workLogId: string;
  hours: number;
  expenses: number;
}

export const PayTotalDisplay = ({ workLogId, hours, expenses }: PayTotalDisplayProps) => {
  const { rate, totalPay, isLoading, lastSaveTime } = useWorkLogPayDetails(workLogId, hours, expenses);
  
  if (isLoading) {
    return <div className="text-muted-foreground">Calculating...</div>;
  }
  
  return (
    <div>
      <div className="font-medium">${totalPay.toFixed(2)}</div>
      <div className="text-xs text-muted-foreground">
        {hours.toFixed(1)}h × ${rate.toFixed(2)}/hr
        {expenses > 0 ? ` + $${expenses.toFixed(2)} expenses` : ''}
      </div>
    </div>
  );
};
