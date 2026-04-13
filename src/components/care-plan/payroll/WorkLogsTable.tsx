
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { ShareReceiptDialog } from './ShareReceiptDialog';
import { RejectWorkLogDialog } from './RejectWorkLogDialog';
import { generatePayReceipt } from '@/services/care-plans/receiptService';
import { WorkLogTableRow } from './table/WorkLogTableRow';
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';
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

interface WorkLogsTableProps {
  workLogs: WorkLog[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  onBulkApprove?: (ids: string[]) => Promise<{ approved: number; failed: number }>;
  onBulkReject?: (ids: string[], reason: string) => Promise<{ rejected: number; failed: number }>;
  onBulkDelete?: (ids: string[]) => Promise<{ deleted: number; failed: number }>;
  isProfessionalView?: boolean;
}

export const WorkLogsTable: React.FC<WorkLogsTableProps> = ({ 
  workLogs,
  onApprove,
  onReject,
  onDelete,
  onBulkApprove,
  onBulkReject,
  onBulkDelete,
  isProfessionalView = false
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentWorkLog, setCurrentWorkLog] = useState<WorkLog | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const pendingWorkLogs = workLogs.filter(wl => wl.status === 'pending');
  const allPendingSelected = pendingWorkLogs.length > 0 && pendingWorkLogs.every(wl => selectedIds.has(wl.id));
  const showBulkActions = selectedIds.size > 0 && !isProfessionalView;

  if (workLogs.length === 0) {
    return <div className="text-center p-4">No work logs found.</div>;
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingWorkLogs.map(wl => wl.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (!onBulkApprove) return;
    setBulkLoading(true);
    await onBulkApprove(Array.from(selectedIds));
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleBulkRejectSubmit = async (reason: string) => {
    if (!onBulkReject) return false;
    setBulkLoading(true);
    await onBulkReject(Array.from(selectedIds), reason);
    setSelectedIds(new Set());
    setBulkRejectOpen(false);
    setBulkRejectReason('');
    setBulkLoading(false);
    return true;
  };

  const handleBulkDeleteConfirm = async () => {
    if (!onBulkDelete) return;
    setBulkLoading(true);
    await onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkLoading(false);
  };

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
      {showBulkActions && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-lg flex-wrap">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button size="sm" onClick={handleBulkApprove} disabled={bulkLoading}>
            <CheckCircle className="h-4 w-4 mr-1" /> Approve Selected
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBulkRejectOpen(true)} disabled={bulkLoading}>
            <XCircle className="h-4 w-4 mr-1" /> Reject Selected
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)} disabled={bulkLoading}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
        </div>
      )}

      <Table>
        <TableCaption>Submitted work logs</TableCaption>
        <TableHeader>
          <TableRow>
            {!isProfessionalView && (
              <TableHead className="w-10">
                <Checkbox
                  checked={allPendingSelected && pendingWorkLogs.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all pending"
                />
              </TableHead>
            )}
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
              onDelete={onDelete}
              isProfessionalView={isProfessionalView}
              isSelected={selectedIds.has(workLog.id)}
              onToggleSelect={toggleSelect}
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

      <RejectWorkLogDialog
        open={bulkRejectOpen}
        onOpenChange={setBulkRejectOpen}
        onReject={handleBulkRejectSubmit}
        rejectionReason={bulkRejectReason}
        onReasonChange={setBulkRejectReason}
      />

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} work logs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected pending work logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeleteConfirm} disabled={bulkLoading}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
