
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
