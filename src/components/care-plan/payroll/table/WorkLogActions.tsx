
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Receipt, Check, X, Trash2 } from "lucide-react";
import { RejectWorkLogDialog } from "../RejectWorkLogDialog";
import { PayrollStatusBadge } from "../PayrollStatusBadge";
import type { WorkLog } from "@/services/care-plans/types/workLogTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkLogActionsProps {
  workLog: WorkLog;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => Promise<boolean>;
  onGenerateReceipt: (workLog: WorkLog) => void;
  onDelete?: (id: string) => Promise<boolean>;
  isProfessionalView?: boolean;
}

export const WorkLogActions = ({
  workLog,
  onApprove,
  onReject,
  onGenerateReceipt,
  onDelete,
  isProfessionalView = false
}: WorkLogActionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    await onDelete(workLog.id);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
  };

  const DeleteButton = () => (
    workLog.status === 'pending' && onDelete ? (
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        title="Delete Work Log"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ) : null
  );

  const DeleteDialog = () => (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Work Log?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this pending work log and any linked pending payroll entry. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Professional view: show status text instead of approve/reject buttons
  if (isProfessionalView) {
    return (
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Generate Receipt"
          onClick={() => onGenerateReceipt(workLog)}
        >
          <Receipt className="h-4 w-4" />
        </Button>
        <DeleteButton />
        {workLog.status === 'pending' ? (
          <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-2.5 py-0.5 rounded-full">
            Pending Approval
          </span>
        ) : workLog.status === 'approved' ? (
          <span className="text-sm font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
            Approved
          </span>
        ) : workLog.status === 'rejected' ? (
          <span className="text-sm font-medium text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
            Rejected
          </span>
        ) : (
          <PayrollStatusBadge status={workLog.status} />
        )}
        <DeleteDialog />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Generate Receipt"
          onClick={() => onGenerateReceipt(workLog)}
        >
          <Receipt className="h-4 w-4" />
        </Button>
        
        <DeleteButton />
        
        {workLog.status === 'pending' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => onApprove(workLog.id)}
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
            
            <RejectWorkLogDialog 
              onReject={(reason) => onReject(workLog.id, reason)}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" /> Reject
              </Button>
            </RejectWorkLogDialog>
          </>
        )}
      </div>
      <DeleteDialog />
    </>
  );
};
