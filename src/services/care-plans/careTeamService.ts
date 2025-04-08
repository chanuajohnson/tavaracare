
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Domain model for care team members (camelCase)
export interface CareTeamMember {
  id: string;
  carePlanId: string;
  familyId: string;
  caregiverId: string;
  role: 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other';
  status: 'invited' | 'active' | 'declined' | 'removed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Database model for care team members (snake_case)
interface DbCareTeamMember {
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

// Adapters for converting between domain and database models
const adaptCareTeamMemberFromDb = (dbMember: DbCareTeamMember): CareTeamMember => ({
  id: dbMember.id,
  carePlanId: dbMember.care_plan_id,
  familyId: dbMember.family_id,
  caregiverId: dbMember.caregiver_id,
  role: dbMember.role,
  status: dbMember.status,
  notes: dbMember.notes,
  createdAt: dbMember.created_at,
  updatedAt: dbMember.updated_at
});

const adaptCareTeamMemberToDb = (member: Partial<CareTeamMember>): Partial<DbCareTeamMember> => ({
  care_plan_id: member.carePlanId,
  family_id: member.familyId,
  caregiver_id: member.caregiverId,
  role: member.role,
  status: member.status,
  notes: member.notes
});

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

    return (data || []).map(member => adaptCareTeamMemberFromDb(member as DbCareTeamMember));
  } catch (error) {
    console.error("Error fetching care team members:", error);
    toast.error("Failed to load care team members");
    return [];
  }
};

export const inviteCareTeamMember = async (
  member: Omit<CareTeamMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CareTeamMember | null> => {
  try {
    const dbMember = adaptCareTeamMemberToDb(member);
    const { data, error } = await supabase
      .from('care_team_members')
      .insert(dbMember)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Team member assigned successfully");
    
    return data ? adaptCareTeamMemberFromDb(data as DbCareTeamMember) : null;
  } catch (error) {
    console.error("Error assigning team member:", error);
    toast.error("Failed to assign team member");
    return null;
  }
};

export const updateCareTeamMember = async (
  memberId: string,
  updates: Partial<Omit<CareTeamMember, 'id' | 'carePlanId' | 'familyId' | 'caregiverId' | 'createdAt' | 'updatedAt'>>
): Promise<CareTeamMember | null> => {
  try {
    const dbUpdates = adaptCareTeamMemberToDb(updates);
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
    
    return data ? adaptCareTeamMemberFromDb(data as DbCareTeamMember) : null;
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
