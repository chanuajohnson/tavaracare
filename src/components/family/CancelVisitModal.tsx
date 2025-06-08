
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarX, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';

interface CancelVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitDetails: any;
  onCancel: () => void;
  loading?: boolean;
}

export const CancelVisitModal: React.FC<CancelVisitModalProps> = ({
  open,
  onOpenChange,
  visitDetails,
  onCancel,
  loading = false
}) => {
  if (!visitDetails) return null;

  const formatVisitDate = (date: string) => {
    try {
      return format(new Date(date), 'MMMM dd, yyyy');
    } catch {
      return date;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5 text-red-500" />
            Cancel Visit
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Are you sure you want to cancel your visit?</p>
                <p className="mt-1">This action cannot be undone and you'll need to reschedule if you change your mind.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Visit Details:</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                <p><span className="font-medium">Date:</span> {formatVisitDate(visitDetails.date)}</p>
                <p><span className="font-medium">Time:</span> {visitDetails.time}</p>
                <p><span className="font-medium">Type:</span> {visitDetails.type === 'virtual' ? 'Virtual' : 'In-Person'}</p>
                {visitDetails.is_admin_scheduled && (
                  <p><span className="font-medium">Scheduled by:</span> Admin</p>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Keep Visit
          </Button>
          <Button 
            variant="destructive" 
            onClick={onCancel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Cancelling...' : 'Cancel Visit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
