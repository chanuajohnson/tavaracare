import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { PayrollStatusBadge } from "./PayrollStatusBadge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Receipt, Calendar, Trash2, Undo2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShareReceiptDialog } from "./ShareReceiptDialog";
import { generatePayReceipt, generateConsolidatedReceipt } from "@/services/care-plans/receiptService";
import { toast } from "sonner";
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";
import { groupEntriesByWeek, groupWeeksByMonth, type WeekGroup, type MonthGroup } from "@/utils/payroll/groupByWeek";
import { Progress } from "@/components/ui/progress";
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
  onRecalculateNIS?: (entryId: string) => Promise<boolean>;
  onRecordBankTransfer?: (payrollId: string) => void;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({
  entries,
  onProcessPayment,
  onDeleteEntries,
  onUndoPayment,
  onRecalculateNIS,
  onRecordBankTransfer
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
  // Default all months expanded so week breakdowns are visible
  const defaultExpandedMonths = useMemo(() => new Set(monthGroups.map(m => m.key)), [monthGroups]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const effectiveExpandedMonths = useMemo(() => {
    // If user hasn't toggled anything yet, show all expanded
    return expandedMonths.size === 0 && monthGroups.length > 0 ? defaultExpandedMonths : expandedMonths;
  }, [expandedMonths, defaultExpandedMonths, monthGroups]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedWeekDetails, setExpandedWeekDetails] = useState<Set<string>>(new Set());
  const [expandedMonthNIS, setExpandedMonthNIS] = useState<Set<string>>(new Set());
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [bulkRecalcProgress, setBulkRecalcProgress] = useState<{ current: number; total: number } | null>(null);

  const weekGroups = useMemo(() => groupEntriesByWeek(entries), [entries]);
  const monthGroups = useMemo(() => groupWeeksByMonth(weekGroups), [weekGroups]);

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev =>
      prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]
    );
  };

  const handleSelectWeek = (week: WeekGroup, checked: boolean) => {
    const weekEntryIds = week.entries.map(e => e.id);
    setSelectedEntries(prev => {
      if (checked) return [...new Set([...prev, ...weekEntryIds])];
      return prev.filter(id => !weekEntryIds.includes(id));
    });
  };

  const toggleMonthExpand = (key: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleMonthNIS = (key: string) => {
    setExpandedMonthNIS(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleWeekExpand = (key: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleWeekDetails = (key: string) => {
    setExpandedWeekDetails(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleRecalcNIS = async (entryId: string) => {
    if (!onRecalculateNIS) return;
    setIsRecalculating(true);
    await onRecalculateNIS(entryId);
    setIsRecalculating(false);
  };

  const handleBulkRecalcNIS = async (month: MonthGroup) => {
    if (!onRecalculateNIS) return;
    const weeksNeedingNIS = month.weeks.filter(
      w => w.allPaid && w.weeklyGross > 200 && w.employeeContribution === 0
    );
    if (weeksNeedingNIS.length === 0) {
      toast.info("No weeks in this month need NIS recalculation.");
      return;
    }
    setIsRecalculating(true);
    setBulkRecalcProgress({ current: 0, total: weeksNeedingNIS.length });
    for (let i = 0; i < weeksNeedingNIS.length; i++) {
      setBulkRecalcProgress({ current: i + 1, total: weeksNeedingNIS.length });
      await onRecalculateNIS(weeksNeedingNIS[i].entries[0].id);
    }
    setBulkRecalcProgress(null);
    setIsRecalculating(false);
    toast.success(`NIS recalculated for ${weeksNeedingNIS.length} week(s).`);
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
      if (selectedPayrollEntries.length === 0) { toast.error("No entries selected"); return; }
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

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    try { return format(new Date(date), 'MMM d, yyyy'); } catch { return '-'; }
  };

  if (!entries.length) {
    return <div className="text-center p-4">No payroll entries found.</div>;
  }

  const colCount = isMobile ? 8 : 11;

  const getWeeksNeedingNIS = (month: MonthGroup) =>
    month.weeks.filter(w => w.allPaid && w.weeklyGross > 200 && w.employeeContribution === 0);

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

      {/* Month-first grouped payroll */}
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Payroll entries grouped by month → week (Mon–Sun)</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead>Caregiver / Period</TableHead>
              <TableHead>Hours</TableHead>
              {!isMobile && <TableHead>Gross Pay</TableHead>}
              {!isMobile && <TableHead>NIS (Employee)</TableHead>}
              {!isMobile && <TableHead>NIS (Employer)</TableHead>}
              {!isMobile && <TableHead>Total NIS</TableHead>}
              <TableHead>Net Pay</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthGroups.map((month) => {
              const isMonthOpen = effectiveExpandedMonths.has(month.key);
              const isNISOpen = expandedMonthNIS.has(month.key);
              const weeksNeedingNIS = getWeeksNeedingNIS(month);

              return (
                <React.Fragment key={month.key}>
                  {/* ── MONTH HEADER ROW ── */}
                  <TableRow className="bg-primary/10 font-semibold hover:bg-primary/15 border-b-2 border-primary/20">
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleMonthExpand(month.key)}>
                        {isMonthOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      <div>
                        <span className="text-base">{month.monthLabel}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({month.weeks.length} {month.weeks.length === 1 ? 'week' : 'weeks'})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {month.totalRegularHours > 0 && <div>{month.totalRegularHours.toFixed(1)}h reg</div>}
                        {month.totalOvertimeHours > 0 && <div>{month.totalOvertimeHours.toFixed(1)}h OT</div>}
                        {month.totalHolidayHours > 0 && <div>{month.totalHolidayHours.toFixed(1)}h hol</div>}
                      </div>
                    </TableCell>
                    {!isMobile && <TableCell>${month.totalGross.toFixed(2)}</TableCell>}
                    {!isMobile && <TableCell>${month.totalEmployeeNIS.toFixed(2)}</TableCell>}
                    {!isMobile && <TableCell>${month.totalEmployerNIS.toFixed(2)}</TableCell>}
                    {!isMobile && <TableCell className="font-semibold">${(month.totalEmployeeNIS + month.totalEmployerNIS).toFixed(2)}</TableCell>}
                    <TableCell className="font-bold">${month.totalNetPay.toFixed(2)}</TableCell>
                    <TableCell>
                      {month.allPaid ? (
                        <PayrollStatusBadge status="paid" />
                      ) : month.allPending ? (
                        <PayrollStatusBadge status="pending" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Mixed</span>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* ── MONTHLY NIS SUMMARY (always visible under month header) ── */}
                  <TableRow className="bg-primary/5 border-b border-primary/10">
                    <TableCell colSpan={colCount} className="py-2 px-4">
                      <button
                        onClick={() => toggleMonthNIS(month.key)}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        {isNISOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        Monthly NIS Summary
                        {weeksNeedingNIS.length > 0 && (
                          <span className="ml-2 text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded text-[10px]">
                            {weeksNeedingNIS.length} week(s) missing NIS
                          </span>
                        )}
                      </button>
                      {isNISOpen && (
                        <div className="mt-2 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground block text-xs">Total Gross</span>
                              <span className="font-semibold">${month.totalGross.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Employee NIS</span>
                              <span className="font-semibold">${month.totalEmployeeNIS.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Employer NIS</span>
                              <span className="font-semibold">${month.totalEmployerNIS.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Combined NIS</span>
                              <span className="font-semibold">${(month.totalEmployeeNIS + month.totalEmployerNIS).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Total Net Pay</span>
                              <span className="font-semibold">${month.totalNetPay.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {month.weeks.filter(w => w.nisApplicable).length} of {month.weeks.length} weeks have NIS applied
                          </div>
                          {/* Bulk recalculate button */}
                          {weeksNeedingNIS.length > 0 && onRecalculateNIS && (
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isRecalculating}
                                className="h-7 gap-1 text-xs border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                                onClick={() => handleBulkRecalcNIS(month)}
                              >
                                <RefreshCw className={`h-3 w-3 ${isRecalculating ? 'animate-spin' : ''}`} />
                                {bulkRecalcProgress
                                  ? `Recalculating ${bulkRecalcProgress.current} of ${bulkRecalcProgress.total}...`
                                  : `Recalculate NIS for ${weeksNeedingNIS.length} week(s)`}
                              </Button>
                              {bulkRecalcProgress && (
                                <Progress
                                  value={(bulkRecalcProgress.current / bulkRecalcProgress.total) * 100}
                                  className="h-1.5 mt-1 w-48"
                                />
                              )}
                              <p className="text-[10px] text-muted-foreground mt-1">
                                These weeks were processed when the NIS API was unavailable.
                              </p>
                            </div>
                          )}
                          {/* Monthly Bank Transfer */}
                          {onRecordBankTransfer && month.allPaid && (
                            <div className="pt-2 border-t border-primary/10">
                              {(() => {
                                const allEntryIds = month.weeks.flatMap(w => w.entries.filter(e => e.payment_status === 'paid').map(e => e.id));
                                const existingRef = month.weeks
                                  .flatMap(w => w.entries)
                                  .find(e => e.bank_transfer_ref)?.bank_transfer_ref;
                                return (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1 text-xs"
                                    onClick={() => onRecordBankTransfer(allEntryIds.join(','))}
                                  >
                                    {existingRef ? (
                                      <span className="text-green-600">✓ Transfer: {existingRef}</span>
                                    ) : (
                                      <>Record Monthly Transfer</>
                                    )}
                                  </Button>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* ── WEEKS INSIDE MONTH ── */}
                  {isMonthOpen && month.weeks.map((week) => {
                    const isWeekExpanded = expandedWeeks.has(week.key);
                    const isDetailsOpen = expandedWeekDetails.has(week.key);
                    const allWeekSelected = week.entries.every(e => selectedEntries.includes(e.id));
                    const someWeekSelected = week.entries.some(e => selectedEntries.includes(e.id));

                    return (
                      <React.Fragment key={week.key}>
                        {/* Week header row */}
                        <TableRow className="bg-muted/50 font-medium hover:bg-muted/70">
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleWeekExpand(week.key)}>
                              {isWeekExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                          <TableCell>
                            <div className="text-sm pl-2">
                              <div className="font-medium">{week.caregiverName}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(week.weekStart, 'MMM d')} – {format(week.weekEnd, 'MMM d, yyyy')}
                                <span className="ml-1">· {week.entries.length} {week.entries.length === 1 ? 'entry' : 'entries'}</span>
                              </div>
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
                          {!isMobile && (
                            <TableCell>{week.nisApplicable ? `$${(week.employeeContribution + week.employerContribution).toFixed(2)}` : '-'}</TableCell>
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

                        {/* Week-level NIS detail row (paid weeks) */}
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
                              {isDetailsOpen && week.weeklyGross > 200 && week.employeeContribution === 0 && onRecalculateNIS && (
                                <div className="pb-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isRecalculating}
                                    className="h-7 gap-1 text-xs border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                                    onClick={() => handleRecalcNIS(week.entries[0].id)}
                                  >
                                    <RefreshCw className={`h-3 w-3 ${isRecalculating ? 'animate-spin' : ''}`} />
                                    {isRecalculating ? 'Recalculating...' : 'Recalculate NIS'}
                                  </Button>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    NIS was not applied when this week was processed.
                                  </p>
                                </div>
                              )}
                              {/* Bank transfer moved to monthly level */}
                              {isDetailsOpen && onUndoPayment && (
                                <div className="flex gap-2 pb-2">
                                  {week.entries.map(entry => (
                                    <Button
                                      key={entry.id}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 gap-1 text-xs border-orange-300 hover:bg-orange-50 text-orange-700"
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
                        {isWeekExpanded && week.entries.map((entry) => (
                          <TableRow key={entry.id} className="bg-background">
                            <TableCell></TableCell>
                            <TableCell>
                              <Checkbox
                                checked={selectedEntries.includes(entry.id)}
                                onCheckedChange={() => handleSelectEntry(entry.id)}
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm pl-8">
                              {formatDate(entry.pay_period_start)}
                              {entry.pay_period_end && entry.pay_period_start !== entry.pay_period_end && (
                                <span className="text-xs"> – {formatDate(entry.pay_period_end)}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {entry.regular_hours}h @ ${entry.regular_rate}/hr
                              {entry.overtime_hours > 0 && <div className="text-xs">{entry.overtime_hours}h OT</div>}
                              {(entry.holiday_hours || 0) > 0 && <div className="text-xs">{entry.holiday_hours}h hol</div>}
                            </TableCell>
                            {!isMobile && <TableCell className="text-sm">${(entry.gross_pay || entry.total_amount).toFixed(2)}</TableCell>}
                            {!isMobile && <TableCell className="text-xs text-muted-foreground">—</TableCell>}
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
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

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
