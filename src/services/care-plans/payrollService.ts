
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

// Sync a pending payroll entry with the current work log rates
// Called after saveRates() for immediate UI feedback (the DB trigger handles the actual sync)
export const syncPayrollEntryWithWorkLog = async (workLogId: string): Promise<boolean> => {
  try {
    // Fetch the work log's current rates and hours
    const { data: workLog, error: wlError } = await supabase
      .from('work_logs')
      .select('base_rate, rate_multiplier, rate_type')
      .eq('id', workLogId)
      .single();

    if (wlError) throw wlError;

    const effectiveRate = (workLog.base_rate || 25) * (workLog.rate_multiplier || 1);

    // Fetch and update any pending payroll entries linked to this work log
    const { data: entries, error: peError } = await supabase
      .from('payroll_entries')
      .select('id, hours_worked, expense_amount')
      .eq('work_log_id', workLogId)
      .eq('payment_status', 'pending');

    if (peError) throw peError;
    if (!entries || entries.length === 0) return true;

    for (const entry of entries) {
      const newGross = Math.round((entry.hours_worked || 0) * effectiveRate * 100) / 100;
      const newTotal = Math.round((newGross + (entry.expense_amount || 0)) * 100) / 100;

      const { error: updateError } = await supabase
        .from('payroll_entries')
        .update({
          regular_rate: effectiveRate,
          gross_pay: newGross,
          total_amount: newTotal,
          net_pay_after_nis: newTotal,
        })
        .eq('id', entry.id);

      if (updateError) throw updateError;
    }

    console.log(`Synced ${entries.length} pending payroll entries for work_log ${workLogId}`);
    return true;
  } catch (error) {
    console.error('Error syncing payroll entry with work log:', error);
    return false;
  }
};
