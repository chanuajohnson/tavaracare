
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { WorkLog, WorkLogInput, RateType } from "../types/workLogTypes";
import type { CareShift } from "@/types/careTypes";
import { createWorkLog } from "./workLogCore";

interface CreateWorkLogOptions {
  rate_type?: RateType;
  base_rate?: number;
  rate_multiplier?: number;
}

const checkDuplicateWorkLog = async (
  careTeamMemberId: string,
  startTime: string,
  endTime: string,
  shiftId?: string
): Promise<boolean> => {
  try {
    const query = supabase
      .from('work_logs')
      .select('id')
      .eq('care_team_member_id', careTeamMemberId)
      .lte('start_time', endTime)
      .gte('end_time', startTime);

    if (shiftId) {
      query.eq('shift_id', shiftId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0;
  } catch (error) {
    console.error("Error checking for duplicate work logs:", error);
    return false;
  }
};

export const createWorkLogFromShift = async (
  shift: CareShift, 
  notes: string = '',
  options: CreateWorkLogOptions = {}
): Promise<{ success: boolean; workLog?: WorkLog; error?: string }> => {
  try {
    if (!shift.caregiverId) {
      return { success: false, error: "Shift has no assigned caregiver" };
    }

    const { data: teamMember, error: teamError } = await supabase
      .from('care_team_members')
      .select('id')
      .eq('care_plan_id', shift.carePlanId)
      .eq('caregiver_id', shift.caregiverId)
      .single();

    if (teamError) throw teamError;
    
    if (!teamMember) {
      return { success: false, error: "Caregiver is not a team member" };
    }

    const isDuplicate = await checkDuplicateWorkLog(
      teamMember.id,
      shift.startTime,
      shift.endTime,
      shift.id
    );

    if (isDuplicate) {
      toast.error("These hours have already been submitted for this shift");
      return { 
        success: false, 
        error: "A work log already exists for this shift and caregiver" 
      };
    }

    const workLogInput: WorkLogInput = {
      care_team_member_id: teamMember.id,
      care_plan_id: shift.carePlanId,
      shift_id: shift.id,
      start_time: shift.startTime,
      end_time: shift.endTime,
      notes,
      rate_type: options.rate_type,
      base_rate: options.base_rate,
      rate_multiplier: options.rate_multiplier
    };

    return await createWorkLog(workLogInput);
  } catch (error: any) {
    console.error("Error creating work log from shift:", error);
    toast.error("Failed to create work log");
    return { success: false, error: error.message };
  }
};
