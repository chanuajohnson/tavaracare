
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fetchWorkLogs, fetchPayrollEntries, approveWorkLog, rejectWorkLog, processPayrollPayment } from "@/services/care-plans/workLogService";
import { PayrollFilters } from './payroll/PayrollFilters';
import { WorkLogsTable } from './payroll/WorkLogsTable';
import { PayrollEntriesTable } from './payroll/PayrollEntriesTable';
import { usePayrollFilters } from '@/hooks/payroll/usePayrollFilters';
import { toast } from "sonner";

interface PayrollTabProps {
  carePlanId: string;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({ carePlanId }) => {
  const [workLogs, setWorkLogs] = useState([]);
  const [payrollEntries, setPayrollEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("worklogs");
  
  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [workLogToReject, setWorkLogToReject] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [payrollToProcess, setPayrollToProcess] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());

  // Set up filters for work logs
  const {
    filters: workLogFilters,
    setFilters: workLogSetFilters,
    filterItems: filterWorkLogs
  } = usePayrollFilters(workLogs, (log, startDate) => {
    return new Date(log.start_time) >= startDate;
  });

  // Set up filters for payroll entries
  const {
    filters: payrollFilters,
    setFilters: payrollSetFilters,
    filterItems: filterPayrollEntries
  } = usePayrollFilters(payrollEntries, (entry, startDate) => {
    return entry.created_at ? new Date(entry.created_at) >= startDate : false;
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [logs, entries] = await Promise.all([
          fetchWorkLogs(carePlanId),
          fetchPayrollEntries(carePlanId)
        ]);
        setWorkLogs(logs);
        setPayrollEntries(entries);
      } catch (error) {
        console.error("Error loading payroll data:", error);
        toast.error("Failed to load payroll data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [carePlanId]);

  const handleApproveWorkLog = async (workLogId: string) => {
    const success = await approveWorkLog(workLogId);
    if (success) {
      const [updatedLogs, updatedEntries] = await Promise.all([
        fetchWorkLogs(carePlanId),
        fetchPayrollEntries(carePlanId)
      ]);
      setWorkLogs(updatedLogs);
      setPayrollEntries(updatedEntries);
      toast.success("Work log approved successfully");
    }
  };

  const openRejectDialog = (workLogId: string) => {
    setWorkLogToReject(workLogId);
    setRejectDialogOpen(true);
  };

  const handleRejectWorkLog = async () => {
    if (!workLogToReject) return;
    
    const success = await rejectWorkLog(workLogToReject, rejectionReason);
    if (success) {
      const updatedLogs = await fetchWorkLogs(carePlanId);
      setWorkLogs(updatedLogs);
      setRejectDialogOpen(false);
      setRejectionReason('');
      setWorkLogToReject(null);
      toast.success("Work log rejected");
    }
  };

  const openPaymentDialog = (payrollId: string) => {
    setPayrollToProcess(payrollId);
    setPaymentDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!payrollToProcess) return;
    
    const success = await processPayrollPayment(payrollToProcess, paymentDate);
    if (success) {
      const updatedEntries = await fetchPayrollEntries(carePlanId);
      setPayrollEntries(updatedEntries);
      setPaymentDialogOpen(false);
      setPayrollToProcess(null);
      toast.success("Payment processed successfully");
    }
  };

  const filteredWorkLogs = filterWorkLogs(workLogs);
  const filteredPayrollEntries = filterPayrollEntries(payrollEntries);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="worklogs" onValueChange={setCurrentTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <TabsList>
            <TabsTrigger value="worklogs">Work Logs</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Entries</TabsTrigger>
          </TabsList>
          
          {/* Filters */}
          {currentTab === "worklogs" ? (
            <PayrollFilters
              searchTerm={workLogFilters.searchTerm}
              onSearchChange={workLogSetFilters.setSearchTerm}
              dateRangeFilter={workLogFilters.dateRangeFilter}
              onDateRangeChange={workLogSetFilters.setDateRangeFilter}
              statusFilter={workLogFilters.statusFilter}
              onStatusChange={workLogSetFilters.setStatusFilter}
            />
          ) : (
            <PayrollFilters
              searchTerm={payrollFilters.searchTerm}
              onSearchChange={payrollSetFilters.setSearchTerm}
              dateRangeFilter={payrollFilters.dateRangeFilter}
              onDateRangeChange={payrollSetFilters.setDateRangeFilter}
              statusFilter={payrollFilters.statusFilter}
              onStatusChange={payrollSetFilters.setStatusFilter}
              showPayrollStatuses
            />
          )}
        </div>

        <TabsContent value="worklogs">
          <Card>
            <CardHeader>
              <CardTitle>Work Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <WorkLogsTable
                  workLogs={filteredWorkLogs}
                  onApprove={handleApproveWorkLog}
                  onReject={openRejectDialog}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PayrollEntriesTable
                  entries={filteredPayrollEntries}
                  onProcessPayment={openPaymentDialog}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Work Log Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Work Log</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this work log.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectWorkLog}
              disabled={!rejectionReason}
            >
              Reject Work Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Enter the date when the payment was or will be made.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Payment Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(paymentDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={paymentDate}
                    onSelect={(date) => date && setPaymentDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleProcessPayment}>
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
