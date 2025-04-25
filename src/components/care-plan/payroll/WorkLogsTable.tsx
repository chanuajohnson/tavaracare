
import React from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayrollStatusBadge } from './PayrollStatusBadge';
import type { WorkLog } from "@/services/care-plans/workLogService";

interface WorkLogsTableProps {
  workLogs: WorkLog[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const WorkLogsTable: React.FC<WorkLogsTableProps> = ({
  workLogs,
  onApprove,
  onReject,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Caregiver</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workLogs.length > 0 ? (
          workLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{format(new Date(log.start_time), 'MMM d, yyyy')}</TableCell>
              <TableCell>{log.caregiver_name || 'Unknown'}</TableCell>
              <TableCell>
                {format(new Date(log.start_time), 'h:mm a')} - 
                {format(new Date(log.end_time), 'h:mm a')}
              </TableCell>
              <TableCell>
                <PayrollStatusBadge status={log.status} />
              </TableCell>
              <TableCell className="text-right space-x-2">
                {log.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onApprove(log.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => onReject(log.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {log.notes && (
                  <span title={log.notes} className="cursor-help text-sm text-muted-foreground">
                    Has notes
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
              No work logs found matching your filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
