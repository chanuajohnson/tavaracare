
import React from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayrollStatusBadge } from './PayrollStatusBadge';
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";

interface PayrollEntriesTableProps {
  entries: PayrollEntry[];
  onProcessPayment: (id: string) => void;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({
  entries,
  onProcessPayment,
}) => {
  if (entries.length === 0) {
    return <div className="text-center p-4">No payroll entries found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Caregiver</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Entered on</TableHead>
          <TableHead className="text-right">Payment Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.caregiver_name}</TableCell>
            <TableCell>
              <div>Regular: {entry.regular_hours}h</div>
              {entry.overtime_hours > 0 && (
                <div className="text-amber-600">Overtime: {entry.overtime_hours}h</div>
              )}
              {entry.holiday_hours > 0 && (
                <div className="text-blue-600">Holiday: {entry.holiday_hours}h</div>
              )}
            </TableCell>
            <TableCell>${entry.total_amount.toFixed(2)}</TableCell>
            <TableCell>
              <PayrollStatusBadge status={entry.payment_status} />
            </TableCell>
            <TableCell>
              {entry.entered_at ? format(new Date(entry.entered_at), 'MMM d, yyyy') : format(new Date(entry.created_at), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="text-right">
              {entry.payment_status !== 'paid' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onProcessPayment(entry.id)}
                >
                  Process Payment
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Paid on {entry.payment_date ? format(new Date(entry.payment_date), 'MMM d, yyyy') : 'N/A'}
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
