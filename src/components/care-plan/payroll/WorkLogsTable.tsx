
import React from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { PayrollStatusBadge } from './PayrollStatusBadge';
import { RejectWorkLogDialog } from './RejectWorkLogDialog';
import { WorkLogExpenses } from './WorkLogExpenses';
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
  if (workLogs.length === 0) {
    return <div className="text-center p-4">No work logs found.</div>;
  }

  return (
    <Table>
      <TableCaption>Submitted work logs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Caregiver</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Expenses</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workLogs.map((workLog) => {
          const startTime = new Date(workLog.start_time);
          const endTime = new Date(workLog.end_time);
          const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          return (
            <TableRow key={workLog.id}>
              <TableCell className="font-medium">
                {workLog.caregiver_name || 'Unknown'}
              </TableCell>
              <TableCell>
                {format(startTime, 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {hoursDiff.toFixed(1)}h ({format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')})
              </TableCell>
              <TableCell>
                {workLog.expenses && workLog.expenses.length > 0 ? (
                  <WorkLogExpenses expenses={workLog.expenses} />
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                <PayrollStatusBadge status={workLog.status} />
              </TableCell>
              <TableCell className="text-right">
                {workLog.status === 'pending' && (
                  <div className="flex justify-end gap-2">
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
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
