
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fetchWorkLogs, fetchPayrollEntries, approveWorkLog, WorkLog, PayrollEntry } from "@/services/care-plans/workLogService";

interface PayrollTabProps {
  carePlanId: string;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({ carePlanId }) => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const logs = await fetchWorkLogs(carePlanId);
        const entries = await fetchPayrollEntries(carePlanId);
        setWorkLogs(logs);
        setPayrollEntries(entries);
      } catch (error) {
        console.error("Error loading payroll data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [carePlanId]);

  const handleApproveWorkLog = async (workLogId: string) => {
    const success = await approveWorkLog(workLogId);
    if (success) {
      // Refresh work logs after approval
      const updatedLogs = await fetchWorkLogs(carePlanId);
      setWorkLogs(updatedLogs);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${log.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            log.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {log.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApproveWorkLog(log.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No work logs found for this care plan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Regular Hours</TableHead>
                  <TableHead>Overtime Hours</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollEntries.length > 0 ? (
                  payrollEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.created_at ? format(new Date(entry.created_at), 'MMM d, yyyy') : 'Unknown'}</TableCell>
                      <TableCell>{entry.caregiver_name || 'Unknown'}</TableCell>
                      <TableCell>{entry.regular_hours}</TableCell>
                      <TableCell>{entry.overtime_hours}</TableCell>
                      <TableCell>${entry.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${entry.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                            entry.payment_status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {entry.payment_status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No payroll entries found for this care plan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
