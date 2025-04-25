
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
import { Check, Receipt, Share2, X } from "lucide-react";
import { PayrollStatusBadge } from './PayrollStatusBadge';
import { RejectWorkLogDialog } from './RejectWorkLogDialog';
import { WorkLogExpenses } from './WorkLogExpenses';
import { PayRateSelector } from './PayRateSelector';
import { generatePayReceipt } from '@/services/care-plans/receiptService';
import { ShareReceiptDialog } from './ShareReceiptDialog';
import { useWorkLogPayDetails } from '@/hooks/payroll/useWorkLogPayDetails';
import { Card, CardContent } from "@/components/ui/card";
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';

interface WorkLogsTableProps {
  workLogs: WorkLog[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => Promise<boolean>;
  readOnly?: boolean;
}

export const WorkLogsTable: React.FC<WorkLogsTableProps> = ({ 
  workLogs,
  onApprove,
  onReject,
  readOnly = false
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentWorkLog, setCurrentWorkLog] = useState<WorkLog | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Update mobile view state on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  // Mobile card view for each work log
  const renderMobileCard = (workLog: WorkLog) => {
    const startTime = new Date(workLog.start_time);
    const endTime = new Date(workLog.end_time);
    const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalExpenses = workLog.expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

    return (
      <Card key={workLog.id} className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{workLog.caregiver_name || 'Unknown'}</h4>
              <p className="text-sm text-muted-foreground">
                {format(startTime, 'MMM d, yyyy')}
              </p>
            </div>
            <PayrollStatusBadge status={workLog.status} />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p>{hoursDiff.toFixed(1)}h ({format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')})</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Pay Rate</p>
              {readOnly ? (
                <PayTotalDisplay workLogId={workLog.id} hours={hoursDiff} expenses={totalExpenses} showRateOnly />
              ) : (
                <PayRateSelector workLogId={workLog.id} careTeamMemberId={workLog.care_team_member_id} />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Total Pay</p>
              <PayTotalDisplay workLogId={workLog.id} hours={hoursDiff} expenses={totalExpenses} />
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              {workLog.expenses && workLog.expenses.length > 0 ? (
                <WorkLogExpenses expenses={workLog.expenses} />
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
          </div>
          
          {!readOnly && workLog.status === 'pending' && (
            <div className="flex gap-2 mt-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                title="Generate Receipt"
                onClick={() => handleGenerateReceipt(workLog)}
              >
                <Receipt className="h-4 w-4" />
              </Button>
              
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
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {isMobileView ? (
        <div className="space-y-4">
          {workLogs.map(renderMobileCard)}
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                {!readOnly && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {workLogs.map((workLog) => {
                const startTime = new Date(workLog.start_time);
                const endTime = new Date(workLog.end_time);
                const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                
                // Calculate total pay based on hours and selected rate
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
                      {readOnly ? (
                        <PayTotalDisplay workLogId={workLog.id} hours={hoursDiff} expenses={totalExpenses} showRateOnly />
                      ) : (
                        <PayRateSelector workLogId={workLog.id} careTeamMemberId={workLog.care_team_member_id} />
                      )}
                    </TableCell>
                    <TableCell>
                      <PayTotalDisplay workLogId={workLog.id} hours={hoursDiff} expenses={totalExpenses} />
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
                    {!readOnly && (
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
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

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
interface PayTotalDisplayProps {
  workLogId: string;
  hours: number;
  expenses: number;
  showRateOnly?: boolean;
}

const PayTotalDisplay: React.FC<PayTotalDisplayProps> = ({ 
  workLogId, 
  hours,
  expenses,
  showRateOnly = false
}) => {
  const { rate, effectiveMultiplier, totalPay } = useWorkLogPayDetails(workLogId, hours, expenses);
  
  if (!rate) {
    return <span className="text-muted-foreground">Loading...</span>;
  }
  
  if (showRateOnly) {
    return <span>${rate.toFixed(2)}/hr {effectiveMultiplier !== 1 && `(${effectiveMultiplier}x)`}</span>;
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
