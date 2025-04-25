
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { PayrollStatusBadge } from "./PayrollStatusBadge";
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";

interface PayrollEntriesTableProps {
  entries: PayrollEntry[];
  onProcessPayment: (id: string) => void;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({
  entries,
  onProcessPayment
}) => {
  if (!entries.length) {
    return <div className="text-center p-4">No payroll entries found.</div>;
  }

  return (
    <Table>
      <TableCaption>Payroll entries</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Caregiver</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Regular Hours</TableHead>
          <TableHead>Overtime Hours</TableHead>
          <TableHead>Holiday Hours</TableHead>
          <TableHead>Base Rate</TableHead>
          <TableHead>Expenses</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.caregiver_name || 'Unknown'}</TableCell>
            <TableCell>
              {entry.pay_period_start && format(new Date(entry.pay_period_start), 'MMM d, yyyy')}
            </TableCell>
            <TableCell>
              {entry.regular_hours > 0 && (
                <div className="text-sm">
                  {entry.regular_hours}h @ ${entry.regular_rate}/hr
                </div>
              )}
            </TableCell>
            <TableCell>
              {entry.overtime_hours > 0 && (
                <div className="text-sm">
                  {entry.overtime_hours}h @ ${entry.overtime_rate}/hr
                </div>
              )}
            </TableCell>
            <TableCell>
              {entry.holiday_hours > 0 && (
                <div className="text-sm">
                  {entry.holiday_hours}h @ ${entry.holiday_rate}/hr
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm font-medium">
                ${entry.regular_rate}/hr
              </div>
            </TableCell>
            <TableCell>${entry.expense_total?.toFixed(2) || '0.00'}</TableCell>
            <TableCell className="font-medium">${entry.total_amount.toFixed(2)}</TableCell>
            <TableCell>
              <PayrollStatusBadge status={entry.payment_status} />
            </TableCell>
            <TableCell className="text-right">
              {entry.payment_status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onProcessPayment(entry.id)}
                >
                  Process Payment
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
