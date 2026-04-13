
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { fetchWeeklyPendingEntries } from "@/services/care-plans/work-logs/payrollService";
import { calculateNIS } from "@/services/nisCalculation";

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
  const [weeklyData, setWeeklyData] = useState<{
    entryCount: number;
    weeklyTotal: number;
    caregiverName: string;
    nisApplicable: boolean;
    nisClass: string | null;
    employeeContribution: number;
    employerContribution: number;
    netPay: number;
  } | null>(null);

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
      const { entries, weeklyTotal, caregiverName } = await fetchWeeklyPendingEntries(id);
      
      let nisResult = {
        nis_applicable: false,
        nis_class: null as string | null,
        employee_contribution: 0,
        employer_contribution: 0,
        net_pay_after_nis: weeklyTotal,
      };

      try {
        const nis = await calculateNIS({ weekly_earnings: weeklyTotal });
        nisResult = {
          nis_applicable: nis.nis_applicable,
          nis_class: nis.nis_class,
          employee_contribution: nis.employee_contribution,
          employer_contribution: nis.employer_contribution,
          net_pay_after_nis: nis.net_pay_after_nis,
        };
      } catch {
        // NIS calculation failed, continue without
      }

      setWeeklyData({
        entryCount: entries.length,
        weeklyTotal,
        caregiverName,
        nisApplicable: nisResult.nis_applicable,
        nisClass: nisResult.nis_class,
        employeeContribution: nisResult.employee_contribution,
        employerContribution: nisResult.employer_contribution,
        netPay: nisResult.net_pay_after_nis,
      });
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
          {/* Weekly NIS Preview */}
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Calculating weekly NIS...</span>
            </div>
          ) : weeklyData ? (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="text-sm font-medium">{weeklyData.caregiverName}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Entries this week:</span>
                <span className="font-medium text-right">{weeklyData.entryCount}</span>
                
                <span className="text-muted-foreground">Weekly gross pay:</span>
                <span className="font-medium text-right">${weeklyData.weeklyTotal.toFixed(2)}</span>
              </div>

              <div className="border-t pt-2 space-y-1">
                {weeklyData.nisApplicable ? (
                  <>
                    <div className="text-sm font-medium text-primary">
                      NIS Class {weeklyData.nisClass}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Employee NIS deduction:</span>
                      <span className="font-medium text-right text-destructive">
                        -${weeklyData.employeeContribution.toFixed(2)}
                      </span>
                      
                      <span className="text-muted-foreground">Employer NIS liability:</span>
                      <span className="font-medium text-right">
                        ${weeklyData.employerContribution.toFixed(2)}
                      </span>
                      
                      <span className="text-muted-foreground font-medium">Net pay to caregiver:</span>
                      <span className="font-semibold text-right">
                        ${weeklyData.netPay.toFixed(2)}
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
          <Button onClick={onProcess} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : weeklyData ? (
              `Process ${weeklyData.entryCount} ${weeklyData.entryCount === 1 ? 'Entry' : 'Entries'}`
            ) : (
              'Process Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
