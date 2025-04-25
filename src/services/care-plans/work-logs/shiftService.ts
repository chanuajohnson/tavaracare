
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { CareShift } from "@/types/careTypes";
import type { WorkLogInput } from "../types/workLogTypes";
import { createWorkLog } from "./workLogCore";

// Function to create a work log from a shift
export const createWorkLogFromShift = async (shift: CareShift, notes?: string) => {
  try {
    if (!shift.caregiverId) {
      toast.error("No caregiver assigned to this shift");
      return { success: false, error: "No caregiver assigned to this shift" };
    }
    
    // Find the care team member ID for this caregiver and care plan
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('care_team_members')
      .select('id')
      .eq('care_plan_id', shift.carePlanId)
      .eq('caregiver_id', shift.caregiverId)
      .single();
      
    if (teamMemberError || !teamMember) {
      console.error("Error finding care team member:", teamMemberError);
      toast.error("Caregiver is not a member of this care plan's team");
      return { success: false, error: "Caregiver is not a member of this care plan's team" };
    }
    
    // Create the work log
    const workLogInput: WorkLogInput = {
      care_team_member_id: teamMember.id,
      care_plan_id: shift.carePlanId,
      start_time: new Date(shift.startTime).toISOString(),
      end_time: new Date(shift.endTime).toISOString(),
      notes: notes,
      status: 'pending',
      shift_id: shift.id
    };
    
    return await createWorkLog(workLogInput);
    
  } catch (error: any) {
    console.error("Error creating work log from shift:", error);
    toast.error("Failed to create work log");
    return { success: false, error: error.message };
  }
};
