import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  fetchWorkLogs, 
  fetchPayrollEntries,
  approveWorkLog,
  rejectWorkLog,
  processPayrollPayment,
  WorkLog,
  PayrollEntry 
} from "@/services/care-plans/workLogService";
import { fetchCareTeamMembers } from "@/services/care-plans/careTeamService";
import { CareTeamMemberWithProfile } from "@/types/careTypes";

export const usePayrollData = (carePlanId: string) => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);

  useEffect(() => {
    loadData();
  }, [carePlanId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logs, entries, members] = await Promise.all([
        fetchWorkLogs(carePlanId),
        fetchPayrollEntries(carePlanId),
        fetchCareTeamMembers(carePlanId)
      ]);

      // Use professional details for name display
      const enhancedMembers = members.map(member => ({
        ...member,
        // No need to add displayName property anymore as we're using the existing properties directly
      }));

      setWorkLogs(logs);
      setPayrollEntries(entries);
      setCareTeamMembers(enhancedMembers);
    } catch (error) {
      console.error("Error loading payroll data:", error);
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorkLog = async (workLogId: string) => {
    const success = await approveWorkLog(workLogId);
    if (success) {
      await loadData();
      toast.success("Work log approved successfully");
    }
  };

  const handleRejectWorkLog = async (workLogId: string, reason: string) => {
    const success = await rejectWorkLog(workLogId, reason);
    if (success) {
      const updatedLogs = await fetchWorkLogs(carePlanId);
      setWorkLogs(updatedLogs);
      toast.success("Work log rejected");
      return true;
    }
    return false;
  };

  const handleProcessPayment = async (payrollId: string, paymentDate: Date) => {
    const success = await processPayrollPayment(payrollId, paymentDate);
    if (success) {
      const updatedEntries = await fetchPayrollEntries(carePlanId);
      setPayrollEntries(updatedEntries);
      toast.success("Payment processed successfully");
      return true;
    }
    return false;
  };

  return {
    workLogs,
    payrollEntries,
    careTeamMembers,
    loading,
    handleApproveWorkLog,
    handleRejectWorkLog,
    handleProcessPayment
  };
};
