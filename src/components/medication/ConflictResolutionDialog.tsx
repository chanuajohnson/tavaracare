
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Users, Clock, FileText } from "lucide-react";
import { MedicationConflict, ConflictResolution } from "@/services/medicationConflictService";
import { Badge } from "@/components/ui/badge";

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicationName: string;
  conflicts: MedicationConflict[];
  timeWindow: number;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  medicationName,
  conflicts,
  timeWindow,
  onResolve,
  onCancel
}: ConflictResolutionDialogProps) {
  const [selectedResolution, setSelectedResolution] = useState<'dual_entry' | 'override' | 'cancel'>('dual_entry');
  const [notes, setNotes] = useState('');

  const handleResolve = () => {
    if (selectedResolution === 'cancel') {
      onCancel();
      return;
    }

    onResolve({
      method: selectedResolution,
      notes: notes.trim() || undefined
    });
  };

  const formatConflictTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString()
    };
  };

  const getAdminName = (conflict: MedicationConflict) => {
    return conflict.profile?.full_name || 
           `${conflict.profile?.first_name || ''} ${conflict.profile?.last_name || ''}`.trim() ||
           'Unknown user';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Medication Administration Conflict
          </DialogTitle>
          <DialogDescription>
            <strong>{medicationName}</strong> was recently administered. Please choose how to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conflict Information */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Administration{conflicts.length > 1 ? 's' : ''}
            </h4>
            <div className="space-y-2">
              {conflicts.map((conflict) => {
                const { time, date } = formatConflictTime(conflict.administered_at);
                return (
                  <div key={conflict.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-orange-600" />
                      <span>{getAdminName(conflict)}</span>
                      <Badge variant="outline" className="text-xs">
                        {conflict.administered_by_role}
                      </Badge>
                    </div>
                    <div className="text-orange-700">
                      {time} on {date}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-orange-600 mt-2">
              Within {timeWindow} hour window of your administration time
            </p>
          </div>

          {/* Resolution Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">How would you like to proceed?</Label>
            
            <div className="space-y-2">
              {/* Dual Entry (Recommended) */}
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-green-200 bg-green-50">
                <input
                  type="radio"
                  name="resolution"
                  value="dual_entry"
                  checked={selectedResolution === 'dual_entry'}
                  onChange={(e) => setSelectedResolution(e.target.value as 'dual_entry')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Record Both Entries (Recommended)</div>
                  <p className="text-sm text-green-700">
                    Keep both administration records for safety and audit purposes. 
                    Both entries will be marked with conflict information.
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">Safest</Badge>
              </label>

              {/* Override */}
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="resolution"
                  value="override"
                  checked={selectedResolution === 'override'}
                  onChange={(e) => setSelectedResolution(e.target.value as 'override')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Override Previous Entry</div>
                  <p className="text-sm text-gray-600">
                    Replace the previous administration record with this one. 
                    Use only if you're certain the previous entry was incorrect.
                  </p>
                </div>
              </label>

              {/* Cancel */}
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="resolution"
                  value="cancel"
                  checked={selectedResolution === 'cancel'}
                  onChange={(e) => setSelectedResolution(e.target.value as 'cancel')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Cancel This Entry</div>
                  <p className="text-sm text-gray-600">
                    Don't record this administration and return to the previous screen.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Notes */}
          {selectedResolution !== 'cancel' && (
            <div className="space-y-2">
              <Label htmlFor="conflict-notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="conflict-notes"
                placeholder="Add any additional context about this administration..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleResolve}
            className={selectedResolution === 'dual_entry' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {selectedResolution === 'dual_entry' && 'Record Both Entries'}
            {selectedResolution === 'override' && 'Override Previous'}
            {selectedResolution === 'cancel' && 'Cancel Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
