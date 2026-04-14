import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { PayrollEntry } from "../types/workLogTypes";
import { resolveCaregiverNames } from "../utils/resolveCaregiveNames";
import { calculateNIS } from "@/services/nisCalculation";
import { startOfWeek, endOfWeek, format } from "date-fns";

/**
 * Compute wage-only earnings from a payroll entry (excludes expense reimbursements).
 * This is what should be sent to the NIS API as weekly_earnings.
 */
const getWageEarnings = (entry: any): number =>
  (entry.regular_hours || 0) * (entry.regular_rate || 0) +
  (entry.overtime_hours || 0) * (entry.overtime_rate || 0) +
  (entry.holiday_hours || 0) * (entry.holiday_rate || 0);

export const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id,
          profiles!caregiver_id (
            full_name
          )
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (entries.length > 0) {
      const records = entries.map(entry => ({
        caregiverId: entry.care_team_members?.caregiver_id || null,
        joinedName: entry.care_team_members?.profiles?.full_name || null,
      }));

      const nameMap = await resolveCaregiverNames(records);

      return entries.map(entry => {
        const caregiverId = entry.care_team_members?.caregiver_id;
        const resolvedName = caregiverId ? nameMap.get(caregiverId) : null;
        
        const validStatus: 'pending' | 'approved' | 'paid' = 
          ['pending', 'approved', 'paid'].includes(entry.payment_status) 
            ? entry.payment_status as 'pending' | 'approved' | 'paid'
            : 'pending';
            
        return {
          ...entry,
          caregiver_name: resolvedName || 'Unknown',
          payment_status: validStatus
        };
      });
    }
    
    return [] as PayrollEntry[];
  } catch (error) {
    console.error("Error fetching payroll entries:", error);
    toast.error("Failed to load payroll entries");
    return [];
  }
};

/**
 * Get the ISO week range (Monday–Sunday) for a given date.
 */
const getISOWeekRange = (date: Date) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return { weekStart, weekEnd };
};

export interface WeeklyPayrollData {
  pendingEntries: PayrollEntry[];
  paidEntries: PayrollEntry[];
  pendingTotal: number;
  paidTotal: number;
  weeklyTotal: number;
  caregiverName: string;
  weekStart: Date;
  weekEnd: Date;
  nisApplicable: boolean;
  nisClass: string | null;
  employeeContribution: number;
  employerContribution: number;
  netPayPending: number;
  nisError: string | null;
  paidNisEmployee: number;
  paidNisEmployer: number;
}

/**
 * Fetch ALL entries (paid + pending) for a caregiver in the same ISO week.
 * NIS is calculated on the full weekly total, but only pending entries are processed.
 */
export const fetchWeeklyPendingEntries = async (
  payrollId: string
): Promise<WeeklyPayrollData> => {
  const empty: WeeklyPayrollData = {
    pendingEntries: [],
    paidEntries: [],
    pendingTotal: 0,
    paidTotal: 0,
    weeklyTotal: 0,
    caregiverName: 'Unknown',
    weekStart: new Date(),
    weekEnd: new Date(),
    nisApplicable: false,
    nisClass: null,
    employeeContribution: 0,
    employerContribution: 0,
    netPayPending: 0,
    nisError: null,
    paidNisEmployee: 0,
    paidNisEmployer: 0,
  };

  try {
    // Get the target entry to find caregiver and week
    const { data: targetEntry, error: targetError } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id,
          profiles!caregiver_id (
            full_name
          )
        )
      `)
      .eq('id', payrollId)
      .single();

    if (targetError) throw targetError;

    const careTeamMemberId = targetEntry.care_team_member_id;
    const carePlanId = targetEntry.care_plan_id;
    const caregiverName = targetEntry.care_team_members?.profiles?.full_name || 'Unknown';
    
    // Get ISO week range from pay_period_start
    const entryDate = new Date(targetEntry.pay_period_start || targetEntry.created_at);
    const { weekStart, weekEnd } = getISOWeekRange(entryDate);

    // Fetch ALL entries for this caregiver in this care plan within the same week (all statuses)
    const { data: allWeekEntries, error: weekError } = await supabase
      .from('payroll_entries')
      .select('*')
      .eq('care_team_member_id', careTeamMemberId)
      .eq('care_plan_id', carePlanId)
      .gte('pay_period_start', weekStart.toISOString())
      .lte('pay_period_start', weekEnd.toISOString());

    if (weekError) throw weekError;

    const entries = (allWeekEntries || []) as PayrollEntry[];
    const pendingEntries = entries.filter(e => e.payment_status === 'pending');
    const paidEntries = entries.filter(e => e.payment_status === 'paid');

    const pendingTotal = pendingEntries.reduce((sum, e) => sum + (e.gross_pay || e.total_amount || 0), 0);
    const paidTotal = paidEntries.reduce((sum, e) => sum + (e.gross_pay || e.total_amount || 0), 0);
    // Use wage-only earnings for NIS calculation (excludes expense reimbursements)
    const weeklyTotal = entries.reduce((sum, e) => sum + getWageEarnings(e), 0);

    // Sum NIS already applied to paid entries this week
    const paidNisEmployee = paidEntries.reduce((sum, e) => sum + (e.employee_contribution || 0), 0);
    const paidNisEmployer = paidEntries.reduce((sum, e) => sum + (e.employer_contribution || 0), 0);

    // Calculate NIS on the FULL weekly total
    let nisApplicable = false;
    let nisClass: string | null = null;
    let employeeContribution = 0;
    let employerContribution = 0;
    let netPayPending = pendingTotal;
    let nisError: string | null = null;

    try {
      const nisResult = await calculateNIS({ weekly_earnings: weeklyTotal });
      nisApplicable = nisResult.nis_applicable;
      nisClass = nisResult.nis_class;
      
      // Total NIS for the week, minus what's already been paid
      const remainingEmployeeNIS = Math.max(0, nisResult.employee_contribution - paidNisEmployee);
      const remainingEmployerNIS = Math.max(0, nisResult.employer_contribution - paidNisEmployer);
      
      employeeContribution = Math.round(remainingEmployeeNIS * 100) / 100;
      employerContribution = Math.round(remainingEmployerNIS * 100) / 100;
      netPayPending = Math.round((pendingTotal - employeeContribution) * 100) / 100;
    } catch (err: any) {
      console.error("NIS calculation failed:", err);
      nisError = err?.message || "NIS calculation failed. Check edge function deployment and NUACHA_API_KEY.";
    }

    return {
      pendingEntries,
      paidEntries,
      pendingTotal,
      paidTotal,
      weeklyTotal,
      caregiverName,
      weekStart,
      weekEnd,
      nisApplicable,
      nisClass,
      employeeContribution,
      employerContribution,
      netPayPending,
      nisError,
      paidNisEmployee,
      paidNisEmployer,
    };
  } catch (error) {
    console.error("Error fetching weekly entries:", error);
    return empty;
  }
};

/**
 * Process payment for all pending entries in the same ISO week.
 * NIS is calculated on the full weekly total (including already-paid entries).
 */
export const processWeeklyPayrollPayment = async (
  payrollId: string,
  paymentDate = new Date()
): Promise<boolean> => {
  try {
    const weeklyData = await fetchWeeklyPendingEntries(payrollId);
    const { pendingEntries, pendingTotal, employeeContribution, employerContribution, nisApplicable, nisClass, nisError } = weeklyData;

    if (pendingEntries.length === 0) {
      toast.error("No pending entries found for this week");
      return false;
    }

    if (nisError) {
      toast.warning(`NIS calculation failed: ${nisError}. Processing without NIS deductions.`);
    }

    // Distribute NIS proportionally across pending entries
    for (const entry of pendingEntries) {
      const entryGross = entry.gross_pay || entry.total_amount || 0;
      const entryWages = getWageEarnings(entry);
      const pendingWages = pendingEntries.reduce((sum, e) => sum + getWageEarnings(e), 0);
      const proportion = pendingWages > 0 ? entryWages / pendingWages : 0;
      const entryEmployeeNIS = employeeContribution * proportion;
      const entryEmployerNIS = employerContribution * proportion;

      const { error } = await supabase
        .from('payroll_entries')
        .update({
          payment_status: 'paid',
          payment_date: paymentDate.toISOString(),
          nis_applicable: nisApplicable,
          nis_class: nisClass,
          employee_contribution: Math.round(entryEmployeeNIS * 100) / 100,
          employer_contribution: Math.round(entryEmployerNIS * 100) / 100,
          net_pay_after_nis: Math.round((entryGross - entryEmployeeNIS) * 100) / 100,
        })
        .eq('id', entry.id);

      if (error) throw error;
    }

    const nisMsg = nisError
      ? ' (NIS calculation failed — not applied)'
      : nisApplicable
        ? ` NIS Class ${nisClass}: Employee -$${employeeContribution.toFixed(2)}, Employer $${employerContribution.toFixed(2)}`
        : ' NIS: Not applicable (weekly earnings ≤ $200)';

    toast.success(`${pendingEntries.length} entries paid.${nisMsg}`);
    return true;
  } catch (error) {
    console.error("Error processing weekly payroll payment:", error);
    toast.error("Failed to process payment");
    return false;
  }
};

/**
 * Legacy single-entry payment (falls through to weekly logic).
 */
export const processPayrollPayment = async (payrollId: string, paymentDate = new Date()): Promise<boolean> => {
  return processWeeklyPayrollPayment(payrollId, paymentDate);
};

/**
 * Delete pending payroll entries and reset their linked work logs to 'pending'.
 * Only operates on entries with payment_status = 'pending'.
 */
/**
 * Undo a paid payroll entry — resets it back to pending and clears NIS fields.
 */
export const undoPayrollPayment = async (payrollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payroll_entries')
      .update({
        payment_status: 'pending',
        payment_date: null,
        nis_applicable: false,
        nis_class: null,
        employee_contribution: 0,
        employer_contribution: 0,
        net_pay_after_nis: null,
      })
      .eq('id', payrollId);

    if (error) throw error;

    // Also reset the linked work log back to approved (not pending)
    const { data: entry } = await supabase
      .from('payroll_entries')
      .select('work_log_id, gross_pay')
      .eq('id', payrollId)
      .single();

    if (entry?.work_log_id) {
      // Set net_pay_after_nis to gross_pay since NIS was cleared
      await supabase
        .from('payroll_entries')
        .update({ net_pay_after_nis: entry.gross_pay })
        .eq('id', payrollId);
    }

    toast.success("Payment undone — entry reverted to pending");
    return true;
  } catch (error) {
    console.error("Error undoing payroll payment:", error);
    toast.error("Failed to undo payment");
    return false;
  }
};

/**
 * Recalculate NIS for a paid week where NIS was not applied (e.g., edge function was down).
 * Fetches all entries in the same week, calls NIS API on weekly total,
 * distributes contributions proportionally, and updates entries in the DB.
 */
export const recalculateWeeklyNIS = async (entryId: string): Promise<boolean> => {
  try {
    // Reuse fetchWeeklyPendingEntries logic but we need all entries for the week
    const { data: targetEntry, error: targetError } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id,
          profiles!caregiver_id ( full_name )
        )
      `)
      .eq('id', entryId)
      .single();

    if (targetError) throw targetError;

    const careTeamMemberId = targetEntry.care_team_member_id;
    const carePlanId = targetEntry.care_plan_id;
    const entryDate = new Date(targetEntry.pay_period_start || targetEntry.created_at);
    const { weekStart, weekEnd } = getISOWeekRange(entryDate);

    // Get all entries for this caregiver in this week
    const { data: weekEntries, error: weekError } = await supabase
      .from('payroll_entries')
      .select('*')
      .eq('care_team_member_id', careTeamMemberId)
      .eq('care_plan_id', carePlanId)
      .gte('pay_period_start', weekStart.toISOString())
      .lte('pay_period_start', weekEnd.toISOString());

    if (weekError) throw weekError;
    if (!weekEntries || weekEntries.length === 0) {
      toast.error("No entries found for this week");
      return false;
    }

    // Use wage-only earnings for NIS calculation (excludes expense reimbursements)
    const weeklyGross = weekEntries.reduce((sum, e) => sum + getWageEarnings(e), 0);

    // Call NIS API
    const nisResult = await calculateNIS({ weekly_earnings: weeklyGross });

    if (!nisResult.nis_applicable) {
      toast.info(`NIS not applicable for weekly earnings of $${weeklyGross.toFixed(2)} (≤ $200)`);
      return true;
    }

    // Distribute NIS proportionally across all entries in the week
    for (const entry of weekEntries) {
      const entryGross = entry.gross_pay || entry.total_amount || 0;
      const entryWages = getWageEarnings(entry);
      const proportion = weeklyGross > 0 ? entryWages / weeklyGross : 0;
      const entryEmployeeNIS = Math.round(nisResult.employee_contribution * proportion * 100) / 100;
      const entryEmployerNIS = Math.round(nisResult.employer_contribution * proportion * 100) / 100;

      const { error: updateError } = await supabase
        .from('payroll_entries')
        .update({
          nis_applicable: true,
          nis_class: nisResult.nis_class,
          employee_contribution: entryEmployeeNIS,
          employer_contribution: entryEmployerNIS,
          net_pay_after_nis: Math.round((entryGross - entryEmployeeNIS) * 100) / 100,
        })
        .eq('id', entry.id);

      if (updateError) throw updateError;
    }

    toast.success(
      `NIS recalculated: Class ${nisResult.nis_class} — Employee $${nisResult.employee_contribution.toFixed(2)}, Employer $${nisResult.employer_contribution.toFixed(2)}`
    );
    return true;
  } catch (error: any) {
    console.error("Error recalculating NIS:", error);
    toast.error(`NIS recalculation failed: ${error?.message || 'Unknown error'}`);
    return false;
  }
};

/**
 * Delete pending payroll entries and reset their linked work logs to 'pending'.
 * Only operates on entries with payment_status = 'pending'.
 */
export const deletePayrollEntries = async (ids: string[]): Promise<{ deleted: number; failed: number }> => {
  let deleted = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      // Fetch the entry to get work_log_id and verify it's pending
      const { data: entry, error: fetchError } = await supabase
        .from('payroll_entries')
        .select('id, work_log_id, payment_status')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (entry.payment_status !== 'pending') {
        console.warn(`Skipping non-pending payroll entry ${id} (status: ${entry.payment_status})`);
        failed++;
        continue;
      }

      // Delete the payroll entry
      const { error: deleteError } = await supabase
        .from('payroll_entries')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Reset the linked work log back to pending
      if (entry.work_log_id) {
        const { error: resetError } = await supabase
          .from('work_logs')
          .update({ status: 'pending' })
          .eq('id', entry.work_log_id);

        if (resetError) {
          console.error(`Payroll entry ${id} deleted but failed to reset work log ${entry.work_log_id}:`, resetError);
        }
      }

      deleted++;
    } catch (error) {
      console.error(`Error deleting payroll entry ${id}:`, error);
      failed++;
    }
  }

  return { deleted, failed };
};
