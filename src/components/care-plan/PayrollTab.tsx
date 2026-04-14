import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayrollFilters } from './payroll/PayrollFilters';
import { WorkLogsTable } from './payroll/WorkLogsTable';
import { PayrollEntriesTable } from './payroll/PayrollEntriesTable';
import { RejectWorkLogDialog } from './payroll/RejectWorkLogDialog';
import { ProcessPaymentDialog } from './payroll/ProcessPaymentDialog';
import { NISReportsSection } from './payroll/NISReportsSection';
import { BankTransferDialog } from './payroll/BankTransferDialog';
import { EmployerSettingsForm } from './settings/EmployerSettingsForm';
import { usePayrollData } from '@/hooks/payroll/usePayrollData';
import { usePayrollFilters } from '@/hooks/payroll/usePayrollFilters';

interface PayrollTabProps {
  carePlanId: string;
  familyId?: string;
  isProfessionalView?: boolean;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({ carePlanId, familyId, isProfessionalView = false }) => {
  const [currentTab, setCurrentTab] = useState<string>("worklogs");
  
  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [workLogToReject, setWorkLogToReject] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [payrollToProcess, setPayrollToProcess] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [bankTransferDialogOpen, setBankTransferDialogOpen] = useState(false);
  const [bankTransferPayrollId, setBankTransferPayrollId] = useState<string | null>(null);

  const {
    workLogs,
    payrollEntries,
    loading,
    handleApproveWorkLog,
    handleRejectWorkLog,
    handleProcessPayment,
    handleDeletePayrollEntries,
    handleDeleteWorkLog,
    handleUndoPayment,
    handleRecalculateNIS,
    handleBulkApproveWorkLogs,
    handleBulkRejectWorkLogs,
    handleBulkDeleteWorkLogs,
    careTeamMembers
  } = usePayrollData(carePlanId);

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

  const openRejectDialog = async (workLogId: string, reason: string): Promise<boolean> => {
    setWorkLogToReject(workLogId);
    setRejectDialogOpen(true);
    return true;
  };

  const handleRejectWorkLogSubmit = async (reason: string): Promise<boolean> => {
    if (!workLogToReject) return false;
    const success = await handleRejectWorkLog(workLogToReject, reason);
    if (success) {
      setRejectDialogOpen(false);
      setRejectionReason('');
      setWorkLogToReject(null);
      return true;
    }
    return false;
  };

  const openPaymentDialog = (payrollId: string) => {
    setPayrollToProcess(payrollId);
    setPaymentDialogOpen(true);
  };

  const handleProcessPaymentSubmit = async () => {
    if (!payrollToProcess) return;
    const success = await handleProcessPayment(payrollToProcess, paymentDate);
    if (success) {
      setPaymentDialogOpen(false);
      setPayrollToProcess(null);
    }
  };

  const openBankTransferDialog = (payrollId: string) => {
    setBankTransferPayrollId(payrollId);
    setBankTransferDialogOpen(true);
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
            {familyId && <TabsTrigger value="nis-reports">NIS Reports</TabsTrigger>}
          </TabsList>
          
          {currentTab === "worklogs" ? (
            <PayrollFilters
              searchTerm={workLogFilters.searchTerm}
              onSearchChange={workLogSetFilters.setSearchTerm}
              dateRangeFilter={workLogFilters.dateRangeFilter}
              onDateRangeChange={workLogSetFilters.setDateRangeFilter}
              statusFilter={workLogFilters.statusFilter}
              onStatusChange={workLogSetFilters.setStatusFilter}
              caregiverFilter={workLogFilters.caregiverFilter}
              onCaregiverChange={workLogSetFilters.setCaregiverFilter}
              careTeamMembers={careTeamMembers}
            />
          ) : currentTab === "payroll" ? (
            <PayrollFilters
              searchTerm={payrollFilters.searchTerm}
              onSearchChange={payrollSetFilters.setSearchTerm}
              dateRangeFilter={payrollFilters.dateRangeFilter}
              onDateRangeChange={payrollSetFilters.setDateRangeFilter}
              statusFilter={payrollFilters.statusFilter}
              onStatusChange={payrollSetFilters.setStatusFilter}
              caregiverFilter={payrollFilters.caregiverFilter}
              onCaregiverChange={payrollSetFilters.setCaregiverFilter}
              careTeamMembers={careTeamMembers}
              showPayrollStatuses
            />
          ) : null}
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
                  onDelete={handleDeleteWorkLog}
                  onBulkApprove={handleBulkApproveWorkLogs}
                  onBulkReject={handleBulkRejectWorkLogs}
                  onBulkDelete={handleBulkDeleteWorkLogs}
                  isProfessionalView={isProfessionalView}
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
                  onDeleteEntries={handleDeletePayrollEntries}
                  onUndoPayment={handleUndoPayment}
                  onRecalculateNIS={handleRecalculateNIS}
                  onRecordBankTransfer={openBankTransferDialog}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {familyId && (
          <TabsContent value="nis-reports" className="space-y-6">
            <EmployerSettingsForm familyId={familyId} />
            <NISReportsSection carePlanId={carePlanId} familyId={familyId} />
          </TabsContent>
        )}
      </Tabs>

      <RejectWorkLogDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onReject={handleRejectWorkLogSubmit}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
      />

      <ProcessPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onProcess={handleProcessPaymentSubmit}
        paymentDate={paymentDate}
        onDateChange={setPaymentDate}
        payrollId={payrollToProcess}
      />

      <BankTransferDialog
        open={bankTransferDialogOpen}
        onOpenChange={setBankTransferDialogOpen}
        payrollId={bankTransferPayrollId}
      />
    </div>
  );
};
