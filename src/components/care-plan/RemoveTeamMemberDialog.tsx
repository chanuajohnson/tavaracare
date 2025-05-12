
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CareTeamMemberWithProfile } from "@/types/careTypes";

interface RemoveTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: CareTeamMemberWithProfile | null;
  onConfirm: () => void;
}

export const RemoveTeamMemberDialog: React.FC<RemoveTeamMemberDialogProps> = ({
  open,
  onOpenChange,
  member,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Are you sure you want to remove {member?.professionalDetails?.full_name || member?.caregiverId} from the care team?
          </p>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Remove Team Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
