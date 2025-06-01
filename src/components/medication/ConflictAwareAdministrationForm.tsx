
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pill, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { medicationService } from "@/services/medicationService";
import { ConflictResolutionDialog } from "./ConflictResolutionDialog";
import { MedicationConflict, ConflictResolution } from "@/services/medicationConflictService";
import { toast } from "sonner";

interface ConflictAwareAdministrationFormProps {
  medicationId: string;
  medicationName: string;
  onAdministrationRecorded?: () => void;
}

export function ConflictAwareAdministrationForm({
  medicationId,
  medicationName,
  onAdministrationRecorded
}: ConflictAwareAdministrationFormProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingAdministration, setPendingAdministration] = useState<{
    administeredAt: string;
    notes: string;
  } | null>(null);
  const [conflicts, setConflicts] = useState<MedicationConflict[]>([]);
  const [timeWindow, setTimeWindow] = useState(2);

  const handleQuickAdminister = async () => {
    if (!user) {
      toast.error("You must be logged in to record administration");
      return;
    }

    const administeredAt = new Date().toISOString();
    setIsSubmitting(true);

    try {
      // First attempt - this will check for conflicts
      const result = await medicationService.recordAdministrationWithConflictDetection(
        medicationId,
        administeredAt,
        user.id,
        'family', // This component is for family users
        notes.trim() || undefined
      );

      if (result.requiresResolution && result.conflicts) {
        // Show conflict resolution dialog
        setPendingAdministration({ administeredAt, notes });
        setConflicts(result.conflicts);
        setTimeWindow(result.timeWindow || 2);
        setShowConflictDialog(true);
      } else if (result.success) {
        // Success - no conflicts or already resolved
        setNotes('');
        onAdministrationRecorded?.();
        
        if (result.conflictDetected) {
          toast.success("Administration recorded with conflict noted for safety");
        } else {
          toast.success("Medication administered successfully");
        }
      } else {
        toast.error(result.error || "Failed to record administration");
      }
    } catch (error) {
      console.error("Error recording administration:", error);
      toast.error("Failed to record administration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConflictResolution = async (resolution: ConflictResolution) => {
    if (!user || !pendingAdministration) return;

    setIsSubmitting(true);
    try {
      const result = await medicationService.recordAdministrationWithConflictDetection(
        medicationId,
        pendingAdministration.administeredAt,
        user.id,
        'family',
        pendingAdministration.notes || undefined,
        resolution
      );

      if (result.success) {
        setNotes('');
        setShowConflictDialog(false);
        setPendingAdministration(null);
        onAdministrationRecorded?.();
        
        if (resolution.method === 'dual_entry') {
          toast.success("Both administrations recorded for safety");
        } else {
          toast.success("Administration recorded successfully");
        }
      } else {
        toast.error(result.error || "Failed to record administration");
      }
    } catch (error) {
      console.error("Error resolving conflict:", error);
      toast.error("Failed to record administration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConflictCancel = () => {
    setShowConflictDialog(false);
    setPendingAdministration(null);
    setIsSubmitting(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-500" />
            Quick Administration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Current Time:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-notes">Notes (Optional)</Label>
            <Textarea
              id="admin-notes"
              placeholder="Add any notes about this administration..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Conflict Detection Active</p>
                <p>The system will check for recent administrations and alert you if this medication was recently given by another caregiver.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleQuickAdminister} 
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Administered
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <ConflictResolutionDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        medicationName={medicationName}
        conflicts={conflicts}
        timeWindow={timeWindow}
        onResolve={handleConflictResolution}
        onCancel={handleConflictCancel}
      />
    </>
  );
}
