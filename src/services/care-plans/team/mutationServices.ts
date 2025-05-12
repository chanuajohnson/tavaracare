
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { adaptCareTeamMemberFromDb, adaptCareTeamMemberToDb, CareTeamMember, CareTeamMemberDto, CareTeamMemberInput } from "./types";

/**
 * Invites/adds a new care team member to a care plan
 */
export const inviteCareTeamMember = async (
  member: CareTeamMemberInput
): Promise<CareTeamMember | null> => {
  try {
    // Convert from domain model input to database model
    const dbMember: CareTeamMemberDto = {
      care_plan_id: member.carePlanId,
      family_id: member.familyId,
      caregiver_id: member.caregiverId,
      role: member.role,
      status: member.status || 'invited',
      notes: member.notes
    };

    const { data, error } = await supabase
      .from('care_team_members')
      .insert([dbMember])
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Team member assigned successfully");
    
    return data ? adaptCareTeamMemberFromDb(data as CareTeamMemberDto) : null;
  } catch (error) {
    console.error("Error assigning team member:", error);
    toast.error("Failed to assign team member");
    return null;
  }
};

/**
 * Updates an existing care team member's information
 */
export const updateCareTeamMember = async (
  memberId: string,
  updates: Partial<Omit<CareTeamMemberInput, 'carePlanId' | 'familyId' | 'caregiverId'>>
): Promise<CareTeamMember | null> => {
  try {
    // Convert from domain model input to database model
    const dbUpdates: Partial<CareTeamMemberDto> = {
      role: updates.role,
      status: updates.status,
      notes: updates.notes
    };

    // Remove undefined properties
    Object.keys(dbUpdates).forEach(key => 
      dbUpdates[key as keyof Partial<CareTeamMemberDto>] === undefined && delete dbUpdates[key as keyof Partial<CareTeamMemberDto>]
    );

    const { data, error } = await supabase
      .from('care_team_members')
      .update(dbUpdates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Team member updated successfully");
    
    return data ? adaptCareTeamMemberFromDb(data as CareTeamMemberDto) : null;
  } catch (error) {
    console.error("Error updating team member:", error);
    toast.error("Failed to update team member");
    return null;
  }
};

/**
 * Removes a care team member from a care plan
 */
export const removeCareTeamMember = async (memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      throw error;
    }

    toast.success("Team member removed successfully");
    return true;
  } catch (error) {
    console.error("Error removing team member:", error);
    toast.error("Failed to remove team member");
    return false;
  }
};
