
import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { PayrollStatusBadge } from "./PayrollStatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Receipt, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShareReceiptDialog } from "./ShareReceiptDialog";
import { generatePayReceipt, generateConsolidatedReceipt } from "@/services/care-plans/receiptService";
import { toast } from "sonner";
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";

interface PayrollEntriesTableProps {
  entries: PayrollEntry[];
  onProcessPayment: (id: string) => void;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({
  entries,
  onProcessPayment
}) => {
  const isMobile = useIsMobile();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState<string | null>(null);
  const [currentEntry, setCurrentEntry] = useState<PayrollEntry | null>(null);

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleGenerateReceipt = async (entry: PayrollEntry) => {
    try {
      const receiptUrl = await generatePayReceipt(entry);
      setCurrentReceiptUrl(receiptUrl);
      setCurrentEntry(entry);
      setReceiptDialogOpen(true);
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  const handleGenerateConsolidatedReceipt = async () => {
    try {
      const selectedPayrollEntries = entries.filter(entry => selectedEntries.includes(entry.id));
      if (selectedPayrollEntries.length === 0) {
        toast.error("No entries selected");
        return;
      }

      if (selectedPayrollEntries.length === 1) {
        // If only one entry is selected, generate a regular receipt
        const receiptUrl = await generatePayReceipt(selectedPayrollEntries[0]);
        setCurrentReceiptUrl(receiptUrl);
        setCurrentEntry(selectedPayrollEntries[0]);
      } else {
        // Generate consolidated receipt for multiple entries
        const receiptUrl = await generateConsolidatedReceipt(selectedPayrollEntries);
        setCurrentReceiptUrl(receiptUrl);
        setCurrentEntry(selectedPayrollEntries[0]); // Use first entry for dialog details
      }
      setReceiptDialogOpen(true);
    } catch (error) {
      console.error('Error generating consolidated receipt:', error);
      toast.error('Failed to generate consolidated receipt');
    }
  };

  if (!entries.length) {
    return <div className="text-center p-4">No payroll entries found.</div>;
  }

  const formatDate = (date: string | null | undefined, showRelative = false) => {
    if (!date) return '-';
    const dateObj = new Date(date);
    if (showRelative) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
    return format(dateObj, 'MMM d, yyyy');
  };

  const DateCell = ({ date, label }: { date: string | null | undefined, label: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-sm">
            <div className="font-medium text-muted-foreground">{label}</div>
            <div>{formatDate(date, isMobile)}</div>
          </div>
        </TooltipTrigger>
        {date && (
          <TooltipContent>
            <p>{format(new Date(date), 'MMMM d, yyyy h:mm a')}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div>
      {selectedEntries.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleGenerateConsolidatedReceipt}
          >
            <Receipt className="h-4 w-4" />
            Generate {selectedEntries.length > 1 ? "Consolidated " : ""}Receipt ({selectedEntries.length})
          </Button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Payroll entries</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={entries.length > 0 && selectedEntries.length === entries.length}
                  onCheckedChange={(checked) => {
                    setSelectedEntries(checked ? entries.map(e => e.id) : []);
                  }}
                />
              </TableHead>
              <TableHead>Caregiver</TableHead>
              <TableHead>Date</TableHead>
              {!isMobile && (
                <>
                  <TableHead>Regular Hours</TableHead>
                  <TableHead>Overtime Hours</TableHead>
                  <TableHead>Holiday Hours</TableHead>
                </>
              )}
              <TableHead>Base Rate</TableHead>
              {!isMobile && <TableHead>Expenses</TableHead>}
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entered On</TableHead>
              <TableHead>Paid On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedEntries.includes(entry.id)}
                    onCheckedChange={() => handleSelectEntry(entry.id)}
                  />
                </TableCell>
                <TableCell>{entry.caregiver_name || 'Unknown'}</TableCell>
                <TableCell>
                  {entry.pay_period_start && formatDate(entry.pay_period_start)}
                </TableCell>
                {!isMobile && (
                  <>
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
                  </>
                )}
                <TableCell>
                  <div className="text-sm font-medium">
                    ${entry.regular_rate}/hr
                  </div>
                  {isMobile && entry.regular_hours > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {entry.regular_hours}h regular
                    </div>
                  )}
                  {isMobile && entry.overtime_hours > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {entry.overtime_hours}h OT
                    </div>
                  )}
                  {isMobile && entry.holiday_hours > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {entry.holiday_hours}h holiday
                    </div>
                  )}
                </TableCell>
                {!isMobile && <TableCell>${entry.expense_total?.toFixed(2) || '0.00'}</TableCell>}
                <TableCell className="font-medium">${entry.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <PayrollStatusBadge status={entry.payment_status} />
                </TableCell>
                <TableCell>
                  <DateCell date={entry.created_at} label="Entered" />
                </TableCell>
                <TableCell>
                  <DateCell date={entry.payment_date} label="Paid" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGenerateReceipt(entry)}
                      className="h-8 w-8"
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                    {entry.payment_status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onProcessPayment(entry.id)}
                      >
                        Process Payment
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ShareReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        receiptUrl={currentReceiptUrl}
        workLog={currentEntry}
      />
    </div>
  );
};
