
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CareTeamMember {
  id: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id: string;
  role: 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other';
  status: 'invited' | 'active' | 'declined' | 'removed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const fetchCareTeamMembers = async (planId: string): Promise<CareTeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .select('*')
      .eq('care_plan_id', planId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(member => ({
      ...member,
      role: member.role as 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other',
      status: member.status as 'invited' | 'active' | 'declined' | 'removed',
    }));
  } catch (error) {
    console.error("Error fetching care team members:", error);
    toast.error("Failed to load care team members");
    return [];
  }
};

export const inviteCareTeamMember = async (
  member: Omit<CareTeamMember, 'id' | 'created_at' | 'updated_at'>
): Promise<CareTeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .insert(member)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Team member assigned successfully");
    
    return data ? {
      ...data,
      role: data.role as 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other',
      status: data.status as 'invited' | 'active' | 'declined' | 'removed',
    } : null;
  } catch (error) {
    console.error("Error assigning team member:", error);
    toast.error("Failed to assign team member");
    return null;
  }
};

export const updateCareTeamMember = async (
  memberId: string,
  updates: Partial<Omit<CareTeamMember, 'id' | 'care_plan_id' | 'family_id' | 'caregiver_id' | 'created_at' | 'updated_at'>>
): Promise<CareTeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Team member updated successfully");
    
    return data ? {
      ...data,
      role: data.role as 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other',
      status: data.status as 'invited' | 'active' | 'declined' | 'removed',
    } : null;
  } catch (error) {
    console.error("Error updating team member:", error);
    toast.error("Failed to update team member");
    return null;
  }
};

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
