import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { PayrollEntry } from "../types/workLogTypes";
import { resolveCaregiverNames } from "../utils/resolveCaregiveNames";
import { calculateNIS } from "@/services/nisCalculation";
import { startOfWeek, endOfWeek } from "date-fns";

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
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  return { weekStart, weekEnd };
};

/**
 * Fetch all pending payroll entries for the same caregiver in the same ISO week.
 */
export const fetchWeeklyPendingEntries = async (
  payrollId: string
): Promise<{ entries: PayrollEntry[]; weeklyTotal: number; caregiverName: string }> => {
  try {
    // First get the target entry to find caregiver and week
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
    
    // Get the ISO week range from pay_period_start
    const entryDate = new Date(targetEntry.pay_period_start || targetEntry.created_at);
    const { weekStart, weekEnd } = getISOWeekRange(entryDate);

    // Fetch all pending entries for this caregiver in this care plan within the same week
    const { data: weekEntries, error: weekError } = await supabase
      .from('payroll_entries')
      .select('*')
      .eq('care_team_member_id', careTeamMemberId)
      .eq('care_plan_id', carePlanId)
      .eq('payment_status', 'pending')
      .gte('pay_period_start', weekStart.toISOString())
      .lte('pay_period_start', weekEnd.toISOString());

    if (weekError) throw weekError;

    const entries = (weekEntries || []) as PayrollEntry[];
    const weeklyTotal = entries.reduce((sum, e) => sum + (e.gross_pay || e.total_amount || 0), 0);

    return { entries, weeklyTotal, caregiverName };
  } catch (error) {
    console.error("Error fetching weekly pending entries:", error);
    return { entries: [], weeklyTotal: 0, caregiverName: 'Unknown' };
  }
};

/**
 * Process payment for all pending entries in the same ISO week.
 * Calculates NIS on weekly aggregate, distributes proportionally.
 */
export const processWeeklyPayrollPayment = async (
  payrollId: string,
  paymentDate = new Date()
): Promise<boolean> => {
  try {
    const { entries, weeklyTotal } = await fetchWeeklyPendingEntries(payrollId);

    if (entries.length === 0) {
      toast.error("No pending entries found for this week");
      return false;
    }

    // Calculate NIS on weekly aggregate
    let nisData = {
      nis_applicable: false,
      nis_class: null as string | null,
      employee_contribution: 0,
      employer_contribution: 0,
      net_pay_after_nis: weeklyTotal,
      nis_response: null as any,
    };

    try {
      const nisResult = await calculateNIS({ weekly_earnings: weeklyTotal });
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
    }

    // Distribute NIS proportionally across entries
    for (const entry of entries) {
      const proportion = (entry.gross_pay || entry.total_amount) / weeklyTotal;
      const entryEmployeeNIS = nisData.employee_contribution * proportion;
      const entryEmployerNIS = nisData.employer_contribution * proportion;
      const entryGross = entry.gross_pay || entry.total_amount;

      const { error } = await supabase
        .from('payroll_entries')
        .update({
          payment_status: 'paid',
          payment_date: paymentDate.toISOString(),
          nis_applicable: nisData.nis_applicable,
          nis_class: nisData.nis_class,
          employee_contribution: Math.round(entryEmployeeNIS * 100) / 100,
          employer_contribution: Math.round(entryEmployerNIS * 100) / 100,
          net_pay_after_nis: Math.round((entryGross - entryEmployeeNIS) * 100) / 100,
          nis_response: nisData.nis_response,
        })
        .eq('id', entry.id);

      if (error) throw error;
    }

    const nisMsg = nisData.nis_applicable
      ? ` NIS Class ${nisData.nis_class}: Employee $${nisData.employee_contribution.toFixed(2)}, Employer $${nisData.employer_contribution.toFixed(2)}`
      : ' NIS: Not applicable (weekly earnings ≤ $200)';

    toast.success(`${entries.length} entries paid.${nisMsg}`);
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
