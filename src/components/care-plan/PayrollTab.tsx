
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface PayrollTabProps {
  carePlanId: string;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({ carePlanId }) => {
  const [workLogs, setWorkLogs] = React.useState<any[]>([]);
  const [payrollEntries, setPayrollEntries] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const logs = await fetchWorkLogs(carePlanId);
      const entries = await fetchPayrollEntries(carePlanId);
      setWorkLogs(logs);
      setPayrollEntries(entries);
    };
    loadData();
  }, [carePlanId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Logs</CardTitle>
        </CardHeader>
        <CardContent>
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
              {workLogs.map((log) => (
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
                        onClick={() => approveWorkLog(log.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
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
              {payrollEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.created_at), 'MMM d, yyyy')}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
