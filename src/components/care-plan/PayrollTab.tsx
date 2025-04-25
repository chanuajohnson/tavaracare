
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { fetchWorkLogs, fetchPayrollEntries, approveWorkLog, rejectWorkLog, processPayrollPayment, WorkLog, PayrollEntry } from "@/services/care-plans/workLogService";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PayrollTabProps {
  carePlanId: string;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({ carePlanId }) => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [filteredWorkLogs, setFilteredWorkLogs] = useState<WorkLog[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [filteredPayrollEntries, setFilteredPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [workLogToReject, setWorkLogToReject] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [payrollToProcess, setPayrollToProcess] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<"last7" | "last30" | "thisMonth" | "all">("last30");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("worklogs");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const logs = await fetchWorkLogs(carePlanId);
        const entries = await fetchPayrollEntries(carePlanId);
        setWorkLogs(logs);
        setFilteredWorkLogs(logs);
        setPayrollEntries(entries);
        setFilteredPayrollEntries(entries);
      } catch (error) {
        console.error("Error loading payroll data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [carePlanId]);

  // Apply filters to work logs
  useEffect(() => {
    let filtered = [...workLogs];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }
    
    // Apply date range filter
    const today = new Date();
    let startDate: Date;
    
    switch(dateRangeFilter) {
      case "last7":
        startDate = subDays(today, 7);
        filtered = filtered.filter(log => new Date(log.start_time) >= startDate);
        break;
      case "last30":
        startDate = subDays(today, 30);
        filtered = filtered.filter(log => new Date(log.start_time) >= startDate);
        break;
      case "thisMonth":
        startDate = startOfMonth(today);
        const endDate = endOfMonth(today);
        filtered = filtered.filter(log => {
          const logDate = new Date(log.start_time);
          return logDate >= startDate && logDate <= endDate;
        });
        break;
      default:
        // "all" - no filtering needed
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        (log.caregiver_name && log.caregiver_name.toLowerCase().includes(term)) ||
        (log.notes && log.notes.toLowerCase().includes(term))
      );
    }
    
    setFilteredWorkLogs(filtered);
  }, [workLogs, statusFilter, dateRangeFilter, searchTerm]);

  // Apply filters to payroll entries
  useEffect(() => {
    let filtered = [...payrollEntries];
    
    // Apply status filter for payroll
    if (statusFilter !== "all") {
      filtered = filtered.filter(entry => entry.payment_status === statusFilter);
    }
    
    // Apply date range filter
    const today = new Date();
    let startDate: Date;
    
    switch(dateRangeFilter) {
      case "last7":
        startDate = subDays(today, 7);
        filtered = filtered.filter(entry => new Date(entry.created_at!) >= startDate);
        break;
      case "last30":
        startDate = subDays(today, 30);
        filtered = filtered.filter(entry => new Date(entry.created_at!) >= startDate);
        break;
      case "thisMonth":
        startDate = startOfMonth(today);
        const endDate = endOfMonth(today);
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.created_at!);
          return entryDate >= startDate && entryDate <= endDate;
        });
        break;
      default:
        // "all" - no filtering needed
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.caregiver_name && entry.caregiver_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredPayrollEntries(filtered);
  }, [payrollEntries, statusFilter, dateRangeFilter, searchTerm]);

  const handleApproveWorkLog = async (workLogId: string) => {
    const success = await approveWorkLog(workLogId);
    if (success) {
      // Refresh data after approval
      const updatedLogs = await fetchWorkLogs(carePlanId);
      const updatedEntries = await fetchPayrollEntries(carePlanId);
      setWorkLogs(updatedLogs);
      setPayrollEntries(updatedEntries);
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
      // Refresh work logs after rejection
      const updatedLogs = await fetchWorkLogs(carePlanId);
      setWorkLogs(updatedLogs);
      setRejectDialogOpen(false);
      setRejectionReason('');
      setWorkLogToReject(null);
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
      // Refresh payroll entries after processing payment
      const updatedEntries = await fetchPayrollEntries(carePlanId);
      setPayrollEntries(updatedEntries);
      setPaymentDialogOpen(false);
      setPayrollToProcess(null);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="worklogs" onValueChange={setCurrentTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <TabsList>
            <TabsTrigger value="worklogs">Work Logs</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Entries</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
            <Input 
              placeholder="Search by name or notes" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-auto"
            />
            
            <Select value={dateRangeFilter} onValueChange={(value) => setDateRangeFilter(value as any)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="thisMonth">This month</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {currentTab === "worklogs" ? (
                  <>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
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
                    {filteredWorkLogs.length > 0 ? (
                      filteredWorkLogs.map((log) => (
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
                          <TableCell className="text-right space-x-2">
                            {log.status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApproveWorkLog(log.id)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => openRejectDialog(log.id)}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Caregiver</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrollEntries.length > 0 ? (
                      filteredPayrollEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.created_at ? format(new Date(entry.created_at), 'MMM d, yyyy') : 'Unknown'}</TableCell>
                          <TableCell>{entry.caregiver_name || 'Unknown'}</TableCell>
                          <TableCell>
                            <div>Regular: {entry.regular_hours}h</div>
                            {entry.overtime_hours > 0 && (
                              <div className="text-amber-600">Overtime: {entry.overtime_hours}h</div>
                            )}
                            {entry.holiday_hours > 0 && (
                              <div className="text-blue-600">Holiday: {entry.holiday_hours}h</div>
                            )}
                          </TableCell>
                          <TableCell>${entry.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${entry.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                                entry.payment_status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {entry.payment_status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.payment_status !== 'paid' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openPaymentDialog(entry.id)}
                              >
                                Process Payment
                              </Button>
                            )}
                            {entry.payment_status === 'paid' && entry.payment_date && (
                              <span className="text-sm text-muted-foreground">
                                Paid on {format(new Date(entry.payment_date), 'MMM d, yyyy')}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No payroll entries found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
