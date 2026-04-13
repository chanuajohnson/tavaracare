
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
    
    const grossPay = 
      (payrollData.regularHours * payrollData.regularRate) +
      (payrollData.overtimeHours * payrollData.overtimeRate) +
      (payrollData.holidayHours * payrollData.holidayRate) +
      payrollData.expenseTotal;

    // NIS is now calculated at payment time (weekly aggregation), not per-entry
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
        total_amount: grossPay,
        gross_pay: grossPay,
        payment_status: 'pending',
        pay_period_start: workLog.start_time,
        pay_period_end: workLog.end_time,
        // NIS fields left as defaults — will be populated at payment processing
        nis_applicable: false,
        employee_contribution: 0,
        employer_contribution: 0,
        net_pay_after_nis: grossPay,
      });
      
    if (payrollError) throw payrollError;

    toast.success("Work log approved and payroll entry created. NIS will be calculated when payment is processed.");
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

export const deleteWorkLog = async (workLogId: string): Promise<boolean> => {
  try {
    // First delete any linked pending payroll entries
    const { error: payrollDeleteError } = await supabase
      .from('payroll_entries')
      .delete()
      .eq('work_log_id', workLogId)
      .eq('payment_status', 'pending');

    if (payrollDeleteError) {
      console.error("Error deleting linked payroll entries:", payrollDeleteError);
    }

    // Delete the work log itself
    const { error } = await supabase
      .from('work_logs')
      .delete()
      .eq('id', workLogId)
      .eq('status', 'pending');

    if (error) throw error;
    toast.success("Work log deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting work log:", error);
    toast.error("Failed to delete work log");
    return false;
  }
};
