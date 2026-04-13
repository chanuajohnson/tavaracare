
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { WorkLog } from "../types/workLogTypes";
import { calculatePayrollEntry } from "../payrollCalculationService";
import { calculateNIS } from "@/services/nisCalculation";

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

    // Calculate NIS contributions
    let nisData = {
      nis_applicable: false,
      nis_class: null as string | null,
      employee_contribution: 0,
      employer_contribution: 0,
      net_pay_after_nis: grossPay,
      nis_response: null as any,
    };

    try {
      const nisResult = await calculateNIS({ weekly_earnings: grossPay });
      nisData = {
        nis_applicable: nisResult.nis_applicable,
        nis_class: nisResult.nis_class,
        employee_contribution: nisResult.employee_contribution,
        employer_contribution: nisResult.employer_contribution,
        net_pay_after_nis: nisResult.net_pay_after_nis,
        nis_response: nisResult,
      };
    } catch (nisError) {
      console.warn("NIS calculation failed, proceeding without NIS:", nisError);
      // Continue without NIS — don't block the approval
    }

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
        // NIS fields
        nis_applicable: nisData.nis_applicable,
        nis_class: nisData.nis_class,
        employee_contribution: nisData.employee_contribution,
        employer_contribution: nisData.employer_contribution,
        net_pay_after_nis: nisData.net_pay_after_nis,
        nis_response: nisData.nis_response,
      });
      
    if (payrollError) throw payrollError;

    const nisMsg = nisData.nis_applicable 
      ? ` (NIS: $${nisData.employee_contribution.toFixed(2)} employee / $${nisData.employer_contribution.toFixed(2)} employer)`
      : '';
    toast.success(`Work log approved and payroll entry created${nisMsg}`);
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
