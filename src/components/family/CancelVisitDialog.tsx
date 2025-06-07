
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

interface CancelVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitDetails?: {
    date: string;
    time: string;
    type: string;
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
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cancellationReasons = [
    { value: 'schedule_conflict', label: 'Schedule conflict' },
    { value: 'no_longer_needed', label: 'No longer needed' },
    { value: 'found_alternative', label: 'Found alternative care' },
    { value: 'emergency', label: 'Emergency situation' },
    { value: 'other', label: 'Other reason' }
  ];

  const handleCancel = async () => {
    if (!user || !reason) {
      toast.error("Please select a cancellation reason");
      return;
    }

    setIsLoading(true);
    try {
      // Get the user's current visit booking
      const { data: visitBooking, error: fetchError } = await supabase
        .from('visit_bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !visitBooking) {
        throw new Error('No active visit booking found');
      }

      // Cancel the visit booking using the database function
      const finalReason = reason === 'other' ? customReason : cancellationReasons.find(r => r.value === reason)?.label;
      
      const { error: cancelError } = await supabase.rpc('cancel_visit_booking', {
        booking_id: visitBooking.id,
        reason: finalReason
      });

      if (cancelError) throw cancelError;

      // Update the user's profile visit status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          visit_scheduling_status: 'cancelled',
          visit_notes: JSON.stringify({
            cancelled_at: new Date().toISOString(),
            cancellation_reason: finalReason
          })
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success("Visit cancelled successfully");
      onOpenChange(false);
      
      if (onVisitCancelled) {
        onVisitCancelled();
      }
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
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Cancel Your Visit
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your scheduled visit? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {visitDetails && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-800">Visit Details</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{visitDetails.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{visitDetails.time}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for cancellation</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {cancellationReasons.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Please specify</Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please provide more details..."
                className="min-h-[80px]"
              />
            </div>
          )}

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
              disabled={!reason || isLoading || (reason === 'other' && !customReason.trim())}
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
