
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Get rates for a specific work log
export const getRatesForWorkLog = async (workLogId: string, careTeamMemberId: string) => {
  try {
    // First check if the work log has a saved rate type
    const { data: workLogData, error: workLogError } = await supabase
      .from('work_logs')
      .select('rate_type')
      .eq('id', workLogId)
      .single();

    if (workLogError && workLogError.code !== 'PGRST116') {
      throw workLogError;
    }

    // Get the care team member rates
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('care_team_members')
      .select('regular_rate, overtime_rate')
      .eq('id', careTeamMemberId)
      .single();

    if (teamMemberError) {
      throw teamMemberError;
    }

    // Calculate holiday rate as 1.5x regular rate if not specified
    const regularRate = Number(teamMember?.regular_rate) || 15;
    const overtimeRate = Number(teamMember?.overtime_rate) || regularRate * 1.5;
    const holidayRate = regularRate * 2; // Standard holiday rate

    return {
      rateType: workLogData?.rate_type || 'regular',
      regularRate,
      overtimeRate,
      holidayRate
    };
  } catch (error) {
    console.error('Error getting rates for work log:', error);
    toast.error('Failed to load pay rates');
    return {
      rateType: 'regular',
      regularRate: 15,
      overtimeRate: 22.5,
      holidayRate: 30
    };
  }
};

// Update the rate type for a work log
export const updateWorkLogRateType = async (
  workLogId: string,
  rateType: 'regular' | 'overtime' | 'holiday'
) => {
  try {
    const { error } = await supabase
      .from('work_logs')
      .update({ rate_type: rateType })
      .eq('id', workLogId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating work log rate type:', error);
    toast.error('Failed to update pay rate');
    return false;
  }
};
