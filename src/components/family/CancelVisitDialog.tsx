
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

interface CancelVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitDetails?: {
    date: string;
    time: string;
    type: 'virtual' | 'in-person';
  };
  onVisitCancelled?: () => void;
}

export const CancelVisitDialog: React.FC<CancelVisitDialogProps> = ({
  open,
  onOpenChange,
  visitDetails,
  onVisitCancelled
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update the profile visit status to cancelled
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'cancelled',
          visit_notes: JSON.stringify({
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
            previous_visit_details: visitDetails
          })
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Also update any visit bookings to cancelled status
      const { error: bookingError } = await supabase
        .from('visit_bookings')
        .update({ 
          is_cancelled: true,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          status: 'cancelled'
        })
        .eq('user_id', user.id)
        .eq('status', 'scheduled');

      if (bookingError) {
        console.warn('No visit booking found to cancel:', bookingError);
      }

      toast.success("Visit cancelled successfully");
      
      // Call the callback to refresh journey progress
      if (onVisitCancelled) {
        onVisitCancelled();
      }
      
      // Reset form and close dialog
      setReason('');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error cancelling visit:', error);
      toast.error("Failed to cancel visit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancel Visit
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your scheduled visit? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {visitDetails && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-900 mb-2">Visit Details:</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{new Date(visitDetails.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{visitDetails.time}</span>
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {visitDetails.type === 'virtual' ? 'Virtual Visit' : 'In-Person Visit'}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for cancellation (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Please let us know why you're cancelling so we can improve our service..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Keep Visit
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Visit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
