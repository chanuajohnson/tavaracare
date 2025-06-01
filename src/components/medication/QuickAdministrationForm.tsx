
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { MedicationWithAdministrations, medicationService } from "@/services/medicationService";
import { useAuth } from "@/components/providers/AuthProvider";
import { format } from "date-fns";

interface QuickAdministrationFormProps {
  medication: MedicationWithAdministrations;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scheduledTime?: string; // Optional scheduled time for this dose
}

export const QuickAdministrationForm = ({
  medication,
  isOpen,
  onClose,
  onSuccess,
  scheduledTime
}: QuickAdministrationFormProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'administered' | 'missed' | 'refused'>('administered');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Use scheduled time if provided, otherwise use current time
      const administeredAt = scheduledTime || new Date().toISOString();

      const result = await medicationService.recordAdministrationWithConflictDetection(
        medication.id,
        administeredAt,
        user.id,
        'professional',
        notes.trim() || undefined
      );

      if (result && result.success) {
        onSuccess();
        onClose();
        setNotes('');
        setStatus('administered');
      }
    } catch (error) {
      console.error("Error recording administration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case 'administered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'refused':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const formatScheduledTime = (timeString: string) => {
    const date = new Date(timeString);
    return format(date, 'PPp'); // e.g., "Jan 1, 2024 at 8:00 AM"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(status)}
            Record Administration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium">{medication.name}</h4>
            {medication.dosage && (
              <p className="text-sm text-gray-600">Dosage: {medication.dosage}</p>
            )}
            {medication.instructions && (
              <p className="text-sm text-gray-600">Instructions: {medication.instructions}</p>
            )}
          </div>

          {scheduledTime && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Scheduled Time</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                {formatScheduledTime(scheduledTime)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administered">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Administered
                  </div>
                </SelectItem>
                <SelectItem value="missed">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Missed
                  </div>
                </SelectItem>
                <SelectItem value="refused">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Refused
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this administration..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Recording...' : 'Record'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
