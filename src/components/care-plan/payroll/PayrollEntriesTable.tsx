import React, { useState, useMemo } from 'react';
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
import { groupEntriesByWeek, groupWeeksByMonth, type WeekGroup } from "@/utils/payroll/groupByWeek";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedWeekDetails, setExpandedWeekDetails] = useState<Set<string>>(new Set());
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);

  const weekGroups = useMemo(() => groupEntriesByWeek(entries), [entries]);
  const monthGroups = useMemo(() => groupWeeksByMonth(weekGroups), [weekGroups]);

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSelectWeek = (week: WeekGroup, checked: boolean) => {
    const weekEntryIds = week.entries.map(e => e.id);
    setSelectedEntries(prev => {
      if (checked) {
        return [...new Set([...prev, ...weekEntryIds])];
      }
      return prev.filter(id => !weekEntryIds.includes(id));
    });
  };

  const toggleWeekExpand = (weekKey: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekKey)) next.delete(weekKey); else next.add(weekKey);
      return next;
    });
  };

  const toggleWeekDetails = (weekKey: string) => {
    setExpandedWeekDetails(prev => {
      const next = new Set(prev);
      if (next.has(weekKey)) next.delete(weekKey); else next.add(weekKey);
      return next;
    });
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

  const formatDate = (date: string | null | undefined, showRelative = false) => {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      if (showRelative) return formatDistanceToNow(dateObj, { addSuffix: true });
      return format(dateObj, 'MMM d, yyyy');
    } catch {
      return '-';
    }
  };

  if (!entries.length) {
    return <div className="text-center p-4">No payroll entries found.</div>;
  }

  const colCount = isMobile ? 7 : 10;

  return (
    <div>
      {/* Bulk action bar */}
      {selectedEntries.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row justify-end gap-2">
          {(() => {
            const pendingSelected = entries.filter(
              e => selectedEntries.includes(e.id) && e.payment_status === 'pending'
            );
            return pendingSelected.length > 0 && onDeleteEntries ? (
              <Button variant="destructive" className="gap-2" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete Selected ({pendingSelected.length})
              </Button>
            ) : null;
          })()}
          <Button variant="outline" className="gap-2" onClick={handleGenerateConsolidatedReceipt}>
            <Receipt className="h-4 w-4" />
            Generate {selectedEntries.length > 1 ? "Consolidated " : ""}Receipt ({selectedEntries.length})
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Calendar entries created for payment dates")}>
            <Calendar className="h-4 w-4" />
            Add to Calendar
          </Button>
        </div>
      )}

      {/* Weekly grouped table */}
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Payroll entries grouped by work week (Mon–Sun)</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead>Caregiver</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Hours</TableHead>
              {!isMobile && <TableHead>Gross Pay</TableHead>}
              {!isMobile && <TableHead>NIS (Employee)</TableHead>}
              {!isMobile && <TableHead>NIS (Employer)</TableHead>}
              <TableHead>Net Pay</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weekGroups.map((week) => {
              const isExpanded = expandedWeeks.has(week.key);
              const isDetailsOpen = expandedWeekDetails.has(week.key);
              const allWeekSelected = week.entries.every(e => selectedEntries.includes(e.id));
              const someWeekSelected = week.entries.some(e => selectedEntries.includes(e.id));

              return (
                <React.Fragment key={week.key}>
                  {/* Week header row */}
                  <TableRow className="bg-muted/50 font-medium hover:bg-muted/70">
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleWeekExpand(week.key)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={allWeekSelected}
                        // @ts-ignore
                        indeterminate={someWeekSelected && !allWeekSelected}
                        onCheckedChange={(checked) => handleSelectWeek(week, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold">{week.caregiverName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{format(week.weekStart, 'MMM d')} – {format(week.weekEnd, 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">{week.entries.length} {week.entries.length === 1 ? 'entry' : 'entries'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {week.weeklyRegularHours > 0 && <div>{week.weeklyRegularHours}h reg</div>}
                        {week.weeklyOvertimeHours > 0 && <div>{week.weeklyOvertimeHours}h OT</div>}
                        {week.weeklyHolidayHours > 0 && <div>{week.weeklyHolidayHours}h hol</div>}
                      </div>
                    </TableCell>
                    {!isMobile && <TableCell>${week.weeklyGross.toFixed(2)}</TableCell>}
                    {!isMobile && (
                      <TableCell>
                        {week.nisApplicable ? (
                          <div className="text-sm">
                            <div>${week.employeeContribution.toFixed(2)}</div>
                            {week.nisClass && <div className="text-xs text-muted-foreground">Class {week.nisClass}</div>}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>{week.nisApplicable ? `$${week.employerContribution.toFixed(2)}` : '-'}</TableCell>
                    )}
                    <TableCell className="font-semibold">${week.weeklyNetPay.toFixed(2)}</TableCell>
                    <TableCell>
                      {week.allPaid ? (
                        <PayrollStatusBadge status="paid" />
                      ) : week.allPending ? (
                        <PayrollStatusBadge status="pending" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Mixed</span>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Week-level NIS detail row (for paid weeks) */}
                  {week.allPaid && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={colCount} className="py-1 px-4">
                        <button
                          onClick={() => toggleWeekDetails(week.key)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {isDetailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          Weekly NIS Summary
                        </button>
                        {isDetailsOpen && (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mt-2 pb-2">
                            <div>
                              <span className="text-muted-foreground block text-xs">NIS Class</span>
                              <span className="font-medium">{week.nisClass || (week.nisApplicable ? 'Applied' : 'N/A')}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Weekly Gross</span>
                              <span className="font-medium">${week.weeklyGross.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Employee NIS</span>
                              <span className="font-medium">${week.employeeContribution.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Employer NIS</span>
                              <span className="font-medium">${week.employerContribution.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Weekly Net Pay</span>
                              <span className="font-medium">${week.weeklyNetPay.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                        {/* Undo payment for the whole week */}
                        {isDetailsOpen && onUndoPayment && (
                          <div className="flex gap-2 pb-2">
                            {week.entries.map(entry => (
                              <Button
                                key={entry.id}
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 text-xs border-warning hover:bg-warning/10 hover:text-warning-foreground"
                                onClick={() => {
                                  setUndoTargetId(entry.id);
                                  setUndoDialogOpen(true);
                                }}
                              >
                                <Undo2 className="h-3 w-3" /> Undo {formatDate(entry.pay_period_start)}
                              </Button>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Expanded daily entries */}
                  {isExpanded && week.entries.map((entry) => (
                    <TableRow key={entry.id} className="bg-background">
                      <TableCell></TableCell>
                      <TableCell>
                        <Checkbox
                          checked={selectedEntries.includes(entry.id)}
                          onCheckedChange={() => handleSelectEntry(entry.id)}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm pl-6">
                        {formatDate(entry.pay_period_start)}
                        {entry.pay_period_end && entry.pay_period_start !== entry.pay_period_end && (
                          <span className="text-xs"> – {formatDate(entry.pay_period_end)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.regular_hours}h @ ${entry.regular_rate}/hr
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.overtime_hours > 0 && <div>{entry.overtime_hours}h OT</div>}
                        {(entry.holiday_hours || 0) > 0 && <div>{entry.holiday_hours}h hol</div>}
                      </TableCell>
                      {!isMobile && <TableCell className="text-sm">${(entry.gross_pay || entry.total_amount).toFixed(2)}</TableCell>}
                      {!isMobile && <TableCell className="text-xs text-muted-foreground">—</TableCell>}
                      {!isMobile && <TableCell className="text-xs text-muted-foreground">—</TableCell>}
                      <TableCell className="text-sm">${entry.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <PayrollStatusBadge status={entry.payment_status} />
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleGenerateReceipt(entry)}>
                            <Receipt className="h-3 w-3" />
                          </Button>
                          {entry.payment_status === 'pending' && (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onProcessPayment(entry.id)}>
                              Process
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Monthly Summary */}
      {monthGroups.length > 0 && (
        <div className="mt-6">
          <Collapsible open={showMonthlySummary} onOpenChange={setShowMonthlySummary}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                {showMonthlySummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Monthly Summary
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border rounded-lg mt-2 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Weeks</TableHead>
                      <TableHead>Total Gross</TableHead>
                      <TableHead>Employee NIS</TableHead>
                      <TableHead>Employer NIS</TableHead>
                      <TableHead>Total Net Pay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthGroups.map((month) => (
                      <TableRow key={month.key}>
                        <TableCell className="font-medium">{month.monthLabel}</TableCell>
                        <TableCell>{month.weeks.length} {month.weeks.length === 1 ? 'week' : 'weeks'}</TableCell>
                        <TableCell>${month.totalGross.toFixed(2)}</TableCell>
                        <TableCell>${month.totalEmployeeNIS.toFixed(2)}</TableCell>
                        <TableCell>${month.totalEmployerNIS.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">${month.totalNetPay.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <ShareReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        receiptUrl={currentReceiptUrl}
        workLog={currentEntry}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pending Payroll Entries?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const pendingCount = entries.filter(
                  e => selectedEntries.includes(e.id) && e.payment_status === 'pending'
                ).length;
                return `This will delete ${pendingCount} pending payroll ${pendingCount === 1 ? 'entry' : 'entries'} and reset the linked work logs back to pending. This action cannot be undone.`;
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

      {/* Undo payment confirmation */}
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
};
