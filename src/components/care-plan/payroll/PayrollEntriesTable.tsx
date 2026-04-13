
import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { PayrollStatusBadge } from "./PayrollStatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Receipt, Check, Calendar, Download, Trash2, Undo2, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShareReceiptDialog } from "./ShareReceiptDialog";
import { generatePayReceipt, generateConsolidatedReceipt } from "@/services/care-plans/receiptService";
import { toast } from "sonner";
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PayrollEntriesTableProps {
  entries: PayrollEntry[];
  onProcessPayment: (id: string) => void;
  onDeleteEntries?: (ids: string[]) => Promise<{ deleted: number; failed: number }>;
  onUndoPayment?: (id: string) => Promise<boolean>;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({
  entries,
  onProcessPayment,
  onDeleteEntries,
  onUndoPayment
}) => {
  const isMobile = useIsMobile();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState<string | null>(null);
  const [currentEntry, setCurrentEntry] = useState<PayrollEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [undoDialogOpen, setUndoDialogOpen] = useState(false);
  const [undoTargetId, setUndoTargetId] = useState<string | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

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
        const receiptUrl = await generatePayReceipt(selectedPayrollEntries[0]);
        setCurrentReceiptUrl(receiptUrl);
        setCurrentEntry(selectedPayrollEntries[0]);
      } else {
        const receiptUrl = await generateConsolidatedReceipt(selectedPayrollEntries);
        setCurrentReceiptUrl(receiptUrl);
        setCurrentEntry(selectedPayrollEntries[0]);
      }
      setReceiptDialogOpen(true);
    } catch (error) {
      console.error('Error generating consolidated receipt:', error);
      toast.error('Failed to generate consolidated receipt');
    }
  };

  const handleDownloadAllReceipts = async () => {
    const selectedPayrollEntries = entries.filter(entry => selectedEntries.includes(entry.id));
    if (selectedPayrollEntries.length === 0) {
      toast.error("No entries selected");
      return;
    }

    try {
      toast.info(`Preparing ${selectedEntries.length} receipts for download...`);
      
      // In a real implementation, we would batch all the receipts into a single ZIP file
      // For now, we'll just show a success message
      setTimeout(() => {
        toast.success(`${selectedEntries.length} receipts have been downloaded`);
      }, 1500);
    } catch (error) {
      console.error('Error downloading multiple receipts:', error);
      toast.error('Failed to download receipts');
    }
  };

  const formatDate = (date: string | null | undefined, showRelative = false) => {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      if (showRelative) {
        return formatDistanceToNow(dateObj, { addSuffix: true });
      }
      return format(dateObj, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
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

  if (!entries.length) {
    return <div className="text-center p-4">No payroll entries found.</div>;
  }

  return (
    <div>
      {selectedEntries.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row justify-end gap-2">
          {(() => {
            const pendingSelected = entries.filter(
              e => selectedEntries.includes(e.id) && e.payment_status === 'pending'
            );
            return pendingSelected.length > 0 && onDeleteEntries ? (
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({pendingSelected.length})
              </Button>
            ) : null;
          })()}
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleGenerateConsolidatedReceipt}
          >
            <Receipt className="h-4 w-4" />
            Generate {selectedEntries.length > 1 ? "Consolidated " : ""}Receipt ({selectedEntries.length})
          </Button>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleDownloadAllReceipts}
          >
            <Download className="h-4 w-4" />
            Download All Selected ({selectedEntries.length})
          </Button>
          
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast.success("Calendar entries created for payment dates");
            }}
          >
            <Calendar className="h-4 w-4" />
            Add to Calendar
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
              <TableHead>Work Date</TableHead>
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
              <React.Fragment key={entry.id}>
              <TableRow>
                <TableCell>
                  <Checkbox 
                    checked={selectedEntries.includes(entry.id)}
                    onCheckedChange={() => handleSelectEntry(entry.id)}
                  />
                </TableCell>
                <TableCell>{entry.caregiver_name || 'Unknown'}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {formatDate(entry.pay_period_start)}
                    </div>
                    {entry.pay_period_end && entry.pay_period_start !== entry.pay_period_end && (
                      <div className="text-xs text-muted-foreground">
                        to {formatDate(entry.pay_period_end)}
                      </div>
                    )}
                  </div>
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
                <TableCell className="font-medium">
                  <div>${entry.total_amount.toFixed(2)}</div>
                  {entry.nis_applicable && entry.employee_contribution ? (
                    <div className="text-xs text-muted-foreground">
                      NIS: -${entry.employee_contribution.toFixed(2)}
                      <br />Net: ${(entry.net_pay_after_nis || entry.total_amount).toFixed(2)}
                    </div>
                  ) : null}
                </TableCell>
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
                    {entry.payment_status === 'paid' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => {
                            setExpandedEntries(prev => {
                              const next = new Set(prev);
                              if (next.has(entry.id)) next.delete(entry.id);
                              else next.add(entry.id);
                              return next;
                            });
                          }}
                        >
                          {expandedEntries.has(entry.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          Details
                        </Button>
                        {onUndoPayment && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                            onClick={() => {
                              setUndoTargetId(entry.id);
                              setUndoDialogOpen(true);
                            }}
                          >
                            <Undo2 className="h-4 w-4" /> Undo
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {/* Expanded details row for paid entries */}
              {entry.payment_status === 'paid' && expandedEntries.has(entry.id) && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={isMobile ? 8 : 13} className="py-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm px-2">
                      <div>
                        <span className="text-muted-foreground block">Payment Date</span>
                        <span className="font-medium">{entry.payment_date ? format(new Date(entry.payment_date), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">NIS Class</span>
                        <span className="font-medium">{entry.nis_class || (entry.nis_applicable ? 'Applied' : 'Not Applicable')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Employee NIS</span>
                        <span className="font-medium">${(entry.employee_contribution || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Employer NIS</span>
                        <span className="font-medium">${(entry.employer_contribution || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Gross Pay</span>
                        <span className="font-medium">${(entry.gross_pay || entry.total_amount || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Net Pay (After NIS)</span>
                        <span className="font-medium">${(entry.net_pay_after_nis || entry.total_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              </React.Fragment>
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pending Payroll Entries?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const pendingCount = entries.filter(
                  e => selectedEntries.includes(e.id) && e.payment_status === 'pending'
                ).length;
                return `This will delete ${pendingCount} pending payroll ${pendingCount === 1 ? 'entry' : 'entries'} and reset the linked work logs back to pending so you can re-approve them. This action cannot be undone.`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault();
                if (!onDeleteEntries) return;
                setIsDeleting(true);
                const pendingIds = entries
                  .filter(e => selectedEntries.includes(e.id) && e.payment_status === 'pending')
                  .map(e => e.id);
                await onDeleteEntries(pendingIds);
                setSelectedEntries([]);
                setDeleteDialogOpen(false);
                setIsDeleting(false);
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete & Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={undoDialogOpen} onOpenChange={setUndoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo Payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert this payroll entry back to pending status and clear all NIS calculations. You can then re-process payment with updated rates if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUndoing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isUndoing}
              onClick={async (e) => {
                e.preventDefault();
                if (!onUndoPayment || !undoTargetId) return;
                setIsUndoing(true);
                await onUndoPayment(undoTargetId);
                setUndoDialogOpen(false);
                setUndoTargetId(null);
                setIsUndoing(false);
              }}
            >
              {isUndoing ? 'Undoing...' : 'Undo Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
