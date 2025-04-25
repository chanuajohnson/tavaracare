
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RejectWorkLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: () => void;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
}

export const RejectWorkLogDialog: React.FC<RejectWorkLogDialogProps> = ({
  open,
  onOpenChange,
  onReject,
  rejectionReason,
  onReasonChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Work Log</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this work log.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Reason for rejection"
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={onReject}
            disabled={!rejectionReason}
          >
            Reject Work Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
