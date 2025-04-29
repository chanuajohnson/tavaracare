import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CareTeamMember, CareTeamMemberWithProfile, CareTeamMemberDto, CareTeamMemberInput } from "@/types/careTypes";

// Adapters for converting between domain and database models
const adaptCareTeamMemberFromDb = (dbMember: CareTeamMemberDto): CareTeamMember => ({
  id: dbMember.id!,
  carePlanId: dbMember.care_plan_id,
  familyId: dbMember.family_id,
  caregiverId: dbMember.caregiver_id,
  role: dbMember.role || 'caregiver',
  status: dbMember.status || 'invited',
  notes: dbMember.notes,
  createdAt: dbMember.created_at || new Date().toISOString(),
  updatedAt: dbMember.updated_at || new Date().toISOString()
});

const adaptCareTeamMemberToDb = (member: Partial<CareTeamMember>): Partial<CareTeamMemberDto> => ({
  id: member.id,
  care_plan_id: member.carePlanId,
  family_id: member.familyId,
  caregiver_id: member.caregiverId,
  role: member.role,
  status: member.status,
  notes: member.notes
});

export const fetchCareTeamMembers = async (planId: string): Promise<CareTeamMemberWithProfile[]> => {
  try {
    // FIXED QUERY: Using proper column-specific join syntax to avoid ambiguity
    const { data, error } = await supabase
      .from('care_team_members')
      .select(`
        id, 
        care_plan_id, 
        family_id, 
        caregiver_id, 
        role, 
        status, 
        notes, 
        created_at, 
        updated_at,
        profiles:caregiver_id(
          full_name,
          professional_type,
          avatar_url
        )
      `)
      .eq('care_plan_id', planId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Supabase error fetching care team members:", error);
      throw error;
    }

    console.log("Raw care team members data:", data);

    return (data || []).map(member => {
      // Access the profiles object with proper type casting and default values
      const profileData = member.profiles || {
        full_name: 'Unknown Professional',
        professional_type: 'Care Professional',
        avatar_url: null
      };
      
      return {
        ...adaptCareTeamMemberFromDb(member as CareTeamMemberDto),
        professionalDetails: {
          full_name: (profileData as any).full_name || 'Unknown Professional',
          professional_type: (profileData as any).professional_type || 'Care Professional',
          avatar_url: (profileData as any).avatar_url || null
        }
      };
    });
  } catch (error) {
    console.error("Error fetching care team members:", error);
    toast.error("Failed to load care team members");
    return [];
  }
};

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
