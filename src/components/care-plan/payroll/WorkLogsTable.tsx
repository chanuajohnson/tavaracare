import React, { useState } from 'react';
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
import { Check, Receipt, X } from "lucide-react";
import { PayrollStatusBadge } from './PayrollStatusBadge';
import { RejectWorkLogDialog } from './RejectWorkLogDialog';
import { WorkLogExpenses } from './WorkLogExpenses';
import { PayRateSelector } from './PayRateSelector';
import { generatePayReceipt } from '@/services/care-plans/receiptService';
import { ShareReceiptDialog } from './ShareReceiptDialog';
import { useWorkLogPayDetails } from '@/hooks/payroll/useWorkLogPayDetails';
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'jpg'>('pdf');

  if (workLogs.length === 0) {
    return <div className="text-center p-4">No work logs found.</div>;
  }

  const handleGenerateReceipt = async (workLog: WorkLog) => {
    try {
      const url = await generatePayReceipt(workLog, selectedFormat);
      setReceiptUrl(url);
      setCurrentWorkLog(workLog);
      setShareDialogOpen(true);
    } catch (error) {
      console.error("Error generating receipt:", error);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end items-center">
        <Select
          value={selectedFormat}
          onValueChange={(value: 'pdf' | 'jpg') => setSelectedFormat(value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="jpg">JPG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
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
          {workLogs.map((workLog) => {
            const startTime = new Date(workLog.start_time);
            const endTime = new Date(workLog.end_time);
            const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            
            // Calculate total expenses
            const totalExpenses = workLog.expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
            
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
                  <PayRateSelector 
                    workLogId={workLog.id} 
                    careTeamMemberId={workLog.care_team_member_id}
                    status={workLog.status}
                  />
                </TableCell>
                <TableCell>
                  <PayTotalDisplay 
                    workLogId={workLog.id} 
                    hours={hoursDiff} 
                    expenses={totalExpenses} 
                    key={`pay-${workLog.id}`}
                  />
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
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Generate Receipt"
                      onClick={() => handleGenerateReceipt(workLog)}
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
                </TableCell>
              </TableRow>
            );
          })}
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

// Component to display the total pay based on hours and rate
const PayTotalDisplay: React.FC<{ workLogId: string; hours: number; expenses: number }> = ({ 
  workLogId, 
  hours,
  expenses 
}) => {
  const { rate, totalPay, isLoading } = useWorkLogPayDetails(workLogId, hours, expenses);
  
  if (isLoading) {
    return <div className="text-muted-foreground">Calculating...</div>;
  }
  
  return (
    <div>
      <div className="font-medium">${totalPay.toFixed(2)}</div>
      <div className="text-xs text-muted-foreground">
        {hours.toFixed(1)}h × ${rate.toFixed(2)}/hr
        {expenses > 0 ? ` + $${expenses.toFixed(2)} expenses` : ''}
      </div>
    </div>
  );
};
