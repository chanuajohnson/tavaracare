
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RejectWorkLogDialogProps {
  children?: React.ReactNode;
  onReject: (reason: string) => Promise<boolean> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  rejectionReason?: string;
  onReasonChange?: (reason: string) => void;
}

export const RejectWorkLogDialog: React.FC<RejectWorkLogDialogProps> = ({
  children,
  onReject,
  open,
  onOpenChange,
  rejectionReason = '',
  onReasonChange,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalReason, setInternalReason] = React.useState('');

  // Use provided or internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const reason = rejectionReason !== undefined ? rejectionReason : internalReason;
  const setReason = onReasonChange || setInternalReason;

  const handleReject = async () => {
    if (reason) {
      await onReject(reason);
      setIsOpen(false);
      setReason('');
    }
  };

  // If children are provided, use as trigger
  if (children) {
    return (
      <>
        <div onClick={() => setIsOpen(true)}>
          {children}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!reason}
              >
                Reject Work Log
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // If no children, render just the dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={!reason}
          >
            Reject Work Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
