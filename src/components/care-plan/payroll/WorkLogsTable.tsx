
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ShareReceiptDialog } from './ShareReceiptDialog';
import { generatePayReceipt } from '@/services/care-plans/receiptService';
import { WorkLogTableRow } from './table/WorkLogTableRow';
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';

interface WorkLogsTableProps {
  workLogs: WorkLog[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => Promise<boolean>;
}

export const WorkLogsTable: React.FC<WorkLogsTableProps> = ({ 
  workLogs,
  onApprove,
  onReject
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentWorkLog, setCurrentWorkLog] = useState<WorkLog | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  if (workLogs.length === 0) {
    return <div className="text-center p-4">No work logs found.</div>;
  }

  const handleGenerateReceipt = async (workLog: WorkLog) => {
    try {
      const url = await generatePayReceipt(workLog);
      setReceiptUrl(url);
      setCurrentWorkLog(workLog);
      setShareDialogOpen(true);
    } catch (error) {
      console.error("Error generating receipt:", error);
    }
  };

  return (
    <>
      <Table>
        <TableCaption>Submitted work logs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Caregiver</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Pay Rate</TableHead>
            <TableHead>Total Pay</TableHead>
            <TableHead>Expenses</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workLogs.map((workLog) => (
            <WorkLogTableRow
              key={workLog.id}
              workLog={workLog}
              onApprove={onApprove}
              onReject={onReject}
              onGenerateReceipt={handleGenerateReceipt}
            />
          ))}
        </TableBody>
      </Table>

      <ShareReceiptDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        receiptUrl={receiptUrl}
        workLog={currentWorkLog}
      />
    </>
  );
};
