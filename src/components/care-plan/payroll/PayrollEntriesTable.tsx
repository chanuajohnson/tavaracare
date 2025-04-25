
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayrollStatusBadge } from './PayrollStatusBadge';
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";

interface PayrollEntriesTableProps {
  entries: PayrollEntry[];
  onProcessPayment: (id: string) => void;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({
  entries,
  onProcessPayment,
}) => {
  const [caregiverFilter, setCaregiverFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // Filter entries by caregiver name and date range
  const filteredEntries = entries.filter(entry => {
    const matchesCaregiverFilter = !caregiverFilter || 
      entry.caregiver_name?.toLowerCase().includes(caregiverFilter.toLowerCase());
      
    // Date range filter logic
    let withinDateRange = true;
    const entryDate = entry.entered_at ? new Date(entry.entered_at) : 
                     entry.created_at ? new Date(entry.created_at) : null;
    
    if (entryDate && dateRange.from) {
      withinDateRange = withinDateRange && entryDate >= dateRange.from;
    }
    
    if (entryDate && dateRange.to) {
      // Add one day to include entries on the end date
      const endDate = new Date(dateRange.to);
      endDate.setDate(endDate.getDate() + 1);
      withinDateRange = withinDateRange && entryDate < endDate;
    }
    
    return matchesCaregiverFilter && withinDateRange;
  });

  if (entries.length === 0) {
    return <div className="text-center p-4">No payroll entries found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by caregiver name"
            value={caregiverFilter}
            onChange={(e) => setCaregiverFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="max-w-sm"
          />
        </div>
      </div>

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
          {filteredEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.caregiver_name}</TableCell>
              <TableCell>
                {entry.regular_hours > 0 && (
                  <div>Regular: {entry.regular_hours}h</div>
                )}
                {entry.overtime_hours > 0 && (
                  <div className="text-amber-600">Overtime: {entry.overtime_hours}h</div>
                )}
                {entry.holiday_hours > 0 && (
                  <div className="text-blue-600">Holiday: {entry.holiday_hours}h</div>
                )}
                {entry.shadow_hours > 0 && (
                  <div className="text-purple-600">Shadow: {entry.shadow_hours}h</div>
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
    </div>
  );
};
