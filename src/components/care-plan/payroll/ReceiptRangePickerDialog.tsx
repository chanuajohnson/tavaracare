import { useMemo, useState, useEffect } from "react";
import { format, startOfISOWeek, endOfISOWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { WorkLog } from "@/services/care-plans/types/workLogTypes";
import type { DateRange } from "react-day-picker";

export type RangeMode = "week" | "month" | "custom";

interface ReceiptRangePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: RangeMode;
  anchorWorkLog: WorkLog | null;
  workLogs: WorkLog[];
  onConfirm: (range: { from: Date; to: Date; label: string }, filteredLogs: WorkLog[]) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const ReceiptRangePickerDialog = ({
  open,
  onOpenChange,
  mode,
  anchorWorkLog,
  workLogs,
  onConfirm,
}: ReceiptRangePickerDialogProps) => {
  const anchorDate = anchorWorkLog ? new Date(anchorWorkLog.start_time) : new Date();

  // Week mode state
  const [weekDate, setWeekDate] = useState<Date>(anchorDate);
  // Month mode state
  const [monthIdx, setMonthIdx] = useState<number>(anchorDate.getMonth());
  const [year, setYear] = useState<number>(anchorDate.getFullYear());
  // Custom mode state
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: startOfISOWeek(anchorDate),
    to: endOfISOWeek(anchorDate),
  });

  // Re-sync defaults when dialog opens with a new anchor
  useEffect(() => {
    if (open && anchorWorkLog) {
      const d = new Date(anchorWorkLog.start_time);
      setWeekDate(d);
      setMonthIdx(d.getMonth());
      setYear(d.getFullYear());
      setCustomRange({ from: startOfISOWeek(d), to: endOfISOWeek(d) });
    }
  }, [open, anchorWorkLog]);

  const { from, to, label } = useMemo(() => {
    if (mode === "week") {
      const f = startOfISOWeek(weekDate);
      const t = endOfISOWeek(weekDate);
      return { from: f, to: t, label: `Week of ${format(f, "MMM d")} – ${format(t, "MMM d, yyyy")}` };
    }
    if (mode === "month") {
      const base = new Date(year, monthIdx, 1);
      const f = startOfMonth(base);
      const t = endOfMonth(base);
      return { from: f, to: t, label: format(base, "MMMM yyyy") };
    }
    const f = customRange?.from ?? anchorDate;
    const t = customRange?.to ?? customRange?.from ?? anchorDate;
    return { from: f, to: t, label: `${format(f, "MMM d, yyyy")} – ${format(t, "MMM d, yyyy")}` };
  }, [mode, weekDate, monthIdx, year, customRange, anchorDate]);

  const filteredLogs = useMemo(() => {
    if (!anchorWorkLog) return [];
    return workLogs.filter((wl) => {
      if (wl.care_team_member_id !== anchorWorkLog.care_team_member_id) return false;
      if (wl.status === "rejected") return false;
      const start = new Date(wl.start_time);
      return isWithinInterval(start, { start: from, end: to });
    });
  }, [workLogs, anchorWorkLog, from, to]);

  const totals = useMemo(() => {
    let hours = 0;
    let amount = 0;
    let expenses = 0;
    filteredLogs.forEach((wl) => {
      const h = (new Date(wl.end_time).getTime() - new Date(wl.start_time).getTime()) / 3_600_000;
      const rate = (wl.base_rate || 0) * (wl.rate_multiplier || 1);
      hours += h;
      amount += h * rate;
      expenses += (wl.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    });
    return { hours, amount, expenses };
  }, [filteredLogs]);

  const caregiverName = anchorWorkLog?.caregiver_name || "Unknown";

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - 2 + i);
  }, []);

  const titleMap: Record<RangeMode, string> = {
    week: "Weekly Care Receipt",
    month: "Monthly Care Receipt",
    custom: "Custom Date Range Care Receipt",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{titleMap[mode]}</DialogTitle>
          <DialogDescription>
            Select the {mode === "custom" ? "date range" : mode} for {caregiverName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mode === "week" && (
            <div className="space-y-2">
              <Label>Pick any day in the week (Mon–Sun)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(weekDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={weekDate}
                    onSelect={(d) => d && setWeekDate(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {mode === "month" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={String(monthIdx)} onValueChange={(v) => setMonthIdx(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {mode === "custom" && (
            <div className="space-y-2">
              <Label>Pick a date range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customRange?.from ? (
                      customRange.to ? (
                        <>{format(customRange.from, "MMM d, yyyy")} – {format(customRange.to, "MMM d, yyyy")}</>
                      ) : (
                        format(customRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={customRange}
                    onSelect={setCustomRange}
                    numberOfMonths={2}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="rounded-md border bg-muted/30 p-3 space-y-1.5 text-sm">
            <div className="font-medium text-foreground">{label}</div>
            <div className="text-muted-foreground">Caregiver: <span className="text-foreground">{caregiverName}</span></div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div>
                <div className="text-xs text-muted-foreground">Logs</div>
                <div className="font-semibold">{filteredLogs.length}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hours</div>
                <div className="font-semibold">{totals.hours.toFixed(1)}h</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Amount</div>
                <div className="font-semibold">${(totals.amount + totals.expenses).toFixed(2)}</div>
              </div>
            </div>
            {filteredLogs.length === 0 && (
              <div className="text-xs text-destructive pt-1">No work logs in this range.</div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={filteredLogs.length === 0}
            onClick={() => onConfirm({ from, to, label }, filteredLogs)}
          >
            Generate Care Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
