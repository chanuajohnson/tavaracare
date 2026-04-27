
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2, AlertTriangle } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { fetchWeeklyPendingEntries, type WeeklyPayrollData } from "@/services/care-plans/work-logs/payrollService";

interface ProcessPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProcess: () => void;
  paymentDate: Date;
  onDateChange: (date: Date) => void;
  payrollId?: string | null;
}

export const ProcessPaymentDialog: React.FC<ProcessPaymentDialogProps> = ({
  open,
  onOpenChange,
  onProcess,
  paymentDate,
  onDateChange,
  payrollId,
}) => {
  const [loading, setLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyPayrollData | null>(null);

  useEffect(() => {
    if (open && payrollId) {
      loadWeeklyPreview(payrollId);
    } else if (!open) {
      setWeeklyData(null);
    }
  }, [open, payrollId]);

  const loadWeeklyPreview = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchWeeklyPendingEntries(id);
      setWeeklyData(data);
    } catch (error) {
      console.error('Error loading weekly preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Weekly Payment</DialogTitle>
          <DialogDescription>
            NIS is calculated on total weekly earnings per T&T law. All pending entries for this caregiver's week will be processed together.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading weekly data...</span>
            </div>
          ) : weeklyData ? (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              {/* Caregiver name */}
              <div className="text-sm font-medium">{weeklyData.caregiverName}</div>
              
              {/* Week range */}
              <div className="text-xs text-muted-foreground">
                Week: {format(weeklyData.weekStart, 'EEE MMM d')} – {format(weeklyData.weekEnd, 'EEE MMM d, yyyy')}
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {weeklyData.paidEntries.length > 0 && (
                  <>
                    <span className="text-muted-foreground">Already paid this week:</span>
                    <span className="text-right">${weeklyData.paidTotal.toFixed(2)} ({weeklyData.paidEntries.length} {weeklyData.paidEntries.length === 1 ? 'entry' : 'entries'})</span>
                  </>
                )}
                
                <span className="text-muted-foreground">Pending to process:</span>
                <span className="font-medium text-right">${weeklyData.pendingTotal.toFixed(2)} ({weeklyData.pendingEntries.length} {weeklyData.pendingEntries.length === 1 ? 'entry' : 'entries'})</span>
                
                <span className="text-muted-foreground font-medium">Weekly total for NIS:</span>
                <span className="font-semibold text-right">${weeklyData.weeklyTotal.toFixed(2)}</span>
              </div>

              {/* NIS section */}
              <div className="border-t pt-2 space-y-1">
                {weeklyData.nisError ? (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">NIS calculation failed</div>
                      <div className="text-xs text-muted-foreground mt-1">{weeklyData.nisError}</div>
                      <div className="text-xs mt-1">Payment will proceed without NIS deductions. You can retry or process anyway.</div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => payrollId && loadWeeklyPreview(payrollId)}
                      >
                        Retry NIS Calculation
                      </Button>
                    </div>
                  </div>
                ) : weeklyData.nisApplicable ? (
                  <>
                    <div className="text-sm font-medium text-primary">
                      NIS Class {weeklyData.nisClass}
                    </div>
                    {weeklyData.paidNisEmployee > 0 && (
                      <div className="text-xs text-muted-foreground">
                        NIS already applied to paid entries: Employee ${weeklyData.paidNisEmployee.toFixed(2)}, Employer ${weeklyData.paidNisEmployer.toFixed(2)}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Employee NIS (remaining):</span>
                      <span className="font-medium text-right text-destructive">
                        -${weeklyData.employeeContribution.toFixed(2)}
                      </span>
                      
                      <span className="text-muted-foreground">NIS Contribution (Caregiver) (remaining):</span>
                      <span className="font-medium text-right">
                        ${weeklyData.employerContribution.toFixed(2)}
                      </span>
                      
                      <span className="text-muted-foreground font-medium">Net pay (this batch):</span>
                      <span className="font-semibold text-right">
                        ${weeklyData.netPayPending.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    NIS: Not applicable (weekly earnings ≤ $200 TTD)
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Payment Date Picker */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Payment Date</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(paymentDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && onDateChange(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onProcess} disabled={loading || (weeklyData?.pendingEntries.length === 0)}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : weeklyData ? (
              `Process ${weeklyData.pendingEntries.length} ${weeklyData.pendingEntries.length === 1 ? 'Entry' : 'Entries'}`
            ) : (
              'Process Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
