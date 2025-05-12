
import { Button } from "@/components/ui/button";
import { Receipt, Check, X } from "lucide-react";
import { RejectWorkLogDialog } from "../RejectWorkLogDialog";
import type { WorkLog } from "@/services/care-plans/types/workLogTypes";

interface WorkLogActionsProps {
  workLog: WorkLog;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => Promise<boolean>;
  onGenerateReceipt: (workLog: WorkLog) => void;
}

export const WorkLogActions = ({
  workLog,
  onApprove,
  onReject,
  onGenerateReceipt
}: WorkLogActionsProps) => {
  return (
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
  );
};
