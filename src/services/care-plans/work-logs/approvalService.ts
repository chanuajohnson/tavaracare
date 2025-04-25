
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { WorkLog } from "../types/workLogTypes";
import { calculatePayrollEntry } from "../payrollCalculationService";

export const approveWorkLog = async (workLogId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_logs')
      .update({ status: 'approved' })
      .eq('id', workLogId);

    if (error) throw error;

    const { data: workLog, error: fetchError } = await supabase
      .from('work_logs')
      .select('*')
      .eq('id', workLogId)
      .single();

    if (fetchError) throw fetchError;

    const payrollData = await calculatePayrollEntry(workLog as WorkLog);
    
    const totalAmount = 
      (payrollData.regularHours * payrollData.regularRate) +
      (payrollData.overtimeHours * payrollData.overtimeRate) +
      (payrollData.holidayHours * payrollData.holidayRate) +
      payrollData.expenseTotal;

    const { error: payrollError } = await supabase
      .from('payroll_entries')
      .insert({
        work_log_id: workLogId,
        care_team_member_id: workLog.care_team_member_id,
        care_plan_id: workLog.care_plan_id,
        regular_hours: payrollData.regularHours,
        overtime_hours: payrollData.overtimeHours,
        regular_rate: payrollData.regularRate,
        overtime_rate: payrollData.overtimeRate,
        holiday_hours: payrollData.holidayHours,
        holiday_rate: payrollData.holidayRate,
        expense_total: payrollData.expenseTotal,
        total_amount: totalAmount,
        payment_status: 'pending'
      });
      
    if (payrollError) throw payrollError;

    toast.success("Work log approved and payroll entry created");
    return true;
  } catch (error) {
    console.error("Error approving work log:", error);
    toast.error("Failed to approve work log");
    return false;
  }
};

export const rejectWorkLog = async (workLogId: string, reason?: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_logs')
      .update({ 
        status: 'rejected',
        notes: reason ? `Rejected: ${reason}` : undefined
      })
      .eq('id', workLogId);

    if (error) throw error;
    toast.success("Work log rejected");
    return true;
  } catch (error) {
    console.error("Error rejecting work log:", error);
    toast.error("Failed to reject work log");
    return false;
  }
};
