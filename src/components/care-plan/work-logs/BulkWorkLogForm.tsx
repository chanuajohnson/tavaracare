import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RateTypeSelector } from './RateTypeSelector';
import { Progress } from "@/components/ui/progress";
import { format, isWithinInterval, parseISO } from "date-fns";
import { CalendarIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { bulkCreateWorkLogsForShifts } from "@/services/care-plans/work-logs/shiftService";
import type { RateType } from '@/services/care-plans/types/workLogTypes';
import { toast } from "sonner";

interface BulkWorkLogFormProps {
  carePlanId: string;
  careShifts: CareShift[];
  careTeamMembers: CareTeamMemberWithProfile[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const BulkWorkLogForm: React.FC<BulkWorkLogFormProps> = ({
  carePlanId,
  careShifts,
  careTeamMembers,
  onSuccess,
  onCancel,
}) => {
  const [selectedCaregiverId, setSelectedCaregiverId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [rateType, setRateType] = useState<RateType>('regular');
  const [baseRate, setBaseRate] = useState(25);
  const [customMultiplier, setCustomMultiplier] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ created: number; skipped: number; failed: number } | null>(null);

  const isCustomRate = rateType === 'custom';

  // Find matching shifts for selected caregiver + date range
  const matchingShifts = useMemo(() => {
    if (!selectedCaregiverId || !startDate || !endDate) return [];
    return careShifts.filter(shift => {
      if (shift.caregiverId !== selectedCaregiverId) return false;
      const shiftDate = parseISO(shift.startTime);
      return isWithinInterval(shiftDate, { start: startDate, end: endDate });
    });
  }, [selectedCaregiverId, startDate, endDate, careShifts]);

  const rateMultiplier = isCustomRate ? customMultiplier : 
    rateType === 'overtime' ? 1.5 : 
    rateType === 'shadow' ? 0.5 : 1;

  const handleSubmit = async () => {
    if (matchingShifts.length === 0) return;
    setIsSubmitting(true);
    setProgress(0);
    setResult(null);

    try {
      const summary = await bulkCreateWorkLogsForShifts(
        matchingShifts,
        notes,
        {
          rate_type: rateType,
          base_rate: baseRate,
          rate_multiplier: rateMultiplier,
        },
        (current, total) => setProgress(Math.round((current / total) * 100))
      );

      setResult(summary);

      if (summary.created > 0) {
        toast.success(`Created ${summary.created} work log${summary.created > 1 ? 's' : ''} successfully${summary.skipped > 0 ? ` (${summary.skipped} already logged)` : ''}`);
        onSuccess();
      } else if (summary.skipped > 0) {
        toast.info(`All ${summary.skipped} shifts already have work logs`);
      } else {
        toast.error('Failed to create work logs');
      }
    } catch (error) {
      console.error('Bulk work log error:', error);
      toast.error('An error occurred during bulk submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedCaregiverId && startDate && endDate && matchingShifts.length > 0 && !isSubmitting;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Bulk Log Work Hours</DialogTitle>
        <DialogDescription>
          Create work logs for all shifts within a date range at once.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
        {/* Caregiver Selection */}
        <div className="space-y-2">
          <Label>Caregiver</Label>
          <Select value={selectedCaregiverId} onValueChange={setSelectedCaregiverId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a caregiver" />
            </SelectTrigger>
            <SelectContent>
              {careTeamMembers.map((member) => (
                <SelectItem key={member.caregiverId} value={member.caregiverId}>
                  {member.professionalDetails?.full_name || "Unknown Professional"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d, yyyy") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM d, yyyy") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Rate Type */}
        <RateTypeSelector
          rateType={rateType}
          baseRate={baseRate}
          customMultiplier={customMultiplier}
          onRateTypeChange={(v) => setRateType(v)}
          onBaseRateChange={setBaseRate}
          onMultiplierChange={setCustomMultiplier}
          isCustomRate={isCustomRate}
        />

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Notes applied to all work logs in this batch"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Preview */}
        {selectedCaregiverId && startDate && endDate && (
          <div className={cn(
            "rounded-lg p-4 border",
            matchingShifts.length > 0 ? "bg-accent/50 border-accent" : "bg-muted border-border"
          )}>
            {matchingShifts.length > 0 ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">
                    {matchingShifts.length} shift{matchingShifts.length !== 1 ? 's' : ''} found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Work logs will be created for each shift. Shifts that already have logs will be skipped automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  No shifts found for this caregiver in the selected date range.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress during submission */}
        {isSubmitting && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Processing... {progress}%
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            `Submit ${matchingShifts.length} Log${matchingShifts.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </DialogFooter>
    </>
  );
};
