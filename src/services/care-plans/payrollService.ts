
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { PayrollEntry } from "../types/workLogTypes";

export const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          display_name
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (entries.length > 0) {
      return entries.map(entry => {        
        return {
          ...entry,
          caregiver_name: entry.care_team_members?.display_name || 'Unknown',
          payment_status: ['pending', 'approved', 'paid'].includes(entry.payment_status) 
            ? entry.payment_status as 'pending' | 'approved' | 'paid'
            : 'pending'
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

export const processPayrollPayment = async (payrollId: string, paymentDate = new Date()): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payroll_entries')
      .update({ 
        payment_status: 'paid',
        payment_date: paymentDate.toISOString()
      })
      .eq('id', payrollId);

    if (error) throw error;
    toast.success("Payment processed successfully");
    return true;
  } catch (error) {
    console.error("Error processing payroll payment:", error);
    toast.error("Failed to process payment");
    return false;
  }
};

// Get rates for a specific work log
export const getRatesForWorkLog = async (workLogId: string, careTeamMemberId: string) => {
  try {
    // Fetch work log with base_rate and rate_multiplier
    const { data, error } = await supabase
      .from('work_logs')
      .select('base_rate, rate_multiplier')
      .eq('id', workLogId)
      .single();

    if (error) throw error;

    // Get the care team member default rates if not set
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('care_team_members')
      .select('regular_rate')
      .eq('id', careTeamMemberId)
      .single();

    if (teamMemberError) throw teamMemberError;

    // Use work log rates, or fall back to team member's regular rate, or default to 25
    return {
      baseRate: data?.base_rate || teamMember?.regular_rate || 25,
      rateMultiplier: data?.rate_multiplier || 1
    };
  } catch (error) {
    console.error('Error getting rates for work log:', error);
    toast.error('Failed to load pay rates');
    return {
      baseRate: 25,
      rateMultiplier: 1
    };
  }
};

// Update base rate and multiplier for a work log
export const updateWorkLogBaseRateAndMultiplier = async (
  workLogId: string,
  baseRate: number,
  rateMultiplier: number
) => {
  try {
    const { error } = await supabase
      .from('work_logs')
      .update({ 
        base_rate: baseRate, 
        rate_multiplier: rateMultiplier
      })
      .eq('id', workLogId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating work log rates:', error);
    toast.error('Failed to update pay rates');
    return false;
  }
};

// Filter payroll entries by caregiver and date range
export const filterPayrollEntries = (
  entries: PayrollEntry[], 
  caregiverName?: string, 
  dateRange?: { from?: Date; to?: Date }
): PayrollEntry[] => {
  return entries.filter(entry => {
    // Filter by caregiver name
    const matchesCaregiverFilter = !caregiverName || 
      entry.caregiver_name?.toLowerCase().includes(caregiverName.toLowerCase());
      
    // Date range filter logic
    let withinDateRange = true;
    const entryDate = entry.entered_at ? new Date(entry.entered_at) : 
                     entry.created_at ? new Date(entry.created_at) : null;
    
    if (entryDate && dateRange?.from) {
      withinDateRange = withinDateRange && entryDate >= dateRange.from;
    }
    
    if (entryDate && dateRange?.to) {
      // Add one day to include entries on the end date
      const endDate = new Date(dateRange.to);
      endDate.setDate(endDate.getDate() + 1);
      withinDateRange = withinDateRange && entryDate < endDate;
    }
    
    return matchesCaregiverFilter && withinDateRange;
  });
};
