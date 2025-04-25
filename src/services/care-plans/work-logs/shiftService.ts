
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { WorkLog, WorkLogInput } from "../types/workLogTypes";
import type { CareShift } from "@/types/careTypes";
import { createWorkLog } from "./workLogCore";

export const createWorkLogFromShift = async (
  shift: CareShift, 
  notes: string = ''
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

    const workLogInput: WorkLogInput = {
      care_team_member_id: teamMember.id,
      care_plan_id: shift.carePlanId,
      shift_id: shift.id,
      start_time: shift.startTime,
      end_time: shift.endTime,
      notes
    };

    return await createWorkLog(workLogInput);
  } catch (error: any) {
    console.error("Error creating work log from shift:", error);
    toast.error("Failed to create work log");
    return { success: false, error: error.message };
  }
};
