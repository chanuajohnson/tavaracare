
import React from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayrollStatusBadge } from './PayrollStatusBadge';
import type { PayrollEntry } from "@/services/care-plans/workLogService";

interface PayrollEntriesTableProps {
  entries: PayrollEntry[];
  onProcessPayment: (id: string) => void;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({
  entries,
  onProcessPayment,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Caregiver</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.created_at ? format(new Date(entry.created_at), 'MMM d, yyyy') : 'Unknown'}</TableCell>
              <TableCell>{entry.caregiver_name || 'Unknown'}</TableCell>
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
              <TableCell className="text-right">
                {entry.payment_status !== 'paid' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onProcessPayment(entry.id)}
                  >
                    Process Payment
                  </Button>
                )}
                {entry.payment_status === 'paid' && entry.payment_date && (
                  <span className="text-sm text-muted-foreground">
                    Paid on {format(new Date(entry.payment_date), 'MMM d, yyyy')}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
              No payroll entries found matching your filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
